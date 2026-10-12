import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SharedGoals } from './SharedGoals';
import { Inventory } from './Inventory';
import { QuickComms } from './QuickComms';
import { TouchControls } from './TouchControls';
import { EventBanner } from './EventBanner';
import { SettingsModal } from './SettingsModal';
import { Clock, Settings, Volume2, VolumeX, Pause, Play, Flag } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

export const GameHUD: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const world = useGameStore(s => s.worldState);
  const finishMatchWithStats = useGameStore(s => s.finishMatchWithStats);
  const userPreferences = useGameStore(s => s.userPreferences);
  const saveUserPreferences = useGameStore(s => s.saveUserPreferences);

  if (!world) return null;

  // Format time remaining
  const formatTime = (secs: number) => {
    if (!world.isTimerActive || world.matchDuration === 'livre') return 'Livre';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFinishEarly = () => {
    world.finishMatch();
    if (world.stats) {
      finishMatchWithStats(world.stats);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Top Left: Goals */}
      <SharedGoals />

      {/* Top Center: Park Title */}
      <div className="hidden lg:flex absolute top-4 left-1/2 -translate-x-1/2 z-20 items-center gap-2 bg-[#283033]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold text-white shadow-md">
        <span className="w-2.5 h-2.5 rounded-full bg-[#5E8C61]" />
        <span>{world.mapDef.name}</span>
      </div>

      {/* Top Right: Timer & Options */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        {/* Timer */}
        <div className="flex items-center gap-2 bg-[#283033]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-white shadow-lg">
          <Clock size={16} className={world.timeRemainingSeconds < 60 ? 'text-red-400 animate-pulse' : 'text-[#D9A441]'} />
          <span className="font-mono font-black text-sm tracking-wider">
            {formatTime(world.timeRemainingSeconds)}
          </span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => saveUserPreferences({ isMuted: !userPreferences.isMuted })}
          className="p-2.5 rounded-2xl bg-[#283033]/90 backdrop-blur-md border border-white/10 text-[#E8DCC8] hover:text-white transition-all shadow-lg active:scale-95"
          title="Alternar Áudio"
        >
          {userPreferences.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Finish Early / Review Button */}
        <button
          onClick={handleFinishEarly}
          className="p-2.5 rounded-2xl bg-[#283033]/90 backdrop-blur-md border border-white/10 text-[#D9A441] hover:text-white transition-all shadow-lg active:scale-95"
          title="Encerrar Mutirão e Ver Resultados"
        >
          <Flag size={18} />
        </button>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 rounded-2xl bg-[#283033]/90 backdrop-blur-md border border-white/10 text-[#E8DCC8] hover:text-white transition-all shadow-lg active:scale-95"
          title="Configurações"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Dynamic Event Banner */}
      <EventBanner />

      {/* Center Bottom: Inventory */}
      <Inventory />

      {/* Touch / Quick Comms Controls */}
      <TouchControls />
      <QuickComms />

      {/* Settings Modal */}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};
