from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    jwt_secret: str = ""  # No longer used — Supabase now uses ES256 asymmetric keys
    allowed_origins: str = "http://localhost:3000"
    openai_api: str = ""  # Can also set OPENAI_API_KEY as alias

    @property
    def openai_api_key(self) -> str:
        return self.openai_api

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()
