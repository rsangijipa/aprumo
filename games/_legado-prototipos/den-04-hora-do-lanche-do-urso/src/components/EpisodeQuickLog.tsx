import React, { useState, useEffect } from 'react';
import type { ActionLocation, PromptLevel } from '../types/pretend';
import { Smartphone, Heart, HelpCircle } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface EpisodeQuickLogProps {
  isOpen: boolean;
  actionSummary: string;
  onSaveEpisode: (location: ActionLocation, promptLevel: PromptLevel) => void;
  onClose: () => void;
}

export const EpisodeQuickLog: React.FC<EpisodeQuickLogProps> = ({
  isOpen,
  actionSummary,
  onSaveEpisode,
  onClose,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<ActionLocation | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectLocation = (loc: ActionLocation) => {
    soundManager.playClick();
    setSelectedLocation(loc);
  };

  const handleSelectPrompt = (prompt: PromptLevel) => {
    soundManager.playClick();
    const finalLoc = selectedLocation || 'tela';
    onSaveEpisode(finalLoc, prompt);
    setSelectedLocation(null);
    onClose();
  };

  return (
    <div className="quick-log-popup" role="dialog" aria-label="Registro Rápido Faz-de-Conta">
      <div className="quick-log-content">
        <div className="quick-log-header">
          <HelpCircle className="w-4 h-4 text-amber-600 inline mr-1" />
          <span className="quick-log-title">Registro ESDM Formato Espelho</span>
        </div>
        <p className="text-xs text-slate-500 font-semibold mb-2">{actionSummary}</p>

        {!selectedLocation ? (
          <div className="step-container">
            <span className="step-label">1. Onde a criança fez o gesto do faz de conta?</span>
            <div className="quick-options-row">
              <button
                type="button"
                className="quick-btn info-btn"
                onClick={() => handleSelectLocation('tela')}
              >
                <Smartphone className="w-4 h-4 inline mr-1" />
                Na Tela do Tablet
              </button>
              <button
                type="button"
                className="quick-btn highlight-real-btn"
                onClick={() => handleSelectLocation('brinquedo-real')}
              >
                <Heart className="w-4 h-4 inline mr-1 text-rose-500" />
                🧸 No Urso Físico ao Lado!
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
