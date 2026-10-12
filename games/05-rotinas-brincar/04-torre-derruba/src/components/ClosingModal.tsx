import React from 'react';
import { Sparkles, RefreshCw, Archive, Heart } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface ClosingModalProps {
  isOpen: boolean;
  onRestartRoutine: () => void;
  onCloseModal: () => void;
}

export const ClosingModal: React.FC<ClosingModalProps> = ({
  isOpen,
  onRestartRoutine,
  onCloseModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-window closing-modal-card">
        <div className="closing-content">
          <div className="closing-icon-bounce">
            <span role="img" aria-label="Caixa de blocos" className="text-6xl">
              📦🧱
            </span>
          </div>

          <h2 className="closing-title">Acabou a Torre! Hora de Guardar!</h2>
          <p className="closing-subtitle">
            Vocês construíram, trocaram turnos e celebraram a queda juntos com muita alegria!
          </p>

          {/* Mandatory ESDM Physical Bridge Alert */}
          <div className="physical-bridge-alert">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-amber-900 text-base">
                  Ponte Obrigatória para os Blocos Físicos (ESDM):
                </h4>
                <p className="text-amber-800 text-sm mt-1">
                  Pegue agora uma <strong>caixa de blocos de madeira ou copos reais</strong>! Sente-se de frente com a criança no chão, coloque os blocos do seu lado e alterne os turnos: <em>"Minha vez... agora é a sua vez!"</em>. Compare se os pedidos e imitações se generalizam com o material concreto.
                </p>
              </div>
            </div>
          </div>

          <div className="closing-actions">
            <button
              type="button"
              className="closing-btn-primary"
              onClick={() => {
                soundManager.playClick();
                onRestartRoutine();
              }}
            >
              <RefreshCw className="w-5 h-5 mr-1" />
              Construir Nova Torre
            </button>
            <button
              type="button"
              className="closing-btn-secondary"
              onClick={() => {
                soundManager.playClick();
                onCloseModal();
              }}
            >
              <Heart className="w-5 h-5 mr-1 text-rose-500" />
              <Archive className="w-5 h-5 mr-1" />
              Guardar e Finalizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
