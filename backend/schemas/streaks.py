from pydantic import BaseModel
from datetime import date
from typing import Optional


class StreakResponse(BaseModel):
    habit_id: str
    current_streak: int
    longest_streak: int
    total_completions: int
    last_completed_date: Optional[date]


class AllStreaksResponse(BaseModel):
    streaks: list[StreakResponse]


class DayHistory(BaseModel):
    date: date
    completion_count: int
    total_habits: int
    completion_percentage: float
    has_journal_entry: bool
    completed_habit_ids: list[str]
    mood_sentiment: Optional[str] = None
    mood_summary: Optional[str] = None


class HistoryResponse(BaseModel):
    days: list[DayHistory]
