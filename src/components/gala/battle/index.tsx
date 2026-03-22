'use client'
import { useState } from 'react';
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
  const [sacudirPantalla, setSacudirPantalla] = useState(false);

  // 1. AVANCE MANUAL: Intro de Asriel
  const avanzarDialogoIntro = () => {
    if (introIndex < BATTLE_STORY.intro.length - 1) {
      setIntroIndex(introIndex + 1);
    } else {
      setFase('dialogo');
    }
  };

  // 2. MANEJO DE SELECCIÓN
  const manejarAccion = (esCorrecta: boolean, respuesta: string) => {
    setTextoRespuesta(respuesta);
    if (esCorrecta) {
      setMostrandoSalvado(true);
    } else {
      setSacudirPantalla(true);
      setFase('dialogo'); 
      setTimeout(() => setSacudirPantalla(false), 800);
    }
  };

  // 3. CONTINUAR TRAS ENTER (Bug corregido aquí)
  const continuarTrasRespuesta = () => {
    if (mostrandoSalvado) {
      // Limpiamos estados locales ANTES de avanzar al siguiente
      setMostrandoSalvado(false);
      setTextoRespuesta('');
      intentarSalvar(true); // Esto en el hook cambia al siguiente amigo
    } else if (textoRespuesta) {
      // Si falló, pasamos a la pelea
      setTextoRespuesta('');
      setFase('ataque');
      intentarSalvar(false); 
    }
  };

  if (!amigoActual) return <div className="bg-black min-h-screen" />;

  return (
    <motion.div 
      animate={sacudirPantalla ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.1, repeat: 4 }}
      className="relative flex flex-col items-center justify-start min-h-screen bg-black text-white font-mono overflow-hidden py-4"
    >
      <Background />
      
      {/* 1. GALERÍA SUPERIOR RESTAURADA[cite: 5] */}
      <div className="h-[100px] z-20 flex items-center justify-center w-full mb-2">
        <SoulGallery amigos={BATTLE_STORY.amigos} determinacion={determinacion} />
      </div>

      {/* 2. AREA DEL SPRITE (Asriel o Amigos)[cite: 5] */}
      <div className="h-[280px] flex items-center justify-center relative w-full">
        <AnimatePresence mode="wait">
          {(fase === 'intro' || fase === 'ataque') && !mostrandoSalvado ? (
            <motion.div key="asriel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Enemy fase={fase} />
            </motion.div>
          ) : (
            <motion.div 
              key={amigoActual.nombre + (mostrandoSalvado ? '-color' : '-x')} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img 
                src={mostrandoSalvado ? amigoActual.fotoColor : amigoActual.fotoX} 
                className={`w-64 h-64 object-contain border-4 shadow-2xl transition-all duration-500 ${
                  mostrandoSalvado ? 'border-yellow-400' : 'border-red-600 grayscale brightness-50'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. BARRA DE HP[cite: 5] */}
      <div className="h-[40px] flex items-center gap-4 my-2 z-10">
        <span className="text-yellow-400 italic font-black text-xl">HP {hp}/20</span>
        <div className="w-48 h-4 bg-red-900 border-2 border-white">
          <div className="h-full bg-yellow-400 transition-all" style={{ width: `${(hp/20)*100}%` }} />
        </div>
      </div>

      {/* 4. SCREEN (DIÁLOGOS)[cite: 5] */}
      <div className="z-10 shadow-2xl">
        <Screen fase={mostrandoSalvado ? 'salvacion' : (fase as any)}>
          <AnimatePresence mode="wait">
            {fase === 'intro' && (
              <DialogBox 
                key={`intro-${introIndex}`}
                texto={BATTLE_STORY.intro[introIndex]} 
                onComplete={avanzarDialogoIntro}
              />
            )}

            {fase === 'dialogo' && !mostrandoSalvado && (
              <DialogBox 
                key="dialogo-main"
                texto={textoRespuesta || amigoActual.frasePerdida} 
                onComplete={textoRespuesta ? continuarTrasRespuesta : () => setFase('save_menu')}
              />
            )}

            {fase === 'ataque' && (
              <div className="relative h-full w-full">
                <Soul x={posicionAlma.x} y={posicionAlma.y} estaVibrando={estaVibrando} />
                <Attacks almaPos={posicionAlma} onHit={recibirDano} />
              </div>
            )}

            {mostrandoSalvado && (
              <DialogBox 
                key="msg-save"
                texto={amigoActual.fraseSalvado}
                onComplete={continuarTrasRespuesta}
              />
            )}
          </AnimatePresence>
        </Screen>
      </div>

      {/* 5. MENÚ ACCIONES[cite: 5] */}
      <div className="h-[150px] w-full max-w-[600px] flex items-center justify-center mt-4">
        {fase === 'save_menu' && !mostrandoSalvado && (
          <Actions amigo={amigoActual} onAction={manejarAccion} />
        )}
      </div>

      {/* 6. DETERMINACIÓN[cite: 5] */}
      <div className="w-full max-w-xl px-4 mt-2">
        <div className="h-2 bg-zinc-900 border border-white/30 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-red-600 via-yellow-400 to-white" 
            animate={{ width: `${determinacion}%` }} 
          />
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/determination-mono');
        * { font-family: 'Determination Mono', monospace !important; }
      `}</style>
    </motion.div>
  );
}