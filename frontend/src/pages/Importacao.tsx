import { useState, useRef, useEffect } from 'react'
import { UploadCloud, File as FileIcon, X, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function Importacao() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any[]>(() => {
    const saved = sessionStorage.getItem('importacao_results')
    return saved ? JSON.parse(saved) : []
  })
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Persiste os resultados sempre que forem alterados
  useEffect(() => {
    sessionStorage.setItem('importacao_results', JSON.stringify(results))
  }, [results])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.name.toLowerCase().endsWith('.xml'))
    setFiles(prev => [...prev, ...droppedFiles])
  }

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(f => f.name.toLowerCase().endsWith('.xml'))
      setFiles(prev => [...prev, ...selected])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleProcess = async () => {
    if (files.length === 0) return
    setUploading(true)
    
    // Grab the active session JWT token for security
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    const formData = new FormData()
    files.forEach(f => formData.append('files', f))

    try {
      // Connect to the Python FastAPI backend
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/ingestion/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      const responseData = await res.json()
      if (!res.ok) throw new Error(responseData.detail || "Erro de conexão")
        
      setResults(responseData.data)
      setFiles([])
    } catch (err: any) {
      alert(`Falha ao conectar no Backend Python: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
         <div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Importação de Lotes NF-e</h2>
           <p className="text-sm text-corporate-silver/60 mt-1">
             Selecione múltiplos arquivos XML para estruturação via Motor Fiscal.
           </p>
         </div>
      </div>

      {!results.length ? (
        <div className="bg-[#16171C] border border-corporate-silver/10 rounded-xl p-8 shadow-2xl relative">
           <div 
             className="border-2 border-dashed border-corporate-silver/20 rounded-lg p-10 flex flex-col items-center justify-center bg-[#0F1014]/50 hover:bg-[#0F1014] hover:border-[#e68a00]/50 transition-colors cursor-pointer group"
             onDragOver={(e) => e.preventDefault()}
             onDrop={handleDrop}
             onClick={() => fileInputRef.current?.click()}
           >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <UploadCloud className="w-8 h-8 text-[#e68a00]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Arraste os arquivos XML aqui</h3>
              <p className="text-sm text-corporate-silver/50 text-center max-w-xs">
                Apenas documentos válidos no padrão modelo 55 (NF-e) do SEFAZ. Máximo 10MB por lote.
              </p>
              
              <input 
                type="file" 
                multiple 
                accept=".xml" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleSelect}
              />
           </div>

           {files.length > 0 && (
              <div className="mt-6 border-t border-corporate-silver/10 pt-6">
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                  <FileIcon className="w-4 h-4 text-corporate-silver/50"/> 
                  Fila de Processamento ({files.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                   {files.map((file, i) => (
                     <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded border border-white/5">
                        <span className="text-sm text-corporate-silver truncate max-w-xs">{file.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="p-1 hover:text-red-400 text-corporate-silver/50 transition-colors cursor-pointer">
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                   ))}
                </div>

                <div className="mt-6 flex justify-end">
                   <button 
                     onClick={handleProcess}
                     disabled={uploading}
                     className="bg-[#e68a00] hover:bg-[#ff9900] text-[#13141A] font-bold py-2.5 px-6 rounded shadow-[0_0_15px_rgba(230,138,0,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                   >
                     {uploading ? (
                       <div className="w-5 h-5 border-2 border-[#13141A]/30 border-t-[#13141A] rounded-full animate-spin"></div>
                     ) : (
                       <UploadCloud className="w-5 h-5" />
                     )}
                     {!uploading ? 'Iniciar Escaneamento' : 'Enviando ao Motor...'}
                   </button>
                </div>
              </div>
           )}
        </div>
      ) : (
        <div className="bg-[#16171C] border border-corporate-silver/10 rounded-xl p-6 shadow-2xl">
           <div className="flex items-center justify-between mb-6 pb-4 border-b border-corporate-silver/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5 text-green-500" />
                 Relatório de Ingestão e Cálculos Tributários ({results.length})
              </h3>
              <button 
                onClick={() => setResults([])} 
                className="text-xs uppercase tracking-widest font-bold text-[#e68a00] hover:text-white transition-colors cursor-pointer border border-[#e68a00]/30 px-3 py-1.5 rounded bg-[#e68a00]/5"
              >
                 Novo Lote
              </button>
           </div>
           
           <div className="grid gap-6">
              {results.map((res, i) => (
                 <div key={i} className="bg-[#13141A] border border-corporate-silver/5 rounded overflow-hidden">
                    <div className="p-4 flex gap-4 items-start">
                        {res.analysis.status === 'success' ? (
                           <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                           <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        )}
                        
                        <div className="flex-1">
                           <p className="text-sm font-bold text-white mb-1">{res.original_filename}</p>
                           {res.analysis.status === 'success' ? (
                              <div className="grid grid-cols-5 gap-y-2 mt-3 text-xs">
                                 <div>
                                   <div className="text-corporate-silver/60 uppercase tracking-widest whitespace-nowrap">NF Número</div>
                                   <div className="font-mono text-corporate-accent mt-0.5">{res.analysis.nf_number}</div>
                                 </div>
                                 <div className="col-span-2">
                                   <div className="text-corporate-silver/60 uppercase tracking-widest">Emitente</div>
                                   <div className="text-corporate-silver truncate pr-4 mt-0.5" title={res.analysis.issuer}>{res.analysis.issuer}</div>
                                 </div>
                                 <div>
                                   <div className="text-corporate-silver/60 uppercase tracking-widest">Valor T.</div>
                                   <div className="text-white font-bold mt-0.5">R$ {res.analysis.total_value.toFixed(2)}</div>
                                 </div>
                                 <div>
                                   <div className="text-corporate-silver/60 uppercase tracking-widest font-bold text-orange-500 whitespace-nowrap">ICMS ST Consolidado</div>
                                   <div className="text-white font-bold mt-0.5 bg-orange-500/10 px-2 py-0.5 rounded w-max border border-orange-500/20">
                                      R$ {res.analysis.tax_indicators.total_st_devido.toFixed(2)}
                                   </div>
                                 </div>
                              </div>
                           ) : (
                              <p className="text-sm text-red-400 mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                                {res.analysis.message}
                              </p>
                           )}
                        </div>
                    </div>
                    
                    {/* Item-by-item Table Expander */}
                    {res.analysis.status === 'success' && res.analysis.items && (
                       <div className="border-t border-corporate-silver/5 bg-[#16171C]">
                          <button 
                             onClick={() => setExpandedRow(expandedRow === i ? null : i)} 
                             className="w-full text-[11px] uppercase tracking-widest font-bold text-corporate-silver/60 hover:bg-white/5 transition-colors flex items-center justify-center p-2.5"
                          >
                             {expandedRow === i ? <ChevronUp className="w-4 h-4 mr-2"/> : <ChevronDown className="w-4 h-4 mr-2"/>}
                             {expandedRow === i ? 'Ocultar Matriz Fiscal' : `Ver Tabela CFOP/NCM (${res.analysis.items_count} itens)`}
                          </button>
                          
                          {expandedRow === i && (
                             <div className="p-4 pt-0 overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                                   <thead className="text-[10px] text-corporate-silver/50 uppercase tracking-wider border-b border-corporate-silver/10">
                                      <tr>
                                         <th className="py-3 px-2 font-semibold">Mercadoria</th>
                                         <th className="py-3 px-2 font-semibold">NCM</th>
                                         <th className="py-3 px-2 font-semibold">CFOP</th>
                                         <th className="py-3 px-2 font-semibold">Val. Original</th>
                                         <th className="py-3 px-2 font-semibold bg-orange-500/5 text-orange-500/70 border-l border-t border-orange-500/10 rounded-tl-md">Status Regra</th>
                                         <th className="py-3 px-2 font-semibold bg-orange-500/5 text-orange-500/70 border-t border-r border-orange-500/10 rounded-tr-md">ST Previsto</th>
                                      </tr>
                                   </thead>
                                   <tbody className="divide-y divide-corporate-silver/5 text-corporate-silver/90">
                                      {res.analysis.items.map((item: any, idx: number) => (
                                         <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="py-2.5 px-2 truncate max-w-[200px]" title={item.product.xProd}>{item.product.xProd}</td>
                                            <td className="py-2.5 px-2 font-mono text-corporate-silver/60">{item.product.ncm}</td>
                                            <td className="py-2.5 px-2 font-mono text-corporate-silver/60">{item.product.cfop}</td>
                                            <td className="py-2.5 px-2 font-medium">R$ {item.product.vProd.toFixed(2)}</td>
                                            
                                            <td className="py-2.5 px-2 bg-orange-500/5 border-l border-orange-500/5">
                                               {item.taxation.status === 'BLOCKED' ? (
                                                  <span className="text-red-400/80 font-normal uppercase text-[10px] tracking-wider" title={item.taxation.motivo}>Não Cadastrado</span>
                                               ) : (
                                                  <span className="text-green-500 font-normal uppercase text-[10px] tracking-wider">Homologado</span>
                                               )}
                                            </td>
                                            <td className="py-2.5 px-2 bg-orange-500/5 border-r border-orange-500/5 font-bold">
                                               {item.taxation.status === 'BLOCKED' ? (
                                                  <span className="text-corporate-silver/30">-</span>
                                               ) : (
                                                  <span className="text-orange-500">R$ {item.taxation.metricas.icms_st_devido.toFixed(2)}</span>
                                               )}
                                            </td>
                                         </tr>
                                      ))}
                                   </tbody>
                                </table>
                             </div>
                          )}
                       </div>
                    )}
                 </div>
              ))}
           </div>
        </div>
      )}
    </div>
  )
}
