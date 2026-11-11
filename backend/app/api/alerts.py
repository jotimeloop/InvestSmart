from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.models.models import User, Alert
from app.api.auth import require_current_user

router = APIRouter(prefix="/alerts", tags=["Notifications & Alerts"])

class CreateAlertRequest(BaseModel):
    symbol: str
    name: str
    target_price: float
    condition: str = "ABOVE"  # ABOVE, BELOW
    asset_type: Optional[str] = "STOCK"

@router.get("")
def list_alerts(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    alerts = db.query(Alert).filter(Alert.user_id == current_user.id).all()
    
    # If no alerts, create starter alerts
    if not alerts:
        starter = [
            Alert(user_id=current_user.id, symbol="RELIANCE.NS", name="Reliance Industries Ltd", target_price=2850.0, condition="ABOVE", asset_type="STOCK"),
            Alert(user_id=current_user.id, symbol="HDFCBANK.NS", name="HDFC Bank Ltd", target_price=1750.0, condition="ABOVE", asset_type="STOCK")
        ]
        db.add_all(starter)
        db.commit()
        alerts = db.query(Alert).filter(Alert.user_id == current_user.id).all()

    # Also build a notifications feed
    notifications = [
        {"id": "notif-1", "title": "Portfolio Milestone", "message": "Your portfolio returns crossed +18.4% this year!", "time": "2 hours ago", "type": "success"},
        {"id": "notif-2", "title": "Coupon Reminder", "message": "Semi-annual interest payout for REC Tax-Free Bond is due next month.", "time": "1 day ago", "type": "info"},
        {"id": "notif-3", "title": "Market Alert", "message": "NIFTY 50 crossed 24,100 with positive institutional inflows.", "time": "2 days ago", "type": "neutral"}
    ]

    return {
        "alerts": [
            {
                "id": a.id,
                "symbol": a.symbol,
                "name": a.name,
                "target_price": a.target_price,
                "condition": a.condition,
                "is_triggered": a.is_triggered,
                "created_at": a.created_at.isoformat()
            } for a in alerts
        ],
        "notifications": notifications
    }

@router.post("")
def create_alert(
    req: CreateAlertRequest,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    alert = Alert(
        user_id=current_user.id,
        symbol=req.symbol,
        name=req.name,
        target_price=req.target_price,
        condition=req.condition.upper(),
        asset_type=req.asset_type or "STOCK"
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {"status": "success", "alert_id": alert.id, "message": "Alert set successfully."}

@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    db.delete(alert)
    db.commit()
    return {"status": "success", "message": "Alert deleted."}
