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
            <span role="img" aria-label="Garagem fechada" className="text-6xl">
              🏁🚗
            </span>
          </div>

          <h2 className="closing-title">Acabou a Corrida! Todos na Garagem!</h2>
          <p className="closing-subtitle">
            Vocês compartilharam antecipações vibrantes e celebraram a descida com alegria!
          </p>

          {/* Mandatory ESDM Physical Bridge Alert */}
          <div className="physical-bridge-alert">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-amber-900 text-base">
                  Ponte Obrigatória para o Recurso Físico (ESDM):
                </h4>
                <p className="text-amber-800 text-sm mt-1">
                  Pegue agora uma <strong>rampa real</strong> (uma tábua inclinada, canaleta ou pedaço de papelão) e os carrinhos da criança! Segure o carrinho no topo, faça a contagem <em>"Preparar... apontar..."</em> e pause esperando o <em>"JÁ!"</em> concreto da criança.
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
              Nova Descida na Rampa
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
              Estacionar e Finalizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
