'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'

export default function LiveGala() {
  const [estado, setEstado] = useState('idle')
  const [ganador, setGanador] = useState<any>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // 1. Cargar configuración inicial
    const fetchInitialConfig = async () => {
      const { data } = await supabase
        .from('config_gala')
        .select('*')
        .eq('id', 'main_config')
        .single()
      
      if (data) {
        setEstado(data.estado_revelacion)
        setVideoUrl(data.video_fakeout)
      }
    }

    fetchInitialConfig()

    // 2. ESCUCHAR EN TIEMPO REAL (Aquí ocurre la magia)
    const channel = supabase
      .channel('gala_realtime')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'config_gala', filter: 'id=eq.main_config' }, 
        (payload) => {
          const newData = payload.new
          setEstado(newData.estado_revelacion)

          if (newData.estado_revelacion === 'activar_susto') {
            ejecutarRevelacion(newData.categoria_activa)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const ejecutarRevelacion = async (categoriaId: string) => {
    // A. Play al video de Expedition 33 (Fakeout)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }

    // B. Buscar quién es el ganador real (el que tiene más votos en esa categoría)
    const { data: votos } = await supabase
      .from('votos')
      .select('clip_id')
      .eq('categoria_id', categoriaId) // Asegúrate de que esta lógica coincida con tu DB

    // Lógica simplificada: aquí deberías hacer el conteo de votos para sacar al ganador real
    // Por ahora, buscaremos el nominado con más votos o simplemente el primero para probar
    const { data: nominado } = await supabase
      .from('clips')
      .select('*')
      .eq('categoria_id', categoriaId)
      .limit(1)
      .single()

    // C. Esperar a que el video llegue al momento del susto (ej: 7 segundos)
    setTimeout(() => {
      setGanador(nominado)
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    }, 7000)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden text-white">
      
      {/* CAPA 1: VIDEO FAKEOUT (Solo se ve cuando el estado es activar_susto) */}
      <video 
        ref={videoRef}
        src={videoUrl}
        className={`fixed inset-0 w-full h-full object-cover z-50 transition-opacity duration-500 ${estado === 'activar_susto' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* CAPA 2: EL GANADOR REAL (Aparece después del susto) */}
      {ganador && (
        <div className="z-[60] text-center animate-in zoom-in duration-700">
          <h2 className="text-2xl font-black uppercase tracking-widest text-yellow-500 mb-2">EL GANADOR ES:</h2>
          <h1 className="text-7xl font-black italic uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
            {ganador.titulo}
          </h1>
        </div>
      )}

      {/* ESTADO DE ESPERA */}
      {estado === 'idle' && !ganador && (
        <div className="text-slate-800 font-black text-4xl uppercase italic opacity-20">
          Esperando señal de control...
        </div>
      )}
    </div>
  )
}