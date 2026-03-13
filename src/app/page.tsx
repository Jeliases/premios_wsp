'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Trophy, 
  ChevronRight, 
  Sparkles, 
  Settings, 
  LogOut,
  Vote,
  BarChart3
} from 'lucide-react'

const ADMIN_WHITELIST = [
  "j.luisestrada98@gmail.com", 
  "indira.cachay9@gmail.com",
  "thesoul986@gmail.com"
];

export default function LandingPage() {
  const [user, setUser] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState({ días: 0, horas: 0, min: 0, seg: 0 })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    const galaDate = new Date('2026-12-31T20:00:00').getTime()
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = galaDate - now
      if (distance < 0) return clearInterval(interval)
      
      setTimeLeft({
        días: Math.floor(distance / (1000 * 60 * 60 * 24)),
        horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        min: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seg: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black">
      
      {/* NAVBAR: Aquí es donde el botón debe vivir para no verse mal */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
            <Trophy size={18} className="text-black" />
          </div>
          <span className="font-black uppercase tracking-tighter text-xl italic">WSP<span className="text-yellow-500">AWARDS</span></span>
        </div>

        <div className="flex items-center gap-6">
          {/* BOTÓN DE ADMIN CON TU ESTILO ORIGINAL */}
          {user && ADMIN_WHITELIST.includes(user.email) && (
            <Link 
              href="/admin"
              className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all flex items-center gap-2 shadow-xl"
            >
              <Settings size={14} /> Admin Panel
            </Link>
          )}
          
          <Link href="/votar" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center gap-2">
            <Vote size={14} /> Votar
          </Link>
          
          {user && (
            <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="text-slate-500 hover:text-white">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </nav>

      {/* CONTENIDO HERO */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-20 px-6 text-center">
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full mb-8 animate-pulse">
          <Sparkles size={16} className="text-yellow-500" />
          <span className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em]">Evento Oficial 2026</span>
        </div>

        <h1 className="text-7xl md:text-[120px] font-black italic uppercase tracking-tighter leading-[0.85] mb-12">
          PREMIOS <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700">WSP GALA</span>
        </h1>

        {/* CONTADOR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full mb-16">
          {Object.entries(timeLeft).map(([label, value]) => (
            <div key={label} className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-md">
              <div className="text-5xl font-black italic">{String(value).padStart(2, '0')}</div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-slate-500 mt-2 font-black">{label}</div>
            </div>
          ))}
        </div>

        <Link 
          href="/votar" 
          className="group bg-white text-black px-12 py-6 rounded-full font-black uppercase tracking-[0.2em] hover:bg-yellow-500 transition-all flex items-center gap-3 shadow-2xl active:scale-95"
        >
          Ingresar a votaciones 
          <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
        </Link>
      </main>

      {/* FONDO DECORATIVO */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-yellow-600/10 blur-[180px] rounded-full opacity-50" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>
    </div>
  )
}