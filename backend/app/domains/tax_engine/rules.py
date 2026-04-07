# Em produção, esses dados viriam através de cache do Supabase.
from .scraper import NCMScraperGateway

MATRIZ_FISCAL_SEFAZ_BA = {
    # NCM Base: { Aliquota Interna Padrão, FCP, MVA Padrão }
    "39269090": {"aliq_interna": 20.5, "fcp": 2.0, "mva_original": 35.0},
    "21069090": {"aliq_interna": 19.5, "fcp": 0.0, "mva_original": 40.0},
    "85444200": {"aliq_interna": 20.5, "fcp": 0.0, "mva_original": 33.0},
    "00000000": {"aliq_interna": 18.0, "fcp": 0.0, "mva_original": 0.0}, # Mock genérico para testes limitados
}

async def consultar_regra_tributaria(ncm: str, cfop: str):
    # Base estruturada a 8 digitos
    base_ncm = str(ncm)[:8]
    regra = MATRIZ_FISCAL_SEFAZ_BA.get(base_ncm)
    
    if regra:
        return regra
        
    # FALLBACK WEBSCRAPING (Fase 5)
    # Se o NCM não for encontrado na Matriz local, o motor aciona o gateway web para checar a base da RFB
    scraping_result = await NCMScraperGateway.fetch_ncm_online(base_ncm)
    
    if scraping_result["status"] == "found":
        # Montar "Regra Heurística / Genérica" para liberar processamento da NF-e
        # com ICMS base estadual e MVA estimada para viabilizar demonstração.
        return {
            "aliq_interna": 20.5, 
            "fcp": 2.0, 
            "mva_original": 40.0,
            "scraped_desc": scraping_result["descricao"]
        }
        
    return None
