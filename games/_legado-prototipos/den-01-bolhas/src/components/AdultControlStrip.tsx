import React, { useState } from 'react';
import type { RoutinePhase, VariationType } from '../types/bubble';
import {
  Wind,
  Mic,
  MicOff,
  Pause,
  Play,
  Sparkles,
  Sliders,
  Palette,
  XCircle,
  Eye,
  Settings,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface AdultControlStripProps {
  currentPhase: RoutinePhase;
  currentVariation: VariationType;
  isPaused: boolean;
  isMicActive: boolean;
  lowSensory: boolean;
  onBlow: (intensity: 'curto' | 'longo') => void;
  onToggleMic: () => void;
  onTogglePause: () => void;
  onReleaseWithLog: () => void;
  onSelectVariation: (variation: VariationType) => void;
  onTriggerChoice: () => void;
  onToggleLowSensory: () => void;
  onCloseRoutine: () => void;
  onOpenDashboard: () => void;
}

export const AdultControlStrip: React.FC<AdultControlStripProps> = ({
  currentPhase,
  currentVariation,
  isPaused,
  isMicActive,
  lowSensory,
  onBlow,
  onToggleMic,
  onTogglePause,
  onReleaseWithLog,
  onSelectVariation,
  onTriggerChoice,
  onToggleLowSensory,
  onCloseRoutine,
  onOpenDashboard,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={`adult-control-strip ${isOpen ? 'open' : 'collapsed'}`}>
      <button
        type="button"
        className="collapse-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Ocultar Painel do Mediador' : 'Exibir Painel do Mediador'}
      >
        {isOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        <span className="strip-label-indicator">Adulto (ESDM)</span>
      </button>

      {isOpen && (
        <div className="strip-content">
          <div className="strip-header">
            <span className="strip-badge">Mediador ESDM</span>
            <div className="phase-pill">Fase: {currentPhase.toUpperCase()}</div>
          </div>

          {/* Core Adult Blowing Triggers */}
          <div className="control-group">
            <label className="control-group-title">Soprar (Origem do Efeito):</label>
            <div className="button-row">
              <button
                type="button"
                className="adult-btn blow-btn"
                onClick={() => onBlow('curto')}
              >
                <Wind className="w-5 h-5 mr-1" />
                Soprar Curto
              </button>
              <button
                type="button"
                className="adult-btn blow-long-btn"
                onClick={() => onBlow('longo')}
              >
                <Sparkles className="w-5 h-5 mr-1" />
                Soprar Longo
              </button>
            </div>
            <button
              type="button"
              className={`adult-btn mic-btn ${isMicActive ? 'mic-on' : ''}`}
              onClick={onToggleMic}
            >
              {isMicActive ? <Mic className="w-5 h-5 mr-1" /> : <MicOff className="w-5 h-5 mr-1" />}
              {isMicActive ? 'Soprar no Microfone (Ativo)' : 'Ativar Sopro no Microfone'}
            </button>
          </div>

          {/* Expectant Pause & Quick Log Release */}
          <div className="control-group highlight-group">
            <label className="control-group-title">Pausa Expectante (Contato Social):</label>
            <div className="button-row">
              <button
                type="button"
                className={`adult-btn pause-btn ${isPaused ? 'active-pause' : ''}`}
                onClick={onTogglePause}
              >
                {isPaused ? <Play className="w-5 h-5 mr-1" /> : <Pause className="w-5 h-5 mr-1" />}
                {isPaused ? 'Em Pausa (Aguardando)' : 'Pausar Expectante'}
              </button>
              <button
                type="button"
                className="adult-btn release-btn"
                onClick={onReleaseWithLog}
              >
                <Eye className="w-5 h-5 mr-1" />
                Liberar + Registro
              </button>
            </div>
          </div>

          {/* Variations & Shared Choice */}
          <div className="control-group">
            <label className="control-group-title">Variações da Atividade:</label>
            <div className="variation-chips">
              {(['normal', 'gigantes', 'chuva', 'lentas', 'peixe'] as VariationType[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`var-chip ${currentVariation === v ? 'active' : ''}`}
                  onClick={() => {
                    soundManager.playClick();
                    onSelectVariation(v);
                  }}
                >
                  {v === 'normal' && 'Normal'}
                  {v === 'gigantes' && '🫧 Gigantes'}
                  {v === 'chuva' && '🌧️ Chuva'}
                  {v === 'lentas' && '🦥 Lentas'}
                  {v === 'peixe' && '🐠 Peixe'}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="adult-btn choice-btn"
              onClick={onTriggerChoice}
            >
              <Palette className="w-4 h-4 mr-1" />
              Oferecer Escolha à Criança
            </button>
          </div>

          {/* Sensory Profile & Dashboard */}
          <div className="control-group footer-group">
            <label className="sensory-toggle-row">
              <input
                type="checkbox"
                checked={lowSensory}
                onChange={onToggleLowSensory}
              />
              <span className="sensory-label">
                <Sliders className="w-4 h-4 inline mr-1 text-slate-600" />
                Perfil Sensorial Baixo
              </span>
            </label>

            <div className="action-row">
              <button
                type="button"
                className="adult-btn dashboard-btn"
                onClick={onOpenDashboard}
              >
                <Settings className="w-4 h-4 mr-1" />
                Métricas ESDM
              </button>
              <button
                type="button"
                className="adult-btn close-routine-btn"
                onClick={onCloseRoutine}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Acabou a Bolha
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
