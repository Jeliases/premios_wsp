'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Sparkles, Trophy } from 'lucide-react'

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState({ días: 0, horas: 0, min: 0, seg: 0 })

  useEffect(() => {
    // Ajustado a la fecha de la gala
    const galaDate = new Date('2026-12-31T20:00:00').getTime()
    
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = galaDate - now
      
      if (distance < 0) {
        clearInterval(interval)
        return
      }
      
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
    <div className="relative min-h-[calc(100vh-80px)] bg-black text-white flex flex-col items-center justify-center overflow-hidden">
      
      {/* MALLA DE FONDO (Grid sutil) */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#ffffff10 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <main className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        
        {/* ETIQUETA SUPERIOR */}
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 px-5 py-2 rounded-full mb-10 backdrop-blur-sm">
          <Sparkles size={16} className="text-yellow-500 animate-pulse" />
          <span className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.4em]">The 2026 Experience</span>
        </div>

        {/* TÍTULO PRINCIPAL CON MÁSCARA DE GRADIENTE */}
        <div className="relative mb-12">
          <h1 className="text-6xl md:text-[140px] font-black italic uppercase tracking-tighter leading-[0.8] drop-shadow-2xl">
            PREMIOS <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-800 drop-shadow-none">
              WSP GALA
            </span>
          </h1>
          <Trophy className="absolute -top-10 -right-10 text-yellow-500/20 -rotate-12 hidden md:block" size={120} />
        </div>

        {/* CONTADOR TIPO TABLERO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full mb-20 px-4">
          {Object.entries(timeLeft).map(([label, value]) => (
            <div key={label} className="group relative">
              <div className="absolute inset-0 bg-yellow-500/5 blur-xl group-hover:bg-yellow-500/10 transition-all" />
              <div className="relative bg-slate-900/40 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
                <div className="text-5xl md:text-6xl font-black italic tracking-tighter text-white">
                  {String(value).padStart(2, '0')}
                </div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-slate-500 mt-3 font-black">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTÓN DE ACCIÓN CALIBRE PREMIO */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
          <Link 
            href="/votar" 
            className="relative bg-white text-black px-14 py-7 rounded-full font-black uppercase tracking-[0.25em] text-xs hover:bg-yellow-500 transition-all flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-95"
          >
            Comenzar Votación
            <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </div>

      </main>

      {/* GRADIENTES DE AMBIENTACIÓN */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-yellow-600/10 blur-[150px] rounded-full opacity-40" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

    </div>
  )
}