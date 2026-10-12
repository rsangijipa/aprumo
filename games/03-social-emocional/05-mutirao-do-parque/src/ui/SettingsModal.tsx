import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Volume2, VolumeX, Eye, ShieldCheck, History, X, Check } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const userPreferences = useGameStore(s => s.userPreferences);
  const saveUserPreferences = useGameStore(s => s.saveUserPreferences);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-[#E8DCC8]">
      <div className="bg-[#283033] border-2 border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
          <span>Configurações & Acessibilidade</span>
        </h3>

        {/* Audio section */}
        <div className="mb-6 space-y-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-sm font-bold text-white">
            <span className="flex items-center gap-2">
              {userPreferences.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              Áudio
            </span>
            <button
              onClick={() => saveUserPreferences({ isMuted: !userPreferences.isMuted })}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                userPreferences.isMuted
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-[#5E8C61]/30 text-emerald-300 border border-[#5E8C61]/50'
              }`}
            >
              {userPreferences.isMuted ? 'Mudo' : 'Ativo'}
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Música Lo-Fi:</span>
              <span className="font-mono">{Math.round(userPreferences.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={userPreferences.musicVolume}
              onChange={e => saveUserPreferences({ musicVolume: parseFloat(e.target.value) })}
              className="w-full accent-[#5E8C61]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Efeitos Sonoros (SFX):</span>
              <span className="font-mono">{Math.round(userPreferences.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={userPreferences.sfxVolume}
              onChange={e => saveUserPreferences({ sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-[#4F8198]"
            />
          </div>
        </div>

        {/* Accessibility Section */}
        <div className="mb-6 p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
            <Eye size={18} className="text-[#D9A441]" />
            <span>Acessibilidade Motora</span>
          </div>

          <label className="flex items-center justify-between cursor-pointer py-1.5 text-xs">
            <span>Modo Tap-to-Move (Tocar para Mover)</span>
            <input
              type="checkbox"
              checked={userPreferences.tapToMoveEnabled}
              onChange={e => saveUserPreferences({ tapToMoveEnabled: e.target.checked })}
              className="w-4 h-4 accent-[#5E8C61] rounded"
            />
          </label>
        </div>

        {/* Match History */}
        <div className="mb-6 p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
            <History size={18} className="text-[#4F8198]" />
            <span>Histórico de Mutirões</span>
          </div>

          {userPreferences.history.length === 0 ? (
            <div className="text-xs text-[#E8DCC8]/60 py-2">
              Nenhuma partida gravada ainda. Participe de um mutirão!
            </div>
          ) : (
            <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs">
              {userPreferences.history.slice(0, 5).map((h, i) => (
                <div key={i} className="flex justify-between p-2 rounded-xl bg-black/20">
                  <span className="font-bold text-white">{h.parkName}</span>
                  <span className="text-[#5E8C61]">{h.tasksCompleted} tarefas</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-[11px] text-[#E8DCC8]/60 pt-2 border-t border-white/10">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>Privacidade Garantida: 100% offline, sem coleta de voz, câmera ou biometria.</span>
        </div>
      </div>
    </div>
  );
};
