'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { 
  CheckCircle2, 
  Play, 
  Loader2, 
  LogIn, 
  Maximize2, 
  X, 
  ChevronLeft,
  Volume2
} from 'lucide-react'

const ADMIN_WHITELIST = [
  "j.luisestrada98@gmail.com", 
  "indira.cachay9@gmail.com",
  "thesoul986@gmail.com"
];

interface Nominado {
  id: string;
  titulo: string;
  url_media: string;
  tipo: 'video' | 'foto' | 'texto';
  categoria_id: string;
}

export default function DetalleVotacion() {
  const { id } = useParams()
  const router = useRouter()
  
  const [nominados, setNominados] = useState<Nominado[]>([])
  const [loading, setLoading] = useState(true)
  const [votandoId, setVotandoId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [expandedMedia, setExpandedMedia] = useState<Nominado | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    async function fetchNominados() {
      setLoading(true)
      const { data, error } = await supabase
        .from('clips') 
        .select('*')
        .eq('categoria_id', id)
      
      if (error) console.error("Error cargando nominados:", error)
      if (data) setNominados(data as Nominado[])
      setLoading(false)
    }
    if (id) fetchNominados()
  }, [id])

  const handleLoginGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: { prompt: 'select_account' },
        redirectTo: `${window.location.origin}/votar/${id}`
      }
    })
  }

  const votar = async (clipId: string) => {
    if (!user) return
    setVotandoId(clipId)

    const { error } = await supabase
      .from('votos')
      .insert({ user_id: user.id, clip_id: clipId, categoria_id: id })

    if (error) {
      if (error.code === '23505') alert("Ya has votado en esta categoría anteriormente.")
      else alert("Error: " + error.message)
      setVotandoId(null)
      return
    }

    const { data: categorias } = await supabase
      .from('categorias')
      .select('id')
      .order('id', { ascending: true })

    if (categorias) {
      const currentIdx = categorias.findIndex(cat => cat.id === id)
      const nextCat = categorias[currentIdx + 1]
      if (nextCat) {
        alert("¡Voto registrado! Pasamos a la siguiente categoría...")
        router.push(`/votar/${nextCat.id}`)
      } else {
        alert("¡Felicidades! Has terminado de votar en todas las categorías.")
        router.push('/') 
      }
    }
    setVotandoId(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="animate-spin text-yellow-500 mb-4" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse text-slate-500">Sincronizando Urnas...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-20 selection:bg-yellow-500 selection:text-black font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.3em]"
          >
            <ChevronLeft size={14} /> Volver al Menú
          </button>
          
          {user && ADMIN_WHITELIST.includes(user.email) && (
            <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">
              Modo Admin Activo
            </span>
          )}
        </div>

        <header className="mb-20 text-center">
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 leading-none">
            CATEGORÍA <span className="text-yellow-500 italic">WSP</span>
          </h1>
          <div className="h-1 w-24 bg-yellow-500 mx-auto mb-6"></div>
          <p className="text-slate-500 text-[10px] md:text-xs max-w-xl mx-auto uppercase tracking-[0.5em] font-bold leading-loose">
            Analiza el contenido y elige quién merece el trofeo oficial 2026.
          </p>
        </header>

        <div className={`grid gap-10 ${
          nominados.length > 0 && nominados[0].tipo === 'texto' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          {nominados.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-slate-900/40 rounded-[3rem] overflow-hidden border border-white/5 hover:border-yellow-500/30 transition-all duration-700 flex flex-col shadow-2xl"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                {item.tipo === 'video' ? (
                  <>
                    <video 
                      src={item.url_media} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      onMouseEnter={(e) => {
                        e.currentTarget.muted = false;
                        e.currentTarget.play();
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                        e.currentTarget.muted = true;
                      }}
                      muted
                      loop
                      playsInline
                    />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                       <Volume2 size={14} className="text-yellow-500" />
                    </div>
                  </>
                ) : item.tipo === 'foto' ? (
                    <img 
                      src={item.url_media} 
                      className="w-full h-full object-contain p-4 transition-transform duration-1000 group-hover:scale-105" 
                      alt={item.titulo}
                    />
                ) : (
                  <div className="w-full h-full p-12 flex items-center justify-center text-center bg-slate-900/20">
                     <p className="text-2xl font-serif italic text-yellow-500/80 leading-snug">"{item.url_media}"</p>
                  </div>
                )}
                
                {item.tipo !== 'texto' && (
                  <button 
                    onClick={() => setExpandedMedia(item)}
                    className="absolute top-6 right-6 bg-black/80 p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-yellow-500 hover:text-black border border-white/10 z-10"
                  >
                    <Maximize2 size={18} />
                  </button>
                )}

                {item.tipo === 'video' && (
                  <div className="absolute bottom-6 left-6 bg-yellow-500 p-2 rounded-xl pointer-events-none group-hover:scale-0 transition-transform duration-500 shadow-lg">
                    <Play size={14} className="text-black fill-black" />
                  </div>
                )}
              </div>

              <div className="p-10 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/40">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-[1px] w-6 bg-yellow-500/50"></div>
                    <span className="text-yellow-500 text-[9px] font-black uppercase tracking-[0.4em]">Candidato Oficial</span>
                  </div>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none group-hover:text-yellow-500 transition-colors">
                    {item.titulo}
                  </h3>
                </div>
                
                {!user ? (
                  <button onClick={handleLoginGoogle} className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] bg-white text-black hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 text-[10px]">
                    <LogIn size={16} /> Identificarse para votar
                  </button>
                ) : (
                  <button 
                    onClick={() => votar(item.id)}
                    disabled={votandoId !== null}
                    className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-[10px] flex items-center justify-center gap-3
                      ${votandoId === item.id ? 'bg-slate-800 text-slate-600' : 'bg-white text-black hover:bg-yellow-500 active:scale-95 shadow-2xl'}
                    `}
                  >
                    {votandoId === item.id ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={18} strokeWidth={3} /> Confirmar Voto</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE EXPANSIÓN (VÍDEOS Y FOTOS COOL) */}
      {expandedMedia && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300"
          onClick={() => setExpandedMedia(null)}
        >
          <button className="absolute top-6 right-6 md:top-10 md:right-10 text-white/50 hover:text-white transition-all z-[110]">
            <X size={48} />
          </button>
          
          <div className="relative max-w-6xl w-full max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {expandedMedia.tipo === 'video' ? (
              <video 
                src={expandedMedia.url_media} 
                className="w-full h-auto max-h-[80vh] rounded-3xl shadow-[0_0_100px_rgba(234,179,8,0.2)] border border-white/10"
                controls
                autoPlay
              />
            ) : (
              <img 
                src={expandedMedia.url_media} 
                className="w-full h-auto max-h-[80vh] object-contain rounded-3xl"
                alt={expandedMedia.titulo}
              />
            )}
            <h2 className="mt-8 text-2xl md:text-5xl font-black uppercase italic text-yellow-500 tracking-tighter">
              {expandedMedia.titulo}
            </h2>
          </div>
        </div>
      )}

      <footer className="mt-32 text-center opacity-20 border-t border-white/5 pt-10">
        <p className="text-[9px] tracking-[1.2em] uppercase font-black">WSP Awards Ceremonial System v2.0</p>
      </footer>
    </div>
  )
}