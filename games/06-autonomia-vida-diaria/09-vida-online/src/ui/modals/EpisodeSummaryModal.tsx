import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw, ArrowRight, Shield, Eye, Flame, HeartHandshake, Compass } from 'lucide-react';
import { useNarrativeStore } from '../../narrative/engine/narrativeStore';
import { EPISODES } from '../../narrative/content/episodes';

export const EpisodeSummaryModal: React.FC = () => {
  const { currentEpisodeId, setModal, startEpisode, indicators } = useNarrativeStore();
  const currentEp = EPISODES.find((e) => e.id === currentEpisodeId);

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#536DFE', '#45B5A4', '#8B75D7', '#E16C68']
      });
    } catch (e) {
      // Ignora caso confetti não carregue
    }
  }, []);

  if (!currentEp) return null;

  const currentIdx = EPISODES.findIndex((e) => e.id === currentEpisodeId);
  const nextEpisode = currentIdx < EPISODES.length - 1 ? EPISODES[currentIdx + 1] : null;

  const handleNext = () => {
    if (nextEpisode) {
      startEpisode(nextEpisode.id);
    } else {
      setModal(null);
    }
  };

  const handleReplay = () => {
    startEpisode(currentEp.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-title"
        className="w-full max-w-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl p-6 sm:p-8 text-[var(--text-primary)] max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primitive-color-turquesa-glow)] text-[var(--primitive-color-turquesa-400)] mb-3">
            <CheckCircle2 size={32} />
          </div>
          <span className="block text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold">
            Capítulo {currentEp.number} Concluído
          </span>
          <h2 id="summary-title" className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
            {currentEp.title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">{currentEp.subtitle}</p>
        </div>

        {/* O que Aconteceu / Takeaway */}
        <div className="mt-6 p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[var(--primitive-color-azul-400)]">
            <Compass size={16} />
            <span>Reflexão do Episódio</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
            {currentEp.summary.takeaway}
          </p>
        </div>

        {/* 4 Indicadores Atuais */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-center">
            <Shield size={18} className="mx-auto text-[var(--primitive-color-turquesa-400)] mb-1" />
            <span className="block text-[11px] text-[var(--text-muted)]">Privacidade</span>
            <span className="font-bold text-sm text-[var(--text-primary)]">{indicators.privacidade}%</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-center">
            <Eye size={18} className="mx-auto text-[var(--primitive-color-azul-400)] mb-1" />
            <span className="block text-[11px] text-[var(--text-muted)]">Clareza</span>
            <span className="font-bold text-sm text-[var(--text-primary)]">{indicators.clareza}%</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-center">
            <Flame size={18} className="mx-auto text-[var(--primitive-color-coral-400)] mb-1" />
            <span className="block text-[11px] text-[var(--text-muted)]">Limites</span>
            <span className="font-bold text-sm text-[var(--text-primary)]">{indicators.limites}%</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-center">
            <HeartHandshake size={18} className="mx-auto text-[var(--primitive-color-lilas-400)] mb-1" />
            <span className="block text-[11px] text-[var(--text-muted)]">Confiança</span>
            <span className="font-bold text-sm text-[var(--text-primary)]">{indicators.confianca}%</span>
          </div>
        </div>

        {/* Caminhos Alternativos Possíveis */}
        <div className="mt-5">
          <h3 className="text-xs uppercase font-semibold text-[var(--text-muted)] tracking-wider mb-2">
            Perspectivas & Caminhos Alternativos
          </h3>
          <div className="space-y-2">
            {currentEp.summary.alternativeReflections.map((ref, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed">
                💡 {ref}
              </div>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReplay}
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw size={16} />
            Refazer Episódio com Outras Escolhas
          </button>

          {nextEpisode ? (
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-4 rounded-xl bg-[var(--primitive-color-azul-500)] hover:bg-[var(--primitive-color-azul-600)] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[var(--primitive-color-azul-glow)] transition-all"
            >
              <span>Capítulo {nextEpisode.number}: {nextEpisode.title}</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setModal(null)}
              className="flex-1 py-3 px-4 rounded-xl bg-[var(--primitive-color-turquesa-500)] hover:bg-[var(--primitive-color-turquesa-600)] text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              Voltar ao Nexo OS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
