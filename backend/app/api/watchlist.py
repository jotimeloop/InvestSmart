from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.models.models import User, Watchlist
from app.api.auth import require_current_user
from app.services.financial_data import financial_service

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])

class WatchlistAddRequest(BaseModel):
    asset_type: str  # STOCK, MUTUAL_FUND, BOND
    symbol: str
    name: str
    exchange: Optional[str] = "NSE"
    sector: Optional[str] = None

@router.get("")
def get_watchlist(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(Watchlist).filter(Watchlist.user_id == current_user.id).all()
    results = []
    
    # If empty, add starter watchlist for seamless experience
    if not items:
        starter = [
            Watchlist(user_id=current_user.id, asset_type="STOCK", symbol="TCS.NS", name="Tata Consultancy Services", exchange="NSE", sector="IT"),
            Watchlist(user_id=current_user.id, asset_type="STOCK", symbol="INFY.NS", name="Infosys Ltd", exchange="NSE", sector="IT"),
            Watchlist(user_id=current_user.id, asset_type="MUTUAL_FUND", symbol="120716", name="UTI Nifty 50 Index Fund", exchange="AMFI", sector="Index"),
            Watchlist(user_id=current_user.id, asset_type="BOND", symbol="gsec-710-2034", name="7.10% GS 2034 Benchmark GOI Bond", exchange="RBI", sector="Sovereign")
        ]
        db.add_all(starter)
        db.commit()
        items = db.query(Watchlist).filter(Watchlist.user_id == current_user.id).all()

    for item in items:
        price = 0.0
        change_pct = 0.0
        if item.asset_type.upper() == "STOCK":
            s = financial_service.get_stock_detail(item.symbol)
            if s:
                price = s["price"]
                change_pct = s["change_pct"]
        elif item.asset_type.upper() == "MUTUAL_FUND":
            for f in financial_service.get_mutual_funds():
                if str(f["scheme_code"]) == item.symbol:
                    price = f["nav"]
                    change_pct = f["return_1y"]
        elif item.asset_type.upper() == "BOND":
            for b in financial_service.get_bonds():
                if b["id"] == item.symbol:
                    price = b["market_price"]
                    change_pct = b["ytm"]

        results.append({
            "id": item.id,
            "asset_type": item.asset_type,
            "symbol": item.symbol,
            "name": item.name,
            "exchange": item.exchange,
            "sector": item.sector,
            "price": price,
            "change_pct": change_pct,
            "added_at": item.added_at.isoformat()
        })
        
    return results

@router.post("")
def add_to_watchlist(
    req: WatchlistAddRequest,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.symbol == req.symbol
    ).first()
    if existing:
        return {"status": "exists", "message": "Asset already in your watchlist."}

    item = Watchlist(
        user_id=current_user.id,
        asset_type=req.asset_type.upper(),
        symbol=req.symbol,
        name=req.name,
        exchange=req.exchange or "NSE",
        sector=req.sector
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"status": "success", "id": item.id, "message": "Added to watchlist."}

@router.delete("/{watchlist_id}")
def remove_from_watchlist(
    watchlist_id: int,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Watchlist).filter(Watchlist.id == watchlist_id, Watchlist.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found.")
    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Removed from watchlist."}
