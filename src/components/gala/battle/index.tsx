'use client'
import { useState, useEffect } from 'react';
import { useBattleLogic } from '@/hooks/useBattleLogic';
import { BATTLE_STORY } from '@/lib/battle-config'; 
import Screen from './Screen';
import Soul from './Soul';
import Attacks from './Attacks';
import DialogBox from './DialogBox'; 
import Actions from './Actions';     
import Enemy from './Enemy';
import Background from './Background';
import SoulGallery from './SoulGallery'; 
import { motion, AnimatePresence } from 'framer-motion';

export default function BattleMain() {
  const { 
    posicionAlma, fase, setFase, introIndex, setIntroIndex,
    hp, amigoActual, intentarSalvar, recibirDano, determinacion, estaVibrando
  } = useBattleLogic(BATTLE_STORY.amigos);

  const [mostrandoSalvado, setMostrandoSalvado] = useState(false);
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [bloqueado, setBloqueado] = useState(false);

  // 1. Avance de la intro de Asriel
  const avanzarDialogoIntro = () => {
    if (introIndex < BATTLE_STORY.intro.length - 1) {
      setIntroIndex(introIndex + 1);
    } else {
      setFase('dialogo');
    }
  };

  // 2. Selección de acción (HOPE/DREAMS)
  const manejarAccion = (esCorrecta: boolean, respuesta: string) => {
    if (bloqueado) return;
    setBloqueado(true); // 🔒 Bloqueamos para que no puedan spamear clicks
    setTextoRespuesta(respuesta);

    if (esCorrecta) {
      setMostrandoSalvado(true);
      // No llamamos a intentarSalvar aquí todavía, esperamos al ENTER.
    } else {
      setFase('dialogo'); 
      // El bloqueo se quita en continuarTrasRespuesta
    }
  };

  // 3. EL CORAZÓN DEL FIX: Esta función limpia TODO antes de pasar al siguiente
  const continuarTrasRespuesta = () => {
    if (mostrandoSalvado) {
      // ✅ PASO A PASO PARA NO BUGUEAR:
      setMostrandoSalvado(false); // 1. Quitamos la foto a color
      setTextoRespuesta('');      // 2. Borramos el texto de respuesta
      
      // 3. Le damos un respiro a React para que limpie el DOM
      setTimeout(() => {
        intentarSalvar(true);     // 4. Cambiamos al siguiente amigo en el Hook
        setBloqueado(false);      // 5. Liberamos el bloqueo
      }, 100);

    } else if (textoRespuesta) {
      // Si falló, reseteamos y vamos a ataque
      setTextoRespuesta('');
      setFase('ataque');
      setTimeout(() => {
        intentarSalvar(false);
        setBloqueado(false);
      }, 100);
    } else if (fase === 'dialogo') {
      // Diálogo inicial -> ir al menú
      setFase('save_menu');
      setBloqueado(false);
    }
  };

  if (!amigoActual) return <div className="bg-black min-h-screen" />;

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen bg-black text-white font-mono overflow-hidden py-4">
      <Background />
      
      {/* SECCIÓN 1: GALERÍA (Fija arriba para que no se mueva el layout) */}
      <div className="w-full z-30 h-[120px] flex items-center justify-center p-2">
        <SoulGallery amigos={BATTLE_STORY.amigos} determinacion={determinacion} />
      </div>

      {/* SECCIÓN 2: SPRITE (Uso de Keys para destruir el bug de la imagen X) */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[280px] z-10">
        <AnimatePresence mode="wait">
          {(fase === 'intro' || fase === 'ataque') && !mostrandoSalvado ? (
            <motion.div key="asriel-enemy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Enemy fase={fase} />
            </motion.div>
          ) : (
            <motion.div 
              // 🔑 KEY MAESTRA: Si el nombre del amigo cambia, el componente SE DESTRUYE y se recrea.
              // Esto evita que Ronaldo se quede pegado cuando ya toca Indira.
              key={`${amigoActual.nombre}-${mostrandoSalvado ? 'color' : 'x'}`} 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <img 
                src={mostrandoSalvado ? amigoActual.fotoColor : amigoActual.fotoX} 
                className={`w-52 h-52 md:w-64 md:h-64 object-contain border-4 shadow-2xl transition-all ${
                  mostrandoSalvado ? 'border-yellow-400 shadow-[0_0_30px_gold]' : 'border-red-600 grayscale brightness-50'
                }`}
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="flex items-center gap-4 mt-4">
                <span className="text-yellow-400 italic font-black">HP {hp}/20</span>
                <div className="w-40 h-3 bg-red-900 border border-white">
                  <div className="h-full bg-yellow-400" style={{ width: `${(hp/20)*100}%` }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECCIÓN 3: SCREEN (Diálogos) */}
      <div className="z-20 w-full max-w-[620px] px-4 h-[200px]">
        <Screen fase={mostrandoSalvado ? 'salvacion' : (fase as any)}>
          <AnimatePresence mode="wait">
            {fase === 'intro' && (
              <DialogBox 
                key={`intro-${introIndex}`}
                texto={BATTLE_STORY.intro[introIndex]} 
                onComplete={avanzarDialogoIntro}
              />
            )}

            {(fase === 'dialogo' || mostrandoSalvado) && (
              <DialogBox 
                // 🔑 Otra Key para que el texto se reinicie sí o sí
                key={amigoActual.nombre + (mostrandoSalvado ? 'save' : 'lost')}
                texto={mostrandoSalvado ? amigoActual.fraseSalvado : (textoRespuesta || amigoActual.frasePerdida)} 
                onComplete={continuarTrasRespuesta}
              />
            )}

            {fase === 'ataque' && (
              <div key="battle-box" className="relative h-full w-full">
                <Soul x={posicionAlma.x} y={posicionAlma.y} estaVibrando={estaVibrando} />
                <Attacks almaPos={posicionAlma} onHit={recibirDano} />
              </div>
            )}
          </AnimatePresence>
        </Screen>
      </div>

      {/* SECCIÓN 4: BOTONES (Fijos abajo) */}
      <div className="z-20 h-[140px] w-full flex items-center justify-center p-4">
        {fase === 'save_menu' && !mostrandoSalvado && !bloqueado && (
          <Actions amigo={amigoActual} onAction={manejarAccion} />
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/determination-mono');
        * { font-family: 'Determination Mono', monospace !important; }
      `}</style>
    </div>
  );
}