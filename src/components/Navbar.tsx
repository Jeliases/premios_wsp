'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Vote, BarChart3, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const ADMIN_WHITELIST = [
  "j.luisestrada98@gmail.com", 
  "indira.cachay9@gmail.com",
  "thesoul986@gmail.com",
  "elviscocho1998op@gmail.com"
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_OUT') {
        router.push('/')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

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
  }

  const isAdmin = user && user.email && ADMIN_WHITELIST.includes(user.email);

  return (
    <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
        
        {/* LOGO CON GRADIENTE */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-yellow-500 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            <Trophy size={20} className="text-black fill-black" />
          </div>
          <span className="font-black text-xl tracking-tighter italic uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
            WSP<span className="text-yellow-500">AWARDS</span>
          </span>
        </Link>
        
 {/* LINKS CENTRALES - Responsive Inteligente */}
<div className="flex items-center gap-4 md:gap-8 font-black uppercase text-[10px] tracking-[0.2em]">
  <Link href="/votar" className="flex items-center gap-2 hover:text-yellow-500 transition-colors py-2">
    <Vote size={18} className="md:w-3.5 md:h-3.5" /> 
    <span className="hidden xs:inline">Votaciones</span>
  </Link>
  
  <Link href="/resultados" className="flex items-center gap-2 hover:text-yellow-500 transition-colors py-2 group">
    <div className="relative">
      <BarChart3 size={18} className="md:w-3.5 md:h-3.5" />
      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
    </div>
    <span className="hidden xs:inline">Resultados</span>
  </Link>
</div>

        {/* PERFIL / LOGIN */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="hidden sm:flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                >
                  <ShieldCheck size={12} />
                  Panel Admin
                </Link>
              )}

              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="hidden lg:block text-right">
                  <p className="text-[9px] text-yellow-500 font-black uppercase leading-none mb-1">
                    {isAdmin ? ' STAFF' : ' VOTANTE'}
                  </p>
                  <p className="text-[11px] font-bold text-white truncate max-w-[120px]">
                    {user.user_metadata.full_name || 'Usuario WSP'}
                  </p>
                </div>
                
                {/* Avatar o Icono */}
                {user.user_metadata.avatar_url ? (
                   <img src={user.user_metadata.avatar_url} className="w-9 h-9 rounded-full border border-white/10" alt="profile" />
                ) : (
                  <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center border border-white/10">
                    <UserIcon size={18} className="text-slate-400" />
                  </div>
                )}

                <button 
                  onClick={handleLogout}
                  className="bg-white/5 hover:bg-red-500/20 hover:text-red-500 p-2.5 rounded-xl border border-white/5 transition-all"
                  title="Cerrar Sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="bg-white text-black px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-xl active:scale-95"
            >
              Acceso Google
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}