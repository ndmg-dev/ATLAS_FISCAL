import { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, Users, AlertCircle, TrendingUp, History } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function Dashboard() {
  const [metrics, setMetrics] = useState({
    processadas: 0,
    total_st: 0,
    arquivos_rejeitados: 0
  })

  useEffect(() => {
    async function getStats() {
      const { data } = await supabase.from('fiscal_reports').select('id, total_st')
      if (data) {
        setMetrics({
          processadas: data.length,
          total_st: data.reduce((acc, curr) => acc + Number(curr.total_st), 0),
          arquivos_rejeitados: 0
        })
      }
    }
    getStats()
  }, [])

  const stats = [
    { label: 'PENDENTES', value: '0', icon: Clock, color: 'text-orange-500' },
    { label: 'APROVADAS', value: String(metrics.processadas), icon: CheckCircle, color: 'text-green-500' },
    { label: 'REJEITADAS', value: String(metrics.arquivos_rejeitados), icon: XCircle, color: 'text-red-500' },
    { label: 'SEM VALIDAÇÃO', value: '0', icon: Users, color: 'text-corporate-silver' },
    { label: 'ST CALCULADA', value: `R$ ${metrics.total_st.toLocaleString('pt-BR', {maximumFractionDigits: 0})}`, icon: AlertCircle, color: 'text-orange-500' },
  ]

  const occupation = [
    { tag: 'XML', name: 'Leitura de Notas (Entrada)', value: '0/0', pct: '0%', iconBg: 'bg-blue-500/20', iconText: 'text-blue-500' },
    { tag: 'ST', name: 'Substituição Tributária', value: '0/0', pct: '0%', iconBg: 'bg-[#e68a00]/20', iconText: 'text-[#e68a00]' },
    { tag: 'DIFAL', name: 'Cálculo de Diferencial', value: '0/0', pct: '0%', iconBg: 'bg-green-500/20', iconText: 'text-green-500' },
    { tag: 'DAE', name: 'Geração de Guias', value: '0/0', pct: '0%', iconBg: 'bg-purple-500/20', iconText: 'text-purple-500' },
    { tag: 'SYS', name: 'Processos Auxiliares', value: '0/4', pct: '0%', iconBg: 'bg-corporate-silver/20', iconText: 'text-corporate-silver' },
  ]

  return (
    <div className="animate-in fade-in duration-500">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#16171C] border border-corporate-silver/5 rounded-xl p-5 flex flex-col justify-center gap-2 hover:border-corporate-silver/10 transition-colors shadow-lg relative overflow-hidden group">
            {/* Subtle top edge highlight */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
            <h3 className="text-3xl font-bold text-white leading-none tracking-tight">{stat.value}</h3>
            <p className="text-[11px] text-corporate-silver/50 uppercase tracking-widest font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
