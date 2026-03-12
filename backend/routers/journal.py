from fastapi import APIRouter, Depends, HTTPException, Query, status
from datetime import date
from database import get_db
from dependencies import get_current_user
from schemas.journal import (
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryResponse,
    JournalListResponse,
)

router = APIRouter(prefix="/journal", tags=["journal"])


@router.get("/entries", response_model=JournalListResponse)
async def list_entries(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user),
):
    db = get_db()
    offset = (page - 1) * limit

    # Count total
    count_resp = (
        db.table("journal_entries")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
        .execute()
    )
    total = count_resp.count or 0

    # Fetch page
    resp = (
        db.table("journal_entries")
        .select("*")
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
        .order("entry_date", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    return JournalListResponse(
        items=resp.data,
        total=total,
        page=page,
        has_next=(offset + limit) < total,
    )


@router.post("/entries", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_entry(
    body: JournalEntryCreate,
    user_id: str = Depends(get_current_user),
):
    db = get_db()
    resp = (
        db.table("journal_entries")
        .insert({
            "user_id": user_id,
            "entry_date": body.entry_date.isoformat(),
            "title": body.title,
            "body": body.body,
        })
        .execute()
    )
    return resp.data[0]


@router.get("/entries/{entry_id}", response_model=JournalEntryResponse)
async def get_entry(entry_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    resp = (
        db.table("journal_entries")
        .select("*")
        .eq("id", entry_id)
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
        .single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    return resp.data


@router.patch("/entries/{entry_id}", response_model=JournalEntryResponse)
async def update_entry(
    entry_id: str,
    body: JournalEntryUpdate,
    user_id: str = Depends(get_current_user),
):
    db = get_db()
    update_data = body.model_dump(exclude_none=True)
    if "entry_date" in update_data:
        update_data["entry_date"] = update_data["entry_date"].isoformat()
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    resp = (
        db.table("journal_entries")
        .update(update_data)
        .eq("id", entry_id)
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    return resp.data[0]


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(entry_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    from datetime import datetime, timezone
    resp = (
        db.table("journal_entries")
        .update({"deleted_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", entry_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Entry not found")
