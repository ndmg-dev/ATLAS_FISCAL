import { LayoutDashboard, FileText, LogOut, FileSearch, DollarSign, TerminalSquare } from 'lucide-react'
import { cn } from '../lib/utils'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

interface SidebarProps {
  currentPath: string;
}

export function Sidebar({ currentPath }: SidebarProps) {
  const menu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Importação NF-e', path: '/importacao' },
    { icon: DollarSign, label: 'Custos e Precificação', path: '/custos' },
    { icon: FileSearch, label: 'Auditoria ST', path: '/auditoria' },
    { icon: TerminalSquare, label: 'RPA Governo (DAE)', path: '/auto-sefaz' },
  ]

  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
         setUserProfile(data.user)
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <aside className="w-64 bg-[#0A0A0C] border-r border-corporate-silver/5 flex flex-col justify-between h-screen text-corporate-silver/80 font-medium shrink-0">
      
      <div>
        <div className="h-20 flex items-center px-6 mb-2 mt-2">
          <div className="flex items-center gap-3">
             {/* Logo placeholder */}
             <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded flex items-center justify-center transform -skew-x-12 shadow-md">
                <div className="w-4 h-1 bg-white ml-2 rounded-full absolute -ml-2 -mt-2 opacity-80" />
                <div className="w-6 h-1 bg-white ml-2 rounded-full absolute -ml-1 opacity-60" />
                <div className="w-8 h-1 bg-white ml-2 rounded-full absolute mt-2 opacity-40" />
             </div>
             
             <div className="flex flex-col">
               <h1 className="text-white font-bold text-[13px] tracking-wide leading-tight">
                 MENDONÇA GALVÃO
               </h1>
               <span className="text-[#e68a00] text-[10px] uppercase tracking-widest font-bold">Atlas Fiscal</span>
             </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {menu.map((item) => {
            const isActive = currentPath === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer overflow-hidden relative",
                  isActive 
                    ? "text-[#e68a00] bg-[#1a1308] border border-[#e68a00]/20 font-semibold" 
                    : "hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#e68a00] rounded-r-full" />
                )}
                
                <item.icon className={cn("w-5 h-5", isActive ? "text-[#e68a00]" : "text-corporate-silver/50")} />
                <span className="text-[13px]">{item.label}</span>
                
                {/* Right dot */}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#e68a00]"></div>}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-corporate-silver/5 bg-[#0F1014]">
        <div className="flex items-center p-3 rounded-xl border border-corporate-silver/5 bg-[#16171C]">
          {userProfile?.user_metadata?.avatar_url ? (
             <img src={userProfile.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full border border-[#e68a00]/20 shrink-0" />
          ) : (
             <div className="w-8 h-8 rounded-full bg-[#e68a00]/20 text-[#e68a00] flex items-center justify-center font-bold text-sm border border-[#e68a00]/10 shrink-0">
               MG
             </div>
          )}
          <div className="ml-3 flex-1 overflow-hidden">
             <p className="text-sm font-semibold text-white truncate leading-none mb-1">
                {userProfile?.user_metadata?.full_name || userProfile?.email?.split('@')[0] || "Fiscal User"}
             </p>
             <p className="text-[10px] text-[#e68a00] truncate tracking-widest font-bold uppercase">Administrador</p>
          </div>
          <button onClick={handleLogout} className="text-corporate-silver/40 hover:text-white transition-colors cursor-pointer p-2 shrink-0">
             <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
