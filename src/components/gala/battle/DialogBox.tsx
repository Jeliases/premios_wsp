// src/components/gala/battle/DialogBox.tsx
'use client'
import { useState, useEffect } from 'react';

interface DialogBoxProps {
  texto: string;
  onComplete?: () => void;
}

export default function DialogBox({ texto, onComplete }: DialogBoxProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText(""); // Reiniciar al cambiar de texto
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < texto.length) {
        setDisplayedText((prev) => prev + texto[index]);
        // Sonido de texto cada vez que aparece una letra
        const audio = new Audio('/sfx/text.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
        index++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 50); // Velocidad de escritura

    return () => clearInterval(interval);
  }, [texto]);

  return (
    <div className="p-4 font-mono text-2xl text-white leading-tight uppercase tracking-wide">
      <span className="mr-2">*</span>
      {displayedText}
      <span className="animate-pulse ml-1 inline-block w-3 h-6 bg-white" />
    </div>
  );
}