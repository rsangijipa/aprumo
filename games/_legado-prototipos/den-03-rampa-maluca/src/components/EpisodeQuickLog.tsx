import React, { useState, useEffect } from 'react';
import type { InitiativeModality, PromptLevel } from '../types/ramp';
import { Eye, Hand, MessageCircle, HelpCircle } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface EpisodeQuickLogProps {
  isOpen: boolean;
  onSaveEpisode: (modality: InitiativeModality, promptLevel: PromptLevel) => void;
  onClose: () => void;
}

export const EpisodeQuickLog: React.FC<EpisodeQuickLogProps> = ({
  isOpen,
  onSaveEpisode,
  onClose,
}) => {
  const [selectedModality, setSelectedModality] = useState<InitiativeModality | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectModality = (mod: InitiativeModality) => {
    soundManager.playClick();
    setSelectedModality(mod);
  };

  const handleSelectPrompt = (prompt: PromptLevel) => {
    soundManager.playClick();
    const finalMod = selectedModality || 'palavra-ja';
    onSaveEpisode(finalMod, prompt);
    setSelectedModality(null);
    onClose();
  };

  return (
    <div className="quick-log-popup" role="dialog" aria-label="Registro Rápido Rampa ESDM">
      <div className="quick-log-content">
        <div className="quick-log-header">
          <HelpCircle className="w-4 h-4 text-sky-600 inline mr-1" />
          <span className="quick-log-title">Registro Rápido ESDM (&le; 2 toques)</span>
        </div>

        {!selectedModality ? (
          <div className="step-container">
            <span className="step-label">1. Como a criança sinalizou a largada?</span>
            <div className="quick-options-row">
              <button
                type="button"
                className="quick-btn success-btn font-bold"
                onClick={() => handleSelectModality('palavra-ja')}
              >
                🗣️ Palavra "JÁ!"
              </button>
              <button
                type="button"
                className="quick-btn"
                onClick={() => handleSelectModality('vocalizacao')}
              >
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Vocalização ("Vruum")
              </button>
              <button
                type="button"
                className="quick-btn"
                onClick={() => handleSelectModality('gesto')}
              >
                <Hand className="w-4 h-4 inline mr-1" />
                Gesto de Mão
              </button>
              <button
                type="button"
                className="quick-btn"
                onClick={() => handleSelectModality('olhar')}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Olhar no Adulto
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
