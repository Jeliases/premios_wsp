'use client'
import { useState, useEffect, useRef, useMemo } from 'react';
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
import { useRouter } from 'next/navigation';

export default function BattleMain() {
  const router = useRouter();
  const { 
    posicionAlma, fase, setFase, introIndex, setIntroIndex,
    hp, amigoActual, intentarSalvar, recibirDano, determinacion, estaVibrando
  } = useBattleLogic(BATTLE_STORY.amigos);

  const [mostrandoSalvado, setMostrandoSalvado] = useState(false);
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [bloqueado, setBloqueado] = useState(false);
  const endingMusicRef = useRef<HTMLAudioElement | null>(null);

  // 🔑 LÓGICA DE FASE VISUAL: Cambia a la forma final a mitad de la lista de amigos
  const esFaseFinal = useMemo(() => {
    if (!amigoActual) return false;
    const indice = BATTLE_STORY.amigos.findIndex(a => a.id === amigoActual.id);
    return indice >= 3; // Cambia a Ded.webp a partir del 4to amigo
  }, [amigoActual]);

  // --- LÓGICA DE CIERRE FINAL ---
  const iniciarFinal = () => {
    endingMusicRef.current = new Audio('/music/histheme.mp3');
    endingMusicRef.current.volume = 0.5;
    endingMusicRef.current.play().catch(e => console.log("Audio play deferred"));

    setFase('ending' as any);
    
    setTimeout(() => {
      router.push('/live');
    }, 18000);
  };

  const avanzarDialogoIntro = () => {
    if (introIndex < BATTLE_STORY.intro.length - 1) {
      setIntroIndex(introIndex + 1);
    } else {
      setFase('dialogo');
    }
  };

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

  const continuarTrasRespuesta = () => {
    if (mostrandoSalvado) {
      setBloqueado(true); 
      setMostrandoSalvado(false); 
      setTextoRespuesta('');      
      
      setTimeout(() => {
        const esUltimo = amigoActual.id === BATTLE_STORY.amigos[BATTLE_STORY.amigos.length - 1].id;
        
        if (esUltimo) {
          iniciarFinal();
        } else {
          intentarSalvar(true); 
          setTimeout(() => {
            setBloqueado(false);
          }, 50);
        }
      }, 200);

    } else if (textoRespuesta) {
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

  // --- PANTALLA DE CRÉDITOS (CAYENDO) ---
  if (fase === ('ending' as any)) {
    return (
      <div className="fixed inset-0 bg-black z-[300] flex flex-col items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3 }}
          className="flex flex-col items-center z-10"
        >
          <img 
            src="/images/amigos/final.png" 
            className="w-[300px] md:w-[500px] object-contain mb-8 rounded-lg shadow-[0_0_80px_rgba(255,255,255,0.1)]"
            alt="Final"
          />
          
          <div className="h-[350px] relative w-full max-w-2xl overflow-hidden border-t border-white/10">
            <motion.div
              initial={{ y: -600 }}
              animate={{ y: 400 }}
              transition={{ duration: 16, ease: "linear" }}
              className="space-y-10 text-white font-mono uppercase tracking-[0.25em] text-center italic"
            >
              <p className="text-yellow-400 text-3xl font-black shadow-lg">¡GALA COMPLETADA!</p>
              <p className="text-xl">Habéis salvado los vínculos.</p>
              <p>Gracias a toda la comunidad por estar presente.</p>
              <p>Por cada risa, cada clip y cada momento rancio...</p>
              <p>Sin vosotros, nada de esto tendría sentido.</p>
              <div className="pt-10">
                <p className="text-pink-500 font-black text-2xl">STAFF WSP AWARDS 2026</p>
                <p className="text-sm mt-2">Indira • Luis Elias • The Soul • Elviscocho</p>
              </div>
              <p className="pt-24 opacity-30 text-[10px] tracking-[0.8em]">RECONECTANDO CON EL LIVE...</p>
            </motion.div>
          </div>
        </motion.div>
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>
    );
  }

  if (!amigoActual) return <div className="bg-black min-h-screen" />;

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen bg-black text-white font-mono overflow-hidden py-4">
      {/* Background que reacciona a la fase final */}
      <Background esFinal={esFaseFinal} />
      
      {/* SECCIÓN 1: GALERÍA DE ALMAS */}
      <div className="w-full z-30 h-[120px] flex items-center justify-center p-2">
        <SoulGallery amigos={BATTLE_STORY.amigos} determinacion={determinacion} />
      </div>

      {/* SECCIÓN 2: PERSONAJE / ENEMIGO DINÁMICO */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[280px] z-10">
        <AnimatePresence mode="wait">
          {(fase === 'intro' || fase === 'ataque') && !mostrandoSalvado ? (
            <motion.div 
              key={esFaseFinal ? 'ded' : 'asriel'} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }}
            >
              {/* Le pasamos el sprite correcto según el progreso */}
              <Enemy fase={fase} sprite={esFaseFinal ? '/images/Ded.webp' : '/images/Asriel.webp'} />
            </motion.div>
          ) : (
            <motion.div 
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
              
              {/* INTRO */}
              {fase === 'intro' && (
                <DialogBox 
                  key={`intro-${introIndex}`}
                  texto={BATTLE_STORY.intro[introIndex]}
                  onComplete={avanzarDialogoIntro}
                />
              )}

              {/* DIÁLOGO / RESPUESTAS */}
              {(fase === 'dialogo' || mostrandoSalvado) && (
                <DialogBox 
                  key={`dialogo-${amigoActual.id}-${textoRespuesta}-${mostrandoSalvado}`}
                  texto={
                    mostrandoSalvado 
                      ? amigoActual.fraseSalvado 
                      : (textoRespuesta || amigoActual.frasePerdida)
                  } 
                  onComplete={continuarTrasRespuesta}
                />
              )}

              {/* ARENA DE COMBATE (Ahora con bordes blancos y sin saltos) */}
              {fase === 'ataque' && (
                <motion.div 
                  key="battle-arena" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative h-full w-full bg-black border-[4px] border-white overflow-hidden"
                >
                  <Soul 
                    x={posicionAlma.x} 
                    y={posicionAlma.y} 
                    estaVibrando={estaVibrando} 
                  />
                  <Attacks 
                    almaPos={posicionAlma} 
                    onHit={recibirDano} 
                    hardMode={esFaseFinal} 
                  />
                </motion.div>
              )}

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