import React, { useState, useEffect } from 'react';
import type { EpisodeType, PromptLevel } from '../types/tower';
import { ArrowLeftRight, PlusCircle, Layers, Sparkles, HelpCircle } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface EpisodeQuickLogProps {
  isOpen: boolean;
  onSaveEpisode: (type: EpisodeType, promptLevel: PromptLevel) => void;
  onClose: () => void;
}

export const EpisodeQuickLog: React.FC<EpisodeQuickLogProps> = ({
  isOpen,
  onSaveEpisode,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState<EpisodeType | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectType = (type: EpisodeType) => {
    soundManager.playClick();
    setSelectedType(type);
  };

  const handleSelectPrompt = (prompt: PromptLevel) => {
    soundManager.playClick();
    const finalType = selectedType || 'troca-turno';
    onSaveEpisode(finalType, prompt);
    setSelectedType(null);
    onClose();
  };

  return (
    <div className="quick-log-popup" role="dialog" aria-label="Registro Rápido Torre ESDM">
      <div className="quick-log-content">
        <div className="quick-log-header">
          <HelpCircle className="w-4 h-4 text-sky-600 inline mr-1" />
          <span className="quick-log-title">Registro Rápido ESDM (&le; 2 toques)</span>
        </div>

        {!selectedType ? (
          <div className="step-container">
            <span className="step-label">1. Comportamento observado da criança:</span>
            <div className="quick-options-row">
              <button
                type="button"
                className="quick-btn"
                onClick={() => handleSelectType('troca-turno')}
              >
                <ArrowLeftRight className="w-4 h-4 inline mr-1" />
                Troca de Turno
              </button>
              <button
                type="button"
                className="quick-btn"
                onClick={() => handleSelectType('pedido-bloco')}
              >
                <PlusCircle className="w-4 h-4 inline mr-1" />
                Pedido ("Mais")
              </button>
              <button
                type="button"
                className="quick-btn"
                onClick={() => handleSelectType('imitacao')}
              >
                <Layers className="w-4 h-4 inline mr-1" />
                Imitação
              </button>
              <button
                type="button"
                className="quick-btn"
                onClick={() => handleSelectType('contagem')}
              >
                <Sparkles className="w-4 h-4 inline mr-1" />
                Contagem 1-2-3
              </button>
              <button
                type="button"
                className="quick-btn"
                onClick={() => handleSelectType('derrubada')}
              >
                💥 Derrubada
              </button>
            </div>
          </div>
        ) : (
          <div className="step-container">
            <span className="step-label">2. Nível de Apoio do Mediador:</span>
            <div className="quick-options-row">
              <button
                type="button"
                className="quick-btn success-btn"
                onClick={() => handleSelectPrompt('independente')}
              >
                🌟 Independente (+)
              </button>
              <button
                type="button"
                className="quick-btn warn-btn"
                onClick={() => handleSelectPrompt('parcial')}
              >
                🤝 Apoio Parcial (P)
              </button>
              <button
                type="button"
                className="quick-btn info-btn"
                onClick={() => handleSelectPrompt('total')}
              >
                👐 Apoio Total (T)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
