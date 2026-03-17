'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Sparkles, Trophy, Settings, PlayCircle } from 'lucide-react'

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState({ días: 0, horas: 0, min: 0, seg: 0 })

 useEffect(() => {

  const galaDate = new Date('2026-03-29T00:00:00').getTime()

  const interval = setInterval(() => {
    const now = new Date().getTime()
    const distance = galaDate - now

    if (distance < 0) {
      clearInterval(interval)
      setTimeLeft({ días: 0, horas: 0, min: 0, seg: 0 })
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
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* MALLA DE FONDO ESTRATÉGICA */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#ffffff15 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* EFECTO "RUEDA DE MAHORAGA" (Engranaje girando de fondo) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-10 pointer-events-none">
        <Settings size={800} className="animate-[spin_20s_linear_infinite] text-white" strokeWidth={0.5} />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center px-6 text-center py-20">
        
        {/* ETIQUETA SUPERIOR: ADAPTACIÓN RITUAL */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-8 backdrop-blur-md">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
          <span className="text-white text-[10px] font-black uppercase tracking-[0.5em]">PREMIOS WSP DEL INDIRISMO 2026</span>
        </div>

        {/* TÍTULO PRINCIPAL: MAHORAGA STYLE */}
        <div className="relative mb-16">
          <h1 className="text-7xl md:text-[160px] font-black italic uppercase tracking-tighter leading-[0.75] mix-blend-difference">
            PREMIOS <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-300 to-yellow-600">
              WSP GALA
            </span>
          </h1>
          <Trophy className="absolute -top-16 -right-16 text-white/5 -rotate-12 hidden md:block" size={200} />
        </div>

        {/* CONTADOR TIPO TABLERO SAGRADO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl w-full mb-16 px-4">
          {Object.entries(timeLeft).map(([label, value]) => (
            <div key={label} className="group relative">
              <div className="absolute inset-0 bg-white/5 blur-2xl group-hover:bg-yellow-500/10 transition-all duration-700" />
              <div className="relative bg-black/60 border border-white/10 p-8 rounded-3xl backdrop-blur-3xl overflow-hidden">
                {/* Rayita decorativa Mahoraga */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
                <div className="text-6xl md:text-7xl font-black italic tracking-tighter text-white group-hover:scale-110 transition-transform duration-500">
                  {String(value).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase tracking-[0.5em] text-yellow-500 mt-4 font-black">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CONTENEDOR DE ACCIONES (VOTAR + SALA DE ESPERA) */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          
          {/* BOTÓN PRINCIPAL: VOTAR */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-white rounded-full blur opacity-10 group-hover:opacity-30 transition duration-1000" />
            <Link 
              href="/votar" 
              className="relative bg-white text-black px-12 py-7 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-yellow-500 transition-all flex items-center gap-4 shadow-2xl active:scale-95"
            >
              Comenzar Votación
              <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>

          {/* BOTÓN SECUNDARIO: SALA DE ESPERA (LIVE) */}
          <Link 
            href="/live" 
            className="group px-12 py-7 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm font-black uppercase tracking-[0.2em] text-[11px] text-white hover:bg-white hover:text-black transition-all flex items-center gap-4 active:scale-95"
          >
            <PlayCircle size={18} className="text-yellow-500 group-hover:text-black transition-colors" />
            Ir a la Gala Live
          </Link>

        </div>

        {/* DECORACIÓN INFERIOR ESTILO SELLOS */}
        <div className="mt-24 grid grid-cols-3 gap-12 opacity-30">
             {['ADAPTAR', 'EVOLUCIONAR',].map((txt) => (
               <span key={txt} className="text-[10px] font-black tracking-[1em] uppercase italic">{txt}</span>
             ))}
        </div>

      </main>

      {/* GRADIENTES DE AMBIENTACIÓN FINAL */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-black" />
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-500/10 blur-[120px] rounded-full" />
      </div>

    </div>
  )
}