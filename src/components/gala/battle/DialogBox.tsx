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

  // 1. Efecto de "Máquina de escribir" corregido para que no se corte
  useEffect(() => {
    setDisplayedText('')
    setIsFinished(false)
    
    let i = 0
    const interval = setInterval(() => {
      // Usamos slice para asegurar que el texto se mantenga íntegro
      setDisplayedText(texto.slice(0, i + 1))
      i++
      
      if (i >= texto.length) {
        clearInterval(interval)
        setIsFinished(true)
      }
    }, 35) // Velocidad equilibrada

    return () => clearInterval(interval)
  }, [texto])

  // 2. Lógica del ENTER / Z para avanzar manualmente
  const handleNext = useCallback((e?: KeyboardEvent) => {
    // Si viene de teclado, filtramos solo Enter o Z
    if (e && !['Enter', 'z', 'Z'].includes(e.key)) return;

    if (isFinished) {
      // Si ya terminó de escribir, avisamos al padre que queremos el siguiente texto
      onComplete()
    } else {
      // Si todavía está escribiendo, mostramos todo el texto de una vez
      setDisplayedText(texto)
      setIsFinished(true)
    }
  }, [isFinished, texto, onComplete])

  useEffect(() => {
    window.addEventListener('keydown', handleNext)
    return () => window.removeEventListener('keydown', handleNext)
  }, [handleNext])

  return (
    <div 
      className="relative w-full h-full p-6 cursor-pointer select-none overflow-hidden"
      onClick={() => handleNext()} // También permite avanzar haciendo click
    >
      <div className="min-h-[100px]">
        <p className="text-white text-2xl font-mono leading-relaxed tracking-wide italic text-left">
          * {displayedText}
          
          {/* Cursor parpadeante estilo Undertale al terminar */}
          {isFinished && (
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block ml-2 w-3 h-5 bg-white align-middle"
            />
          )}
        </p>
      </div>

      {/* Indicador visual de que puede avanzar */}
      {isFinished && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 right-6 text-[10px] text-zinc-500 uppercase tracking-[0.3em]"
        >
          [ PRESIONA ENTER ]
        </motion.p>
      )}

      <style jsx>{`
        p {
          text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
          word-break: break-word;
        }
      `}</style>
    </div>
  )
}