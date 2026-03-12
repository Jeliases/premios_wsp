'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ChevronRight, Star, CheckCircle } from 'lucide-react'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<any[]>([])
  const [votosUsuario, setVotosUsuario] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategorias() {
      // 1. Obtener categorías
      const { data: cats } = await supabase
        .from('categorias')
        .select('*')
        .order('orden', { ascending: true })

      // 2. Obtener qué categorías ya votó este usuario
      const { data: { user } } = await supabase.auth.getUser()
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
    loadCategorias()
  }, [])

  if (loading) return <div className="text-center mt-20 text-yellow-500 animate-pulse font-black uppercase">Preparando la Gala...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 py-16">
      <header className="mb-16">
        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white">
          LAS <span className="text-yellow-500">CATEGORÍAS</span>
        </h1>
        <p className="text-slate-400 mt-4 uppercase tracking-[0.3em] font-bold">Selecciona una para empezar a votar</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categorias.map((cat) => {
          const yaVoto = votosUsuario.includes(cat.id)
          
          return (
            <Link 
              key={cat.id} 
              href={`/votar/${cat.id}`}
              className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 border-2 
                ${yaVoto 
                  ? 'bg-slate-900/50 border-green-500/30 opacity-80' 
                  : 'bg-slate-900 border-slate-800 hover:border-yellow-500 hover:scale-[1.02]'
                }`}
            >
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className={yaVoto ? 'text-green-500' : 'text-yellow-500'} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {yaVoto ? 'Completado' : 'Disponible'}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black uppercase italic text-white group-hover:text-yellow-500 transition-colors">
                    {cat.nombre}
                  </h2>
                  <p className="text-slate-400 text-sm mt-2">{cat.descripcion || 'Vota por tu nominado favorito.'}</p>
                </div>
                
                <div className="flex items-center justify-center">
                  {yaVoto ? (
                    <CheckCircle size={40} className="text-green-500" />
                  ) : (
                    <ChevronRight size={40} className="text-slate-700 group-hover:text-yellow-500 group-hover:translate-x-2 transition-all" />
                  )}
                </div>
              </div>

              {/* Efecto de fondo cuando pasas el mouse */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          )
        })}
      </div>

      <footer className="mt-20 text-center border-t border-slate-900 pt-10">
        <p className="text-slate-600 text-xs uppercase tracking-widest font-bold">Premios WSP © 2026 - Powered by Supabase</p>
      </footer>
    </div>
  )
}