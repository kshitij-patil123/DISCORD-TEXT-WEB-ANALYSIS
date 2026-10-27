import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Discord Text Web Analysis"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Base directory paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    DEMO_CSV_PATH: Path = DATA_DIR / "demo_discord_messages.csv"
    GAMES_CATALOG_PATH: Path = DATA_DIR / "games_catalog.json"
    SQLITE_DB_PATH: Path = DATA_DIR / "discord_analysis.db"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{SQLITE_DB_PATH.as_posix()}"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # Discord API Integration (Mode B) - Optional credentials
    DISCORD_BOT_TOKEN: str = os.getenv("DISCORD_BOT_TOKEN", "")
    DISCORD_GUILD_ID: str = os.getenv("DISCORD_GUILD_ID", "")
    DISCORD_CHANNEL_IDS: str = os.getenv("DISCORD_CHANNEL_IDS", "")
    
    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
