'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface DialogBoxProps {
  texto: string
  onComplete: () => void
}

export default function DialogBox({ texto, onComplete }: DialogBoxProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isFinished, setIsFinished] = useState(false)

  // Resetear y escribir cuando cambia el texto
  useEffect(() => {
    setDisplayedText('')
    setIsFinished(false)
    
    let i = 0
    const interval = setInterval(() => {
      // Usamos el texto original para evitar recortes por estados intermedios
      setDisplayedText(texto.slice(0, i + 1))
      i++
      
      if (i >= texto.length) {
        clearInterval(interval)
        setIsFinished(true)
      }
    }, 40) // Velocidad estándar de Undertale

    return () => clearInterval(interval)
  }, [texto])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z') {
      if (isFinished) {
        onComplete()
      } else {
        // Saltar animación y mostrar todo
        setDisplayedText(texto)
        setIsFinished(true)
      }
    }
  }, [isFinished, texto, onComplete])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div 
      className="w-full h-full p-5 cursor-pointer select-none overflow-hidden"
      onClick={() => handleKeyDown({ key: 'Enter' } as any)}
    >
      {/* Min-height para que la caja no colapse mientras escribe */}
      <div className="min-h-[100px]">
        <p className="text-white text-2xl font-mono leading-relaxed tracking-wide italic text-left">
          * {displayedText}
          {isFinished && (
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block ml-2 w-3 h-5 bg-white align-middle"
            />
          )}
        </p>
      </div>

      {isFinished && (
        <p className="absolute bottom-2 right-4 text-[10px] text-gray-500 uppercase tracking-[0.2em] animate-pulse">
          [ Enter ]
        </p>
      )}
    </div>
  )
}