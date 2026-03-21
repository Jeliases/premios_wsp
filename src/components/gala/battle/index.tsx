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

  const manejarAccion = (esCorrecta: boolean, respuesta: string) => {
    setTextoRespuesta(respuesta);
    
    if (esCorrecta) {
      setMostrandoSalvado(true);
      intentarSalvar(true); 
      // Mantenemos la imagen colorida por 4 segundos
      setTimeout(() => {
        setMostrandoSalvado(false);
        setTextoRespuesta('');
      }, 4000);
    } else {
      setFase('dialogo'); 
    }
  };

  if (!amigoActual) return <div className="bg-black min-h-screen" />;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white font-mono overflow-hidden">
      <Background />
      
      <div className="relative z-20">
        <SoulGallery amigos={BATTLE_STORY.amigos} determinacion={determinacion} />
      </div>

      {/* 1. SECCIÓN DEL ENEMIGO / AMIGOS */}
      <div className="relative h-[300px] flex items-center justify-center mb-4">
        <AnimatePresence mode="wait">
          {/* ASRIEL: Solo aparece en la INTRO o durante el ATAQUE */}
          {(fase === 'intro' || fase === 'ataque') && !mostrandoSalvado ? (
            <motion.div 
              key="asriel"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Enemy fase={fase} />
            </motion.div>
          ) : (
            /* AMIGOS: Aparecen en Diálogo, Menú o Salvación */
            <motion.div 
              key="amigo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center"
            >
              <img 
                src={mostrandoSalvado ? amigoActual.fotoColor : amigoActual.fotoX} 
                className={`w-72 h-72 object-contain transition-all duration-500 ${
                  !mostrandoSalvado ? 'grayscale brightness-50 contrast-125' : 'drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]'
                }`}
                style={{ imageRendering: 'pixelated' }}
              />
              {!mostrandoSalvado && (
                <div className="absolute inset-0 bg-transparent animate-pulse border-4 border-red-500/20 rounded-lg" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-2 flex items-center gap-4">
        <span className="text-yellow-400 font-bold tracking-tighter text-xl italic">HP {hp}/20</span>
        <div className="w-32 h-4 bg-red-900 border border-white">
          <div className="h-full bg-yellow-400" style={{ width: `${(hp/20)*100}%` }} />
        </div>
      </div>

      {/* 2. PANTALLA DE TEXTO / ALMA */}
      <Screen fase={mostrandoSalvado ? 'salvacion' : (fase as any)}>
        <AnimatePresence mode="wait">
          {fase === 'intro' && (
            <DialogBox 
              key={`intro-${introIndex}`}
              texto={BATTLE_STORY.intro[introIndex]} 
              onComplete={() => {
                if (introIndex < BATTLE_STORY.intro.length - 1) {
                  setIntroIndex(introIndex + 1);
                } else {
                  setFase('dialogo');
                }
              }}
            />
          )}

          {fase === 'dialogo' && !mostrandoSalvado && (
            <DialogBox 
              key="dialogo-amigo"
              texto={textoRespuesta || amigoActual.frasePerdida} 
              onComplete={() => {
                if (textoRespuesta) {
                  setTextoRespuesta('');
                  setFase('ataque');
                  intentarSalvar(false); 
                } else {
                  setFase('save_menu');
                }
              }}
            />
          )}

          {fase === 'ataque' && (
            <div className="relative h-full w-full">
              <Soul x={posicionAlma.x} y={posicionAlma.y} estaVibrando={estaVibrando} />
              <Attacks almaPos={posicionAlma} onHit={recibirDano} />
            </div>
          )}

          {mostrandoSalvado && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex items-center justify-center h-full p-6"
            >
              <p className="text-yellow-400 text-2xl italic font-black text-center leading-tight">
                "{amigoActual.fraseSalvado}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Screen>

      {/* 3. CONTROLES */}
      <div className="h-[140px] mt-4">
        {fase === 'save_menu' && !mostrandoSalvado && (
          <Actions amigo={amigoActual} onAction={manejarAccion} />
        )}
      </div>

      <div className="w-full max-w-xl mt-4 px-4">
        <div className="h-4 bg-zinc-900 border-2 border-white relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-200" 
            animate={{ width: `${determinacion}%` }} 
          />
        </div>
        <p className="text-center text-[10px] mt-1 tracking-[0.3em] uppercase opacity-50">
          Determinación de la Gala: {Math.round(determinacion)}%
        </p>
      </div>

      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/determination-mono');
        * { font-family: 'Determination Mono', monospace !important; }
      `}</style>
    </div>
  );
}