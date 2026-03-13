from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class MoodTimelinePoint(BaseModel):
    date: date
    primary_sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None
    energy_level: Optional[str] = None
    one_line_summary: Optional[str] = None


class ThemeCount(BaseModel):
    theme: str
    count: int


class InsightsSummary(BaseModel):
    period_days: int
    entries_analysed: int
    sentiment_distribution: dict[str, int]
    avg_sentiment_score: float
    dominant_sentiment: Optional[str] = None
    top_themes: list[ThemeCount]
    energy_distribution: dict[str, int]
    mood_timeline: list[MoodTimelinePoint]


class HabitCorrelation(BaseModel):
    habit_id: str
    habit_name: str
    avg_sentiment_completed: float
    avg_sentiment_skipped: float
    correlation_delta: float
    completed_count: int
    skipped_count: int
