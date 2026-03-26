'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'
import BattleMain from '@/components/gala/battle' 
import GlitchTransition from '@/components/gala/battle/GlitchTransition'
import { motion, AnimatePresence } from 'framer-motion' // 🚀 Importado para las animaciones épicas

export default function LiveGala() {
  // --- ESTADOS ORIGINALES ---
  const [estado, setEstado] = useState('idle')
  const [ganador, setGanador] = useState<any>(null)
  const [categoria, setCategoria] = useState('')
  const [faseTexto, setFaseTexto] = useState<'ninguna' | 'fake' | 'real'>('ninguna')
  const [mostrandoGlitch, setMostrandoGlitch] = useState(false)

  // 🔒 CONTROL DE ACCESO (Tu solución intacta)
  const [bloqueado, setBloqueado] = useState(true)
  const [loadingAccess, setLoadingAccess] = useState(true)

  // --- REFERENCIAS ---
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioEsperaRef = useRef<HTMLAudioElement>(null)
  const confettiIntervalRef = useRef<any>(null)

  // =========================
  // 🔒 VALIDACIÓN DE ACCESO
  // =========================
  useEffect(() => {
    const checkAcceso = async () => {
      setLoadingAccess(true)

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setBloqueado(true)
        setLoadingAccess(false)
        return
      }

      const { data: categorias } = await supabase.from('categorias').select('id')
      const { data: votos } = await supabase.from('votos').select('categoria_id').eq('user_id', user.id)

      if (!categorias || !votos) {
        setBloqueado(true)
        setLoadingAccess(false)
        return
      }

      // 🔥 TU SOLUCIÓN: Evitar duplicados
      const categoriasUnicas = [...new Set(votos.map(v => String(v.categoria_id)))]
      const completo = categoriasUnicas.length === categorias.length

      setBloqueado(!completo)
      setLoadingAccess(false)
    }

    checkAcceso()
  }, [])

  // =========================
  // ⚙️ LÓGICA ORIGINAL DE LA GALA
  // =========================
  useEffect(() => {
    const cargarEstadoInicial = async () => {
      const { data } = await supabase
        .from('config_gala')
        .select('*')
        .eq('id', 'main_config')
        .single()

      if (data) {
        if (data.estado_revelacion === 'combate_asriel') {
          setEstado('idle')
        } else {
          setEstado(data.estado_revelacion)
        }
        setCategoria(data.categoria_en_pantalla)

        if (data.estado_revelacion === 'activar_susto') {
          ejecutarSecuencia(data.categoria_activa)
        }
      }
    }

    cargarEstadoInicial()

    const channel = supabase
      .channel('cambios_gala')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'config_gala' },
        (payload) => {
          const { estado_revelacion, categoria_activa, categoria_en_pantalla } = payload.new

          if (estado_revelacion === 'combate_asriel') {
            setMostrandoGlitch(true)
            
            if (audioEsperaRef.current) audioEsperaRef.current.pause()
            if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current)
            
            setTimeout(() => {
              setMostrandoGlitch(false)
              setEstado('combate_asriel')
            }, 1500)
          } else {
            setEstado(estado_revelacion)
          }

          setCategoria(categoria_en_pantalla)

          if (estado_revelacion === 'activar_susto') {
            if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current)
            if (audioEsperaRef.current) audioEsperaRef.current.pause()
            ejecutarSecuencia(categoria_activa)
          } 
          else if (estado_revelacion === 'idle') {
            if (audioEsperaRef.current) {
              audioEsperaRef.current.currentTime = 0
              audioEsperaRef.current.play().catch(() => {})
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current)
    }
  }, [])

  const ejecutarSecuencia = async (catId: string) => {
    setFaseTexto('ninguna')

    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }

    setTimeout(() => setFaseTexto('fake'), 2000)

    const { data: votos } = await supabase.from('votos').select('clip_id').eq('categoria_id', catId)

    if (votos && votos.length > 0) {
      const conteo = votos.reduce((acc: any, v: any) => {
        acc[v.clip_id] = (acc[v.clip_id] || 0) + 1
        return acc
      }, {})

      const ganadorId = Object.keys(conteo).reduce((a, b) => conteo[a] > conteo[b] ? a : b)

      const { data: clip } = await supabase.from('clips').select('titulo, tipo, url_media').eq('id', ganadorId).single()
      setGanador(clip)
    }

    setTimeout(() => {
      setFaseTexto('real')

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 200 })

      confettiIntervalRef.current = setInterval(() => {
        confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0 }, zIndex: 200 })
        confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1 }, zIndex: 200 })
      }, 3000)

    }, 7800)
  }

  // =========================
  // 🔒 RENDER DE BLOQUEO
  // =========================
  if (loadingAccess) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="tracking-widest uppercase text-xs text-slate-400">Verificando credenciales...</p>
      </div>
    )
  }

  if (bloqueado) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center text-center px-6 text-white">
        <div className="bg-red-500/10 p-6 rounded-full mb-6">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-black italic mb-4 uppercase text-white tracking-tighter">
          ACCESO <span className="text-red-500">RESTRINGIDO</span>
        </h1>
        <p className="text-slate-400 uppercase tracking-widest text-xs mb-10 max-w-md leading-relaxed">
          Debes completar todas tus votaciones en las categorías oficiales antes de ingresar a la gala en vivo.
        </p>
        <button
          onClick={() => window.location.href = '/votar'}
          className="bg-white text-black hover:bg-yellow-500 transition-colors px-10 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]"
        >
          Completar mis votos
        </button>
      </div>
    )
  }

  // =========================
  // 🎬 RENDER ORIGINAL DE LA GALA
  // =========================
  if (mostrandoGlitch) return <GlitchTransition />
  
  if (estado === 'combate_asriel') {
    return (
      <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-1000">
        <BattleMain />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-yellow-500/30">
      
      {/* 🎵 AUDIO DE ESPERA */}
      <audio ref={audioEsperaRef} src="/music/espera.mp3" loop />

      {/* 📺 ESTADO 1: IDLE (ESPERA) */}
      {estado === 'idle' && (
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 bg-yellow-500/10 blur-[100px] rounded-full w-96 h-96 -z-10 animate-pulse" />
          <h1 className="text-6xl md:text-8xl text-white font-black tracking-tighter uppercase italic drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            GALA <span className="text-yellow-500">LIVE</span>
          </h1>
          <p className="text-slate-500 tracking-[0.6em] text-xs font-bold uppercase mt-6">
            Esperando al presentador...
          </p>
        </div>
      )}

      {/* 🏆 ESTADO 2: REVELACIÓN (SUSPENSO Y GANADOR) */}
      {estado === 'activar_susto' && (
        <>
          {/* VIDEO DE FONDO */}
          <video
            ref={videoRef}
            src="/videos/transicion.mp4"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 w-full max-w-6xl">
            
            {/* TÍTULO DE LA CATEGORÍA */}
            <h2 className="text-2xl md:text-3xl text-yellow-500 font-black tracking-[0.3em] uppercase mb-16 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
              {categoria}
            </h2>

            <div className="min-h-[300px] flex items-center justify-center w-full">
              <AnimatePresence mode="wait">
                
                {/* ❌ FASE 1: FAKE (EL SUSPENSO) */}
                {faseTexto === 'fake' && (
                  <motion.div
                    key="fake"
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    transition={{ duration: 0.8 }}
                    className="text-white text-5xl md:text-7xl font-black tracking-widest uppercase italic"
                  >
                    Y el ganador es...
                  </motion.div>
                )}

                {/* ✅ FASE 2: REAL (EL GANADOR CON FUENTE EXPEDITION) */}
                {faseTexto === 'real' && ganador && (
                  <motion.div
                    key="real"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, type: "spring" }}
                    className="flex flex-col items-center w-full"
                  >
                    {/* FUENTE EXPEDITION APLICADA AQUÍ */}
                    <h1 
                      className="text-6xl md:text-9xl text-white uppercase text-center drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                      style={{ 
                        fontFamily: "'Expedition', 'Cinzel', serif", 
                        fontWeight: 900, 
                        letterSpacing: '0.05em',
                        lineHeight: '1.1'
                      }}
                    >
                      {ganador.titulo}
                    </h1>

                    {/* MEDIA DEL GANADOR (Foto o Video) */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
                      className="mt-12 rounded-[2rem] overflow-hidden border-4 border-yellow-500 shadow-[0_0_80px_rgba(234,179,8,0.4)] max-w-3xl w-full aspect-video bg-[#0a0c10] relative"
                    >
                      {ganador.tipo === 'video' ? (
                        <video src={ganador.url_media} className="w-full h-full object-cover" autoPlay loop muted />
                      ) : ganador.tipo === 'foto' ? (
                        <img src={ganador.url_media} className="w-full h-full object-cover" alt="Ganador" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-900 to-black">
                          <span className="text-yellow-500 text-3xl font-serif italic drop-shadow-lg">
                            "{ganador.url_media}"
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </div>
  )
}