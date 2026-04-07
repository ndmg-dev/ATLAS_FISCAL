from .rules import consultar_regra_tributaria

class MotorTributario:
    @staticmethod
    async def calcular_impostos_item(detalhes_item: dict):
        ncm = detalhes_item.get("ncm", "")
        cfop = detalhes_item.get("cfop", "")
        valor_produto = detalhes_item.get("vProd", 0.0)
        v_icms_origem = detalhes_item.get("vICMS_origem", 0.0)

        # 1. Ponto de Restrição Estrutural
        # Exige que todo NCM exista mapeado nas tabelas do sistema antes de processar.
        regra = await consultar_regra_tributaria(ncm, cfop)
        
        if not regra:
            return {
                "status": "BLOCKED",
                "motivo": f"NCM {ncm} não possui alíquotas/MVA validadas na tabela SEFAZ.",
                "metricas": None
            }
        
        aliq_interna = regra["aliq_interna"]
        mva = regra["mva_original"]
        fcp = regra["fcp"]
        
        # 2. Lógica Básica de Substituição Tributária / ICMS Antecipação Parcial
        # Aumentamos o valor da mercadoria (vProd) utilizando a MVA presumida
        base_calculo_st = valor_produto * (1 + (mva / 100))
        
        # O FCP (Combate a Pobreza) geralmente incide sobre a Base de ST multiplicada pela Taxa FCP
        fcp_devido = base_calculo_st * (fcp / 100)
        
        # Desconto de crédito (ICMS Interestadual da nota original) do valor total estimado à alíquota interna
        icms_estimado_destino = base_calculo_st * (aliq_interna / 100)
        icms_st_devido = (icms_estimado_destino - v_icms_origem) + fcp_devido
        
        return {
            "status": "CALCULATED",
            "motivo": "Homologado via Scraper Receita" if "scraped_desc" in regra else "OK",
            "metricas": {
                 "aliquota_interna_aplicada": aliq_interna,
                 "mva_aplicado": mva,
                 "base_calculo_st": round(base_calculo_st, 2),
                 "icms_st_devido": round(max(icms_st_devido, 0), 2),
                 "fcp_devido": round(fcp_devido, 2),
                 "scraped_desc": regra.get("scraped_desc")
            }
        }
