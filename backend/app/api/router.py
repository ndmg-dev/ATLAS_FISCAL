from fastapi import APIRouter
from app.domains.ingestion.router import router as ingestion_router
from app.domains.rpa.router import router as rpa_router

api_router = APIRouter()

# Register core bounded contexts
api_router.include_router(ingestion_router, prefix="/ingestion", tags=["Ingestion & NFe"])
api_router.include_router(rpa_router, prefix="/rpa", tags=["Robotic Process Automation"])
