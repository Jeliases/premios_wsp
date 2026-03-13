'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ChevronRight, Star, CheckCircle, Award, Sparkles } from 'lucide-react'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<any[]>([])
  const [votosUsuario, setVotosUsuario] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      
      // 1. Obtener sesión y categorías en paralelo
      const [userRes, catsRes] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('categorias').select('*').order('orden', { ascending: true })
      ])

      const user = userRes.data?.user
      const cats = catsRes.data

      // 2. Si hay usuario, traer sus votos
      if (user) {
        const { data: votos } = await supabase
          .from('votos')
          .select('categoria_id')
          .eq('user_id', user.id)
        
        if (votos) setVotosUsuario(votos.map(v => v.categoria_id))
      }

      if (cats) setCategorias(cats)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <Sparkles className="text-yellow-500 animate-pulse mb-4" size={40} />
      <div className="text-yellow-500 font-black uppercase tracking-[0.4em] text-xs">
        Abriendo el sobre...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#05070a] text-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-20 text-center md:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-yellow-500/10 rounded-full border border-yellow-500/20 mb-6">
            <Award size={14} className="text-yellow-500" />
            <span className="text-yellow-500 text-[9px] font-black uppercase tracking-widest">Gala Oficial 2026</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
            LAS <span className="text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]">CATEGORÍAS</span>
          </h1>
          <p className="text-slate-500 mt-6 uppercase tracking-[0.4em] text-xs font-bold max-w-xl leading-relaxed">
            Tu voto define la historia. Selecciona una categoría para ver a los nominados.
          </p>
        </header>

        {/* GRID DE CATEGORÍAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categorias.map((cat) => {
            const yaVoto = votosUsuario.includes(cat.id)
            
            return (
              <Link 
                key={cat.id} 
                href={`/votar/${cat.id}`}
                className={`group relative overflow-hidden rounded-[2.5rem] p-1 transition-all duration-500 
                  ${yaVoto 
                    ? 'bg-slate-900/20 grayscale-[0.5]' 
                    : 'hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                {/* Borde animado sutil */}
                <div className={`absolute inset-0 rounded-[2.5rem] ${yaVoto ? 'bg-green-500/20' : 'bg-white/5 group-hover:bg-yellow-500/50 transition-colors'}`} />
                
                <div className="relative bg-[#0a0c10] rounded-[2.4rem] p-8 md:p-10 h-full flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${yaVoto ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${yaVoto ? 'text-green-500' : 'text-slate-500'}`}>
                          {yaVoto ? 'Voto Registrado' : 'Abierta para votación'}
                        </span>
                      </div>
                      <h2 className={`text-3xl md:text-4xl font-black uppercase italic leading-none transition-colors ${yaVoto ? 'text-slate-400' : 'text-white group-hover:text-yellow-500'}`}>
                        {cat.nombre}
                      </h2>
                    </div>
                    
                    <div className={`p-4 rounded-2xl transition-all duration-500 ${yaVoto ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-slate-700 group-hover:bg-yellow-500 group-hover:text-black group-hover:rotate-[-10deg]'}`}>
                      {yaVoto ? <CheckCircle size={28} /> : <ChevronRight size={28} />}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/5">
                    <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider italic">
                      {cat.descripcion || 'Vota por tu nominado favorito.'}
                    </p>
                    {yaVoto && (
                      <span className="text-[9px] font-black text-green-500/50 uppercase italic">Finalizado</span>
                    )}
                  </div>
                </div>

                {/* Efecto de luz interna en hover */}
                {!yaVoto && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
                )}
              </Link>
            )
          })}
        </div>

        {/* PROGRESO GLOBAL SUTIL */}
        <div className="mt-20 p-8 rounded-3xl bg-slate-900/20 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-black italic text-white leading-none">
              {votosUsuario.length}<span className="text-yellow-500">/</span>{categorias.length}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Categorías<br/>Completadas
            </div>
          </div>
          <div className="flex-1 h-2 bg-black rounded-full max-w-md w-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all duration-1000"
              style={{ width: `${(votosUsuario.length / categorias.length) * 100}%` }}
            />
          </div>
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            {votosUsuario.length === categorias.length ? '¡Gala completada!' : 'Sigue votando'}
          </p>
        </div>
      </div>
    </div>
  )
}