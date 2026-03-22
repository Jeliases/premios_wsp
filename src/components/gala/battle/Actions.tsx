'use client'
import { useState, useEffect } from 'react'
import { LostSoul } from '@/lib/battle-config'
import { motion } from 'framer-motion'

interface ActionsProps {
  amigo: LostSoul
  onAction: (esCorrecta: boolean, respuesta: string) => void
}

export default function Actions({ amigo, onAction }: ActionsProps) {
  // Estado para evitar el "doble clic" accidental que rompe la fase
  const [yaSeleccionado, setYaSeleccionado] = useState(false)

  // Cada vez que el amigo cambie (ej: de Ronaldo a Indira), reseteamos el botón
  useEffect(() => {
    setYaSeleccionado(false)
  }, [amigo.nombre])

  const handleSelection = (esCorrecta: boolean, respuesta: string) => {
    if (yaSeleccionado) return // Si ya hizo clic, ignoramos el resto
    
    setYaSeleccionado(true)
    onAction(esCorrecta, respuesta)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-[600px] p-4 bg-black/90 border-2 border-orange-900/50 relative z-50"
    >
      {amigo.acciones.map((opcion, index) => (
        <button
          key={`${amigo.nombre}-action-${index}`}
          disabled={yaSeleccionado} // 🔒 Bloqueo físico del botón
          onClick={() => handleSelection(opcion.esCorrecta, opcion.respuesta)}
          onMouseEnter={() => {
            if (!yaSeleccionado) {
              const audio = new Audio('/sfx/select.mp3')
              audio.volume = 0.2
              audio.play().catch(() => {})
            }
          }}
          className={`
            relative border-2 p-3 text-left font-mono uppercase transition-all duration-200 group
            ${yaSeleccionado 
              ? 'border-zinc-800 text-zinc-700 opacity-50 cursor-default' 
              : 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black active:scale-95'
            }
          `}
        >
          {/* El corazón clásico de Undertale en el Hover */}
          <span className="inline-block w-4 mr-2 transition-opacity opacity-0 group-hover:opacity-100 text-red-500">
            ❤
          </span>
          <span className="text-sm md:text-base">* {opcion.texto}</span>
        </button>
      ))}
      
      {/* Botón de Piedad (Siempre bloqueado para mantener la estética original) */}
      <button 
        disabled 
        className="border-2 border-zinc-800 p-3 text-zinc-700 text-sm md:text-base font-mono uppercase text-left opacity-30"
      >
        <span className="inline-block w-4 mr-2"> </span>
        * PIEDAD
      </button>

      {/* Mini estilo para asegurar que el grid no se rompa en móvil */}
      <style jsx>{`
        button {
          text-shadow: 1px 1px 0px black;
          word-break: break-word;
          min-height: 50px;
        }
      `}</style>
    </motion.div>
  )
}