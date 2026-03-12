from fastapi import APIRouter, Depends, Query
from datetime import date, timedelta
from database import get_db
from dependencies import get_current_user
from services.streak_service import compute_streak
from services.history_service import get_history
from schemas.streaks import StreakResponse, AllStreaksResponse, HistoryResponse

router = APIRouter(tags=["streaks"])


@router.get("/habits/{habit_id}/streak", response_model=StreakResponse)
async def get_habit_streak(habit_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    resp = (
        db.table("habit_completions")
        .select("completion_date")
        .eq("habit_id", habit_id)
        .eq("user_id", user_id)
        .execute()
    )
    dates = [date.fromisoformat(row["completion_date"]) for row in resp.data]
    result = compute_streak(dates)
    return StreakResponse(habit_id=habit_id, **result)


@router.get("/streaks/all", response_model=AllStreaksResponse)
async def get_all_streaks(user_id: str = Depends(get_current_user)):
    db = get_db()
    # Get all active habits
    habits_resp = (
        db.table("habits")
        .select("id")
        .eq("user_id", user_id)
        .is_("archived_at", "null")
        .execute()
    )
    habit_ids = [h["id"] for h in habits_resp.data]

    if not habit_ids:
        return AllStreaksResponse(streaks=[])

    # Bulk fetch all completions at once
    completions_resp = (
        db.table("habit_completions")
        .select("habit_id, completion_date")
        .eq("user_id", user_id)
        .in_("habit_id", habit_ids)
        .execute()
    )

    # Group by habit_id
    by_habit: dict[str, list[date]] = {hid: [] for hid in habit_ids}
    for c in completions_resp.data:
        by_habit[c["habit_id"]].append(date.fromisoformat(c["completion_date"]))

    streaks = []
    for habit_id in habit_ids:
        result = compute_streak(by_habit[habit_id])
        streaks.append(StreakResponse(habit_id=habit_id, **result))

    return AllStreaksResponse(streaks=streaks)


@router.get("/history", response_model=HistoryResponse)
async def get_history_range(
    from_date: date = Query(..., alias="from"),
    to_date: date = Query(..., alias="to"),
    user_id: str = Depends(get_current_user),
):
    days = get_history(user_id, from_date, to_date)
    return HistoryResponse(days=days)
