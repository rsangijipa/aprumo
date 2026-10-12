/**
 * Portal da família. Mostra só o que é compartilhado: progresso em linguagem acessível,
 * tarefas de casa, orientações e documentos finalizados. Nunca notas internas, comportamento
 * ou dados de outras crianças. O que a família registra é identificado como "relato do responsável".
 */
import { useState } from 'react';
import { Link } from 'react-router';
import { StimulusArt } from '@aprumo/stimuli';
import { Button, IconArrowRight, IconBook, IconChart, IconCheck, IconFile, IconHeart, IconHome, IconLogout, Logo } from '@aprumo/ui';
import { actions, db, formatAge, screenMinutesToday, summariesFor, useStore } from '../../data/store';
import type { Child, Guidance, HomeTask } from '../../data/types';
import { GAMES } from '../../game-host/registry';
import { GameIllustration } from '../../components/GameIllustration';
import {
  GAME_CATEGORIES,
  GAME_TO_CATEGORY,
  getCategoryOfGame,
  type GameCategoryId,
} from '../../data/gameCategories';
import './family.css';

const GUARDIAN_ID = 'gd-teo-mae';

const PLAIN_PHASE: Record<string, { label: string; tone: string; desc: string }> = {
  baseline: { label: 'Começando a observar', tone: 'neutral', desc: 'Verificando o que já sabe antes de iniciar' },
  acquisition: { label: 'Aprendendo', tone: 'learning', desc: 'Praticando novas habilidades com apoio da equipe' },
  maintenance: { label: 'Praticando para fixar', tone: 'done', desc: 'Habilidade aprendida, mantendo ativa e firme' },
  generalization: { label: 'Usando em outros lugares', tone: 'done', desc: 'Usando em casa, na escola e com outros' },
  mastered: { label: 'Conquistado com autonomia', tone: 'done', desc: 'Faz sozinho em qualquer momento do dia a dia' },
  review: { label: 'Equipe ajustando estratégias', tone: 'neutral', desc: 'Revisando a forma de ensinar para facilitar' },
  suspended: { label: 'Pausa temporária', tone: 'neutral', desc: 'Objetivo temporariamente em pausa pela equipe' },
};

const FAMILY_TIPS: Record<string, { tip: string; skill: string }> = {
  'lanche-do-urso': {
    tip: 'Brinque de oferecer comidinhas e água para o urso. Imitem juntos "hummm!" e dê um abraço carinhoso no brinquedo.',
    skill: 'Brincar simbólico e afeto',
  },
  'rampa-maluca': {
    tip: 'Diga "Preparar… apontar…" e faça uma pausa sorridente. Espere qualquer olhar, som ou gesto antes de soltar o carro comemorando.',
    skill: 'Iniciativa de comunicação e turnos',
  },
  'fazendinha-sonora': {
    tip: 'Brinque de adivinhar o bichinho antes de abrir a aba. Façam os sons dos animais juntos com expressões alegres.',
    skill: 'Atenção compartilhada e sons da fala',
  },
  'bolhas-magicas': {
    tip: 'Aponte para a bolha e celebre quando estourar dizendo "pop!" ou "estourou!". Deixe a criança liderar o ritmo.',
    skill: 'Coordenação óculo-manual e vocabulário',
  },
  'encontre-o-igual': {
    tip: 'Após a partida, procurem pares iguais na vida real (duas meias iguais, duas colheres iguais ou sapatos).',
    skill: 'Pareamento visual e foco atencional',
  },
  'encaixa-ai': {
    tip: 'Incentive a rotação e experimentação das peças com calma. Evite fazer por ela: apoie suavemente se ela pedir ajuda.',
    skill: 'Coordenação motora e raciocínio espacial',
  },
  'detetive-das-emocoes': {
    tip: 'Conversem sobre as carinhas dos personagens. Lembrem de momentos do dia: "Quando você comeu aquele bolo, ficou feliz assim!".',
    skill: 'Reconhecimento de emoções e diálogo',
  },
  'banda-do-tico': {
    tip: 'Batam palmas ou usem colheres de pau como baquetas para tocar no mesmo ritmo da música alegre.',
    skill: 'Ritmo, imitação musical e coordenação',
  },
  'torre-derruba': {
    tip: 'Empilhem bloquinhos ou almofadas e celebrem a hora de derrubar com "boom!". Isso ensina causa e efeito com diversão.',
    skill: 'Causa e efeito e alegria compartilhada',
  },
  'mercadinho-da-esquina': {
    tip: 'Na hora do lanche ou compras reais, peçam para a criança escolher ou pegar o item pelo nome e colocar na cestinha.',
    skill: 'Autonomia e vida cotidiana',
  },
  'minha-vez-sua-vez': {
    tip: 'Pratiquem a alternância dizendo com calma: "Agora é a minha vez… agora é a sua vez!". Elogie a paciência de esperar.',
    skill: 'Espera de turnos e cooperação social',
  },
  'organize-categoria': {
    tip: 'Na hora de arrumar os brinquedos, brinquem de separar carrinhos em uma caixa e bichinhos em outra.',
    skill: 'Classificação e organização mental',
  },
  'memoria-bichos': {
    tip: 'Virem cartas devagar e façam o som do animal que apareceu. Comemorem cada par encontrado.',
    skill: 'Memória visual e concentração',
  },
  'espelho-magico': {
    tip: 'Fiquem em frente a um espelho real e imitem caretas, piscadas ou palminhas juntos.',
    skill: 'Imitação motora e consciência corporal',
  },
  'pequeno-chef': {
    tip: 'Convide a criança para lavar uma fruta ou mexer uma massa leve na cozinha real, seguindo uma ordem simples.',
    skill: 'Sequência de passos e coordenação prática',
  },
  'historia-ordem': {
    tip: 'Contem uma historinha de 3 partes: "Acordou, escovou o dente, foi brincar". Peça para lembrar o que veio antes.',
    skill: 'Noção de tempo e narrativa',
  },
  'escape-room-kids': {
    tip: 'Brinque de caça ao tesouro em casa seguindo 2 pistas fáceis escondidas na sala.',
    skill: 'Resolução de problemas e cooperação',
  },
  'vida-online': {
    tip: 'Converse abertamente sobre o tempo saudável de tela e combinem juntos a hora da pausa.',
    skill: 'Cidadania digital e autocontrole',
  },
};

export default function FamilyPortal() {
  const guardian = db.guardians.find((g) => g.id === GUARDIAN_ID)!;
  const child = db.children.find((c) => c.id === guardian.childId)!;
  const c = db.cases.find((x) => x.childId === child.id)!;
  const st = useStore((s) => s);
  const targets = st.targets.filter((t) => t.caseId === c.id && t.phase !== 'suspended');
  const tasks = st.homeTasks.filter((t) => t.caseId === c.id && t.active);
  const guidance = st.guidance.filter((g) => g.caseId === c.id).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const docs = st.documents.filter((d) => d.caseId === c.id && d.sharedWithFamily && d.versions.some((v) => v.status === 'final'));
  const answered = st.socialValidity.some((v) => v.caseId === c.id && v.guardianId === guardian.id);
  const nextSessions = st.sessions.filter((s) => s.caseId === c.id).length;

  // Crianças sob responsabilidade deste adulto (hoje o cadastro liga um responsável a uma criança;
  // a lista já acomoda irmãos quando o vínculo for múltiplo).
  const myChildren = db.guardians
    .filter((g) => g.id === guardian.id || (g.name === guardian.name && g.relationship === guardian.relationship))
    .map((g) => st.children.find((x) => x.id === g.childId))
    .filter((x): x is Child => !!x);

  const [activeTab, setActiveTab] = useState<'inicio' | 'aprendendo' | 'casa' | 'jogos' | 'orient' | 'docs'>('inicio');
  const [gameCategoryFilter, setGameCategoryFilter] = useState<GameCategoryId>('todos');

  const scrollTo = (id: string, tab: 'inicio' | 'aprendendo' | 'casa' | 'jogos' | 'orient' | 'docs') => {
    setActiveTab(tab);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div className="fam">
      <header className="fam-top">
        <Logo href="/familia" />
        <span className="fam-demo">Demonstração · dados fictícios</span>
        <Link className="ap-btn ap-btn--ghost fam-exit" to="/"><IconLogout /> Sair</Link>
      </header>

      <main className="fam-main" id="conteudo">
        <section className="fam-hello">
          <span className="fam-avatar" style={{ background: `hsl(${child.hue} 34% 44%)` }} aria-hidden="true">{child.preferredName[0]}</span>
          <div>
            <h1 className="ap-display">Olá, {guardian.name.split(' ')[0]}</h1>
            <p>Acompanhe o que {child.preferredName} ({formatAge(child.birthDate)}) está aprendendo e como ajudar em casa.</p>
          </div>
        </section>

        <section className="fam-section" aria-labelledby="espaco-title">
          <h2 id="espaco-title" className="ap-visually-hidden">Espaço da criança</h2>
          <div className="fam-spaces">
            {myChildren.map((k) => <ChildSpaceCard key={k.id} child={k} />)}
          </div>
        </section>

        <section className="fam-section" id="aprendendo" aria-labelledby="aprendendo-title">
          <h2 id="aprendendo-title">O que {child.preferredName} está aprendendo ({targets.length})</h2>
          {targets.length === 0 && <p className="fam-empty">O plano ainda está sendo preparado pela equipe. Os objetivos aparecem aqui assim que forem definidos.</p>}
          <div className="fam-grid">
            {targets.map((t) => {
              const p = db.programOf(t);
              const last = summariesFor(st.facts, t.id).at(-1);
              const phase = PLAIN_PHASE[t.phase] ?? { label: t.phase, tone: 'neutral', desc: '' };
              return (
                <article key={t.id} className="fam-card">
                  <div className="fam-card__art"><StimulusArt art={t.art} label={t.name} /></div>
                  <div className="fam-card__body">
                    <span className={`fam-chip fam-chip--${phase.tone}`}>{phase.label}</span>
                    <strong>{plainProgram(p.repertoire, t.name)}</strong>
                    <p className="fam-hint">{phase.desc}</p>
                    {last && last.opportunities > 0 && (
                      <p>{last.probe ? 'Na última verificação' : 'Na última sessão'}, fez <b>sozinho {last.correctIndependent} de {last.opportunities}</b> vezes.</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <p className="fam-hint">“Sozinho” quer dizer sem nenhuma ajuda. Quando há ajuda, a equipe registra separado: é assim que sabemos o que já foi aprendido.</p>
        </section>

        <section className="fam-section" id="casa" aria-labelledby="casa-title">
          <h2 id="casa-title">Para fazer em casa</h2>
          <div className="ap-stack" style={{ gap: '1rem' }}>
            {tasks.length === 0 ? (
              <p className="fam-empty">Nenhuma tarefa para casa agora. Quando a equipe sugerir uma atividade, ela aparece aqui com o passo a passo.</p>
            ) : (
              tasks.map((t) => <HomeTaskCard key={t.id} task={t} guardianId={guardian.id} />)
            )}
          </div>
        </section>

        {/* Seção de Jogos e Atividades Recomendadas com Ilustrações e Dicas */}
        <section className="fam-section" id="jogos" aria-labelledby="jogos-title">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 id="jogos-title" style={{ margin: 0 }}>Jogos & Atividades Terapêuticas</h2>
              <p className="fam-hint" style={{ margin: '0.25rem 0 0' }}>
                Atividades com ilustrações dedicadas, objetivos clínicos e orientações para praticar com {child.preferredName} em casa.
              </p>
            </div>
          </div>

          {/* Filtro de Categorias */}
          <div
            role="tablist"
            aria-label="Filtrar atividades por categoria de desenvolvimento"
            style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={gameCategoryFilter === 'todos'}
              className="ap-btn ap-btn--sm"
              style={{
                borderRadius: '999px',
                background: gameCategoryFilter === 'todos' ? 'var(--ap-primary)' : 'var(--ap-surface)',
                color: gameCategoryFilter === 'todos' ? '#fff' : 'var(--ap-text)',
                borderColor: 'var(--ap-border)',
                minHeight: '34px',
              }}
              onClick={() => setGameCategoryFilter('todos')}
            >
              Todas ({Object.keys(GAMES).length})
            </button>
            {Object.values(GAME_CATEGORIES).map((cat) => {
              const count = Object.values(GAMES).filter((g) => GAME_TO_CATEGORY[g.manifest.appId] === cat.id).length;
              const isSelected = gameCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className="ap-btn ap-btn--sm"
                  style={{
                    borderRadius: '999px',
                    background: isSelected ? 'var(--ap-primary)' : 'var(--ap-surface)',
                    color: isSelected ? '#fff' : 'var(--ap-text)',
                    borderColor: 'var(--ap-border)',
                    minHeight: '34px',
                    gap: '0.25rem',
                  }}
                  onClick={() => setGameCategoryFilter(cat.id)}
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span style={{ opacity: 0.8, fontSize: '0.75rem' }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Grid de Atividades com Capa */}
          <div className="fam-game-grid">
            {Object.values(GAMES)
              .filter((g) => {
                const catId = GAME_TO_CATEGORY[g.manifest.appId] ?? 'cognicao-pareamento';
                return gameCategoryFilter === 'todos' || catId === gameCategoryFilter;
              })
              .map((g) => {
                const m = g.manifest;
                const cat = getCategoryOfGame(m.appId);
                const tipData = FAMILY_TIPS[m.appId];
                return (
                  <article key={m.appId} className="fam-game-card">
                    <div className="fam-game-card__art" aria-hidden="true">
                      <GameIllustration appId={m.appId} name={m.name} interactive />
                    </div>
                    <div className="fam-game-card__body">
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span
                          className="ap-badge"
                          style={{
                            background: `${cat.color}15`,
                            color: cat.color,
                            borderColor: `${cat.color}35`,
                            fontWeight: 600,
                            fontSize: '0.72rem',
                          }}
                        >
                          {cat.icon} {cat.label}
                        </span>
                        {tipData && (
                          <span className="ap-badge ap-badge--info" style={{ fontSize: '0.72rem' }}>
                            {tipData.skill}
                          </span>
                        )}
                      </div>
                      <h3 className="fam-game-card__title">{m.name}</h3>
                      <p className="fam-game-card__desc">{m.summary}</p>
                      {tipData && (
                        <div className="fam-game-card__tip">
                          <strong>💡 Como apoiar em casa:</strong>
                          <p style={{ margin: '0.25rem 0 0', lineHeight: 1.45 }}>{tipData.tip}</p>
                        </div>
                      )}
                      <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                        <Link
                          to={`/espaco/${child.id}`}
                          state={{ returnTo: '/familia' }}
                          className="ap-btn ap-btn--sm ap-btn--secondary"
                          style={{ width: '100%', justifyContent: 'center' }}
                          aria-label={`Abrir ${m.name} no espaço de ${child.preferredName}`}
                        >
                          Jogar com {child.preferredName}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>

        <div className="fam-two">
          <section className="fam-section" id="orient" aria-labelledby="orient-title">
            <h2 id="orient-title">Orientações da equipe ({guidance.length})</h2>
            <div className="ap-stack" style={{ gap: '1rem' }}>
              {guidance.length === 0 && <p className="fam-empty">Nenhuma orientação publicada ainda. A equipe envia dicas para o dia a dia por aqui.</p>}
              {guidance.map((g) => (
                <GuidanceCard key={g.id} g={g} guardianId={guardian.id} />
              ))}
            </div>
          </section>

          <section className="fam-section" id="docs" aria-labelledby="docs-title">
            <h2 id="docs-title">Documentos compartilhados</h2>
            {docs.length === 0 && <p className="fam-empty">Nenhum documento por aqui ainda. Quando a equipe finalizar um relatório para a família, ele aparece nesta lista.</p>}
            {docs.map((d) => {
              const v = [...d.versions].reverse().find((x) => x.status === 'final')!;
              return (
                <details key={d.id} className="fam-guidance">
                  <summary>
                    <span><IconFile style={{ width: 18, verticalAlign: '-3px' }} /> {d.title}</span>
                    <span className="fam-hint">{new Date(v.createdAt).toLocaleDateString('pt-BR')}</span>
                  </summary>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{v.analysis}</p>
                  <p className="fam-hint">Assinado por {db.professional(v.authorId)?.name} · {v.council}</p>
                </details>
              );
            })}
          </section>
        </div>

        <section className="fam-section" aria-labelledby="opiniao">
          <h2 id="opiniao">Sua opinião</h2>
          {answered ? (
            <p className="fam-thanks"><IconHeart /> Obrigado! Sua resposta ajuda a equipe a ajustar o plano.</p>
          ) : (
            <SocialValidityForm caseId={c.id} guardianId={guardian.id} />
          )}
        </section>

        <footer className="fam-foot">
          <p>{nextSessions} sessões registradas neste plano. Mensagens pelo portal não são lidas em tempo real: em caso de urgência, ligue para a clínica.</p>
        </footer>
      </main>

      {/* Navegação Inferior Móvel (Thumb Ergonomics) */}
      <nav className="fam-tabbar" aria-label="Navegação móvel da família">
        <button
          type="button"
          className="fam-tabbar-item"
          aria-current={activeTab === 'inicio' ? 'page' : undefined}
          onClick={() => scrollTo('conteudo', 'inicio')}
        >
          <IconHome />
          <span>Início</span>
        </button>
        <button
          type="button"
          className="fam-tabbar-item"
          aria-current={activeTab === 'aprendendo' ? 'page' : undefined}
          onClick={() => scrollTo('aprendendo', 'aprendendo')}
        >
          <IconChart />
          <span>Progresso</span>
        </button>
        <button
          type="button"
          className="fam-tabbar-item"
          aria-current={activeTab === 'casa' ? 'page' : undefined}
          onClick={() => scrollTo('casa', 'casa')}
        >
          <IconHeart />
          <span>Em Casa</span>
        </button>
        <button
          type="button"
          className="fam-tabbar-item"
          aria-current={activeTab === 'jogos' ? 'page' : undefined}
          onClick={() => scrollTo('jogos', 'jogos')}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M21.58 14.07l-2.02-6.06A4.5 4.5 0 0 0 15.3 5H8.7a4.5 4.5 0 0 0-4.26 3.01L2.42 14.07a3.5 3.5 0 0 0 2.22 4.41c1.28.43 2.67-.08 3.36-1.18L9.5 15h5l1.5 2.3c.69 1.1 2.08 1.61 3.36 1.18a3.5 3.5 0 0 0 2.22-4.41zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4.5 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm2-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
          </svg>
          <span>Jogos</span>
        </button>
        <button
          type="button"
          className="fam-tabbar-item"
          aria-current={activeTab === 'orient' ? 'page' : undefined}
          onClick={() => scrollTo('orient', 'orient')}
        >
          <IconBook />
          <span>Orientações</span>
        </button>
        <button
          type="button"
          className="fam-tabbar-item"
          aria-current={activeTab === 'docs' ? 'page' : undefined}
          onClick={() => scrollTo('docs', 'docs')}
        >
          <IconFile />
          <span>Documentos</span>
        </button>
      </nav>
    </div>
  );
}

/**
 * Entrada da criança no espaço dela. O adulto já está autenticado neste portal, então não há código
 * nem PIN: um toque abre /espaco/:childId. A saída do espaço é a pressão prolongada (useHoldPress)
 * e volta para cá (state.returnTo).
 */
function ChildSpaceCard({ child }: { child: Child }) {
  const st = useStore((s) => s);
  const c = st.cases.find((x) => x.childId === child.id && x.status === 'active');
  const policy = db.screenPolicy(child.birthDate);
  const name = child.preferredName;

  if (!c || !policy.childPortalAllowed) {
    return (
      <article className="fam-space fam-space--off">
        <span className="fam-avatar fam-avatar--sm" style={{ background: `hsl(${child.hue} 34% 44%)` }} aria-hidden="true">{name[0]}</span>
        <div>
          <h3>Espaço de {name}</h3>
          <p className="fam-hint">
            {!c
              ? 'O espaço abre quando a equipe ativar o plano de atendimento.'
              : 'Antes dos 2 anos não há espaço com tela para a criança: a plataforma é usada só pelo adulto (SBP, 2024).'}
          </p>
        </div>
      </article>
    );
  }

  const used = screenMinutesToday(st, c.id);
  const limit = policy.dailyLimitMinutes;
  const over = used >= limit;
  return (
    <Link className="fam-space" to={`/espaco/${child.id}`} state={{ returnTo: '/familia' }}>
      <span className="fam-avatar fam-avatar--sm" style={{ background: `hsl(${child.hue} 34% 44%)` }} aria-hidden="true">{name[0]}</span>
      <span className="fam-space__text">
        <strong>Abrir o espaço de {name}</strong>
        <span>
          {over ? `Limite de tela de hoje atingido (${limit} min). Os jogos ficam pausados até amanhã.` : `Tela hoje: ${used} de ${limit} min · fique por perto enquanto ${name} usa.`}
        </span>
        <span className="fam-space__exit">Para voltar a este portal, mantenha pressionado o botão de sair, no canto da tela.</span>
      </span>
      <IconArrowRight className="fam-space__go" aria-hidden="true" />
    </Link>
  );
}

function GuidanceCard({ g, guardianId }: { g: Guidance; guardianId: string }) {
  const read = g.readBy.includes(guardianId);
  const author = db.professional(g.authorId)?.name ?? 'Equipe Aprumo';

  return (
    <article className={`fam-guidance-card ${!read ? 'unread' : ''}`}>
      <div className="fam-guidance-card__head">
        <div>
          <h3>{g.title}</h3>
          <span className="fam-hint">Por {author} · {new Date(g.publishedAt).toLocaleDateString('pt-BR')}</span>
        </div>
        {read ? (
          <span className="fam-chip fam-chip--done"><IconCheck /> Lida por você</span>
        ) : (
          <span className="fam-chip fam-chip--new">Nova orientação</span>
        )}
      </div>

      <p style={{ margin: 0, color: 'var(--ap-text)' }}>{g.body}</p>

      {(g.objective || g.strategy || g.avoid || g.practiceTip || g.frequency) && (
        <div className="fam-guidance-grid">
          {g.objective && (
            <div className="fam-guidance-item">
              <strong>Objetivo:</strong>
              <span>{g.objective}</span>
            </div>
          )}
          {g.strategy && (
            <div className="fam-guidance-item">
              <strong>Estratégia Recomendada:</strong>
              <span>{g.strategy}</span>
            </div>
          )}
          {g.avoid && (
            <div className="fam-guidance-item">
              <strong>O que evitar:</strong>
              <span>{g.avoid}</span>
            </div>
          )}
          {g.practiceTip && (
            <div className="fam-guidance-item">
              <strong>Como praticar no dia a dia:</strong>
              <span>{g.practiceTip}</span>
            </div>
          )}
          {g.frequency && (
            <div className="fam-guidance-item">
              <strong>Frequência sugerida:</strong>
              <span>{g.frequency}</span>
            </div>
          )}
        </div>
      )}

      <div className="fam-guidance-foot">
        {!read ? (
          <Button variant="primary" size="sm" onClick={() => actions.markGuidanceRead(g.id, guardianId)}>
            <IconCheck /> Confirmar que li e compreendi
          </Button>
        ) : (
          <span className="fam-hint">Confirmação registrada no prontuário da clínica.</span>
        )}
      </div>
    </article>
  );
}

function plainProgram(repertoire: string, target: string): string {
  switch (repertoire) {
    case 'listener': return `Entender e pegar “${target}” quando pedimos`;
    case 'matching': return `Encontrar o igual: ${target}`;
    case 'social': return 'Esperar a vez e brincar junto';
    case 'mand': return `Pedir o que quer: ${target}`;
    default: return target;
  }
}

function HomeTaskCard({ task, guardianId }: { task: HomeTask; guardianId: string }) {
  const records = useStore((s) => s.homeRecords.filter((r) => r.taskId === task.id));
  const today = new Date().toISOString().slice(0, 10);
  const doneToday = records.find((r) => r.occurredOn === today);
  const [opp, setOpp] = useState(3);
  const [ok, setOk] = useState(0);
  const [note, setNote] = useState('');

  return (
    <article className="fam-task">
      <div className="fam-task__text">
        <span className="fam-hint">{task.frequency}</span>
        <h3>{task.title}</h3>
        <p>{task.instructions}</p>
      </div>
      <div className="fam-task__log">
        {doneToday ? (
          <p className="fam-thanks"><IconCheck /> Registrado hoje: {doneToday.successes} de {doneToday.opportunities}.</p>
        ) : (
          <>
            <h4>Como foi hoje?</h4>
            <Stepper label="Quantas vezes vocês tentaram?" value={opp} min={0} max={20} onChange={(v) => { setOpp(v); setOk((o) => Math.min(o, v)); }} />
            <Stepper label="Quantas vezes deu certo?" value={ok} min={0} max={opp} onChange={setOk} />
            <label className="ap-field"><span className="fam-hint">Quer contar algo? (opcional)</span>
              <input className="ap-input" value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            <Button variant="primary" size="lg" onClick={() => void actions.recordHome({ taskId: task.id, occurredOn: today, opportunities: opp, successes: ok, note: note || undefined, guardianId })}>
              Salvar
            </Button>
          </>
        )}
        <p className="fam-hint">Últimos dias: {records.slice(-5).map((r) => `${r.successes}/${r.opportunities}`).join(' · ') || '—'}</p>
      </div>
    </article>
  );
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="fam-stepper" role="group" aria-label={label}>
      <span>{label}</span>
      <div>
        <button type="button" aria-label="Menos" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" aria-label="Mais" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </div>
    </div>
  );
}

function SocialValidityForm({ caseId, guardianId }: { caseId: string; guardianId: string }) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  const [comment, setComment] = useState('');
  return (
    <div className="ap-stack" style={{ gap: '1rem' }}>
      <Likert label="Os objetivos escolhidos são importantes para a sua família?" value={a} set={setA} />
      <Likert label="Você se sente bem com a forma como a equipe trabalha?" value={b} set={setB} />
      <Likert label="Você está satisfeito(a) com o atendimento?" value={c} set={setC} />
      <label className="ap-field"><span className="fam-hint">Comentário (opcional)</span><textarea className="ap-textarea" value={comment} onChange={(e) => setComment(e.target.value)} /></label>
      <Button variant="primary" size="lg" disabled={!a || !b || !c}
        onClick={() => actions.answerSocialValidity({ caseId, guardianId, goalsImportance: a, proceduresAcceptability: b, satisfaction: c, comment: comment || undefined })}>
        Enviar resposta
      </Button>
    </div>
  );
}

function Likert({ label, value, set }: { label: string; value: number; set: (n: number) => void }) {
  return (
    <fieldset className="fam-likert">
      <legend>{label}</legend>
      <div>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-pressed={value === n} onClick={() => set(n)}>{n}</button>
        ))}
      </div>
      <span className="fam-hint">1 = nada · 5 = muito</span>
    </fieldset>
  );
}
