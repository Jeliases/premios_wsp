'use client'
import { motion } from 'framer-motion';
import { LostSoul } from '@/lib/battle-config';

interface SoulGalleryProps {
  amigos: LostSoul[];
  determinacion: number;
}

export default function SoulGallery({ amigos, determinacion }: SoulGalleryProps) {
  // Calculamos cuántos amigos han sido salvados (aprox 16.6% por amigo)
  const numSalvados = Math.floor(determinacion / 16.6);

  return (
    <div className="flex gap-3 mb-6 justify-center items-center">
      {amigos.map((amigo, index) => {
        const estaSalvado = index < numSalvados;

        return (
          <div key={amigo.id} className="flex flex-col items-center gap-1">
            <motion.div
              animate={estaSalvado ? 
                { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : 
                { x: [0, -1, 1, 0] }
              }
              transition={estaSalvado ? 
                { duration: 2, repeat: Infinity } : 
                { duration: 0.2, repeat: Infinity }
              }
              className={`w-14 h-14 border-2 overflow-hidden transition-colors duration-1000 ${
                estaSalvado 
                  ? 'border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                  : 'border-gray-700 grayscale brightness-50'
              }`}
            >
              <img
                src={estaSalvado ? amigo.fotoColor : amigo.fotoX}
                alt={amigo.nombre}
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>
            
            {/* Pequeño indicador de nombre */}
            <span className={`text-[8px] font-mono uppercase tracking-tighter ${
              estaSalvado ? 'text-yellow-400' : 'text-gray-600'
            }`}>
              {estaSalvado ? 'SALVADO' : 'LOST'}
            </span>
          </div>
        );
      })}
    </div>
  );
}