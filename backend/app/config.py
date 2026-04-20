from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    env: str = "development"
    gemini_api_key: str | None = None
    allowed_origins: str = "http://localhost:3000"
    # Optional path to Firebase service account JSON. If unset, Application Default Credentials are used
    # (e.g. export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json).
    firebase_credentials_path: str | None = None

    # Firebase session cookie (Admin SDK create_session_cookie); max age capped at 14 days by Firebase.
    session_cookie_name: str = "__session"
    session_cookie_max_age_seconds: int = 5 * 24 * 3600
    session_cookie_secure: bool = False

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
