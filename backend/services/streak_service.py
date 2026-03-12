from datetime import date, timedelta
from typing import Optional


def compute_streak(completion_dates: list[date]) -> dict:
    """
    Pure function - no I/O.

    Args:
        completion_dates: List of dates when habit was completed (any order)

    Returns:
        dict with current_streak, longest_streak, total_completions, last_completed_date
    """
    if not completion_dates:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "total_completions": 0,
            "last_completed_date": None,
        }

    unique_dates = sorted(set(completion_dates))
    total_completions = len(unique_dates)
    last_completed_date = unique_dates[-1]

    # --- Longest streak (walk forward) ---
    longest_streak = 1
    running_streak = 1
    for i in range(1, len(unique_dates)):
        gap = (unique_dates[i] - unique_dates[i - 1]).days
        if gap == 1:
            running_streak += 1
            longest_streak = max(longest_streak, running_streak)
        else:
            running_streak = 1

    # --- Current streak (walk backward from today, with grace period) ---
    today = date.today()
    current_streak = 0

    # Grace period: if no completion today, start counting from yesterday
    if today in unique_dates:
        check_date = today
    elif (today - timedelta(days=1)) in unique_dates:
        check_date = today - timedelta(days=1)
    else:
        # No recent completion, streak is 0
        return {
            "current_streak": 0,
            "longest_streak": longest_streak,
            "total_completions": total_completions,
            "last_completed_date": last_completed_date,
        }

    date_set = set(unique_dates)
    while check_date in date_set:
        current_streak += 1
        check_date -= timedelta(days=1)

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_completions": total_completions,
        "last_completed_date": last_completed_date,
    }
