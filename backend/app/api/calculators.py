from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from app.services.ai_engine import calc_service

router = APIRouter(prefix="/calculators", tags=["Financial Calculators"])

class SIPCalcRequest(BaseModel):
    monthly_investment: float = Field(default=10000.0, ge=100)
    expected_annual_rate: float = Field(default=12.5, ge=1.0, le=40.0)
    duration_years: int = Field(default=10, ge=1, le=40)
    step_up_pct: Optional[float] = Field(default=0.0, ge=0.0, le=50.0)

class LumpSumCalcRequest(BaseModel):
    principal: float = Field(default=100000.0, ge=1000)
    expected_annual_rate: float = Field(default=12.0, ge=1.0, le=40.0)
    duration_years: int = Field(default=5, ge=1, le=40)

class FDCalcRequest(BaseModel):
    principal: float = Field(default=100000.0, ge=1000)
    interest_rate: float = Field(default=7.25, ge=1.0, le=15.0)
    duration_years: float = Field(default=3.0, ge=0.25, le=15.0)
    compounding_frequency: str = Field(default="quarterly")
    is_senior_citizen: bool = Field(default=False)

class RDCalcRequest(BaseModel):
    monthly_deposit: float = Field(default=5000.0, ge=500)
    interest_rate: float = Field(default=7.0, ge=1.0, le=15.0)
    tenure_months: int = Field(default=36, ge=6, le=120)

class PostTaxCalcRequest(BaseModel):
    asset_class: str = Field(default="EQUITY", description="EQUITY, DEBT_MUTUAL_FUND, BOND_TAXABLE, BOND_TAXFREE, FD")
    invested_amount: float = Field(default=200000.0, ge=1000)
    profit_amount: float = Field(default=150000.0, ge=0)
    holding_period_months: int = Field(default=24, ge=1)
    tax_bracket_pct: float = Field(default=30.0, ge=0.0, le=42.7)

class CompareAssetsRequest(BaseModel):
    investment_amount: float = Field(default=200000.0, ge=5000)
    duration_years: int = Field(default=5, ge=1, le=30)
    tax_bracket_pct: float = Field(default=30.0, ge=0.0, le=42.7)

@router.post("/sip")
def calculate_sip(req: SIPCalcRequest):
    """Calculates SIP wealth, total invested, estimated returns, and step-up impact."""
    return calc_service.calculate_sip(
        monthly_investment=req.monthly_investment,
        annual_rate=req.expected_annual_rate,
        years=req.duration_years,
        step_up_pct=req.step_up_pct or 0.0
    )

@router.post("/lumpsum")
def calculate_lump_sum(req: LumpSumCalcRequest):
    """Calculates Lump Sum compound interest and multi-year trajectory."""
    return calc_service.calculate_lump_sum(
        principal=req.principal,
        annual_rate=req.expected_annual_rate,
        years=req.duration_years
    )

@router.post("/fd")
def calculate_fd(req: FDCalcRequest):
    """Calculates Fixed Deposit maturity amount and effective annual yield."""
    return calc_service.calculate_fd(
        principal=req.principal,
        annual_rate=req.interest_rate,
        years=req.duration_years,
        compounding_frequency=req.compounding_frequency,
        is_senior_citizen=req.is_senior_citizen
    )

@router.post("/rd")
def calculate_rd(req: RDCalcRequest):
    """Calculates Recurring Deposit maturity according to RBI norms."""
    return calc_service.calculate_rd(
        monthly_deposit=req.monthly_deposit,
        annual_rate=req.interest_rate,
        tenure_months=req.tenure_months
    )

@router.post("/post-tax")
def calculate_post_tax(req: PostTaxCalcRequest):
    """Calculates net post-tax returns under Indian Finance Act 2024 taxation laws."""
    return calc_service.calculate_post_tax_returns(
        asset_class=req.asset_class,
        invested_amount=req.invested_amount,
        profit_amount=req.profit_amount,
        holding_period_months=req.holding_period_months,
        tax_bracket_pct=req.tax_bracket_pct
    )

@router.post("/compare-assets")
def compare_assets(req: CompareAssetsRequest):
    """Multi-asset side-by-side comparison across Stock, Equity MF, Tax-Free Bond, G-Sec, and FD."""
    return calc_service.compare_asset_classes(
        amount=req.investment_amount,
        years=req.duration_years,
        tax_slab_pct=req.tax_bracket_pct
    )

