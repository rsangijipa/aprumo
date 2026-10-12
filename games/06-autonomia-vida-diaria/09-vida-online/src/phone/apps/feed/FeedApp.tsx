import React, { useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Share2, AlertCircle, Bookmark } from 'lucide-react';
import { useNarrativeStore } from '../../../narrative/engine/narrativeStore';
import { CHARACTERS } from '../../../narrative/content/characters';
import { CharacterAvatar } from '../../../assets/svg/Avatars';

export const FeedApp: React.FC = () => {
  const { closeApp, setModal } = useNarrativeStore();
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const POSTS = [
    {
      id: 'feed_1',
      authorId: 'maya',
      caption: 'Organizando a feira com a melhor equipe! Nem acredito que deu tudo certo 💜 #FeiraDeCiencias #Turma9B',
      likes: 124,
      comments: 18,
      time: 'Há 1 hora',
      mediaText: '📸 Foto em grupo da turma reunida no pátio com cartazes e sorrisos.'
    },
    {
      id: 'feed_2',
      authorId: 'sam',
      caption: 'Processo do desenho do estande! Muito feliz com o carinho que vocês mandaram no privado ✨🎨',
      likes: 89,
      comments: 12,
      time: 'Há 3 horas',
      mediaText: '🎨 Ilustração digital detalhada com paleta turquesa e lilás.'
    },
    {
      id: 'feed_3',
      authorId: 'cris',
      caption: 'Depois de 10 partidas de Galaxy Rivals, squad intacto e conta protegida sem atalhos falsos 🛡️',
      likes: 55,
      comments: 8,
      time: 'Ontem',
      mediaText: '🎮 Print de vitória em equipe no PlayHub.'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-nexo-screen)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="px-4 py-3 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={closeApp}
            aria-label="Voltar"
            className="p-1.5 -ml-1.5 rounded-full hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-[var(--text-primary)]">Feed Mural</h1>
            <span className="text-[10px] text-[var(--text-muted)]">Linha do tempo dos amigos</span>
          </div>
        </div>

        <button
          onClick={() => setModal('minigame_print')}
          className="text-xs px-2.5 py-1 rounded-lg bg-[var(--primitive-color-turquesa-glow)] text-[var(--primitive-color-turquesa-400)] font-medium flex items-center gap-1"
        >
          <span>Auditar Prints</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {POSTS.map((post) => {
          const author = CHARACTERS[post.authorId];
          const isLiked = liked[post.id];

          return (
            <article
              key={post.id}
              className="p-4 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3 shadow-sm"
            >
              {/* Header do Autor */}
              <div className="flex items-center gap-2.5">
                {author && <CharacterAvatar id={author.avatarId} size={36} />}
                <div>
                  <span className="text-xs font-bold block">{author?.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{author?.handle} • {post.time}</span>
                </div>
              </div>

              {/* Mídia / Card Fictício */}
              <div className="p-6 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)] italic">
                {post.mediaText}
              </div>

              {/* Legenda */}
              <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                {post.caption}
              </p>

              {/* Interações */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1 transition-colors ${
                      isLiked ? 'text-[var(--primitive-color-coral-400)] font-bold' : 'hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{post.likes + (isLiked ? 1 : 0)}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <MessageCircle size={16} />
                    <span>{post.comments}</span>
                  </div>
                </div>

                <button
                  onClick={() => setModal('pensar_antes')}
                  title="Guardar com moderação"
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  <Bookmark size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </main>
    </div>
  );
};
