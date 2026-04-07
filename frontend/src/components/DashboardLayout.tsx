import { Sidebar } from './Sidebar'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useClient } from '../contexts/ClientContext'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  
  // Format current date in Portuguese
  const hoje = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  })
  
  const cabecalhoFormatado = hoje.charAt(0).toUpperCase() + hoje.slice(1)
  
  const { selectedClientCnpj, setSelectedClientCnpj } = useClient()
  const [clients, setClients] = useState<{cnpj: string, name: string}[]>([])

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase.from('fiscal_reports').select('client_cnpj, client_name').not('client_cnpj', 'is', null)
      if (data) {
        const uniqueClients = new Map()
        data.forEach(item => {
           if (item.client_cnpj && item.client_cnpj !== "Unknown") {
               uniqueClients.set(item.client_cnpj, item.client_name)
           }
        })
        const clientList = Array.from(uniqueClients, ([cnpj, name]) => ({ cnpj, name }))
        setClients(clientList)
      }
    }
    fetchClients()
  }, [])


  return (
    <div className="flex min-h-screen bg-[#13141A] text-corporate-silver font-sans selection:bg-[#e68a00]/30 overflow-hidden">
      <Sidebar currentPath={location.pathname} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-br from-[#13141A] to-[#0A0A0C]">
        {/* Top Header */}
        <header className="h-24 border-b border-corporate-silver/5 flex items-center w-full px-8 shrink-0 relative">
           {/* Subtle glow underneath header */}
           <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e68a00]/10 to-transparent"></div>
           
           <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-white tracking-tight font-sans">Central de Operações</h2>
              <p className="text-[13px] text-corporate-silver/50 flex items-center gap-2 mt-1 font-medium">
                 Administrador (TI) • {cabecalhoFormatado}
              </p>
           </div>
           
           <div className="ml-auto flex items-center gap-4">
              {clients.length > 0 && (
                 <div className="flex flex-col items-end mr-4">
                    <span className="text-[10px] tracking-widest uppercase text-corporate-silver/40 font-bold mb-1">Visão de Cliente</span>
                    <select 
                        value={selectedClientCnpj || ''} 
                        onChange={(e) => setSelectedClientCnpj(e.target.value || null)}
                        className="bg-[#1C1D22] border border-corporate-silver/20 rounded px-3 py-1.5 text-[12px] font-bold text-white outline-none focus:border-[#e68a00] hover:border-[#e68a00]/50 transition-colors w-64 shadow-xl cursor-pointer"
                    >
                        <option value="">🏢 TODOS OS CLIENTES (GLOBAL)</option>
                        {clients.map(c => (
                        <option key={c.cnpj} value={c.cnpj}>{c.name} ({c.cnpj})</option>
                        ))}
                    </select>
                 </div>
              )}
              <div className="px-3 py-1.5 rounded-full border border-corporate-silver/10 bg-[#1C1D22] text-[11px] text-corporate-silver/70 tracking-widest font-mono flex items-center gap-2 shadow-inner">
                 SYS:<span className="text-green-500 font-bold uppercase">ONLINE</span> • v1.0
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 custom-scrollbar">
           <div className="w-full max-w-6xl mx-auto space-y-6">
             {children}
           </div>
        </div>
      </main>
    </div>
  )
}
