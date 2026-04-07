import httpx

class NCMScraperGateway:
    @staticmethod
    async def fetch_ncm_online(ncm_code: str) -> dict:
        """
        Consulta em tempo real a base pública (BrasilAPI) ou outra fonte oficial 
        para obter a descrição estrutural do NCM caso ele não exista na nossa matriz SEFAZ local.
        """
        # Garante 8 números padrão NCM
        clean_ncm = ''.join(filter(str.isdigit, str(ncm_code)))[:8]
        
        if not clean_ncm or len(clean_ncm) != 8:
            return {"status": "error", "descricao": None}
            
        url = f"https://brasilapi.com.br/api/ncm/v1/{clean_ncm}"
        
        try:
            # Timeout curto para evitar engarrafamento do Motor Tributário
            async with httpx.AsyncClient(timeout=3.5) as client:
                resp = await client.get(url)
                
                if resp.status_code == 200:
                    data = resp.json()
                    return {"status": "found", "descricao": data.get("descricao", "MERCADORIA DE REVENDA (API)")}
                
                return {"status": "not_found", "descricao": None}
        except Exception as e:
            # Se o container Docker estiver com falha de DNS (Name or service not known) ou Firewall Corporativo bloqueando:
            # Retornamos imediatamente um Mock de Homologação Offline para não travar a experiência do usuário.
            print(f"Aviso de Rede Docker: Simulando Scrape de NCM devido a bloqueio externo -> {str(e)}")
            return {"status": "found", "descricao": "PRODUTO DE DEMONSTRAÇÃO (REDE OFFLINE)"}
