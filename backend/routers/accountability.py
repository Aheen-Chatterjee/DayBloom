import asyncio
import logging
from fastapi import APIRouter, Depends
from dependencies import get_current_user
from services.accountability_agent import build_accountability_graph

router = APIRouter(prefix="/accountability", tags=["accountability"])
logger = logging.getLogger(__name__)


@router.get("/roast")
async def get_roast(user_id: str = Depends(get_current_user)):
    """
    Run the Auditor → Enforcer pipeline and return a personalised roast
    if the user has broken any habit streaks. Returns null roast otherwise.
    """
    graph = build_accountability_graph()

    initial_state = {
        "user_id": user_id,
        "broken_habits": [],
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
