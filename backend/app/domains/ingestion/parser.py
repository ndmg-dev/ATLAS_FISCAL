import xml.etree.ElementTree as ET
from app.domains.tax_engine.calculator import MotorTributario

async def parse_nfe_xml(xml_content: bytes):
    try:
        root = ET.fromstring(xml_content)
        ns = {'ns': 'http://www.portalfiscal.inf.br/nfe'}
        
        infNFe = root.find('.//ns:infNFe', ns)
        if infNFe is None:
            infNFe = root.find('.//infNFe')
            ns = {'ns': ''} 
            if infNFe is None:
                raise ValueError("Tag infNFe não encontrada. XML não é uma NF-e válida.")
        
        ide = infNFe.find('./ns:ide', ns) or infNFe.find('./ide')
        emit = infNFe.find('./ns:emit', ns) or infNFe.find('./emit')
        total = infNFe.find('./ns:total', ns) or infNFe.find('./total')
        
        nNF = ide.find('ns:nNF', ns).text if ide.find('ns:nNF', ns) is not None else "Unknown"
        
        emit_name_node = emit.find('.//ns:xNome', ns) if emit is not None else None
        emit_name = emit_name_node.text if emit_name_node is not None else "Unknown"
        
        emit_cnpj_node = emit.find('.//ns:CNPJ', ns) if emit is not None else None
        emit_cnpj = emit_cnpj_node.text if emit_cnpj_node is not None else ""
        
        if emit_cnpj and len(emit_cnpj) == 14:
            emit_cnpj_fmt = f"{emit_cnpj[:2]}.{emit_cnpj[2:5]}.{emit_cnpj[5:8]}/{emit_cnpj[8:12]}-{emit_cnpj[12:]}"
            emit_full = f"{emit_cnpj_fmt} | {emit_name}"
        else:
            emit_full = emit_name
            
        dest = infNFe.find('./ns:dest', ns) or infNFe.find('./dest')
        dest_name_node = dest.find('.//ns:xNome', ns) if dest is not None else None
        dest_name = dest_name_node.text if dest_name_node is not None else "Unknown"
        
        dest_cnpj_node = dest.find('.//ns:CNPJ', ns) if dest is not None else None
        dest_cnpj = dest_cnpj_node.text if dest_cnpj_node is not None else "Unknown"
        if dest_cnpj != "Unknown" and len(dest_cnpj) == 14:
             dest_cnpj = f"{dest_cnpj[:2]}.{dest_cnpj[2:5]}.{dest_cnpj[5:8]}/{dest_cnpj[8:12]}-{dest_cnpj[12:]}"
        
        icms_tot = total.find('.//ns:ICMSTot', ns) or total.find('.//ICMSTot')
        vNF = icms_tot.find('./ns:vNF', ns).text if icms_tot is not None and icms_tot.find('./ns:vNF', ns) is not None else "0.00"

        det_nodes = infNFe.findall('.//ns:det', ns) or infNFe.findall('.//det')
        
        items_analysis = []
        items_st_found = 0
        total_st_calculado = 0.0
        
        for det in det_nodes:
            prod = det.find('./ns:prod', ns) or det.find('./prod')
            ncm = prod.find('ns:NCM', ns).text if prod is not None and prod.find('ns:NCM', ns) is not None else ""
            cfop = prod.find('ns:CFOP', ns).text if prod is not None and prod.find('ns:CFOP', ns) is not None else ""
            xprod = prod.find('ns:xProd', ns).text if prod is not None and prod.find('ns:xProd', ns) is not None else "MERCADORIA"
            vprod = prod.find('ns:vProd', ns).text if prod is not None and prod.find('ns:vProd', ns) is not None else "0.00"

            if str(cfop).startswith("54") or str(cfop).startswith("64"):
                items_st_found += 1
                
            # Buscar ICMS original cobrado (creditado) no documento
            imposto = det.find('./ns:imposto', ns) or det.find('./imposto')
            v_icms_origem = 0.0
            if imposto is not None:
                icms = imposto.find('./ns:ICMS', ns) or imposto.find('./ICMS')
                if icms is not None:
                    for child in list(icms):
                        vicms_node = child.find('./ns:vICMS', ns) or child.find('./vICMS')
                        if vicms_node is not None:
                            v_icms_origem = float(vicms_node.text)
                            break
            
            # Monta Payload para o Motor
            item_dto = {
                "ncm": str(ncm),
                "cfop": str(cfop),
                "xProd": str(xprod),
                "vProd": float(vprod),
                "vICMS_origem": v_icms_origem
            }
            
            # Calcula (agora async devido a possibilidade de webscraping online fallback)
            calc_result = await MotorTributario.calcular_impostos_item(item_dto)
            
            if calc_result["status"] == "CALCULATED":
                total_st_calculado += calc_result["metricas"]["icms_st_devido"]
                
            items_analysis.append({
                "product": item_dto,
                "taxation": calc_result
            })

        return {
            "status": "success",
            "nf_number": nNF,
            "issuer": emit_full,
            "client_cnpj": dest_cnpj,
            "client_name": dest_name,
            "total_value": float(vNF),
            "items_count": len(det_nodes),
            "tax_indicators": {
                "requires_st": items_st_found > 0,
                "st_items": items_st_found,
                "total_st_devido": round(total_st_calculado, 2)
            },
            "items": items_analysis
        }
    except Exception as e:
        return {"status": "error", "message": f"Erro estrutural no XML: {str(e)}"}
