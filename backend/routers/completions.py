import logging
from datetime import date as date_type

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import JSONResponse

from database import get_db
from dependencies import get_current_user
from schemas.completions import CompletionResponse
from services.proof_service import verify_habit_proof

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/completions", tags=["completions"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB


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


@router.post(
    "/verify",
    response_model=CompletionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def verify_completion(
    habit_id: str = Form(...),
    image: UploadFile = File(...),
    date: str = Form(default=None),
    user_id: str = Depends(get_current_user),
):
    """Complete a habit by submitting photo proof for GPT-4o Vision verification."""
    db = get_db()

    completion_date = date or date_type.today().isoformat()

    # 1. Validate habit belongs to user and is active
    habit_resp = (
        db.table("habits")
        .select("id, name, description")
        .eq("id", habit_id)
        .eq("user_id", user_id)
        .is_("archived_at", "null")
        .execute()
    )
    if not habit_resp.data:
        raise HTTPException(status_code=404, detail="Habit not found")
    habit = habit_resp.data[0]

    # 2. Idempotency check
    existing = (
        db.table("habit_completions")
        .select("id")
        .eq("habit_id", habit_id)
        .eq("user_id", user_id)
        .eq("completion_date", completion_date)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=409, detail="Already completed today")

    # 3. Validate file
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: jpeg, png, webp",
        )

    image_bytes = await image.read()
    if len(image_bytes) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 10 MB limit")

    # 4. Upload to Supabase Storage
    storage_path = f"{user_id}/{habit_id}/{completion_date}.jpg"
    try:
        db.storage.from_("habit-proof").upload(
            storage_path,
            image_bytes,
            file_options={"content-type": image.content_type or "image/jpeg", "upsert": "true"},
        )
    except Exception as exc:
        logger.error("Storage upload failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to upload image")

    # 5. Generate signed URL (1 year expiry)
    image_url = storage_path
    try:
        signed = db.storage.from_("habit-proof").create_signed_url(storage_path, 31_536_000)
        image_url = (
            signed.get("signedURL")
            or (signed.get("data") or {}).get("signedUrl")
            or storage_path
        )
    except Exception as exc:
        logger.warning("Failed to generate signed URL, storing path: %s", exc)

    # 6. Vision verification
    result = await verify_habit_proof(
        habit_name=habit["name"],
        habit_description=habit.get("description") or "",
        image_bytes=image_bytes,
        image_media_type=image.content_type or "image/jpeg",
    )

    # 7. Rejected: delete image (best-effort), return 400 with verdict
    if not result.approved:
        try:
            db.storage.from_("habit-proof").remove([storage_path])
        except Exception:
            pass
        return JSONResponse(
            status_code=400,
            content={"verdict": result.verdict},
        )

    # 8. Approved: insert completion record
    resp = (
        db.table("habit_completions")
        .insert({
            "habit_id": habit_id,
            "user_id": user_id,
            "completion_date": completion_date,
            "proof_image_url": image_url,
            "proof_verdict": result.verdict,
        })
        .execute()
    )
    return resp.data[0]


@router.delete("/{completion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_completion(
    completion_id: str,
    user_id: str = Depends(get_current_user),
):
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
