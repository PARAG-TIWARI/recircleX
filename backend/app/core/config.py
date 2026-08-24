import json
from typing import List, Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "RecycleX"
    PROJECT_NAME: str = "RecycleX API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    ENV: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    API_V1_PREFIX: str = "/api/v1"
    LOG_LEVEL: str = "INFO"
    BACKEND_URL: str = "https://recirclex.onrender.com"
    NEXT_PUBLIC_API_URL: str = "https://recirclex.onrender.com"

    # Database
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "recyclex_db"
    MONGODB_DB_NAME: Optional[str] = None

    @property
    def database_name(self) -> str:
        return self.MONGODB_DB_NAME or self.MONGODB_DATABASE or "recyclex_db"

    # Auth (Clerk)
    CLERK_SECRET_KEY: str = ""
    CLERK_JWT_ISSUER: str = ""
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: str = ""

    # Cloudinary (Future Storage Layer)
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    CLOUDINARY_URL: str = ""

    # Email (Resend)
    RESEND_API_KEY: str = ""

    # Analytics & Observability
    SENTRY_DSN: str = ""

    # AI (OpenRouter / Gemini)
    OPENROUTER_API_KEY: str = ""
    AI_API_KEY: str = ""

    # Maps & Geolocation
    GOOGLE_MAPS_API_KEY: str = ""
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: Union[List[str], str] = ["*"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, str) and v.startswith("["):
            try:
                return json.loads(v)
            except Exception:
                return ["http://localhost:3000", "http://127.0.0.1:3000"]
        elif isinstance(v, list):
            return v
        return ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
