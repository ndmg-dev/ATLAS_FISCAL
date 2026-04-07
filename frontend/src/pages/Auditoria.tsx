import { useEffect, useState } from 'react'
import { FileText, Database, Layers, Search, FileDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useClient } from '../contexts/ClientContext'

export function Auditoria() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { selectedClientCnpj } = useClient()

  useEffect(() => {
    async function fetchReports() {
      let query = supabase
        .from('fiscal_reports')
        .select('*, fiscal_items(count)')
        .order('created_at', { ascending: false })
      
      if (selectedClientCnpj) {
          query = query.eq('client_cnpj', selectedClientCnpj)
      }
        
      const { data, error } = await query
      
      if (!error && data) {
        setReports(data)
      }
      setLoading(false)
    }
    fetchReports()
  }, [])

  const downloadReport = (report: any) => {
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Auditoria_NF_${report.nf_number}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
         <div>
           <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
             <Database className="w-6 h-6 text-[#e68a00]" />
             Auditoria e Persistência
           </h2>
           <p className="text-sm text-corporate-silver/60 mt-1">
             Histórico imutável de todas as NF-es processadas pelo Motor Tributário sob o CNPJ da sua organização.
           </p>
         </div>
         
         <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-[#16171C] border border-corporate-silver/10 hover:border-corporate-silver/30 text-corporate-silver px-4 py-2 rounded transition-colors text-sm font-bold tracking-widest uppercase">
               <Search className="w-4 h-4" /> Buscar NF
            </button>
         </div>
      </div>

      <div className="bg-[#16171C] border border-corporate-silver/10 rounded-xl overflow-hidden shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-[#0F1014] text-corporate-silver/50 uppercase tracking-widest text-xs">
                  <tr>
                     <th className="py-4 px-6 font-semibold">Data de Ingestão</th>
                     <th className="py-4 px-6 font-semibold">Emitente Original</th>
                     <th className="py-4 px-6 font-semibold">Nº Documento</th>
                     <th className="py-4 px-6 font-semibold">Valor XML</th>
                     <th className="py-4 px-6 font-semibold text-orange-500">ICMS ST Consolidado</th>
                     <th className="py-4 px-6 font-semibold text-right">Ação</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-corporate-silver/5 text-corporate-silver">
                  {loading ? (
                     <tr>
                        <td colSpan={6} className="py-12 text-center text-corporate-silver/50">
                           Carregando Banco de Dados...
                        </td>
                     </tr>
                  ) : reports.length === 0 ? (
                     <tr>
                        <td colSpan={6} className="py-16 text-center">
                           <div className="flex flex-col items-center justify-center text-corporate-silver/50">
                              <Layers className="w-12 h-12 mb-4 opacity-20" />
                              <p>Nenhum relatório foi salvo no Banco de Dados.</p>
                              <p className="text-xs mt-1">Processe sua primeira NF-e.</p>
                           </div>
                        </td>
                     </tr>
                  ) : (
                     reports.map(report => (
                        <tr key={report.id} className="hover:bg-white/5 transition-colors group">
                           <td className="py-4 px-6 font-mono text-xs">
                              {new Date(report.created_at).toLocaleString('pt-BR')}
                           </td>
                           <td className="py-4 px-6 font-medium truncate max-w-[250px]" title={report.issuer}>
                              {report.issuer}
                           </td>
                           <td className="py-4 px-6 text-corporate-accent font-bold">
                              {report.nf_number}
                           </td>
                           <td className="py-4 px-6">
                              R$ {Number(report.total_value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                           </td>
                           <td className="py-4 px-6 font-bold text-orange-500 bg-orange-500/5">
                              R$ {Number(report.total_st).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                           </td>
                           <td className="py-4 px-6 text-right">
                              <button onClick={() => downloadReport(report)} className="text-corporate-silver/50 hover:text-white transition-colors p-2 cursor-pointer">
                                <FileDown className="w-5 h-5" />
                              </button>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  )
}
