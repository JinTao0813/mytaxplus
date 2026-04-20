"""Initialize the Firebase Admin SDK once per process."""

from __future__ import annotations

import firebase_admin
from firebase_admin import credentials

from app.config import get_settings


def ensure_firebase_initialized() -> None:
    if firebase_admin._apps:
        return
    settings = get_settings()
    if settings.firebase_credentials_path:
        cred = credentials.Certificate(settings.firebase_credentials_path)
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()
