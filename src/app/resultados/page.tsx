'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart3, Loader2, Lock } from 'lucide-react'

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
  const [esPublico, setEsPublico] = useState<boolean | null>(null) // Nuevo: Control de acceso

  useEffect(() => {
    async function init() {
      // 1. Verificar si los resultados están liberados
      const { data: config } = await supabase.from('config_gala').select('resultados_publicos').eq('id', 'main_config').single()
      setEsPublico(config?.resultados_publicos ?? false)

      // 2. Cargar categorías
      const { data: cats } = await supabase.from('categorias').select('id, nombre').order('id', { ascending: true })
      if (cats) {
        setCategorias(cats)
        setCatSeleccionada(cats[0]?.id)
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

  // PANTALLA DE CARGA INICIAL
  if (esPublico === null) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <Loader2 className="animate-spin text-yellow-500" size={40} />
    </div>
  )

  // PANTALLA DE BLOQUEO (Si el switch en Admin está apagado)
  if (!esPublico) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6">
        <div className="bg-slate-900/50 p-16 rounded-[3rem] border border-slate-800 shadow-2xl">
          <Lock size={60} className="text-yellow-500/20 mb-6 mx-auto" />
          <h1 className="text-4xl md:text-5xl font-black uppercase italic italic text-white mb-4 tracking-tighter">
            ACCESO <span className="text-yellow-500">RESTRINGIDO</span>
          </h1>
          <p className="text-slate-500 font-bold max-w-sm uppercase tracking-widest text-[10px] leading-loose">
            LOS RESULTADOS OFICIALES SE REVELARÁN EXCLUSIVAMENTE DURANTE LA CEREMONIA EN VIVO.
          </p>
          <div className="mt-10 py-2 px-8 border border-yellow-500/30 rounded-full text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em] inline-block">
            SISTEMA CERRADO
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 text-white min-h-screen pb-20">
      <header className="text-center mb-16 mt-8">
        <div className="inline-flex items-center justify-center p-3 bg-yellow-500/10 rounded-2xl mb-4 border border-yellow-500/20">
          <BarChart3 size={32} className="text-yellow-500" />
        </div>
        <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
          CONTEO <span className="text-yellow-500 underline decoration-white/10 italic">OFICIAL</span>
        </h1>
        <p className="text-slate-500 mt-4 uppercase tracking-[0.4em] text-xs font-bold">ACTUALIZACIÓN EN TIEMPO REAL</p>
      </header>

      {/* SELECTOR DE CATEGORÍA */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {categorias.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCatSeleccionada(cat.id)}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 
              ${catSeleccionada === cat.id 
                ? 'bg-white border-white text-black scale-105 shadow-xl' 
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-white'}`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* GRÁFICA DE RESULTADOS */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-yellow-500 mb-4" size={40} />
            <p className="text-slate-500 uppercase font-black tracking-widest text-[10px]">ANALIZANDO REGISTROS...</p>
          </div>
        ) : (
          resultados.map((res, index) => (
            <div 
              key={res.id} 
              className={`relative p-8 rounded-[2rem] border transition-all duration-700 
                ${index === 0 
                  ? 'bg-slate-900/40 border-yellow-500/50' 
                  : 'bg-slate-950/50 border-white/5'}`}
            >
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className={`text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3
                    ${index === 0 ? 'text-yellow-500' : 'text-white'}`}>
                    {res.titulo}
                  </h3>
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-1">
                    {res.votos_count} VOTOS REGISTRADOS
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-4xl font-black italic tracking-tighter ${index === 0 ? 'text-white' : 'text-slate-500'}`}>
                    {res.porcentaje.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="h-4 bg-black rounded-full overflow-hidden border border-white/5 p-0.5">
                <div 
                  className={`h-full transition-all duration-[1.5s] ease-out rounded-full
                    ${index === 0 ? 'bg-yellow-500' : 'bg-slate-800'}`}
                  style={{ width: `${res.porcentaje}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}