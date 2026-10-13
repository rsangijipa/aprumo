import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, ThumbsUp, Sparkles } from 'lucide-react';
import { useNarrativeStore } from '../../../narrative/engine/narrativeStore';
import { CHARACTERS } from '../../../narrative/content/characters';
import { CharacterAvatar } from '../../../assets/svg/Avatars';

export const LoopApp: React.FC = () => {
  const { closeApp, setModal } = useNarrativeStore();
  const [upvoted, setUpvoted] = useState<Record<string, boolean>>({});

  const toggleUpvote = (id: string) => {
    setUpvoted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const POSTS = [
    {
      id: 'loop_1',
      authorId: 'bia',
      category: 'Projetos 9B',
      title: 'Brainstorm para a Feira de Ciências da Escola!',
      content: 'Galera, criamos um mural compartilhado no Nexo Docs. Quem puder contribuir com ideias para a bancada de sustentabilidade manda lá!',
      upvotes: 42,
      comments: 9,
      time: 'Há 2h'
    },
    {
      id: 'loop_2',
      authorId: 'sam',
      category: 'Arte Digital',
      title: 'Pacote de Stickers autorais para o Pulse liberado!',
      content: 'Fiz um set de 12 stickers geométricos inspirados no Nexo OS. Espero que curtam e usem nas conversas!',
      upvotes: 78,
      comments: 15,
      time: 'Há 4h'
    },
    {
      id: 'loop_3',
      authorId: 'leo',
      category: 'Games',
      title: 'Dicas para subir de patente no Galaxy Rivals sem cair em golpes',
      content: 'Aviso importante pra galera do 9º ano: NUNCA passem senha nem cliquem em links de terceiros prometendo gemas grátis. Jogar em squad sério é o único jeito!',
      upvotes: 64,
      comments: 11,
      time: 'Há 6h'
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
            <h1 className="text-sm font-bold text-[var(--text-primary)]">Loop Comunidade</h1>
            <span className="text-[10px] text-[var(--text-muted)]">Fórum escolar & temas da semana</span>
          </div>
        </div>

        <button
          onClick={() => setModal('pensar_antes')}
          className="text-xs px-2.5 py-1 rounded-lg bg-[var(--primitive-color-lilas-glow)] text-[var(--primitive-color-lilas-400)] font-medium"
        >
          Regras de Respeito
        </button>
      </header>

      {/* Feed do Loop */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3.5">
        <div className="p-3 rounded-2xl bg-[var(--primitive-color-lilas-glow)] border border-[var(--primitive-color-lilas-500)]/30 text-xs text-[var(--primitive-color-lilas-400)] flex items-center gap-2">
          <Sparkles size={16} className="shrink-0" />
          <span>O Loop é moderado pelos próprios estudantes com foco em apoio e criatividade.</span>
        </div>

        {POSTS.map((post) => {
          const author = CHARACTERS[post.authorId];
          const isLiked = upvoted[post.id];

          return (
            <article
              key={post.id}
              className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {author && <CharacterAvatar id={author.avatarId} size={32} />}
                  <div>
                    <span className="text-xs font-bold block">{author?.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{post.time} • {post.category}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-1">
                  {post.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {post.content}
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                <button
                  onClick={() => toggleUpvote(post.id)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    isLiked ? 'text-[var(--primitive-color-lilas-400)] font-bold' : 'hover:text-[var(--text-primary)]'
                  }`}
                >
                  <ThumbsUp size={14} />
                  <span>{post.upvotes + (isLiked ? 1 : 0)} Upvotes</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  <span>{post.comments} Comentários</span>
                </div>
              </div>
            </article>
          );
        })}
      </main>
    </div>
  );
};
