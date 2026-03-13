import asyncio
import logging
from fastapi import APIRouter, Depends, Query
from dependencies import get_current_user
from services.accountability_agent import build_accountability_graph

router = APIRouter(prefix="/accountability", tags=["accountability"])
logger = logging.getLogger(__name__)


@router.get("/roast")
async def get_roast(
    user_id: str = Depends(get_current_user),
    force: bool = Query(False, description="Skip streak check — always generate a roast"),
):
    """
    Run the Auditor → Enforcer pipeline.
    With force=true the Auditor is bypassed and a roast is always generated.
    """
    graph = build_accountability_graph()

    # When forced, inject a placeholder so the graph routes to journal → enforcer
    initial_broken: list = []
    if force:
        initial_broken = [{"name": "everything", "description": "", "emoticon": "🔥", "days_missed": 0, "last_completed": "never"}]

    initial_state = {
        "user_id": user_id,
        "broken_habits": initial_broken,
        "journal_context": "",
        "roast_message": None,
    }

    try:
        result = await asyncio.to_thread(graph.invoke, initial_state)
        return {
            "roast": result.get("roast_message"),
            "broken_habits": result.get("broken_habits", []),
        }
    except Exception as e:
        logger.error(f"Accountability pipeline failed: {e}")
        return {"roast": None, "broken_habits": []}
