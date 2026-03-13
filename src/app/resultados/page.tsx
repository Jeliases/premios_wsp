'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart3, Loader2, Lock, TrendingUp } from 'lucide-react'

interface Resultado {
  id: string;
  titulo: string;
  votos_count: number;
  porcentaje: number;
}

interface Categoria {
  id: string;
  nombre: string;
}

export default function ResultadosPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [catSeleccionada, setCatSeleccionada] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [esPublico, setEsPublico] = useState<boolean | null>(null)

  useEffect(() => {
    async function init() {
      // Carga paralela de config y categorías
      const [configRes, catsRes] = await Promise.all([
        supabase.from('config_gala').select('resultados_publicos').eq('id', 'main_config').single(),
        supabase.from('categorias').select('id, nombre').order('id', { ascending: true })
      ])

      setEsPublico(configRes.data?.resultados_publicos ?? false)

      if (catsRes.data) {
        setCategorias(catsRes.data)
        setCatSeleccionada(catsRes.data[0]?.id || '')
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!catSeleccionada || esPublico === false) return;

    async function fetchResultados() {
      setLoading(true)
      const { data: clips } = await supabase.from('clips').select('id, titulo').eq('categoria_id', catSeleccionada)
      const { data: votos } = await supabase.from('votos').select('clip_id').eq('categoria_id', catSeleccionada)

      if (clips && votos) {
        const totalVotos = votos.length;
        const rawResultados = clips.map(clip => {
          const numVotos = votos.filter(v => v.clip_id === clip.id).length;
          return {
            id: clip.id,
            titulo: clip.titulo,
            votos_count: numVotos,
            porcentaje: totalVotos > 0 ? (numVotos / totalVotos) * 100 : 0
          }
        }).sort((a, b) => b.votos_count - a.votos_count);

        setResultados(rawResultados)
      }
      setLoading(false)
    }
    fetchResultados()
  }, [catSeleccionada, esPublico])

  if (esPublico === null) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <Loader2 className="animate-spin text-yellow-500" size={40} />
    </div>
  )

  if (!esPublico) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-black to-black">
        <div className="bg-slate-900/40 p-12 md:p-16 rounded-[3.5rem] border border-white/5 shadow-2xl backdrop-blur-xl max-w-2xl">
          <div className="bg-yellow-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border border-yellow-500/20">
            <Lock size={32} className="text-yellow-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic text-white mb-6 tracking-tighter leading-none">
            RESULTADOS <span className="text-yellow-500">ENCRIPTADOS</span>
          </h1>
          <p className="text-slate-500 font-bold max-w-sm mx-auto uppercase tracking-[0.2em] text-[11px] leading-relaxed">
            El escrutinio final está bajo custodia. Se revelará automáticamente al finalizar el periodo de votación.
          </p>
          <div className="mt-12 flex items-center justify-center gap-2 text-yellow-500/50 font-black text-[9px] uppercase tracking-widest">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            Servidor Protegido
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-12 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20 mb-6">
            <TrendingUp size={14} className="text-yellow-500" />
            <span className="text-yellow-500 text-[9px] font-black uppercase tracking-widest">Live Updates</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-white">
            CONTEO <span className="text-yellow-500">REAL-TIME</span>
          </h1>
          <p className="text-slate-600 mt-4 uppercase tracking-[0.4em] text-[10px] font-black">Transparencia Total WSP</p>
        </header>

        {/* SELECTOR */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCatSeleccionada(cat.id)}
              className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                catSeleccionada === cat.id 
                  ? 'bg-yellow-500 border-yellow-500 text-black shadow-[0_0_25px_rgba(234,179,8,0.3)] scale-105' 
                  : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/20'}`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* RESULTADOS */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="animate-spin text-yellow-500 mb-6" size={40} />
              <p className="text-slate-600 uppercase font-black tracking-[0.3em] text-[9px]">Sincronizando Votos...</p>
            </div>
          ) : (
            resultados.map((res, index) => (
              <div 
                key={res.id} 
                className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 group
                  ${index === 0 
                    ? 'bg-slate-900/40 border-yellow-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
                    : 'bg-slate-900/20 border-white/5'}`}
              >
                {index === 0 && (
                  <div className="absolute -top-3 -right-3 bg-yellow-500 text-black text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-xl">
                    Líder Actual
                  </div>
                )}

                <div className="flex justify-between items-end mb-6">
                  <div className="space-y-1">
                    <h3 className={`text-2xl md:text-3xl font-black uppercase italic tracking-tighter transition-colors
                      ${index === 0 ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                      {res.titulo}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                      <span className={index === 0 ? 'text-yellow-500/70' : ''}>{res.votos_count} Votos</span>
                      <span className="opacity-30">•</span>
                      <span>Posición #{index + 1}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-4xl font-black italic tracking-tighter ${index === 0 ? 'text-yellow-500' : 'text-white/40'}`}>
                      {res.porcentaje.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* BARRA DE PROGRESO */}
                <div className="h-3 bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div 
                    className={`h-full transition-all duration-[1.5s] cubic-bezier(0.34, 1.56, 0.64, 1) rounded-full shadow-[0_0_15px_rgba(234,179,8,0.2)]
                      ${index === 0 ? 'bg-yellow-500' : 'bg-slate-700'}`}
                    style={{ width: `${res.porcentaje}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}