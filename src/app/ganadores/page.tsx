'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Trophy, Star, Crown } from 'lucide-react'
import confetti from 'canvas-confetti' // Opcional: instalalo con npm i canvas-confetti

export default function GanadoresPage() {
  const [ganadores, setGanadores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function calcularGanadores() {
      // 1. Traer categorías y clips
      const { data: categorias } = await supabase.from('categorias').select('*')
      const { data: votos } = await supabase.from('votos').select('clip_id, categoria_id')
      const { data: clips } = await supabase.from('clips').select('*')

      if (categorias && votos && clips) {
        const listaGanadores = categorias.map(cat => {
          // Filtrar votos de esta categoría
          const votosCat = votos.filter(v => v.categoria_id === cat.id)
          
          // Contar votos por cada clip
          const conteo = clips
            .filter(c => c.categoria_id === cat.id)
            .map(c => ({
              ...c,
              totalVotos: votosCat.filter(v => v.clip_id === c.id).length
            }))
            .sort((a, b) => b.totalVotos - a.totalVotos)

          return {
            categoria: cat.nombre,
            ganador: conteo[0] // El que tiene más votos
          }
        })
        setGanadores(listaGanadores)
      }
      setLoading(false)
    }
    calcularGanadores()
  }, [])

  const dispararConfeti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#EAB308', '#FFFFFF', '#CA8A04']
    })
  }

  if (loading) return <div className="text-center mt-20 text-yellow-500 animate-bounce">Revelando Campeones...</div>

  return (
    <div className="max-w-6xl mx-auto p-10 text-white min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4">
          HALL OF <span className="text-yellow-500">FAME</span>
        </h1>
        <button 
          onClick={dispararConfeti}
          className="bg-yellow-500 text-black font-black px-6 py-2 rounded-full text-xs uppercase hover:scale-110 transition"
        >
          Celebrar Victoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ganadores.map((item, index) => (
          <div key={index} className="relative group bg-gradient-to-br from-slate-900 to-black border-2 border-yellow-500/30 p-1 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.1)]">
            <div className="bg-slate-950 rounded-[22px] p-8">
              <div className="flex justify-between items-start mb-6">
                <span className="bg-yellow-500 text-black px-4 py-1 rounded-full text-xs font-black uppercase">
                  Ganador Oficial
                </span>
                <Trophy className="text-yellow-500 animate-pulse" size={32} />
              </div>

              <h2 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">
                {item.categoria}
              </h2>
              <h3 className="text-4xl font-black italic uppercase mb-6 group-hover:text-yellow-500 transition-colors">
                {item.ganador?.titulo || 'Sin votos'}
              </h3>

              {item.ganador?.url_media && (
                <div className="aspect-video rounded-xl overflow-hidden border border-slate-800">
                  {item.ganador.tipo === 'video' ? (
                    <video src={item.ganador.url_media} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={item.ganador.url_media} className="w-full h-full object-cover" />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}