'use client'
import { useEffect, useState, useRef } from 'react'
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
  Volume2,
  VolumeX,
  Award
} from 'lucide-react'

const ADMIN_WHITELIST = [
  "j.luisestrada98@gmail.com", 
  "indira.cachay9@gmail.com",
  "thesoul986@gmail.com",
  "elviscocho1998op@gmail.com"
];

interface Nominado {
  id: string;
  titulo: string;
  url_media: string;
  tipo: 'video' | 'foto' | 'texto';
  categoria_id: string;
}

// --- COMPONENTE DE VIDEO OPTIMIZADO ---
function VideoPlayer({ src, onExpand }: { src: string, onExpand: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      const isNowMuted = !videoRef.current.muted;
      videoRef.current.muted = isNowMuted;
      setMuted(isNowMuted);
    }
  };

  return (
    <div className="relative w-full h-full group overflow-hidden bg-black flex items-center justify-center">
      <video 
        ref={videoRef}
        src={src} 
        className="w-full h-full object-contain md:object-cover"
        muted={muted}
        loop
        autoPlay
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={toggleAudio}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      <button 
        onClick={toggleAudio}
        className="absolute bottom-4 right-4 z-20 bg-black/40 backdrop-blur-xl p-3 rounded-2xl border border-white/10 active:scale-90 transition-all"
      >
        {muted ? <VolumeX size={16} className="text-white/50" /> : <Volume2 size={16} className="text-yellow-500" />}
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); onExpand(); }}
        className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-xl p-3 rounded-2xl border border-white/10 md:opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Maximize2 size={16} className="text-white" />
      </button>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="bg-yellow-500 p-4 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.5)]">
              <Play size={24} className="text-black fill-black" />
           </div>
        </div>
      )}
    </div>
  );
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
      const { data } = await supabase
        .from('clips') 
        .select('*')
        .eq('categoria_id', id)
      
      if (data) setNominados(data as Nominado[])
      setLoading(false)
    }
    if (id) fetchNominados()
  }, [id])

  const handleLoginGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/votar/${id}` }
    })
  }

  const votar = async (clipId: string) => {
    if (!user) return
    setVotandoId(clipId)

    const { error } = await supabase
      .from('votos')
      .insert({ user_id: user.id, clip_id: clipId, categoria_id: id })

    if (error) {
      if (error.code === '23505') {
        alert("Ya has registrado tu voto en esta categoría.")
      } else {
        alert("Error: " + error.message)
      }
      setVotandoId(null)
      return
    }

    // Lógica de navegación automática
    const { data: categorias } = await supabase
      .from('categorias')
      .select('id')
      .order('id', { ascending: true })

    if (categorias) {
      const currentIdx = categorias.findIndex(cat => cat.id === id)
      const nextCat = categorias[currentIdx + 1]
      
      if (nextCat) {
        router.push(`/votar/${nextCat.id}`)
      } else {
        alert("¡Gracias por participar! Has completado todas las categorías.")
        router.push('/') 
      }
    }
    setVotandoId(null)
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-yellow-500" size={40} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Preparando Candidatos</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      
      {/* HEADER FIXO */}
      <nav className="sticky top-0 z-[40] bg-[#05070a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-[10px] font-black uppercase tracking-widest">Regresar</span>
          </button>
          
          <div className="flex items-center gap-3">
            {user && ADMIN_WHITELIST.includes(user.email) && (
              <span className="text-[8px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full font-black uppercase">Staff Mode</span>
            )}
            <button onClick={() => router.push('/')} className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
               <X size={18} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6 pt-12">
        <header className="mb-16 text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-yellow-500/10 p-3 rounded-2xl border border-yellow-500/20">
              <Award className="text-yellow-500" size={24} />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.8]">
            VOTO <span className="text-yellow-500">WSP</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black">Selecciona con sabiduría</p>
        </header>

        {/* LISTA DE NOMINADOS */}
        <div className="space-y-12">
          {nominados.map((item) => (
            <div key={item.id} className="group bg-slate-900/20 rounded-[3rem] overflow-hidden border border-white/5 flex flex-col hover:border-white/10 transition-all shadow-2xl">
              
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                {item.tipo === 'video' ? (
                  <VideoPlayer src={item.url_media} onExpand={() => setExpandedMedia(item)} />
                ) : item.tipo === 'foto' ? (
                  <img 
                    src={item.url_media} 
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700" 
                    onClick={() => setExpandedMedia(item)} 
                    alt={item.titulo}
                  />
                ) : (
                  <div className="w-full h-full p-12 flex items-center justify-center text-center bg-gradient-to-br from-slate-900 to-black">
                    <p className="text-2xl font-serif italic text-yellow-500/90 leading-relaxed">"{item.url_media}"</p>
                  </div>
                )}
              </div>

              <div className="p-10 flex flex-col items-center text-center">
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-3">Candidato Oficial</span>
                <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-10 group-hover:text-yellow-500 transition-colors">{item.titulo}</h3>
                
                {!user ? (
                  <button onClick={handleLoginGoogle} className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] bg-white text-black text-[11px] flex items-center justify-center gap-3 hover:bg-yellow-500 transition-all active:scale-95 shadow-xl">
                    <LogIn size={18} /> Iniciar sesión para votar
                  </button>
                ) : (
                  <button 
                    onClick={() => votar(item.id)}
                    disabled={votandoId !== null}
                    className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl ${
                      votandoId === item.id 
                      ? 'bg-slate-800 text-slate-500' 
                      : 'bg-white text-black hover:bg-yellow-500'
                    }`}
                  >
                    {votandoId === item.id ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <><CheckCircle2 size={20} /> Confirmar Voto</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL FULLSCREEN */}
      {expandedMedia && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4 md:p-10" onClick={() => setExpandedMedia(null)}>
          <button className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors bg-white/5 p-4 rounded-full">
            <X size={32} />
          </button>
          
          <div className="w-full max-w-5xl space-y-8" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(234,179,8,0.2)] border border-white/10 bg-black">
              {expandedMedia.tipo === 'video' ? (
                <video src={expandedMedia.url_media} className="w-full max-h-[70vh] object-contain" controls autoPlay />
              ) : (
                <img src={expandedMedia.url_media} className="w-full h-auto max-h-[70vh] object-contain mx-auto" alt="Expanded view" />
              )}
            </div>
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-black uppercase italic text-yellow-500 tracking-tighter drop-shadow-2xl">
                {expandedMedia.titulo}
              </h2>
            </div>
          </div>
        </div>
      )}

      <footer className="py-32 text-center">
        <p className="text-[10px] tracking-[1.2em] uppercase font-black text-white/10">WSP AWARDS 2026</p>
      </footer>
    </div>
  )
}