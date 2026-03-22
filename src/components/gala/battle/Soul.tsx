// src/components/gala/battle/Soul.tsx
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
      // 🔑 FIX: top-1/2 left-1/2 y márgenes negativos lo anclan al CENTRO.
      className="absolute top-1/2 left-1/2 -ml-[11px] -mt-[11px] z-50 pointer-events-none"
      initial={{ x, y }}
      animate={{ 
        x, 
        y,
        scale: estaVibrando ? [1, 0.8, 1.2, 1] : 1,
        opacity: estaVibrando ? [1, 0.5, 1, 0.5, 1] : 1
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 700, 
        damping: 35,
        mass: 0.8 
      }}
      style={{ width: '22px', height: '22px' }}
    >
      <svg 
        viewBox="0 0 10 9" 
        fill="#ff0000" 
        className="w-full h-full drop-shadow-[0_0_8px_rgba(255,0,0,0.9)]"
        style={{ imageRendering: 'pixelated' }}
      >
        <path d="M2,0 h2 v1 h1 v1 h1 v-1 h2 v1 h1 v1 h1 v3 h-1 v1 h-1 v1 h-1 v1 h-2 v-1 h-1 v-1 h-1 v-1 h-1 v-3 h1 v-1 h1 v-1 z" />
      </svg>
    </motion.div>
  );
}