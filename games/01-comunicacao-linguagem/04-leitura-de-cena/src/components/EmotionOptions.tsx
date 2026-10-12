import React from 'react';
import type { EmotionType } from '../types/scene';

interface EmotionOptionsProps {
  currentEmotion: EmotionType;
  onSelectEmotion: (emotion: EmotionType) => void;
  selectedEmotion: EmotionType | null;
  showFeedback: boolean;
}

const ALL_EMOTIONS: { id: EmotionType; label: string; icon: string }[] = [
  { id: 'alegria', label: 'Alegria / Empolgação', icon: '😊' },
  { id: 'tristeza', label: 'Tristeza / Desânimo', icon: '😔' },
  { id: 'raiva', label: 'Raiva / Irritação', icon: '😠' },
  { id: 'medo', label: 'Medo / Insegurança', icon: '😨' },
  { id: 'surpresa', label: 'Surpresa / Espanto', icon: '😲' },
  { id: 'frustracao', label: 'Frustração', icon: '😣' },
  { id: 'ansiedade', label: 'Ansiedade / Preocupação', icon: '😟' },
  { id: 'calma', label: 'Calma / Tranquilidade', icon: '😌' },
];

export const EmotionOptions: React.FC<EmotionOptionsProps> = ({
  currentEmotion,
  onSelectEmotion,
  selectedEmotion,
  showFeedback,
}) => {
  // Always include the correct emotion and 3 balanced foils
  const options = React.useMemo(() => {
    const foils = ALL_EMOTIONS.filter((e) => e.id !== currentEmotion);
    // Deterministic shuffle using emotion id to avoid flicker on rerender
    const shuffledFoils = [...foils].sort((a, b) => a.label.localeCompare(b.label)).slice(0, 3);
    const correctObj = ALL_EMOTIONS.find((e) => e.id === currentEmotion)!;
    const combined = [correctObj, ...shuffledFoils];
    return combined.sort((a, b) => a.id.localeCompare(b.id));
  }, [currentEmotion]);

  return (
    <div className="module-section-box">
      <div className="module-title-row">
        <span className="module-tag">Módulo E1</span>
        <h3 className="module-heading">Como o personagem da cena está se sentindo?</h3>
      </div>
      <p className="module-instructions">
        Observe a expressão do rosto, a postura do corpo e o tom da fala para identificar a emoção:
      </p>

      <div className="emotion-grid">
        {options.map((opt) => {
          const isSelected = selectedEmotion === opt.id;
          const isCorrect = opt.id === currentEmotion;

          let btnClass = 'emotion-btn';
          if (showFeedback && isSelected) {
            btnClass += isCorrect ? ' correct-choice' : ' incorrect-choice';
          } else if (isSelected) {
            btnClass += ' selected';
          }

          return (
            <button
              key={opt.id}
              type="button"
              className={btnClass}
              onClick={() => onSelectEmotion(opt.id)}
              disabled={showFeedback}
            >
              <span className="emotion-icon" role="img" aria-label={opt.label}>
                {opt.icon}
              </span>
              <span className="emotion-name">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className={`feedback-banner ${selectedEmotion === currentEmotion ? 'success' : 'gentle'}`}>
          {selectedEmotion === currentEmotion ? (
            <p>🌟 Muito bem! Você identificou a emoção com base nas pistas sociais da cena!</p>
          ) : (
            <p>💙 Vamos reavaliar juntos: veja a expressão do personagem e o que aconteceu no ambiente.</p>
          )}
        </div>
      )}
    </div>
  );
};
