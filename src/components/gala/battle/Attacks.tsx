'use client'
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Attacks({ almaPos, onHit }: { almaPos: any, onHit: () => void }) {
  const [proyectiles, setProyectiles] = useState<any[]>([]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setProyectiles(prev => [
        ...prev.slice(-20), // Máximo 20 balas en pantalla para no explotar la PC
        {
          id: Date.now(),
          x: Math.random() * 580,
          y: -20,
          speed: 8 + Math.random() * 10, // ¡MUCHO MÁS RÁPIDAS!
          size: 10 + Math.random() * 20, // Tamaños variables
          angle: (Math.random() - 0.5) * 45 // Caen en diagonal
        }
      ]);
    }, 100); // Salen balas cada 100ms (lluvia densa)

    return () => clearInterval(intervalo);
  }, []);

  // Detector de colisiones mejorado
  useEffect(() => {
    proyectiles.forEach(p => {
      const dist = Math.sqrt(Math.pow(p.x - almaPos.x, 2) + Math.pow(p.y - almaPos.y, 2));
      if (dist < 15) onHit(); // Si está a menos de 15px, daño.
    });
  }, [proyectiles, almaPos, onHit]);

  return (
    <>
      {proyectiles.map(p => (
        <motion.div
          key={p.id}
          className="absolute bg-white shadow-[0_0_10px_white]"
          animate={{ 
            y: 300, 
            x: p.x + (p.angle * 2) 
          }}
          transition={{ duration: 10 / p.speed, ease: "linear" }}
          style={{ 
            left: p.x, 
            top: p.y, 
            width: '4px', 
            height: p.size + 'px',
            rotate: p.angle + 'deg'
          }}
        />
      ))}
    </>
  );
}