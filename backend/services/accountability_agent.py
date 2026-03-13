"""
Ruthless Accountability Coach — LangGraph multi-agent pipeline.

Agent A (Auditor): scans the user's habits for broken streaks (2+ days missed).
Agent B (Enforcer): reads recent journal entries and writes a personalised roast.
"""
from __future__ import annotations

import logging
from datetime import date, timedelta
from typing import Optional

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing_extensions import TypedDict

logger = logging.getLogger(__name__)


class AccountabilityState(TypedDict):
    user_id: str
    broken_habits: list[dict]   # [{name, description, emoticon, days_missed, last_completed}]
    journal_context: str
    roast_message: Optional[str]


# ---------------------------------------------------------------------------
# Node A — Auditor
# ---------------------------------------------------------------------------

def auditor_node(state: AccountabilityState) -> dict:
    """Find habits whose streak has been broken for 2+ days."""
    from database import get_db
    from services.streak_service import compute_streak

    db = get_db()
    user_id = state["user_id"]
    today = date.today()
    cutoff = (today - timedelta(days=60)).isoformat()

    habits_resp = (
        db.table("habits")
        .select("id, name, description, emoticon")
        .eq("user_id", user_id)
        .is_("archived_at", "null")
        .execute()
    )

    broken: list[dict] = []

    for habit in habits_resp.data:
        comps_resp = (
            db.table("habit_completions")
            .select("completion_date")
            .eq("habit_id", habit["id"])
            .eq("user_id", user_id)
            .gte("completion_date", cutoff)
            .execute()
        )
        dates = [date.fromisoformat(c["completion_date"]) for c in comps_resp.data]
        streak = compute_streak(dates)

        if streak["current_streak"] == 0 and streak["last_completed_date"]:
            days_missed = (today - streak["last_completed_date"]).days
            if days_missed >= 2:
                broken.append({
                    "name": habit["name"],
                    "description": habit.get("description") or "",
                    "emoticon": habit.get("emoticon") or "",
                    "days_missed": days_missed,
                    "last_completed": streak["last_completed_date"].isoformat(),
                })

    logger.info(f"Auditor found {len(broken)} broken habit(s) for user {user_id}")
    return {"broken_habits": broken}


def _route_after_audit(state: AccountabilityState) -> str:
    # If force=True was set, broken_habits will contain a sentinel entry
    if state.get("broken_habits"):
        return "journal"
    return END


# ---------------------------------------------------------------------------
# Journal context node (feeds the Enforcer)
# ---------------------------------------------------------------------------

def journal_node(state: AccountabilityState) -> dict:
    """Fetch recent journal entries to give the Enforcer personal ammo."""
    from database import get_db

    db = get_db()
    resp = (
        db.table("journal_entries")
        .select("entry_date, body, one_line_summary, key_themes, primary_sentiment")
        .eq("user_id", state["user_id"])
        .is_("deleted_at", "null")
        .order("entry_date", desc=True)
        .limit(6)
        .execute()
    )

    entries = resp.data
    if not entries:
        return {"journal_context": "User has no journal entries on record."}

    lines: list[str] = []
    for e in entries:
        date_str = e.get("entry_date", "?")
        summary = e.get("one_line_summary") or ""
        themes = ", ".join(e.get("key_themes") or [])
        sentiment = e.get("primary_sentiment") or ""
        snippet = (e.get("body") or "")[:350]
        lines.append(
            f"[{date_str}] {sentiment}. Summary: {summary}. Themes: {themes}.\n"
            f"Excerpt: {snippet}"
        )

    return {"journal_context": "\n\n---\n\n".join(lines)}


# ---------------------------------------------------------------------------
# Node B — Enforcer
# ---------------------------------------------------------------------------

ENFORCER_SYSTEM = """\
You are The Ruthless Accountability Coach — a razor-tongued, deeply sarcastic AI \
that weaponises people's own journal entries against them.

Rules:
- Dripping sarcasm is your default register. Dry wit. Devastating irony.
- Reference SPECIFIC things from the journal — goals they wrote, exact phrases they used, \
  aspirations they expressed — and turn them against them.
- EXACTLY 2 sentences. Short, hard-hitting, and punchy. Every word earns its place.
- Say "you" directly. Never "the user" or "they".
- Do NOT open with "Oh", "Hey", "Well", "So", or "Wow".
- Vary your angle: sometimes mock-congratulatory ("Incredible dedication"), \
  sometimes faux-concerned ("Just checking — did you mean to quit?"), \
  sometimes deadpan scorched-earth ("Three days. Impressive restraint.")
- The goal is to make them laugh uncomfortably and then immediately feel shame.\
"""

ENFORCER_USER_TEMPLATE = """\
Habits broken (days missed):
{habits}

User's recent journal entries:
{journal}

Write a short, sarcastic, personalised roast. Use their own journal words and goals against them. \
Make it sting with irony, not just bluntness.\
"""


def enforcer_node(state: AccountabilityState) -> dict:
    """Write the personalised roast message."""
    from config import settings

    if not settings.openai_api:
        logger.warning("OPENAI_API not set — enforcer skipped")
        return {"roast_message": None}

    broken = state["broken_habits"]
    # Filter out the force-mode sentinel entry
    real_broken = [h for h in broken if h.get("name") != "everything"]
    broken_sorted = sorted(real_broken, key=lambda h: h["days_missed"], reverse=True)

    if broken_sorted:
        habits_text = "\n".join(
            f"- {h['name']}: {h['days_missed']} days missed"
            + (f" ({h['description']})" if h["description"] else "")
            for h in broken_sorted
        )
    else:
        habits_text = "(No specific broken habits — roast based purely on what the journal reveals about their character.)"

    llm = ChatOpenAI(model="gpt-4o", api_key=settings.openai_api, temperature=1.0, max_tokens=120)

    user_msg = ENFORCER_USER_TEMPLATE.format(
        habits=habits_text,
        journal=state["journal_context"],
    )

    try:
        response = llm.invoke([
            {"role": "system", "content": ENFORCER_SYSTEM},
            {"role": "user", "content": user_msg},
        ])
        roast = response.content.strip()
        logger.info(f"Enforcer generated roast for user {state['user_id']}")
        return {"roast_message": roast}
    except Exception as e:
        logger.error(f"Enforcer failed: {e}")
        return {"roast_message": None}


# ---------------------------------------------------------------------------
# Build the graph
# ---------------------------------------------------------------------------

def build_accountability_graph():
    graph = StateGraph(AccountabilityState)

    graph.add_node("auditor", auditor_node)
    graph.add_node("journal", journal_node)
    graph.add_node("enforcer", enforcer_node)

    graph.set_entry_point("auditor")
    graph.add_conditional_edges(
        "auditor",
        _route_after_audit,
        {"journal": "journal", END: END},
    )
    graph.add_edge("journal", "enforcer")
    graph.add_edge("enforcer", END)

    return graph.compile()
