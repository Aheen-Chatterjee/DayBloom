from datetime import date, timedelta
import pytest
from services.streak_service import compute_streak


def d(offset: int) -> date:
    """Helper: today - offset days."""
    return date.today() - timedelta(days=offset)


def test_empty_returns_zeros():
    result = compute_streak([])
    assert result["current_streak"] == 0
    assert result["longest_streak"] == 0
    assert result["total_completions"] == 0
    assert result["last_completed_date"] is None


def test_single_today_gives_streak_1():
    result = compute_streak([d(0)])
    assert result["current_streak"] == 1
    assert result["longest_streak"] == 1


def test_single_yesterday_grace_period():
    """Grace period: no completion today but yesterday counts as streak=1."""
    result = compute_streak([d(1)])
    assert result["current_streak"] == 1


def test_gap_two_days_breaks_streak():
    """Two days ago but not yesterday breaks current streak."""
    result = compute_streak([d(2)])
    assert result["current_streak"] == 0


def test_consecutive_7_days():
    dates = [d(i) for i in range(7)]
    result = compute_streak(dates)
    assert result["current_streak"] == 7
    assert result["longest_streak"] == 7
    assert result["total_completions"] == 7


def test_gap_in_middle_resets_current():
    """Completion today + 4 days ago but gap in between."""
    dates = [d(0), d(1), d(2), d(4), d(5)]
    result = compute_streak(dates)
    assert result["current_streak"] == 3
    assert result["longest_streak"] == 3


def test_longest_streak_historical():
    """Historical streak longer than current."""
    # 10 days in a row 20 days ago, then only today
    historical = [d(i + 10) for i in range(10)]  # days 10-19 ago
    recent = [d(0)]
    result = compute_streak(historical + recent)
    assert result["longest_streak"] == 10
    assert result["current_streak"] == 1


def test_duplicates_handled():
    """Duplicate dates should not affect count."""
    dates = [d(0), d(0), d(1), d(1)]
    result = compute_streak(dates)
    assert result["current_streak"] == 2
    assert result["total_completions"] == 2


def test_total_completions():
    dates = [d(i) for i in range(5)]
    result = compute_streak(dates)
    assert result["total_completions"] == 5
