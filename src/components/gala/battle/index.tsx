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
  
  // ✅ 1. EL LOCK (BLOQUEO ANTI-SPAM)
  const [bloqueado, setBloqueado] = useState(false);

  const avanzarDialogoIntro = () => {
    if (bloqueado) return;
    if (introIndex < BATTLE_STORY.intro.length - 1) {
      setIntroIndex(introIndex + 1);
    } else {
      setFase('dialogo');
    }
  };

  // ✅ 2. MODIFICACIÓN MANEJAR ACCIÓN (Con Lock)
  const manejarAccion = (esCorrecta: boolean, respuesta: string) => {
    if (bloqueado) return; // 🚫 Bloquea si ya hay algo procesándose

    setBloqueado(true); // 🔒 Cerramos el paso
    setTextoRespuesta(respuesta);

    if (esCorrecta) {
      setMostrandoSalvado(true);
      // No desbloqueamos aquí, esperamos al Enter del DialogBox
    } else {
      setSacudirPantalla(true);
      setFase('dialogo'); 
      setTimeout(() => setSacudirPantalla(false), 800);
      // El bloqueo se quita en continuarTrasRespuesta
    }
  };



const continuarTrasRespuesta = () => {
  // Si el lock anti-spam está activo, no hacemos nada
  if (bloqueado) return;

  if (mostrandoSalvado) {
    // Caso 1: Acabas de salvar al amigo (Foto Color)
    setMostrandoSalvado(false);
    setTextoRespuesta('');
    setTimeout(() => {
      intentarSalvar(true);
      setBloqueado(false);
    }, 150);
  } else if (textoRespuesta) {
    // Caso 2: Fallaste la respuesta (Texto de Asriel/Burla)
    setTextoRespuesta('');
    setFase('ataque');
    setTimeout(() => {
      intentarSalvar(false);
      setBloqueado(false);
    }, 150);
  } else if (fase === 'dialogo') {
    // ✅ CASO 3 (EL QUE TE FALTA): Diálogo inicial del amigo ("Ronaldo está rodeado...")
    // Simplemente pasamos al menú de acciones (HOPE/DREAMS)
    setFase('save_menu');
    setBloqueado(false); 
  }
};

  if (!amigoActual) return <div className="bg-black min-h-screen" />;

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-black text-white font-mono overflow-hidden">
      <Background />
      
      {/* UX: Galería siempre arriba y visible */}
      <div className="w-full z-30 h-[100px] flex items-center justify-center bg-black/40 backdrop-blur-sm border-b border-white/5">
        <SoulGallery amigos={BATTLE_STORY.amigos} determinacion={determinacion} />
      </div>

      {/* ÁREA DE SPRITE: Fix de Flicker con Keys únicas */}
      <div className="flex-1 flex items-center justify-center relative w-full min-h-[300px]">
        <AnimatePresence mode="wait">
          {(fase === 'intro' || fase === 'ataque') && !mostrandoSalvado ? (
            <motion.div key="asriel-sprite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Enemy fase={fase} />
            </motion.div>
          ) : (
            <motion.div 
              // La key combinada evita que React reuse el componente X cuando ya ganaste
              key={`${amigoActual.nombre}-${mostrandoSalvado ? 'color' : 'x'}`}
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <img 
                src={mostrandoSalvado ? amigoActual.fotoColor : amigoActual.fotoX} 
                className={`w-64 h-64 object-contain border-4 shadow-2xl transition-all duration-500 ${
                  mostrandoSalvado ? 'border-yellow-400 shadow-[0_0_30px_gold]' : 'border-red-600 grayscale brightness-50'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-[40px] flex items-center gap-4 my-2 z-10">
        <span className="text-yellow-400 italic font-bold">HP {hp}/20</span>
        <div className="w-48 h-4 bg-red-900 border border-white">
          <div className="h-full bg-yellow-400" style={{ width: `${(hp/20)*100}%` }} />
        </div>
      </div>

      <div className="z-10 px-4 w-full max-w-[620px]">
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
            
                key={mostrandoSalvado ? 'save-msg' : (textoRespuesta ? 'fail-msg' : 'inicio-amigo')}
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

      <div className="h-[150px] w-full flex items-center justify-center mt-4">
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