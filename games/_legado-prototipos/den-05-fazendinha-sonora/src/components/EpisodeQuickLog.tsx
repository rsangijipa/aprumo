import React, { useState } from 'react';
import type { ResponseType, PromptLevel, AnimalId } from '../types/book';
import { PlusCircle, CheckCircle2 } from 'lucide-react';

interface EpisodeQuickLogProps {
  currentPage: number;
  currentAnimal: AnimalId;
  totalLogged: number;
  onLogEpisode: (data: {
    responseType: ResponseType;
    promptLevel: PromptLevel;
    echoOfAdult: boolean;
  }) => void;
}

export const EpisodeQuickLog: React.FC<EpisodeQuickLogProps> = ({
  currentPage,
  currentAnimal,
  totalLogged,
  onLogEpisode,
}) => {
  const [responseType, setResponseType] = useState<ResponseType>('apontar-mostrar');
  const [promptLevel, setPromptLevel] = useState<PromptLevel>('independente');
  const [echoOfAdult, setEchoOfAdult] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRegister = () => {
    onLogEpisode({
      responseType,
      promptLevel,
      echoOfAdult,
    });

    setFeedback('Registrado com sucesso!');
    setTimeout(() => setFeedback(null), 1500);
  };

  return (
    <div className="episode-quick-log-bar">
      <div className="quick-log-title">
        <span className="font-semibold text-slate-800 text-sm">Registro Clínico ESDM:</span>
        <span className="text-xs text-slate-500">Pág {currentPage} • {currentAnimal.toUpperCase()}</span>
      </div>

      {/* Response Type Selector */}
      <div className="log-field-group">
        <span className="log-label">Comportamento:</span>
        <div className="log-buttons-row">
          <button
            type="button"
            className={`log-chip ${responseType === 'apontar-mostrar' ? 'chip-active' : ''}`}
            onClick={() => setResponseType('apontar-mostrar')}
            title="Apontar protodeclarativo: compartilhar interesse visual"
          >
            Apontar (Mostrar)
          </button>
          <button
            type="button"
            className={`log-chip ${responseType === 'apontar-pedir' ? 'chip-active' : ''}`}
            onClick={() => setResponseType('apontar-pedir')}
            title="Apontar protoimperativo: pedir para abrir a aba"
          >
            Apontar (Pedir)
          </button>
          <button
            type="button"
            className={`log-chip ${responseType === 'seguir-apontar' ? 'chip-active' : ''}`}
            onClick={() => setResponseType('seguir-apontar')}
            title="Seguir o apontar do adulto ou da mão virtual"
          >
            Seguir Apontar
          </button>
          <button
            type="button"
            className={`log-chip ${responseType === 'onomatopeia' ? 'chip-active' : ''}`}
            onClick={() => setResponseType('onomatopeia')}
            title="Produzir som do animal (ex: Muuu, Au-au)"
          >
            Onomatopeia
          </button>
          <button
            type="button"
            className={`log-chip ${responseType === 'palavra' ? 'chip-active' : ''}`}
            onClick={() => setResponseType('palavra')}
            title="Nomear o animal (ex: vaca, cachorro)"
          >
            Palavra
          </button>
        </div>
      </div>

      {/* Prompt Level */}
      <div className="log-field-group">
        <span className="log-label">Nível de Ajuda:</span>
        <div className="log-buttons-row">
          <button
            type="button"
            className={`log-chip ${promptLevel === 'independente' ? 'chip-active' : ''}`}
            onClick={() => setPromptLevel('independente')}
          >
            Independente
          </button>
          <button
            type="button"
            className={`log-chip ${promptLevel === 'parcial' ? 'chip-active' : ''}`}
            onClick={() => setPromptLevel('parcial')}
          >
            Parcial (Gesto/Modelagem)
          </button>
          <button
            type="button"
            className={`log-chip ${promptLevel === 'total' ? 'chip-active' : ''}`}
            onClick={() => setPromptLevel('total')}
          >
            Total (Física)
          </button>
        </div>
      </div>

      {/* Echo of Adult Checkbox */}
      <label className="echo-checkbox-container">
        <input
          type="checkbox"
          checked={echoOfAdult}
          onChange={(e) => setEchoOfAdult(e.target.checked)}
        />
        <span className="text-xs text-slate-700 font-medium">Eco do Adulto (Imitação Imediata)</span>
      </label>

      {/* Submit Button */}
      <button
        type="button"
        className="log-submit-btn"
        onClick={handleRegister}
        title="Registrar episódio na base de dados do Denver"
      >
        <PlusCircle className="w-4 h-4 mr-1 inline" />
        <span>Registrar ({totalLogged})</span>
      </button>

      {feedback && (
        <span className="log-feedback-toast">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-1" />
          {feedback}
        </span>
      )}
    </div>
  );
};
