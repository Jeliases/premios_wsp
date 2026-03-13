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
  ChevronLeft 
} from 'lucide-react'

// LISTA DE ADMINISTRADORES (Correos autorizados)
const ADMIN_WHITELIST = [
  "tu-correo-principal@gmail.com", // Reemplaza por tu correo
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
  const [zoomImg, setZoomImg] = useState<string | null>(null)

  useEffect(() => {
    // 1. Verificar sesión del usuario y rol
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    // 2. Cargar nominados de esta categoría
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

    // Insertar el voto
    const { error } = await supabase
      .from('votos')
      .insert({ 
        user_id: user.id, 
        clip_id: clipId, 
        categoria_id: id 
      })

    if (error) {
      if (error.code === '23505') {
        alert("Ya has votado en esta categoría anteriormente.")
      } else {
        alert("Error al procesar el voto: " + error.message)
      }
      setVotandoId(null)
      return
    }

    // LÓGICA DE SALTO AUTOMÁTICO
    const { data: categorias } = await supabase
      .from('categorias')
      .select('id')
      .order('id', { ascending: true })

    if (categorias) {
      const currentIdx = categorias.findIndex(cat => cat.id === id)
      const nextCat = categorias[currentIdx + 1]

      if (nextCat) {
        alert("¡Voto registrado! Pasando a la siguiente categoría...")
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
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-20 selection:bg-yellow-500 selection:text-black">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA DE NAVEGACIÓN */}
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

        {/* CONTENEDOR DE NOMINADOS */}
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
              {/* ÁREA MULTIMEDIA */}
              <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
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
                  <>
                    <img 
                      src={item.url_media} 
                      alt={item.titulo} 
                      className="w-full h-full object-contain p-4 transition-transform duration-1000 group-hover:scale-105" 
                    />
                    <button 
                      onClick={() => setZoomImg(item.url_media)}
                      className="absolute top-6 right-6 bg-black/80 p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-yellow-500 hover:text-black border border-white/10"
                    >
                      <Maximize2 size={18} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full p-12 flex items-center justify-center text-center bg-slate-900/20">
                     <p className="text-2xl font-serif italic text-yellow-500/80 leading-snug">
                       "{item.url_media}"
                     </p>
                  </div>
                )}
                
                {item.tipo === 'video' && (
                  <div className="absolute bottom-6 left-6 bg-yellow-500 p-2 rounded-xl pointer-events-none group-hover:scale-0 transition-transform duration-500 shadow-lg">
                    <Play size={14} className="text-black fill-black" />
                  </div>
                )}
              </div>

              {/* PIE DE TARJETA */}
              <div className="p-10 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/40">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-[1px] w-6 bg-yellow-500/50"></div>
                    <span className="text-yellow-500 text-[9px] font-black uppercase tracking-[0.4em]">Candidato Oficial</span>
                  </div>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none transition-colors group-hover:text-yellow-500">
                    {item.titulo}
                  </h3>
                </div>
                
                {!user ? (
                  <button 
                    onClick={handleLoginGoogle}
                    className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] bg-white text-black hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 text-[10px]"
                  >
                    <LogIn size={16} /> Identificarse para votar
                  </button>
                ) : (
                  <button 
                    onClick={() => votar(item.id)}
                    disabled={votandoId !== null}
                    className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-[10px] flex items-center justify-center gap-3
                      ${votandoId === item.id 
                        ? 'bg-slate-800 text-slate-600' 
                        : 'bg-white text-black hover:bg-yellow-500 active:scale-95 shadow-2xl'}
                    `}
                  >
                    {votandoId === item.id ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <CheckCircle2 size={18} strokeWidth={3} /> Confirmar Voto
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VISUALIZADOR DE FOTOS (ZOOM) */}
      {zoomImg && (
        <div 
          className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-6 cursor-zoom-out animate-in fade-in duration-500"
          onClick={() => setZoomImg(null)}
        >
          <button className="absolute top-10 right-10 text-slate-500 hover:text-white transition-all">
            <X size={40} />
          </button>
          <img 
            src={zoomImg} 
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/5" 
            alt="Vista Expandida"
          />
        </div>
      )}

      <footer className="mt-32 text-center opacity-20 border-t border-white/5 pt-10">
        <p className="text-[9px] tracking-[1.2em] uppercase font-black">WSP Awards Ceremonial System v2.0</p>
      </footer>
    </div>
  )
}