import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import type { GameManifest } from '@aprumo/protocol';
import { Badge, Card, Button, BackButton, CloseButton, IconCheck, IconPrinter } from '@aprumo/ui';
import { GAMES } from '../../game-host/registry';
import { GameIllustration } from '../../components/GameIllustration';
import {
  GAME_CATEGORIES,
  GAME_TO_CATEGORY,
  getCategoryOfGame,
  type GameCategoryId,
} from '../../data/gameCategories';
import {
  ArtListener,
  ArtMatch,
  ArtSchedule,
  ArtTokens,
  ArtTurns,
  ArtDetective,
  ArtExecutive,
  ArtMiniWorlds,
  ArtChef,
  ArtIndependence,
  ArtSocialCity,
  ArtCategory,
  ArtAnimalMemory,
  ArtStoryOrder,
  ArtCauseEffect,
  ArtMagicMirror,
  ArtSharedAttention,
  ArtEncaixaAi,
  ArtRampaMaluca,
  ArtLancheDoUrso,
  ArtFazendinhaSonora,
} from '../public/Landing';
import { TaskAnalysisStudio } from './resources/TaskAnalysisStudio';
import { ChoiceBoardStudio } from './resources/ChoiceBoardStudio';
import { CommunicationBoardStudio } from './resources/CommunicationBoardStudio';
import { SocialStoryStudio } from './resources/SocialStoryStudio';
import { EmotionTreeStudio } from './resources/EmotionTreeStudio';
import { VisualTimerStudio } from './resources/VisualTimerStudio';
import { FirstThenStudio } from './resources/FirstThenStudio';
import { VisualScheduleStudio } from './resources/VisualScheduleStudio';
import { TokenBoardStudio } from './resources/TokenBoardStudio';
import { VisualChecklistStudio } from './resources/VisualChecklistStudio';
import { BehaviorContractStudio } from './resources/BehaviorContractStudio';
import { RegulationZonesStudio } from './resources/RegulationZonesStudio';
import { FeelingsThermometerStudio } from './resources/FeelingsThermometerStudio';
import { ABCFrequencyStudio } from './resources/ABCFrequencyStudio';
import './library.css';

const ART: Record<string, ReactNode> = {
  'encontre-o-igual': <ArtMatch />,
  'escolha-pela-instrucao': <ArtListener />,
  'minha-vez-sua-vez': <ArtTurns />,
  'quadro-de-fichas': <ArtTokens />,
  'agenda-visual': <ArtSchedule />,
  'detetive-das-emocoes': <ArtDetective />,
  'circuito-executivo': <ArtExecutive />,
  'minimundos': <ArtMiniWorlds />,
  'pequeno-chef': <ArtChef />,
  'missao-independencia': <ArtIndependence />,
  'social-city': <ArtSocialCity />,
  'organize-categoria': <ArtCategory />,
  'memoria-bichos': <ArtAnimalMemory />,
  'historia-ordem': <ArtStoryOrder />,
  'causa-efeito': <ArtCauseEffect />,
  'espelho-magico': <ArtMagicMirror />,
  'olha-comigo': <ArtSharedAttention />,
  'encaixa-ai': <ArtEncaixaAi />,
  'rampa-maluca': <ArtRampaMaluca />,
  'lanche-do-urso': <ArtLancheDoUrso />,
  'fazendinha-sonora': <ArtFazendinhaSonora />,
};

const DefaultGameArt = ({ name }: { name: string }) => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="var(--ap-sage-100)" />
    <circle cx="80" cy="50" r="28" fill="var(--ap-sage-200)" />
    <path d="M70 42 L95 50 L70 58 Z" fill="var(--ap-primary)" />
    <text x="80" y="96" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ap-sage-800)">{name}</text>
  </svg>
);

const REPERTOIRE: Record<string, string> = { matching: 'pareamento', listener: 'ouvinte', tact: 'tato', social: 'social', play: 'brincar' };
const PLAY: Record<string, string> = { constructive: 'construtivo', functional: 'funcional', reciprocal: 'recíproco / turnos' };
const PURPOSE: Record<string, string> = { teaching: 'ensino', probe: 'sonda', reinforcer: 'reforçador', regulation: 'regulação', support: 'apoio' };
const months = (m: number) => (m < 24 ? `${m} m` : `${Math.floor(m / 12)} a`);

type StudioCategory = 'todos' | 'visual' | 'comunicacao' | 'comportamento' | 'ensino' | 'regulacao' | 'autonomia' | 'imprimiveis';

interface InteractiveResourceMeta {
  id: string;
  name: string;
  category: StudioCategory;
  summary: string;
  purposes: string[];
  evidenceBase: string;
  printable: boolean;
  interactive: boolean;
}

const INTERACTIVE_RESOURCES: InteractiveResourceMeta[] = [
  {
    id: 'timer-visual',
    name: 'Timer Visual Interativo',
    category: 'visual',
    summary: 'Cronômetro visual circular para previsibilidade e transições suaves de atividades.',
    purposes: ['Apoio a Transições', 'Previsibilidade Temporal', 'Redução de Ansiedade'],
    evidenceBase: 'Apoio visual baseado em evidências (Wong et al., 2015)',
    printable: true,
    interactive: true,
  },
  {
    id: 'primeiro-depois',
    name: 'Primeiro → Depois (Premack)',
    category: 'comportamento',
    summary: 'Quadro visual de contingência simples de alta e baixa probabilidade.',
    purposes: ['Princípio de Premack', 'Comportamento de Cooperar', 'Previsibilidade'],
    evidenceBase: 'Princípio de Premack & Suportes Visuais ABA (Cooper, Heron & Heward)',
    printable: true,
    interactive: true,
  },
  {
    id: 'agenda-visual',
    name: 'Agenda de Rotina Diária',
    category: 'visual',
    summary: 'Sequência temporal de atividades com checagem de passos e status de conclusão.',
    purposes: ['Autonomia', 'Organização Executiva', 'Transição Escolar/Clínica'],
    evidenceBase: 'National Clearinghouse on Autism Evidence and Practice (NCAEP)',
    printable: true,
    interactive: true,
  },
  {
    id: 'quadro-de-fichas',
    name: 'Quadro de Fichas (Economia de Fichas)',
    category: 'comportamento',
    summary: 'Sistema de reforçamento condicionado com 3, 5, 8 ou 10 fichas colecionáveis.',
    purposes: ['Reforçamento Condicionado', 'Engajamento', 'Atraso de Gratificação'],
    evidenceBase: 'Token Economy Systems (Hackenberg, 2009; Cooper et al.)',
    printable: true,
    interactive: true,
  },
  {
    id: 'analise-tarefa',
    name: 'Análise de Tarefa (Chaining)',
    category: 'autonomia',
    summary: 'Desdobramento de habilidades de vida diária em passos com registro de nível de dica.',
    purposes: ['Encadeamento para Frente/Trás', 'AVDs', 'Monitoramento de Dicas'],
    evidenceBase: 'Task Analysis and Chaining Procedures in Applied Behavior Analysis',
    printable: true,
    interactive: true,
  },
  {
    id: 'historia-social',
    name: 'História Social Interativa',
    category: 'comunicacao',
    summary: 'Narrativa visual explicativa de situações sociais, sentimentos e condutas esperadas.',
    purposes: ['Compreensão Social', 'Previsibilidade de Cenários', 'Autorregulação'],
    evidenceBase: 'Social Narratives (Gray, 2010; Wong et al., 2015)',
    printable: true,
    interactive: true,
  },
  {
    id: 'prancha-escolha',
    name: 'Prancha de Escolha Direta',
    category: 'comunicacao',
    summary: 'Quadro de escolha tátil de 2, 4 ou 6 estímulos com retorno sonoro de confirmação.',
    purposes: ['Comunicação Funcional', 'Autodeterminação', 'Preferências Ativas'],
    evidenceBase: 'Choice-making interventions in ASD (Shogren et al.)',
    printable: true,
    interactive: true,
  },
  {
    id: 'prancha-comunicacao',
    name: 'Prancha de Comunicação (PECS/CAA)',
    category: 'comunicacao',
    summary: 'Tira de sentença visual com botão de voz para formação de pedidos e relatos.',
    purposes: ['Comunicação Alternativa e Aumentativa', 'Mando Funcional', 'Voz Ativa'],
    evidenceBase: 'Picture Exchange Communication System (Frost & Bondy, 2002)',
    printable: true,
    interactive: true,
  },
  {
    id: 'arvore-emocoes',
    name: 'Árvore das Emoções & Regulação Somática',
    category: 'regulacao',
    summary: 'Mapeamento visual e somático de 5 zonas emocionais com respiração guiada 4-2-4 e grounding nos modos Soft Clay e Graphic Novel.',
    purposes: ['Autorregulação Emocional', 'Respiração Guiada 4-2-4', 'Aterramento Somático', 'Prevenção de Crise'],
    evidenceBase: 'The Zones of Regulation & Somatic Grounding (Kuypers, 2011; Levine, 2010)',
    printable: true,
    interactive: true,
  },
  {
    id: 'semaforo-regulacao',
    name: 'Semáforo de Regulação (Zones)',
    category: 'regulacao',
    summary: 'Mapeamento visual de quatro zonas fisiológicas e emocionais com estratégias imediatas e check-in somático.',
    purposes: ['Autorregulação Emocional', 'Identificação Somática', 'Coprodução de Calma'],
    evidenceBase: 'The Zones of Regulation framework (Kuypers, 2011)',
    printable: true,
    interactive: true,
  },
  {
    id: 'termometro-emocional',
    name: 'Termômetro Emocional de 5 Níveis',
    category: 'regulacao',
    summary: 'Escala visual graduada de 5 níveis de intensidade emocional com checklist de sensações corporais e ações de regulação.',
    purposes: ['Introspecção Emocional', 'Prevenção de Crise', 'Metacognição'],
    evidenceBase: 'The Incredible 5-Point Scale (Buron & Curtis, 2003)',
    printable: true,
    interactive: true,
  },
  {
    id: 'rotina-checklist',
    name: 'Rotina Visual com Checklist',
    category: 'autonomia',
    summary: 'Lista interativa de checagem para rotinas da manhã, clínica, escola e noite com sintetizador de voz.',
    purposes: ['Independência', 'Função Executiva', 'Rotina Domiciliar'],
    evidenceBase: 'Visual Schedules & Checklists (Carnahan et al., 2009)',
    printable: true,
    interactive: true,
  },
  {
    id: 'contrato-comportamental',
    name: 'Contrato Comportamental (ABA)',
    category: 'comportamento',
    summary: 'Pacto formal de contingência com meta operacionalizada, reforçador pactuado e assinaturas do aprendiz, terapeuta e família.',
    purposes: ['Contingência Comportamental', 'Compromisso Mútuo', 'Autodeterminação'],
    evidenceBase: 'Behavioral Contracting in Applied Behavior Analysis (Cooper, Heron & Heward)',
    printable: true,
    interactive: true,
  },
  {
    id: 'contador-abc',
    name: 'Contador de Frequência & Registro ABC',
    category: 'comportamento',
    summary: 'Clicker em tempo real com cálculo de taxa por minuto, registro de tríplice contingência e exportação CSV.',
    purposes: ['Medição Direta de Comportamento', 'Análise Funcional ABC', 'Taxa/Minuto', 'Exportação de Dados'],
    evidenceBase: 'Direct Behavioral Assessment & ABC Contingency Recording (Bijou et al.)',
    printable: true,
    interactive: true,
  },
];

export default function Library() {
  const [category, setCategory] = useState<StudioCategory>('todos');
  const [gameCategoryFilter, setGameCategoryFilter] = useState<GameCategoryId>('todos');
  const [search, setSearch] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState<'todos' | 'ABA' | 'DENVER'>('todos');
  const [ageFilter, setAgeFilter] = useState<'todas' | 'bebe' | 'pre' | 'escolar'>('todas');

  const filteredInteractive = INTERACTIVE_RESOURCES.filter((r) => {
    const matchCat = category === 'todos' || r.category === category || (category === 'imprimiveis' && r.printable);
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredGames = Object.values(GAMES).filter((g) => {
    const m = g.manifest;
    const c = m.clinical;
    const matchCat = category === 'todos' || category === 'ensino';
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.summary.toLowerCase().includes(search.toLowerCase());

    const catId = GAME_TO_CATEGORY[m.appId] ?? 'cognicao-pareamento';
    const matchGameCat = gameCategoryFilter === 'todos' || catId === gameCategoryFilter;

    const matchModel =
      modelFilter === 'todos' ||
      (modelFilter === 'ABA' && c.models.ABA && c.models.ABA !== 'not-indicated') ||
      (modelFilter === 'DENVER' && c.models.DENVER && c.models.DENVER !== 'not-indicated');

    const [minM, maxM] = c.ageRangeMonths;
    const matchAge =
      ageFilter === 'todas' ||
      (ageFilter === 'bebe' && minM <= 36 && maxM >= 12) ||
      (ageFilter === 'pre' && minM <= 72 && maxM >= 36) ||
      (ageFilter === 'escolar' && maxM >= 72);

    return matchCat && matchSearch && matchGameCat && matchModel && matchAge;
  });

  return (
    <>
      <div className="rs-header">
        <div className="page-head pro-mb-0">
          <div>
            <h1>Aprumo Resource Studio</h1>
            <p>
              Biblioteca clínica de recursos terapêuticos e jogos de ensino. Instrumentos visuais interativos construídos
              sobre as evidências de ABA, Denver e Comunicação Alternativa, prontos para uso em sessão e impressão.
            </p>
          </div>
        </div>

        <div className="rs-top-meta">
          <span><strong>{filteredInteractive.length}</strong> Ferramentas Interativas</span>
          <span>·</span>
          <span><strong>{Object.keys(GAMES).length}</strong> Jogos Clínicos Integrados</span>
          <span>·</span>
          <span>Protocolo Clínico Aprumo v2.0</span>
          <span>·</span>
          <span>Padrão WCAG 2.2 AA Tátil</span>
        </div>

        <div className="rs-search-bar">
          <input
            type="search"
            className="rs-search-input"
            placeholder="Buscar por recurso, objetivo clínico ou evidência..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar recursos"
          />
        </div>

        <div className="rs-category-tabs" role="tablist" aria-label="Categorias de recursos">
          {[
            ['todos', 'Todos os Recursos'],
            ['visual', 'Rotina & Visual'],
            ['comunicacao', 'Comunicação & CAA'],
            ['comportamento', 'Comportamento & Fichas'],
            ['ensino', 'Jogos de Ensino'],
            ['regulacao', 'Regulação & Sensorial'],
            ['autonomia', 'Autonomia & AVDs'],
            ['imprimiveis', 'Prontos para Impressão'],
          ].map(([id, label]) => (
            <button
              key={id}
              role="tab"
              className="rs-tab-pill"
              aria-selected={category === id}
              onClick={() => setCategory(id as StudioCategory)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Seção 1: Ferramentas Terapêuticas Interativas */}
      {category !== 'ensino' && (
        <section aria-labelledby="sec-interativos" style={{ marginBottom: '2.5rem' }}>
          <h2 id="sec-interativos" style={{ fontSize: 'var(--ap-text-xl)', marginBottom: '1rem' }}>
            Ferramentas Terapêuticas Interativas ({filteredInteractive.length})
          </h2>
          <div className="rs-grid">
            {filteredInteractive.map((r) => (
              <article key={r.id} className="rs-card">
                <div className="rs-card__preview">
                  <div style={{ transform: 'scale(0.85)', pointerEvents: 'none' }}>
                    {r.id === 'quadro-de-fichas' ? <ArtTokens /> :
                     r.id === 'agenda-visual' ? <ArtSchedule /> :
                     <ToolThumbnail id={r.id} />}
                  </div>
                </div>
                <div className="rs-card__body">
                  <h3 className="rs-card__title">{r.name}</h3>
                  <p className="rs-card__desc">{r.summary}</p>
                  <div className="rs-card__badges">
                    {r.purposes.map((p) => (
                      <Badge key={p} tone="info">{p}</Badge>
                    ))}
                    {r.printable && <Badge tone="success">Imprimível</Badge>}
                  </div>
                  <div className="rs-card__actions">
                    <Button variant="primary" style={{ flex: 1 }} onClick={() => setActiveTool(r.id)}>
                      Abrir Ferramenta
                    </Button>
                    {r.printable && (
                      <Button variant="ghost" aria-label="Imprimir Ficha" onClick={() => { setActiveTool(r.id); setTimeout(() => window.print(), 300); }}>
                        <IconPrinter />
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Seção 2: Jogos de Ensino */}
      {(category === 'todos' || category === 'ensino') && (
        <section aria-labelledby="sec-jogos" style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <h2 id="sec-jogos" style={{ fontSize: 'var(--ap-text-xl)', margin: 0 }}>
              Jogos Clínicos Integrados ({filteredGames.length})
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <span className="ap-xs ap-muted" style={{ fontWeight: 600 }}>Modelo:</span>
                {(['todos', 'ABA', 'DENVER'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    className="rs-tab-pill"
                    aria-selected={modelFilter === m}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                    onClick={() => setModelFilter(m)}
                  >
                    {m === 'todos' ? 'Todos' : m === 'ABA' ? 'ABA' : 'Denver'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <span className="ap-xs ap-muted" style={{ fontWeight: 600 }}>Idade:</span>
                {(['todas', 'bebe', 'pre', 'escolar'] as const).map((age) => (
                  <button
                    key={age}
                    type="button"
                    role="tab"
                    className="rs-tab-pill"
                    aria-selected={ageFilter === age}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                    onClick={() => setAgeFilter(age)}
                  >
                    {age === 'todas' ? 'Todas' : age === 'bebe' ? '1–3 anos' : age === 'pre' ? '3–6 anos' : '6+ anos'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Subfiltro de Categorias Padronizadas de Jogos */}
          <div
            role="tablist"
            aria-label="Filtrar jogos integrados por categoria clínica"
            style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}
          >
            <button
              type="button"
              role="tab"
              className="rs-tab-pill"
              aria-selected={gameCategoryFilter === 'todos'}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
              onClick={() => setGameCategoryFilter('todos')}
            >
              Todas as Categorias ({Object.keys(GAMES).length})
            </button>
            {Object.values(GAME_CATEGORIES).map((cat) => {
              const count = Object.values(GAMES).filter((g) => GAME_TO_CATEGORY[g.manifest.appId] === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  className="rs-tab-pill"
                  aria-selected={gameCategoryFilter === cat.id}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', gap: '0.3rem' }}
                  onClick={() => setGameCategoryFilter(cat.id)}
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span style={{ opacity: 0.75, fontSize: '0.72rem' }}>({count})</span>
                </button>
              );
            })}
          </div>
          <div className="rs-grid">
            {filteredGames.map((g) => (
              <GameCard key={g.manifest.appId} m={g.manifest} />
            ))}
          </div>
        </section>
      )}

      {/* Modal / Workbench da Ferramenta Selecionada */}
      {activeTool && (
        <ToolModal toolId={activeTool} onClose={() => setActiveTool(null)} />
      )}
    </>
  );
}

function ToolThumbnail({ id }: { id: string }) {
  switch (id) {
    case 'timer-visual':
      return (
        <svg viewBox="0 0 100 100" width="90" height="90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--ap-sage-200)" strokeWidth="8" />
          <path d="M 50 8 A 42 42 0 0 1 85 75 L 50 50 Z" fill="var(--ap-terra-500)" opacity="0.8" />
          <circle cx="50" cy="50" r="6" fill="var(--ap-sage-800)" />
        </svg>
      );
    case 'primeiro-depois':
      return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', fontWeight: 700 }}>
          <div style={{ background: '#fff', border: '2px solid var(--ap-sage-600)', borderRadius: '8px', padding: '6px 10px', textAlign: 'center' }}>
            1º TAREFA
          </div>
          <span style={{ fontSize: '16px', color: 'var(--ap-sage-700)' }}>➔</span>
          <div style={{ background: 'var(--ap-success-soft)', border: '2px solid var(--ap-success)', borderRadius: '8px', padding: '6px 10px', textAlign: 'center' }}>
            2º REFORÇO
          </div>
        </div>
      );
    case 'arvore-emocoes':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80">
          <path d="M 46 90 L 46 60 Q 50 50 54 60 L 54 90 Z" fill="#78350f" />
          <circle cx="50" cy="40" r="26" fill="#2e7d32" opacity="0.85" />
          <circle cx="34" cy="42" r="14" fill="#f57f17" opacity="0.9" />
          <circle cx="66" cy="42" r="14" fill="#0277bd" opacity="0.9" />
          <circle cx="50" cy="22" r="14" fill="#c62828" opacity="0.9" />
        </svg>
      );
    case 'analise-tarefa':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '80px' }}>
          <div style={{ background: 'var(--ap-success)', height: '7px', borderRadius: '4px', width: '100%' }} />
          <div style={{ background: 'var(--ap-success)', height: '7px', borderRadius: '4px', width: '85%' }} />
          <div style={{ background: '#1976d2', height: '7px', borderRadius: '4px', width: '60%' }} />
          <div style={{ background: '#ed6c02', height: '7px', borderRadius: '4px', width: '40%' }} />
        </div>
      );
    case 'historia-social':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--ap-border)' }}>
          <span style={{ fontSize: '24px' }}>📖</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ width: '36px', height: '5px', background: 'var(--ap-sage-800)', borderRadius: '2px' }} />
            <div style={{ width: '24px', height: '4px', background: 'var(--ap-sage-400)', borderRadius: '2px' }} />
          </div>
        </div>
      );
    case 'prancha-escolha':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--ap-primary-soft)', border: '2px solid var(--ap-primary)', borderRadius: '8px', display: 'grid', placeItems: 'center', fontSize: '14px' }}>⚽</div>
          <div style={{ width: '28px', height: '28px', background: 'var(--ap-surface)', border: '1px solid var(--ap-border)', borderRadius: '8px', display: 'grid', placeItems: 'center', fontSize: '14px' }}>🚗</div>
        </div>
      );
    case 'prancha-comunicacao':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--ap-surface)', padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--ap-border-strong)' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span style={{ background: 'var(--ap-primary)', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 4px', borderRadius: '4px' }}>EU QUERO</span>
            <span style={{ background: 'var(--ap-surface-sunken)', fontSize: '11px', padding: '1px 3px', borderRadius: '4px' }}>💧</span>
          </div>
        </div>
      );
    case 'semaforo-regulacao':
      return (
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#4caf50' }} />
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ffeb3b' }} />
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f44336' }} />
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#2196f3' }} />
        </div>
      );
    case 'termometro-emocional':
      return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '50px' }}>
          <div style={{ width: '12px', height: '18%', background: '#4caf50', borderRadius: '3px' }} />
          <div style={{ width: '12px', height: '36%', background: '#8bc34a', borderRadius: '3px' }} />
          <div style={{ width: '12px', height: '54%', background: '#ffc107', borderRadius: '3px' }} />
          <div style={{ width: '12px', height: '76%', background: '#ff9800', borderRadius: '3px' }} />
          <div style={{ width: '12px', height: '100%', background: '#f44336', borderRadius: '3px' }} />
        </div>
      );
    case 'contrato-comportamental':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: '#fff', padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--ap-border-strong)' }}>
          <span style={{ fontSize: '18px' }}>📜</span>
          <div style={{ width: '32px', height: '3px', background: 'var(--ap-primary)', borderRadius: '2px' }} />
          <div style={{ width: '22px', height: '3px', background: 'var(--ap-sage-400)', borderRadius: '2px' }} />
        </div>
      );
    case 'contador-abc':
      return (
        <div style={{ background: 'var(--ap-sage-900)', color: '#fff', borderRadius: '12px', padding: '10px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ap-terra-400)' }}>14</div>
          <div style={{ fontSize: '9px', letterSpacing: '0.05em' }}>REGISTROS ABC</div>
        </div>
      );
    default:
      return (
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--ap-sage-100)', display: 'grid', placeItems: 'center', fontSize: '24px' }}>
          📋
        </div>
      );
  }
}

function GameCard({ m }: { m: GameManifest }) {
  const c = m.clinical;
  const cat = getCategoryOfGame(m.appId);
  return (
    <Card as="article" bodyClassName="ap-stack">
      <div style={{ margin: '-1.25rem -1.25rem 0', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: '16px 16px 0 0' }} aria-hidden="true">
        <GameIllustration appId={m.appId} name={m.name} fallbackArt={ART[m.appId]} interactive />
      </div>
      <div className="ap-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 'var(--ap-text-lg)', margin: 0 }}>{m.name}</h3>
        <span className="ap-xs ap-muted">v{m.version}</span>
      </div>
      <div className="ap-row" style={{ gap: '0.35rem', flexWrap: 'wrap' }}>
        <span
          className="ap-badge"
          style={{
            background: `${cat.color}15`,
            color: cat.color,
            borderColor: `${cat.color}35`,
            fontWeight: 600,
          }}
        >
          {cat.icon} {cat.label}
        </span>
        {c.models.ABA !== 'not-indicated' && <Badge tone="info">ABA</Badge>}
        {c.models.DENVER !== 'not-indicated' && <Badge tone="success">Denver</Badge>}
      </div>
      <p className="ap-small ap-muted" style={{ margin: 0 }}>{m.summary}</p>
      <div className="ap-row" style={{ gap: '0.35rem', flexWrap: 'wrap' }}>
        {c.purposes.map((p) => <Badge key={p}>{PURPOSE[p] ?? p}</Badge>)}
        {c.repertoires.map((r) => <Badge key={r} tone="info">{REPERTOIRE[r] ?? r}</Badge>)}
      </div>
      <dl className="ap-xs" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.3rem 0.8rem', margin: 0 }}>
        {m.kind === 'game' && (
          <>
            <dt className="ap-muted">Unidade</dt><dd style={{ margin: 0 }}>{c.trialUnit}</dd>
            <dt className="ap-muted">Resposta correta</dt><dd style={{ margin: 0 }}>{c.correctResponse}</dd>
            <dt className="ap-muted">Pontuação</dt>
            <dd style={{ margin: 0 }}>
              {c.autoScoring.length ? `automática (${c.autoScoring.map((r) => REPERTOIRE[r] ?? r).join(', ')})` : '—'}
              {c.therapistScoring.length ? ` · pelo terapeuta (${c.therapistScoring.map((r) => REPERTOIRE[r] ?? r).join(', ')})` : ''}
            </dd>
            <dt className="ap-muted">Nível de brincar</dt><dd style={{ margin: 0 }}>{PLAY[c.playLevel] ?? c.playLevel}</dd>
          </>
        )}
        <dt className="ap-muted">Idade</dt>
        <dd style={{ margin: 0 }}>{months(c.ageRangeMonths[0])} a {months(c.ageRangeMonths[1])}{c.requiresAdult ? ' · com adulto' : ''}</dd>
        <dt className="ap-muted">Sensorial</dt>
        <dd style={{ margin: 0 }}>sem flashes · movimento {c.sensory.motionReducible ? 'ajustável' : 'fixo'} · som {c.sensory.sound === 'adjustable' ? 'ajustável' : c.sensory.sound}</dd>
      </dl>
      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
        <Link
          to="/demonstracao"
          className="ap-btn ap-btn--sm ap-btn--secondary"
          style={{ width: '100%', justifyContent: 'center' }}
          aria-label={`Testar o jogo ${m.name} na sessão demonstrativa`}
        >
          Testar Jogo em Sessão
        </Link>
      </div>
    </Card>
  );
}

function ToolModal({ toolId, onClose }: { toolId: string; onClose: () => void }) {
  const meta = INTERACTIVE_RESOURCES.find((r) => r.id === toolId);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Foco entra no modal ao abrir e volta ao cartão de origem ao fechar.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('.rs-modal-back')?.focus();
    return () => previous?.focus?.();
  }, []);

  if (!meta) return null;

  return (
    <div className="rs-modal-overlay">
      <div ref={dialogRef} className="rs-modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="rs-modal-head">
          <BackButton className="rs-modal-back" label="Voltar ao catálogo" onClick={onClose} />
          <div className="rs-modal-title">
            <h2 id="modal-title">{meta.name}</h2>
            <span className="ap-xs ap-muted">{meta.evidenceBase}</span>
          </div>
          <CloseButton label="Fechar e voltar ao catálogo (Esc)" onClick={onClose} />
        </header>

        <div className="rs-modal-body">
          {toolId === 'timer-visual' && <VisualTimerStudio />}
          {toolId === 'primeiro-depois' && <FirstThenStudio />}
          {toolId === 'agenda-visual' && <VisualScheduleStudio />}
          {toolId === 'quadro-de-fichas' && <TokenBoardStudio />}
          {toolId === 'analise-tarefa' && <TaskAnalysisStudio />}
          {toolId === 'historia-social' && <SocialStoryStudio />}
          {toolId === 'prancha-escolha' && <ChoiceBoardStudio />}
          {toolId === 'prancha-comunicacao' && <CommunicationBoardStudio />}
          {toolId === 'arvore-emocoes' && <EmotionTreeStudio />}
          {toolId === 'semaforo-regulacao' && <RegulationZonesStudio />}
          {toolId === 'termometro-emocional' && <FeelingsThermometerStudio />}
          {toolId === 'rotina-checklist' && <VisualChecklistStudio />}
          {toolId === 'contrato-comportamental' && <BehaviorContractStudio />}
          {toolId === 'contador-abc' && <ABCFrequencyStudio />}
        </div>

        <footer className="rs-modal-footer">
          {meta.printable && (
            <Button variant="ghost" onClick={() => window.print()}>
              <IconPrinter /> Imprimir Ficha
            </Button>
          )}
          <Button variant="primary" size="lg" className="rs-modal-done" icon={<IconCheck />} onClick={onClose}>
            Concluir e voltar ao catálogo
          </Button>
        </footer>
      </div>
    </div>
  );
}
