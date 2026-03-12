from fastapi import APIRouter, Header
from datetime import datetime, timezone
from jose import jwt
from config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@router.get("/debug-jwt")
async def debug_jwt(authorization: str = Header(...)):
    """Temporary: decode JWT without verification to inspect claims."""
    token = authorization.removeprefix("Bearer ")
    # Decode without ANY verification to see raw claims
    unverified = jwt.get_unverified_claims(token)
    unverified_header = jwt.get_unverified_header(token)

    # Try to verify with our secret and capture the error
    error_msg = None
    try:
        jwt.decode(token, settings.jwt_secret, algorithms=["HS256"],
                   options={"verify_aud": False})
        verified = True
    except Exception as e:
        verified = False
        error_msg = str(e)

    return {
        "header": unverified_header,
        "claims": unverified,
        "jwt_secret_used": settings.jwt_secret[:8] + "...",
        "verified": verified,
        "error": error_msg,
    }
