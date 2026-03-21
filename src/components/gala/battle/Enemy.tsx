// src/components/gala/battle/Enemy.tsx
'use client'
import { motion } from 'framer-motion';

export default function Enemy() {
  return (
    <div className="relative flex flex-col items-center justify-center h-[200px] mb-4">
      
      {/* ALAS ARCOÍRIS (Efecto God of Hyperdeath) */}
      <div className="absolute flex justify-between w-[600px] opacity-30">
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: i === 0 ? [-5, 5, -5] : [5, -5, 5],
              filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"] 
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className={`w-40 h-64 bg-gradient-to-t from-white via-transparent to-transparent 
                       ${i === 0 ? '-rotate-12' : 'rotate-12'}`}
            style={{ clipPath: 'polygon(0% 0%, 100% 20%, 80% 100%, 20% 80%)' }}
          />
        ))}
      </div>

      {/* CUERPO DEL JEFE (GALA WSP) */}
      <motion.div
        animate={{ 
          y: [0, -15, 0],
        }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Cabeza / Logo con GLITCH */}
        <div className="relative">
            <h1 className="text-7xl font-black text-white italic tracking-tighter select-none"
                style={{ textShadow: '4px 4px #ff0000, -4px -4px #0000ff' }}>
              GALA WSP
            </h1>
            
            {/* Capas de Glitch que parpadean */}
            <motion.h1 
              animate={{ opacity: [0, 0.5, 0], x: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 0.2 }}
              className="absolute top-0 left-0 text-7xl font-black text-cyan-400 italic tracking-tighter opacity-50 mix-blend-screen"
            >
              GALA WSP
            </motion.h1>
        </div>

        {/* El "Corazón" del Jefe (Invertido como los monstruos) */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-8 h-8 bg-white mt-4 rotate-180" 
          style={{ clipPath: 'polygon(50% 0%, 100% 35%, 80% 100%, 50% 80%, 20% 100%, 0% 35%)' }}
        />
      </motion.div>

      {/* Aura de partículas de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {[...Array(10)].map((_, i) => (
           <motion.div
             key={i}
             className="absolute w-1 h-1 bg-white rounded-full"
             initial={{ y: 200, x: Math.random() * 600 - 300, opacity: 0 }}
             animate={{ y: -100, opacity: [0, 1, 0] }}
             transition={{ repeat: Infinity, duration: Math.random() * 2 + 1, delay: Math.random() * 2 }}
           />
         ))}
      </div>
    </div>
  );
}