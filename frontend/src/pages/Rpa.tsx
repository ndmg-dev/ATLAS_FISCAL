import { useState, useEffect } from 'react'
import { TerminalSquare, RefreshCw, Server, Globe2, Camera } from 'lucide-react'
import { useClient } from '../contexts/ClientContext'

export function Rpa() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [cnpj, setCnpj] = useState("09.300.999/0001-20")
  const [valor, setValor] = useState("R$ 350,91")
  const [nfe, setNfe] = useState("80967")

  const { selectedClientCnpj } = useClient()

  useEffect(() => {
     if (selectedClientCnpj) {
        setCnpj(selectedClientCnpj)
     }
  }, [selectedClientCnpj])

  const testRpaRobot = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch("http://localhost:8000/api/v1/rpa/emitir-dae", {
         method: "POST",
         headers: {"Content-Type": "application/json"},
         body: JSON.stringify({
            cnpj: cnpj,
            valor: valor,
            nfe_number: nfe
         })
      })
      
      if (!response.ok) {
         throw new Error(`Servidor retornou status ${response.status}`)
      }
      const data = await response.json()
      if (data.status === 'success') {
         setResult(data)
      } else {
         setError(data.message || "Erro desconhecido durante execução.")
      }
    } catch (err: any) {
      setError(err.message || "Falha de conexão com o motor Playwright.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#e68a00]/10 rounded-lg border border-[#e68a00]/20 shadow-inner">
          <TerminalSquare className="w-6 h-6 text-[#e68a00]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Orquestrador Inteligente (DAE e SEFAZ BA)</h2>
          <p className="text-[13px] text-corporate-silver/50 font-medium">Preenchimento Ativo. Assumindo braços robóticos ao redor dos bloqueios e Captchas.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
         {/* Painel de Controle */}
         <div className="col-span-1 bg-[#16171C] border border-corporate-silver/5 rounded-xl shadow-xl flex flex-col min-h-[65vh] overflow-hidden">
            <div className="p-5 border-b border-corporate-silver/5 bg-[#1a1b21]">
               <h3 className="text-[13px] font-bold tracking-widest text-corporate-silver/60 uppercase flex items-center gap-2">
                  <Server className="w-4 h-4" /> Parâmetros de Emissão
               </h3>
            </div>
            <div className="p-6 flex-1 flex flex-col">
               <p className="text-sm text-corporate-silver/70 leading-relaxed mb-6">
                  Insira o Documento e a Carga Estipulada. O Orquestrador se materializará de forma imperativa (Headless) sobre a página oficial instanciando blocos preenchidos do DAE.
               </p>

               <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-corporate-silver/40 px-1 mb-1 block">DOCUMENTO CNPJ (ALVO)</label>
                    <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="w-full bg-[#0F1014] text-white text-[13px] px-3 py-3 rounded border border-corporate-silver/10 outline-none focus:border-[#e68a00]/50" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-corporate-silver/40 px-1 mb-1 block">NOTA REFERÊNCIA (XML)</label>
                    <input type="text" value={nfe} onChange={(e) => setNfe(e.target.value)} className="w-full bg-[#0F1014] text-white text-[13px] px-3 py-3 rounded border border-corporate-silver/10 outline-none focus:border-[#e68a00]/50" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-corporate-silver/40 px-1 mb-1 block">CARGA / ICMS-ST DEVIDO</label>
                    <input type="text" value={valor} onChange={(e) => setValor(e.target.value)} className="w-full bg-[#0F1014] text-[#e68a00] font-bold text-[14px] px-3 py-3 rounded border border-corporate-silver/10 outline-none focus:border-[#e68a00]/50" />
                  </div>
               </div>

               <button 
                 onClick={testRpaRobot}
                 disabled={loading}
                 className="mt-auto w-full flex items-center justify-center gap-3 bg-[#e68a00] hover:bg-[#ff9900] text-black font-bold text-[13px] uppercase tracking-wide px-4 py-4 rounded-lg transition-colors shadow-lg disabled:opacity-50"
               >
                 {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Globe2 className="w-5 h-5" />}
                 {loading ? "Injetando Matriz Base..." : "Preencher Formulário DAE"}
               </button>
            </div>
         </div>

         {/* Monitor de Saída Visual */}
         <div className="col-span-2 bg-[#0F1014] border border-corporate-silver/10 rounded-xl shadow-inner flex flex-col overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 flex gap-2">
               <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 text-[10px] font-bold text-corporate-silver/40 tracking-wider font-mono">
                  <div className={`w-2 h-2 rounded-full ${loading ? 'bg-orange-500 animate-pulse' : result ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  STATUS DA CONEXÃO
               </span>
            </div>

            {loading ? (
               <div className="flex-1 flex flex-col items-center justify-center text-[#e68a00]">
                  <div className="relative w-16 h-16 mb-4">
                     <div className="absolute inset-0 border-4 border-[#e68a00]/20 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-[#e68a00] rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <h4 className="font-bold tracking-widest uppercase text-sm mb-1">Criptografando Túnel HTTP...</h4>
                  <p className="text-xs font-mono text-corporate-silver/60">Abrindo Puppeteer/Playwright Headless</p>
               </div>
            ) : error ? (
               <div className="flex-1 flex flex-col items-center justify-center text-red-400 p-10 text-center">
                  <Server className="w-12 h-12 mb-4 opacity-50" />
                  <h4 className="font-bold tracking-widest uppercase text-sm mb-2">Falha na Simulação</h4>
                  <p className="text-xs font-mono text- корпораative-silver/60 bg-red-950/30 p-4 rounded border border-red-500/20">{error}</p>
               </div>
            ) : result ? (
               <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-corporate-silver/5 flex items-center justify-between bg-black/20">
                     <div className="flex items-center gap-2 text-green-500">
                        <Camera className="w-5 h-5" />
                        <span className="text-xs font-bold font-mono">Captura Bem-Sucedida: {result.url_accessed}</span>
                     </div>
                  </div>
                  <div className="flex-1 p-4 overflow-auto">
                     <img 
                        src={`data:image/png;base64,${result.image_base64}`} 
                        alt="Screenshot SEFAZ" 
                        className="w-full h-auto rounded border border-corporate-silver/10 shadow-2xl"
                     />
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex items-center justify-center text-corporate-silver/20">
                  <TerminalSquare className="w-24 h-24 stroke-[0.5]" />
               </div>
            )}
         </div>
      </div>
    </div>
  )
}
