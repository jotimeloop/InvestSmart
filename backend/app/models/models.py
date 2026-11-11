from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    preferences = Column(JSON, default=lambda: {
        "theme": "dark",
        "currency": "INR",
        "notifications": True,
        "risk_profile": "moderate"
    })

    portfolios = relationship("Portfolio", back_populates="owner", cascade="all, delete-orphan")
    holdings = relationship("Holding", back_populates="user", cascade="all, delete-orphan")
    watchlists = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    comparisons = relationship("SavedComparison", back_populates="user", cascade="all, delete-orphan")

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), default="Primary Portfolio")
    description = Column(String(255), default="My Core Investments")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="portfolios")
    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete-orphan")

class Holding(Base):
    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False, index=True)
    asset_type = Column(String(50), nullable=False)  # STOCK, MUTUAL_FUND, BOND, FD
    symbol = Column(String(50), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    exchange = Column(String(20), default="NSE")
    quantity = Column(Float, nullable=False, default=1.0)
    buy_price = Column(Float, nullable=False)
    buy_date = Column(String(20), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="holdings")
    portfolio = relationship("Portfolio", back_populates="holdings")

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    asset_type = Column(String(50), nullable=False)
    symbol = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    exchange = Column(String(20), default="NSE")
    sector = Column(String(100), nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="watchlists")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    symbol = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    asset_type = Column(String(50), default="STOCK")
    target_price = Column(Float, nullable=False)
    condition = Column(String(20), default="ABOVE")  # ABOVE, BELOW
    is_triggered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")

class SavedComparison(Base):
    __tablename__ = "saved_comparisons"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    comparison_type = Column(String(50), default="MIXED")  # STOCK_VS_MF, BOND_VS_FD, MULTI_FUND
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="comparisons")
