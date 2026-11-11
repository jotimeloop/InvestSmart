from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from app.services.financial_data import financial_service

router = APIRouter(prefix="/stocks", tags=["Stocks & Indian Market"])

@router.get("/indices")
def get_indices():
    """Returns live/snapshot Indian Market benchmark indices (NIFTY 50, SENSEX, BANK NIFTY, NIFTY IT)."""
    return financial_service.get_market_indices()

@router.get("")
def list_stocks(
    sector: Optional[str] = Query(None, description="Filter by sector e.g. Banking, IT, FMCG"),
    search: Optional[str] = Query(None, description="Search by stock symbol or company name"),
    sort_by: Optional[str] = Query("market_cap", description="Sort by market_cap, price, change_pct, pe")
):
    """Screener for top Indian NSE/BSE stocks with live metrics."""
    stocks = financial_service.get_all_stocks(sector=sector, search=search)
    
    if sort_by == "change_pct":
        stocks.sort(key=lambda x: x["change_pct"], reverse=True)
    elif sort_by == "price":
        stocks.sort(key=lambda x: x["price"], reverse=True)
    elif sort_by == "pe":
        stocks.sort(key=lambda x: x["pe"])
    else:
        stocks.sort(key=lambda x: x["market_cap_cr"], reverse=True)
        
    return stocks

@router.get("/{symbol}")
def get_stock(symbol: str):
    """Returns detailed technical and fundamental analysis for a stock."""
    stock = financial_service.get_stock_detail(symbol)
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock symbol '{symbol}' not found in Indian market database.")
    return stock

