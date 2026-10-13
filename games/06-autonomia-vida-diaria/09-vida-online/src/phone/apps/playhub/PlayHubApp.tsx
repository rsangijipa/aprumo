import React from 'react';
import { ArrowLeft, Play, ShieldAlert, Users, Trophy } from 'lucide-react';
import { useNarrativeStore } from '../../../narrative/engine/narrativeStore';

export const PlayHubApp: React.FC = () => {
  const { closeApp, setModal } = useNarrativeStore();

  const GAMES = [
    {
      id: 'galaxy_rivals',
      name: 'Galaxy Rivals Online',
      genre: 'MOBA / Squad 3v3',
      rating: '4.8 ★',
      status: 'Temporada 4 Aberta',
      tag: 'Mais Jogado',
      bannerColor: 'from-[#3d5afe] to-[#8b75d7]'
    },
    {
      id: 'pixel_craft',
      name: 'Pixel Craft Adventure',
      genre: 'Construção & Sandbox',
      rating: '4.9 ★',
      status: 'Servidor Escolar Ativo',
      tag: 'Coop Criativo',
      bannerColor: 'from-[#45b5a4] to-[#262e3b]'
    },
    {
      id: 'neon_velocity',
      name: 'Neon Velocity',
      genre: 'Corrida Cyberpunk',
      rating: '4.6 ★',
      status: 'Novo Passe de Pistas',
      tag: 'Competitivo',
      bannerColor: 'from-[#e16c68] to-[#765ec4]'
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
            <h1 className="text-sm font-bold text-[var(--text-primary)]">PlayHub Games</h1>
            <span className="text-[10px] text-[var(--text-muted)]">Plataforma de Jogos Online do Nexo</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--primitive-color-turquesa-glow)] text-[var(--primitive-color-turquesa-400)] text-xs font-semibold">
          <Trophy size={14} />
          <span>Elo Ouro</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Banner de Segurança do Jogador */}
        <div className="p-3.5 rounded-2xl bg-[var(--primitive-color-coral-glow)] border border-[var(--primitive-color-coral-500)]/30 text-xs text-[var(--primitive-color-coral-400)] flex items-start gap-2.5">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Regra de Ouro do PlayHub:</strong>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              Nunca compartilhe seus dados de login com outros jogadores, nem mesmo para "upar elo". O PlayHub nunca solicita senhas via chat.
            </p>
          </div>
        </div>

        {/* Lista de Jogos */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
            Seus Jogos Instalados
          </h2>

          {GAMES.map((game) => (
            <div
              key={game.id}
              className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3 relative overflow-hidden group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--bg-surface-subtle)] text-[var(--primitive-color-azul-400)] border border-[var(--border-subtle)]">
                      {game.tag}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{game.genre}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{game.name}</h3>
                  <span className="text-[11px] text-[var(--text-muted)]">{game.status}</span>
                </div>

                <button
                  onClick={() => setModal('pensar_antes')}
                  className="p-2.5 rounded-xl bg-[var(--primitive-color-azul-500)] hover:bg-[var(--primitive-color-azul-600)] text-white shadow transition-all group-hover:scale-105"
                  title="Abrir jogo"
                >
                  <Play size={16} fill="white" />
                </button>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Users size={12} /> 4 amigos da escola jogando
                </span>
                <span className="font-semibold text-[var(--primitive-color-turquesa-400)]">{game.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
