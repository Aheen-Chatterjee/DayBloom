from fastapi import APIRouter, Depends, HTTPException
from datetime import date, datetime, timezone
from database import get_db
from dependencies import get_current_user
from schemas.wrapped import GenerateWrappedRequest
from services.wrapped_service import generate_wrapped
import json

router = APIRouter(prefix="/wrapped", tags=["wrapped"])


@router.post("/generate")
async def generate_wrapped_report(
    body: GenerateWrappedRequest,
    user_id: str = Depends(get_current_user),
):
    db = get_db()
    report_data = generate_wrapped(user_id, body.period, body.start_date)

    # Upsert into DB
    now = datetime.now(timezone.utc).isoformat()
    try:
        existing = (
            db.table("wrapped_reports")
            .select("id")
            .eq("user_id", user_id)
            .eq("period", body.period)
            .eq("start_date", body.start_date.isoformat())
            .execute()
        )
        if existing.data:
            db.table("wrapped_reports").update({
                "report_data": report_data,
                "end_date": report_data["end_date"],
                "created_at": now,
            }).eq("id", existing.data[0]["id"]).execute()
            report_id = existing.data[0]["id"]
        else:
            resp = db.table("wrapped_reports").insert({
                "user_id": user_id,
                "period": body.period,
                "start_date": body.start_date.isoformat(),
                "end_date": report_data["end_date"],
                "report_data": report_data,
            }).execute()
            report_id = resp.data[0]["id"]
    except Exception:
        # If wrapped_reports table doesn't exist yet, just return data
        report_id = "unsaved"

    return {"id": report_id, "created_at": now, **report_data}


@router.get("/latest")
async def get_latest_wrapped(
    period: str = "week",
    user_id: str = Depends(get_current_user),
):
    db = get_db()
    try:
        resp = (
            db.table("wrapped_reports")
            .select("*")
            .eq("user_id", user_id)
            .eq("period", period)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not resp.data:
            raise HTTPException(status_code=404, detail="No wrapped report found")
        row = resp.data[0]
        return {"id": row["id"], "created_at": row["created_at"], **row["report_data"]}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="No wrapped report found")


@router.get("/{report_id}")
async def get_wrapped_report(
    report_id: str,
    user_id: str = Depends(get_current_user),
):
    db = get_db()
    try:
        resp = (
            db.table("wrapped_reports")
            .select("*")
            .eq("id", report_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not resp.data:
            raise HTTPException(status_code=404, detail="Report not found")
        row = resp.data
        return {"id": row["id"], "created_at": row["created_at"], **row["report_data"]}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="Report not found")
