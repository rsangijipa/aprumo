import { useState, useEffect, useRef, useMemo } from 'react';
import { BubbleEngine } from './utils/physics';
import { soundManager } from './utils/sound';
import type {
  RoutinePhase,
  VariationType,
  InitiativeModality,
  PromptLevel,
  TeachingEpisode,
  JointActivityRoutine,
} from './types/bubble';
import { BubblesCanvas } from './components/BubblesCanvas';
import { AdultControlStrip } from './components/AdultControlStrip';
import { EpisodeQuickLog } from './components/EpisodeQuickLog';
import { ChoiceOverlay } from './components/ChoiceOverlay';
import { ClosingModal } from './components/ClosingModal';
import { TherapistDashboard } from './components/TherapistDashboard';
import confetti from 'canvas-confetti';
import { Clock } from 'lucide-react';

export function App() {
  const engine = useMemo(() => new BubbleEngine(), []);

  // Routine State
  const [phase, setPhase] = useState<RoutinePhase>('abertura');
  const [variation, setVariation] = useState<VariationType>('normal');
  const [isPaused, setIsPaused] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [lowSensory, setLowSensory] = useState(false);
  const [activeHue, setActiveHue] = useState<number | undefined>(undefined);

  // Quick Log & Modal Overlays
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);
  const [isClosingOpen, setIsClosingOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Time & Latency Tracking
  const pauseStartRef = useRef<number | null>(null);
  const [routineDuration, setRoutineDuration] = useState(0);
  const [episodes, setEpisodes] = useState<TeachingEpisode[]>([]);

  // Duration timer
  useEffect(() => {
    const interval = window.setInterval(() => {
      setRoutineDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initial choice opening
  useEffect(() => {
    setIsChoiceOpen(true);
  }, []);

  // Adult Blow trigger
  const handleAdultBlow = (intensity: 'curto' | 'longo') => {
    soundManager.playBlowing();
    const count = intensity === 'curto' ? 4 : 10;
    const w = window.innerWidth;
    const h = window.innerHeight;
    engine.spawnAdultBubbles(count, w, h, variation, activeHue);
    if (phase === 'abertura') {
      setPhase('tema');
    }
  };

  // Microphone detection handler
  const handleToggleMic = async () => {
    if (isMicActive) {
      soundManager.stopMicDetection();
      setIsMicActive(false);
    } else {
      const ok = await soundManager.startMicBlowingDetection(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        soundManager.playBlowing();
        engine.spawnAdultBubbles(6, w, h, variation, activeHue);
      });
      setIsMicActive(ok);
    }
  };

  // Pause Expectante
  const handleTogglePause = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    engine.setExpectantPause(nextState);

    if (nextState) {
      soundManager.playClick();
      pauseStartRef.current = Date.now();
    } else {
      pauseStartRef.current = null;
    }
  };

  // Release Expectant Pause and Open Quick Log
  const handleReleaseWithLog = () => {
    const latency = pauseStartRef.current ? Date.now() - pauseStartRef.current : 0;
    setIsPaused(false);
    engine.setExpectantPause(false);
    pauseStartRef.current = null;
    setIsQuickLogOpen(true);

    // Temp store latency for the pending episode
    pendingLatencyRef.current = latency;
  };

  const pendingLatencyRef = useRef<number>(0);

  // Save Teaching Episode
  const handleSaveEpisode = (modality: InitiativeModality, promptLevel: PromptLevel) => {
    const newEp: TeachingEpisode = {
      episodeId: `ep-${Date.now()}`,
      timestamp: Date.now(),
      routinePhase: phase,
      variation,
      latencyMs: pendingLatencyRef.current,
      modality,
      promptLevel,
      bubblesPoppedCount: engine.totalPopped,
    };
    setEpisodes((prev) => [newEp, ...prev]);

    if (promptLevel === 'independente') {
      soundManager.playChime();
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    }

    // Auto-blow a few bubbles to reinforce child's communication!
    handleAdultBlow('curto');
  };

  // Variations
  const handleSelectVariation = (newVar: VariationType) => {
    setVariation(newVar);
    setPhase('elaboracao');
    handleAdultBlow('curto');
  };

  // Choice Selection
  const handleSelectChoice = (hue: number) => {
    setActiveHue(hue);
    setPhase('tema');
    handleAdultBlow('curto');
  };

  // Low sensory toggle
  const handleToggleLowSensory = () => {
    const next = !lowSensory;
    setLowSensory(next);
    engine.setLowSensory(next);
  };

  // Close Routine
  const handleCloseRoutine = () => {
    soundManager.playChime();
    setPhase('fechamento');
    setIsClosingOpen(true);
    if (isMicActive) {
      soundManager.stopMicDetection();
      setIsMicActive(false);
    }
  };

  const handleRestartRoutine = () => {
    engine.reset();
    setRoutineDuration(0);
    setPhase('abertura');
    setIsClosingOpen(false);
    setIsChoiceOpen(true);
  };

  const routineData: JointActivityRoutine = {
    routineId: `routine-${Date.now()}`,
    startTime: Date.now() - routineDuration * 1000,
    durationSeconds: routineDuration,
    episodes,
    totalBubblesSpawned: engine.totalSpawned,
    totalBubblesPopped: engine.totalPopped,
    physicalReminderShown: isClosingOpen,
  };

  return (
    <div className="den01-app">
      {/* Top Status Bar */}
      <header className="top-info-bar">
        <div className="routine-badge">
          <span>DEN-01: Bolhas de Sabão</span>
          <span className="text-slate-400">|</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Clock className="w-4 h-4" />
            {Math.floor(routineDuration / 60)}m {routineDuration % 60}s
          </span>
        </div>
        {isPaused && (
          <div className="pause-indicator-pill">
            👀 Pausa Expectante: Aguardando Iniciativa...
          </div>
        )}
      </header>

      {/* Main Bubbles Canvas */}
      <main className="canvas-wrapper">
        <BubblesCanvas engine={engine} />
      </main>

      {/* Adult Control Strip */}
      <AdultControlStrip
        currentPhase={phase}
        currentVariation={variation}
        isPaused={isPaused}
        isMicActive={isMicActive}
        lowSensory={lowSensory}
        onBlow={handleAdultBlow}
        onToggleMic={handleToggleMic}
        onTogglePause={handleTogglePause}
        onReleaseWithLog={handleReleaseWithLog}
        onSelectVariation={handleSelectVariation}
        onTriggerChoice={() => setIsChoiceOpen(true)}
        onToggleLowSensory={handleToggleLowSensory}
        onCloseRoutine={handleCloseRoutine}
        onOpenDashboard={() => setIsDashboardOpen(true)}
      />

      {/* Quick Episode Log Popup */}
      <EpisodeQuickLog
        isOpen={isQuickLogOpen}
        onSaveEpisode={handleSaveEpisode}
        onClose={() => setIsQuickLogOpen(false)}
      />

      {/* Opening Choice Overlay */}
      <ChoiceOverlay
        isOpen={isChoiceOpen}
        onSelectColor={handleSelectChoice}
        onClose={() => setIsChoiceOpen(false)}
      />

      {/* Closing Modal & Physical Bridge */}
      <ClosingModal
        isOpen={isClosingOpen}
        onRestartRoutine={handleRestartRoutine}
        onCloseModal={() => setIsClosingOpen(false)}
      />

      {/* Therapist Clinical Panel */}
      <TherapistDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        routine={routineData}
      />
    </div>
  );
}

export default App;
