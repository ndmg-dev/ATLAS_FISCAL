from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from typing import List
from app.core.deps import get_current_user, get_supabase_client, get_authenticated_client
from .parser import parse_nfe_xml

router = APIRouter()

@router.post("/upload")
async def upload_invoices(
    files: List[UploadFile] = File(...),
    user = Depends(get_current_user),
    supabase = Depends(get_authenticated_client)
):
    results = []
    
    user_id = user.id if hasattr(user, 'id') else user.get('id')
    
    # 1. Puxar tenant do usuario que fará Carga de Lotes
    org_lookup = supabase.table('user_roles').select('organization_id').eq('user_id', user_id).execute()
    if not org_lookup.data:
        # (Auto-Provisionamento de Tenant) Se o usuário for novo e não passou por Onboarding RH:
        # Cria uma organização pessoal para ele conseguir testar o sistema.
        user_email = user.email if hasattr(user, 'email') else user.get('email', 'user')
        dummy_cnpj = f"00000000000{str(user_id.replace('-', ''))[:3]}"
        
        try:
            org_insert = supabase.table('organizations').insert({
                "name": f"Meu Workspace ({user_email})",
                "cnpj": dummy_cnpj
            }).execute()
            
            if org_insert.data:
                organization_id = org_insert.data[0]['id']
                supabase.table('user_roles').insert({
                    "user_id": user_id,
                    "organization_id": organization_id,
                    "role": "admin"
                }).execute()
            else:
                organization_id = None
        except Exception as e:
            # Tolerância a falha RLS: Permite que Motor Processe no modo Read-Only
            print(f"Cuidado: Banco RLS bloqueou auto-provisionamento -> {str(e)}")
            organization_id = None
    else:
        organization_id = org_lookup.data[0]['organization_id']
    
    for file in files:
        contents = await file.read()
        parsed = await parse_nfe_xml(contents)
        
        # 2. Persistir no Banco se os cálculos deram certo via Python
        if parsed["status"] == "success" and organization_id:
            try:
                report_data = {
                    "organization_id": organization_id,
                    "user_id": user_id,
                    "original_filename": file.filename,
                    "nf_number": parsed.get("nf_number"),
                    "issuer": parsed.get("issuer"),
                    "client_cnpj": parsed.get("client_cnpj"),
                    "client_name": parsed.get("client_name"),
                    "total_value": parsed.get("total_value", 0.0),
                    "total_st": parsed.get("tax_indicators", {}).get("total_st_devido", 0.0),
                    "items_count": parsed.get("items_count", 0)
                }
                
                # Insere relatório mestre
                resp = supabase.table('fiscal_reports').insert(report_data).execute()
                if resp.data:
                    report_id = resp.data[0]['id']
                    
                    # Insere itens filhos atrelados à nota originadora
                    items_payload = []
                    for item in parsed.get("items", []):
                        items_payload.append({
                            "report_id": report_id,
                            "ncm": getattr(item["product"], "ncm", item["product"]["ncm"]),
                            "cfop": item["product"]["cfop"],
                            "product_name": item["product"]["xProd"],
                            "original_value": item["product"]["vProd"],
                            "st_calculated": item["taxation"]["metricas"]["icms_st_devido"] if item["taxation"].get("metricas") else 0.0,
                            "status": item["taxation"]["status"]
                        })
                    
                    if items_payload:
                        supabase.table('fiscal_items').insert(items_payload).execute()
            except Exception as e:
                # Logamos o erro de persistência, mas NÃO derrubamos a sessão do usuário.
                # Ele poderá ver os cálculos na tela normalmente.
                print(f"Aviso de Data Warehouse: Falha ao persistir relatório no Supabase -> {str(e)}")
        
        results.append({
            "original_filename": file.filename,
            "analysis": parsed
        })
        
    return {
        "batch_status": "PROCESSED", 
        "user_actor": user.email if hasattr(user, 'email') else user.get('email', 'unknown'),
        "data": results
    }
