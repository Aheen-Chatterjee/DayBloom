from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from datetime import date
from database import get_db
from dependencies import get_current_user
from schemas.journal import (
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryResponse,
    JournalListResponse,
)
from services.openai_service import analyse_journal_entry

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
    background_tasks: BackgroundTasks,
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
            "analysis_status": "pending",
        })
        .execute()
    )
    entry = resp.data[0]
    if body.body and len(body.body.strip()) >= 20:
        background_tasks.add_task(
            analyse_journal_entry,
            entry["id"],
            body.entry_date.isoformat(),
            body.body,
            db,
        )
    return entry


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
    background_tasks: BackgroundTasks,
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

    entry = resp.data[0]
    if "body" in update_data and update_data["body"] and len(update_data["body"].strip()) >= 20:
        entry_date = str(entry.get("entry_date", date.today().isoformat()))
        background_tasks.add_task(
            analyse_journal_entry,
            entry_id,
            entry_date,
            update_data["body"],
            db,
        )
    return entry


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


@router.post("/entries/{entry_id}/analyse", status_code=status.HTTP_202_ACCEPTED)
async def reanalyse_entry(
    entry_id: str,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user),
):
    db = get_db()
    resp = (
        db.table("journal_entries")
        .select("body, entry_date")
        .eq("id", entry_id)
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
        .single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry = resp.data
    background_tasks.add_task(
        analyse_journal_entry,
        entry_id,
        str(entry["entry_date"]),
        entry["body"],
        db,
    )
    return {"status": "queued"}
