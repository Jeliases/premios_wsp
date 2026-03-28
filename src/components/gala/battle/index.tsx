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

const ENDING_STORY = [
  "Agradecer a todos por compartir y ser parte de todo lo que vivimos que se resume en los Premios WhatsApp del Indirismo.",
  "Quién diría que por el maldito League of Legends y otros juegos más, terminaríamos coincidiendo aquí, formando algo tan especial.",
  "De verdad espero que lo hayan disfrutado tanto como yo, porque esto no es solo un evento, es todo lo que hemos construido juntos",
  "Somos una comunidad de distintos países, con realidades y personalidades muy diferentes, pero qué bonito se siente saber que, al final, todos pertenecemos a un mismo hogar y está aquí",
  "No tengo dudas de que lo que se viene será mucho mejor, con nuevas experiencias, funas, juegos, nuevos personajes en este arco del anime, chistes y memes, pero siempre compartiéndolo entre todos nosotros.",
  "Gracias por estar, por quedarse y por hacer que todo esto tenga sentido."
];

export default function BattleMain() {
  const router = useRouter();
  
  // 🚀 IMPORTAMOS detenerAudio AQUÍ
  const { 
    posicionAlma, fase, setFase, introIndex, setIntroIndex,
    hp, amigoActual, intentarSalvar, recibirDano, determinacion, estaVibrando,
    detenerAudio
  } = useBattleLogic(BATTLE_STORY.amigos);

  const [mostrandoSalvado, setMostrandoSalvado] = useState(false);
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [bloqueado, setBloqueado] = useState(false);
  
  const endingMusicRef = useRef<HTMLAudioElement | null>(null);
  const [endingIndex, setEndingIndex] = useState(0);

  const esFaseFinal = useMemo(() => {
    if (!amigoActual) return false;
    const indice = BATTLE_STORY.amigos.findIndex(a => a.id === amigoActual.id);
    return indice >= 3; 
  }, [amigoActual]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const iniciarFinal = () => {
    // 🚀 APAGAMOS A ASRIEL DEFINITIVAMENTE ANTES DE INICIAR HIS THEME
    if (detenerAudio) {
      detenerAudio();
    }

    document.querySelectorAll('audio').forEach(a => {
      a.pause();
      a.currentTime = 0;
    });

    endingMusicRef.current = new Audio('/music/histheme.mp3');
    endingMusicRef.current.volume = 0.5;
    endingMusicRef.current.play().catch(e => console.log("Audio play deferred"));
    
    setFase('ending' as any);
  };

  const avanzarEnding = () => {
    if (endingIndex < ENDING_STORY.length - 1) {
      setEndingIndex(endingIndex + 1);
    } else {
      router.push('/live');
    }
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
          setTimeout(() => setBloqueado(false), 50);
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

  if (fase === ('ending' as any)) {
    return (
      <div className="fixed inset-0 bg-black z-[300] flex flex-col items-center justify-center overflow-hidden p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 3 }} 
          className="flex flex-col items-center w-full max-w-[620px] z-10"
        >
          <img 
            src="/images/amigos/final.png" 
            className="w-[300px] md:w-[450px] object-contain mb-12 rounded-lg shadow-[0_0_80px_rgba(255,255,255,0.1)]" 
            alt="Final" 
          />
          <div className="w-full h-[200px]">
            <Screen fase="salvacion">
              <AnimatePresence mode="wait">
                <DialogBox 
                  key={`ending-${endingIndex}`} 
                  texto={ENDING_STORY[endingIndex]} 
                  onComplete={avanzarEnding} 
                />
              </AnimatePresence>
            </Screen>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!amigoActual) return <div className="bg-black min-h-screen" />;

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen bg-black text-white overflow-hidden py-4">
      <Background esFinal={esFaseFinal} />
      
      <div className="w-full z-30 h-[120px] flex items-center justify-center p-2">
        <SoulGallery amigos={BATTLE_STORY.amigos} determinacion={determinacion} />
      </div>
      
      <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[280px] z-10">
        <AnimatePresence mode="wait">
          {(fase === 'intro' || fase === 'ataque') && !mostrandoSalvado ? (
            <motion.div 
              key={esFaseFinal ? 'ded' : 'asriel'} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }}
            >
              <Enemy fase={fase} sprite={esFaseFinal ? '/images/amigos/Ded.webp' : '/images/amigos/Asriel.webp'} />
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
                className={`w-52 h-52 md:w-64 md:h-64 object-contain border-4 shadow-2xl transition-all ${mostrandoSalvado ? 'border-yellow-400 shadow-[0_0_30px_gold]' : 'border-red-600 grayscale brightness-50'}`} 
                style={{ imageRendering: 'pixelated' }} 
              />
              <div className="flex items-center gap-4 mt-4">
                <span 
                  className="text-yellow-400 font-black text-xl tracking-widest" 
                  style={{ fontFamily: "'Press Start 2P', cursive" }}
                >
                  HP {hp}/20
                </span>
                <div className="w-40 h-3 bg-red-900 border border-white">
                  <div className="h-full bg-yellow-400" style={{ width: `${(hp/20)*100}%` }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
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
                  key={`dialogo-${amigoActual.id}-${textoRespuesta}-${mostrandoSalvado}`} 
                  texto={mostrandoSalvado ? amigoActual.fraseSalvado : (textoRespuesta || amigoActual.frasePerdida)} 
                  onComplete={continuarTrasRespuesta} 
                />
              )}
              {fase === 'ataque' && (
                <motion.div 
                  key="battle-arena" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="relative h-full w-full bg-black border-[4px] border-white overflow-hidden"
                >
                  <Soul x={posicionAlma.x} y={posicionAlma.y} estaVibrando={estaVibrando} />
                  <Attacks almaPos={posicionAlma} onHit={recibirDano} hardMode={esFaseFinal} />
                </motion.div>
              )}
            </AnimatePresence>
        </Screen>
      </div>
      
      <div className="z-20 h-[140px] w-full flex items-center justify-center p-4">
        {fase === 'save_menu' && !mostrandoSalvado && !bloqueado && (
          <Actions amigo={amigoActual} onAction={manejarAccion} />
        )}
      </div>
    </div>
  );
}