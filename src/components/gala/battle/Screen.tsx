// src/components/gala/battle/Screen.tsx
import React from 'react';

interface ScreenProps {
  children: React.ReactNode;
  fase: 'dialogo' | 'ataque' | 'save_menu';
}

export default function Screen({ children, fase }: ScreenProps) {
  return (
    <div className="relative w-[400px] h-[240px] border-[6px] border-white bg-black overflow-hidden mx-auto shadow-[0_0_20px_rgba(255,255,255,0.1)]">
      {/* El contenido (Alma, Ataques o Texto) va aquí dentro */}
      {children}
      
      {/* Efecto de ruido blanco muy sutil para el ambiente de Asriel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://media.giphy.com/media/oEI9uWUznW3pm/giphy.gif')]" />
    </div>
  );
}