'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'

export default function LiveGala() {
  const [estado, setEstado] = useState('idle')
  const [ganador, setGanador] = useState<any>(null)
  const [categoria, setCategoria] = useState('')
  const [faseTexto, setFaseTexto] = useState<'ninguna' | 'fake' | 'real'>('ninguna')

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioEsperaRef = useRef<HTMLAudioElement>(null)
  const confettiIntervalRef = useRef<any>(null)

  useEffect(() => {
    const cargarEstadoInicial = async () => {
      const { data } = await supabase
        .from('config_gala')
        .select('*')
        .eq('id', 'main_config')
        .single()

      if (data) {
        setEstado(data.estado_revelacion)
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

          setEstado(estado_revelacion)
          setCategoria(categoria_en_pantalla)

          if (estado_revelacion === 'activar_susto') {
            if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current)
            if (audioEsperaRef.current) audioEsperaRef.current.pause()

            ejecutarSecuencia(categoria_activa)
          } else {
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

    setTimeout(() => {
      setFaseTexto('fake')
    }, 2000)

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
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#EAB308', '#FFFFFF']
        })

        confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#EAB308', '#FFFFFF']
        })
      }, 3000)

    }, 7800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center overflow-hidden text-white font-sans relative">

      {/* ✨ iluminación tipo escenario */}
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

        {/* 🔥 FAKE GANADOR */}
        {faseTexto === 'fake' && (
          <div className="animate-in fade-in zoom-in duration-700 ease-out px-4">
            <h2 className="text-yellow-500 font-black italic text-3xl mb-4 tracking-[0.3em] uppercase">
              {categoria}
            </h2>

            <h1 className="text-white font-black italic text-5xl md:text-8xl uppercase leading-tight tracking-tight drop-shadow-[0_10px_40px_rgba(255,255,255,0.2)]">
              EL GANADOR ES:
              <br />
              <span className="text-yellow-400">EXPEDITION 33</span>
            </h1>
          </div>
        )}

        {/* 🏆 GANADOR REAL */}
        {faseTexto === 'real' && ganador && (
          <div className="relative flex flex-col items-center justify-center min-h-screen py-10">

            {/* Glow elegante */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[600px] h-[600px] bg-yellow-400/20 blur-[180px] rounded-full animate-pulse" />
            </div>

            <div className="relative animate-in zoom-in duration-700 space-y-6 w-full flex flex-col items-center">

              <h2 className="text-yellow-500 font-black italic text-2xl md:text-4xl uppercase tracking-[0.4em] drop-shadow-lg">
                ¡GANADOR OFICIAL!
              </h2>

              {/* 🎬 TARJETA PREMIUM */}
              <div className="w-full max-w-4xl aspect-video rounded-3xl overflow-hidden border border-yellow-400/30 shadow-[0_0_80px_rgba(234,179,8,0.25)] bg-black backdrop-blur-md relative">

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

                {ganador.tipo === 'video' && (
                  <video
                    src={ganador.url_media}
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                )}

                {ganador.tipo === 'foto' && (
                  <img
                    src={ganador.url_media}
                    className="w-full h-full object-contain"
                    alt="Ganador"
                  />
                )}

                {ganador.tipo === 'texto' && (
                  <div className="w-full h-full flex items-center justify-center p-10 bg-gradient-to-br from-yellow-900/20 to-black">
                    <p className="text-white font-black italic uppercase text-4xl md:text-6xl text-center">
                      "{ganador.url_media}"
                    </p>
                  </div>
                )}
              </div>

              {/* 🧾 INFO */}
              <div className="text-center">
                <p className="text-white/40 font-bold uppercase tracking-[0.8em] text-xs italic mb-2">
                  {categoria}
                </p>

                <h1 className="text-white font-black italic text-4xl md:text-7xl uppercase leading-none tracking-tight drop-shadow-[0_10px_60px_rgba(255,255,255,0.5)]">
                  {ganador.titulo}
                </h1>
              </div>

              {/* 🔹 separador */}
              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="h-[1px] w-20 bg-yellow-500/50" />
                <span className="text-yellow-400 font-bold uppercase tracking-[1.2em] text-[10px] opacity-80">
                  THE EXPERIENCE
                </span>
                <div className="h-[1px] w-20 bg-yellow-500/50" />
              </div>

            </div>
          </div>
        )}

        {/* ⏳ IDLE */}
        {estado === 'idle' && (
          <div
            className="animate-in fade-in duration-1000 flex flex-col items-center cursor-pointer"
            onClick={() => audioEsperaRef.current?.play()}
          >
            <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tight text-white/30 drop-shadow-lg">
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