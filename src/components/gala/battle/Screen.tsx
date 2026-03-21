'use client'
import { ReactNode } from 'react';

// Definimos los tipos de fases permitidos para evitar el error 2322
interface ScreenProps {
  fase: "dialogo" | "ataque" | "save_menu" | "salvacion"; 
  children: ReactNode;
}

export default function Screen({ fase, children }: ScreenProps) {
  return (
    <div className="relative w-[600px] h-[220px] bg-black border-[6px] border-white overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.2)]">
      <div className="relative w-full h-full">
        {children}
      </div>
      {/* Efecto de ruido visual tipo TV antigua */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://media.giphy.com/media/oEI9uWUicG7vAIdX8A/giphy.gif')] mix-blend-overlay" />
    </div>
  );
}