import { useState, useEffect, useRef, useMemo } from 'react';
import { RampPhysicsEngine } from './utils/rampPhysics';
import { soundManager } from './utils/sound';
import { DEFAULT_TRACKS } from './schemas/trackSchema';
import type {
  RampVariation,
  VehicleType,
  InitiativeModality,
  PromptLevel,
  TeachingEpisode,
  RampSessionMetrics,
  RampTrackConfig,
} from './types/ramp';
import { RampCanvas } from './components/RampCanvas';
import { AdultControlStrip } from './components/AdultControlStrip';
import { CountdownOverlay } from './components/CountdownOverlay';
import { EpisodeQuickLog } from './components/EpisodeQuickLog';
import { TrackBuilderModal } from './components/TrackBuilderModal';
import { ClosingModal } from './components/ClosingModal';
import { TherapistDashboard } from './components/TherapistDashboard';
import confetti from 'canvas-confetti';
import { Clock } from 'lucide-react';

export function App() {
  const engine = useMemo(() => new RampPhysicsEngine(), []);

  // Track & Routine State
  const [trackConfig, setTrackConfig] = useState<RampTrackConfig>(DEFAULT_TRACKS[0]);
  const [variation, setVariation] = useState<RampVariation>('padrao');
  const [rampAngle, setRampAngle] = useState(25);
  const [raceMode, setRaceMode] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);

  // Overlays
  const [isCountdownOpen, setIsCountdownOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isTrackBuilderOpen, setIsTrackBuilderOpen] = useState(false);
  const [isClosingOpen, setIsClosingOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Metrics
  const [metrics, setMetrics] = useState<RampSessionMetrics>({
    totalLaunches: 0,
    targetsHit: 0,
    vocalJaCount: 0,
    gestureCount: 0,
    raceWinsChild: 0,
  });
  const [episodes, setEpisodes] = useState<TeachingEpisode[]>([]);
  const [durationSeconds, setDurationSeconds] = useState(0);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setDurationSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Setup Track & Target Hit Callback
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const w = window.innerWidth;
    const h = window.innerHeight;
    engine.buildTrack(trackConfig, w, h);
    engine.spawnVehicle('v-child-1', 'carro', 'crianca', '#ef4444');

    engine.onTargetHitCallback = () => {
      soundManager.playPinsStrike();
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.8 } });
      setMetrics((m) => ({ ...m, targetsHit: m.targetsHit + 1 }));
    };
  }, [engine, trackConfig]);

  // Release Gate / Launch
  const handleReleaseGate = () => {
    const ok = engine.openGate();
    if (ok) {
      setIsGateOpen(true);
      soundManager.playMotorAcceleration();
      setMetrics((m) => ({ ...m, totalLaunches: m.totalLaunches + 1 }));
      setIsQuickLogOpen(true);
    }
  };

  // Change Ramp Angle
  const handleChangeAngle = (newAngle: number) => {
    setRampAngle(newAngle);
    const updated = { ...trackConfig, rampAngleDeg: newAngle };
    setTrackConfig(updated);
    const w = window.innerWidth;
    const h = window.innerHeight;
    engine.buildTrack(updated, w, h);
    engine.spawnVehicle('v-child-1', 'carro', 'crianca', '#ef4444');
    if (raceMode) {
      engine.spawnVehicle('v-adult-1', 'caminhao', 'adulto', '#3b82f6', 60);
    }
    setIsGateOpen(false);
  };

  // Give vehicle to child (ESDM mand opportunity)
  const handleGiveVehicleToChild = (type: VehicleType) => {
    soundManager.playGentleHorn();
    const colors = ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    engine.spawnVehicle(`v-child-${Date.now()}`, type, 'crianca', randomColor);
  };

  // Variations
  const handleSelectVariation = (v: RampVariation) => {
    setVariation(v);
    soundManager.playClick();
    let angle = rampAngle;
    let hasBridge = false;
    let hasTunnel = false;

    if (v === 'ingreme') angle = 40;
    if (v === 'ponte-igarape') hasBridge = true;
    if (v === 'tunel') hasTunnel = true;

    const updated: RampTrackConfig = {
      ...trackConfig,
      rampAngleDeg: angle,
      hasBridge,
      hasTunnel,
    };
    setRampAngle(angle);
    setTrackConfig(updated);

    const w = window.innerWidth;
    const h = window.innerHeight;
    engine.buildTrack(updated, w, h);
    engine.spawnVehicle('v-child-1', 'carro', 'crianca', '#ef4444');
    setIsGateOpen(false);
  };

  const handleToggleRaceMode = () => {
    const next = !raceMode;
    setRaceMode(next);
    soundManager.playClick();

    const w = window.innerWidth;
    const h = window.innerHeight;
    engine.buildTrack(trackConfig, w, h);
    engine.spawnVehicle('v-child-1', 'carro', 'crianca', '#ef4444');
    if (next) {
      engine.spawnVehicle('v-adult-1', 'caminhao', 'adulto', '#3b82f6', 60);
    }
    setIsGateOpen(false);
  };

  // Quick Log Save
  const handleSaveEpisode = (modality: InitiativeModality, promptLevel: PromptLevel) => {
    const isVocal = modality === 'palavra-ja';
    setMetrics((m) => ({
      ...m,
      vocalJaCount: isVocal ? m.vocalJaCount + 1 : m.vocalJaCount,
      gestureCount: !isVocal ? m.gestureCount + 1 : m.gestureCount,
    }));

    const ep: TeachingEpisode = {
      episodeId: `ep-${Date.now()}`,
      timestamp: Date.now(),
      vehicle: 'carro',
      rampAngleDeg: rampAngle,
      variation,
      raceMode,
      targetHit: true,
      modality,
      promptLevel,
    };
    setEpisodes((prev) => [ep, ...prev]);
  };

  // Apply custom track from TrackBuilder
  const handleApplyTrack = (newTrack: RampTrackConfig) => {
    setTrackConfig(newTrack);
    setRampAngle(newTrack.rampAngleDeg);
    const w = window.innerWidth;
    const h = window.innerHeight;
    engine.buildTrack(newTrack, w, h);
    engine.spawnVehicle('v-child-1', 'carro', 'crianca', '#ef4444');
    setIsGateOpen(false);
  };

  // Reset Routine
  const handleRestartRoutine = () => {
    setIsClosingOpen(false);
    setIsGateOpen(false);
    const w = window.innerWidth;
    const h = window.innerHeight;
    engine.buildTrack(trackConfig, w, h);
    engine.spawnVehicle('v-child-1', 'carro', 'crianca', '#ef4444');
  };

  return (
    <div className="den03-app">
      {/* Top Status */}
      <header className="top-info-bar">
        <div className="routine-badge">
          <span>DEN-03: Rampa Maluca</span>
          <span className="text-slate-400">|</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Clock className="w-4 h-4" />
            {Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-sky-700 font-bold">{trackConfig.name} ({rampAngle}°)</span>
        </div>
      </header>

      {/* Main Ramp Viewport */}
      <main className="canvas-wrapper">
        <RampCanvas engine={engine} />
      </main>

      {/* Adult Control Strip */}
      <AdultControlStrip
        variation={variation}
        rampAngle={rampAngle}
        raceMode={raceMode}
        isGateOpen={isGateOpen}
        onStartCountdown={() => setIsCountdownOpen(true)}
        onReleaseGate={handleReleaseGate}
        onChangeAngle={handleChangeAngle}
        onSelectVariation={handleSelectVariation}
        onToggleRaceMode={handleToggleRaceMode}
        onGiveVehicleToChild={handleGiveVehicleToChild}
        onOpenTrackBuilder={() => setIsTrackBuilderOpen(true)}
        onCloseRoutine={() => setIsClosingOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
      />

      {/* Countdown Overlay */}
      <CountdownOverlay
        isOpen={isCountdownOpen}
        onFinishCountdown={handleReleaseGate}
        onClose={() => setIsCountdownOpen(false)}
      />

      {/* Episode Quick Log */}
      <EpisodeQuickLog
        isOpen={isQuickLogOpen}
        onSaveEpisode={handleSaveEpisode}
        onClose={() => setIsQuickLogOpen(false)}
      />

      {/* TrackBuilder Modal */}
      <TrackBuilderModal
        isOpen={isTrackBuilderOpen}
        onClose={() => setIsTrackBuilderOpen(false)}
        currentTrack={trackConfig}
        onApplyTrack={handleApplyTrack}
      />

      {/* Closing Modal with Mandatory Physical Ramp Bridge */}
      <ClosingModal
        isOpen={isClosingOpen}
        onRestartRoutine={handleRestartRoutine}
        onCloseModal={() => setIsClosingOpen(false)}
      />

      {/* Therapist Dashboard */}
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
