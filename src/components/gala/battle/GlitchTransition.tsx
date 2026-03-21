// src/components/gala/battle/GlitchTransition.tsx
'use client'
import { useEffect } from 'react';

export default function GlitchTransition() {
  useEffect(() => {
    // Sonido de estática de TV fuerte
    const audio = new Audio('https://www.soundjay.com/tv/static-noise-01.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
    
    return () => {
      audio.pause();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-white">
      {/* Capa de ruido visual */}
      <div className="absolute inset-0 opacity-50 bg-[url('https://media.giphy.com/media/oEI9uWUznW3pm/giphy.gif')] mix-blend-multiply" />
      
      {/* Barras de color desfasadas (Glitch) */}
      <div className="absolute inset-0 flex flex-col opacity-30">
        <div className="h-1/4 bg-cyan-500 animate-pulse" />
        <div className="h-1/4 bg-magenta-500 animate-bounce" />
        <div className="h-1/4 bg-yellow-500 animate-pulse" />
        <div className="h-1/4 bg-red-500 animate-bounce" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-black font-black text-6xl italic tracking-tighter animate-ping">
          ERROR_SYSTEM_OVERRIDE
        </h1>
      </div>

      <style jsx>{`
        div {
          animation: shake 0.1s infinite;
        }
        @keyframes shake {
          0% { transform: translate(0,0) }
          25% { transform: translate(5px, -5px) }
          50% { transform: translate(-5px, 5px) }
          75% { transform: translate(5px, 5px) }
          100% { transform: translate(0,0) }
        }
      `}</style>
    </div>
  );
}