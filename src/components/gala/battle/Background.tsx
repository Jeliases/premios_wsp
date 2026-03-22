'use client'
import { motion } from 'framer-motion';

// 1. Declaramos que este componente ahora acepta 'esFinal'
interface BackgroundProps {
  esFinal?: boolean; 
}

export default function Background({ esFinal }: BackgroundProps) {
  return (
    <div className="fixed inset-0 -z-50 bg-black overflow-hidden flex items-center justify-center">
      <motion.div
        animate={{ 
          rotate: 360,
          // 2. Si es fase final, el fondo se hace más grande
          scale: esFinal ? [1.5, 2, 1.5] : [1, 1.5, 1],
          // 3. Si es fase final, cambian los colores agresivamente
          filter: esFinal ? "hue-rotate(360deg) brightness(1.2)" : "hue-rotate(0deg)"
        }}
        transition={{ 
          rotate: { repeat: Infinity, duration: esFinal ? 10 : 20, ease: "linear" }, // Gira más rápido al final
          scale: { repeat: Infinity, duration: 5 },
          filter: { repeat: Infinity, duration: 3 }
        }}
        className="w-[200vw] h-[200vh] opacity-20"
        style={{
          background: `conic-gradient(from 0deg, red, orange, yellow, green, blue, indigo, violet, red)`
        }}
      />
      {/* 4. La oscuridad cambia para dar un tono más tenso */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${esFinal ? 'bg-black/40' : 'bg-black/60'}`} />
    </div>
  );
}