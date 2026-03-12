'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart3, Trophy, Loader2, Star } from 'lucide-react'

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

  useEffect(() => {
    async function loadCategorias() {
      const { data } = await supabase.from('categorias').select('id, nombre').order('orden', { ascending: true })
      if (data) {
        setCategorias(data)
        setCatSeleccionada(data[0]?.id)
      }
    }
    loadCategorias()
  }, [])

  useEffect(() => {
    if (!catSeleccionada) return;

    async function fetchResultados() {
      setLoading(true)
      const { data: clips } = await supabase
        .from('clips')
        .select('id, titulo')
        .eq('categoria_id', catSeleccionada)

      const { data: votos } = await supabase
        .from('votos')
        .select('clip_id')
        .eq('categoria_id', catSeleccionada)

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
  }, [catSeleccionada])

  return (
    <div className="max-w-5xl mx-auto p-6 text-white min-h-screen pb-20">
      <header className="text-center mb-16 mt-8">
        <div className="inline-flex items-center justify-center p-3 bg-yellow-500/10 rounded-2xl mb-4 border border-yellow-500/20">
          <BarChart3 size={32} className="text-yellow-500" />
        </div>
        <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
          CONTEO <span className="text-yellow-500 underline decoration-white/10 italic">OFICIAL</span>
        </h1>
        <p className="text-slate-500 mt-4 uppercase tracking-[0.4em] text-xs font-bold">Resultados actualizados en tiempo real</p>
      </header>

      {/* SELECTOR DE CATEGORÍA (Pills Estilo Gala) */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {categorias.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCatSeleccionada(cat.id)}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 
              ${catSeleccionada === cat.id 
                ? 'bg-white border-white text-black scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-white'}`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* GRÁFICA DE RESULTADOS */}
      <div className="space-y-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-yellow-500 mb-4" size={40} />
            <p className="text-slate-500 uppercase font-black tracking-widest text-xs">Escaneando Urnas...</p>
          </div>
        ) : (
          resultados.map((res, index) => (
            <div 
              key={res.id} 
              className={`relative p-8 rounded-3xl border transition-all duration-700 
                ${index === 0 
                  ? 'bg-slate-900/40 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.1)]' 
                  : 'bg-slate-950/50 border-white/5'}`}
            >
              {/* Badge de Posición para el ganador */}
              {index === 0 && (
                <div className="absolute -top-4 -left-4 bg-yellow-500 text-black p-3 rounded-2xl rotate-[-10deg] shadow-xl flex items-center gap-2">
                  <Trophy size={20} />
                  <span className="font-black text-xs uppercase tracking-tighter">Líder Provisional</span>
                </div>
              )}

              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className={`text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3
                    ${index === 0 ? 'text-yellow-500' : 'text-white'}`}>
                    {res.titulo}
                    {index === 0 && <Star size={18} className="fill-yellow-500 animate-pulse" />}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
                    {res.votos_count} VOTOS REGISTRADOS
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-4xl font-black italic tracking-tighter ${index === 0 ? 'text-white' : 'text-slate-400'}`}>
                    {res.porcentaje.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {/* BARRA DE PROGRESO PREMIUM */}
              <div className="h-6 bg-black rounded-full overflow-hidden border border-white/5 p-1">
                <div 
                  className={`h-full transition-all duration-[1.5s] ease-out rounded-full relative
                    ${index === 0 
                      ? 'bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.4)]' 
                      : 'bg-slate-800'}`}
                  style={{ width: `${res.porcentaje}%` }}
                >
                  {/* Efecto de brillo barriendo la barra */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full animate-[shimmer_2s_infinite] skew-x-[-20deg]" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER DE RESULTADOS */}
      {!loading && resultados.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
          <p className="text-slate-600 uppercase font-black tracking-widest">No hay votos registrados en esta categoría aún.</p>
        </div>
      )}
    </div>
  )
}