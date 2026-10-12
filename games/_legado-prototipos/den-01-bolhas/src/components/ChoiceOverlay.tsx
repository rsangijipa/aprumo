import React from 'react';
import { soundManager } from '../utils/sound';

interface ChoiceOption {
  label: string;
  hue: number;
  colorName: string;
  emoji: string;
}

const CHOICE_PAIRS: [ChoiceOption, ChoiceOption][] = [
  [
    { label: 'Bolha Azul do Rio', hue: 200, colorName: 'Azul', emoji: '💧' },
    { label: 'Bolha Dourada de Sol', hue: 45, colorName: 'Dourada', emoji: '☀️' },
  ],
  [
    { label: 'Bolha Rosa Flor', hue: 330, colorName: 'Rosa', emoji: '🌸' },
    { label: 'Bolha Verde Floresta', hue: 145, colorName: 'Verde', emoji: '🍃' },
  ],
  [
    { label: 'Bolha Violeta Mágica', hue: 275, colorName: 'Violeta', emoji: '✨' },
    { label: 'Bolha Laranja Açaí', hue: 25, colorName: 'Laranja', emoji: '🍊' },
  ],
];

interface ChoiceOverlayProps {
  isOpen: boolean;
  onSelectColor: (hue: number, label: string) => void;
  onClose: () => void;
}

export const ChoiceOverlay: React.FC<ChoiceOverlayProps> = ({
  isOpen,
  onSelectColor,
  onClose,
}) => {
  if (!isOpen) return null;

  // Pick pair
  const pair = CHOICE_PAIRS[0];

  const handleChoose = (opt: ChoiceOption) => {
    soundManager.playPop(3);
    soundManager.playChime();
    onSelectColor(opt.hue, opt.label);
    onClose();
  };

  return (
    <div className="choice-overlay" role="dialog" aria-label="Escolha de Bolha Compartilhada">
      <div className="choice-box">
        <h2 className="choice-title">Qual bolha você quer soprar agora?</h2>
        <p className="choice-subtitle">Aponte ou toque na bolha que você prefere:</p>

        <div className="choice-spheres-row">
          {pair.map((opt) => (
            <button
              key={opt.hue}
              type="button"
              className="choice-bubble-btn"
              onClick={() => handleChoose(opt)}
            >
              <div
                className="choice-sphere"
                style={{
                  background: `radial-gradient(circle at 35% 35%, hsla(${opt.hue}, 90%, 95%, 0.95), hsla(${opt.hue}, 85%, 60%, 0.75), hsla(${opt.hue}, 90%, 45%, 0.9))`,
                  boxShadow: `0 10px 30px hsla(${opt.hue}, 80%, 50%, 0.4)`,
                }}
              >
                <div className="choice-highlight" />
                <span className="choice-emoji">{opt.emoji}</span>
              </div>
              <span className="choice-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
