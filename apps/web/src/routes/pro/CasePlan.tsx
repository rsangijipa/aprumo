import { useState } from 'react';
import { useParams } from 'react-router';
import { STIMULUS_ART, STIMULUS_KEYS, StimulusArt } from '@aprumo/stimuli';
import { Badge, Button, Card, Dialog, Field, IconCheck, IconInfo, IconLock, IconPlus, PhaseBadge, Segmented, Toast } from '@aprumo/ui';
import { actions, db, useStore } from '../../data/store';
import { DENVER_DOMAINS, PROCEDURE_LABEL, PROGRAM_TEMPLATES, REPERTOIRE_LABEL, type ProgramTemplate } from '../../data/templates';
import type { Program, Target } from '../../data/types';
import { GAMES } from '../../game-host/registry';
import './forms.css';

export default function CasePlan() {
  const { caseId = '' } = useParams();
  const st = useStore((s) => s);
  const c = st.cases.find((x) => x.id === caseId)!;
  const [toast, setToast] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);

  return (
    <div className="ap-stack" style={{ gap: '1.25rem' }}>
      {c.planStatus === 'draft' ? (
        <div className="plan-draft">
          <div>
            <strong>Plano em rascunho</strong>
            <p className="ap-small ap-muted">Inclua {c.model === 'ABA' ? 'objetivos, programas e alvos' : 'objetivos trimestrais e passos'} e aprove para liberar as sessões. Todo alvo novo começa em linha de base.</p>
            {approveError && <p role="alert" className="ap-error">{approveError}</p>}
          </div>
          <Button variant="primary" icon={<IconCheck />} onClick={() => {
            try { actions.approvePlan(caseId); setApproveError(null); setToast('Plano aprovado. As sessões estão liberadas.'); } catch (e) { setApproveError((e as Error).message); }
          }}>Aprovar plano</Button>
        </div>
      ) : (
        <div className="ap-callout">
          <IconLock />
          <p>
            Modelo do caso: <strong>{c.model === 'ABA' ? 'ABA' : 'Modelo Denver'}</strong>, fixo enquanto este plano vigorar. Para mudar, é preciso encerrar o plano
            com justificativa e abrir outro com nova linha de base.
          </p>
        </div>
      )}

      {c.model === 'ABA' ? <AbaPlan caseId={caseId} onDone={setToast} /> : <DenverPlan caseId={caseId} onDone={setToast} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

/* ================================================================ ABA */
function AbaPlan({ caseId, onDone }: { caseId: string; onDone: (m: string) => void }) {
  const st = useStore((s) => s);
  const goals = st.goals.filter((g) => g.caseId === caseId);
  const [goalOpen, setGoalOpen] = useState(false);
  const [programFor, setProgramFor] = useState<string | null>(null);
  const [targetFor, setTargetFor] = useState<Program | null>(null);

  return (
    <>
      <div className="ap-row" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 'var(--ap-text-xl)' }}>Objetivos e programas</h2>
        <Button icon={<IconPlus />} onClick={() => setGoalOpen(true)}>Novo objetivo</Button>
      </div>
      {goals.length === 0 && (
        <Card><p className="ap-muted ap-small">Comece pelos objetivos de longo prazo (por exemplo, “ampliar repertório de mandos”). Depois inclua os programas de ensino e os alvos de cada um.</p></Card>
      )}

      {goals.map((g) => (
        <Card key={g.id} title={<>{g.domain} <span className="ap-muted" style={{ fontWeight: 500 }}>· objetivo de longo prazo</span></>} actions={<Button size="sm" icon={<IconPlus />} onClick={() => setProgramFor(g.id)}>Programa</Button>}>
          <p className="ap-small ap-muted" style={{ marginBottom: '1rem' }}>{g.description}</p>
          <div className="ap-stack">
            {st.programs.filter((p) => p.goalId === g.id).map((p) => {
              const h = db.hierarchy(p.promptHierarchyId);
              const targets = st.targets.filter((t) => t.programId === p.id);
              return (
                <article key={p.id} className="plan-program">
                  <div className="ap-row" style={{ justifyContent: 'space-between' }}>
                    <h3>{p.name}</h3>
                    <div className="ap-row" style={{ gap: '0.4rem' }}>
                      <Badge>{REPERTOIRE_LABEL[p.repertoire]}</Badge>
                      <Badge>{PROCEDURE_LABEL[p.procedure]}</Badge>
                    </div>
                  </div>
                  <dl className="plan-dl">
                    <dt>Definição operacional</dt><dd>{p.operationalDefinition}</dd>
                    <dt>Instrução (SD)</dt><dd>“{p.sdTemplate}”</dd>
                    <dt>Hierarquia de dicas</dt><dd>{h.name}: {h.levels.map((l) => l.code).join(' → ')}</dd>
                    <dt>Correção de erro</dt><dd>{p.errorCorrection}</dd>
                    <dt>Critério de domínio</dt>
                    <dd>≥ {p.masteryPct}% de respostas independentes em 2 sessões seguidas, com no mínimo 10 oportunidades; manutenção em 1, 2 e 4 semanas (≥ 80%).</dd>
                    {p.compatibleApps.length > 0 && (<><dt>Jogos compatíveis</dt><dd>{p.compatibleApps.map((a) => GAMES[a]?.manifest.name ?? a).join(', ')}</dd></>)}
                  </dl>
                  <div className="plan-targets">
                    {targets.map((t) => <TargetChip key={t.id} t={t} />)}
                    <button type="button" className="plan-add-target" onClick={() => setTargetFor(p)}><IconPlus /> Alvo</button>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>
      ))}

      <GoalDialog open={goalOpen} caseId={caseId} onClose={() => setGoalOpen(false)} onDone={() => onDone('Objetivo incluído.')} />
      <ProgramDialog goalId={programFor} caseId={caseId} onClose={() => setProgramFor(null)} onDone={() => onDone('Programa incluído. Agora inclua os alvos.')} />
      <TargetDialog program={targetFor} onClose={() => setTargetFor(null)} onDone={(n) => onDone(`Alvo “${n}” incluído em linha de base.`)} />
    </>
  );
}

function TargetChip({ t }: { t: Target }) {
  return (
    <div className="plan-target">
      <span style={{ width: 34, height: 34 }}><StimulusArt art={t.art} label={t.name} /></span>
      <span className="ap-small" style={{ fontWeight: 650 }}>{t.name}</span>
      <PhaseBadge phase={t.phase} />
    </div>
  );
}

function GoalDialog({ open, caseId, onClose, onDone }: { open: boolean; caseId: string; onClose: () => void; onDone: () => void }) {
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    try { actions.addGoal(caseId, domain, description); setDomain(''); setDescription(''); setError(null); onClose(); onDone(); } catch (e) { setError((e as Error).message); }
  };
  return (
    <Dialog open={open} onClose={onClose} title="Novo objetivo de longo prazo" description="Descreva a mudança esperada em termos observáveis e importantes para a vida da criança."
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={submit}>Incluir objetivo</Button></>}>
      <Field label="Domínio">{(a) => (
        <input id={a.id} className="ap-input" list="domains" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="ex.: Comunicação funcional" />
      )}</Field>
      <datalist id="domains">{[...new Set(PROGRAM_TEMPLATES.map((t) => t.domain))].map((d) => <option key={d} value={d} />)}</datalist>
      <Field label="Descrição" error={error}>{(a) => (
        <textarea id={a.id} aria-invalid={a.invalid} aria-describedby={a.describedBy} className="ap-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ex.: Pedir itens e atividades preferidos usando fala, sinal ou prancha." />
      )}</Field>
    </Dialog>
  );
}

function ProgramDialog({ goalId, caseId, onClose, onDone }: { goalId: string | null; caseId: string; onClose: () => void; onDone: () => void }) {
  const [tpl, setTpl] = useState<ProgramTemplate | null>(null);
  const [form, setForm] = useState<Omit<Program, 'id' | 'caseId' | 'goalId'> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pick = (t: ProgramTemplate) => {
    setTpl(t);
    const { id: _id, domain: _d, ...rest } = t;
    setForm({ ...rest, promptHierarchyId: 'ph-ltm', compatibleApps: Object.values(GAMES).filter((g) => g.manifest.clinical.repertoires.includes(t.repertoire)).map((g) => g.manifest.appId) });
  };
  const close = () => { setTpl(null); setForm(null); setError(null); onClose(); };
  const submit = () => {
    if (!form || !goalId) return;
    try { actions.addProgram({ ...form, caseId, goalId }); close(); onDone(); } catch (e) { setError((e as Error).message); }
  };
  const up = <K extends keyof NonNullable<typeof form>>(k: K, v: NonNullable<typeof form>[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <Dialog open={!!goalId} onClose={close} size="lg" title={form ? 'Ajuste o programa' : 'Novo programa'}
      description={form ? 'O modelo vira uma cópia editável para este caso. A definição operacional é obrigatória.' : 'Escolha um programa-modelo da organização como ponto de partida.'}
      footer={form ? <><Button onClick={() => { setForm(null); setTpl(null); }}>Trocar modelo</Button><Button variant="primary" onClick={submit}>Incluir programa</Button></> : undefined}>
      {!form ? (
        <div className="tpl-grid">
          {PROGRAM_TEMPLATES.map((t) => (
            <button key={t.id} type="button" className="tpl-card" onClick={() => pick(t)}>
              <span className="ap-xs ap-muted">{t.domain}</span>
              <strong>{t.name}</strong>
              <span className="ap-row" style={{ gap: '0.3rem' }}><Badge>{REPERTOIRE_LABEL[t.repertoire]}</Badge><Badge>{PROCEDURE_LABEL[t.procedure]}</Badge></span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <Field label="Nome do programa">{(a) => <input id={a.id} className="ap-input" value={form.name} onChange={(e) => up('name', e.target.value)} />}</Field>
          <div className="form-row">
            <Field label="Procedimento">{(a) => (
              <select id={a.id} className="ap-select" value={form.procedure} onChange={(e) => up('procedure', e.target.value as Program['procedure'])}>
                {Object.entries(PROCEDURE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            )}</Field>
            <Field label="Critério (% independente)">{(a) => <input id={a.id} className="ap-input" type="number" min={50} max={100} value={form.masteryPct} onChange={(e) => up('masteryPct', Number(e.target.value))} />}</Field>
          </div>
          <Field label="Definição operacional" hint="Resposta observável, condição e tempo. Sem ela os dados não sustentam decisão.">{(a) => (
            <textarea id={a.id} aria-describedby={a.describedBy} className="ap-textarea" value={form.operationalDefinition} onChange={(e) => up('operationalDefinition', e.target.value)} />
          )}</Field>
          <Field label="Instrução (SD)" hint="Use {alvo} para inserir o nome do alvo.">{(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" value={form.sdTemplate} onChange={(e) => up('sdTemplate', e.target.value)} />}</Field>
          <Field label="Correção de erro" error={error}>{(a) => <textarea id={a.id} className="ap-textarea" style={{ minHeight: 70 }} value={form.errorCorrection} onChange={(e) => up('errorCorrection', e.target.value)} />}</Field>
          <p className="ap-xs ap-muted">Hierarquia de dicas: menos para mais intrusiva (IND → GES → MOD → FP → FT). {form.compatibleApps.length ? `Jogos compatíveis: ${form.compatibleApps.map((a) => GAMES[a]?.manifest.name).join(', ')}.` : 'Nenhum jogo compatível: aplicação na mesa ou em ambiente natural.'}{tpl ? '' : ''}</p>
        </>
      )}
    </Dialog>
  );
}

function TargetDialog({ program, onClose, onDone }: { program: Program | null; onClose: () => void; onDone: (name: string) => void }) {
  const [art, setArt] = useState('');
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<Target['teachingChannel']>('table');
  const [error, setError] = useState<string | null>(null);
  const close = () => { setArt(''); setName(''); setError(null); onClose(); };
  const submit = () => {
    if (!program) return;
    if (!art) return setError('Escolha o estímulo.');
    try { actions.addTarget(program.id, name || STIMULUS_ART[art]!.label, art, channel); onDone(name || STIMULUS_ART[art]!.label); close(); } catch (e) { setError((e as Error).message); }
  };
  return (
    <Dialog open={!!program} onClose={close} title="Novo alvo" description={program ? `Programa: ${program.name}. O alvo começa em linha de base (3 sondas sem dica).` : undefined}
      footer={<><Button onClick={close}>Cancelar</Button><Button variant="primary" onClick={submit}>Incluir alvo</Button></>}>
      <div className="ap-field">
        <span className="ap-label">Estímulo</span>
        <div className="stim-grid" role="group" aria-label="Estímulos">
          {STIMULUS_KEYS.map((k) => (
            <button key={k} type="button" aria-pressed={art === k} onClick={() => { setArt(k); setError(null); }}>
              <StimulusArt art={k} label={STIMULUS_ART[k]!.label} />
              {STIMULUS_ART[k]!.label}
            </button>
          ))}
        </div>
        <span className="ap-hint">O mesmo estímulo é usado na mesa e nos jogos, para comparar canais. Fotos próprias entram com consentimento de imagem.</span>
      </div>
      <Field label="Nome do alvo (opcional)" hint="Se vazio, usa o nome do estímulo.">{(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" value={name} onChange={(e) => setName(e.target.value)} />}</Field>
      <div className="ap-field">
        <span className="ap-label">Canal de ensino</span>
        <Segmented label="Canal de ensino" value={channel} onChange={setChannel} options={[{ value: 'table', label: 'Mesa' }, { value: 'digital', label: 'Jogo' }, { value: 'natural', label: 'Natural' }]} />
        {channel === 'digital' && <span className="ap-hint">Alvos ensinados no jogo exigem sondas fora da tela antes da conclusão (regra R6).</span>}
      </div>
      {error && <p role="alert" className="form-error">{error}</p>}
    </Dialog>
  );
}

/* ================================================================ Denver */
function DenverPlan({ caseId, onDone }: { caseId: string; onDone: (m: string) => void }) {
  const st = useStore((s) => s);
  const cycle = st.denverCycles.find((d) => d.caseId === caseId);
  const objectives = st.denverObjectives.filter((o) => o.caseId === caseId);
  const [objOpen, setObjOpen] = useState(false);
  const [mastering, setMastering] = useState<{ objectiveId: string; stepId: string; description: string } | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      {cycle && (
        <div className="ap-callout" style={{ background: 'var(--ap-model-denver-soft)' }}>
          <IconInfo />
          <p>Ciclo trimestral de {new Date(cycle.startsOn).toLocaleDateString('pt-BR')} a {new Date(cycle.endsOn).toLocaleDateString('pt-BR')}. Registro por rotina de atividade conjunta, a cada 15 minutos.</p>
        </div>
      )}
      <div className="ap-row" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 'var(--ap-text-xl)' }}>Objetivos trimestrais</h2>
        <Button icon={<IconPlus />} onClick={() => setObjOpen(true)}>Novo objetivo</Button>
      </div>
      {objectives.length === 0 && <Card><p className="ap-muted ap-small">Inclua os objetivos do ciclo, cada um dividido em passos de aprendizagem do mais simples ao objetivo final.</p></Card>}
      {objectives.map((o) => (
        <Card key={o.id} title={<>{o.domain} <span className="ap-muted" style={{ fontWeight: 500 }}>· nível {o.level}</span></>}>
          <p className="ap-small" style={{ marginBottom: '0.9rem' }}>{o.description}</p>
          <ol className="plan-steps">
            {o.steps.map((s) => (
              <li key={s.id}>
                <span>{s.description}</span>
                <span className="ap-row" style={{ gap: '0.4rem' }}>
                  <Badge tone={s.status === 'mastered' ? 'success' : s.status === 'acquisition' ? 'warning' : undefined}>
                    {{ mastered: 'Dominado', acquisition: 'Em aquisição', not_started: 'Não iniciado' }[s.status]}
                  </Badge>
                  {s.status === 'acquisition' && <Button size="sm" onClick={() => setMastering({ objectiveId: o.id, stepId: s.id, description: s.description })}>Marcar dominado</Button>}
                </span>
              </li>
            ))}
          </ol>
          <p className="ap-xs ap-muted" style={{ marginTop: '0.8rem' }}>Texto redigido pela equipe. Os itens oficiais da Lista de Verificação do ESDM só entram mediante licença.</p>
        </Card>
      ))}

      <DenverObjectiveDialog open={objOpen} caseId={caseId} onClose={() => setObjOpen(false)} onDone={() => onDone('Objetivo trimestral incluído.')} />
      <Dialog open={!!mastering} onClose={() => { setMastering(null); setReason(''); setError(null); }} title="Confirmar domínio do passo"
        description={mastering?.description}
        footer={<><Button onClick={() => setMastering(null)}>Cancelar</Button><Button variant="primary" onClick={() => {
          try { actions.masterDenverStep(mastering!.objectiveId, mastering!.stepId, reason); setMastering(null); setReason(''); onDone('Passo dominado. O próximo passo entrou em aquisição.'); } catch (e) { setError((e as Error).message); }
        }}>Confirmar</Button></>}>
        <Field label="Justificativa" hint="Desempenho consistente observado em rotinas e sessões diferentes." error={error}>{(a) => (
          <textarea id={a.id} aria-describedby={a.describedBy} className="ap-textarea" value={reason} onChange={(e) => setReason(e.target.value)} />
        )}</Field>
      </Dialog>
    </>
  );
}

function DenverObjectiveDialog({ open, caseId, onClose, onDone }: { open: boolean; caseId: string; onClose: () => void; onDone: () => void }) {
  const [domain, setDomain] = useState(DENVER_DOMAINS[0]!);
  const [level, setLevel] = useState(1);
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    try { actions.addDenverObjective(caseId, domain, level, description, steps.split('\n')); setDescription(''); setSteps(''); setError(null); onClose(); onDone(); } catch (e) { setError((e as Error).message); }
  };
  return (
    <Dialog open={open} onClose={onClose} title="Novo objetivo trimestral" footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={submit}>Incluir objetivo</Button></>}>
      <div className="form-row">
        <Field label="Domínio">{(a) => (
          <select id={a.id} className="ap-select" value={domain} onChange={(e) => setDomain(e.target.value)}>{DENVER_DOMAINS.map((d) => <option key={d}>{d}</option>)}</select>
        )}</Field>
        <Field label="Nível">{(a) => (
          <select id={a.id} className="ap-select" value={level} onChange={(e) => setLevel(Number(e.target.value))}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</select>
        )}</Field>
      </div>
      <Field label="Objetivo (comportamento observável)">{(a) => (
        <textarea id={a.id} className="ap-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ex.: Imita ações com objetos em rotinas de atividade conjunta." />
      )}</Field>
      <Field label="Passos de aprendizagem" hint="Um por linha, do mais simples ao objetivo final. O primeiro entra em aquisição." error={error}>{(a) => (
        <textarea id={a.id} aria-describedby={a.describedBy} className="ap-textarea" value={steps} onChange={(e) => setSteps(e.target.value)} placeholder={'Imita 1 ação com objeto idêntico\nImita 3 ações diferentes\nImita ações em sequência de 2'} />
      )}</Field>
    </Dialog>
  );
}
