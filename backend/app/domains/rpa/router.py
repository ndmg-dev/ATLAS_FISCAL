from fastapi import APIRouter
from pydantic import BaseModel
from app.domains.rpa.dae_generator import simulate_sefaz_access, generate_active_dae

router = APIRouter()

class DaePayload(BaseModel):
    cnpj: str
    valor: str
    nfe_number: str

@router.get("/teste-simulacao")
async def rpa_simulacao():
    result = await simulate_sefaz_access()
    return result

@router.post("/emitir-dae")
async def rpa_emitir_dae(payload: DaePayload):
    """
    Recebe os dados do Fronte tenta injetar/preencher ativamente no site alvo.
    """
    result = await generate_active_dae(
        cnpj=payload.cnpj, 
        valor=payload.valor, 
        nfe_number=payload.nfe_number
    )
    return result
