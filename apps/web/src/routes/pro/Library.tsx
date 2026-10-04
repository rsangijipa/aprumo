import { useState, useEffect, useRef, type ReactNode } from 'react';
import type { GameManifest } from '@aprumo/protocol';
import { Badge, Card, Button, BackButton, CloseButton, IconCheck, IconPrinter } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';
import { GAMES } from '../../game-host/registry';
import { ArtListener, ArtMatch, ArtSchedule, ArtTokens, ArtTurns } from '../public/Landing';
import './library.css';

const ART: Record<string, ReactNode> = {
  'encontre-o-igual': <ArtMatch />,
  'escolha-pela-instrucao': <ArtListener />,
  'minha-vez-sua-vez': <ArtTurns />,
  'quadro-de-fichas': <ArtTokens />,
  'agenda-visual': <ArtSchedule />,
};

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
    printable: false,
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
    summary: 'Sistema de reforçamento condicionado com 3, 5 ou 10 fichas colecionáveis.',
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
    id: 'semaforo-regulacao',
    name: 'Semáforo de Regulação (Zones)',
    category: 'regulacao',
    summary: 'Mapeamento visual de quatro estados fisiológicos e emocionais com estratégias imediatas.',
    purposes: ['Autorregulação Emocional', 'Identificação Somática', 'Coprodução de Calma'],
    evidenceBase: 'The Zones of Regulation framework (Kuypers, 2011)',
    printable: true,
    interactive: true,
  },
  {
    id: 'termometro-emocional',
    name: 'Termômetro Emocional de 5 Níveis',
    category: 'regulacao',
    summary: 'Escala visual graduada de intensidade emocional com checklist de sensações corporais.',
    purposes: ['Introspecção Emocional', 'Prevenção de Crise', 'Metacognição'],
    evidenceBase: 'The Incredible 5-Point Scale (Buron & Curtis, 2003)',
    printable: true,
    interactive: true,
  },
  {
    id: 'rotina-checklist',
    name: 'Rotina Visual com Checklist',
    category: 'autonomia',
    summary: 'Lista interativa de checagem para rotinas da manhã, clínica, escola e noite.',
    purposes: ['Independência', 'Função Executiva', 'Rotina Domiciliar'],
    evidenceBase: 'Visual Schedules & Checklists (Carnahan et al., 2009)',
    printable: true,
    interactive: true,
  },
  {
    id: 'contador-abc',
    name: 'Contador de Frequência & Registro ABC',
    category: 'comportamento',
    summary: 'Clicker em tempo real com cálculo de taxa por minuto e registro de tríplice contingência.',
    purposes: ['Medição Direta de Comportamento', 'Análise Funcional ABC', 'Taxa/Minuto'],
    evidenceBase: 'Direct Behavioral Assessment & ABC Contingency Recording (Bijou et al.)',
    printable: true,
    interactive: true,
  },
];

export default function Library() {
  const [category, setCategory] = useState<StudioCategory>('todos');
  const [search, setSearch] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const filteredInteractive = INTERACTIVE_RESOURCES.filter((r) => {
    const matchCat = category === 'todos' || r.category === category || (category === 'imprimiveis' && r.printable);
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredGames = Object.values(GAMES).filter((g) => {
    const m = g.manifest;
    const matchCat = category === 'todos' || category === 'ensino';
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <div className="rs-header">
        <div className="page-head" style={{ marginBottom: 0 }}>
          <div>
            <h1>Aprumo Resource Studio</h1>
            <p>
              Biblioteca clínica de recursos terapêuticos e jogos de ensino. Instrumentos visuais interativos construídos
              sobre as evidências de ABA, Denver e Comunicação Alternativa, prontos para uso em sessão e impressão.
            </p>
          </div>
        </div>

        <div className="rs-top-meta">
          <span><strong>12</strong> Ferramentas Interativas</span>
          <span>·</span>
          <span><strong>3</strong> Jogos Clínicos Integrados</span>
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
      {(category !== 'ensino') && (
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
          <h2 id="sec-jogos" style={{ fontSize: 'var(--ap-text-xl)', marginBottom: '1rem' }}>
            Jogos Clínicos Integrados ({filteredGames.length})
          </h2>
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
  return (
    <Card as="article" bodyClassName="ap-stack">
      <div style={{ margin: '-1.25rem -1.25rem 0', aspectRatio: '16 / 8', overflow: 'hidden', borderRadius: '16px 16px 0 0' }} aria-hidden="true">
        {ART[m.appId]}
      </div>
      <div className="ap-row" style={{ justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 'var(--ap-text-lg)', margin: 0 }}>{m.name}</h3>
        <span className="ap-xs ap-muted">v{m.version}</span>
      </div>
      <p className="ap-small ap-muted" style={{ margin: 0 }}>{m.summary}</p>
      <div className="ap-row" style={{ gap: '0.35rem' }}>
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
        <dt className="ap-muted">Modelos</dt>
        <dd style={{ margin: 0 }}>
          ABA: {c.models.ABA === 'not-indicated' ? 'não indicado' : c.models.ABA} · Denver: {c.models.DENVER === 'not-indicated' ? 'não indicado' : c.models.DENVER}
        </dd>
        <dt className="ap-muted">Idade</dt>
        <dd style={{ margin: 0 }}>{months(c.ageRangeMonths[0])} a {months(c.ageRangeMonths[1])}{c.requiresAdult ? ' · com adulto' : ''}</dd>
        <dt className="ap-muted">Sensorial</dt>
        <dd style={{ margin: 0 }}>sem flashes · movimento {c.sensory.motionReducible ? 'ajustável' : 'fixo'} · som {c.sensory.sound === 'adjustable' ? 'ajustável' : c.sensory.sound}</dd>
      </dl>
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
          {toolId === 'timer-visual' && <TimerVisualTool />}
          {toolId === 'primeiro-depois' && <FirstThenTool />}
          {toolId === 'agenda-visual' && <VisualScheduleTool />}
          {toolId === 'quadro-de-fichas' && <TokenBoardTool />}
          {toolId === 'analise-tarefa' && <TaskAnalysisTool />}
          {toolId === 'historia-social' && <SocialStoryTool />}
          {toolId === 'prancha-escolha' && <ChoiceBoardTool />}
          {toolId === 'prancha-comunicacao' && <CommunicationBoardTool />}
          {toolId === 'semaforo-regulacao' && <ZonesTool />}
          {toolId === 'termometro-emocional' && <FeelingsThermometerTool />}
          {toolId === 'rotina-checklist' && <VisualRoutineTool />}
          {toolId === 'contador-abc' && <BehaviorCounterTool />}
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

/* ------------------------------------------------------------
 * 1. Timer Visual Interativo
 * ------------------------------------------------------------ */
function TimerVisualTool() {
  const [totalSeconds, setTotalSeconds] = useState(120);
  const [remaining, setRemaining] = useState(120);
  const [running, setRunning] = useState(false);
  const [chime, setChime] = useState(true);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setRunning(false);
          if (chime) {
            playTones([
              { freq: 523.25, dur: 0.15, type: 'sine' },
              { freq: 659.25, dur: 0.15, delay: 0.15, type: 'sine' },
              { freq: 783.99, dur: 0.35, delay: 0.3, type: 'sine' },
            ], 'normal');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running, chime]);

  const selectPreset = (secs: number) => {
    setTotalSeconds(secs);
    setRemaining(secs);
    setRunning(false);
  };

  const progress = totalSeconds > 0 ? (remaining / totalSeconds) : 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div className="rs-timer-circle">
        <svg viewBox="0 0 200 200" width="220" height="220">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--ap-border)" strokeWidth="16" />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="var(--ap-primary)"
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="rs-timer-display">
          <span className="rs-timer-time">{formatted}</span>
          <span className="ap-xs ap-muted">{remaining === 0 ? 'Tempo concluído!' : running ? 'Em andamento' : 'Pausado'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          [30, '30s'],
          [60, '1 min'],
          [120, '2 min'],
          [300, '5 min'],
          [600, '10 min'],
        ].map(([s, label]) => (
          <button
            key={s}
            type="button"
            className="rs-tab-pill"
            aria-pressed={totalSeconds === s}
            onClick={() => selectPreset(Number(s))}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant={running ? 'default' : 'primary'} size="lg" onClick={() => setRunning(!running)}>
          {running ? 'Pausar' : 'Iniciar Timer'}
        </Button>
        <Button variant="ghost" onClick={() => { setRemaining(totalSeconds); setRunning(false); }}>
          Reiniciar
        </Button>
        <Button variant="ghost" aria-pressed={chime} onClick={() => setChime(!chime)}>
          {chime ? '🔔 Sinal Ativo' : '🔕 Mudo'}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
 * 2. Primeiro -> Depois (Premack)
 * ------------------------------------------------------------ */
function FirstThenTool() {
  const [first, setFirst] = useState('Lavar as mãos');
  const [then, setThen] = useState('Jogar no tablet');
  const [done, setDone] = useState(false);

  const presetsFirst = ['Lavar as mãos', 'Fazer lição na mesa', 'Guardar os brinquedos', 'Escovar os dentes', 'Comer a fruta'];
  const presetsThen = ['Jogar no tablet', 'Brincar de massinha', 'Ir ao parquinho', 'Ouvir música', 'Pular na cama elástica'];

  const completeFirst = () => {
    setDone(true);
    playTones([
      { freq: 440, dur: 0.12, type: 'sine' },
      { freq: 554.37, dur: 0.12, delay: 0.12, type: 'sine' },
      { freq: 659.25, dur: 0.25, delay: 0.24, type: 'sine' },
    ], 'normal');
    void speak('Muito bem! Primeiro concluído, agora é o depois!', 'normal');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="rs-first-then">
        <div className={`rs-ft-box ${done ? 'completed' : ''}`}>
          <span className="ap-xs" style={{ fontWeight: 800, color: 'var(--ap-sage-800)', letterSpacing: '0.05em' }}>1º PRIMEIRO</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{first}</div>
          {done ? (
            <div style={{ color: 'var(--ap-success)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <IconCheck /> Concluído!
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={completeFirst}>
              Marcar como feito
            </Button>
          )}
        </div>

        <div className="rs-ft-arrow" aria-hidden="true">➔</div>

        <div className="rs-ft-box" style={{ borderColor: done ? 'var(--ap-terra-500)' : 'var(--ap-border-strong)', background: done ? 'var(--ap-terra-100)' : 'var(--ap-surface-sunken)' }}>
          <span className="ap-xs" style={{ fontWeight: 800, color: 'var(--ap-terra-700)', letterSpacing: '0.05em' }}>2º DEPOIS</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ap-terra-800)' }}>{then}</div>
          <span className="ap-xs ap-muted">{done ? '🎉 Liberado para aproveitar!' : 'Liberado após o primeiro'}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label className="ap-field">
            <span className="ap-label">Trocar Primeiro:</span>
            <select className="ap-select" value={first} onChange={(e) => { setFirst(e.target.value); setDone(false); }}>
              {presetsFirst.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
        </div>
        <div>
          <label className="ap-field">
            <span className="ap-label">Trocar Depois (Reforço):</span>
            <select className="ap-select" value={then} onChange={(e) => setThen(e.target.value)}>
              {presetsThen.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
 * 3. Agenda Visual
 * ------------------------------------------------------------ */
function VisualScheduleTool() {
  const [items, setItems] = useState([
    { id: '1', title: 'Chegada e Acolhimento', time: '09:00', done: true },
    { id: '2', title: 'Atividade de Mesa (DTT)', time: '09:15', done: false },
    { id: '3', title: 'Pausa Sensorial / Lanche', time: '09:40', done: false },
    { id: '4', title: 'Brincar no Chão (ESDM)', time: '10:00', done: false },
    { id: '5', title: 'Organização e Saída', time: '10:20', done: false },
  ]);

  const toggle = (id: string) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
    playTones([{ freq: 587.33, dur: 0.1, type: 'sine' }], 'normal');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p className="ap-small ap-muted" style={{ margin: 0 }}>
        Toque na atividade para marcar a conclusão da rotina. Proporciona previsibilidade estruturada.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {items.map((item, idx) => (
          <button
            type="button"
            key={item.id}
            onClick={() => toggle(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.9rem 1.25rem',
              borderRadius: 'var(--ap-radius-md)',
              border: '1px solid var(--ap-border)',
              background: item.done ? 'var(--ap-success-soft)' : 'var(--ap-surface)',
              cursor: 'pointer',
              transition: 'background var(--ap-dur-1)',
              width: '100%',
              textAlign: 'left',
              font: 'inherit',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: 'var(--ap-text-sm)', fontWeight: 700, color: 'var(--ap-sage-800)', minWidth: '45px' }}>{item.time}</span>
              <strong style={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--ap-text-muted)' : 'var(--ap-text)' }}>
                {idx + 1}. {item.title}
              </strong>
            </div>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--ap-border-strong)', background: item.done ? 'var(--ap-success)' : 'transparent', color: '#fff', display: 'grid', placeItems: 'center' }}>
              {item.done && <IconCheck />}
            </div>
          </button>
        ))}
      </div>
      <Button variant="ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setItems((prev) => prev.map((x) => ({ ...x, done: false })))}>
        Reiniciar Agenda
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------
 * 4. Quadro de Fichas (Token Board)
 * ------------------------------------------------------------ */
function TokenBoardTool() {
  const [capacity, setCapacity] = useState<3 | 5 | 10>(5);
  const [earned, setEarned] = useState(2);
  const [theme, setTheme] = useState<'estrela' | 'dinossauro' | 'coracao'>('estrela');
  const [reward] = useState('Brinquedo Especial');

  const addToken = () => {
    if (earned < capacity) {
      const next = earned + 1;
      setEarned(next);
      playTones([
        { freq: 440 + next * 40, dur: 0.12, type: 'sine' },
      ], 'normal');
      if (next === capacity) {
        void speak('Parabéns! Você juntou todas as fichas!', 'normal');
      }
    }
  };

  const removeToken = () => {
    if (earned > 0) setEarned(earned - 1);
  };

  const icons: Record<string, string> = { estrela: '⭐', dinossauro: '🦖', coracao: '❤️' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[3, 5, 10].map((c) => (
            <button key={c} type="button" className="rs-tab-pill" aria-pressed={capacity === c} onClick={() => { setCapacity(c as 3 | 5 | 10); setEarned(0); }}>
              {c} Fichas
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['estrela', 'dinossauro', 'coracao'] as const).map((t) => (
            <button key={t} type="button" className="rs-tab-pill" aria-pressed={theme === t} onClick={() => setTheme(t)}>
              {icons[t]} {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--ap-surface-sunken)', border: '2px solid var(--ap-border-strong)', borderRadius: '24px', padding: '1.5rem 2rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--ap-surface)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--ap-border)' }}>
          <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 700, color: 'var(--ap-text-muted)' }}>ESTOU TRABALHANDO POR:</span>
          <strong style={{ color: 'var(--ap-primary)' }}>🎁 {reward}</strong>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Array.from({ length: capacity }).map((_, i) => {
            const has = i < earned;
            return (
              <button
                key={i}
                type="button"
                onClick={has ? removeToken : addToken}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: has ? '3px solid var(--ap-primary)' : '2px dashed var(--ap-border-strong)',
                  background: has ? 'var(--ap-surface)' : 'transparent',
                  fontSize: '28px',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  transform: has ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                aria-label={`Ficha ${i + 1} ${has ? 'conquistada' : 'vazia'}`}
              >
                {has ? icons[theme] : ''}
              </button>
            );
          })}
        </div>

        {earned === capacity && (
          <div style={{ background: 'var(--ap-success-soft)', color: 'var(--ap-success)', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 800, textAlign: 'center' }}>
            🎉 Meta atingida! Hora de entregar o reforçador: {reward}!
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="primary" onClick={addToken} disabled={earned >= capacity}>
          + Adicionar Ficha
        </Button>
        <Button variant="ghost" onClick={removeToken} disabled={earned <= 0}>
          - Remover
        </Button>
        <Button variant="ghost" onClick={() => setEarned(0)}>
          Zerar Quadro
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
 * 5. Análise de Tarefa (Chaining)
 * ------------------------------------------------------------ */
function TaskAnalysisTool() {
  const stepsHands = [
    '1. Abrir a torneira',
    '2. Molhar as mãos com água corrente',
    '3. Aplicar sabão líquido nas palmas',
    '4. Esfregar palmas, dorso e entre os dedos por 10s',
    '5. Enxaguar as mãos retirando todo o sabão',
    '6. Fechar a torneira com o cotovelo ou papel',
    '7. Secar bem as mãos na toalha',
  ];

  const [scores, setScores] = useState<Record<number, string>>({
    0: 'I', 1: 'I', 2: 'DV', 3: 'DG', 4: 'I', 5: 'DV', 6: 'I'
  });

  const promptTypes = [
    { code: 'I', label: 'Independente (Sem dica)' },
    { code: 'DV', label: 'Dica Verbal' },
    { code: 'DG', label: 'Dica Gestual' },
    { code: 'DF', label: 'Dica Física' },
  ];

  const independentCount = Object.values(scores).filter((v) => v === 'I').length;
  const pct = Math.round((independentCount / stepsHands.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong style={{ fontSize: 'var(--ap-text-md)' }}>Habilidade: Lavar as Mãos Autonomamente</strong>
          <p className="ap-small ap-muted" style={{ margin: 0 }}>Encadeamento para Frente · Registro de Sondagem</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ap-primary)' }}>{pct}%</div>
          <span className="ap-xs ap-muted">{independentCount} de {stepsHands.length} passos independentes</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {stepsHands.map((step, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--ap-surface-sunken)', borderRadius: '12px' }}>
            <span style={{ fontSize: 'var(--ap-text-sm)', fontWeight: 600 }}>{step}</span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {promptTypes.map((p) => (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => setScores((prev) => ({ ...prev, [idx]: p.code }))}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: '1px solid var(--ap-border)',
                    background: scores[idx] === p.code ? (p.code === 'I' ? 'var(--ap-success)' : 'var(--ap-primary)') : 'var(--ap-surface)',
                    color: scores[idx] === p.code ? '#fff' : 'var(--ap-text-muted)',
                    cursor: 'pointer',
                  }}
                  title={p.label}
                >
                  {p.code}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
 * 6. História Social Interativa
 * ------------------------------------------------------------ */
function SocialStoryTool() {
  const pages = [
    {
      page: 1,
      title: 'Quando estou brincando com amigos',
      text: 'Na escola e na clínica, muitas vezes quero o mesmo brinquedo que o meu amigo está usando.',
      emoji: '🧸',
    },
    {
      page: 2,
      title: 'Todos têm a sua vez',
      text: 'O meu amigo fica feliz quando pode brincar um pouco. Esperar a minha vez mostra que eu respeito os meus amigos.',
      emoji: '⏳',
    },
    {
      page: 3,
      title: 'O que posso fazer enquanto espero',
      text: 'Posso respirar fundo, olhar o timer visual, ou escolher outro brinquedo divertido para brincar junto.',
      emoji: '🎨',
    },
    {
      page: 4,
      title: 'Minha vez chegou!',
      text: 'Quando o tempo acaba ou o amigo termina, é a minha vez de brincar. Todos se divertem juntos!',
      emoji: '⭐',
    },
  ];

  const [page, setPage] = useState(0);
  const current = pages[page]!;

  const playSpeech = () => {
    void speak(`${current.title}. ${current.text}`, 'normal');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
      <div style={{ background: 'var(--ap-surface-sunken)', border: '2px solid var(--ap-border)', borderRadius: '20px', padding: '2rem', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '64px' }}>{current.emoji}</div>
        <h3 style={{ margin: 0, fontSize: '1.35rem' }}>{current.title}</h3>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '480px', margin: 0, color: 'var(--ap-text)' }}>
          {current.text}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>
          Anterior
        </Button>
        <span className="ap-small ap-muted">Página {page + 1} de {pages.length}</span>
        <Button variant="ghost" disabled={page === pages.length - 1} onClick={() => setPage(page + 1)}>
          Próxima
        </Button>
      </div>

      <Button variant="primary" onClick={playSpeech}>
        🔊 Ouvir Narração da Página
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------
 * 7. Prancha de Escolha Direta
 * ------------------------------------------------------------ */
function ChoiceBoardTool() {
  const [selected, setSelected] = useState<string | null>(null);

  const choices = [
    { id: 'bola', label: 'Bola', emoji: '⚽' },
    { id: 'carro', label: 'Carrinho', emoji: '🚗' },
    { id: 'blocos', label: 'Blocos de Montar', emoji: '🧱' },
    { id: 'massinha', label: 'Massinha', emoji: '🧁' },
  ];

  const handlePick = (item: { id: string; label: string }) => {
    setSelected(item.id);
    playTones([{ freq: 523.25, dur: 0.15, type: 'sine' }], 'normal');
    void speak(`Você escolheu: ${item.label}`, 'normal');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
      <p className="ap-small ap-muted" style={{ margin: 0 }}>Toque na opção desejada. Retorno sonoro imediato de confirmação.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', width: '100%', maxWidth: '440px' }}>
        {choices.map((c) => {
          const is = selected === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handlePick(c)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                aspectRatio: '1',
                borderRadius: '24px',
                border: is ? '4px solid var(--ap-primary)' : '2px solid var(--ap-border-strong)',
                background: is ? 'var(--ap-primary-soft)' : 'var(--ap-surface)',
                cursor: 'pointer',
                transform: is ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.15s ease',
              }}
              aria-pressed={is}
            >
              <span style={{ fontSize: '48px' }}>{c.emoji}</span>
              <strong style={{ fontSize: 'var(--ap-text-md)', color: is ? 'var(--ap-primary)' : 'var(--ap-text)' }}>{c.label}</strong>
            </button>
          );
        })}
      </div>
      {selected && (
        <Button variant="ghost" onClick={() => setSelected(null)}>
          Limpar Escolha
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------
 * 8. Prancha de Comunicação (PECS / CAA)
 * ------------------------------------------------------------ */
function CommunicationBoardTool() {
  const [strip, setStrip] = useState<string[]>(['Eu quero']);

  const items = [
    { label: 'Água', emoji: '💧' },
    { label: 'Maçã', emoji: '🍎' },
    { label: 'Bolha de sabão', emoji: '🫧' },
    { label: 'Tablet', emoji: '📱' },
    { label: 'Música', emoji: '🎵' },
    { label: 'Banheiro', emoji: '🚻' },
    { label: 'Pausa', emoji: '✋' },
    { label: 'Ajuda', emoji: '🆘' },
  ];

  const add = (label: string) => {
    setStrip((prev) => [...prev, label]);
    playTones([{ freq: 659.25, dur: 0.1, type: 'sine' }], 'normal');
  };

  const speakSentence = () => {
    const text = strip.join(' ');
    void speak(text, 'normal');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Tira de Sentença */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', background: 'var(--ap-surface-sunken)', borderRadius: '16px', border: '2px solid var(--ap-border-strong)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {strip.map((s, idx) => (
            <span key={idx} style={{ background: 'var(--ap-surface)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid var(--ap-border)', fontWeight: 700, fontSize: 'var(--ap-text-sm)' }}>
              {s}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="primary" size="sm" onClick={speakSentence}>
            🔊 Falar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStrip(['Eu quero'])}>
            Limpar
          </Button>
        </div>
      </div>

      {/* Grade de Pictogramas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {items.map((it) => (
          <button
            key={it.label}
            type="button"
            onClick={() => add(it.label)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.85rem 0.5rem',
              borderRadius: '16px',
              border: '1px solid var(--ap-border)',
              background: 'var(--ap-surface)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '32px' }}>{it.emoji}</span>
            <span style={{ fontSize: '12px', fontWeight: 700 }}>{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
 * 9. Semáforo de Regulação (Zones of Regulation)
 * ------------------------------------------------------------ */
function ZonesTool() {
  const [zone, setZone] = useState<'green' | 'yellow' | 'red' | 'blue'>('green');

  const zoneData = {
    green: {
      name: 'Zona Verde',
      state: 'Calmo, Focado, Pronto para aprender',
      strategies: ['Manter o ritmo da atividade', 'Reforçar positivamente o engajamento', 'Oferecer elogio específico'],
      say: 'Você está na Zona Verde! Pronto e calmo.',
    },
    yellow: {
      name: 'Zona Amarela',
      state: 'Agitado, Ansioso, Frustrado, Inquieto',
      strategies: ['Fazer 3 respirações lentas', 'Beber água gelada', 'Fazer uma pausa de 2 minutos'],
      say: 'Zona Amarela. Vamos fazer uma respiração para nos acalmar.',
    },
    red: {
      name: 'Zona Vermelha',
      state: 'Explosivo, Crise, Muito bravo, Fora de controle',
      strategies: ['Reduzir estímulos (luz e som)', 'Retirar demandas imediatas', 'Oferecer espaço seguro e aconchegante'],
      say: 'Zona Vermelha. Espaço seguro e respiração. Eu estou aqui com você.',
    },
    blue: {
      name: 'Zona Azul',
      state: 'Cansado, Triste, Doente ou Desanimado',
      strategies: ['Alongar os braços devagar', 'Lavar o rosto com água fresca', 'Música calma e acolhimento'],
      say: 'Zona Azul. Está tudo bem descansar um pouco.',
    },
  };

  const current = zoneData[zone];

  const select = (z: 'green' | 'yellow' | 'red' | 'blue') => {
    setZone(z);
    void speak(zoneData[z].say, 'normal');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <p className="ap-small ap-muted" style={{ margin: 0 }}>Como você está se sentindo agora? Escolha a cor que melhor combina com o seu corpo:</p>
      <div className="rs-zones-grid">
        {(['green', 'yellow', 'red', 'blue'] as const).map((z) => (
          <button
            key={z}
            type="button"
            className="rs-zone-btn"
            data-zone={z}
            aria-pressed={zone === z}
            onClick={() => select(z)}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'currentColor' }} />
            <strong style={{ fontSize: 'var(--ap-text-sm)' }}>{zoneData[z].name}</strong>
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--ap-surface-sunken)', border: '1px solid var(--ap-border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <strong style={{ fontSize: 'var(--ap-text-md)' }}>{current.name}: {current.state}</strong>
        </div>
        <div>
          <span className="ap-xs ap-muted" style={{ fontWeight: 700 }}>ESTRATÉGIAS DE REGULAÇÃO IMEDIATAS:</span>
          <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: 'var(--ap-text-sm)' }}>
            {current.strategies.map((st, i) => (
              <li key={i}>{st}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
 * 10. Termômetro Emocional (5 Pontos)
 * ------------------------------------------------------------ */
function FeelingsThermometerTool() {
  const [level, setLevel] = useState(2);

  const levels = [
    { lvl: 1, label: '1. Muito Relaxado e Contente', desc: 'Corpo solto, sorriso no rosto.', color: '#4caf50' },
    { lvl: 2, label: '2. Bem / Tudo Tranquilo', desc: 'Consigo ouvir, conversar e participar.', color: '#8bc34a' },
    { lvl: 3, label: '3. Começando a Incomodar', desc: 'Músculos ficando tensos, voz acelerada.', color: '#ffc107' },
    { lvl: 4, label: '4. Bravo / Muito Frustrado', desc: 'Vontade de gritar ou fugir da atividade.', color: '#ff9800' },
    { lvl: 5, label: '5. Em Crise / Desregulado', desc: 'Perda de controle, precisa de pausa urgente.', color: '#f44336' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p className="ap-small ap-muted" style={{ margin: 0 }}>Escala de 5 Pontos de Buron & Curtis. Graduação de intensidade emocional:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {[...levels].reverse().map((l) => {
          const is = level === l.lvl;
          return (
            <button
              type="button"
              key={l.lvl}
              onClick={() => setLevel(l.lvl)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: is ? `3px solid ${l.color}` : '1px solid var(--ap-border)',
                background: is ? 'var(--ap-surface)' : 'var(--ap-surface-sunken)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: '100%',
                textAlign: 'left',
                font: 'inherit',
              }}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: l.color, flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: 'var(--ap-text-sm)', color: is ? 'var(--ap-text)' : 'var(--ap-text-muted)' }}>{l.label}</strong>
                <p className="ap-xs ap-muted" style={{ margin: 0 }}>{l.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
 * 11. Rotina Visual com Checklist
 * ------------------------------------------------------------ */
function VisualRoutineTool() {
  const [tasks, setTasks] = useState([
    { id: '1', name: 'Acordar e esticar o corpo', done: true },
    { id: '2', name: 'Trocar o pijama pela roupa', done: true },
    { id: '3', name: 'Tomar café da manhã', done: true },
    { id: '4', name: 'Escovar os dentes', done: false },
    { id: '5', name: 'Colocar o tênis e pegar a mochila', done: false },
  ]);

  const toggle = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    playTones([{ freq: 587.33, dur: 0.1, type: 'sine' }], 'normal');
  };

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Rotina da Manhã</strong>
        <span className="ap-small ap-muted">{doneCount} de {tasks.length} concluídas</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tasks.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => toggle(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: '1px solid var(--ap-border)',
              background: t.done ? 'var(--ap-success-soft)' : 'var(--ap-surface)',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              font: 'inherit',
            }}
          >
            <input type="checkbox" checked={t.done} readOnly style={{ width: '20px', height: '20px' }} />
            <span style={{ textDecoration: t.done ? 'line-through' : 'none', fontWeight: 600 }}>{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
 * 12. Contador de Frequência & Registro ABC
 * ------------------------------------------------------------ */
function BehaviorCounterTool() {
  const [count, setCount] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [abcLog, setAbcLog] = useState<Array<{ a: string; b: string; c: string; time: string }>>([]);

  const [ant, setAnt] = useState('Demanda verbal');
  const [beh, setBeh] = useState('Grito / Vocalização alta');
  const [con, setCon] = useState('Pausa concedida');

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsedSecs(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [startTime]);

  const addCount = () => {
    setCount((c) => c + 1);
    playTones([{ freq: 659.25, dur: 0.08, type: 'sine' }], 'normal');
  };

  const addAbc = () => {
    const now = new Date().toLocaleTimeString('pt-BR');
    setAbcLog((prev) => [{ a: ant, b: beh, c: con, time: now }, ...prev]);
    setCount((c) => c + 1);
    playTones([{ freq: 440, dur: 0.1, type: 'sine' }], 'normal');
  };

  const ratePerMin = elapsedSecs > 0 ? ((count / elapsedSecs) * 60).toFixed(1) : '0.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="rs-counter-box">
        <Button variant="ghost" onClick={() => setCount((c) => Math.max(0, c - 1))} disabled={count === 0} aria-label="Subtrair 1">
          - 1
        </Button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="rs-counter-value">{count}</span>
          <span className="rs-counter-rate">Taxa: {ratePerMin} / minuto ({elapsedSecs}s)</span>
        </div>
        <Button variant="primary" size="lg" onClick={addCount} aria-label="Adicionar 1">
          + 1 Ocorrência
        </Button>
      </div>

      <div style={{ background: 'var(--ap-surface-sunken)', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <strong>Registro Rápido de Tríplice Contingência (ABC)</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          <label className="ap-field">
            <span className="ap-label">Antecedente (A):</span>
            <select className="ap-select" value={ant} onChange={(e) => setAnt(e.target.value)}>
              <option value="Demanda verbal">Demanda verbal</option>
              <option value="Transição de tarefa">Transição de tarefa</option>
              <option value="Atenção dividida">Atenção dividida</option>
              <option value="Item retirado">Item retirado</option>
            </select>
          </label>
          <label className="ap-field">
            <span className="ap-label">Comportamento (B):</span>
            <select className="ap-select" value={beh} onChange={(e) => setBeh(e.target.value)}>
              <option value="Grito / Vocalização alta">Grito / Vocalização</option>
              <option value="Fuga da cadeira / local">Fuga do local</option>
              <option value="Agressão a outro">Agressão</option>
              <option value="Auto-lesivo leve">Auto-lesivo</option>
            </select>
          </label>
          <label className="ap-field">
            <span className="ap-label">Consequência (C):</span>
            <select className="ap-select" value={con} onChange={(e) => setCon(e.target.value)}>
              <option value="Pausa concedida">Pausa concedida</option>
              <option value="Bloqueio motor">Bloqueio motor</option>
              <option value="Atenção verbal fornecida">Atenção fornecida</option>
              <option value="Item devolvido">Item devolvido</option>
            </select>
          </label>
        </div>
        <Button variant="default" onClick={addAbc} style={{ alignSelf: 'flex-start' }}>
          + Gravar Evento ABC
        </Button>
      </div>

      {abcLog.length > 0 && (
        <div>
          <span className="ap-xs ap-muted" style={{ fontWeight: 700 }}>HISTÓRICO RECENTE:</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
            {abcLog.slice(0, 3).map((ev, i) => (
              <div key={i} style={{ fontSize: '12px', background: 'var(--ap-surface)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--ap-border)' }}>
                <strong>[{ev.time}]</strong> A: {ev.a} → B: {ev.b} → C: {ev.c}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
