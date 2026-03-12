'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, ChevronRight, Sparkles } from 'lucide-react'

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState({ días: 0, horas: 0, min: 0, seg: 0 })

  useEffect(() => {
    // FECHA DE LA GALA: Ajusta el mes (0-11) y el día según necesites
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
    <div className="relative flex flex-col items-center justify-center min-h-[90vh] text-center px-6 overflow-hidden bg-black">
      
      {/* CAPA DE AMBIENTE: Brillos y partículas */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-yellow-600/10 blur-[180px] rounded-full opacity-50" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Badge de Evento */}
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full mb-8 animate-pulse">
          <Sparkles size={16} className="text-yellow-500" />
          <span className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em]">Evento Oficial 2026</span>
        </div>

        <div className="relative">
          <Trophy size={100} className="text-yellow-500 mb-4 drop-shadow-[0_0_25px_rgba(234,179,8,0.5)] transition-transform hover:scale-110 duration-500" />
        </div>
        
        <h1 className="text-6xl md:text-[120px] font-black italic uppercase tracking-tighter text-white leading-[0.85] select-none">
          PREMIOS <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 underline decoration-white/5">
            WSP GALA
          </span>
        </h1>

        <p className="mt-8 text-slate-400 uppercase tracking-[0.6em] text-xs md:text-sm font-light max-w-xl leading-relaxed">
          Donde la comunidad celebra a sus leyendas. <br />
          <span className="font-bold text-slate-200 text-lg mt-2 block tracking-widest italic">Vota por la historia.</span>
        </p>

        {/* CONTADOR DE TIEMPO (COUNTDOWN) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl w-full">
          {Object.entries(timeLeft).map(([label, value]) => (
            <div key={label} className="group bg-slate-950/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl hover:border-yellow-500/40 transition-all duration-500">
              <div className="text-4xl md:text-6xl font-black text-white group-hover:text-yellow-500 transition-colors">
                {String(value).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mt-2 font-black group-hover:text-yellow-600">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* BOTÓN DE ACCIÓN PRINCIPAL */}
        <div className="mt-16 group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-yellow-300 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <Link 
            href="/votar" 
            className="relative bg-white text-black px-12 py-6 rounded-full font-black uppercase tracking-[0.2em] hover:bg-yellow-500 transition-all active:scale-95 flex items-center gap-3 shadow-2xl"
          >
            INGRESAR A VOTACIONES 
            <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </div>

      </div>

      {/* Decoración inferior */}
      <div className="absolute bottom-10 left-10 hidden lg:block">
        <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest vertical-text transform -rotate-90 origin-left">
          © PREMIOS WSP // EDICIÓN 2026
        </p>
      </div>
    </div>
  )
}