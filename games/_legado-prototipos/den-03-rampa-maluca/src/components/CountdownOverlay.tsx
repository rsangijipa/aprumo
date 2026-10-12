import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/sound';
import { Sparkles, Flag } from 'lucide-react';

interface CountdownOverlayProps {
  isOpen: boolean;
  onFinishCountdown: () => void;
  onClose: () => void;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  isOpen,
  onFinishCountdown,
  onClose,
}) => {
  const [step, setStep] = useState<'preparar' | 'apontar' | 'pausa' | 'ja'>('preparar');

  useEffect(() => {
    if (!isOpen) {
      setStep('preparar');
      return;
    }

    soundManager.speakCountdownPart('Preparar...');
    setStep('preparar');

    const t1 = setTimeout(() => {
      soundManager.speakCountdownPart('Apontar...');
      setStep('apontar');
    }, 1400);

    const t2 = setTimeout(() => {
      // Expectant pause before JÁ!
      setStep('pausa');
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerJa = () => {
    soundManager.speakCountdownPart('JÁ!');
    soundManager.playGentleHorn();
    setStep('ja');
    setTimeout(() => {
      onFinishCountdown();
      onClose();
    }, 600);
  };

  return (
    <div className="countdown-overlay" role="dialog" aria-label="Contagem da Rampa ESDM">
      <div className="countdown-card">
        <div className="countdown-badge">
          <Sparkles className="w-5 h-5 text-amber-500 inline mr-1" />
          Antecipação de Causa e Efeito (ESDM)
        </div>

        {step === 'preparar' && <div className="countdown-number text-sky-600">Preparar...</div>}
        {step === 'apontar' && <div className="countdown-number text-amber-600">Apontar...</div>}

        {step === 'pausa' && (
          <div className="countdown-pause-state">
            <h2 className="expectant-pause-heading">...esperando o "JÁ!" da criança!</h2>
            <p className="expectant-pause-sub">
              Olhe no rosto da criança com expectativa e suspense. Quando ela olhar, vocalizar ou falar "Já!", toque no botão para abrir a trava:
            </p>
            <button
              type="button"
              className="trigger-ja-btn"
              onClick={handleTriggerJa}
            >
              <Flag className="w-6 h-6 mr-2" />
              🏁 JÁ! (Soltar Carrinho!)
            </button>
          </div>
        )}

        {step === 'ja' && <div className="countdown-number text-emerald-600 font-bold">🏁 JÁ! VROOOM!</div>}
      </div>
    </div>
  );
};
