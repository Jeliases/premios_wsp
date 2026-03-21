// src/components/gala/battle/Soul.tsx
import { motion } from 'framer-motion';

interface SoulProps {
  x: number;
  y: number;
  estaVibrando: boolean;
}

export default function Soul({ x, y, estaVibrando }: SoulProps) {
  return (
    <motion.div
      animate={{ 
        x, 
        y,
        // Si recibe daño, vibra como en el juego
        rotate: estaVibrando ? [0, -10, 10, -10, 0] : 45 
      }}
      transition={{ type: 'spring', damping: 15, stiffness: 200, duration: 0.05 }}
      className={`absolute w-4 h-4 bg-red-600 shadow-[0_0_10px_#ff0000] z-50`}
      style={{ 
        // El rotate 45 es para que parezca un corazón clásico de Undertale
        transform: 'rotate(45deg)',
        top: '50%',
        left: '50%',
        marginTop: '-8px',
        marginLeft: '-8px'
      }}
    />
  );
}