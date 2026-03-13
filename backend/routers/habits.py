from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from database import get_db
from dependencies import get_current_user
from schemas.habits import HabitCreate, HabitUpdate, HabitResponse

router = APIRouter(prefix="/habits", tags=["habits"])


@router.get("", response_model=list[HabitResponse])
async def list_habits(user_id: str = Depends(get_current_user)):
    db = get_db()
    resp = (
        db.table("habits")
        .select("*")
        .eq("user_id", user_id)
        .is_("archived_at", "null")
        .order("created_at", desc=False)
        .execute()
    )
    return resp.data


@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(body: HabitCreate, user_id: str = Depends(get_current_user)):
    db = get_db()
    resp = (
        db.table("habits")
        .insert({
            "user_id": user_id,
            "name": body.name,
            "description": body.description,
            "emoticon": body.emoticon,
            "color": body.color,
            "frequency": body.frequency,
            "requires_proof": body.requires_proof,
        })
        .execute()
    )
    return resp.data[0]


@router.patch("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: str,
    body: HabitUpdate,
    user_id: str = Depends(get_current_user),
):
    db = get_db()
    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    resp = (
        db.table("habits")
        .update(update_data)
        .eq("id", habit_id)
        .eq("user_id", user_id)
        .is_("archived_at", "null")
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Habit not found")
    return resp.data[0]


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def archive_habit(habit_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    resp = (
        db.table("habits")
        .update({"archived_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", habit_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Habit not found")
