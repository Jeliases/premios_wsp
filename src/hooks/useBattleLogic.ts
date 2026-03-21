// src/hooks/useBattleLogic.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export const useBattleLogic = (friendsData: any[]) => {
  const [hp, setHp] = useState(20);
  const [posicionAlma, setPosicionAlma] = useState({ x: 0, y: 0 });
  const [determinacion, setDeterminacion] = useState(0);
  const [fase, setFase] = useState<'dialogo' | 'ataque' | 'save_menu'>('dialogo');
  const [amigoIndice, setAmigoIndice] = useState(0);
  const [estaVibrando, setEstaVibrando] = useState(false);
  
  // Referencia para la música de fondo
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // Función maestra para efectos de sonido
  const playSFX = useCallback((fileName: string) => {
    const audio = new Audio(`/sfx/${fileName}`);
    audio.volume = 0.6;
    audio.play().catch(() => console.log("Interactúa con la página para activar audio"));
  }, []);

  // Iniciar el encuentro y la música
  useEffect(() => {
    // Sonido de inicio de batalla
    playSFX('encounter.mp3');

    // Configurar música de fondo
    musicRef.current = new Audio('/music/asriel_mix.mp3');
    musicRef.current.loop = true;
    musicRef.current.volume = 0.5;
    
    // La música solo suena tras el primer clic del usuario
    const startMusic = () => {
      musicRef.current?.play();
      window.removeEventListener('click', startMusic);
    };
    window.addEventListener('click', startMusic);

    return () => {
      musicRef.current?.pause();
      window.removeEventListener('click', startMusic);
    };
  }, [playSFX]);

  // Movimiento del alma
  const moverAlma = useCallback((e: KeyboardEvent) => {
    if (fase !== 'ataque') return;
    const step = 8;
    const limite = 140;

    setPosicionAlma(prev => {
      let { x, y } = prev;
      if (e.key === 'ArrowUp') y = Math.max(y - step, -limite);
      if (e.key === 'ArrowDown') y = Math.min(y + step, limite);
      if (e.key === 'ArrowLeft') x = Math.max(x - step, -limite);
      if (e.key === 'ArrowRight') x = Math.min(x + step, limite);
      return { x, y };
    });
  }, [fase]);

  useEffect(() => {
    window.addEventListener('keydown', moverAlma);
    return () => window.removeEventListener('keydown', moverAlma);
  }, [moverAlma]);

  // Recibir daño
  const recibirDano = useCallback(() => {
    playSFX('damage.mp3');
    setEstaVibrando(true);
    setHp(prev => {
      const nuevoHp = prev - 4;
      if (nuevoHp <= 0) {
        // Lógica "But it refused"
        // Aquí podrías usar soul_refuse.mp3 si lo tienes, 
        // o el que definimos para sanar.
        return 20; 
      }
      return nuevoHp;
    });
    setTimeout(() => setEstaVibrando(false), 500);
  }, [playSFX]);

  // Lógica de SALVAR
  const intentarSalvar = (esCorrecto: boolean) => {
    // Sonido al elegir opción
    playSFX('select.mp3');
    
    if (esCorrecto) {
      // Sonido de "golpe de redención"
      playSFX('hit.mp3');
      
      // Subir determinación (100 / 6 amigos ≈ 16.6)
      setDeterminacion(prev => Math.min(prev + 16.7, 100));
      
      setFase('ataque');
      
      // El ataque dura 8 segundos, luego siguiente amigo
      setTimeout(() => {
        setAmigoIndice(prev => {
          if (prev + 1 < friendsData.length) {
            setFase('dialogo');
            return prev + 1;
          }
          setFase('dialogo'); // Aquí podrías disparar el evento de victoria
          return prev;
        });
        setPosicionAlma({ x: 0, y: 0 });
      }, 8000);

    } else {
      // Si falla, solo hay ataque pero no avanza
      setFase('ataque');
      setTimeout(() => {
        setFase('dialogo');
        setPosicionAlma({ x: 0, y: 0 });
      }, 5000);
    }
  };

  return {
    hp,
    posicionAlma,
    fase,
    setFase,
    amigoActual: friendsData[amigoIndice],
    intentarSalvar,
    recibirDano,
    estaVibrando,
    determinacion
  };
};