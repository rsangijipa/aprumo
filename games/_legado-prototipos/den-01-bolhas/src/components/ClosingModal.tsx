import React from 'react';
import { Heart, Sparkles, RefreshCw } from 'lucide-react';
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
            <span role="img" aria-label="Frasco fechado" className="text-6xl">
              🫧👋
            </span>
          </div>

          <h2 className="closing-title">Acabou a Bolha! Tchau, bolhas!</h2>
          <p className="closing-subtitle">
            Você e a criança completaram a rotina sensório-social com muito afeto e atenção compartilhada.
          </p>

          {/* Mandatory ESDM Physical Bridge Alert */}
          <div className="physical-bridge-alert">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-amber-900 text-base">
                  Ponte Obrigatória para o Objeto Físico (ESDM):
                </h4>
                <p className="text-amber-800 text-sm mt-1">
                  Pegue agora o <strong>frasco de sabão real</strong> e repita a mesma rotina de soprar e pausar perto do seu rosto! Compare se a criança mantém os pedidos por olhar, gesto ou vocalização com o frasco de verdade.
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
              Recomeçar Nova Rotina
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
              Concluir Sessão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
