// src/components/gala/battle/Background.tsx
'use client'
import { motion } from 'framer-motion';

export default function Background() {
  return (
    <div className="fixed inset-0 -z-50 bg-black overflow-hidden flex items-center justify-center">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.5, 1],
        }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="w-[200vw] h-[200vh] opacity-20"
        style={{
          background: `conic-gradient(
            from 0deg, 
            red, orange, yellow, green, blue, indigo, violet, red
          )`
        }}
      />
      {/* Capa de oscuridad para que no moleste a la vista */}
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}