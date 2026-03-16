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
            if (audioEsperaRef.current) audioEsperaRef.current.pause()
            ejecutarSecuencia(categoria_activa)
          } else {
            // Cuando vuelves a IDLE en el admin, reseteamos todo para la siguiente categoría
            setFaseTexto('ninguna')
            setGanador(null)
            if (audioEsperaRef.current) {
              audioEsperaRef.current.currentTime = 0
              audioEsperaRef.current.play().catch(() => {})
            }
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

    // A los 2 segundos: "Ganador Expedition 33"
    setTimeout(() => { setFaseTexto('fake') }, 2000)

    // Consultar ganador real
    const { data: votos } = await supabase.from('votos').select('clip_id').eq('categoria_id', catId)
    if (votos && votos.length > 0) {
      const conteo = votos.reduce((acc: any, v: any) => { acc[v.clip_id] = (acc[v.clip_id] || 0) + 1; return acc }, {})
      const ganadorId = Object.keys(conteo).reduce((a, b) => conteo[a] > conteo[b] ? a : b)
      const { data: clip } = await supabase.from('clips').select('titulo').eq('id', ganadorId).single()
      setGanador(clip)
    }

    // A los 7.8 segundos: REVELACIÓN FINAL Y LOOP
    setTimeout(() => {
      setFaseTexto('real')
      
      // Lanzar confeti varias veces para el efecto "Loop" de victoria
      const duration = 15 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        
        confetti({
          particleCount: 3,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { y: 0.6 },
          colors: ['#EAB308', '#FFFFFF']
        });
      }, 250);

    }, 7800)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden text-white font-sans">
      
      <audio ref={audioEsperaRef} loop src="https://assets.mixkit.co/music/preview/mixkit-cinematic-mystery-suspense-675.mp3" />

      {/* VIDEO DEL SUSTO */}
      <video 
        ref={videoRef}
        src="https://wybvfhlgezisfgpnrola.supabase.co/storage/v1/object/public/media/gano%20expedition.mp4" 
        className={`fixed inset-0 w-full h-full object-cover z-50 transition-opacity duration-500 ${estado === 'activar_susto' ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* CAPA DE TEXTO Y CELEBRACIÓN */}
      <div className="z-[60] text-center w-full max-w-7xl px-4">
        
        {/* FASE FAKE (Expedition) */}
        {faseTexto === 'fake' && (
          <div className="animate-in fade-in zoom-in duration-500">
            <h2 className="text-yellow-500 font-black italic text-4xl mb-4 tracking-[0.3em]">{categoria}</h2>
            <h1 className="text-white font-black italic text-6xl md:text-9xl uppercase">
              EL GANADOR ES: <br/> <span className="text-yellow-400">EXPEDITION 33</span>
            </h1>
          </div>
        )}

        {/* FASE REAL (Bucle de Ganador) */}
        {faseTexto === 'real' && ganador && (
          <div className="relative">
            {/* Resplandor de fondo para el ganador */}
            <div className="absolute inset-0 bg-yellow-500/20 blur-[120px] rounded-full animate-pulse" />
            
            <div className="relative animate-in zoom-in duration-700">
              <h2 className="text-yellow-500 font-black italic text-4xl uppercase tracking-[0.5em] mb-6 drop-shadow-lg">
                ¡GANADOR OFICIAL {categoria}!
              </h2>
              
              <div className="overflow-hidden py-4">
                <h1 className="text-white font-black italic text-8xl md:text-[13rem] uppercase leading-none drop-shadow-[0_0_60px_rgba(255,255,255,0.3)] animate-bounce">
                  {ganador.titulo}
                </h1>
              </div>

              <div className="mt-10 flex items-center justify-center gap-8 opacity-50">
                <div className="h-[2px] w-24 bg-gradient-to-r from-transparent to-white" />
                <span className="font-black uppercase tracking-[1em] text-xs">The 2026 Experience</span>
                <div className="h-[2px] w-24 bg-gradient-to-l from-transparent to-white" />
              </div>
            </div>
          </div>
        )}

        {/* SALA DE ESPERA (IDLE) */}
        {estado === 'idle' && (
          <div className="animate-in fade-in duration-1000 flex flex-col items-center" onClick={() => audioEsperaRef.current?.play()}>
             <img src="/logo-premios.png" className="h-40 mb-10 opacity-50" alt="" />
             <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white/80">SALA DE ESPERA</h2>
             <p className="text-yellow-500 font-bold uppercase tracking-[0.8em] text-xs mt-4 animate-pulse">Preparando siguiente categoría...</p>
          </div>
        )}
      </div>
    </div>
  )
}