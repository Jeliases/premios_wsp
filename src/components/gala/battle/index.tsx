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
  const [sacudirPantalla, setSacudirPantalla] = useState(false);
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
    setBloqueado(true);
    setTextoRespuesta(respuesta);

    if (esCorrecta) {
      setMostrandoSalvado(true);
    } else {
      setSacudirPantalla(true);
      setFase('dialogo'); 
      setTimeout(() => setSacudirPantalla(false), 800);
    }
  };

  // 3. Continuar tras presionar ENTER (Fix de avance)
  const continuarTrasRespuesta = () => {
    if (mostrandoSalvado) {
      setMostrandoSalvado(false);
      setTextoRespuesta('');
      setTimeout(() => {
        intentarSalvar(true); // El hook pasa al siguiente amigo
        setBloqueado(false);
      }, 200);
    } else if (textoRespuesta) {
      setTextoRespuesta('');
      setFase('ataque');
      setTimeout(() => {
        intentarSalvar(false);
        setBloqueado(false);
      }, 200);
    } else if (fase === 'dialogo') {
      setFase('save_menu');
      setBloqueado(false);
    }
  };

  if (!amigoActual) return <div className="bg-black min-h-screen" />;

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-black text-white font-mono overflow-hidden">
      <Background />
      
      {/* SECCIÓN 1: Galería Superior (Fija) */}
      <div className="w-full z-30 h-[120px] md:h-[140px] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md border-b border-white/10">
        <SoulGallery amigos={BATTLE_STORY.amigos} determinacion={determinacion} />
      </div>

      {/* SECCIÓN 2: Sprites (Altura fija para evitar que empuje el resto) */}
      <div className="w-full flex-1 flex items-center justify-center relative min-h-[260px] md:min-h-[320px] z-10 p-4">
        <AnimatePresence mode="wait">
          {(fase === 'intro' || fase === 'ataque') && !mostrandoSalvado ? (
            <motion.div key="enemy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Enemy fase={fase} />
            </motion.div>
          ) : (
            <motion.div 
              key={`${amigoActual.nombre}-${mostrandoSalvado}`} 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <img 
                src={mostrandoSalvado ? amigoActual.fotoColor : amigoActual.fotoX} 
                className={`w-52 h-52 md:w-72 md:h-72 object-contain border-4 shadow-2xl transition-all duration-500 ${
                  mostrandoSalvado ? 'border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.5)]' : 'border-red-600 grayscale'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECCIÓN 3: HP BAR (Compacta) */}
      <div className="w-full flex items-center justify-center gap-4 h-[40px] z-20">
        <span className="text-yellow-400 italic font-black text-xl md:text-2xl">HP {hp}/20</span>
        <div className="w-40 md:w-60 h-4 bg-red-900 border-2 border-white rounded-sm overflow-hidden">
          <motion.div 
            className="h-full bg-yellow-400" 
            animate={{ width: `${(hp/20)*100}%` }} 
          />
        </div>
      </div>

      {/* SECCIÓN 4: Cuadro de Diálogo (Anclado) */}
      <div className="w-full max-w-[650px] px-4 py-2 z-20 h-[180px] md:h-[220px]">
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
                key={mostrandoSalvado ? 'save' : (textoRespuesta ? 'fail' : 'init')}
                texto={mostrandoSalvado ? amigoActual.fraseSalvado : (textoRespuesta || amigoActual.frasePerdida)} 
                onComplete={continuarTrasRespuesta}
              />
            )}

            {fase === 'ataque' && (
              <div className="relative h-full w-full">
                <Soul x={posicionAlma.x} y={posicionAlma.y} estaVibrando={estaVibrando} />
                <Attacks almaPos={posicionAlma} onHit={recibirDano} />
              </div>
            )}
          </AnimatePresence>
        </Screen>
      </div>

      {/* SECCIÓN 5: Menú de Acciones (Fijo abajo) */}
      <div className="w-full max-w-[600px] h-[150px] md:h-[180px] flex items-center justify-center p-4 z-20">
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