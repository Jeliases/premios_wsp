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

  useEffect(() => {
    soundRef.current = new Audio('/sfx/bleep.mp3')
    soundRef.current.volume = 0.2
  }, [])

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

  const handleNext = useCallback((e?: KeyboardEvent) => {
    if (e && !['Enter', 'z', 'Z'].includes(e.key)) return;
    
    if (isFinished) {
      if (haTerminadoFrase) return; 
      setHaTerminadoFrase(true); 
      onComplete(); 
    } else {
      setDisplayedText(texto); 
      setIsFinished(true);
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
      {/* 🚀 GOOGLE FONTS INBLOQUEABLE */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}} />

      <div className="min-h-[100px]">
        <p 
          className="text-white text-left uppercase leading-loose" 
          style={{ 
            fontFamily: "'Press Start 2P', cursive", 
            fontSize: "14px", 
            textShadow: "none",
            wordBreak: "break-word"
          }}
        >
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
          className="absolute bottom-4 right-6 text-zinc-500"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "10px" }}
        >
          [ ENTER ]
        </motion.p>
      )}
    </div>
  )
}