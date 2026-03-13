"""
Batch-analyse all existing journal entries that haven't been analysed yet.

Usage:
    cd backend
    python ../scripts/analyse_existing_entries.py

Requires backend/.env with SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API
"""

import os
import sys
import json
import time
import logging

# Add backend to path so we can reuse config + openai_service
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

from supabase import create_client
from openai import OpenAI

logging.basicConfig(level=logging.INFO, format='%(levelname)s  %(message)s')
log = logging.getLogger(__name__)

SUPABASE_URL = os.environ['SUPABASE_URL']
SUPABASE_SERVICE_KEY = os.environ['SUPABASE_SERVICE_KEY']
OPENAI_API_KEY = os.environ['OPENAI_API']

sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
client = OpenAI(api_key=OPENAI_API_KEY)

SENTIMENT_OPTIONS = "Joyful | Content | Neutral | Anxious | Stressed | Sad | Frustrated | Energised | Lethargic | Hopeful | Reflective"

SYSTEM_PROMPT = """You are an emotional intelligence analyst for a personal journaling app.
Analyse the journal entry and return ONLY a valid JSON object — no markdown, no explanation, no code fences."""

USER_TEMPLATE = """Analyse this journal entry written on {entry_date}.

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


def call_gpt(entry_date: str, body: str) -> dict | None:
    for attempt in range(2):
        try:
            resp = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": USER_TEMPLATE.format(
                        entry_date=entry_date,
                        body=body[:4000],
                        sentiments=SENTIMENT_OPTIONS,
                    )},
                ],
                temperature=0.3,
                max_tokens=400,
            )
            raw = resp.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            return json.loads(raw)
        except Exception as e:
            log.warning(f"  Attempt {attempt + 1} failed: {e}")
            time.sleep(1)
    return None


def main():
    # Fetch all entries not yet analysed (status is null, empty, or 'pending'/'failed')
    resp = (
        sb.table("journal_entries")
        .select("id, user_id, entry_date, body, analysis_status")
        .is_("deleted_at", "null")
        .execute()
    )
    all_entries = resp.data or []

    to_analyse = [
        e for e in all_entries
        if e.get("analysis_status") not in ("done", "skipped")
        and e.get("body", "").strip()
    ]

    log.info(f"Found {len(all_entries)} total entries, {len(to_analyse)} need analysis")

    if not to_analyse:
        log.info("Nothing to do.")
        return

    ok = 0
    failed = 0

    for i, entry in enumerate(to_analyse, 1):
        body = entry["body"].strip()
        if len(body) < 20:
            sb.table("journal_entries").update({"analysis_status": "skipped"}).eq("id", entry["id"]).execute()
            log.info(f"[{i}/{len(to_analyse)}] {entry['id'][:8]}… skipped (too short)")
            continue

        log.info(f"[{i}/{len(to_analyse)}] Analysing {entry['id'][:8]}… ({entry['entry_date']})")
        result = call_gpt(str(entry["entry_date"]), body)

        if result is None:
            sb.table("journal_entries").update({"analysis_status": "failed"}).eq("id", entry["id"]).execute()
            log.warning(f"  → FAILED")
            failed += 1
            continue

        from datetime import datetime, timezone
        sb.table("journal_entries").update({
            "primary_sentiment": result.get("primary_sentiment"),
            "sentiment_score": result.get("sentiment_score"),
            "energy_level": result.get("energy_level"),
            "key_themes": result.get("key_themes", []),
            "one_line_summary": result.get("one_line_summary"),
            "keywords": result.get("keywords", []),
            "analysis_status": "done",
            "analysed_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", entry["id"]).execute()

        log.info(f"  → {result.get('primary_sentiment')} (score: {result.get('sentiment_score'):.2f})")
        ok += 1

        # Small delay to avoid rate limits
        time.sleep(0.3)

    print()
    print("=" * 50)
    print(f"Done! {ok} analysed, {failed} failed, {len(to_analyse) - ok - failed} skipped")
    print("=" * 50)


if __name__ == "__main__":
    main()
