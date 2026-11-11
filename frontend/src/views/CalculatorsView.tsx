import React, { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  Building,
  Shield,
  Receipt,
  Layers,
  ArrowRight,
  Sparkles,
  Percent,
  Clock,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { InteractiveChart } from '../components/common/InteractiveChart';

export const CalculatorsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SIP' | 'LUMPSUM' | 'FD' | 'RD' | 'TAX' | 'COMPARE'>('SIP');

  // SIP States
  const [sipAmount, setSipAmount] = useState(10000);
  const [sipRate, setSipRate] = useState(12.5);
  const [sipYears, setSipYears] = useState(10);
  const [stepUpPct, setStepUpPct] = useState(10);
  const [sipResult, setSipResult] = useState<any>(null);

  // Lump Sum States
  const [lumpPrincipal, setLumpPrincipal] = useState(100000);
  const [lumpRate, setLumpRate] = useState(12.0);
  const [lumpYears, setLumpYears] = useState(5);
  const [lumpResult, setLumpResult] = useState<any>(null);

  // FD States
  const [fdPrincipal, setFdPrincipal] = useState(100000);
  const [fdRate, setFdRate] = useState(7.25);
  const [fdYears, setFdYears] = useState(3.0);
  const [fdSenior, setFdSenior] = useState(false);
  const [fdResult, setFdResult] = useState<any>(null);

  // Post-Tax States
  const [taxAsset, setTaxAsset] = useState('EQUITY');
  const [taxInvested, setTaxInvested] = useState(200000);
  const [taxProfit, setTaxProfit] = useState(150000);
  const [taxMonths, setTaxMonths] = useState(24);
  const [taxBracket, setTaxBracket] = useState(30);
  const [taxResult, setTaxResult] = useState<any>(null);

  // Asset Comparison States
  const [compareAmount, setCompareAmount] = useState(200000);
  const [compareYears, setCompareYears] = useState(5);
  const [compareTaxBracket, setCompareTaxBracket] = useState(30);
  const [compareResults, setCompareResults] = useState<any[] | null>(null);

  // Initial calculation on mount / trigger
  React.useEffect(() => {
    runSipCalc();
  }, [sipAmount, sipRate, sipYears, stepUpPct]);

  const runSipCalc = async () => {
    try {
      const res = await api.calculateSIP({
        monthly_investment: sipAmount,
        expected_annual_rate: sipRate,
        duration_years: sipYears,
        step_up_pct: stepUpPct,
      });
      setSipResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  const runLumpCalc = async () => {
    try {
      const res = await api.calculateLumpSum({
        principal: lumpPrincipal,
        expected_annual_rate: lumpRate,
        duration_years: lumpYears,
      });
      setLumpResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  const runFdCalc = async () => {
    try {
      const res = await api.calculateFD({
        principal: fdPrincipal,
        interest_rate: fdRate,
        duration_years: fdYears,
        is_senior_citizen: fdSenior,
      });
      setFdResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  const runTaxCalc = async () => {
    try {
      const res = await api.calculatePostTax({
        asset_class: taxAsset,
        invested_amount: taxInvested,
        profit_amount: taxProfit,
        holding_period_months: taxMonths,
        tax_bracket_pct: taxBracket,
      });
      setTaxResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  const runCompareCalc = async () => {
    try {
      const res = await api.compareAssets({
        investment_amount: compareAmount,
        duration_years: compareYears,
        tax_bracket_pct: compareTaxBracket,
      });
      setCompareResults(res);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Investment Calculators</h2>
        <p className="text-xs text-slate-400">Step-Up SIP · Post-Tax Return (Finance Act 2024) · Multi-Asset Comparison</p>
      </div>

      {/* Calculator Tab Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'SIP', label: 'SIP & Step-Up' },
          { id: 'LUMPSUM', label: 'Lump Sum' },
          { id: 'FD', label: 'Bank FD' },
          { id: 'TAX', label: 'Post-Tax Returns' },
          { id: 'COMPARE', label: 'Compare Assets' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === 'LUMPSUM' && !lumpResult) runLumpCalc();
              if (tab.id === 'FD' && !fdResult) runFdCalc();
              if (tab.id === 'TAX' && !taxResult) runTaxCalc();
              if (tab.id === 'COMPARE' && !compareResults) runCompareCalc();
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. SIP CALCULATOR */}
      {activeTab === 'SIP' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Inputs */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>SIP Parameters</span>
            </h3>

            {/* Monthly Investment */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Monthly Investment</span>
                <span className="font-bold text-white">₹{sipAmount.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="100000"
                step="500"
                value={sipAmount}
                onChange={(e) => setSipAmount(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Expected Annual Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Expected Annual Return</span>
                <span className="font-bold text-emerald-400">{sipRate}% p.a.</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="0.5"
                value={sipRate}
                onChange={(e) => setSipRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Duration Years */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Time Horizon</span>
                <span className="font-bold text-white">{sipYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={sipYears}
                onChange={(e) => setSipYears(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Step-Up SIP % */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Annual Step-Up (% increase/yr)</span>
                <span className="font-bold text-amber-400">+{stepUpPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={stepUpPct}
                onChange={(e) => setStepUpPct(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
              <p className="text-[10px] text-slate-500 italic">
                Step-up increases your monthly savings alongside annual salary hikes.
              </p>
            </div>
          </div>

          {/* Results Card */}
          {sipResult && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/20 rounded-3xl p-5 space-y-4 shadow-xl">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Projected Wealth Corpus
                </span>
                <div className="text-3xl font-black text-white mt-1">
                  ₹{sipResult.total_wealth.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Wealth Multiplier: <strong className="text-emerald-400">{sipResult.multiplier}x</strong> your money
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 text-xs">
                <div>
                  <div className="text-slate-400">Total Invested</div>
                  <div className="text-base font-bold text-slate-200 mt-0.5">
                    ₹{sipResult.total_invested.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Estimated Returns</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    +₹{sipResult.estimated_returns.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Trajectory chart */}
              <div className="space-y-1 pt-1">
                <div className="text-xs font-semibold text-slate-400">Wealth Growth Trajectory</div>
                <InteractiveChart
                  data={sipResult.yearly_breakdown.map((y: any) => y.wealth)}
                  labels={sipResult.yearly_breakdown.map((y: any) => `Year ${y.year}`)}
                  height={130}
                  isPositive={true}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. POST-TAX RETURN CALCULATOR */}
      {activeTab === 'TAX' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Tax Calculator (Budget 2024 / 2026)</span>
            </h3>

            {/* Asset Class */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Asset Class:</label>
              <select
                value={taxAsset}
                onChange={(e) => {
                  setTaxAsset(e.target.value);
                  setTimeout(runTaxCalc, 50);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="EQUITY">Equity Shares & Equity Mutual Funds</option>
                <option value="DEBT_MUTUAL_FUND">Debt Mutual Funds (Post April 2023)</option>
                <option value="BOND_TAXABLE">Taxable Corporate Bonds & G-Secs</option>
                <option value="BOND_TAXFREE">REC / PFC / NHAI Tax-Free Bonds</option>
                <option value="FD">Bank Fixed Deposits (FDs)</option>
              </select>
            </div>

            {/* Invested Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Invested Amount</span>
                <span className="font-bold text-white">₹{taxInvested.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="2000000"
                step="10000"
                value={taxInvested}
                onChange={(e) => {
                  setTaxInvested(parseInt(e.target.value));
                  setTimeout(runTaxCalc, 50);
                }}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Profit Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Capital Gain / Profit Amount</span>
                <span className="font-bold text-emerald-400">₹{taxProfit.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="1000000"
                step="5000"
                value={taxProfit}
                onChange={(e) => {
                  setTaxProfit(parseInt(e.target.value));
                  setTimeout(runTaxCalc, 50);
                }}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Holding Period */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Holding Period</span>
                <span className="font-bold text-white">{taxMonths} Months ({taxMonths > 12 ? 'LTCG' : 'STCG'})</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={taxMonths}
                onChange={(e) => {
                  setTaxMonths(parseInt(e.target.value));
                  setTimeout(runTaxCalc, 50);
                }}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Tax Bracket */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Your Income Tax Slab</span>
                <span className="font-bold text-amber-400">{taxBracket}%</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 10, 20, 30].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setTaxBracket(s);
                      setTimeout(runTaxCalc, 50);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold ${
                      taxBracket === s ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tax Result Presentation */}
          {taxResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Post-Tax In-Hand Returns
                </span>
                <div className="text-3xl font-black text-white mt-1">
                  ₹{taxResult.net_profit.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Net Post-Tax Return: <strong className="text-emerald-400">+{taxResult.post_tax_return_pct}%</strong> (Pre-Tax was +{taxResult.pre_tax_return_pct}%)
                </div>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Capital Gain:</span>
                  <span className="font-bold text-white">₹{taxResult.gross_profit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Annual Exemption Applied:</span>
                  <span className="font-bold text-emerald-400">-₹{taxResult.exemption_applied.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxable Profit Base:</span>
                  <span className="font-bold text-white">₹{taxResult.taxable_gain.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Effective Tax Rate:</span>
                  <span className="font-bold text-amber-400">{taxResult.effective_tax_rate_pct}%</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-700/80">
                  <span className="text-slate-300 font-bold">Total Income Tax Payable:</span>
                  <span className="font-bold text-rose-400">₹{taxResult.tax_payable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Legal explanation */}
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl text-[11px] text-slate-300">
                <span className="font-bold text-emerald-400">Official Provision: </span>
                {taxResult.tax_rule_explanation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. MULTI-ASSET COMPARISON TOOL */}
      {activeTab === 'COMPARE' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Side-by-Side Asset Growth Comparison</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Lump Sum Amount (₹):</label>
                <input
                  type="number"
                  value={compareAmount}
                  onChange={(e) => setCompareAmount(parseInt(e.target.value) || 10000)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Horizon (Years):</label>
                <input
                  type="number"
                  value={compareYears}
                  onChange={(e) => setCompareYears(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Your Tax Bracket (%):</label>
                <input
                  type="number"
                  value={compareTaxBracket}
                  onChange={(e) => setCompareTaxBracket(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={runCompareCalc}
              className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Re-Calculate Comparison
            </button>
          </div>

          {/* Comparison Cards / Table */}
          {compareResults && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {compareResults.map((item) => (
                <div
                  key={item.asset}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">{item.asset}</span>
                    <span className="text-xs font-black text-emerald-400">
                      +{item.effective_post_tax_cagr}% Post-Tax
                    </span>
                  </div>

                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Net Wealth:</span>
                      <span className="font-bold text-white">₹{item.net_maturity_value.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Net Profit:</span>
                      <span className="font-bold text-emerald-400">+₹{(item.net_maturity_value - item.invested).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Tax:</span>
                      <span className="font-bold text-rose-400">₹{item.estimated_tax.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>Risk: <strong className="text-slate-300">{item.risk_level}</strong></div>
                    <div>Liquidity: <strong className="text-slate-300">{item.liquidity}</strong></div>
                    <div>Tax Rule: <strong className="text-slate-300">{item.tax_treatment}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. FIXED DEPOSIT CALCULATOR */}
      {activeTab === 'FD' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Fixed Deposit (FD) Parameters</span>
            </h3>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Deposit Principal</span>
                <span className="font-bold text-white">₹{fdPrincipal.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="2000000"
                step="10000"
                value={fdPrincipal}
                onChange={(e) => {
                  setFdPrincipal(parseInt(e.target.value));
                  setTimeout(runFdCalc, 50);
                }}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Interest Rate (% p.a.)</span>
                <span className="font-bold text-emerald-400">{fdRate}%</span>
              </div>
              <input
                type="range"
                min="4"
                max="9.5"
                step="0.1"
                value={fdRate}
                onChange={(e) => {
                  setFdRate(parseFloat(e.target.value));
                  setTimeout(runFdCalc, 50);
                }}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Tenure (Years)</span>
                <span className="font-bold text-white">{fdYears} Years</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={fdYears}
                onChange={(e) => {
                  setFdYears(parseFloat(e.target.value));
                  setTimeout(runFdCalc, 50);
                }}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="senior-citizen"
                checked={fdSenior}
                onChange={(e) => {
                  setFdSenior(e.target.checked);
                  setTimeout(runFdCalc, 50);
                }}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <label htmlFor="senior-citizen" className="text-xs text-slate-300 font-semibold cursor-pointer">
                Senior Citizen (+0.50% extra interest)
              </label>
            </div>
          </div>

          {fdResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Maturity Amount
                </span>
                <div className="text-3xl font-black text-white mt-1">
                  ₹{fdResult.maturity_amount.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Effective Annual Compounded Yield: <strong className="text-emerald-400">{fdResult.effective_annual_yield}%</strong>
                </div>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Principal Deposit:</span>
                  <span className="font-bold text-white">₹{fdResult.total_invested.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Interest Earned:</span>
                  <span className="font-bold text-emerald-400">+₹{fdResult.interest_earned.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Compounding Frequency:</span>
                  <span className="font-bold text-slate-200">Quarterly (RBI Banking Norm)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
