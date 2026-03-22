import { useState, useEffect, useCallback, useRef } from 'react';

export const useBattleLogic = (friendsData: any[]) => {
  const [hp, setHp] = useState(20);
  const [posicionAlma, setPosicionAlma] = useState({ x: 0, y: 0 });
  const [determinacion, setDeterminacion] = useState(0);
  
  const [fase, setFase] = useState<'intro' | 'dialogo' | 'ataque' | 'save_menu'>('intro');
  const [introIndex, setIntroIndex] = useState(0); 
  const [amigoIndice, setAmigoIndice] = useState(0);
  const [estaVibrando, setEstaVibrando] = useState(false);
  const [invulnerable, setInvulnerable] = useState(false);
  
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const teclasPresionadas = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number | null>(null);

  const playSFX = useCallback((fileName: string) => {
    const audio = new Audio(`/sfx/${fileName}`);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }, []);

  // 1. INICIALIZAR MÚSICA
  useEffect(() => {
    playSFX('encounter.mp3');
    musicRef.current = new Audio('/music/asriel_mix.mp3');
    musicRef.current.loop = true;
    musicRef.current.volume = 0.4;
    
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

  // 🎵 FUNCIÓN PARA MATAR EL AUDIO DESDE EL INDEX
  const detenerAudio = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  }, []);

  // 2. LÓGICA DE MOVIMIENTO (Ahora sin el bucle infinito)
  const updateMovimiento = useCallback(() => {
    if (fase === 'ataque') {
      const VELOCIDAD = 7; 
      const LIMIT_X = 270; 
      const LIMIT_Y = 80;

      setPosicionAlma(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (teclasPresionadas.current['ArrowUp'] || teclasPresionadas.current['w']) newY -= VELOCIDAD;
        if (teclasPresionadas.current['ArrowDown'] || teclasPresionadas.current['s']) newY += VELOCIDAD;
        if (teclasPresionadas.current['ArrowLeft'] || teclasPresionadas.current['a']) newX -= VELOCIDAD;
        if (teclasPresionadas.current['ArrowRight'] || teclasPresionadas.current['d']) newX += VELOCIDAD;

        return {
          x: Math.max(-LIMIT_X, Math.min(LIMIT_X, newX)),
          y: Math.max(-LIMIT_Y, Math.min(LIMIT_Y, newY))
        };
      });
    }
  }, [fase]);

  // 3. MOTOR DE ANIMACIÓN Y EVENTOS DE TECLADO
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { teclasPresionadas.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { teclasPresionadas.current[e.key] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Aquí está el único motor que hace girar el juego
    const tick = () => {
      updateMovimiento();
      requestRef.current = requestAnimationFrame(tick);
    }
    requestRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateMovimiento]);

  // 4. RECIBIR DAÑO
  const recibirDano = useCallback(() => {
    if (invulnerable) return;
    playSFX('damage.mp3');
    setEstaVibrando(true);
    setInvulnerable(true);
    
    setHp(prev => {
      const nuevoHp = prev - 4;
      return nuevoHp <= 0 ? 20 : nuevoHp; 
    });

    setTimeout(() => setEstaVibrando(false), 200);
    setTimeout(() => setInvulnerable(false), 800); 
  }, [playSFX, invulnerable]);

  // 5. INTENTAR SALVAR (BOTONES)
  const intentarSalvar = (esCorrecto: boolean) => {
    playSFX('select.mp3');
    
    if (esCorrecto) {
      playSFX('hit.mp3');
      setDeterminacion(prev => Math.min(prev + 16.67, 100));
      
      setAmigoIndice(prev => {
        if (prev + 1 < friendsData.length) {
          setFase('dialogo'); 
          return prev + 1;
        }
        return prev;
      });
      
      setPosicionAlma({ x: 0, y: 0 });
    } else {
      setFase('ataque');
      
      setTimeout(() => {
        setFase('dialogo');
        setPosicionAlma({ x: 0, y: 0 });
      }, 6000); 
    }
  };

  return {
    hp,
    posicionAlma,
    fase,
    setFase,
    introIndex,
    setIntroIndex,
    amigoActual: friendsData[amigoIndice],
    intentarSalvar,
    recibirDano,
    estaVibrando,
    determinacion,
    amigoIndice,
    detenerAudio
  };
};