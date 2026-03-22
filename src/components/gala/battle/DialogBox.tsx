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
  const [haTerminadoFrase, setHaTerminadoFrase] = useState(false) 
  const soundRef = useRef<HTMLAudioElement | null>(null)

  // Cargar sonido de tipeo
  useEffect(() => {
    soundRef.current = new Audio('/sfx/bleep.mp3')
    soundRef.current.volume = 0.2
  }, [])

  // Efecto de máquina de escribir
  useEffect(() => {
    setDisplayedText('');
    setIsFinished(false);
    setHaTerminadoFrase(false); 
    
    if (!texto) return;

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(texto.slice(0, i + 1));
      
      if (soundRef.current && i % 2 === 0 && texto.charAt(i) !== ' ') {
        soundRef.current.currentTime = 0;
        soundRef.current.play().catch(() => {});
      }
      
      i++;
      if (i >= texto.length) {
        clearInterval(interval);
        setIsFinished(true);
      }
    }, 35); 

    return () => clearInterval(interval);
  }, [texto]);

  // Manejo de la tecla Enter / Z para avanzar
  const handleNext = useCallback((e?: KeyboardEvent) => {
    if (e && !['Enter', 'z', 'Z'].includes(e.key)) return;

    if (isFinished) {
      if (haTerminadoFrase) return; 
      
      setHaTerminadoFrase(true); 
      onComplete(); 
    } else {
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
      className="relative w-full h-full p-6 cursor-pointer select-none overflow-hidden bg-black border-[4px] border-white"
      onClick={() => handleNext()} 
    >
      {/* 🚀 INYECCIÓN DIRECTA DE LA FUENTE (Sin tocar globals.css) */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.cdnfonts.com/css/determination-mono');
        .font-determination {
          font-family: 'Determination Mono', sans-serif !important;
          -webkit-font-smoothing: none;
        }
      `}} />

      <div className="min-h-[100px]">
        {/* 🚀 APLICAMOS LA FUENTE: Sin 'italic', con 'uppercase' y separando letras (tracking-widest) */}
        <p className="text-white text-xl md:text-3xl font-determination uppercase leading-relaxed tracking-widest text-left" style={{ wordBreak: 'break-word' }}>
          * {displayedText}
          {isFinished && (
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block ml-2 w-3 h-6 bg-white align-middle"
            />
          )}
        </p>
      </div>

      {isFinished && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 right-6 text-xs text-zinc-500 font-determination tracking-[0.3em]"
        >
          [ ENTER ]
        </motion.p>
      )}
    </div>
  )
}