'use client'
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttacksProps {
  almaPos: { x: number; y: number };
  onHit: () => void;
  hardMode?: boolean; // 🔑 Activado cuando aparece Ded.webp
}

export default function Attacks({ almaPos, onHit, hardMode }: AttacksProps) {
  const [projectiles, setProjectiles] = useState<any[]>([]);
  const requestRef = useRef<number>(0);

  // 1. GENERADOR DE PROYECTILES SEGÚN FASE
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Math.random().toString(36).substr(2, 9);
      
      if (hardMode) {
        // --- ATAQUE: STAR BLAZING (Estrellas de colores) ---
        const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff4444', '#ffffff'];
        setProjectiles(prev => [...prev, {
          id,
          x: Math.random() * 400 - 200,
          y: -200,
          type: 'star',
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 20 + 15
        }]);
      } else {
        // --- ATAQUE: BOLAS DE FUEGO (Normal) ---
        setProjectiles(prev => [...prev, {
          id,
          x: Math.random() * 300 - 150,
          y: -150,
          type: 'fire',
          color: '#ffffff',
          size: 10
        }]);
      }
    }, hardMode ? 400 : 700); // Más ráfaga en modo difícil

    return () => clearInterval(interval);
  }, [hardMode]);

  // 2. DETECCIÓN DE COLISIÓN (Hitbox)
  useEffect(() => {
    const checkCollisions = () => {
      projectiles.forEach(p => {
        // Calculamos distancia entre el proyectil y el alma (ajustado a coordenadas relativas)
        const dx = p.x - almaPos.x;
        const dy = (p.y + 100) - almaPos.y; // Ajuste de offset visual
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (p.size / 2 + 8)) {
          onHit(); // ¡DAÑO!
        }
      });
      requestRef.current = requestAnimationFrame(checkCollisions);
    };

    requestRef.current = requestAnimationFrame(checkCollisions);
    return () => cancelAnimationFrame(requestRef.current);
  }, [projectiles, almaPos, onHit]);

  // 3. LIMPIEZA DE PROYECTILES FUERA DE PANTALLA
  useEffect(() => {
    const clean = setInterval(() => {
      setProjectiles(prev => prev.filter(p => p.y < 300));
    }, 2000);
    return () => clearInterval(clean);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {projectiles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 1, rotate: 0 }}
            animate={{ 
              y: 400, 
              rotate: p.type === 'star' ? 360 : 0,
              scale: p.type === 'star' ? [1, 1.2, 1] : 1 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: hardMode ? 1.5 : 2.5, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -ml-2 -mt-2"
            style={{
              width: p.size,
              height: p.size,
              filter: `drop-shadow(0 0 10px ${p.color})`,
            }}
          >
            {p.type === 'star' ? (
              // SVG de Estrella para Asriel Fase Final
              <svg viewBox="0 0 24 24" fill={p.color}>
                <path d="M12 1.74l3.09 6.25 6.91 1-5 4.87 1.18 6.88L12 16.5l-6.18 3.25L7 12.87l-5-4.87 6.91-1L12 1.74z" />
              </svg>
            ) : (
              // Círculo simple para fase normal
              <div className="w-full h-full bg-white rounded-full border border-zinc-400" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* EFECTO DE RAYO (SHOCKER BREAKER) EN MODO DIFÍCIL */}
      {hardMode && (
        <motion.div
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 1 }}
          className="absolute inset-0 bg-white/10 mix-blend-overlay"
        />
      )}
    </div>
  );
}