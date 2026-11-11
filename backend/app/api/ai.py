from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from app.services.ai_engine import ai_assistant

router = APIRouter(prefix="/ai", tags=["AI Investment Assistant"])

class AIChatRequest(BaseModel):
    message: str = Field(description="User financial query or investment scenario")
    context: Optional[Dict[str, Any]] = None

@router.post("/chat")
def chat_with_advisor(req: AIChatRequest):
    """
    Intelligent AI financial analysis engine tailored for Indian retail investors,
    tax compliance, diversification, and wealth building.
    """
    response = ai_assistant.answer_query(req.message, req.context)
    return response

@router.get("/quick-prompts")
def get_quick_prompts() -> List[Dict[str, str]]:
    """Returns curated quick financial prompts."""
    return [
        {"id": "tax", "text": "How does the 12.5% LTCG tax rule affect my equity investments?", "icon": "Receipt"},
        {"id": "allocation", "text": "What is the ideal asset allocation for a 30-year-old in India?", "icon": "PieChart"},
        {"id": "bonds", "text": "Why are REC Tax-Free Bonds better than Bank FDs for the 30% slab?", "icon": "ShieldCheck"},
        {"id": "sip", "text": "How much difference does a 10% annual Step-Up SIP make over 15 years?", "icon": "TrendingUp"},
        {"id": "audit", "text": "Review my investment portfolio and suggest rebalancing steps.", "icon": "Sparkles"}
    ]

