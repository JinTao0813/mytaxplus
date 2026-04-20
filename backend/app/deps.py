from typing import Annotated

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth

from app.config import get_settings
from app.firebase_integration import ensure_firebase_initialized

_bearer = HTTPBearer(auto_error=False)


async def require_firebase_user(
    request: Request,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(_bearer),
    ],
) -> dict:
    ensure_firebase_initialized()
    settings = get_settings()

    if credentials is not None:
        try:
            return firebase_auth.verify_id_token(
                credentials.credentials,
                check_revoked=True,
            )
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

    raw = request.cookies.get(settings.session_cookie_name)
    if raw:
        try:
            return firebase_auth.verify_session_cookie(raw, check_revoked=True)
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or expired session")

    raise HTTPException(status_code=401, detail="Not authenticated")
