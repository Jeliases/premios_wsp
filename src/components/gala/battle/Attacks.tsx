// src/components/gala/battle/Attacks.tsx
'use client'
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AttackProps {
  almaPos: { x: number; y: number };
  onHit: () => void;
}

export default function Attacks({ almaPos, onHit }: AttackProps) {
  const [estrellas, setEstrellas] = useState<{ id: number; x: number; y: number }[]>([]);

  // Generador de estrellas
  useEffect(() => {
    const interval = setInterval(() => {
      setEstrellas(prev => [
        ...prev, 
        { id: Date.now(), x: Math.random() * 300 - 150, y: -150 }
      ]);
    }, 600); // Sale una estrella cada 0.6 seg

    return () => clearInterval(interval);
  }, []);

  // Movimiento y Colisión
  useEffect(() => {
    const loop = setInterval(() => {
      setEstrellas(prev => {
        return prev
          .map(e => ({ ...e, y: e.y + 4 })) // La estrella cae 4px por frame
          .filter(e => {
            // DETECTAR COLISIÓN (Pitágoras básico)
            const distX = Math.abs(e.x - almaPos.x);
            const distY = Math.abs(e.y - almaPos.y);
            
            if (distX < 15 && distY < 15) {
              onHit(); // ¡TE PEGÓ!
              return false; // La estrella desaparece al pegar
            }
            return e.y < 200; // Eliminar si sale de pantalla
          });
      });
    }, 16); // 60 FPS aprox

    return () => clearInterval(loop);
  }, [almaPos, onHit]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {estrellas.map(e => (
        <motion.div
          key={e.id}
          className="absolute w-4 h-4 bg-white"
          style={{ 
            left: '50%', 
            top: '50%', 
            x: e.x, 
            y: e.y,
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' 
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      ))}
    </div>
  );
}