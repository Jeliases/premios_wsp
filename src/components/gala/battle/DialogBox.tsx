'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

interface DialogBoxProps {
  texto: string
  onComplete: () => void
}

export default function DialogBox({ texto, onComplete }: DialogBoxProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isFinished, setIsFinished] = useState(false)
  const [haTerminadoFrase, setHaTerminadoFrase] = useState(false) // 🔒 El "Seguro"
  const soundRef = useRef<HTMLAudioElement | null>(null)

  // 1. Cargar sonido de bleep (opcional)
  useEffect(() => {
    soundRef.current = new Audio('/sfx/bleep.mp3')
    soundRef.current.volume = 0.2
  }, [])

  // 2. Resetear estados cuando cambia la frase
  useEffect(() => {
    setDisplayedText('')
    setIsFinished(false)
    setHaTerminadoFrase(false) // Abrimos el seguro para la nueva frase
    
    let i = 0
    const interval = setInterval(() => {
      setDisplayedText(texto.slice(0, i + 1))
      
      // Sonido cada 2 letras (estilo RPG)
      if (soundRef.current && i % 2 === 0 && texto.charAt(i) !== ' ') {
        soundRef.current.currentTime = 0
        soundRef.current.play().catch(() => {})
      }
      
      i++
      if (i >= texto.length) {
        clearInterval(interval)
        setIsFinished(true)
      }
    }, 35)

    return () => clearInterval(interval)
  }, [texto])

  // 3. Manejo del Enter con bloqueo de doble ejecución
  const handleNext = useCallback((e?: KeyboardEvent) => {
    // Solo permitimos Enter o Z
    if (e && !['Enter', 'z', 'Z'].includes(e.key)) return;

    if (isFinished) {
      // --- EL SEGURO ANTI-SPAM ---
      if (haTerminadoFrase) return; // Si ya se mandó el onComplete, ignoramos el resto de Enters
      
      setHaTerminadoFrase(true); // Cerramos el seguro inmediatamente
      onComplete(); 
    } else {
      // Si todavía escribe, mostramos todo de golpe
      setDisplayedText(texto)
      setIsFinished(true)
    }
  }, [isFinished, haTerminadoFrase, texto, onComplete])

  useEffect(() => {
    window.addEventListener('keydown', handleNext)
    return () => window.removeEventListener('keydown', handleNext)
  }, [handleNext])

  return (
    <div 
      className="relative w-full h-full p-6 cursor-pointer select-none overflow-hidden"
      onClick={() => handleNext()} 
    >
      <div className="min-h-[100px]">
        <p className="text-white text-xl md:text-2xl font-mono leading-relaxed tracking-wide italic text-left">
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
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 right-6 text-[10px] text-zinc-600 uppercase tracking-[0.3em]"
        >
          [ ENTER ]
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