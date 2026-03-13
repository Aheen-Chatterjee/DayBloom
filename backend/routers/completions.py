import logging
from datetime import date as date_type

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import JSONResponse

from database import get_db
from dependencies import get_current_user
from schemas.completions import CompletionCreate, CompletionResponse
from services.proof_service import verify_habit_proof

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/completions", tags=["completions"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB

_EXT_MAP = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def _sniff_image_type(data: bytes) -> str | None:
    """Verify file magic bytes and return detected MIME type, or None if unrecognised."""
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


@router.get("", response_model=list[CompletionResponse])
async def list_completions(
    date: date_type = Query(..., description="YYYY-MM-DD"),
    user_id: str = Depends(get_current_user),
):
    db = get_db()
    resp = (
        db.table("habit_completions")
        .select("*")
        .eq("user_id", user_id)
        .eq("completion_date", date.isoformat())
        .execute()
    )
    return resp.data


@router.post("", response_model=CompletionResponse, status_code=status.HTTP_201_CREATED)
async def create_completion(body: CompletionCreate, user_id: str = Depends(get_current_user)):
    """Complete a habit directly (no proof required). Validates habit ownership."""
    db = get_db()

    habit_resp = (
        db.table("habits")
        .select("id, requires_proof")
        .eq("id", body.habit_id)
        .eq("user_id", user_id)
        .is_("archived_at", "null")
        .execute()
    )
    if not habit_resp.data:
        raise HTTPException(status_code=404, detail="Habit not found")
    if habit_resp.data[0].get("requires_proof", True):
        raise HTTPException(status_code=403, detail="This habit requires photo proof")

    existing = (
        db.table("habit_completions")
        .select("id")
        .eq("habit_id", body.habit_id)
        .eq("user_id", user_id)
        .eq("completion_date", body.completion_date.isoformat())
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=409, detail="Already completed today")

    try:
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
    except Exception as exc:
        if "duplicate" in str(exc).lower() or "unique" in str(exc).lower():
            raise HTTPException(status_code=409, detail="Already completed today")
        logger.error("Failed to insert completion: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to record completion")

    return resp.data[0]


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

    # 2. Idempotency check (early guard — race conditions handled at INSERT too)
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

    # 3. Validate declared content-type then verify magic bytes
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: jpeg, png, webp",
        )

    image_bytes = await image.read()
    if len(image_bytes) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 10 MB limit")

    detected_type = _sniff_image_type(image_bytes)
    if detected_type is None:
        raise HTTPException(
            status_code=400,
            detail="File content does not match a supported image format",
        )

    # Use detected type for storage — don't trust the client-supplied header
    ext = _EXT_MAP[detected_type]
    storage_path = f"{user_id}/{habit_id}/{completion_date}.{ext}"

    # 4. Upload to Supabase Storage
    try:
        db.storage.from_("habit-proof").upload(
            storage_path,
            image_bytes,
            file_options={"content-type": detected_type, "upsert": "true"},
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
        image_media_type=detected_type,
    )

    # 7. Rejected: delete image (best-effort), return 400 with verdict
    if not result.approved:
        try:
            db.storage.from_("habit-proof").remove([storage_path])
        except Exception:
            pass  # Non-fatal: next retry overwrites same path
        return JSONResponse(
            status_code=400,
            content={"verdict": result.verdict},
        )

    # 8. Approved: insert completion — catch unique-constraint violation from race condition
    try:
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
    except Exception as exc:
        # Unique constraint violation = another request won the race
        if "duplicate" in str(exc).lower() or "unique" in str(exc).lower():
            try:
                db.storage.from_("habit-proof").remove([storage_path])
            except Exception:
                pass
            raise HTTPException(status_code=409, detail="Already completed today")
        logger.error("Failed to insert completion: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to record completion")

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
