import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BookMarked, Sparkles, Check, HeartHandshake } from 'lucide-react';
import type { BookSessionMetrics } from '../types/book';

interface ClosingModalProps {
  metrics: BookSessionMetrics;
  onRestart: () => void;
  onClose: () => void;
}

export const ClosingModal: React.FC<ClosingModalProps> = ({
  metrics,
  onRestart,
  onClose,
}) => {
  useEffect(() => {
    // Gentle celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#4ade80', '#fbbf24', '#f43f5e'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="modal-window max-w-xl text-center">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
            <BookMarked className="w-8 h-8" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-1">
          O Livro Acabou! Tchau, Animais!
        </h3>
        <p className="text-slate-600 text-sm mb-5">
          Excelente rotina de leitura compartilhada e atenção conjunta.
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-left mb-5">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-xs text-amber-700 font-semibold block">Abas Reveladas</span>
            <span className="text-2xl font-bold text-amber-900">{metrics.flapsRevealed}</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-xs text-emerald-700 font-semibold block">Onomatopeias Imitadas</span>
            <span className="text-2xl font-bold text-emerald-900">{metrics.onomatopoeiasImitated}</span>
          </div>

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
            <span className="text-xs text-sky-700 font-semibold block">Apontar Protodeclarativo (Mostrar)</span>
            <span className="text-2xl font-bold text-sky-900">{metrics.pointingToShowCount}</span>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
            <span className="text-xs text-purple-700 font-semibold block">Seguir o Apontar</span>
            <span className="text-2xl font-bold text-purple-900">{metrics.followingPointerCount}</span>
          </div>
        </div>

        {/* Mandatory ESDM Physical Bridge */}
        <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl text-left mb-6 flex items-start gap-3">
          <HeartHandshake className="w-7 h-7 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
              <span>Ponte para o Recurso Físico (ESDM Obrigatória)</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h4>
            <p className="text-xs text-indigo-800 leading-relaxed">
              Agora feche o tablet e passe imediatamente para o <strong>livro cartonado físico real com abas</strong> ou para os <strong>bichinhos de brinquedo da fazenda</strong>. Mantenha as mesmas onomatopeias ("Muuu", "Au-au") e estimule a criança a apontar nas páginas de papel e nos bichos reais!
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
            onClick={onRestart}
          >
            Ler Outro Livro
          </button>
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition flex items-center gap-2"
            onClick={onClose}
          >
            <Check className="w-5 h-5" />
            <span>Concluir Sessão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
