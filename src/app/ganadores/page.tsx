'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Trophy, Star, Crown, Medal } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function GanadoresPage() {
  const [ganadores, setGanadores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function calcularGanadores() {
      // 1. Traer datos en paralelo para velocidad
      const [
        { data: categorias }, 
        { data: votos }, 
        { data: clips }
      ] = await Promise.all([
        supabase.from('categorias').select('*'),
        supabase.from('votos').select('clip_id, categoria_id'),
        supabase.from('clips').select('*')
      ])

      if (categorias && votos && clips) {
        const listaGanadores = categorias.map(cat => {
          const votosCat = votos.filter(v => v.categoria_id === cat.id)
          
          const conteo = clips
            .filter(c => c.categoria_id === cat.id)
            .map(c => ({
              ...c,
              totalVotos: votosCat.filter(v => v.clip_id === c.id).length
            }))
            .sort((a, b) => b.totalVotos - a.totalVotos)

          return {
            categoria: cat.nombre,
            ganador: conteo.length > 0 ? conteo[0] : null
          }
        }).filter(item => item.ganador !== null); // Solo mostrar categorías con nominados

        setGanadores(listaGanadores)
      }
      setLoading(false)
    }
    calcularGanadores()
  }, [])

  const dispararConfeti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <Trophy className="text-yellow-500 animate-bounce mb-4" size={50} />
      <div className="text-center text-yellow-500 font-black uppercase tracking-[0.4em] animate-pulse text-sm">
        Tabulando Resultados...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black py-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-20 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-full backdrop-blur-sm">
              <Crown className="text-yellow-500" size={40} />
            </div>
          </div>
          <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter text-white leading-none">
            HALL OF <span className="text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]">FAME</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Los elegidos por la comunidad WSP</p>
          
          <div className="pt-6">
            <button 
              onClick={dispararConfeti}
              className="group relative bg-yellow-500 text-black font-black px-10 py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white transition-all active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
            >
              Celebrar Victoria
            </button>
          </div>
        </div>

        {/* GRID DE GANADORES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {ganadores.map((item, index) => (
            <div 
              key={index} 
              className="relative group bg-slate-900/20 border border-white/5 p-1 rounded-[2.5rem] overflow-hidden hover:border-yellow-500/50 transition-all duration-500 shadow-2xl"
            >
              {/* Overlay de brillo al hacer hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="bg-slate-950/80 backdrop-blur-md rounded-[2.3rem] p-8 md:p-10 relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-yellow-500 text-[9px] font-black uppercase tracking-widest">
                      <Star size={12} fill="currentColor" /> Winner {index + 1}
                    </span>
                    <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                      {item.categoria}
                    </h2>
                  </div>
                  <div className="bg-yellow-500 p-3 rounded-2xl shadow-lg shadow-yellow-500/20">
                    <Trophy className="text-black" size={24} />
                  </div>
                </div>

                <h3 className="text-4xl md:text-5xl font-black italic uppercase mb-8 leading-tight group-hover:text-yellow-500 transition-colors">
                  {item.ganador?.titulo || 'Pendiente'}
                </h3>

                {item.ganador?.url_media && (
                  <div className="mt-auto relative aspect-video rounded-3xl overflow-hidden border border-white/5 shadow-inner bg-black">
                    {item.ganador.tipo === 'video' ? (
                      <video 
                        src={item.ganador.url_media} 
                        className="w-full h-full object-cover" 
                        controls 
                      />
                    ) : (
                      <img 
                        src={item.ganador.url_media} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt="Winner media"
                      />
                    )}
                  </div>
                )}
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-800" />
                    ))}
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-600 tracking-tighter">
                    Votos Totales: {item.ganador?.totalVotos || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-32 text-center border-t border-white/5 pt-10">
          <p className="text-slate-700 font-black uppercase text-[10px] tracking-[0.5em]">
            Gala WSP 2026 • Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  )
}