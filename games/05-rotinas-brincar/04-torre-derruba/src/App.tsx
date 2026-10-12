import { useState, useEffect, useRef, useMemo } from 'react';
import { TowerPhysicsEngine } from './utils/towerPhysics';
import { soundManager } from './utils/sound';
import type {
  TurnHolder,
  StabilityAssist,
  TowerVariation,
  EpisodeType,
  PromptLevel,
  TeachingEpisode,
  TowerSessionMetrics,
} from './types/tower';
import { TowerCanvas } from './components/TowerCanvas';
import { TurnIndicator } from './components/TurnIndicator';
import { AdultControlStrip } from './components/AdultControlStrip';
import { CountdownOverlay } from './components/CountdownOverlay';
import { EpisodeQuickLog } from './components/EpisodeQuickLog';
import { ClosingModal } from './components/ClosingModal';
import { TherapistDashboard } from './components/TherapistDashboard';
import confetti from 'canvas-confetti';

const WOOD_COLORS = ['#d97706', '#b45309', '#92400e', '#78350f', '#ca8a04', '#ea580c'];

export function App() {
  const [windowSize, setWindowSize] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1000,
    h: typeof window !== 'undefined' ? window.innerHeight : 700,
  });

  const engine = useMemo(() => {
    return new TowerPhysicsEngine(windowSize.w, windowSize.h);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Session & Turn State
  const [turnHolder, setTurnHolder] = useState<TurnHolder>('ADULTO');
  const [stabilityAssist, setStabilityAssist] = useState<StabilityAssist>(2);
  const [variation, setVariation] = useState<TowerVariation>('padrao');
  const [canKnockdown, setCanKnockdown] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Overlays
  const [isCountdownOpen, setIsCountdownOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isClosingOpen, setIsClosingOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Metrics & Episodes
  const [metrics, setMetrics] = useState<TowerSessionMetrics>({
    blocksPlacedChild: 0,
    blocksPlacedAdult: 0,
    turnSwitches: 0,
    maxHeight: 0,
    stabilityAssistLevel: 2,
    imitatedVariationsCount: 0,
  });
  const [episodes, setEpisodes] = useState<TeachingEpisode[]>([]);
  const [durationSeconds, setDurationSeconds] = useState(0);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
      engine.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [engine]);

  // Duration timer
  useEffect(() => {
    const t = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Initial Blocks Population (4 adult, 2 child)
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Adult side blocks (left)
    for (let i = 0; i < 4; i++) {
      engine.spawnBlock(
        `block-adult-${i}`,
        'adulto',
        'retangular',
        WOOD_COLORS[i % WOOD_COLORS.length],
        110,
        150 + i * 65
      );
    }

    // Child side blocks (right)
    for (let i = 0; i < 2; i++) {
      engine.spawnBlock(
        `block-child-${i}`,
        'crianca',
        'retangular',
        WOOD_COLORS[(i + 4) % WOOD_COLORS.length],
        window.innerWidth - 110,
        180 + i * 65
      );
    }
  }, [engine]);

  // Pass Turn handler
  const handleToggleTurn = () => {
    setTurnHolder((prev) => {
      const next = prev === 'ADULTO' ? 'CRIANCA' : 'ADULTO';
      setMetrics((m) => ({ ...m, turnSwitches: m.turnSwitches + 1 }));
      return next;
    });
  };

  const handleSetFreeMode = () => {
    setTurnHolder((prev) => (prev === 'LIVRE' ? 'ADULTO' : 'LIVRE'));
  };

  // Give blocks to child (ESDM material control / manding opportunity)
  const handleGiveBlocksToChild = (count: number) => {
    soundManager.playWoodBlockPlaced(1);
    const existingChildBlocks = engine.blocks.filter((b) => b.owner === 'crianca' && !b.placedInTower).length;
    const startY = 180 + existingChildBlocks * 65;

    for (let i = 0; i < count; i++) {
      engine.spawnBlock(
        `block-child-mand-${Date.now()}-${i}`,
        'crianca',
        'retangular',
        WOOD_COLORS[(existingChildBlocks + i) % WOOD_COLORS.length],
        window.innerWidth - 110,
        startY + i * 65
      );
    }

    // Automatically record an ESDM manding/request teaching episode
    const ep: TeachingEpisode = {
      episodeId: `ep-${Date.now()}`,
      timestamp: Date.now(),
      type: 'pedido-bloco',
      promptLevel: 'independente',
      details: `Entregues +${count} bloco(s) após pedido da criança.`,
    };
    setEpisodes((prev) => [ep, ...prev]);
  };

  // Stability assist change
  const handleChangeStability = (level: StabilityAssist) => {
    setStabilityAssist(level);
    engine.config.stabilityAssist = level;
    setMetrics((m) => ({ ...m, stabilityAssistLevel: level }));
  };

  // Variation change
  const handleChangeVariation = (v: TowerVariation) => {
    setVariation(v);
    soundManager.playClick();
    const ep: TeachingEpisode = {
      episodeId: `ep-${Date.now()}`,
      timestamp: Date.now(),
      type: 'imitacao',
      promptLevel: 'independente',
      details: `Variação modelada: ${v}.`,
    };
    setEpisodes((prev) => [ep, ...prev]);
    setMetrics((m) => ({ ...m, imitatedVariationsCount: m.imitatedVariationsCount + 1 }));
  };

  // Block Placed in Tower
  const handleBlockPlaced = (towerHeight: number) => {
    soundManager.playWoodBlockPlaced(towerHeight);

    const isChild = turnHolder === 'CRIANCA';
    setMetrics((m) => ({
      ...m,
      blocksPlacedChild: isChild ? m.blocksPlacedChild + 1 : m.blocksPlacedChild,
      blocksPlacedAdult: !isChild ? m.blocksPlacedAdult + 1 : m.blocksPlacedAdult,
      maxHeight: Math.max(m.maxHeight, towerHeight),
    }));

    // Auto-switch turn if in turn-taking mode
    if (turnHolder !== 'LIVRE') {
      setTimeout(() => {
        handleToggleTurn();
      }, 500);
    }
  };

  // Tower Knockdown Climax
  const handleTowerKnocked = () => {
    soundManager.playSoftCollapse();
    confetti({ particleCount: 60, spread: 90, origin: { y: 0.7 } });
    setCanKnockdown(false);
    engine.config.canKnockdown = false;

    const ep: TeachingEpisode = {
      episodeId: `ep-${Date.now()}`,
      timestamp: Date.now(),
      type: 'derrubada',
      promptLevel: 'independente',
      details: 'Derrubada catártica compartilhada executada!',
    };
    setEpisodes((prev) => [ep, ...prev]);
  };

  // Expectant Pause & Quick Log
  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
    soundManager.playClick();
  };

  const handleReleaseWithLog = () => {
    setIsPaused(false);
    setIsQuickLogOpen(true);
  };

  const handleSaveEpisode = (type: EpisodeType, promptLevel: PromptLevel) => {
    const ep: TeachingEpisode = {
      episodeId: `ep-${Date.now()}`,
      timestamp: Date.now(),
      type,
      promptLevel,
      details: `Registro rápido: ${type} com apoio ${promptLevel}.`,
    };
    setEpisodes((prev) => [ep, ...prev]);
  };

  // Reset Routine
  const handleRestartRoutine = () => {
    engine.reset();
    setCanKnockdown(false);
    setIsClosingOpen(false);
    setTurnHolder('ADULTO');

    // Respawn initial blocks
    for (let i = 0; i < 4; i++) {
      engine.spawnBlock(`block-adult-${i}`, 'adulto', 'retangular', WOOD_COLORS[i % WOOD_COLORS.length], 110, 150 + i * 65);
    }
    for (let i = 0; i < 2; i++) {
      engine.spawnBlock(`block-child-${i}`, 'crianca', 'retangular', WOOD_COLORS[(i + 4) % WOOD_COLORS.length], window.innerWidth - 110, 180 + i * 65);
    }
  };

  return (
    <div className="den02-app">
      {/* Turn Indicator */}
      <TurnIndicator
        turnHolder={turnHolder}
        onToggleTurn={handleToggleTurn}
        onSetFreeMode={handleSetFreeMode}
      />

      {/* Main Canvas Viewport */}
      <main className="canvas-wrapper">
        <TowerCanvas
          engine={engine}
          turnHolder={turnHolder}
          canKnockdown={canKnockdown}
          onBlockPlaced={handleBlockPlaced}
          onTowerKnocked={handleTowerKnocked}
        />
      </main>

      {/* Adult Control Strip */}
      <AdultControlStrip
        stabilityAssist={stabilityAssist}
        variation={variation}
        isPaused={isPaused}
        canKnockdown={canKnockdown}
        onGiveBlocksToChild={handleGiveBlocksToChild}
        onChangeStability={handleChangeStability}
        onChangeVariation={handleChangeVariation}
        onStartCountdown={() => setIsCountdownOpen(true)}
        onUnlockKnockdown={() => {
          setCanKnockdown(true);
          engine.config.canKnockdown = true;
          soundManager.playClick();
        }}
        onTogglePause={handleTogglePause}
        onReleaseWithLog={handleReleaseWithLog}
        onCloseRoutine={() => setIsClosingOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
      />

      {/* Countdown 1-2-3 Overlay */}
      <CountdownOverlay
        isOpen={isCountdownOpen}
        onFinishCountdown={() => {
          setCanKnockdown(true);
          engine.config.canKnockdown = true;
        }}
        onClose={() => setIsCountdownOpen(false)}
      />

      {/* Quick Episode Log */}
      <EpisodeQuickLog
        isOpen={isQuickLogOpen}
        onSaveEpisode={handleSaveEpisode}
        onClose={() => setIsQuickLogOpen(false)}
      />

      {/* Closing Modal with Physical Wooden Blocks Bridge */}
      <ClosingModal
        isOpen={isClosingOpen}
        onRestartRoutine={handleRestartRoutine}
        onCloseModal={() => setIsClosingOpen(false)}
      />

      {/* Therapist Clinical Dashboard */}
      <TherapistDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        metrics={metrics}
        episodes={episodes}
        durationSeconds={durationSeconds}
      />
    </div>
  );
}

export default App;
