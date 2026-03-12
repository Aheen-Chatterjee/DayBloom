from fastapi import APIRouter, Depends, HTTPException, Query, status
from database import get_db
from dependencies import get_current_user
from schemas.completions import CompletionCreate, CompletionResponse

router = APIRouter(prefix="/completions", tags=["completions"])


@router.get("", response_model=list[CompletionResponse])
async def list_completions(
    date: str = Query(..., description="YYYY-MM-DD"),
    user_id: str = Depends(get_current_user),
):
    db = get_db()
    resp = (
        db.table("habit_completions")
        .select("*")
        .eq("user_id", user_id)
        .eq("completion_date", date)
        .execute()
    )
    return resp.data


@router.post("", response_model=CompletionResponse, status_code=status.HTTP_201_CREATED)
async def create_completion(
    body: CompletionCreate,
    user_id: str = Depends(get_current_user),
):
    db = get_db()
    # Verify habit belongs to user
    habit_resp = (
        db.table("habits")
        .select("id")
        .eq("id", body.habit_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not habit_resp.data:
        raise HTTPException(status_code=404, detail="Habit not found")

    resp = (
        db.table("habit_completions")
        .insert({
            "habit_id": body.habit_id,
            "user_id": user_id,
            "completion_date": body.completion_date.isoformat(),
            "note": body.note,
        })
        .execute()
    )
    return resp.data[0]


@router.delete("/{completion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_completion(completion_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    resp = (
        db.table("habit_completions")
        .delete()
        .eq("id", completion_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Completion not found")
