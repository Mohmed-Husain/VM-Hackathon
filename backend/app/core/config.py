from functools import lru_cache
from pathlib import Path
import ssl

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url

BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(
            BACKEND_DIR / ".env",
            PROJECT_ROOT / ".env",
            ".env",
        ),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Smart eVisa Portal API"
    app_version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"
    db_url: str = Field(..., alias="DB_URL")
    secret_key: str = "hackathon-dev-secret-key-change-me-32bytes"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 8 * 60
    frontend_url: str = "http://localhost:3000"
    backend_public_url: str = "http://localhost:8000"
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    openai_model: str = "gpt-4o-mini"
    memori_api_key: str | None = Field(default=None, alias="MEMORI_API_KEY")
    payments_enabled: bool = Field(default=False, alias="PAYMENTS_ENABLED")
    auto_create_tables: bool = True
    cors_origins: str | list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    @field_validator("cors_origins", mode="after")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def async_database_url(self) -> str:
        raw_url = self.db_url
        if raw_url.startswith("postgresql://"):
            raw_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif raw_url.startswith("postgres://"):
            raw_url = raw_url.replace("postgres://", "postgresql+asyncpg://", 1)

        parsed_url = make_url(raw_url)
        parsed_url = parsed_url.difference_update_query(["sslmode", "channel_binding"])
        return parsed_url.render_as_string(hide_password=False)

    @property
    def database_connect_args(self) -> dict:
        parsed_url = make_url(self.db_url)
        sslmode = parsed_url.query.get("sslmode")
        connect_args: dict = {}

        if sslmode and sslmode.lower() != "disable":
            if sslmode.lower() in ("require", "prefer", "allow"):
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                connect_args["ssl"] = ctx
            else:
                connect_args["ssl"] = ssl.create_default_context()

        return connect_args

    @property
    def storage_root(self) -> Path:
        return BACKEND_DIR / "storage"

    @property
    def visa_rules_path(self) -> Path:
        return BACKEND_DIR / "app" / "data" / "official_visa_rules.json"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
