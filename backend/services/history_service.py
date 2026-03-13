from datetime import date
from database import get_db


def get_history(user_id: str, from_date: date, to_date: date) -> list[dict]:
    """Aggregate habit completions and journal entries by date for a date range."""
    db = get_db()

    # Get all active habits for user
    habits_resp = (
        db.table("habits")
        .select("id")
        .eq("user_id", user_id)
        .is_("archived_at", "null")
        .execute()
    )
    habit_ids = [h["id"] for h in habits_resp.data]
    total_habits = len(habit_ids)

    # Get all completions in range
    completions_resp = (
        db.table("habit_completions")
        .select("habit_id, completion_date")
        .eq("user_id", user_id)
        .gte("completion_date", from_date.isoformat())
        .lte("completion_date", to_date.isoformat())
        .execute()
    )

    # Get journal entries in range (not soft-deleted) — include mood fields
    journal_resp = (
        db.table("journal_entries")
        .select("entry_date, primary_sentiment, one_line_summary")
        .eq("user_id", user_id)
        .gte("entry_date", from_date.isoformat())
        .lte("entry_date", to_date.isoformat())
        .is_("deleted_at", "null")
        .execute()
    )
    journal_dates = {row["entry_date"] for row in journal_resp.data}
    journal_mood = {
        row["entry_date"]: {
            "mood_sentiment": row.get("primary_sentiment"),
            "mood_summary": row.get("one_line_summary"),
        }
        for row in journal_resp.data
    }

    # Group completions by date
    completions_by_date: dict[str, list[str]] = {}
    for c in completions_resp.data:
        d = c["completion_date"]
        completions_by_date.setdefault(d, []).append(c["habit_id"])

    # Build day-by-day result
    result = []
    current = from_date
    from datetime import timedelta

    while current <= to_date:
        date_str = current.isoformat()
        completed_ids = completions_by_date.get(date_str, [])
        completion_count = len(completed_ids)
        percentage = (completion_count / total_habits * 100) if total_habits > 0 else 0.0

        mood_data = journal_mood.get(date_str, {})
        result.append({
            "date": current,
            "completion_count": completion_count,
            "total_habits": total_habits,
            "completion_percentage": round(percentage, 1),
            "has_journal_entry": date_str in journal_dates,
            "completed_habit_ids": completed_ids,
            "mood_sentiment": mood_data.get("mood_sentiment"),
            "mood_summary": mood_data.get("mood_summary"),
        })
        current += timedelta(days=1)

    return result
