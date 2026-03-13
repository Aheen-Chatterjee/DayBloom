"""Generate DayBloom Wrapped reports."""
import json
import logging
from datetime import date, timedelta
from collections import Counter
from typing import Optional
from database import get_db
from services.openai_service import get_openai_client
from services.insights_service import get_habit_correlations

logger = logging.getLogger(__name__)


def _get_week_range(start_date: date):
    return start_date, start_date + timedelta(days=6)


def _get_month_range(start_date: date):
    if start_date.month == 12:
        end_date = date(start_date.year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(start_date.year, start_date.month + 1, 1) - timedelta(days=1)
    return start_date, end_date


def _generate_narrative(client, period: str, dominant_sentiment: Optional[str],
                         top_themes: list, avg_score: float, entries_count: int) -> str:
    """Call GPT-4o to write a warm narrative paragraph."""
    if not client:
        return f"You journaled {entries_count} times this {period}. Your dominant mood was {dominant_sentiment or 'mixed'}."

    themes_str = ", ".join([t["theme"] for t in top_themes[:3]]) if top_themes else "various topics"
    try:
        prompt = f"""Write a warm, empathetic 3-sentence paragraph in second person about someone's {period}.
They journaled {entries_count} times. Their dominant mood was {dominant_sentiment or 'varied'}.
Their main themes were: {themes_str}.
Their average sentiment score was {avg_score:.2f} (scale: -1 very negative to 1 very positive).
Write as if addressing them directly. Be specific, warm, and encouraging. No generic platitudes."""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a warm, insightful personal journaling coach writing a brief reflection for a user."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=200,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Narrative generation failed: {e}")
        return f"You journaled {entries_count} times this {period}, exploring themes of {themes_str}."


def generate_wrapped(user_id: str, period: str, start_date: date) -> dict:
    """Build the full wrapped report data."""
    db = get_db()

    if period == "week":
        start_date, end_date = _get_week_range(start_date)
    else:
        start_date, end_date = _get_month_range(start_date)

    # Fetch journal entries for period
    journal_resp = (
        db.table("journal_entries")
        .select("entry_date, primary_sentiment, sentiment_score, energy_level, key_themes, keywords, one_line_summary")
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
        .gte("entry_date", start_date.isoformat())
        .lte("entry_date", end_date.isoformat())
        .order("entry_date")
        .execute()
    )
    entries = journal_resp.data or []
    analysed = [e for e in entries if e.get("analysis_status") == "done" or e.get("primary_sentiment")]

    # Sentiment timeline
    sentiment_timeline = [
        {
            "date": str(e["entry_date"]),
            "primary_sentiment": e.get("primary_sentiment"),
            "sentiment_score": e.get("sentiment_score"),
            "energy_level": e.get("energy_level"),
            "one_line_summary": e.get("one_line_summary"),
        }
        for e in entries
    ]

    # Dominant sentiment
    sentiment_counts = Counter(e["primary_sentiment"] for e in analysed if e.get("primary_sentiment"))
    dominant_sentiment = sentiment_counts.most_common(1)[0][0] if sentiment_counts else None
    dominant_count = sentiment_counts.most_common(1)[0][1] if sentiment_counts else 0

    # Word cloud
    keyword_sentiment = {}
    keyword_counts = Counter()
    for e in analysed:
        if e.get("keywords"):
            sent = e.get("primary_sentiment", "Neutral")
            for kw in e["keywords"]:
                kw = kw.lower().strip()
                if kw:
                    keyword_counts[kw] += 1
                    keyword_sentiment[kw] = sent  # last occurrence wins
    word_cloud = [
        {"text": kw, "value": count, "sentiment": keyword_sentiment.get(kw)}
        for kw, count in keyword_counts.most_common(40)
    ]

    # Top themes
    theme_counts = Counter()
    for e in analysed:
        if e.get("key_themes"):
            for t in e["key_themes"]:
                theme_counts[t] += 1
    top_themes = [{"theme": t, "count": c} for t, c in theme_counts.most_common(5)]

    # Avg sentiment
    scores = [e["sentiment_score"] for e in analysed if e.get("sentiment_score") is not None]
    avg_score = sum(scores) / len(scores) if scores else 0.0

    # Energy
    energy_counts = Counter(e["energy_level"] for e in analysed if e.get("energy_level"))
    avg_energy = energy_counts.most_common(1)[0][0] if energy_counts else "Medium"

    # Positive days
    positive_days = sum(1 for s in scores if s > 0.2)

    # Habit correlations (top 2)
    correlations = get_habit_correlations(user_id)
    habit_correlations = [
        {
            "habit_name": c["habit_name"],
            "avg_sentiment_completed": c["avg_sentiment_completed"],
            "avg_sentiment_skipped": c["avg_sentiment_skipped"],
            "correlation_delta": c["correlation_delta"],
        }
        for c in correlations[:2]
    ]

    # Top streak habit
    streaks_resp = (
        db.table("habit_completions")
        .select("habit_id, completion_date")
        .eq("user_id", user_id)
        .execute()
    )
    # Get habit names
    habits_resp = db.table("habits").select("id, name").eq("user_id", user_id).execute()
    habit_names = {h["id"]: h["name"] for h in (habits_resp.data or [])}

    top_habit_name = None
    top_habit_streak = 0
    if habits_resp.data:
        from services.streak_service import compute_streak
        from collections import defaultdict
        date_by_habit = defaultdict(list)
        for c in (streaks_resp.data or []):
            from datetime import date as date_type
            try:
                d = date_type.fromisoformat(str(c["completion_date"]))
                date_by_habit[c["habit_id"]].append(d)
            except Exception:
                pass
        for hid, dates in date_by_habit.items():
            result = compute_streak(dates)
            if result["current_streak"] > top_habit_streak:
                top_habit_streak = result["current_streak"]
                top_habit_name = habit_names.get(hid)

    # Generate narrative via GPT
    client = get_openai_client()
    narrative = _generate_narrative(client, period, dominant_sentiment, top_themes, avg_score, len(entries))

    return {
        "period": period,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "dominant_sentiment": dominant_sentiment,
        "dominant_sentiment_count": dominant_count,
        "total_days_journaled": len(entries),
        "sentiment_timeline": sentiment_timeline,
        "word_cloud_words": word_cloud,
        "top_themes": top_themes,
        "habit_correlations": habit_correlations,
        "narrative": narrative,
        "stats": {
            "entries_written": len(entries),
            "positive_days": positive_days,
            "top_habit_name": top_habit_name,
            "top_habit_streak": top_habit_streak,
            "avg_energy": avg_energy,
        },
    }
