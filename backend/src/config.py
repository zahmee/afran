from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "افران"
    DATABASE_URL: str = "sqlite+aiosqlite:///./afran.db"
    JWT_SECRET: str = "change-me-in-production-please"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480  # 8 hours
    CORS_ORIGINS: str = "http://localhost:4200"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
