"""Create and clear Firebase session cookies (httpOnly)."""

from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, HTTPException, Request, Response
from firebase_admin import auth as firebase_auth
from pydantic import BaseModel, ConfigDict, Field

from app.config import get_settings
from app.firebase_integration import ensure_firebase_initialized

router = APIRouter()

# Firebase allows session cookies up to 14 days.
_MAX_SESSION_SECONDS = 14 * 24 * 3600


class CreateSessionBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    id_token: str = Field(min_length=1, alias="idToken")


def _session_expires_in() -> timedelta:
    settings = get_settings()
    secs = min(settings.session_cookie_max_age_seconds, _MAX_SESSION_SECONDS)
    return timedelta(seconds=max(1, secs))


def _set_session_cookie(response: Response, session_cookie: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.session_cookie_name,
        value=session_cookie,
        max_age=min(settings.session_cookie_max_age_seconds, _MAX_SESSION_SECONDS),
        path="/",
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite="lax",
    )


def _clear_session_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        key=settings.session_cookie_name,
        path="/",
        secure=settings.session_cookie_secure,
        httponly=True,
        samesite="lax",
    )


@router.post("/session", status_code=204)
def create_session(body: CreateSessionBody, response: Response) -> None:
    ensure_firebase_initialized()
    try:
        firebase_auth.verify_id_token(body.id_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid ID token") from None
    try:
        session_cookie = firebase_auth.create_session_cookie(
            body.id_token,
            expires_in=_session_expires_in(),
        )
    except Exception:
        raise HTTPException(
            status_code=401, detail="Could not create session cookie"
        ) from None
    _set_session_cookie(response, session_cookie)


@router.delete("/session", status_code=204)
def delete_session(request: Request, response: Response) -> None:
    ensure_firebase_initialized()
    settings = get_settings()
    raw = request.cookies.get(settings.session_cookie_name)
    if raw:
        try:
            decoded = firebase_auth.verify_session_cookie(
                raw, check_revoked=True
            )
            uid = decoded.get("uid")
            if isinstance(uid, str) and uid:
                firebase_auth.revoke_refresh_tokens(uid)
        except Exception:
            pass
    _clear_session_cookie(response)
