from fastapi import APIRouter, Depends, Query
from dependencies import get_current_user
from services.insights_service import get_insights_summary, get_habit_correlations, get_mood_timeline

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/mood-timeline")
async def mood_timeline(
    days: int = Query(14, ge=7, le=90),
    user_id: str = Depends(get_current_user),
):
    return get_mood_timeline(user_id, days)


@router.get("/summary")
async def insights_summary(
    days: int = Query(14, ge=7, le=90),
    user_id: str = Depends(get_current_user),
):
    return get_insights_summary(user_id, days)


@router.get("/correlations")
async def habit_correlations(user_id: str = Depends(get_current_user)):
    return get_habit_correlations(user_id)
