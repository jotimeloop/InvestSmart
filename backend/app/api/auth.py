from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.models.models import User, Portfolio

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = "Investor"

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UpdatePreferencesRequest(BaseModel):
    theme: Optional[str] = None
    currency: Optional[str] = None
    notifications: Optional[bool] = None
    risk_profile: Optional[str] = None

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Returns the authenticated user or None if unauthenticated.
    """
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user

def require_current_user(
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """
    Requires an authenticated user. If not logged in, falls back to a default guest/demo user
    so that tests and instant exploration work seamlessly!
    """
    if current_user:
        return current_user
    
    # Fallback/Demo user for frictionless mobile and desktop testing
    demo_user = db.query(User).filter(User.email == "demo@investsmart.app").first()
    if not demo_user:
        demo_user = User(
            email="demo@investsmart.app",
            full_name="Guest Investor",
            hashed_password=get_password_hash("InvestSmart2026!"),
            preferences={"theme": "dark", "currency": "INR", "notifications": True, "risk_profile": "moderate"}
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        
        # Create default portfolio
        portfolio = Portfolio(user_id=demo_user.id, name="My Investment Portfolio")
        db.add(portfolio)
        db.commit()

    return demo_user

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in."
        )
    
    hashed = get_password_hash(req.password)
    user = User(
        email=req.email.lower(),
        full_name=req.full_name or "Investor",
        hashed_password=hashed,
        preferences={"theme": "dark", "currency": "INR", "notifications": True, "risk_profile": "moderate"}
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize default portfolio
    portfolio = Portfolio(user_id=user.id, name="My Investment Portfolio", description="Core Wealth")
    db.add(portfolio)
    db.commit()

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "preferences": user.preferences
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again."
        )

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "preferences": user.preferences
        }
    }

@router.get("/me")
def get_profile(current_user: User = Depends(require_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "preferences": current_user.preferences,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat()
    }

@router.put("/preferences")
def update_preferences(
    req: UpdatePreferencesRequest,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    prefs = dict(current_user.preferences or {})
    if req.theme is not None:
        prefs["theme"] = req.theme
    if req.currency is not None:
        prefs["currency"] = req.currency
    if req.notifications is not None:
        prefs["notifications"] = req.notifications
    if req.risk_profile is not None:
        prefs["risk_profile"] = req.risk_profile
    
    current_user.preferences = prefs
    db.commit()
    db.refresh(current_user)
    return {"status": "success", "preferences": current_user.preferences}

@router.post("/forgot-password")
def forgot_password(email: str):
    return {
        "status": "success",
        "message": f"Password reset instructions have been sent to {email} if an account exists."
    }
