import React from 'react';
import { X, ShieldAlert, Sparkles, Brain, Clock, Users } from 'lucide-react';
import { useNarrativeStore } from '../../narrative/engine/narrativeStore';

export const PensarAntesModal: React.FC = () => {
  const { setModal } = useNarrativeStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="pensar-antes-title"
        className="w-full max-w-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 text-[var(--text-primary)] relative"
      >
        <button
          onClick={() => setModal(null)}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] transition-colors focus:ring-2 focus:ring-[var(--border-focus)]"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[var(--primitive-color-azul-glow)] text-[var(--primitive-color-azul-400)]">
            <Brain size={24} />
          </div>
          <div>
            <h2 id="pensar-antes-title" className="text-lg font-bold text-[var(--text-primary)]">Pensar Antes de Agir</h2>
            <p className="text-xs text-[var(--text-muted)]">Checklist reflexivo do Nexo • Sem julgamento</p>
          </div>
        </div>

        <div className="space-y-3.5 my-5 text-sm">
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-start gap-3">
            <Users className="text-[var(--primitive-color-turquesa-400)] shrink-0 mt-0.5" size={18} />
            <div>
              <strong className="block text-xs uppercase tracking-wider text-[var(--primitive-color-turquesa-400)] font-semibold">Quem está pedindo?</strong>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                É um amigo próximo, colega de escola ou alguém que você conheceu apenas em jogos ou redes?
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-start gap-3">
            <ShieldAlert className="text-[var(--primitive-color-coral-400)] shrink-0 mt-0.5" size={18} />
            <div>
              <strong className="block text-xs uppercase tracking-wider text-[var(--primitive-color-coral-400)] font-semibold">O que está em jogo?</strong>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Estão pedindo fotos, senhas, códigos recebidos por SMS ou acesso à sua conta? Se algo vazar, como você se sentiria?
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-start gap-3">
            <Clock className="text-[var(--primitive-color-lilas-400)] shrink-0 mt-0.5" size={18} />
            <div>
              <strong className="block text-xs uppercase tracking-wider text-[var(--primitive-color-lilas-400)] font-semibold">Preciso responder no impulso?</strong>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Urgência exagerada ("responde agora!", "vai perder a vaga") costuma ser pressão para você não pensar. Respirar 2 minutos é seu direito.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--primitive-color-azul-glow)] border border-[var(--primitive-color-azul-500)]/30 text-xs text-[var(--primitive-color-azul-400)] flex items-center gap-2">
          <Sparkles size={16} className="shrink-0" />
          <span>Lembre-se: dizer "não" ou pedir tempo para pensar é sinal de maturidade, não de fraqueza.</span>
        </div>

        <button
          onClick={() => setModal(null)}
          className="w-full mt-5 py-2.5 px-4 rounded-xl bg-[var(--primitive-color-azul-500)] hover:bg-[var(--primitive-color-azul-600)] text-white font-medium text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primitive-color-azul-500)]"
        >
          Entendido, voltar à conversa
        </button>
      </div>
    </div>
  );
};
