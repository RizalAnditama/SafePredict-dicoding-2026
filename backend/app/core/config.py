from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables or a local .env file."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    app_name: str = Field(
        default="SafePredict API", description="Displayed name of the backend service."
    )
    environment: str = Field(
        default="development", description="Runtime environment name."
    )
    api_prefix: str = Field(
        default="/api", description="Prefix applied to backend API routes."
    )
    backend_host: str = Field(
        default="127.0.0.1", description="Host used when running the backend locally."
    )
    backend_port: int = Field(
        default=8000, description="Port used by the backend development server."
    )
    frontend_origin: str = Field(
        default="http://localhost:3000",
        description="Allowed frontend origin for local browser-based development.",
    )
    backend_api_base_url: str = Field(
        default="http://127.0.0.1:8000",
        description="Base URL used by the frontend when calling backend endpoints.",
    )
    log_level: str = Field(default="info", description="Application log level.")


settings = Settings()
