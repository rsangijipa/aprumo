import React from 'react';
import type { ActionOption } from '../types/scene';
import { Check, ShieldAlert, Award, UserCheck, MessageSquare } from 'lucide-react';

interface ResponseChooserProps {
  actionOptions: ActionOption[];
  selectedActionId: string | null;
  onSelectAction: (actionId: string) => void;
  showFeedback: boolean;
  rehearsalStatus: 'sem-ajuda' | 'com-ajuda' | 'nao-executou' | null;
  onSetRehearsal: (status: 'sem-ajuda' | 'com-ajuda' | 'nao-executou') => void;
}

export const ResponseChooser: React.FC<ResponseChooserProps> = ({
  actionOptions,
  selectedActionId,
  onSelectAction,
  showFeedback,
  rehearsalStatus,
  onSetRehearsal,
}) => {
  const selectedAction = actionOptions.find((a) => a.id === selectedActionId);

  return (
    <div className="module-section-box">
      <div className="module-title-row">
        <span className="module-tag">Módulo E4</span>
        <h3 className="module-heading">O que seria legal fazer ou dizer nessa hora?</h3>
      </div>
      <p className="module-instructions">
        Situações sociais podem ter mais de uma resposta adequada. Escolha uma atitude respeitosa e construtiva:
      </p>

      <div className="actions-list">
        {actionOptions.map((opt) => {
          const isSelected = selectedActionId === opt.id;
          let btnClass = 'action-choice-btn';

          if (showFeedback && isSelected) {
            btnClass += opt.isAcceptable ? ' acceptable-choice' : ' unacceptable-choice';
          } else if (isSelected) {
            btnClass += ' selected';
          }

          return (
            <button
              key={opt.id}
              type="button"
              className={btnClass}
              onClick={() => onSelectAction(opt.id)}
              disabled={showFeedback}
            >
              <span className="action-emoji">{opt.iconEmoji}</span>
              <div className="action-body">
                <span className="action-title">{opt.text}</span>
                {showFeedback && isSelected && (
                  <p className="action-feedback-text">
                    {opt.isAcceptable ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Check className="w-4 h-4 inline" /> {opt.explanation}
                      </span>
                    ) : (
                      <span className="text-amber-800 flex items-center gap-1">
                        <ShieldAlert className="w-4 h-4 inline" /> {opt.explanation}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Roleplay Rehearsal Guide when an acceptable action is chosen */}
      {selectedAction && selectedAction.isAcceptable && showFeedback && (
        <div className="rehearsal-card">
          <div className="rehearsal-header">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h4 className="rehearsal-title">Ensaio Comportamental ao Vivo (Role-Play)</h4>
          </div>
          <p className="rehearsal-guide-text">
            <strong>Instrução para a criança e mediador:</strong> {selectedAction.rehearsalGuide}
          </p>

          <div className="therapist-scoring-box">
            <span className="scoring-label">Avaliação do Terapeuta / Aplicador ABA:</span>
            <div className="scoring-buttons">
              <button
                type="button"
                className={`score-btn ${rehearsalStatus === 'sem-ajuda' ? 'active-score' : ''}`}
                onClick={() => onSetRehearsal('sem-ajuda')}
              >
                <Award className="w-4 h-4 inline mr-1 text-emerald-600" />
                Independente (+ / Sem ajuda)
              </button>
              <button
                type="button"
                className={`score-btn ${rehearsalStatus === 'com-ajuda' ? 'active-score' : ''}`}
                onClick={() => onSetRehearsal('com-ajuda')}
              >
                <UserCheck className="w-4 h-4 inline mr-1 text-blue-600" />
                Com Ajuda Verbal / Gestual (P)
              </button>
              <button
                type="button"
                className={`score-btn ${rehearsalStatus === 'nao-executou' ? 'active-score' : ''}`}
                onClick={() => onSetRehearsal('nao-executou')}
              >
                Não Executou (-)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
