from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class JournalEntryCreate(BaseModel):
    entry_date: date
    title: Optional[str] = None
    body: str = ""


class JournalEntryUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    entry_date: Optional[date] = None


class JournalEntryResponse(BaseModel):
    id: str
    user_id: str
    entry_date: date
    title: Optional[str]
    body: str
    created_at: datetime
    updated_at: datetime
    primary_sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None
    energy_level: Optional[str] = None
    key_themes: Optional[list[str]] = None
    one_line_summary: Optional[str] = None
    keywords: Optional[list[str]] = None
    analysis_status: Optional[str] = None
    analysed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JournalListResponse(BaseModel):
    items: list[JournalEntryResponse]
    total: int
    page: int
    has_next: bool
