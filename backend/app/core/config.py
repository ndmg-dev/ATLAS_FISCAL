from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Atlas Fiscal"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    
    # Supabase credentials (to be set in environment variables)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    VITE_SUPABASE_URL: str = ""
    VITE_SUPABASE_ANON_KEY: str = ""

    @property
    def get_supabase_url(self) -> str:
        return self.SUPABASE_URL or self.VITE_SUPABASE_URL
        
    @property
    def get_supabase_key(self) -> str:
        return self.SUPABASE_KEY or self.VITE_SUPABASE_ANON_KEY

    class Config:
        env_file = ".env"

settings = Settings()
