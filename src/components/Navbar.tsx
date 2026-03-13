'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Vote, BarChart3, LogOut, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

// 1. LISTA OFICIAL DE ADMINISTRADORES
const ADMIN_WHITELIST = [
  "j.luisestrada98@gmail.com", 
  "indira.cachay9@gmail.com",
  "thesoul986@gmail.com",
  "elviscocho1998op@gmail.com"
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Verificar si hay usuario al cargar la página
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // Escuchar cambios en la sesión
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: { prompt: 'select_account' },
        redirectTo: window.location.origin
      }
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  // Verificar si el usuario actual es admin
  const isAdmin = user && user.email && ADMIN_WHITELIST.includes(user.email);

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 text-yellow-500 font-black text-xl hover:scale-105 transition-all group">
          <Trophy size={28} className="group-hover:rotate-12 transition-transform" />
          <span className="tracking-tighter italic uppercase">Premios WSP</span>
        </Link>
        
        {/* LINKS DE NAVEGACIÓN */}
        <div className="hidden md:flex gap-10 font-bold uppercase text-sm tracking-widest">
          <Link href="/votar" className="flex items-center gap-2 hover:text-yellow-500 transition-colors">
            <Vote size={18} /> Votar
          </Link>
          <Link href="/resultados" className="flex items-center gap-2 hover:text-yellow-500 transition-colors group">
            <div className="relative">
              <BarChart3 size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            Resultados
          </Link>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              
              {/* BOTÓN ADMIN */}
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all group"
                >
                  <ShieldCheck size={14} className="group-hover:scale-110 transition-transform" />
                  Admin Panel
                </Link>
              )}

              <div className="hidden sm:block text-right border-l border-slate-800 pl-4">
                <p className="text-[10px] text-slate-500 font-black uppercase">
                  {isAdmin ? 'Organizador' : 'Votante'}
                </p>
                <p className="text-xs font-bold text-white truncate max-w-[100px]">
                  {user.user_metadata.full_name || user.email?.split('@')[0]}
                </p>
              </div>

              <button 
                onClick={handleLogout}
                className="bg-slate-900 hover:bg-red-900/20 hover:text-red-500 p-2.5 rounded-full border border-slate-800 transition-all shadow-lg"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-95"
            >
              Iniciar Sesión
            </button>
          )}
        </div>

      </div>
    </nav>
  )
}