import React from 'react';
import type { TurnHolder } from '../types/tower';
import { ArrowLeftRight, User, Baby, Shuffle } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface TurnIndicatorProps {
  turnHolder: TurnHolder;
  onToggleTurn: () => void;
  onSetFreeMode: () => void;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  turnHolder,
  onToggleTurn,
  onSetFreeMode,
}) => {
  return (
    <div className="turn-indicator-card">
      <div className="turn-badge-row">
        <span className="turn-status-label">Turno Atual:</span>
        {turnHolder === 'ADULTO' && (
          <span className="turn-badge adult-badge">
            <User className="w-4 h-4 inline mr-1" />
            Vez do Adulto
          </span>
        )}
        {turnHolder === 'CRIANCA' && (
          <span className="turn-badge child-badge">
            <Baby className="w-4 h-4 inline mr-1" />
            Vez da Criança
          </span>
        )}
        {turnHolder === 'LIVRE' && (
          <span className="turn-badge free-badge">
            <Shuffle className="w-4 h-4 inline mr-1" />
            Modo Conjunto Livre
          </span>
        )}
      </div>

      <div className="turn-actions">
        <button
          type="button"
          className="pass-turn-btn"
          onClick={() => {
            soundManager.playClick();
            onToggleTurn();
          }}
          title="Alternar vez entre Adulto e Criança"
        >
          <ArrowLeftRight className="w-4 h-4 mr-1" />
          Passar Vez
        </button>
        <button
          type="button"
          className={`free-mode-btn ${turnHolder === 'LIVRE' ? 'active-free' : ''}`}
          onClick={() => {
            soundManager.playClick();
            onSetFreeMode();
          }}
          title="Desliga restrição de turnos para aprendizes iniciais"
        >
          {turnHolder === 'LIVRE' ? 'Ativar Turnos' : 'Modo Livre'}
        </button>
      </div>
    </div>
  );
};
