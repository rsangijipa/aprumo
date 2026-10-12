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
            <span role="img" aria-label="Urso dormindo" className="text-6xl">
              🧸💤
            </span>
          </div>

          <h2 className="closing-title">O Ursinho Dormiu! Hora de Guardar!</h2>
          <p className="closing-subtitle">
            Vocês cuidaram do ursinho, deram comidinha, água e o cobriram com muito carinho.
          </p>

          {/* Mandatory ESDM Physical Bridge Alert */}
          <div className="physical-bridge-alert">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-amber-900 text-base">
                  Ponte Central para o Brinquedo Físico (ESDM Formato Espelho):
                </h4>
                <p className="text-amber-800 text-sm mt-1">
                  Pegue agora o <strong>urso de pelúcia real</strong> e o <strong>kit físico de comidinha</strong>! Repita a mesma sequência com o boneco de verdade: dê a colher na boca dele, dê água no copinho e cubra-o com o paninho. A meta clínica central é que a criança brinque cada vez mais com o brinquedo físico!
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
              Nova Brincadeira de Cuidar
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
              Guardar na Cesta e Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
