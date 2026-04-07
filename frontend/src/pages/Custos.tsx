import { useEffect, useState } from 'react'
import { DollarSign, Search, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useClient } from '../contexts/ClientContext'

export function Custos() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { selectedClientCnpj } = useClient()

  useEffect(() => {
    async function fetchItems() {
      // Puxa todos os itens salvos, faz o inner join pra respeitar o filtro de cliente
      let query = supabase
        .from('fiscal_items')
        .select(`
          id,
          product_name,
          ncm,
          cfop,
          original_value,
          st_calculated,
          status,
          fiscal_reports!inner (
            nf_number,
            issuer,
            client_cnpj
          )
        `)
        
      if (selectedClientCnpj) {
          query = query.eq('fiscal_reports.client_cnpj', selectedClientCnpj)
      }
      
      const { data, error } = await query.order('id', { ascending: false })
      
      if (error) {
         console.error("Erro fetch Custos:", error)
      }
      
      if (data) setItems(data)
      setLoading(false)
    }
    
    fetchItems()
  }, [])

  const exportToCSV = () => {
    if (!items || items.length === 0) return;
    
    let csv = "NOTA/EMITENTE,MERCADORIA,NCM,CFOP,VALOR NF-E,ST COBRADA,CUSTO EFETIVO FINAL\n";
    
    items.forEach((item) => {
        const nfSource = Array.isArray(item.fiscal_reports) ? item.fiscal_reports[0] : item.fiscal_reports;
        const nfNumber = nfSource?.nf_number || 'S/N';
        const issuer = (nfSource?.issuer || 'Desconhecido').replace(/,/g, '');
        const name = `"${item.product_name.replace(/"/g, '""')}"`;
        const ncm = item.ncm;
        const cfop = item.cfop;
        const valorBase = Number(item.original_value) || 0;
        const stValor = Number(item.st_calculated) || 0;
        const custoReal = valorBase + stValor;
        
        csv += `${nfNumber} - ${issuer},${name},${ncm},${cfop},${valorBase.toFixed(2)},${stValor.toFixed(2)},${custoReal.toFixed(2)}\n`;
    });
    
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Precificacao_Atlas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 shadow-inner">
          <DollarSign className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Estratégia de Custos e Precificação</h2>
          <p className="text-[13px] text-corporate-silver/50 font-medium">Impacto financeiro da Substituição Tributária convertido em Custo Real para prateleira.</p>
        </div>
      </div>

      <div className="bg-[#16171C] border border-corporate-silver/5 rounded-xl shadow-xl flex flex-col min-h-[60vh] overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-corporate-silver/5 bg-[#1a1b21] flex justify-between items-center shrink-0">
           <div className="flex bg-[#0F1014] border border-corporate-silver/10 rounded overflow-hidden shadow-inner w-72">
              <span className="pl-3 py-2 text-corporate-silver/40 flex items-center">
                 <Search className="w-4 h-4" />
              </span>
              <input type="text" placeholder="Filtrar mercadoria..." className="bg-transparent border-none text-[13px] w-full text-white placeholder:text-corporate-silver/30 outline-none px-3 font-medium" />
           </div>
           
           <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 border border-corporate-silver/10 rounded text-[11px] font-bold tracking-widest text-corporate-silver hover:text-white hover:bg-white/5 transition-colors uppercase cursor-pointer">
              <Filter className="w-3 h-3" /> Exportar Planilha
           </button>
        </div>

        {/* Custo Table */}
        <div className="flex-1 overflow-x-auto custom-scrollbar">
           <table className="w-full text-left text-[13px]">
              <thead className="bg-[#0A0A0C]/80 backdrop-blur-sm text-[10px] uppercase font-bold tracking-[0.15em] text-corporate-silver/40 border-b border-corporate-silver/5 sticky top-0 z-10 shadow-sm">
                 <tr>
                    <th className="px-6 py-4 font-bold">NOTA / EMITENTE</th>
                    <th className="px-6 py-4 font-bold">MERCADORIA (SKU)</th>
                    <th className="px-6 py-4 font-bold">VALOR NF-e (A)</th>
                    <th className="px-6 py-4 font-bold text-[#e68a00]">ST COBRADA (B)</th>
                    <th className="px-6 py-4 font-bold text-green-500 bg-green-500/5">CUSTO EFETIVO FINAL (A+B)</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-corporate-silver/5 font-medium">
                 {loading ? (
                    <tr>
                       <td colSpan={5} className="py-16 text-center text-corporate-silver/50">Carregando inteligência de custos...</td>
                    </tr>
                 ) : items.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="py-16 text-center text-corporate-silver/30">Nenhuma mercadoria com ICMS-ST detectada no banco.</td>
                    </tr>
                 ) : (
                    items.map((item, idx) => {
                       const valorBase = Number(item.original_value) || 0;
                       const stValor = Number(item.st_calculated) || 0;
                       const custoReal = valorBase + stValor;
                       const nfSource = Array.isArray(item.fiscal_reports) ? item.fiscal_reports[0] : item.fiscal_reports;
                       
                       return (
                          <tr key={idx} className="hover:bg-white/5 transition-colors group">
                             <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                   <span className="text-white font-bold text-[12px]">NF {nfSource?.nf_number}</span>
                                   <span className="text-[11px] text-corporate-silver/50 truncate max-w-[150px] font-semibold">{nfSource?.issuer}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex flex-col">
                                   <span className="text-corporate-silver/90 font-bold overflow-hidden text-ellipsis whitespace-nowrap max-w-[250px]">{item.product_name}</span>
                                   <div className="flex gap-2 mt-1">
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-corporate-silver/10 text-corporate-silver/60 font-mono tracking-wider">{item.ncm}</span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-corporate-silver/10 text-corporate-silver/60 font-mono tracking-wider">{item.cfop}</span>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-corporate-silver/70 font-mono">
                                R$ {valorBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap font-mono text-[#e68a00] font-bold group-hover:text-[#ff9900] transition-colors">
                                + R$ {stValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap font-mono text-green-400 font-bold bg-green-500/5 text-[14px]">
                                R$ {custoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                             </td>
                          </tr>
                       )
                    })
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  )
}
