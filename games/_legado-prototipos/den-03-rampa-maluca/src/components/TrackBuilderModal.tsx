import React, { useState } from 'react';
import { RampTrackConfigSchema, DEFAULT_TRACKS } from '../schemas/trackSchema';
import type { RampTrackConfig } from '../types/ramp';
import { X, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface TrackBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: RampTrackConfig;
  onApplyTrack: (track: RampTrackConfig) => void;
}

export const TrackBuilderModal: React.FC<TrackBuilderModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  onApplyTrack,
}) => {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(currentTrack, null, 2));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const validation = RampTrackConfigSchema.safeParse(parsed);
      if (!validation.success) {
        setErrorMsg(validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', '));
        return;
      }
      setErrorMsg(null);
      soundManager.playClick();
      onApplyTrack(validation.data);
      onClose();
    } catch (e) {
      setErrorMsg(`Erro de sintaxe JSON: ${(e as Error).message}`);
    }
  };

  const handleSelectPreset = (preset: RampTrackConfig) => {
    setJsonText(JSON.stringify(preset, null, 2));
    setErrorMsg(null);
    soundManager.playClick();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-window">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <h3 className="modal-title">TrackBuilder (Editor Clínico de Pistas em JSON)</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Presets de Pistas Clínicas:
            </label>
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_TRACKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="quick-btn"
                  onClick={() => handleSelectPreset(t)}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              JSON da Pista (Validado por Zod):
            </label>
            <textarea
              className="w-full h-48 font-mono text-sm p-3 bg-slate-900 text-emerald-400 rounded-md border border-slate-700 outline-none"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={8}
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-md text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="export-btn flex items-center gap-1"
              onClick={handleApply}
            >
              <Check className="w-4 h-4" />
              Validar e Aplicar Pista
            </button>
            <button
              type="button"
              className="quick-btn flex items-center gap-1"
              onClick={() => handleSelectPreset(DEFAULT_TRACKS[0])}
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar Padrão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
