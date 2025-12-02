from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    JWT_SECRET: str = "supersecretkey"
    JWT_ALGORITHM: str = "HS256"
    CHUNK_INTERVAL: float = 1.0
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/transcribe"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
