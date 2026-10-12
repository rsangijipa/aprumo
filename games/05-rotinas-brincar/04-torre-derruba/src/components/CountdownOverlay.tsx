import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/sound';
import { Sparkles, Bomb } from 'lucide-react';

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
  const [step, setStep] = useState<1 | 2 | 'pausa' | 3>(1);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      return;
    }

    soundManager.playWoodBlockPlaced(2);
    setStep(1);

    const t1 = setTimeout(() => {
      soundManager.playWoodBlockPlaced(5);
      setStep(2);
    }, 1200);

    const t2 = setTimeout(() => {
      soundManager.playWoodBlockPlaced(8);
      // Pausa expectante antes do 3!
      setStep('pausa');
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerThree = () => {
    soundManager.playCelebration();
    setStep(3);
    setTimeout(() => {
      onFinishCountdown();
      onClose();
    }, 800);
  };

  return (
    <div className="countdown-overlay" role="dialog" aria-label="Contagem Compartilhada">
      <div className="countdown-card">
        <div className="countdown-badge">
          <Sparkles className="w-5 h-5 text-amber-500 inline mr-1" />
          Antecipação Compartilhada (ESDM)
        </div>

        {step === 1 && <div className="countdown-number num-1">1...</div>}
        {step === 2 && <div className="countdown-number num-2">2...</div>}

        {step === 'pausa' && (
          <div className="countdown-pause-state">
            <h2 className="expectant-pause-heading">...esperando o olhar ou som da criança!</h2>
            <p className="expectant-pause-sub">
              Olhe no rosto da criança, faça expressão animada de suspense e toque abaixo para falar <strong>"3... DERRUBA!"</strong>
            </p>
            <button
              type="button"
              className="trigger-three-btn"
              onClick={handleTriggerThree}
            >
              <Bomb className="w-6 h-6 mr-2" />
              3... DERRUBA! 💥
            </button>
          </div>
        )}

        {step === 3 && <div className="countdown-number num-3">3... DERRUBA! 💥</div>}
      </div>
    </div>
  );
};
