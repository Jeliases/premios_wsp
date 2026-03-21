'use client'
import { motion } from 'framer-motion';

interface SoulProps {
  x: number;
  y: number;
  estaVibrando?: boolean;
}

export default function Soul({ x, y, estaVibrando }: SoulProps) {
  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      animate={{ 
        x, 
        y,
        // Si recibe daño, parpadea y se encoge un poco
        scale: estaVibrando ? [1, 0.8, 1.2, 1] : 1,
        opacity: estaVibrando ? [1, 0.5, 1, 0.5, 1] : 1
      }}
      // Transición ultra rápida para que se sienta responsivo
      transition={{ type: 'spring', stiffness: 1200, damping: 40 }}
      style={{ width: '20px', height: '20px' }}
    >
      {/* Este SVG dibuja el corazón pixelado exacto de Undertale */}
      <svg 
        viewBox="0 0 10 9" 
        fill="#ff0000" 
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      >
        <path d="M2,0 h2 v1 h1 v1 h1 v-1 h2 v1 h1 v1 h1 v3 h-1 v1 h-1 v1 h-1 v1 h-2 v-1 h-1 v-1 h-1 v-1 h-1 v-3 h1 v-1 h1 v-1 z" />
      </svg>
    </motion.div>
  );
}