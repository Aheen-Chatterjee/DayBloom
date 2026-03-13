from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class CompletionCreate(BaseModel):
    habit_id: str
    completion_date: date
    note: Optional[str] = None


class CompletionResponse(BaseModel):
    id: str
    habit_id: str
    user_id: str
    completion_date: date
    completed_at: datetime
    note: Optional[str]
    proof_image_url: Optional[str] = None
    proof_verdict: Optional[str] = None

    class Config:
        from_attributes = True
