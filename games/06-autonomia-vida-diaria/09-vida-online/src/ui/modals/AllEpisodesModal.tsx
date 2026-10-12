import React from 'react';
import { X, CheckCircle2, Play, Lock, Sparkles } from 'lucide-react';
import { useNarrativeStore } from '../../narrative/engine/narrativeStore';
import { EPISODES } from '../../narrative/content/episodes';

export const AllEpisodesModal: React.FC = () => {
  const { setModal, startEpisode, currentEpisodeId, completedEpisodeIds } = useNarrativeStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="episodes-map-title"
        className="w-full max-w-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl p-6 sm:p-8 text-[var(--text-primary)] max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-[var(--primitive-color-azul-400)]" />
              <h2 id="episodes-map-title" className="text-lg font-bold text-[var(--text-primary)]">Mapa dos 12 Episódios</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {completedEpisodeIds.length} de 12 capítulos concluídos no Nexo OS
            </p>
          </div>
          <button
            onClick={() => setModal(null)}
            aria-label="Fechar"
            className="p-2 rounded-full hover:bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EPISODES.map((ep) => {
            const isCompleted = completedEpisodeIds.includes(ep.id);
            const isCurrent = ep.id === currentEpisodeId;

            return (
              <div
                key={ep.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[var(--primitive-color-azul-glow)] border-[var(--primitive-color-azul-500)]'
                    : 'bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Capítulo {ep.number} • {ep.targetApp.toUpperCase()}
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--primitive-color-turquesa-400)]">
                        <CheckCircle2 size={14} /> Concluído
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{ep.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                    {ep.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)]">{ep.theme}</span>
                  <button
                    onClick={() => startEpisode(ep.id)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isCurrent
                        ? 'bg-[var(--primitive-color-azul-500)] text-white'
                        : 'bg-[var(--bg-surface-elevated)] hover:bg-[var(--primitive-color-azul-500)] hover:text-white text-[var(--text-primary)]'
                    }`}
                  >
                    <Play size={12} />
                    {isCurrent ? 'Continuar' : isCompleted ? 'Rejogar' : 'Jogar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
