from fastapi import Header, HTTPException, status
from database import get_db


async def get_current_user(authorization: str = Header(...)) -> str:
    """Validate Supabase JWT via auth.get_user() — works with both HS256 and ES256."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )
    token = authorization.removeprefix("Bearer ")
    try:
        db = get_db()
        response = db.auth.get_user(token)
        user_id = response.user.id
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return str(user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
        )
