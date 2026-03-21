'use client'
import { motion } from 'framer-motion';

// 1. Definimos la interfaz para que TypeScript acepte la prop 'fase'
interface EnemyProps {
  fase: string;
}

export default function Enemy({ fase }: EnemyProps) {
  // Determinamos si mostrar a Asriel normal o con alas (fase especial)
  const esFaseEspecial = fase === 'final_ganado' || fase === 'salvacion';

  return (
    <div className="relative flex flex-col items-center justify-center h-[300px] mb-4">
      
      {/* 2. TUS ALAS ARCOÍRIS (Solo se ven en fase especial) */}
      {esFaseEspecial && (
        <div className="absolute flex justify-between w-[500px] opacity-40 z-0">
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: i === 0 ? [-10, 10, -10] : [10, -10, 10],
                filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"] 
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className={`w-40 h-72 bg-gradient-to-t from-white via-transparent to-transparent`}
              style={{ clipPath: 'polygon(0% 0%, 100% 20%, 80% 100%, 20% 80%)' }}
            />
          ))}
        </div>
      )}

      {/* 3. CUERPO DEL JEFE (USANDO TUS IMÁGENES WEBP) */}
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          filter: esFaseEspecial ? ["brightness(1)", "brightness(1.5)", "brightness(1)"] : "none"
        }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* IMAGEN DEL JEFE */}
        <div className="relative group">
          <motion.img
            // Usamos la ruta donde tienes tus webp
            src={esFaseEspecial ? '/images/amigos/Ded.webp' : '/images/amigos/Asriel.webp'}
            className="w-72 h-72 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ imageRendering: 'pixelated' }}
          />

          {/* EFECTO GLITCH DE TEXTO (Encima de la imagen) */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center">
             <h1 className="text-4xl font-black text-white italic tracking-tighter select-none"
                 style={{ textShadow: '2px 2px #ff0000, -2px -2px #0000ff' }}>
               GALA WSP
             </h1>
             {/* Capa de parpadeo para el texto */}
             <motion.h1 
               animate={{ opacity: [0, 0.4, 0], x: [-1, 1, -1] }}
               transition={{ repeat: Infinity, duration: 0.1 }}
               className="absolute top-0 left-0 text-4xl font-black text-cyan-400 italic tracking-tighter opacity-50 mix-blend-screen w-full"
             >
               GALA WSP
             </motion.h1>
          </div>
        </div>

        {/* 4. EL CORAZÓN DE MONSTRUO (Tu diseño original) */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-6 h-6 bg-white mt-12 rotate-180 shadow-[0_0_10px_white]" 
          style={{ clipPath: 'polygon(50% 0%, 100% 35%, 80% 100%, 50% 80%, 20% 100%, 0% 35%)' }}
        />
      </motion.div>

      {/* 5. AURA DE PARTÍCULAS (Tu diseño original) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ y: 300, x: Math.random() * 800 - 400, opacity: 0 }}
              animate={{ y: -100, opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: Math.random() * 2 + 2, delay: Math.random() * 3 }}
            />
          ))}
      </div>
    </div>
  );
}