'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function PantallaGalaLive() {
  const [estado, setEstado] = useState('idle')
  const [ganador, setGanador] = useState<string | null>(null)
  const [ready, setReady] = useState(false) // <--- CRÍTICO: Para desbloquear el audio
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const channel = supabase
      .channel('cambios_gala')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'config_gala', filter: 'id=eq.main_config' }, 
        (payload) => {
          const { estado_revelacion, categoria_activa } = payload.new
          setEstado(estado_revelacion)

          if (estado_revelacion === 'activar_susto') {
            reproducirSustoYGanador(categoria_activa)
          } else if (estado_revelacion === 'idle') {
            // Limpiamos el ganador cuando el admin vuelve a modo espera
            setGanador(null)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const reproducirSustoYGanador = async (catId: string) => {
    // 1. Limpiar ganador anterior antes de empezar el nuevo video
    setGanador(null)

    // 2. Iniciar video
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(e => console.error("Error autoplay:", e))
    }

    // 3. Buscar ganador real
    const { data: votos } = await supabase.from('votos').select('clip_id').eq('categoria_id', catId)
    
    if (votos && votos.length > 0) {
      const conteo = votos.reduce((acc: any, v: any) => {
        acc[v.clip_id] = (acc[v.clip_id] || 0) + 1
        return acc
      }, {})
      const ganadorId = Object.keys(conteo).reduce((a, b) => conteo[a] > conteo[b] ? a : b)
      const { data: clip } = await supabase.from('clips').select('titulo').eq('id', ganadorId).single()
      
      // 4. Mostrar nombre después del susto
      setTimeout(() => {
        setGanador(clip?.titulo || 'Desconocido')
      }, 7000)
    }
  }

  // Si no ha hecho clic, mostramos pantalla de "Entrar"
  if (!ready) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <button 
          onClick={() => setReady(true)}
          className="px-8 py-4 bg-yellow-500 text-black font-black uppercase italic rounded-full hover:scale-105 transition-transform"
        >
          🔊 Conectar con la Gala
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white overflow-hidden font-sans">
      <video 
        ref={videoRef}
        src="https://wybvfhlgezisfgpnrola.supabase.co/storage/v1/object/public/media/gano%20expedition.mp4" 
        className={`fixed inset-0 w-full h-full object-cover z-10 transition-opacity duration-500 ${estado === 'activar_susto' ? 'opacity-100' : 'opacity-0'}`}
        playsInline
      />

      {ganador && (
        <div className="z-20 text-center animate-in zoom-in fade-in duration-700">
          <h2 className="text-2xl font-black text-yellow-500 mb-2 uppercase italic tracking-widest drop-shadow-lg">EL GANADOR ES:</h2>
          <h1 className="text-8xl md:text-9xl font-black italic text-white uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
            {ganador}
          </h1>
        </div>
      )}

      {estado === 'idle' && !ganador && (
        <div className="flex flex-col items-center gap-4 opacity-10 font-black uppercase tracking-[0.5em]">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p>Sincronizado</p>
        </div>
      )}
    </div>
  )
}