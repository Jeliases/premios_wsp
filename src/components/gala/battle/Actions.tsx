'use client'
// 1. Cambiamos la ruta al nuevo archivo config
import { LostSoul } from '@/lib/battle-config'; 

interface ActionsProps {
  amigo: LostSoul;
  // Actualizamos para que reciba la respuesta de Asriel si quieres mostrarla
  onAction: (esCorrecta: boolean, respuesta: string) => void;
}

export default function Actions({ amigo, onAction }: ActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-[600px] mt-6 px-4 bg-black/80 p-4">
      {/* 2. Cambiamos 'opciones' por 'acciones' y 'label' por 'texto' */}
      {amigo.acciones.map((opcion, index: number) => (
        <button
          key={index}
          onClick={() => onAction(opcion.esCorrecta, opcion.respuesta)}
          onMouseEnter={() => {
            const audio = new Audio('/sfx/select.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {});
          }}
          className="border-2 border-orange-500 p-3 text-orange-500 text-xl font-mono uppercase 
                     hover:bg-orange-500 hover:text-black transition-colors text-left group"
        >
          {/* El corazón de Undertale al hacer hover */}
          <span className="opacity-0 group-hover:opacity-100 mr-2 text-red-500">❤</span>
          * {opcion.texto}
        </button>
      ))}
      
      {/* Botón de "Piedad" (Estético, como en la pelea real) */}
      <button className="border-2 border-orange-500 p-3 text-orange-500 text-xl font-mono opacity-30 cursor-not-allowed text-left">
        * PIEDAD
      </button>
    </div>
  );
}