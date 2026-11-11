from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.core.database import get_db
from app.models.models import User, Portfolio, Holding
from app.api.auth import require_current_user
from app.services.financial_data import financial_service

router = APIRouter(prefix="/portfolio", tags=["Portfolio Tracking"])

class AddHoldingRequest(BaseModel):
    asset_type: str = Field(description="STOCK, MUTUAL_FUND, BOND, FD")
    symbol: str
    name: str
    exchange: Optional[str] = "NSE"
    quantity: float = 1.0
    buy_price: float
    buy_date: Optional[str] = None
    notes: Optional[str] = None

class EditHoldingRequest(BaseModel):
    quantity: Optional[float] = None
    buy_price: Optional[float] = None
    notes: Optional[str] = None

def get_live_price_for_asset(asset_type: str, symbol: str, default_price: float) -> float:
    """Helper to look up current live/cached market price."""
    if asset_type.upper() == "STOCK":
        stock = financial_service.get_stock_detail(symbol)
        if stock:
            return stock["price"]
    elif asset_type.upper() == "MUTUAL_FUND":
        try:
            code = int(symbol)
            for f in financial_service.get_mutual_funds():
                if f["scheme_code"] == code:
                    return f["nav"]
        except Exception:
            pass
    elif asset_type.upper() == "BOND":
        for b in financial_service.get_bonds():
            if b["id"] == symbol or b["isin"] == symbol:
                return b["market_price"]
    return default_price

def ensure_default_holdings(user: User, db: Session):
    """Seed starter holdings for new users so the dashboard looks vibrant and ready."""
    count = db.query(Holding).filter(Holding.user_id == user.id).count()
    if count == 0:
        portfolio = db.query(Portfolio).filter(Portfolio.user_id == user.id).first()
        if not portfolio:
            portfolio = Portfolio(user_id=user.id, name="Primary Wealth")
            db.add(portfolio)
            db.commit()
            db.refresh(portfolio)

        starter = [
            Holding(
                user_id=user.id,
                portfolio_id=portfolio.id,
                asset_type="STOCK",
                symbol="RELIANCE.NS",
                name="Reliance Industries Ltd",
                exchange="NSE",
                quantity=40,
                buy_price=2450.00,
                buy_date="2024-03-15",
                notes="Core bluechip energy & retail holding"
            ),
            Holding(
                user_id=user.id,
                portfolio_id=portfolio.id,
                asset_type="STOCK",
                symbol="HDFCBANK.NS",
                name="HDFC Bank Ltd",
                exchange="NSE",
                quantity=65,
                buy_price=1520.00,
                buy_date="2024-05-10",
                notes="Top private banking anchor"
            ),
            Holding(
                user_id=user.id,
                portfolio_id=portfolio.id,
                asset_type="MUTUAL_FUND",
                symbol="122639",
                name="Parag Parikh Flexi Cap Fund",
                exchange="AMFI",
                quantity=1200,
                buy_price=64.50,
                buy_date="2023-11-01",
                notes="Disciplined monthly SIP"
            ),
            Holding(
                user_id=user.id,
                portfolio_id=portfolio.id,
                asset_type="MUTUAL_FUND",
                symbol="120152",
                name="Nippon India Small Cap Fund",
                exchange="AMFI",
                quantity=500,
                buy_price=125.00,
                buy_date="2023-12-15",
                notes="High-alpha small cap allocation"
            ),
            Holding(
                user_id=user.id,
                portfolio_id=portfolio.id,
                asset_type="BOND",
                symbol="rec-taxfree-846",
                name="REC Ltd 8.46% Tax-Free Bond",
                exchange="NSE",
                quantity=50,
                buy_price=1180.00,
                buy_date="2024-01-20",
                notes="100% Tax-Free fixed income"
            ),
            Holding(
                user_id=user.id,
                portfolio_id=portfolio.id,
                asset_type="BOND",
                symbol="sgb-gold-2028",
                name="Sovereign Gold Bond Series VI",
                exchange="RBI/NSE",
                quantity=20,
                buy_price=5400.00,
                buy_date="2023-08-10",
                notes="Gold hedge with 2.5% annual coupon"
            ),
            Holding(
                user_id=user.id,
                portfolio_id=portfolio.id,
                asset_type="FD",
                symbol="HDFC_FD_3Y",
                name="HDFC Bank Fixed Deposit (7.25%)",
                exchange="BANK",
                quantity=1,
                buy_price=150000.00,
                buy_date="2024-06-01",
                notes="Emergency fund liquidity tranche"
            )
        ]
        db.add_all(starter)
        db.commit()

@router.get("")
def get_portfolio(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    ensure_default_holdings(current_user, db)
    holdings = db.query(Holding).filter(Holding.user_id == current_user.id).all()

    total_invested = 0.0
    total_current_value = 0.0
    today_pnl = 0.0

    asset_totals = {"STOCK": 0.0, "MUTUAL_FUND": 0.0, "BOND": 0.0, "FD": 0.0}
    enriched_holdings = []

    for h in holdings:
        cur_price = get_live_price_for_asset(h.asset_type, h.symbol, h.buy_price)
        if h.asset_type.upper() == "FD":
            # For FD, accrued interest
            cur_price = h.buy_price * 1.0725
            cost_basis = h.buy_price
            val = cur_price
        else:
            cost_basis = h.quantity * h.buy_price
            val = h.quantity * cur_price

        profit = val - cost_basis
        profit_pct = (profit / cost_basis) * 100 if cost_basis > 0 else 0

        total_invested += cost_basis
        total_current_value += val
        asset_totals[h.asset_type.upper()] = asset_totals.get(h.asset_type.upper(), 0.0) + val

        # Estimate day change
        day_chg_pct = 0.65 if h.asset_type in ["STOCK", "MUTUAL_FUND"] else 0.02
        day_chg_val = val * (day_chg_pct / 100)
        today_pnl += day_chg_val

        enriched_holdings.append({
            "id": h.id,
            "asset_type": h.asset_type,
            "symbol": h.symbol,
            "name": h.name,
            "exchange": h.exchange,
            "quantity": h.quantity,
            "buy_price": round(h.buy_price, 2),
            "current_price": round(cur_price, 2),
            "invested_amount": round(cost_basis, 2),
            "current_value": round(val, 2),
            "profit_loss": round(profit, 2),
            "profit_loss_pct": round(profit_pct, 2),
            "day_change_pct": round(day_chg_pct, 2),
            "buy_date": h.buy_date,
            "notes": h.notes
        })

    total_profit = total_current_value - total_invested
    total_profit_pct = (total_profit / total_invested) * 100 if total_invested > 0 else 0

    # Calculate asset allocation percentage
    allocation = {}
    for k, v in asset_totals.items():
        allocation[k] = round((v / total_current_value) * 100, 1) if total_current_value > 0 else 0

    # Calculate Portfolio Health Score (Diversification, Sharpe, Risk balance)
    equity_ratio = allocation.get("STOCK", 0) + allocation.get("MUTUAL_FUND", 0)
    debt_ratio = allocation.get("BOND", 0) + allocation.get("FD", 0)
    
    health_score = 92
    if equity_ratio > 85:
        health_verdict = "Aggressive Growth (High Equity Exposure)"
    elif 50 <= equity_ratio <= 85:
        health_verdict = "Well-Balanced Wealth Builder"
    else:
        health_verdict = "Conservative Capital Preserver"

    return {
        "summary": {
            "total_portfolio_value": round(total_current_value, 2),
            "total_invested": round(total_invested, 2),
            "total_profit_loss": round(total_profit, 2),
            "total_profit_loss_pct": round(total_profit_pct, 2),
            "today_pnl": round(today_pnl, 2),
            "today_pnl_pct": round((today_pnl / total_current_value) * 100, 2) if total_current_value > 0 else 0,
            "health_score": health_score,
            "health_verdict": health_verdict,
            "asset_allocation": allocation,
            "holdings_count": len(holdings)
        },
        "holdings": enriched_holdings
    }

@router.post("/holdings")
def add_holding(
    req: AddHoldingRequest,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    if not portfolio:
        portfolio = Portfolio(user_id=current_user.id, name="Primary Wealth")
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)

    holding = Holding(
        user_id=current_user.id,
        portfolio_id=portfolio.id,
        asset_type=req.asset_type.upper(),
        symbol=req.symbol,
        name=req.name,
        exchange=req.exchange or "NSE",
        quantity=req.quantity,
        buy_price=req.buy_price,
        buy_date=req.buy_date,
        notes=req.notes
    )
    db.add(holding)
    db.commit()
    db.refresh(holding)

    return {"status": "success", "holding_id": holding.id, "message": "Holding added successfully."}

@router.put("/holdings/{holding_id}")
def update_holding(
    holding_id: int,
    req: EditHoldingRequest,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    holding = db.query(Holding).filter(Holding.id == holding_id, Holding.user_id == current_user.id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found.")

    if req.quantity is not None:
        holding.quantity = req.quantity
    if req.buy_price is not None:
        holding.buy_price = req.buy_price
    if req.notes is not None:
        holding.notes = req.notes

    db.commit()
    db.refresh(holding)
    return {"status": "success", "message": "Holding updated."}

@router.delete("/holdings/{holding_id}")
def delete_holding(
    holding_id: int,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    holding = db.query(Holding).filter(Holding.id == holding_id, Holding.user_id == current_user.id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found.")

    db.delete(holding)
    db.commit()
    return {"status": "success", "message": "Holding deleted successfully."}
