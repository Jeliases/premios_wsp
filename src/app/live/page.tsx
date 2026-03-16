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

  useEffect(() => {
    const channel = supabase
      .channel('cambios_gala')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'config_gala' }, 
        (payload) => {
          const { estado_revelacion, categoria_activa, categoria_en_pantalla } = payload.new
          setEstado(estado_revelacion)
          setCategoria(categoria_en_pantalla)

          if (estado_revelacion === 'activar_susto') {
            // Pausar música de espera y ejecutar show
            if (audioEsperaRef.current) audioEsperaRef.current.pause()
            ejecutarSecuencia(categoria_activa)
          } else {
            setFaseTexto('ninguna')
            setGanador(null)
            // Volver a poner música de espera si vuelve a idle
            if (audioEsperaRef.current) audioEsperaRef.current.play().catch(() => {})
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const ejecutarSecuencia = async (catId: string) => {
    setFaseTexto('ninguna')
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }

    setTimeout(() => { setFaseTexto('fake') }, 2000)

    const { data: votos } = await supabase.from('votos').select('clip_id').eq('categoria_id', catId)
    if (votos && votos.length > 0) {
      const conteo = votos.reduce((acc: any, v: any) => { acc[v.clip_id] = (acc[v.clip_id] || 0) + 1; return acc }, {})
      const ganadorId = Object.keys(conteo).reduce((a, b) => conteo[a] > conteo[b] ? a : b)
      const { data: clip } = await supabase.from('clips').select('titulo').eq('id', ganadorId).single()
      setGanador(clip)
    }

    setTimeout(() => {
      setFaseTexto('real')
      confetti({ particleCount: 250, spread: 100, origin: { y: 0.5 }, colors: ['#EAB308', '#FFFFFF', '#4F46E5'] })
    }, 7800) // Ajustado al momento del susto
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden text-white font-sans">
      
      {/* Música de ambiente (Solo suena si el usuario hace un click previo) */}
      <audio ref={audioEsperaRef} loop src="https://assets.mixkit.co/music/preview/mixkit-cinematic-mystery-suspense-675.mp3" />

      {/* FONTO ANIMADO DE ESPERA */}
      {estado === 'idle' && (
        <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-black to-black" />
            <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-transparent to-transparent animate-pulse" />
        </div>
      )}

      {/* VIDEO DEL SUSTO */}
      <video 
        ref={videoRef}
        src="https://wybvfhlgezisfgpnrola.supabase.co/storage/v1/object/public/media/gano%20expedition.mp4" 
        className={`fixed inset-0 w-full h-full object-cover z-50 transition-opacity duration-500 ${estado === 'activar_susto' ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* INTERFAZ DE TEXTOS */}
      <div className="z-[60] text-center w-full max-w-5xl px-4">
        
        {/* FASE 1: FAKE REVEAL */}
        {faseTexto === 'fake' && (
          <div className="animate-in zoom-in spin-in-1 duration-500">
            <h2 className="text-yellow-500 font-black italic text-4xl uppercase tracking-[0.5em] mb-4 drop-shadow-[0_5px_15px_rgba(234,179,8,0.4)]">
              {categoria}
            </h2>
            <h1 className="text-white font-black italic text-6xl md:text-[8rem] uppercase leading-none drop-shadow-2xl">
              EL GANADOR ES: <br/> 
              <span className="text-yellow-400 underline decoration-white/20">EXPEDITION 33</span>
            </h1>
          </div>
        )}

        {/* FASE 2: REAL REVEAL */}
        {faseTexto === 'real' && ganador && (
          <div className="animate-in zoom-in duration-300">
             <div className="inline-block px-8 py-2 bg-indigo-600 text-white font-black uppercase italic tracking-widest mb-6 skew-x-[-12deg]">
                ¡RESULTADO OFICIAL!
             </div>
             <h2 className="text-white/50 font-black text-2xl uppercase tracking-[0.6em] mb-2 italic">
               {categoria}
            </h2>
            <h1 className="text-white font-black italic text-8xl md:text-[12rem] uppercase leading-none drop-shadow-[0_0_80px_rgba(255,255,255,0.4)]">
              {ganador.titulo}
            </h1>
          </div>
        )}

        {/* VISTA DE ESPERA PARA EL PÚBLICO */}
        {estado === 'idle' && (
          <div className="relative group cursor-pointer" onClick={() => audioEsperaRef.current?.play()}>
            <div className="mb-12 relative inline-block">
                <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <img src="/logo-premios.png" className="h-48 relative z-10 mx-auto" alt="Logo" />
            </div>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
              Sala de Espera
            </h2>
            <p className="text-yellow-500 font-bold uppercase tracking-[1em] text-sm animate-pulse">
               • El presentador revelará los ganadores pronto •
            </p>
            <p className="mt-10 text-slate-600 text-[10px] uppercase font-black tracking-widest">
                Haz clic en cualquier lugar para activar el sonido de la sala
            </p>
          </div>
        )}
      </div>
    </div>
  )
}