from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "File Grave API"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Redis Queue
    REDIS_URL: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")
    REDIS_QUEUE_NAME: str = "filegrave:queue"
    
    # Ephemeral Storage & Limits
    UPLOAD_DIR: str = "/tmp/filegrave/uploads"
    OUTPUT_DIR: str = "/tmp/filegrave/outputs"
    FILE_TTL_SECONDS: int = 1800  # 30 minutes hard TTL (§8.1, §9)
    
    # Max upload sizes in bytes
    MAX_IMAGE_SIZE_BYTES: int = 25 * 1024 * 1024       # 25 MB
    MAX_DOCUMENT_SIZE_BYTES: int = 50 * 1024 * 1024    # 50 MB
    MAX_AUDIO_SIZE_BYTES: int = 100 * 1024 * 1024      # 100 MB
    MAX_VIDEO_SIZE_BYTES: int = 500 * 1024 * 1024      # 500 MB

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
