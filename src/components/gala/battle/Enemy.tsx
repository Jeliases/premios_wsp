'use client'
import { motion } from 'framer-motion';

// 1. Interfaz actualizada para recibir el sprite dinámico del index
interface EnemyProps {
  fase: string;
  sprite: string; // Recibe la ruta de Asriel o Ded
}

export default function Enemy({ fase, sprite }: EnemyProps) {
  // Determinamos si el jefe está en su fase de máximo poder
  const esFaseEspecial = sprite.includes('Ded.webp') || fase === 'final_ganado';

  return (
    <div className="relative flex flex-col items-center justify-center h-[350px] mb-4">
      
      {/* 2. ALAS PSICODÉLICAS (Solo aparecen con Ded.webp)[cite: 12] */}
      {esFaseEspecial && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.1, 1.2, 1],
                  rotate: i === 0 ? [-5, 5, -5] : [5, -5, 5],
                  // Efecto de cambio de color constante estilo Asriel[cite: 12]
                  filter: ["hue-rotate(0deg) brightness(0.8)", "hue-rotate(360deg) brightness(1.2)", "hue-rotate(0deg) brightness(0.8)"] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4, 
                  ease: "linear" 
                }}
                className={`absolute w-[450px] h-[300px] opacity-60 z-0`}
                style={{ 
                  // Clip-path para dar forma de ala de Ángel de la Muerte[cite: 12]
                  clipPath: i === 0 
                    ? 'polygon(0% 20%, 50% 50%, 0% 80%)' 
                    : 'polygon(100% 20%, 50% 50%, 100% 80%)',
                  background: 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff0000)',
                  backgroundSize: '400% 400%',
                  left: i === 0 ? '10%' : 'auto',
                  right: i === 1 ? '10%' : 'auto',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. CUERPO DEL JEFE[cite: 12] */}
      <motion.div
        animate={{ 
          y: [0, -10, 0], // Flotación suave[cite: 12]
          filter: esFaseEspecial ? "drop-shadow(0 0 15px rgba(255,255,255,0.5))" : "none"
        }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative">
          <motion.img
            key={sprite} // Fuerza reinicio de animación al cambiar de imagen[cite: 12]
            src={sprite} 
            className={`${esFaseEspecial ? 'w-80 h-80' : 'w-72 h-72'} object-contain transition-all duration-1000`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ imageRendering: 'pixelated' }} // Mantiene estética retro[cite: 12]
          />

          {/* EFECTO DE TEXTO GALA WSP[cite: 12] */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full text-center">
             <h1 className="text-4xl font-black text-white italic tracking-tighter select-none"
                 style={{ textShadow: '3px 3px #ff0000, -3px -3px #0000ff' }}>
               GALA WSP
             </h1>
          </div>
        </div>

        {/* 4. CORAZÓN INVERTIDO DE MONSTRUO[cite: 12] */}
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.8, 1, 0.8] 
          }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-8 h-8 bg-white mt-10 rotate-180 shadow-[0_0_15px_rgba(255,255,255,0.8)]" 
          style={{ clipPath: 'polygon(50% 0%, 100% 35%, 80% 100%, 50% 80%, 20% 100%, 0% 35%)' }}
        />
      </motion.div>

      {/* 5. AURA DE ENERGÍA (Partículas ascendentes)[cite: 12] */}
      <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              initial={{ y: 350, x: Math.random() * 400 - 200 }}
              animate={{ y: -50, opacity: [0, 0.6, 0] }}
              transition={{ 
                repeat: Infinity, 
                duration: Math.random() * 2 + 1, 
                delay: Math.random() * 2 
              }}
            />
          ))}
      </div>
    </div>
  );
}