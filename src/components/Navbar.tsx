'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Vote, BarChart3, LogOut, User as UserIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // 1. Verificar si hay usuario al cargar la página
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // 2. Escuchar cambios en la sesión (Login/Logout)
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
        queryParams: {
          prompt: 'select_account',
        },
        redirectTo: window.location.origin
      }
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
        
        {/* LOGO CON EFECTO GALA */}
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
              {/* PUNTO DE "EN VIVO" PARA RESULTADOS */}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            Resultados
          </Link>
        </div>

        {/* BOTÓN DE ACCIÓN DINÁMICO */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] text-slate-500 font-black uppercase">Bienvenido</p>
                <p className="text-xs font-bold text-white truncate max-w-[100px]">
                  {user.user_metadata.full_name || user.email?.split('@')[0]}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-slate-900 hover:bg-red-900/20 hover:text-red-500 p-2.5 rounded-full border border-slate-800 transition-all"
                title="Cerrar Sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-yellow-500/40 active:scale-95"
            >
              Iniciar Sesión
            </button>
          )}
        </div>

      </div>
    </nav>
  )
}