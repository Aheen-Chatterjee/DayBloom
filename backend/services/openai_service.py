"""OpenAI GPT-4o service for journal entry mood analysis."""
import json
import logging
from typing import Optional
from openai import OpenAI
from config import settings

logger = logging.getLogger(__name__)

SENTIMENT_OPTIONS = "Joyful | Content | Neutral | Anxious | Stressed | Sad | Frustrated | Energised | Lethargic | Hopeful | Reflective"

ANALYSIS_SYSTEM_PROMPT = """You are an emotional intelligence analyst for a personal journaling app.
Analyse the journal entry and return ONLY a valid JSON object — no markdown, no explanation, no code fences."""

ANALYSIS_USER_TEMPLATE = """Analyse this journal entry written on {entry_date}.

Entry:
\"\"\"
{body}
\"\"\"

Return JSON with this exact shape:
{{
  "primary_sentiment": "one of: {sentiments}",
  "sentiment_score": <float between -1.0 (very negative) and 1.0 (very positive)>,
  "energy_level": "one of: High | Medium | Low",
  "key_themes": ["2 to 5 short theme phrases"],
  "one_line_summary": "A single sentence (max 15 words) capturing the emotional core of this entry.",
  "keywords": ["5 to 10 significant nouns and verbs from the text"]
}}"""


def get_openai_client() -> Optional[OpenAI]:
    if not settings.openai_api_key:
        logger.warning("OPENAI_API_KEY not set — analysis skipped")
        return None
    return OpenAI(api_key=settings.openai_api_key)


def analyse_journal_entry(entry_id: str, entry_date: str, body: str, db) -> None:
    """Analyse a journal entry and save results to DB. Runs as background task."""
    if len(body.strip()) < 20:
        db.table("journal_entries").update({
            "analysis_status": "skipped"
        }).eq("id", entry_id).execute()
        return

    client = get_openai_client()
    if not client:
        return

    # Mark as in-progress
    db.table("journal_entries").update({
        "analysis_status": "pending"
    }).eq("id", entry_id).execute()

    result = _call_openai(client, entry_date, body)
    if result is None:
        # Retry once
        result = _call_openai(client, entry_date, body)

    if result is None:
        db.table("journal_entries").update({
            "analysis_status": "failed"
        }).eq("id", entry_id).execute()
        logger.error(f"Analysis failed for entry {entry_id}")
        return

    from datetime import datetime, timezone
    db.table("journal_entries").update({
        "primary_sentiment": result.get("primary_sentiment"),
        "sentiment_score": result.get("sentiment_score"),
        "energy_level": result.get("energy_level"),
        "key_themes": result.get("key_themes", []),
        "one_line_summary": result.get("one_line_summary"),
        "keywords": result.get("keywords", []),
        "analysis_status": "done",
        "analysed_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", entry_id).execute()
    logger.info(f"Analysis complete for entry {entry_id}: {result.get('primary_sentiment')}")


def _call_openai(client: OpenAI, entry_date: str, body: str) -> Optional[dict]:
    """Call OpenAI API and parse JSON response."""
    try:
        user_msg = ANALYSIS_USER_TEMPLATE.format(
            entry_date=entry_date,
            body=body[:4000],  # Trim to avoid token limits
            sentiments=SENTIMENT_OPTIONS,
        )
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.3,
            max_tokens=400,
        )
        raw = response.choices[0].message.content.strip()
        # Strip code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except Exception as e:
        logger.error(f"OpenAI call failed: {e}")
        return None
