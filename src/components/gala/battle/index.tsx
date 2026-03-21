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
    posicionAlma, 
    fase, 
    setFase, 
    estaVibrando, 
    hp, 
    amigoActual, 
    intentarSalvar, 
    recibirDano,
    determinacion 
  } = useBattleLogic(BATTLE_STORY.amigos);

  const [mostrandoSalvado, setMostrandoSalvado] = useState(false);
  const [respuestaAsriel, setRespuestaAsriel] = useState('');

  const manejarAccion = (esCorrecta: boolean, respuesta: string) => {
    setRespuestaAsriel(respuesta);
    
    if (esCorrecta) {
      setMostrandoSalvado(true);
      intentarSalvar(true); 

      setTimeout(() => {
        setMostrandoSalvado(false);
        setRespuestaAsriel('');
      }, 4000);
    } else {
      setFase('dialogo'); 
    }
  };

  if (!amigoActual) return <div className="bg-black min-h-screen" />;

  // Calculamos la fase exacta para el componente Screen evitando errores de tipo
  const faseParaScreen = mostrandoSalvado ? 'salvacion' : (fase as "dialogo" | "ataque" | "save_menu");

  return (
    <div className="relative flex flex-col items-center justify-center space-y-4 py-6 min-h-screen overflow-hidden bg-black text-white font-mono">
      
      <Background />
      <div className="relative z-20">
        <SoulGallery amigos={BATTLE_STORY.amigos} determinacion={determinacion} />
      </div>

      <Enemy fase={mostrandoSalvado ? 'final_ganado' : fase} />

      <div className="relative z-10 flex gap-8 text-white text-xl uppercase tracking-widest mb-2">
        <span className="text-yellow-400 font-bold">JUGADOR</span>
        <div className="flex items-center gap-2">
           <span className="text-sm font-bold">HP</span>
           <div className="w-24 h-5 bg-red-700 border-2 border-white">
              <div 
                className="h-full bg-yellow-400 transition-all duration-300" 
                style={{ width: `${(hp / 20) * 100}%` }} 
              />
           </div>
           <span className="min-w-[50px] font-bold">{hp}/20</span>
        </div>
      </div>

      <div className="relative z-10">
        <Screen fase={faseParaScreen}>
          <AnimatePresence mode="wait">
            {mostrandoSalvado ? (
              <motion.div 
                key="salvado"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full p-4 text-center"
              >
                <img 
                  src={amigoActual.fotoColor} 
                  className="w-28 h-28 border-4 border-yellow-400 mb-3 object-cover"
                  style={{ imageRendering: 'pixelated' }}
                />
                <h2 className="text-yellow-400 text-xl font-black italic">
                  {amigoActual.nombre} ha recordado...
                </h2>
                <p className="text-white text-lg italic">
                  "{amigoActual.fraseSalvado}"
                </p>
              </motion.div>
            ) : (
              <div className="relative h-full w-full">
                <Soul x={posicionAlma.x} y={posicionAlma.y} estaVibrando={estaVibrando} />
                
                {fase === 'ataque' && (
                  <Attacks almaPos={posicionAlma} onHit={recibirDano} />
                )}

                {fase === 'dialogo' && (
                  <DialogBox 
                    texto={respuestaAsriel || amigoActual.frasePerdida} 
                    onComplete={() => {
                      if (!respuestaAsriel) setTimeout(() => setFase('save_menu'), 500);
                    }}
                  />
                )}
              </div>
            )}
          </AnimatePresence>
        </Screen>
      </div>

      <div className="relative z-10 h-[140px] flex items-center justify-center">
        {!mostrandoSalvado && fase === 'save_menu' && (
          <Actions 
            amigo={amigoActual} 
            onAction={manejarAccion} 
          />
        )}
      </div>

      <div className="relative z-10 w-full max-w-[600px] mt-2 px-4">
        <div className="w-full h-4 bg-gray-900 border-2 border-white/20">
          <div 
            className="h-full bg-gradient-to-r from-red-600 via-orange-500 via-yellow-400 to-white transition-all duration-1000" 
            style={{ width: `${determinacion}%` }} 
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center uppercase tracking-[0.3em]">
          DETERMINACIÓN: {Math.round(determinacion)}%
        </p>
      </div>

      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/determination-mono');
        * { font-family: 'Determination Mono', monospace !important; }
      `}</style>
    </div>
  );
}