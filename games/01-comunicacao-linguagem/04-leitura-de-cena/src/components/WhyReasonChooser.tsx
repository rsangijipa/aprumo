import React from 'react';

interface WhyOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface WhyReasonChooserProps {
  options: WhyOption[];
  onSelectOption: (optionId: string) => void;
  selectedOptionId: string | null;
  showFeedback: boolean;
}

export const WhyReasonChooser: React.FC<WhyReasonChooserProps> = ({
  options,
  onSelectOption,
  selectedOptionId,
  showFeedback,
}) => {
  return (
    <div className="module-section-box">
      <div className="module-title-row">
        <span className="module-tag">Módulo E3</span>
        <h3 className="module-heading">Por que o personagem está se sentindo assim?</h3>
      </div>
      <p className="module-instructions">
        Pense no que acabou de acontecer na situação e escolha a explicação que faz mais sentido:
      </p>

      <div className="why-options-list">
        {options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          let btnClass = 'why-btn';

          if (showFeedback && isSelected) {
            btnClass += opt.isCorrect ? ' correct-choice' : ' incorrect-choice';
          } else if (isSelected) {
            btnClass += ' selected';
          }

          return (
            <button
              key={opt.id}
              type="button"
              className={btnClass}
              onClick={() => onSelectOption(opt.id)}
              disabled={showFeedback}
            >
              <span className="bullet-letter">{opt.id.replace('why-', '').toUpperCase()}</span>
              <span className="why-text">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className={`feedback-banner ${options.find((o) => o.id === selectedOptionId)?.isCorrect ? 'success' : 'gentle'}`}>
          {options.find((o) => o.id === selectedOptionId)?.isCorrect ? (
            <p>🎯 Excelente raciocínio de causa e efeito social!</p>
          ) : (
            <p>💡 Olhe de novo para o que está na mesa ou no chão da cena para entender o motivo.</p>
          )}
        </div>
      )}
    </div>
  );
};
