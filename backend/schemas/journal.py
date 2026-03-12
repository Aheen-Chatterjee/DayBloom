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

    class Config:
        from_attributes = True


class JournalListResponse(BaseModel):
    items: list[JournalEntryResponse]
    total: int
    page: int
    has_next: bool
