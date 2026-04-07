from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from app.core.config import settings

security = HTTPBearer()

# Supabase Client singleton for backend verification
def get_supabase_client() -> Client:
    # If SUPABASE_URL is missing, we use a mock for local unconfigured development to prevent crash
    url = settings.get_supabase_url or 'https://mock.supabase.co'
    key = settings.get_supabase_key or 'mock-key'
    return create_client(url, key)

async def get_authenticated_client(credentials: HTTPAuthorizationCredentials = Security(security)) -> Client:
    token = credentials.credentials
    client = get_supabase_client()
    # Inject user JWT to execute Postgres requests organically instead of Anonymous
    client.postgrest.auth(token)
    return client

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not settings.get_supabase_url:
        # Bypass for local dev if supabase is not yet configured
        return {"email": "dev@mendoncagalvao.com.br", "id": "mock-dev"}
        
    supabase = get_supabase_client()
    try:
        res = supabase.auth.get_user(token)
        if not res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido ou expirado",
            )
        return res.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Falha de autenticação: {str(e)}",
        )
