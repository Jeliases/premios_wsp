// src/components/gala/battle/index.tsx
'use client'
import { useBattleLogic } from '@/hooks/useBattleLogic';
import { LOST_SOULS_DATA } from '@/lib/battle-data';
import Screen from './Screen';
import Soul from './Soul';
import Attacks from './Attacks';
import DialogBox from './DialogBox'; 
import Actions from './Actions';     
import Enemy from './Enemy';
import Background from './Background'; // <--- EL TOQUE FINAL

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
  } = useBattleLogic(LOST_SOULS_DATA);

  // Seguridad: Si por alguna razón no hay amigo cargado, mostramos un cargando
  if (!amigoActual) return <div className="bg-black min-h-screen" />;

  return (
    <div className="relative flex flex-col items-center justify-center space-y-4 py-6 min-h-screen overflow-hidden">
      
      {/* 0. FONDO ARCOÍRIS (Detrás de todo) */}
      <Background />

      {/* 1. EL JEFE (ASRIEL / GALA WSP) */}
      <Enemy />

      {/* 2. STATS (HP BAR) */}
      <div className="relative z-10 flex gap-8 text-white font-mono text-xl uppercase tracking-widest mb-4">
        <span>GALA WSP</span>
        <div className="flex items-center gap-2">
           <span className="text-sm">HP</span>
           <div className="w-24 h-5 bg-red-700 border-2 border-white">
              <div 
                className="h-full bg-yellow-400 transition-all duration-300" 
                style={{ width: `${(hp / 20) * 100}%` }} 
              />
           </div>
           <span className="min-w-[50px]">{hp}/20</span>
        </div>
      </div>

      {/* 3. PANTALLA DE BATALLA (SCREEN) */}
      <div className="relative z-10">
        <Screen fase={fase}>
          {/* Alma Roja */}
          <Soul x={posicionAlma.x} y={posicionAlma.y} estaVibrando={estaVibrando} />
          
          {/* Renderizado condicional según la fase */}
          {fase === 'ataque' && (
            <Attacks almaPos={posicionAlma} onHit={recibirDano} />
          )}

          {fase === 'dialogo' && (
            <DialogBox 
              texto={amigoActual.frasePerdida} 
              onComplete={() => setTimeout(() => setFase('save_menu'), 1000)}
            />
          )}

          {/* Si el HP llega a 0, aquí podrías poner un componente de "But it refused" */}
        </Screen>
      </div>

      {/* 4. MENÚ DE ACCIONES (Aparece bajo la pantalla) */}
      <div className="relative z-10 h-[120px] flex items-center justify-center">
        {fase === 'save_menu' && (
          <Actions 
            amigo={amigoActual} 
            onAction={(esCorrecta) => intentarSalvar(esCorrecta)} 
          />
        )}
      </div>

      {/* 5. BARRA DE DETERMINACIÓN FINAL */}
      <div className="relative z-10 w-full max-w-[600px] mt-4">
        <p className="text-white font-mono text-[10px] mb-2 uppercase text-center tracking-[0.2em] opacity-80">
          Nivel de Determinación
        </p>
        <div className="w-full h-4 bg-gray-900/80 rounded-full overflow-hidden border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <div 
            className="h-full bg-gradient-to-r from-red-600 via-orange-500 via-yellow-400 to-white transition-all duration-1000 ease-out" 
            style={{ width: `${determinacion}%` }} 
          />
        </div>
        <p className="text-[9px] text-gray-400 font-mono mt-3 text-center uppercase tracking-[0.3em]">
          {determinacion < 100 
            ? "Llamando a las almas perdidas..." 
            : "¡TODOS ESTÁN A SALVO!"}
        </p>
      </div>

      {/* Estilo CSS Global para la fuente si no la tienes configurada */}
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/determination-mono');
        * { cursor: crosshair; }
      `}</style>
    </div>
  );
}