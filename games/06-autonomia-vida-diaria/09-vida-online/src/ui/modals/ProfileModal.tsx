import React from 'react';
import { X, ShieldAlert, UserX, CheckCircle2 } from 'lucide-react';
import { useNarrativeStore } from '../../narrative/engine/narrativeStore';
import { CHARACTERS } from '../../narrative/content/characters';
import { CharacterAvatar } from '../../assets/svg/Avatars';

export const ProfileModal: React.FC = () => {
  const { selectedProfileId, setModal, blockContact, reportContact, blockedContacts, reportedContacts } = useNarrativeStore();
  const character = selectedProfileId ? CHARACTERS[selectedProfileId] : null;

  if (!character) return null;

  const isBlocked = blockedContacts.includes(character.id);
  const isReported = reportedContacts.includes(character.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-name"
        className="w-full max-w-sm bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 text-[var(--text-primary)] relative"
      >
        <button
          onClick={() => setModal(null)}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <CharacterAvatar id={character.avatarId} size={72} />
          
          <div className="flex items-center gap-1.5 mt-3">
            <h2 id="profile-name" className="text-base font-bold text-[var(--text-primary)]">{character.name}</h2>
            {character.verified && (
              <CheckCircle2 size={16} className="text-[var(--primitive-color-azul-400)]" />
            )}
          </div>
          
          <span className="text-xs text-[var(--text-muted)]">{character.handle}</span>
          
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--bg-surface-subtle)] text-[var(--primitive-color-turquesa-400)] border border-[var(--border-subtle)]">
            {character.status}
          </div>

          <p className="mt-4 text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-surface-subtle)] p-3 rounded-xl border border-[var(--border-subtle)] w-full text-left">
            {character.bio}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <button
            onClick={() => blockContact(character.id)}
            disabled={character.role === 'player' || character.role === 'moderator'}
            className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors border ${
              isBlocked
                ? 'bg-[var(--primitive-color-coral-glow)] text-[var(--primitive-color-coral-400)] border-[var(--primitive-color-coral-500)]/40'
                : 'bg-[var(--bg-surface-subtle)] hover:bg-[var(--primitive-color-coral-glow)] text-[var(--text-secondary)] hover:text-[var(--primitive-color-coral-400)] border-[var(--border-subtle)]'
            }`}
          >
            <UserX size={16} />
            {isBlocked ? 'Contato Bloqueado no Nexo' : 'Bloquear este Contato'}
          </button>

          <button
            onClick={() => reportContact(character.id)}
            disabled={character.role === 'player' || character.role === 'moderator'}
            className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors border ${
              isReported
                ? 'bg-[var(--primitive-color-azul-glow)] text-[var(--primitive-color-azul-400)] border-[var(--primitive-color-azul-500)]/40'
                : 'bg-[var(--bg-surface-subtle)] hover:bg-[var(--primitive-color-azul-glow)] text-[var(--text-secondary)] hover:text-[var(--primitive-color-azul-400)] border-[var(--border-subtle)]'
            }`}
          >
            <ShieldAlert size={16} />
            {isReported ? 'Perfil Denunciado à Moderação' : 'Denunciar Comportamento'}
          </button>
        </div>
      </div>
    </div>
  );
};
