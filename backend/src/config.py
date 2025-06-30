
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL : str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str 
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    SUPABASE_URL: str  
    SUPABASE_KEY: str
    
    # Admin-specific settings
    ADMIN_JWT_SECRET_KEY: str
    ADMIN_JWT_ALGORITHM: str  
    ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES: int 
    ADMIN_REFRESH_TOKEN_EXPIRE_DAYS: int 
    
    # Default admin credentials (for initial setup)
    DEFAULT_ADMIN_USERNAME: str  
    DEFAULT_ADMIN_EMAIL: str  
    DEFAULT_ADMIN_PASSWORD: str  
    DEFAULT_ADMIN_FULL_NAME: str  


    model_config = SettingsConfigDict(
        env_file = ".env",
        extra="ignore"
    )

Config = Settings()