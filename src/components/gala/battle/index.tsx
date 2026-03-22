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
  setBloqueado(true); 
  setTextoRespuesta(respuesta); 

  if (esCorrecta) {
    setMostrandoSalvado(true);
  } else {
 
    setFase('dialogo'); 
  }
};

  // 3. EL CORAZÓN DEL FIX: Limpieza absoluta antes de avanzar (Evita el bug de Ronaldo)
const continuarTrasRespuesta = () => {
    if (mostrandoSalvado) {
      // 1. Bloqueamos todo y borramos rastros visuales primero
      setBloqueado(true); 
      setMostrandoSalvado(false); 
      setTextoRespuesta('');      
      
      // 2. IMPORTANTE: Usamos un tiempo un poco mayor (200ms) 
      // para asegurar que AnimatePresence desmonte a Ronaldo por completo.
      setTimeout(() => {
        intentarSalvar(true); // 3. RECIÉN AQUÍ cargamos a Cristian
        
        // 4. Damos otro pequeño respiro antes de liberar los botones
        setTimeout(() => {
          setBloqueado(false);
        }, 50);
      }, 200);

    } else if (textoRespuesta) {
      // Si falló, reseteamos y vamos a ataque
      setBloqueado(true);
      setTextoRespuesta('');
      setFase('ataque');
      setTimeout(() => {
        intentarSalvar(false);
        setBloqueado(false);
      }, 150);
    } else if (fase === 'dialogo') {
      setFase('save_menu');
      setBloqueado(false);
    }
  };

  if (!amigoActual) return <div className="bg-black min-h-screen" />;

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen bg-black text-white font-mono overflow-hidden py-4">
      <Background />
      
      {/* SECCIÓN 1: GALERÍA DE ALMAS */}
      <div className="w-full z-30 h-[120px] flex items-center justify-center p-2">
        <SoulGallery amigos={BATTLE_STORY.amigos} determinacion={determinacion} />
      </div>

      {/* SECCIÓN 2: PERSONAJE (Imagen X o Color) */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[280px] z-10">
        <AnimatePresence mode="wait">
          {(fase === 'intro' || fase === 'ataque') && !mostrandoSalvado ? (
            <motion.div key="asriel-enemy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Enemy fase={fase} />
            </motion.div>
          ) : (
            <motion.div 
              // 🔑 KEY MAESTRA: Si cambia el nombre, el componente se destruye y renace limpio
              key={`sprite-${amigoActual.nombre}-${mostrandoSalvado ? 'color' : 'x'}`} 
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

      {/* SECCIÓN 3: CUADRO DE DIÁLOGO (SCREEN) */}
<div className="z-20 w-full max-w-[620px] px-4 h-[200px]">
  <Screen fase={mostrandoSalvado ? 'salvacion' : (fase as any)}>
    <AnimatePresence mode="wait">
      {/* ... (Intro de Asriel) ... */}

      {(fase === 'dialogo' || mostrandoSalvado) && (
        <DialogBox 
          // 🔑 KEY DINÁMICA: Si el texto cambia a una respuesta de error, 
          // la key cambia y el componente se reinicia solo.
          key={`dialogo-${amigoActual.id}-${mostrandoSalvado ? 'save' : 'msg'}-${textoRespuesta.length}`}
          texto={
            mostrandoSalvado 
              ? amigoActual.fraseSalvado 
              : (textoRespuesta || amigoActual.frasePerdida) // 👈 Aquí priorizamos la respuesta del error
          } 
          onComplete={continuarTrasRespuesta}
        />
      )}

      {/* ... (Ataque) ... */}
    </AnimatePresence>
  </Screen>
      </div>

      {/* SECCIÓN 4: MENÚ DE BOTONES */}
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