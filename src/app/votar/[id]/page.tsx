'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'
import BattleMain from '@/components/gala/battle' 
import GlitchTransition from '@/components/gala/battle/GlitchTransition'

export default function LiveGala() {
  // --- ESTADOS ORIGINALES ---
  const [estado, setEstado] = useState('idle')
  const [ganador, setGanador] = useState<any>(null)
  const [categoria, setCategoria] = useState('')
  const [faseTexto, setFaseTexto] = useState<'ninguna' | 'fake' | 'real'>('ninguna')
  
  // --- TRANSICIÓN ---
  const [mostrandoGlitch, setMostrandoGlitch] = useState(false)

  // 🔒 NUEVO: CONTROL DE ACCESO
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

      const { data: categorias } = await supabase
        .from('categorias')
        .select('id')

      const { data: votos } = await supabase
        .from('votos')
        .select('categoria_id')
        .eq('user_id', user.id)

      if (!categorias || !votos) {
        setBloqueado(true)
        setLoadingAccess(false)
        return
      }

      // ✅ evitar duplicados
      const categoriasUnicas = [...new Set(votos.map(v => v.categoria_id))]

      const completo = categoriasUnicas.length === categorias.length

      setBloqueado(!completo)
      setLoadingAccess(false)
    }

    checkAcceso()
  }, [])

  // =========================
  // ⚙️ LÓGICA ORIGINAL
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

    const { data: votos } = await supabase
      .from('votos')
      .select('clip_id')
      .eq('categoria_id', catId)

    if (votos && votos.length > 0) {
      const conteo = votos.reduce((acc: any, v: any) => {
        acc[v.clip_id] = (acc[v.clip_id] || 0) + 1
        return acc
      }, {})

      const ganadorId = Object.keys(conteo).reduce((a, b) =>
        conteo[a] > conteo[b] ? a : b
      )

      const { data: clip } = await supabase
        .from('clips')
        .select('titulo, tipo, url_media')
        .eq('id', ganadorId)
        .single()

      setGanador(clip)
    }

    setTimeout(() => {
      setFaseTexto('real')

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      })

      confettiIntervalRef.current = setInterval(() => {
        confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0 } })
        confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1 } })
      }, 3000)

    }, 7800)
  }

  // =========================
  // 🚫 BLOQUEO
  // =========================
  if (loadingAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Verificando acceso...
      </div>
    )
  }

  if (bloqueado) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6 text-white">
        
        <h1 className="text-4xl font-black italic mb-6">
          ACCESO BLOQUEADO
        </h1>

        <p className="text-slate-400 uppercase tracking-widest text-xs mb-8 max-w-md">
          Debes completar todas las categorías antes de ingresar a la gala en vivo.
        </p>

        <button
          onClick={() => window.location.href = '/votar'}
          className="bg-yellow-500 text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest"
        >
          Terminar votación
        </button>
      </div>
    )
  }

  // =========================
  // 🎬 RENDER ORIGINAL
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
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center overflow-hidden text-white font-sans relative">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.08),transparent_70%)] pointer-events-none" />

      <audio
        ref={audioEsperaRef}
        loop
        src="https://assets.mixkit.co/music/preview/mixkit-cinematic-mystery-suspense-675.mp3"
      />

      <video
        ref={videoRef}
        loop
        src="https://wybvfhlgezisfgpnrola.supabase.co/storage/v1/object/public/media/gano%20expedition.mp4"
        className={`fixed inset-0 w-full h-full object-cover z-50 transition-opacity duration-700 ${
          estado === 'activar_susto' ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="z-[60] text-center w-full max-w-[90vw]">
        {estado === 'idle' && (
          <div className="animate-in fade-in duration-1000 flex flex-col items-center">
            <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tight text-white/30">
              GALA WSP
            </h2>
            <p className="text-yellow-500 font-bold uppercase tracking-[1em] text-[10px] mt-6 animate-pulse">
              Esperando señal del administrador...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}