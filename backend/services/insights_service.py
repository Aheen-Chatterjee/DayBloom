"""Aggregate mood/insights data for the insights dashboard."""
from datetime import date, timedelta
from collections import Counter, defaultdict
from typing import Optional
from database import get_db


def get_mood_timeline(user_id: str, days: int = 14) -> list[dict]:
    """Return daily mood timeline for last N days."""
    db = get_db()
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)

    resp = (
        db.table("journal_entries")
        .select("entry_date, primary_sentiment, sentiment_score, energy_level, one_line_summary, analysis_status")
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
        .eq("analysis_status", "done")
        .gte("entry_date", start_date.isoformat())
        .lte("entry_date", end_date.isoformat())
        .order("entry_date", desc=False)
        .execute()
    )

    return resp.data or []


def get_insights_summary(user_id: str, days: int = 14) -> dict:
    """Aggregate sentiment/themes/energy for last N days."""
    db = get_db()
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)

    resp = (
        db.table("journal_entries")
        .select("entry_date, primary_sentiment, sentiment_score, energy_level, key_themes, one_line_summary")
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
        .eq("analysis_status", "done")
        .gte("entry_date", start_date.isoformat())
        .lte("entry_date", end_date.isoformat())
        .execute()
    )

    entries = resp.data or []
    if not entries:
        return {
            "period_days": days,
            "entries_analysed": 0,
            "sentiment_distribution": {},
            "avg_sentiment_score": 0.0,
            "dominant_sentiment": None,
            "top_themes": [],
            "energy_distribution": {},
            "mood_timeline": [],
        }

    sentiment_counts = Counter()
    energy_counts = Counter()
    theme_counts = Counter()
    scores = []
    timeline = []

    for e in entries:
        if e.get("primary_sentiment"):
            sentiment_counts[e["primary_sentiment"]] += 1
        if e.get("energy_level"):
            energy_counts[e["energy_level"]] += 1
        if e.get("key_themes"):
            for t in e["key_themes"]:
                theme_counts[t] += 1
        if e.get("sentiment_score") is not None:
            scores.append(e["sentiment_score"])
        timeline.append({
            "date": str(e["entry_date"]),
            "primary_sentiment": e.get("primary_sentiment"),
            "sentiment_score": e.get("sentiment_score"),
            "energy_level": e.get("energy_level"),
            "one_line_summary": e.get("one_line_summary"),
        })

    dominant = sentiment_counts.most_common(1)[0][0] if sentiment_counts else None
    top_themes = [{"theme": t, "count": c} for t, c in theme_counts.most_common(8)]

    return {
        "period_days": days,
        "entries_analysed": len(entries),
        "sentiment_distribution": dict(sentiment_counts),
        "avg_sentiment_score": sum(scores) / len(scores) if scores else 0.0,
        "dominant_sentiment": dominant,
        "top_themes": top_themes,
        "energy_distribution": dict(energy_counts),
        "mood_timeline": timeline,
    }


def get_habit_correlations(user_id: str) -> list[dict]:
    """Compute correlation between habit completion and mood score."""
    db = get_db()

    # Get all journal entries with sentiment scores
    journal_resp = (
        db.table("journal_entries")
        .select("entry_date, sentiment_score")
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
        .eq("analysis_status", "done")
        .execute()
    )
    entries = journal_resp.data or []
    if not entries:
        return []

    # Build date -> sentiment_score map
    date_to_score = {str(e["entry_date"]): e["sentiment_score"] for e in entries if e.get("sentiment_score") is not None}
    all_dated_dates = set(date_to_score.keys())

    # Get all active habits
    habits_resp = db.table("habits").select("id, name").eq("user_id", user_id).is_("archived_at", "null").execute()
    habits = habits_resp.data or []

    # Get all completions
    completions_resp = (
        db.table("habit_completions")
        .select("habit_id, completion_date")
        .eq("user_id", user_id)
        .execute()
    )
    completions = completions_resp.data or []

    # Map habit_id -> set of completed dates
    habit_completed_dates = defaultdict(set)
    for c in completions:
        habit_completed_dates[c["habit_id"]].add(str(c["completion_date"]))

    correlations = []
    for habit in habits:
        hid = habit["id"]
        completed_dates = habit_completed_dates[hid] & all_dated_dates
        skipped_dates = all_dated_dates - completed_dates

        if len(completed_dates) < 3 or len(skipped_dates) < 3:
            continue

        avg_completed = sum(date_to_score[d] for d in completed_dates) / len(completed_dates)
        avg_skipped = sum(date_to_score[d] for d in skipped_dates) / len(skipped_dates)
        delta = avg_completed - avg_skipped

        correlations.append({
            "habit_id": hid,
            "habit_name": habit["name"],
            "avg_sentiment_completed": round(avg_completed, 3),
            "avg_sentiment_skipped": round(avg_skipped, 3),
            "correlation_delta": round(delta, 3),
            "completed_count": len(completed_dates),
            "skipped_count": len(skipped_dates),
        })

    # Sort by absolute delta descending
    correlations.sort(key=lambda x: abs(x["correlation_delta"]), reverse=True)
    return correlations
