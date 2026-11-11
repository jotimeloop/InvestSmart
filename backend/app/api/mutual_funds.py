from fastapi import APIRouter, Query, HTTPException, Body
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.services.financial_data import financial_service

router = APIRouter(prefix="/funds", tags=["Mutual Funds"])

class FundCompareRequest(BaseModel):
    scheme_codes: List[int]

@router.get("")
def list_mutual_funds(
    category: Optional[str] = Query(None, description="Category filter: Flexi Cap, Small Cap, Large Cap, Debt, Index, Hybrid"),
    search: Optional[str] = Query(None, description="Search by fund name or AMC")
):
    """Returns top rated Indian mutual fund schemes with NAV, CAGR, and risk profiles."""
    return financial_service.get_mutual_funds(category=category, search=search)

@router.get("/{scheme_code}")
def get_mutual_fund(scheme_code: int):
    """Returns detailed information for a specific mutual fund scheme."""
    funds = financial_service.get_mutual_funds()
    for f in funds:
        if f["scheme_code"] == scheme_code:
            return f
    raise HTTPException(status_code=404, detail=f"Mutual fund scheme {scheme_code} not found.")

@router.post("/compare")
def compare_mutual_funds(req: FundCompareRequest):
    """Compare multiple mutual funds side-by-side."""
    all_funds = {f["scheme_code"]: f for f in financial_service.get_mutual_funds()}
    selected = [all_funds[code] for code in req.scheme_codes if code in all_funds]
    
    if not selected:
        raise HTTPException(status_code=400, detail="No matching mutual funds selected for comparison.")

    # Calculate comparative bests
    best_1y = max(selected, key=lambda x: x["return_1y"])["short_name"]
    best_3y = max(selected, key=lambda x: x["return_3y_cagr"])["short_name"]
    lowest_expense = min(selected, key=lambda x: x["expense_ratio"])["short_name"]

    return {
        "funds": selected,
        "summary": {
            "highest_1y_return": best_1y,
            "highest_3y_cagr": best_3y,
            "lowest_expense_ratio": lowest_expense
        }
    }
