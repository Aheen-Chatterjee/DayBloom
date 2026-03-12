from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal


class HabitCreate(BaseModel):
    name: str
    description: Optional[str] = None
    emoticon: Optional[str] = None
    color: Optional[str] = "#8B7355"
    frequency: Literal["daily", "weekdays", "custom"] = "daily"


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    emoticon: Optional[str] = None
    color: Optional[str] = None
    frequency: Optional[Literal["daily", "weekdays", "custom"]] = None


class HabitResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str]
    emoticon: Optional[str]
    color: Optional[str]
    frequency: str
    created_at: datetime
    archived_at: Optional[datetime]

    class Config:
        from_attributes = True
