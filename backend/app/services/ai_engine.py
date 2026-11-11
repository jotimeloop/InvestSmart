import math
from typing import Dict, Any, List, Optional

class FinancialCalculatorService:
    @staticmethod
    def calculate_sip(
        monthly_investment: float,
        annual_rate: float,
        years: int,
        step_up_pct: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculates SIP returns with optional annual Step-Up SIP percentage.
        """
        monthly_rate = (annual_rate / 100) / 12
        months = years * 12
        
        total_invested = 0.0
        future_value = 0.0
        yearly_breakdown = []
        
        current_monthly = monthly_investment
        for y in range(1, years + 1):
            year_invested = 0.0
            for _ in range(12):
                total_invested += current_monthly
                year_invested += current_monthly
                future_value = (future_value + current_monthly) * (1 + monthly_rate)
            
            yearly_breakdown.append({
                "year": y,
                "invested": round(total_invested, 2),
                "wealth": round(future_value, 2),
                "returns": round(future_value - total_invested, 2)
            })
            
            # Step up monthly amount for next year
            if step_up_pct > 0:
                current_monthly += current_monthly * (step_up_pct / 100)

        total_returns = future_value - total_invested
        return {
            "type": "SIP",
            "monthly_investment": monthly_investment,
            "step_up_pct": step_up_pct,
            "duration_years": years,
            "expected_annual_rate": annual_rate,
            "total_invested": round(total_invested, 2),
            "estimated_returns": round(total_returns, 2),
            "total_wealth": round(future_value, 2),
            "multiplier": round(future_value / total_invested, 2) if total_invested > 0 else 1.0,
            "yearly_breakdown": yearly_breakdown
        }

    @staticmethod
    def calculate_lump_sum(
        principal: float,
        annual_rate: float,
        years: int
    ) -> Dict[str, Any]:
        """Calculates Compound Interest for Lump Sum investments."""
        r = annual_rate / 100
        future_value = principal * ((1 + r) ** years)
        total_returns = future_value - principal
        
        yearly_breakdown = []
        curr = principal
        for y in range(1, years + 1):
            curr = principal * ((1 + r) ** y)
            yearly_breakdown.append({
                "year": y,
                "invested": round(principal, 2),
                "wealth": round(curr, 2),
                "returns": round(curr - principal, 2)
            })

        return {
            "type": "LUMPSUM",
            "principal": principal,
            "expected_annual_rate": annual_rate,
            "duration_years": years,
            "total_invested": round(principal, 2),
            "estimated_returns": round(total_returns, 2),
            "total_wealth": round(future_value, 2),
            "multiplier": round(future_value / principal, 2) if principal > 0 else 1.0,
            "yearly_breakdown": yearly_breakdown
        }

    @staticmethod
    def calculate_fd(
        principal: float,
        annual_rate: float,
        years: float,
        compounding_frequency: str = "quarterly",
        is_senior_citizen: bool = False
    ) -> Dict[str, Any]:
        """
        Calculates Fixed Deposit maturity amount and interest according to standard Indian bank norms.
        Quarterly compounding frequency is standard in Indian banks.
        """
        effective_rate = annual_rate + (0.50 if is_senior_citizen else 0.0)
        n = 4 if compounding_frequency == "quarterly" else (12 if compounding_frequency == "monthly" else 1)
        r = effective_rate / 100
        
        maturity_amount = principal * ((1 + (r / n)) ** (n * years))
        interest_earned = maturity_amount - principal
        
        return {
            "type": "FD",
            "principal": principal,
            "interest_rate": effective_rate,
            "duration_years": years,
            "is_senior_citizen": is_senior_citizen,
            "total_invested": round(principal, 2),
            "interest_earned": round(interest_earned, 2),
            "maturity_amount": round(maturity_amount, 2),
            "effective_annual_yield": round((((1 + (r / n)) ** n) - 1) * 100, 2)
        }

    @staticmethod
    def calculate_rd(
        monthly_deposit: float,
        annual_rate: float,
        tenure_months: int
    ) -> Dict[str, Any]:
        """
        Calculates Recurring Deposit maturity using RBI standard formula with quarterly compounding.
        """
        i = (annual_rate / 100) / 4  # quarterly rate
        quarters = tenure_months / 3
        total_invested = monthly_deposit * tenure_months
        
        # Exact RBI compounding formula for monthly deposits
        maturity_amount = 0.0
        for m in range(tenure_months):
            remaining_months = tenure_months - m
            maturity_amount += monthly_deposit * ((1 + i) ** (remaining_months / 3))
            
        interest_earned = maturity_amount - total_invested
        return {
            "type": "RD",
            "monthly_deposit": monthly_deposit,
            "interest_rate": annual_rate,
            "tenure_months": tenure_months,
            "total_invested": round(total_invested, 2),
            "interest_earned": round(interest_earned, 2),
            "maturity_amount": round(maturity_amount, 2)
        }

    @staticmethod
    def calculate_post_tax_returns(
        asset_class: str,  # "EQUITY", "DEBT_MUTUAL_FUND", "BOND_TAXABLE", "BOND_TAXFREE", "FD"
        invested_amount: float,
        profit_amount: float,
        holding_period_months: int,
        tax_bracket_pct: float
    ) -> Dict[str, Any]:
        """
        Calculates Indian Post-Tax Returns reflecting Finance Act 2024 revisions:
        - Equity LTCG (>12M): 12.5% on gains exceeding ₹1.25 Lakh.
        - Equity STCG (<=12M): 20%.
        - Debt MF & Taxable Bonds: Taxed at slab rate.
        - Tax-Free Bonds & SGB: 0% capital gains tax.
        - FDs: Taxed at slab rate.
        """
        tax_rate_applied = 0.0
        taxable_gain = profit_amount
        tax_payable = 0.0
        exemption_applied = 0.0
        tax_rule_explanation = ""

        if asset_class.upper() == "EQUITY":
            if holding_period_months > 12:
                # LTCG
                tax_rate_applied = 12.5
                exemption_limit = 125000.0  # ₹1.25 Lakh exemption limit
                if profit_amount > exemption_limit:
                    taxable_gain = profit_amount - exemption_limit
                    exemption_applied = exemption_limit
                    tax_payable = taxable_gain * (12.5 / 100)
                else:
                    taxable_gain = 0.0
                    exemption_applied = profit_amount
                    tax_payable = 0.0
                tax_rule_explanation = "Equity LTCG: First ₹1.25L is 100% Tax-Exempt. Balance taxed at 12.5% (Finance Act 2024)."
            else:
                # STCG
                tax_rate_applied = 20.0
                taxable_gain = profit_amount
                tax_payable = profit_amount * (20.0 / 100)
                tax_rule_explanation = "Equity STCG: Taxed flat at 20.0% for holding under 12 months."

        elif asset_class.upper() in ["DEBT_MUTUAL_FUND", "BOND_TAXABLE", "FD"]:
            tax_rate_applied = tax_bracket_pct
            taxable_gain = profit_amount
            tax_payable = profit_amount * (tax_bracket_pct / 100)
            tax_rule_explanation = f"Added to total income and taxed at your marginal slab rate of {tax_bracket_pct:.0f}%."

        elif asset_class.upper() in ["BOND_TAXFREE", "SGB"]:
            tax_rate_applied = 0.0
            taxable_gain = 0.0
            tax_payable = 0.0
            tax_rule_explanation = "100% Tax-Exempt under Section 10(15)(iv)(h) / Sovereign Gold Bond maturity exemption."

        net_profit = profit_amount - tax_payable
        pre_tax_return_pct = (profit_amount / invested_amount) * 100 if invested_amount > 0 else 0
        post_tax_return_pct = (net_profit / invested_amount) * 100 if invested_amount > 0 else 0

        return {
            "asset_class": asset_class,
            "invested_amount": round(invested_amount, 2),
            "gross_profit": round(profit_amount, 2),
            "pre_tax_return_pct": round(pre_tax_return_pct, 2),
            "taxable_gain": round(taxable_gain, 2),
            "exemption_applied": round(exemption_applied, 2),
            "effective_tax_rate_pct": round(tax_rate_applied, 2),
            "tax_payable": round(tax_payable, 2),
            "net_profit": round(net_profit, 2),
            "post_tax_return_pct": round(post_tax_return_pct, 2),
            "tax_rule_explanation": tax_rule_explanation
        }

    @staticmethod
    def compare_asset_classes(amount: float, years: int, tax_slab_pct: float) -> List[Dict[str, Any]]:
        """
        Side-by-side comparison across Stock, Equity Mutual Fund, AAA Corporate Bond, G-Sec, and Bank FD.
        """
        comparison_matrix = [
            {
                "asset": "Nifty 50 Index / Equity",
                "expected_cagr": 13.5,
                "risk_level": "Moderate to High",
                "liquidity": "T+1 Settlement (High)",
                "lock_in": "None",
                "tax_treatment": "12.5% LTCG above ₹1.25L",
                "volatility": "High (Market-linked)"
            },
            {
                "asset": "Flexi Cap Mutual Fund",
                "expected_cagr": 15.0,
                "risk_level": "High",
                "liquidity": "T+2 Redemption",
                "lock_in": "None (Exit load < 1Y)",
                "tax_treatment": "12.5% LTCG above ₹1.25L",
                "volatility": "High (Managed actively)"
            },
            {
                "asset": "REC Tax-Free PSU Bond",
                "expected_cagr": 7.8,  # Pre-tax equivalent for 30% slab
                "risk_level": "Extremely Low",
                "liquidity": "Moderate (NSE/BSE)",
                "lock_in": "Tradeable on exchanges",
                "tax_treatment": "100% Tax-Free (Sec 10)",
                "volatility": "Low"
            },
            {
                "asset": "10-Year GOI G-Sec Bond",
                "expected_cagr": 7.10,
                "risk_level": "Zero Default Risk (Sovereign)",
                "liquidity": "High on CCIL/RBI Retail",
                "lock_in": "Tradeable",
                "tax_treatment": f"Slab rate ({tax_slab_pct:.0f}%)",
                "volatility": "Low"
            },
            {
                "asset": "Bank Fixed Deposit (FD)",
                "expected_cagr": 7.00,
                "risk_level": "DICGC Insured up to ₹5L",
                "liquidity": "Premature break penalty",
                "lock_in": "Tenure chosen",
                "tax_treatment": f"Slab rate ({tax_slab_pct:.0f}%)",
                "volatility": "None (Guaranteed)"
            }
        ]

        results = []
        for item in comparison_matrix:
            cagr = item["expected_cagr"] / 100
            future_value = amount * ((1 + cagr) ** years)
            profit = future_value - amount
            
            # Estimate tax
            if "Tax-Free" in item["tax_treatment"]:
                tax = 0.0
            elif "LTCG" in item["tax_treatment"]:
                taxable = max(0.0, profit - 125000)
                tax = taxable * 0.125
            else:
                tax = profit * (tax_slab_pct / 100)

            net_profit = profit - tax
            net_wealth = amount + net_profit
            net_cagr = (((net_wealth / amount) ** (1 / years)) - 1) * 100 if years > 0 else 0

            results.append({
                **item,
                "invested": amount,
                "maturity_gross": round(future_value, 2),
                "gross_profit": round(profit, 2),
                "estimated_tax": round(tax, 2),
                "net_maturity_value": round(net_wealth, 2),
                "effective_post_tax_cagr": round(net_cagr, 2)
            })

        return results

class AIAssistantService:
    @staticmethod
    def answer_query(query: str, portfolio_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        AI investment query reasoning engine providing contextual recommendations,
        tax advice, and portfolio optimization tips.
        """
        q = query.lower()
        
        # 1. Tax query
        if "tax" in q or "ltcg" in q or "budget" in q or "stcg" in q:
            return {
                "category": "Taxation & Compliance",
                "title": "Indian Investment Taxation (Budget 2024/2026 Guidelines)",
                "content": (
                    "**Key Takeaways for Your Investments:**\n\n"
                    "1. **Equity & Equity Mutual Funds (LTCG):** Holding period > 12 months. Tax rate is **12.5%** on gains exceeding **₹1,25,000 per financial year**. The first ₹1.25L of profit is completely tax-free!\n\n"
                    "2. **Equity STCG (Short-Term):** Holding period <= 12 months. Taxed at flat **20.0%**.\n\n"
                    "3. **Debt Mutual Funds & Bonds:** Gains and interest income are added to your gross total income and taxed at your **individual income tax slab rate**.\n\n"
                    "4. **Tax-Free PSU Bonds (REC, PFC, NHAI):** 100% exempt from income tax under Section 10(15)(iv)(h). For anyone in the 30% tax bracket, a 5.5% tax-free coupon equals an ~7.85% pre-tax bank FD yield!\n\n"
                    "5. **Sovereign Gold Bonds (SGB):** Capital gains on redemption at maturity (8 years) are completely tax-free under Section 47."
                ),
                "suggested_actions": ["Run Post-Tax Return Calculator", "Explore Tax-Free Bonds", "Check SIP LTCG Harvest"]
            }

        # 2. Portfolio Health or Audit query
        if "portfolio" in q or "audit" in q or "health" in q or "review" in q:
            return {
                "category": "Portfolio Strategy",
                "title": "AI Portfolio Health Diagnosis & Asset Allocation",
                "content": (
                    "**Recommended 2026 Asset Allocation Strategy:**\n\n"
                    "• **Core Wealth Builder (60%):** Large-Cap & Flexi-Cap Mutual Funds (e.g., Parag Parikh Flexi Cap, Nifty 50 Index). This provides compounding with reduced drawdown risk.\n"
                    "• **Growth Booster (20%):** High-conviction Large/Mid-Cap Stocks with ROCE > 18% and reasonable PE multiples (e.g., TCS, HDFC Bank, Bharti Airtel).\n"
                    "• **Safety & Cash Flow Shield (15%):** Sovereign G-Secs or AAA PSU Bonds (7.10% GOI 2034, REC Tax-Free). Ensures predictable liquidity and mitigates market corrections.\n"
                    "• **Hedge (5%):** Sovereign Gold Bonds (SGB) as a hedge against currency depreciation and geopolitical volatility.\n\n"
                    "💡 *Pro-tip: Rebalance your portfolio once every 6 months to maintain your target equity/debt ratio without triggering excess short-term capital gains.*"
                ),
                "suggested_actions": ["View My Portfolio", "Add New Asset", "Run Asset Comparison"]
            }

        # 3. Bond query
        if "bond" in q or "g-sec" in q or "rec" in q or "fd" in q:
            return {
                "category": "Fixed Income & Bonds",
                "title": "Optimal Bond Selection for Fixed Income Investors",
                "content": (
                    "**Bonds vs Bank Fixed Deposits:**\n\n"
                    "• **If you are in the 30% or 35% tax bracket:** Tax-Free PSU Bonds (REC, NHAI) easily beat Bank FDs. While a 7% bank FD leaves you with just 4.9% in hand after 30% tax, a 5.5% tax-free bond delivers the entire 5.5% net return!\n"
                    "• **For Maximum Safety:** 10-Year GOI 7.10% GS 2034 offers zero default risk, backed directly by the Government of India, with semi-annual payouts.\n"
                    "• **For High Yield:** Corporate AAA & AA+ Bonds (Tata Motors, Shriram Finance) offer 8.5% - 9.1% yields, ideal for retirees seeking monthly or quarterly cash flow."
                ),
                "suggested_actions": ["Launch Best Bond Finder", "Compare Bond vs FD", "Calculate Bond YTM"]
            }

        # 4. SIP vs Lump Sum query
        if "sip" in q or "lump sum" in q or "monthly" in q:
            return {
                "category": "Investment Method",
                "title": "SIP vs Lump Sum: Which is Better in 2026?",
                "content": (
                    "**Why SIP Triumphs in Volatile Indian Markets:**\n\n"
                    "1. **Rupee Cost Averaging:** When markets dip, your fixed monthly SIP buys more units automatically. When markets rise, your existing units gain in value.\n"
                    "2. **Eliminates Market Timing:** Over any 5+ year holding period in Nifty 50 history, disciplined SIP has never yielded negative returns.\n"
                    "3. **Power of Step-Up SIP:** Increasing your SIP by just 10% every year almost doubles your final wealth corpus over a 15-year horizon!\n\n"
                    "**When to do Lump Sum?** Deploy lump sums primarily during significant market corrections (5-10% drawdowns), or park in liquid debt funds and use an STP (Systematic Transfer Plan) into equity funds."
                ),
                "suggested_actions": ["Try Step-Up SIP Calculator", "Compare 10Y Return", "View Top Mutual Funds"]
            }

        # Default intelligent response
        return {
            "category": "Financial Advisory",
            "title": "InvestSmart AI Financial Guidance",
            "content": (
                f"You asked: **'{query}'**\n\n"
                "Here is InvestSmart's data-driven framework:\n\n"
                "• **Diversification:** Never allocate more than 10-15% of your total net worth to a single stock.\n"
                "• **Tax Efficiency:** Utilize the annual ₹1.25 Lakh LTCG exemption threshold strategically by tax-gain harvesting before March 31.\n"
                "• **Emergency Fund:** Ensure 6 to 12 months of living expenses are parked safely in high-yield Savings accounts, Short-term FDs, or Liquid Funds before committing to high-equity investments.\n"
                "• **Risk-Adjusted Return:** Use the Sharpe and Sortino ratios to compare mutual funds, rather than looking at 1-year past returns alone."
            ),
            "suggested_actions": ["Explore Stock Screener", "Calculate SIP Wealth", "AI Bond Finder"]
        }

calc_service = FinancialCalculatorService()
ai_assistant = AIAssistantService()
