'use client'
import { LostSoul } from '@/lib/battle-data';

interface ActionsProps {
  amigo: LostSoul;
  onAction: (esCorrecta: boolean) => void;
}

export default function Actions({ amigo, onAction }: ActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-[500px] mt-6 px-4">
      {amigo.opciones.map((opcion, index) => (
        <button
          key={index}
          onClick={() => onAction(opcion.esCorrecta)}
          onMouseEnter={() => new Audio('/sfx/select.mp3').play().catch(() => {})}
          className="border-2 border-orange-500 p-3 text-orange-500 text-xl font-mono uppercase 
                     hover:bg-orange-500 hover:text-black transition-colors text-left"
        >
          {opcion.label}
        </button>
      ))}
      
      {/* Botón de "Piedad" (Siempre está pero nunca rinde a Asriel) */}
      <button className="border-2 border-orange-500 p-3 text-orange-500 text-xl font-mono opacity-50 cursor-not-allowed text-left">
        * PIEDAD
      </button>
    </div>
  );
}