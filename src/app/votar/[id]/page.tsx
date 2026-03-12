'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { CheckCircle2, Play, Image as ImageIcon, Loader2, LogIn } from 'lucide-react'

// Estructura de datos
interface Nominado {
  id: string;
  titulo: string;
  url_media: string;
  tipo: 'video' | 'foto' | 'texto';
  categoria_id: string;
}

export default function DetalleVotacion() {
  const { id } = useParams()
  const [nominados, setNominados] = useState<Nominado[]>([])
  const [loading, setLoading] = useState(true)
  const [votandoId, setVotandoId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // 1. Verificamos sesión de usuario
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    // 2. Cargamos nominados de la categoría
    async function fetchNominados() {
      const { data, error } = await supabase
        .from('clips') 
        .select('*')
        .eq('categoria_id', id)
      
      if (error) console.error("Error al cargar nominados:", error)
      if (data) setNominados(data as Nominado[])
      setLoading(false)
    }
    if (id) fetchNominados()
  }, [id])

  // LOGIN CON GOOGLE (Facilongo)
  const handleLoginGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + `/votar/${id}`
      }
    })
  }

  const votar = async (clipId: string) => {
    if (!user) return
    setVotandoId(clipId)

    const { error } = await supabase
      .from('votos')
      .insert({ 
        user_id: user.id, 
        clip_id: clipId, 
        categoria_id: id 
      })

    if (error) {
      if (error.code === '23505') {
        alert("❌ Ya has registrado un voto en esta categoría.")
      } else {
        alert("Hubo un error: " + error.message)
      }
    } else {
      alert("✨ ¡Voto procesado con éxito! Gracias por apoyar a la comunidad.")
    }
    
    setVotandoId(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <Loader2 className="animate-spin text-yellow-500 mb-4" size={48} />
        <p className="text-xl font-bold uppercase tracking-widest animate-pulse">Cargando Nominados...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 text-white pb-20">
      <header className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4">
          ELIMINATORIA <span className="text-yellow-500 underline decoration-white/20">WSP</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto uppercase tracking-wide font-light">
          Analiza el contenido y elige quién merece el trofeo esta temporada.
        </p>
      </header>

      {/* Grid inteligente según el contenido */}
      <div className={`grid gap-8 ${
        nominados.length > 0 && nominados[0].tipo === 'texto' 
        ? 'grid-cols-2 md:grid-cols-4' 
        : 'grid-cols-1 md:grid-cols-2'
      }`}>
        {nominados.map((item) => (
          <div 
            key={item.id} 
            className="group relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 hover:border-yellow-500/60 transition-all duration-500 shadow-2xl flex flex-col"
          >
            {/* CONTENIDO VISUAL */}
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              {item.tipo === 'video' ? (
                <video 
                  src={item.url_media} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                  muted loop
                />
              ) : item.tipo === 'foto' ? (
                <img 
                  src={item.url_media} 
                  alt={item.titulo} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
                  <ImageIcon size={60} className="text-slate-800 group-hover:text-yellow-500/20 transition-colors" />
                </div>
              )}
              
              {/* Overlay Play para Videos */}
              {item.tipo === 'video' && (
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md p-2 rounded-lg pointer-events-none group-hover:hidden transition-all">
                  <Play size={16} className="text-yellow-500 fill-yellow-500" />
                </div>
              )}
            </div>

            {/* CUERPO DE LA TARJETA */}
            <div className="p-8 bg-gradient-to-b from-slate-900/50 to-black flex-1 flex flex-col justify-between">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                   <div className="h-[2px] w-8 bg-yellow-500"></div>
                   <span className="text-yellow-500 text-xs font-black uppercase tracking-[0.3em]">Nominado</span>
                </div>
                <h3 className="text-3xl font-black uppercase italic leading-none group-hover:text-yellow-500 transition-colors">
                  {item.titulo}
                </h3>
              </div>
              
              {/* BOTÓN INTELIGENTE (LOGIN O VOTO) */}
              {!user ? (
                <button 
                  onClick={handleLoginGoogle}
                  className="group relative overflow-hidden w-full py-5 rounded-2xl font-black uppercase tracking-widest bg-white text-black hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <LogIn size={24} />
                  <span>Entra para votar</span>
                </button>
              ) : (
                <button 
                  onClick={() => votar(item.id)}
                  disabled={votandoId !== null}
                  className={`group/btn relative overflow-hidden w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all
                    ${votandoId === item.id 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-yellow-500 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.05)]'}
                  `}
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {votandoId === item.id ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        <CheckCircle2 size={24} strokeWidth={3} />
                        <span>Confirmar Voto</span>
                      </>
                    )}
                  </div>
                </button>
              )}
            </div>

            {/* EFECTO DE LUZ (SHINE) AL PASAR EL MOUSE */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
          </div>
        ))}
      </div>

      <footer className="mt-20 border-t border-slate-800 pt-10 text-center">
        <p className="text-slate-500 text-sm tracking-[0.5em] uppercase">Votación Oficial Premios WSP 2026</p>
      </footer>
    </div>
  )
}