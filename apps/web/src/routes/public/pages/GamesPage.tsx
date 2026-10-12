import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { FeatureCard, PublicPageLayout, Section } from '../PublicNav';
import { GAMES } from '../../../game-host/registry';
import { GameIllustration } from '../../../components/GameIllustration';
import {
  GAME_CATEGORIES,
  GAME_TO_CATEGORY,
  formatAgeRange,
  type GameCategoryId,
} from '../../../data/gameCategories';

export default function GamesPage() {
  const [activeCategory, setActiveCategory] = useState<GameCategoryId>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState<'todos' | 'ABA' | 'Denver'>('todos');

  // All 34 games loaded dynamically from protocol registry
  const allGames = useMemo(() => {
    return Object.values(GAMES).map((entry) => {
      const m = entry.manifest;
      const categoryId = GAME_TO_CATEGORY[m.appId] ?? 'cognicao-pareamento';
      const categoryMeta = GAME_CATEGORIES[categoryId];
      const hasAba = m.clinical.models.ABA !== 'not-indicated';
      const hasDenver = m.clinical.models.DENVER !== 'not-indicated';

      return {
        id: m.appId,
        name: m.name,
        summary: m.summary,
        categoryId,
        categoryMeta,
        repertoires: m.clinical.repertoires,
        age: formatAgeRange(m.clinical.ageRangeMonths),
        hasAba,
        hasDenver,
        modelsLabel: [hasAba ? 'ABA' : null, hasDenver ? 'Denver' : null].filter(Boolean).join(' · '),
        manifest: m,
      };
    });
  }, []);

  // Filtered games
  const filteredGames = useMemo(() => {
    return allGames.filter((g) => {
      if (activeCategory !== 'todos' && g.categoryId !== activeCategory) {
        return false;
      }
      if (modelFilter === 'ABA' && !g.hasAba) {
        return false;
      }
      if (modelFilter === 'Denver' && !g.hasDenver) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = g.name.toLowerCase().includes(q);
        const matchesSummary = g.summary.toLowerCase().includes(q);
        const matchesCat = g.categoryMeta.label.toLowerCase().includes(q);
        if (!matchesName && !matchesSummary && !matchesCat) return false;
      }
      return true;
    });
  }, [allGames, activeCategory, modelFilter, searchQuery]);

  return (
    <PublicPageLayout
      eyebrow="Catálogo Clínico"
      title={<>Jogos com propósito clínico e <em>respeito sensorial</em></>}
      lead="34 jogos estruturados e categorizados para ABA, Denver e neurodesenvolvimento. Cada jogo possui visual exclusivo, acessibilidade sensorial e telemetria padronizada."
      ctaText="Experimentar na demonstração"
      secondaryCtaText="Recursos terapêuticos"
      secondaryCtaHref="/recursos-terapeuticos"
    >
      <Section sunken eyebrow="Catálogo Geral" title={`${allGames.length} jogos categorizados por domínio de desenvolvimento`}>
        {/* Barra de Filtros & Categorias */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {/* Categorias Tabs */}
          <div
            role="tablist"
            aria-label="Filtrar jogos por categoria"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              borderBottom: '1px solid var(--ap-border, #e5e7eb)',
              paddingBottom: '0.75rem',
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'todos'}
              onClick={() => setActiveCategory('todos')}
              className={`ap-btn ap-btn--sm ${activeCategory === 'todos' ? 'ap-btn--primary' : 'ap-btn--ghost'}`}
              style={{ borderRadius: '9999px', minHeight: '38px', padding: '0 1rem' }}
            >
              Todos ({allGames.length})
            </button>
            {Object.values(GAME_CATEGORIES).map((cat) => {
              const count = allGames.filter((g) => g.categoryId === cat.id).length;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`ap-btn ap-btn--sm ${isSelected ? 'ap-btn--primary' : 'ap-btn--ghost'}`}
                  style={{
                    borderRadius: '9999px',
                    minHeight: '38px',
                    padding: '0 1rem',
                    gap: '0.35rem',
                    borderColor: isSelected ? 'transparent' : 'var(--ap-border)',
                  }}
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      opacity: 0.85,
                      background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--ap-surface-sunken, #f3f4f6)',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Busca e Filtro de Modelo Clínico */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 300px' }}>
              <label htmlFor="search-games" className="ap-visually-hidden">
                Buscar jogos por nome ou habilidade
              </label>
              <input
                id="search-games"
                type="search"
                placeholder="Buscar por nome, habilidade ou objetivo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--ap-border, #d1d5db)',
                  background: 'var(--ap-surface, #ffffff)',
                  color: 'var(--ap-text)',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--ap-text-muted)' }}>Modelo:</span>
              {(['todos', 'ABA', 'Denver'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`ap-btn ap-btn--sm ${modelFilter === m ? 'ap-btn--secondary' : 'ap-btn--ghost'}`}
                  onClick={() => setModelFilter(m)}
                  style={{ minHeight: '34px', padding: '0 0.75rem', borderRadius: '8px' }}
                >
                  {m === 'todos' ? 'Todos' : m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live status para leitor de tela */}
        <p className="ap-visually-hidden" aria-live="polite">
          Mostrando {filteredGames.length} jogos disponíveis
        </p>

        {/* Grid de Jogos */}
        {filteredGames.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              background: 'var(--ap-surface)',
              borderRadius: '16px',
              border: '1px dashed var(--ap-border)',
            }}
          >
            <p style={{ fontSize: '1.1rem', color: 'var(--ap-text-muted)', margin: '0 0 1rem' }}>
              Nenhum jogo encontrado com os filtros selecionados.
            </p>
            <button
              type="button"
              className="ap-btn ap-btn--secondary"
              onClick={() => {
                setActiveCategory('todos');
                setModelFilter('todos');
                setSearchQuery('');
              }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <ul className="lp-grid lp-unlist">
            {filteredGames.map((game) => (
              <li key={game.id} id={game.id}>
                <article className="ap-game-card" style={{ height: '100%' }}>
                  <div className="ap-game-card__art" aria-hidden="true">
                    <GameIllustration appId={game.id} name={game.name} interactive />
                  </div>
                  <div className="ap-game-card__body">
                    <div className="lp-game-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                      <span
                        className="ap-badge"
                        style={{
                          background: `${game.categoryMeta.color}15`,
                          color: game.categoryMeta.color,
                          borderColor: `${game.categoryMeta.color}40`,
                        }}
                      >
                        {game.categoryMeta.icon} {game.categoryMeta.label}
                      </span>
                      {game.hasAba && (
                        <span className="ap-badge ap-badge--aba">ABA</span>
                      )}
                      {game.hasDenver && (
                        <span className="ap-badge ap-badge--denver">Denver</span>
                      )}
                      <span className="ap-xs ap-muted" style={{ marginLeft: 'auto' }}>{game.age}</span>
                    </div>

                    <h3 className="ap-game-card__title lp-game-title" style={{ marginTop: '0.35rem' }}>
                      {game.name}
                    </h3>
                    <p className="ap-game-card__summary lp-game-summary">
                      {game.summary}
                    </p>

                    <div className="ap-game-card__actions" style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                      <Link
                        to="/demonstracao"
                        className="ap-btn ap-btn--sm ap-btn--secondary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        aria-label={`Experimentar o jogo ${game.name} na demonstração clínica`}
                      >
                        Experimentar jogo
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        center
        eyebrow="Runtime de jogos"
        title="Nenhum jogo é uma caixa-preta"
        lead="A cada tentativa, o runtime registra tempo de reação, nível de dica, posição do toque e autocorreções com conformidade clínica."
      >
        <div className="lp-grid">
          <FeatureCard title="Isolamento e segurança">
            Cada jogo roda em um sandbox isolado, sem acesso a dados cadastrais do paciente. A comunicação acontece
            apenas por mensagens criptografadas e validadas pelo protocolo @aprumo/protocol.
          </FeatureCard>
          <FeatureCard title="Adaptação sensorial">
            O profissional define animações completas ou estáticas, som normal ou silencioso e alvos de toque
            ampliados para quem tem dificuldade motora fina.
          </FeatureCard>
          <FeatureCard title="Carregamento sob demanda">
            Módulos pesados e motores gráficos só são baixados quando a atividade começa, mantendo a navegação
            ágil e acessível até em conexões escolares lentas.
          </FeatureCard>
        </div>
      </Section>
    </PublicPageLayout>
  );
}
