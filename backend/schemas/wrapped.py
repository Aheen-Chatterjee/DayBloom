from pydantic import BaseModel
from datetime import date
from typing import Optional, Any


class WordCloudWord(BaseModel):
    text: str
    value: int
    sentiment: Optional[str] = None


class WrappedTheme(BaseModel):
    theme: str
    count: int


class WrappedStats(BaseModel):
    entries_written: int
    positive_days: int
    top_habit_name: Optional[str] = None
    top_habit_streak: int
    avg_energy: str


class WrappedCorrelation(BaseModel):
    habit_name: str
    avg_sentiment_completed: float
    avg_sentiment_skipped: float
    correlation_delta: float


class WrappedReport(BaseModel):
    id: str
    period: str
    start_date: date
    end_date: date
    dominant_sentiment: Optional[str] = None
    dominant_sentiment_count: int
    total_days_journaled: int
    sentiment_timeline: list[dict]
    word_cloud_words: list[WordCloudWord]
    top_themes: list[WrappedTheme]
    habit_correlations: list[WrappedCorrelation]
    narrative: str
    stats: WrappedStats
    created_at: str


class GenerateWrappedRequest(BaseModel):
    period: str  # 'week' | 'month'
    start_date: date
