import React, { useState } from 'react';
import type { CharacterState, CharacterType } from '../types/pretend';
import {
  ChevronRight,
  ChevronLeft,
  Utensils,
  GlassWater,
  Moon,
  Sparkles,
  Volume2,
  VolumeX,
  Settings,
  Archive,
  Wand2,
} from 'lucide-react';

interface AdultControlStripProps {
  character: CharacterType;
  state: CharacterState;
  isSubstitutionActive: boolean;
  speechEnabled: boolean;
  onTriggerState: (state: CharacterState) => void;
  onToggleSubstitution: () => void;
  onToggleSpeech: () => void;
  onTogglePause: () => void;
  onOpenDashboard: () => void;
  onCloseRoutine: () => void;
}

export const AdultControlStrip: React.FC<AdultControlStripProps> = ({
  character,
  state,
  isSubstitutionActive,
  speechEnabled,
  onTriggerState,
  onToggleSubstitution,
  onToggleSpeech,
  onTogglePause,
  onOpenDashboard,
  onCloseRoutine,
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
            <div className="phase-pill">Faz de Conta: {character}</div>
          </div>

          {/* Trigger Character Needs (Adult Controls Motivation) */}
          <div className="control-group highlight-group">
            <label className="control-group-title">Disparar Necessidades do Personagem:</label>
            <div className="button-grid">
              <button
                type="button"
                className={`adult-btn need-btn ${state === 'fome' ? 'active-need' : ''}`}
                onClick={() => onTriggerState('fome')}
              >
                <Utensils className="w-4 h-4 mr-1 text-amber-600" />
                Sentir Fome
              </button>
              <button
                type="button"
                className={`adult-btn need-btn ${state === 'sede' ? 'active-need' : ''}`}
                onClick={() => onTriggerState('sede')}
              >
                <GlassWater className="w-4 h-4 mr-1 text-sky-600" />
                Sentir Sede
              </button>
              <button
                type="button"
                className={`adult-btn need-btn ${state === 'sujo' ? 'active-need' : ''}`}
                onClick={() => onTriggerState('sujo')}
              >
                🍓 Ficar Sujo
              </button>
              <button
                type="button"
                className={`adult-btn need-btn ${state === 'sono' ? 'active-need' : ''}`}
                onClick={() => onTriggerState('sono')}
              >
                <Moon className="w-4 h-4 mr-1 text-indigo-600" />
                Sentir Sono
              </button>
            </div>
          </div>

          {/* Expectant Pause */}
          <div className="control-group">
            <label className="control-group-title">Pausa Expectante (Boca Aberta Esperando):</label>
            <button
              type="button"
              className="adult-btn pause-btn"
              onClick={onTogglePause}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Esperar Iniciativa da Criança
            </button>
          </div>

          {/* Symbolic Substitution Toggle */}
          <div className="control-group substitution-group">
            <label className="control-group-title">Substituição Simbólica (ESDM Nível 3):</label>
            <button
              type="button"
              className={`adult-btn substitution-btn ${isSubstitutionActive ? 'active-sub' : ''}`}
              onClick={onToggleSubstitution}
            >
              <Wand2 className="w-4 h-4 mr-1" />
              {isSubstitutionActive ? '✨ Bloco é Pão (Ativo)' : 'Ativar "Bloco vira Pão"'}
            </button>
            <span className="text-xs text-slate-500">
              Permite que o urso coma o bloco de madeira neutro fingindo que é pão.
            </span>
          </div>

          {/* Voice of Character Toggle */}
          <div className="control-group">
            <label className="control-group-title">Voz do Personagem:</label>
            <button
              type="button"
              className="adult-btn speech-toggle-btn"
              onClick={onToggleSpeech}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4 mr-1" /> : <VolumeX className="w-4 h-4 mr-1" />}
              {speechEnabled ? 'Voz Digital Ativa' : 'Adulto dá a Voz (Recomendado)'}
            </button>
          </div>

          {/* Footer */}
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
                Guardar Cesta
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
