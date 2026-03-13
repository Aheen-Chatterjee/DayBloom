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
    return "journal" if state["broken_habits"] else END


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
You are The Ruthless Accountability Coach — a brutally honest, slightly unhinged AI \
that holds people to the promises they write in their own journals.

Rules:
- Be direct and personal. Say "you", never "the user".
- Reference SPECIFIC things the person wrote in their journal — goals, fears, exact words.
- Keep it to 1-2 punchy sentences. This is a toast notification, not an essay.
- Make it sting just enough to be motivating, not cruel or hateful.
- Never open with "Hey", "Hello", or "Oh no".
- Vary your tone: sometimes cold and surgical, sometimes disbelieving, sometimes darkly amused.\
"""

ENFORCER_USER_TEMPLATE = """\
Habits broken (days missed):
{habits}

User's recent journal entries:
{journal}

Write a short, brutal, personalised roast for their in-app toast notification. \
Dig into something specific from the journal — a goal they mentioned, something they cared about, \
their own words used against them.\
"""


def enforcer_node(state: AccountabilityState) -> dict:
    """Write the personalised roast message."""
    from config import settings

    if not settings.openai_api:
        logger.warning("OPENAI_API not set — enforcer skipped")
        return {"roast_message": None}

    broken = state["broken_habits"]
    # Sort worst offenders first
    broken_sorted = sorted(broken, key=lambda h: h["days_missed"], reverse=True)
    habits_text = "\n".join(
        f"- {h['emoticon']} {h['name']}: {h['days_missed']} days missed"
        + (f" ({h['description']})" if h["description"] else "")
        for h in broken_sorted
    )

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
