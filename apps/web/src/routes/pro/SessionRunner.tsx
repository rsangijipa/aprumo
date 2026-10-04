import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { summarizeTargetSession } from '@aprumo/clinical-core';
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig, type TargetConfig } from '@aprumo/protocol';
import { STIMULUS_ART, STIMULUS_KEYS, StimulusArt, instructionFor } from '@aprumo/stimuli';
import {
  Button,
  Dialog,
  IconCheck,
  IconChevronLeft,
  IconMinus,
  IconNote,
  IconSpark,
  IconStop,
  IconTablet,
  IconX,
  ModelBadge,
  PhaseBadge,
  Segmented,
} from '@aprumo/ui';
import { actions, db, getState, outbox, useStore } from '../../data/store';
import type { Fact, SessionRecord, Target } from '../../data/types';
import { GAMES } from '../../game-host/registry';
import { SyncPill } from './shared';

const PLANNED: Record<string, number> = { baseline: 3, acquisition: 10, maintenance: 5, generalization: 5 };
const DAY = 86_400_000;

function useElapsed(since: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const s = Math.max(0, Math.floor((now - Date.parse(since)) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function SessionRunner() {
  const { sessionId = '' } = useParams();
  const session = useStore((s) => s.sessions.find((x) => x.id === sessionId));
  if (!session) return <p style={{ padding: '2rem' }}>Sessão não encontrada. <Link to="/app">Voltar</Link></p>;
  return session.model === 'ABA' ? <AbaRunner session={session} /> : <DenverRunner session={session} />;
}

/* ================================================================ barra superior */
function RunnerBar({ session, onEnd, children }: { session: SessionRecord; onEnd: () => void; children?: ReactNode }) {
  const c = db.caseById(session.caseId)!;
  const child = db.childOf(c);
  const elapsed = useElapsed(session.startedAt);
  return (
    <header className="runner__bar">
      <Link to={`/app/casos/${c.id}`} className="ap-btn ap-btn--ghost ap-btn--icon" aria-label="Voltar ao caso"><IconChevronLeft /></Link>
      <strong style={{ fontSize: 'var(--ap-text-lg)' }}>{child.preferredName}</strong>
      <ModelBadge model={c.model} />
      <span className="runner__timer" aria-label={`Tempo de sessão ${elapsed}`}>{elapsed}</span>
      {session.status === 'completed' && <span className="ap-badge ap-badge--success">Sessão encerrada</span>}
      <div className="ap-row" style={{ marginLeft: 'auto' }}>
        {children}
        <SyncPill />
        {session.status === 'active' && <Button variant="danger" icon={<IconStop />} onClick={onEnd}><span className="hide-sm">Encerrar sessão</span><span className="show-sm">Encerrar</span></Button>}
      </div>
    </header>
  );
}

/* ================================================================ ABA */
function AbaRunner({ session }: { session: SessionRecord }) {
  const nav = useNavigate();
  const st = useStore((s) => s);
  const c = db.caseById(session.caseId)!;
  const child = db.childOf(c);

  // Sugestão inteligente: alvos com menos oportunidades na semana primeiro (regra R12).
  const targets = useMemo(() => {
    const active = st.targets.filter((t) => t.caseId === c.id && ['baseline', 'acquisition', 'maintenance', 'generalization'].includes(t.phase));
    const weekly = (t: Target) => st.facts.filter((f) => f.targetId === t.id && Date.now() - Date.parse(f.sessionAt) < 7 * DAY).length;
    return [...active].sort((a, b) => weekly(a) - weekly(b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.id, st.targets]);

  const [params] = useSearchParams();
  const [currentId, setCurrentId] = useState(params.get('alvo') ?? targets[0]?.id ?? '');
  const current = targets.find((t) => t.id === currentId) ?? targets[0];
  const program = current ? db.programOf(current) : undefined;
  const hierarchy = program ? db.hierarchy(program.promptHierarchyId) : undefined;
  const isProbe = current ? current.phase !== 'acquisition' : false;
  const [prompt, setPrompt] = useState<string>(current?.defaultPrompt ?? 'IND');
  const [ending, setEnding] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [abcFor, setAbcFor] = useState<string | null>(null);
  const [quickNote, setQuickNote] = useState('');
  const [planFor, setPlanFor] = useState<string | null>(null);
  const [reinforcerUse, setReinforcerUse] = useState<Record<string, number>>({});

  useEffect(() => {
    if (current) setPrompt(current.phase === 'acquisition' ? current.defaultPrompt : 'IND');
  }, [current]);

  const sessionFacts = st.facts.filter((f) => f.sessionId === session.id);
  const factsOf = (t: Target) => sessionFacts.filter((f) => f.targetId === t.id);
  const curFacts = current ? factsOf(current) : [];
  const planned = current ? PLANNED[current.phase] ?? 10 : 0;

  const record = async (response: Fact['response']) => {
    if (!current || !hierarchy || session.status !== 'active') return;
    const level = hierarchy.levels.find((l) => l.code === prompt) ?? hierarchy.levels[0]!;
    await actions.recordTrial({
      targetId: current.id, sessionId: session.id, phase: current.phase, response,
      promptIntrusiveness: level.intrusiveness,
      promptCode: level.code, latencyMs: null, channel: 'table', probe: current.phase === 'maintenance' || current.phase === 'generalization',
      art: current.art,
    });
    // Avança para o próximo alvo com tentativas pendentes quando o planejado é atingido (estado mais recente).
    const count = (id: string) => getState().facts.filter((f) => f.sessionId === session.id && f.targetId === id).length;
    if (count(current.id) >= planned) {
      const next = targets.find((t) => t.id !== current.id && count(t.id) < (PLANNED[t.phase] ?? 10));
      if (next) setCurrentId(next.id);
    }
  };

  // Atalhos: 1 correta · 2 incorreta · 3 sem resposta · ← → nível de dica.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ending || launching || abcFor || (e.target as HTMLElement).closest('input, textarea, dialog')) return;
      if (e.key === '1') void record('correct');
      if (e.key === '2') void record('incorrect');
      if (e.key === '3') void record('no_response');
      if (!hierarchy || isProbe) return;
      const idx = hierarchy.levels.findIndex((l) => l.code === prompt);
      if (e.key === 'ArrowRight') setPrompt(hierarchy.levels[Math.min(hierarchy.levels.length - 1, idx + 1)]!.code);
      if (e.key === 'ArrowLeft') setPrompt(hierarchy.levels[Math.max(0, idx - 1)]!.code);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const summary = curFacts.length ? summarizeTargetSession(curFacts) : null;
  const reinforcers = db.reinforcers.filter((r) => r.caseId === c.id).sort((a, b) => a.rank - b.rank).slice(0, 3);
  const behaviors = db.behaviorDefinitions.filter((d) => d.caseId === c.id);
  const sd = current && program ? (program.repertoire === 'listener' ? instructionFor(current.art, current.name) : program.sdTemplate.replace('{alvo}', current.name)) : '';

  return (
    <div className="runner">
      <RunnerBar session={session} onEnd={() => setEnding(true)}>
        {session.status === 'active' && program && program.compatibleApps.length > 0 && db.screenPolicy(child.birthDate).childPortalAllowed && (
          <Button icon={<IconTablet />} onClick={() => setLaunching(true)}><span className="hide-sm">Atividade no tablet</span><span className="show-sm">Tablet</span></Button>
        )}
      </RunnerBar>

      <div className="runner__body">
        {/* Alvos */}
        <nav className="runner__col runner__targets" aria-label="Alvos da sessão">
          <p className="ap-xs ap-muted ap-row" style={{ gap: '0.35rem', marginBottom: '0.5rem' }}>
            <IconSpark style={{ width: 14, color: 'var(--ap-accent-text)' }} /> Ordem sugerida: menos oportunidades na semana primeiro
          </p>
          {targets.map((t) => {
            const n = factsOf(t).length;
            return (
              <button key={t.id} className="target-pick" aria-current={t.id === current?.id} onClick={() => setCurrentId(t.id)}>
                <span className="target-pick__thumb"><StimulusArt art={t.art} label={t.name} /></span>
                <span style={{ minWidth: 0 }}>
                  <span className="ap-small" style={{ fontWeight: 700, display: 'block' }}>{t.name}</span>
                  <span className="ap-xs ap-muted">{db.programOf(t).name}</span>
                </span>
                <span className="target-pick__count">{n}/{PLANNED[t.phase] ?? 10}</span>
              </button>
            );
          })}
        </nav>

        {/* Centro: tentativa atual */}
        <main className="runner__center" id="main">
          {current && program && hierarchy ? (
            <section className="trial-card" aria-labelledby="trial-title">
              <div className="ap-row" style={{ gap: '1.25rem', flexWrap: 'nowrap' }}>
                <div className="trial-stim"><StimulusArt art={current.art} label={current.name} /></div>
                <div className="ap-stack" style={{ gap: '0.35rem', minWidth: 0 }}>
                  <div className="ap-row" style={{ gap: '0.5rem' }}>
                    <PhaseBadge phase={current.phase} />
                    <span className="ap-xs ap-muted">{program.name}</span>
                  </div>
                  <h1 id="trial-title" className="trial-sd">“{sd}”</h1>
                  <p className="ap-small ap-muted">{program.operationalDefinition}</p>
                </div>
              </div>

              <div className="ap-stack" style={{ gap: '0.5rem' }}>
                <div className="ap-row" style={{ justifyContent: 'space-between' }}>
                  <span className="ap-label">Nível de dica {isProbe && <span className="ap-badge" style={{ marginLeft: 6 }}>sonda: sem dica</span>}</span>
                  <span className="ap-xs ap-muted">{hierarchy.name}</span>
                </div>
                <div className="prompt-seg" role="group" aria-label="Nível de dica">
                  {hierarchy.levels.map((l) => (
                    <button key={l.code} type="button" aria-pressed={prompt === l.code} disabled={isProbe && l.code !== 'IND'} onClick={() => setPrompt(l.code)}>
                      <strong>{l.code}</strong><span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="response-grid">
                <button className="response-btn response-btn--correct" onClick={() => void record('correct')} disabled={session.status !== 'active'}>
                  <IconCheck /> Correta <small>{prompt === 'IND' ? 'independente' : `com ${prompt}`} · tecla 1</small>
                </button>
                <button className="response-btn response-btn--incorrect" onClick={() => void record('incorrect')} disabled={session.status !== 'active'}>
                  <IconX /> Incorreta <small>tecla 2</small>
                </button>
                <button className="response-btn response-btn--none" onClick={() => void record('no_response')} disabled={session.status !== 'active'}>
                  <IconMinus /> Sem resposta <small>tecla 3</small>
                </button>
              </div>

              <div className="ap-stack" style={{ gap: '0.5rem' }}>
                <div className="ap-row" style={{ justifyContent: 'space-between' }}>
                  <span className="ap-label">Tentativas {curFacts.length} de {planned}</span>
                  {summary && (
                    <span className="ap-small ap-tabular">
                      <strong>{Math.round(summary.pctIndependent ?? 0)}%</strong> independente · {Math.round(summary.pctPrompted ?? 0)}% com dica · n = {summary.opportunities}
                    </span>
                  )}
                </div>
                <div className="trial-strip" aria-label="Tentativas desta sessão">
                  {Array.from({ length: Math.max(planned, curFacts.length) }, (_, k) => {
                    const f = curFacts[k];
                    if (!f) return <span key={k} className="trial-dot trial-dot--empty" aria-hidden="true" />;
                    const cls = f.response === 'correct' ? (f.promptIntrusiveness === 0 ? 'c' : 'p') : f.response === 'incorrect' ? 'i' : 'n';
                    const sym = cls === 'c' ? '✓' : cls === 'p' ? f.promptCode : cls === 'i' ? '✕' : '–';
                    const lbl = { c: 'correta independente', p: `correta com ${f.promptCode}`, i: 'incorreta', n: 'sem resposta' }[cls];
                    return <span key={f.id} className={`trial-dot trial-dot--${cls}`} title={`${lbl}${f.channel === 'digital' ? ' (jogo)' : ''}`} aria-label={`Tentativa ${k + 1}: ${lbl}`}>{sym}</span>;
                  })}
                </div>
                <p className="ap-xs ap-muted">Acerto com dica é registrado e graficado separadamente: nunca conta como independente.</p>
              </div>
            </section>
          ) : (
            <p className="ap-muted">Nenhum alvo ativo neste plano.</p>
          )}
        </main>

        {/* Painel lateral */}
        <aside className="runner__col runner__side ap-stack" aria-label="Reforçadores, comportamento e notas" style={{ alignContent: 'start' }}>
          <section className="ap-stack" style={{ gap: '0.5rem' }}>
            <h2 className="ap-label">Reforçadores (preferência válida)</h2>
            {reinforcers.map((r) => (
              <button key={r.id} className="quick-btn" onClick={() => {
                setReinforcerUse((u) => ({ ...u, [r.id]: (u[r.id] ?? 0) + 1 }));
                const at = new Date().toISOString();
                void outbox?.enqueue({ clientEventId: `rd-${crypto.randomUUID()}`, stream: session.id, kind: 'reinforcer_delivery', createdAt: at, payload: { reinforcerId: r.id, at } });
              }}>
                <span>{r.rank}. {r.name}</span><b>{reinforcerUse[r.id] ?? 0}</b>
              </button>
            ))}
            <p className="ap-xs ap-muted">Cada entrega é registrada para detectar saciação (R10).</p>
          </section>

          <section className="ap-stack" style={{ gap: '0.5rem' }}>
            <h2 className="ap-label">Comportamento</h2>
            {behaviors.map((d) => {
              const n = st.behaviorEvents.filter((e) => e.sessionId === session.id && e.definitionId === d.id).length;
              return (
                <div key={d.id} className="ap-row" style={{ gap: '0.4rem', flexWrap: 'nowrap' }}>
                  <button className="quick-btn" style={d.risk ? { borderColor: 'var(--ap-danger)' } : undefined} onClick={() => { void actions.recordBehavior(session.id, d.id); setPlanFor(d.id); }} title={d.topography}>
                    <span>{d.name}{d.risk ? ' · risco' : ''}</span><b>{n}</b>
                  </button>
                  <Button size="sm" onClick={() => setAbcFor(d.id)}>ABC</Button>
                </div>
              );
            })}
            {planFor && (() => {
              const d = behaviors.find((x) => x.id === planFor);
              if (!d?.plan) return null;
              return (
                <div className="runner-plan" role="status">
                  <div className="ap-row" style={{ justifyContent: 'space-between' }}>
                    <strong className="ap-small">Plano de manejo · {d.name}</strong>
                    <button type="button" className="ap-dialog__close" aria-label="Fechar plano" onClick={() => setPlanFor(null)}><IconX /></button>
                  </div>
                  {d.plan.safetyProtocol && <p className="runner-plan__safety"><b>Segurança:</b> {d.plan.safetyProtocol}</p>}
                  <p><b>Agora:</b> {d.plan.consequences}</p>
                  <p><b>Ensinar no lugar:</b> {d.plan.replacementBehavior}</p>
                </div>
              );
            })()}
          </section>

          <section className="ap-stack" style={{ gap: '0.5rem' }}>
            <label className="ap-label ap-row" style={{ gap: '0.4rem' }} htmlFor="qn"><IconNote style={{ width: 16 }} /> Notas rápidas</label>
            <textarea id="qn" className="ap-textarea" style={{ minHeight: 90 }} value={quickNote} onChange={(e) => setQuickNote(e.target.value)} placeholder="Observações para a nota clínica…" />
          </section>
        </aside>
      </div>

      {launching && current && program && (
        <LaunchDialog session={session} target={current} onClose={() => setLaunching(false)} onLaunch={() => nav(`/crianca/${session.id}`)} />
      )}
      <AbcDialog sessionId={session.id} definitionId={abcFor} onClose={() => setAbcFor(null)} />
      <EndDialog open={ending} session={session} initialNote={quickNote} onClose={() => setEnding(false)} onDone={() => nav(`/app/casos/${c.id}/sessoes`)} />
    </div>
  );
}

/* ================================================================ lançar atividade */
function LaunchDialog({ session, target, onClose, onLaunch }: { session: SessionRecord; target: Target; onClose: () => void; onLaunch: () => void }) {
  const c = db.caseById(session.caseId)!;
  const child = db.childOf(c);
  const program = db.programOf(target);
  const policy = db.screenPolicy(child.birthDate);
  const games = program.compatibleApps.filter((a) => GAMES[a]);
  const [appId, setAppId] = useState(games[0] ?? '');
  const [trials, setTrials] = useState(program.repertoire === 'social' ? 5 : 5);
  const [withSiblings, setWithSiblings] = useState(true);
  const [tokens, setTokens] = useState(true);
  const [required, setRequired] = useState(5);
  const reinforcers = db.reinforcers.filter((r) => r.caseId === c.id).sort((a, b) => a.rank - b.rank);
  const [rewardId, setRewardId] = useState(reinforcers[0]?.id ?? '');
  const todayMin = Math.round(getState().sessions.filter((s) => s.caseId === c.id && s.startedAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).reduce((a, s) => a + s.screenSeconds, 0) / 60);
  const overLimit = todayMin >= policy.dailyLimitMinutes;
  const [justification, setJustification] = useState('');

  const launch = () => {
    const manifest = GAMES[appId]!.manifest;
    const h = db.hierarchy(program.promptHierarchyId);
    const siblings = withSiblings ? getState().targets.filter((t) => t.programId === program.id && t.id !== target.id && t.phase === 'acquisition') : [];
    const caseArts = new Set(getState().targets.filter((t) => t.caseId === c.id).map((t) => t.art));
    const fillers = STIMULUS_KEYS.filter((k) => !caseArts.has(k));
    const toConfig = (t: Target): TargetConfig => {
      const others = [...getState().targets.filter((x) => x.caseId === c.id && x.art !== t.art && x.programId === program.id).map((x) => x.art), ...fillers];
      const distractors = [...new Set(others)].filter((k) => k !== t.art).slice(0, 5);
      return {
        targetId: t.id, name: t.name, phase: t.phase, repertoire: program.repertoire,
        fieldSize: Math.min(3, c.adaptation.maxChoices),
        stimulus: { stimulusId: `stm-${t.art}`, label: STIMULUS_ART[t.art]?.label ?? t.name, art: t.art },
        distractors: distractors.map((k) => ({ stimulusId: `stm-${k}`, label: STIMULUS_ART[k]!.label, art: k })),
        promptHierarchy: h.levels,
        scoring: manifest.clinical.autoScoring.includes(program.repertoire) ? 'auto' : 'therapist',
      };
    };
    const config: SessionConfig = {
      protocolVersion: PROTOCOL_VERSION, runId: `run-${crypto.randomUUID()}`, appId, appVersion: manifest.version,
      childDisplayName: child.preferredName,
      clinical: { model: 'ABA', targets: [target, ...siblings].map(toConfig), trialsPerTarget: trials, interleave: siblings.length > 0, seed: Math.floor(Math.random() * 2 ** 31) },
      adaptation: { ...DEFAULT_ADAPTATION, ...c.adaptation, screenBudgetSec: policy.maxBlockMinutes * 60 },
      params: {},
    };
    const reward = reinforcers.find((r) => r.id === rewardId);
    actions.launchRun({
      sessionId: session.id, appId, config, maxBlockMinutes: policy.maxBlockMinutes,
      schedule: [
        { id: 'a1', picto: 'jogo', label: manifest.name },
        ...(tokens && reward ? [{ id: 'a2', picto: reward.category === 'atividade' ? 'bolhas' : 'brincar', label: reward.name }] : []),
        { id: 'a3', picto: 'mesa', label: 'Volta para a mesa' },
      ],
      tokenBoard: tokens && reward ? { theme: c.tokenTheme, required, rewardLabel: reward.name, rewardCategory: reward.category, accessSec: 60, autoOnIndependent: true } : null,
    });
    // Tela cheia exige gesto do usuário: o próprio clique de lançar.
    void document.documentElement.requestFullscreen?.().catch(() => {});
    onLaunch();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Atividade no tablet"
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" icon={<IconTablet />} disabled={!appId || (overLimit && justification.trim().length < 10)} onClick={launch}>Abrir para {child.preferredName}</Button></>}
    >
      <p className="ap-small ap-muted">O jogo recebe só o apelido, os alvos e a adaptação sensorial. Cada tentativa volta para este registro, no canal “jogo”.</p>
      <div className="ap-field">
        <span className="ap-label">Recurso</span>
        <Segmented label="Recurso" value={appId} onChange={setAppId} options={games.map((g) => ({ value: g, label: GAMES[g]!.manifest.name }))} />
      </div>
      <div className="ap-row" style={{ gap: '1rem' }}>
        <label className="ap-field" style={{ flex: 1 }}>
          <span className="ap-label">{program.repertoire === 'social' ? 'Vezes da criança' : 'Tentativas por alvo'}</span>
          <input className="ap-input" type="number" min={1} max={20} value={trials} onChange={(e) => setTrials(Number(e.target.value))} />
        </label>
        <div className="ap-field" style={{ flex: 1 }}>
          <span className="ap-label">Bloco de tela</span>
          <span className="ap-small">até {policy.maxBlockMinutes} min · hoje {todayMin}/{policy.dailyLimitMinutes} min</span>
        </div>
      </div>
      {program.repertoire !== 'social' && (
        <label className="ap-row ap-small" style={{ gap: '0.5rem' }}>
          <input type="checkbox" checked={withSiblings} onChange={(e) => setWithSiblings(e.target.checked)} /> Intercalar com outros alvos em aquisição deste programa
        </label>
      )}
      <fieldset className="ap-stack" style={{ border: '1px solid var(--ap-border)', borderRadius: 12, padding: '0.9rem', gap: '0.6rem' }}>
        <legend className="ap-label" style={{ padding: '0 0.3rem' }}>
          <label className="ap-row" style={{ gap: '0.5rem' }}><input type="checkbox" checked={tokens} onChange={(e) => setTokens(e.target.checked)} /> Quadro de fichas</label>
        </legend>
        {tokens && (
          <div className="ap-row" style={{ gap: '1rem' }}>
            <label className="ap-field" style={{ flex: 1 }}>
              <span className="ap-label">Fichas para a troca</span>
              <input className="ap-input" type="number" min={3} max={10} value={required} onChange={(e) => setRequired(Number(e.target.value))} />
            </label>
            <label className="ap-field" style={{ flex: 2 }}>
              <span className="ap-label">Reforçador escolhido antes</span>
              <select className="ap-select" value={rewardId} onChange={(e) => setRewardId(e.target.value)}>
                {reinforcers.map((r) => <option key={r.id} value={r.id}>{r.rank}. {r.name}</option>)}
              </select>
            </label>
          </div>
        )}
      </fieldset>
      {overLimit && (
        <div className="ap-field">
          <span className="ap-badge ap-badge--warning" style={{ justifySelf: 'start' }}>R13 · limite diário de tela atingido</span>
          <label className="ap-label" htmlFor="just">Justificativa para liberar</label>
          <textarea id="just" className="ap-textarea" value={justification} onChange={(e) => setJustification(e.target.value)} />
        </div>
      )}
    </Dialog>
  );
}

/* ================================================================ ABC */
function AbcDialog({ sessionId, definitionId, onClose }: { sessionId: string; definitionId: string | null; onClose: () => void }) {
  const [a, setA] = useState('');
  const [cq, setCq] = useState('');
  const def = db.behaviorDefinitions.find((d) => d.id === definitionId);
  const ANT = ['Demanda apresentada', 'Transição de atividade', 'Retirada do item preferido', 'Espera', 'Sem atenção do adulto'];
  const CON = ['Redirecionamento', 'Bloqueio', 'Atenção', 'Retirada da demanda', 'Acesso ao item'];
  return (
    <Dialog
      open={!!definitionId}
      onClose={onClose}
      title={`Registro ABC · ${def?.name ?? ''}`}
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={() => { void actions.recordBehavior(sessionId, definitionId!, a || undefined, cq || undefined); setA(''); setCq(''); onClose(); }}>Registrar ocorrência</Button></>}
    >
      <p className="ap-xs ap-muted">Registro descritivo. A hipótese de função é da equipe; o sistema não infere função a partir de correlação.</p>
      <div className="ap-field"><span className="ap-label">Antecedente</span><div className="ap-row" style={{ gap: '0.4rem' }}>{ANT.map((x) => <Button key={x} size="sm" variant={a === x ? 'primary' : 'default'} onClick={() => setA(x)}>{x}</Button>)}</div></div>
      <div className="ap-field"><span className="ap-label">Consequência</span><div className="ap-row" style={{ gap: '0.4rem' }}>{CON.map((x) => <Button key={x} size="sm" variant={cq === x ? 'primary' : 'default'} onClick={() => setCq(x)}>{x}</Button>)}</div></div>
    </Dialog>
  );
}

/* ================================================================ encerramento */
function EndDialog({ open, session, initialNote, onClose, onDone }: { open: boolean; session: SessionRecord; initialNote: string; onClose: () => void; onDone: () => void }) {
  const st = useStore((s) => s);
  const [note, setNote] = useState('');
  const [author, setAuthor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) setNote((n) => n || initialNote); }, [open, initialNote]);
  const facts = st.facts.filter((f) => f.sessionId === session.id);
  const byTarget = [...new Set(facts.map((f) => f.targetId))].map((id) => ({ t: st.targets.find((x) => x.id === id)!, s: summarizeTargetSession(facts.filter((f) => f.targetId === id)) }));
  const behaviors = db.behaviorDefinitions.filter((d) => d.caseId === session.caseId).map((d) => ({ d, n: st.behaviorEvents.filter((e) => e.sessionId === session.id && e.definitionId === d.id).length }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Encerrar sessão"
      footer={
        <>
          <Button onClick={onClose}>Continuar sessão</Button>
          <Button variant="primary" disabled={!author} onClick={() => {
            try { actions.completeSession(session.id, note); onDone(); } catch (e) { setError((e as Error).message); }
          }}>Concluir e assinar</Button>
        </>
      }
    >
      {session.model === 'ABA' && (
        byTarget.length ? (
          <table className="ap-table ap-tabular">
            <thead><tr><th>Alvo</th><th>n</th><th>Indep.</th><th>Com dica</th></tr></thead>
            <tbody>{byTarget.map(({ t, s }) => (<tr key={t.id}><td>{t.name}</td><td>{s.opportunities}</td><td>{Math.round(s.pctIndependent ?? 0)}%</td><td>{Math.round(s.pctPrompted ?? 0)}%</td></tr>))}</tbody>
          </table>
        ) : <p className="ap-small ap-muted">Nenhuma tentativa registrada nesta sessão.</p>
      )}
      <p className="ap-small">
        {behaviors.map(({ d, n }) => `${d.name}: ${n}`).join(' · ') || 'Sem comportamentos definidos.'} · Tela: {Math.round(session.screenSeconds / 60)} min
      </p>
      {st.pendingSync > 0 && <p className="ap-xs" style={{ color: 'var(--ap-warning)' }}>{st.pendingSync} registro(s) ainda aguardando sincronização. Ficam guardados no aparelho e serão enviados assim que houver conexão.</p>}
      <div className="ap-field">
        <label className="ap-label" htmlFor="note">Nota clínica (obrigatória)</label>
        <textarea id="note" className="ap-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Engajamento, condições da sessão, intercorrências, observações sobre o procedimento…" />
      </div>
      <label className="ap-row ap-small" style={{ gap: '0.5rem' }}><input type="checkbox" checked={author} onChange={(e) => setAuthor(e.target.checked)} /> Confirmo a autoria deste registro.</label>
      {error && <p role="alert" className="ap-small" style={{ color: 'var(--ap-danger)' }}>{error}</p>}
    </Dialog>
  );
}

/* ================================================================ Denver */
const ROUTINES = [
  { id: 'sensory_social', label: 'Sensório-social' },
  { id: 'object', label: 'Com objeto' },
  { id: 'snack', label: 'Lanche' },
  { id: 'book', label: 'Livro' },
  { id: 'motor', label: 'Motora' },
  { id: 'self_care', label: 'Cuidado pessoal' },
] as const;
const PHASES = ['Abertura', 'Elaboração', 'Variação', 'Fechamento'] as const;
const INTERVAL_MIN = 15;

function DenverRunner({ session }: { session: SessionRecord }) {
  const nav = useNavigate();
  const c = db.caseById(session.caseId)!;
  const steps = db.denverObjectives.filter((o) => o.caseId === c.id).flatMap((o) => o.steps.filter((s) => s.status === 'acquisition').map((s) => ({ ...s, domain: o.domain })));
  const [routine, setRoutine] = useState<{ type: string; started: number; phases: Set<string>; initiatedBy: 'child' | 'adult' } | null>(null);
  const [routinesDone, setRoutinesDone] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, Record<number, 'pass' | 'partial' | 'fail'>>>({});
  const [ending, setEnding] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  const elapsedMin = (now - Date.parse(session.startedAt)) / 60000;
  const interval = Math.floor(elapsedMin / INTERVAL_MIN);
  const intervalProgress = (elapsedMin % INTERVAL_MIN) / INTERVAL_MIN;
  const pendingInInterval = steps.filter((s) => scores[s.id]?.[interval] == null).length;

  const score = async (stepId: string, value: 'pass' | 'partial' | 'fail') => {
    setScores((sc) => ({ ...sc, [stepId]: { ...sc[stepId], [interval]: value } }));
    await outbox?.enqueue({ clientEventId: `dss-${session.id}-${stepId}-${interval}-${Date.now()}`, stream: session.id, kind: 'denver_step_score', createdAt: new Date().toISOString(), payload: { stepId, interval, value, routine: routine?.type ?? null } });
  };

  return (
    <div className="runner">
      <RunnerBar session={session} onEnd={() => setEnding(true)} />
      <div className="runner__body" style={{ gridTemplateColumns: '280px 1fr' }}>
        <nav className="runner__col" aria-label="Rotinas de atividade conjunta">
          <h2 className="ap-label" style={{ marginBottom: '0.5rem' }}>Rotinas de atividade conjunta</h2>
          <div className="ap-stack" style={{ gap: '0.4rem' }}>
            {ROUTINES.map((r) => (
              <button key={r.id} className="quick-btn" disabled={!!routine} onClick={() => setRoutine({ type: r.id, started: Date.now(), phases: new Set(['Abertura']), initiatedBy: 'child' })}>
                <span>{r.label}</span><b className="ap-xs">{routinesDone.filter((x) => x === r.id).length || ''}</b>
              </button>
            ))}
          </div>
          <p className="ap-xs ap-muted" style={{ marginTop: '0.75rem' }}>A sessão é flexível: siga a liderança da criança e insira a rotina que ela iniciar.</p>
        </nav>

        <main className="runner__center" id="main">
          <section className="trial-card" style={{ borderColor: 'var(--ap-model-denver)' }}>
            <div className="ap-row" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className="ap-label">Intervalo {interval + 1} · registro a cada {INTERVAL_MIN} min</span>
                <div className="progress" style={{ width: 240, marginTop: 6 }}><span style={{ width: `${intervalProgress * 100}%`, background: 'var(--ap-model-denver)' }} /></div>
              </div>
              <span className={`ap-badge ${pendingInInterval ? 'ap-badge--warning' : 'ap-badge--success'}`}>{pendingInInterval ? `${pendingInInterval} passo(s) a pontuar neste intervalo` : 'Intervalo pontuado'}</span>
            </div>

            {routine ? (
              <div className="ap-stack" style={{ gap: '0.6rem' }}>
                <div className="ap-row" style={{ justifyContent: 'space-between' }}>
                  <h1 className="trial-sd">Rotina {ROUTINES.find((r) => r.id === routine.type)?.label.toLowerCase()}</h1>
                  <Segmented label="Quem iniciou" value={routine.initiatedBy} onChange={(v) => setRoutine({ ...routine, initiatedBy: v })} options={[{ value: 'child', label: 'Criança iniciou' }, { value: 'adult', label: 'Adulto iniciou' }]} />
                </div>
                <div className="prompt-seg" role="group" aria-label="Fases observadas da rotina">
                  {PHASES.map((p) => (
                    <button key={p} aria-pressed={routine.phases.has(p)} onClick={() => { const ph = new Set(routine.phases); if (ph.has(p)) ph.delete(p); else ph.add(p); setRoutine({ ...routine, phases: ph }); }}>
                      <strong style={{ fontSize: 'var(--ap-text-sm)' }}>{p}</strong>
                    </button>
                  ))}
                </div>
                <Button onClick={() => { setRoutinesDone((d) => [...d, routine.type]); setRoutine(null); }}>Fechar rotina</Button>
              </div>
            ) : (
              <p className="ap-muted">Escolha uma rotina ao lado quando a brincadeira começar.</p>
            )}
          </section>

          <section className="trial-card">
            <h2 className="ap-label">Passos ativos · desempenho neste intervalo</h2>
            {steps.map((s) => {
              const v = scores[s.id]?.[interval];
              return (
                <div key={s.id} className="ap-row" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--ap-border)', paddingBottom: '0.6rem' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 650 }}>{s.description}</div>
                    <div className="ap-xs ap-muted">{s.domain}</div>
                  </div>
                  <div className="ap-row" style={{ gap: '0.4rem' }}>
                    {([['pass', '+', 'Realizou'], ['partial', '±', 'Parcial'], ['fail', '−', 'Não realizou']] as const).map(([val, sym, lbl]) => (
                      <Button key={val} variant={v === val ? 'primary' : 'default'} onClick={() => void score(s.id, val)} aria-label={`${lbl}: ${s.description}`}>{sym} <span className="ap-xs">{lbl}</span></Button>
                    ))}
                  </div>
                </div>
              );
            })}
            <p className="ap-xs ap-muted">Em caso Denver não existe registro por tentativa discreta. A unidade é o passo, observado em rotina.</p>
          </section>
        </main>
      </div>
      <EndDialog open={ending} session={session} initialNote="" onClose={() => setEnding(false)} onDone={() => nav(`/app/casos/${c.id}/sessoes`)} />
    </div>
  );
}
