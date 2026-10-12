import React, { useState } from 'react';
import type { StabilityAssist, TowerVariation } from '../types/tower';
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Play,
  Pause,
  Bomb,
  Settings,
  Sparkles,
  Shield,
  Layers,
  Archive,
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface AdultControlStripProps {
  stabilityAssist: StabilityAssist;
  variation: TowerVariation;
  isPaused: boolean;
  canKnockdown: boolean;
  onGiveBlocksToChild: (count: number) => void;
  onChangeStability: (level: StabilityAssist) => void;
  onChangeVariation: (v: TowerVariation) => void;
  onStartCountdown: () => void;
  onUnlockKnockdown: () => void;
  onTogglePause: () => void;
  onReleaseWithLog: () => void;
  onCloseRoutine: () => void;
  onOpenDashboard: () => void;
}

export const AdultControlStrip: React.FC<AdultControlStripProps> = ({
  stabilityAssist,
  variation,
  isPaused,
  canKnockdown,
  onGiveBlocksToChild,
  onChangeStability,
  onChangeVariation,
  onStartCountdown,
  onUnlockKnockdown,
  onTogglePause,
  onReleaseWithLog,
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
        title={isOpen ? 'Ocultar Painel do Adulto' : 'Exibir Painel do Adulto'}
      >
        {isOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        <span className="strip-label-indicator">Adulto (ESDM)</span>
      </button>

      {isOpen && (
        <div className="strip-content">
          <div className="strip-header">
            <span className="strip-badge">Mediador ESDM</span>
            <div className="phase-pill">Torre de Blocos</div>
          </div>

          {/* Material Control: Give blocks to child */}
          <div className="control-group highlight-group">
            <label className="control-group-title">Entregar Blocos à Criança (Oportunidade de Mand/Pedido):</label>
            <div className="button-row">
              <button
                type="button"
                className="adult-btn give-btn"
                onClick={() => onGiveBlocksToChild(1)}
              >
                <Plus className="w-4 h-4 mr-1" />
                +1 Bloco
              </button>
              <button
                type="button"
                className="adult-btn give-btn"
                onClick={() => onGiveBlocksToChild(2)}
              >
                <Plus className="w-4 h-4 mr-1" />
                +2 Blocos
              </button>
              <button
                type="button"
                className="adult-btn give-btn"
                onClick={() => onGiveBlocksToChild(3)}
              >
                <Plus className="w-4 h-4 mr-1" />
                +3 Blocos
              </button>
            </div>
          </div>

          {/* Social Climax: 1-2-3 Countdown & Knockdown */}
          <div className="control-group climax-group">
            <label className="control-group-title">Clímax Social: Contagem & Derrubada</label>
            <button
              type="button"
              className="adult-btn countdown-btn"
              onClick={onStartCountdown}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Contagem "1, 2, ... 3!"
            </button>
            <button
              type="button"
              className={`adult-btn knockdown-unlock-btn ${canKnockdown ? 'unlocked' : ''}`}
              onClick={onUnlockKnockdown}
            >
              <Bomb className="w-4 h-4 mr-1" />
              {canKnockdown ? 'Derrubada Liberada (Toque!)' : 'Liberar Derrubada'}
            </button>
          </div>

          {/* Expectant Pause & Quick Log */}
          <div className="control-group">
            <label className="control-group-title">Pausa Expectante (Contato Visual/Vocal):</label>
            <div className="button-row">
              <button
                type="button"
                className={`adult-btn pause-btn ${isPaused ? 'active-pause' : ''}`}
                onClick={onTogglePause}
              >
                {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                {isPaused ? 'Em Pausa' : 'Pausar'}
              </button>
              <button
                type="button"
                className="adult-btn release-btn"
                onClick={onReleaseWithLog}
              >
                Liberar + Registro
              </button>
            </div>
          </div>

          {/* Stability Assist Level (0 to 3) */}
          <div className="control-group">
            <label className="control-group-title">
              <Shield className="w-4 h-4 inline mr-1 text-emerald-600" />
              Assistência de Estabilidade ({stabilityAssist}/3):
            </label>
            <div className="stability-selector">
              {([0, 1, 2, 3] as StabilityAssist[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`lvl-pill ${stabilityAssist === lvl ? 'active' : ''}`}
                  onClick={() => {
                    soundManager.playClick();
                    onChangeStability(lvl);
                  }}
                  title={
                    lvl === 0
                      ? 'Física pura'
                      : lvl === 1
                      ? 'Snap leve'
                      : lvl === 2
                      ? 'Snap generoso e amortecimento angular'
                      : 'Estabilidade travada'
                  }
                >
                  Nível {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Variations for Imitation */}
          <div className="control-group">
            <label className="control-group-title">
              <Layers className="w-4 h-4 inline mr-1 text-indigo-600" />
              Variações Temáticas (Imitação):
            </label>
            <div className="variation-chips">
              {(['padrao', 'alternada', 'ponte', 'trem', 'bamba', 'animal'] as TowerVariation[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`var-chip ${variation === v ? 'active' : ''}`}
                  onClick={() => {
                    soundManager.playClick();
                    onChangeVariation(v);
                  }}
                >
                  {v === 'padrao' && 'Padrão'}
                  {v === 'alternada' && '🎨 Alternada'}
                  {v === 'ponte' && '🌉 Ponte'}
                  {v === 'trem' && '🚂 Trem'}
                  {v === 'bamba' && '🏗️ Bamba'}
                  {v === 'animal' && '🐆 Esbarrão'}
                </button>
              ))}
            </div>
          </div>

          {/* Footer: Dashboard & Close Routine */}
          <div className="control-group footer-group">
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
                <Archive className="w-4 h-4 mr-1" />
                Guardar Blocos
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
