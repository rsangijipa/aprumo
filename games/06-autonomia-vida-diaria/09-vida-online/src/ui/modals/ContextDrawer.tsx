import React from 'react';
import { X, Shield, Eye, Flame, HeartHandshake, BookOpen, AlertCircle } from 'lucide-react';
import { useNarrativeStore } from '../../narrative/engine/narrativeStore';
import { CHARACTERS } from '../../narrative/content/characters';
import { CharacterAvatar } from '../../assets/svg/Avatars';
import { EPISODES } from '../../narrative/content/episodes';

export const ContextDrawer: React.FC = () => {
  const { setModal, indicators, knownFacts, currentEpisodeId, blockedContacts } = useNarrativeStore();
  const currentEp = EPISODES.find((e) => e.id === currentEpisodeId);
  const partner = currentEp ? CHARACTERS[currentEp.chatPartnerId] : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="context-drawer-title"
        className="w-full max-w-sm h-full bg-[var(--bg-surface-elevated)] border-l border-[var(--border-subtle)] shadow-2xl p-6 text-[var(--text-primary)] flex flex-col justify-between overflow-y-auto"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-[var(--primitive-color-azul-400)]" />
              <h2 id="context-drawer-title" className="text-base font-bold">Contexto & Indicadores</h2>
            </div>
            <button
              onClick={() => setModal(null)}
              aria-label="Fechar"
              className="p-1.5 rounded-full hover:bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Dossier do Interlocutor Atual */}
          {partner && (
            <div className="mt-4 p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <CharacterAvatar id={partner.avatarId} size={42} />
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{partner.name}</h3>
                  <span className="text-xs text-[var(--text-muted)]">{partner.handle}</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2.5 leading-relaxed">
                {partner.bio}
              </p>
              {blockedContacts.includes(partner.id) && (
                <div className="mt-2.5 px-2.5 py-1 rounded bg-[var(--primitive-color-coral-glow)] text-[var(--primitive-color-coral-400)] text-[11px] flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  <span>Este contato está bloqueado no seu Nexo.</span>
                </div>
              )}
            </div>
          )}

          {/* 4 Indicadores Neutros */}
          <div className="mt-5">
            <h3 className="text-xs uppercase font-semibold text-[var(--text-muted)] tracking-wider mb-3">
              Indicadores da sua Sessão
            </h3>
            
            <div className="space-y-3">
              {/* Privacidade */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-[var(--primitive-color-turquesa-400)] font-medium">
                    <Shield size={14} /> Privacidade
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{indicators.privacidade}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden">
                  <div 
                    className="h-full bg-[var(--primitive-color-turquesa-500)] transition-all duration-500 rounded-full" 
                    style={{ width: `${indicators.privacidade}%` }}
                  />
                </div>
              </div>

              {/* Clareza */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-[var(--primitive-color-azul-400)] font-medium">
                    <Eye size={14} /> Clareza
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{indicators.clareza}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden">
                  <div 
                    className="h-full bg-[var(--primitive-color-azul-500)] transition-all duration-500 rounded-full" 
                    style={{ width: `${indicators.clareza}%` }}
                  />
                </div>
              </div>

              {/* Limites */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-[var(--primitive-color-coral-400)] font-medium">
                    <Flame size={14} /> Limites
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{indicators.limites}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden">
                  <div 
                    className="h-full bg-[var(--primitive-color-coral-500)] transition-all duration-500 rounded-full" 
                    style={{ width: `${indicators.limites}%` }}
                  />
                </div>
              </div>

              {/* Confiança */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-[var(--primitive-color-lilas-400)] font-medium">
                    <HeartHandshake size={14} /> Confiança
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{indicators.confianca}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden">
                  <div 
                    className="h-full bg-[var(--primitive-color-lilas-500)] transition-all duration-500 rounded-full" 
                    style={{ width: `${indicators.confianca}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fatos Conhecidos */}
          <div className="mt-5">
            <h3 className="text-xs uppercase font-semibold text-[var(--text-muted)] tracking-wider mb-2">
              Fatos Registrados ({knownFacts.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {knownFacts.map((fact, index) => (
                <div key={index} className="p-2 rounded-lg bg-[var(--bg-surface-subtle)] text-[11px] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  • {fact}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-subtle)] mt-4">
          <button
            onClick={() => setModal('pensar_antes')}
            className="w-full py-2 px-3 rounded-xl bg-[var(--bg-surface-subtle)] hover:bg-[var(--primitive-color-azul-glow)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-medium transition-colors"
          >
            Abrir Checklist "Pensar Antes"
          </button>
        </div>
      </div>
    </div>
  );
};
