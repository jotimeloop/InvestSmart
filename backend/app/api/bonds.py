from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel, Field
from app.services.financial_data import financial_service

router = APIRouter(prefix="/bonds", tags=["Government & Corporate Bonds"])

class BestBondFinderRequest(BaseModel):
    investment_amount: float = Field(default=100000.0, description="Amount to invest in INR")
    horizon_years: float = Field(default=3.0, description="Investment horizon in years")
    tax_bracket_pct: float = Field(default=30.0, description="Marginal income tax bracket (e.g. 10, 20, 30)")
    risk_tolerance: str = Field(default="moderate", description="low, moderate, high")

@router.get("")
def list_bonds(
    issuer_type: Optional[str] = Query(None, description="Sovereign, PSU, Corporate, NBFC"),
    search: Optional[str] = Query(None, description="Search by bond name or rating")
):
    """List Indian Sovereign, PSU, and Corporate Bonds with YTM and credit ratings."""
    return financial_service.get_bonds(issuer_type=issuer_type, search=search)

@router.get("/{bond_id}")
def get_bond(bond_id: str):
    """Get complete details for a specific bond."""
    bonds = financial_service.get_bonds()
    for b in bonds:
        if b["id"] == bond_id or b["isin"] == bond_id:
            return b
    raise HTTPException(status_code=404, detail=f"Bond '{bond_id}' not found.")

@router.post("/best-finder")
def find_best_bonds(req: BestBondFinderRequest):
    """
    AI-Powered Best Bond Finder:
    Matches bonds to your investment horizon, calculates exact post-tax returns
    based on your tax bracket, and generates customized recommendations.
    """
    ranked_bonds = financial_service.get_best_bonds_for_user(
        horizon_years=req.horizon_years,
        tax_bracket_pct=req.tax_bracket_pct,
        risk_tolerance=req.risk_tolerance
    )

    top_pick = ranked_bonds[0] if ranked_bonds else None

    return {
        "user_profile": {
            "investment_amount": req.investment_amount,
            "horizon_years": req.horizon_years,
            "tax_bracket_pct": req.tax_bracket_pct,
            "risk_tolerance": req.risk_tolerance
        },
        "top_recommendation": top_pick,
        "recommendations": ranked_bonds[:5]
    }
