import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Importacao } from './pages/Importacao'
import { Auditoria } from './pages/Auditoria'
import { Custos } from './pages/Custos'
import { Rpa } from './pages/Rpa'
import { DashboardLayout } from './components/DashboardLayout'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { ClientProvider } from './contexts/ClientContext'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="min-h-screen bg-[#0F1014]" />

  const isAuthenticatedAndAuthorized = () => {
    if (!session) return false
    const email = session.user.email || ""
    // Enforces the mendoncagalvao.com.br domain constraint
    // For local dev, you might temporarily want to allow your own email if no @mendoncagalvao.com.br email exists yet
    if (!email.endsWith('@mendoncagalvao.com.br')) {
      return false
    }
    return true
  }

  return (
    <ClientProvider>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticatedAndAuthorized() ? <Login /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={
              isAuthenticatedAndAuthorized() ? (
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/importacao" 
            element={
              isAuthenticatedAndAuthorized() ? (
                <DashboardLayout>
                  <Importacao />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/auditoria" 
            element={
              isAuthenticatedAndAuthorized() ? (
                <DashboardLayout>
                  <Auditoria />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/custos" 
            element={
              isAuthenticatedAndAuthorized() ? (
                <DashboardLayout>
                  <Custos />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/auto-sefaz" 
            element={
              isAuthenticatedAndAuthorized() ? (
                <DashboardLayout>
                  <Rpa />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/:module" 
            element={
              isAuthenticatedAndAuthorized() ? (
                <DashboardLayout>
                  <div className="flex h-64 items-center justify-center border border-corporate-silver/10 bg-[#16171C] rounded-xl text-corporate-silver/50 font-bold tracking-widest uppercase shadow-inner">
                     Módulo em Desenvolvimento na Fase 2
                  </div>
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ClientProvider>
  )
}

export default App
