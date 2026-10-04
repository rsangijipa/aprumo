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

  const handleApprove = () => {
    try {
      if (c.planVersion > 1) {
        actions.approvePlanRevision(caseId);
      } else {
        actions.approvePlan(caseId);
      }
      setApproveError(null);
      setToast(`Plano v${c.planVersion} aprovado. As sessões estão liberadas.`);
    } catch (e) {
      setApproveError((e as Error).message);
    }
  };

  const handleRevise = () => {
    try {
      actions.revisePlan(caseId);
      setToast(`Rascunho de revisão v${c.planVersion + 1} criado. Alterações não alteram o histórico anterior.`);
    } catch (e) {
      setApproveError((e as Error).message);
    }
  };

  return (
    <div className="pro-page">
      {c.planStatus === 'draft' ? (
        <div className="plan-draft" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--ap-primary-soft)', border: '1px solid var(--ap-primary)', padding: '1rem', borderRadius: 'var(--ap-radius-md)' }}>
          <div>
            <strong>Plano v{c.planVersion} (em rascunho{c.planVersion > 1 ? ' de alteração' : ''})</strong>
            <p className="ap-small ap-muted" style={{ margin: '0.25rem 0 0 0' }}>
              Inclua {c.model === 'ABA' ? 'objetivos, programas e alvos' : 'objetivos trimestrais e passos'} e aprove para liberar as sessões. Todo alvo novo começa em linha de base.
            </p>
            {approveError && <p role="alert" className="ap-error" style={{ color: 'var(--ap-danger)', margin: '0.25rem 0 0 0' }}>{approveError}</p>}
          </div>
          <Button variant="primary" icon={<IconCheck />} onClick={handleApprove}>
            Aprovar versão v{c.planVersion}
          </Button>
        </div>
      ) : (
        <div className="ap-callout" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="ap-row" style={{ gap: '0.75rem', alignItems: 'center' }}>
            <IconLock />
            <div>
              <p style={{ margin: 0 }}>
                Modelo do caso: <strong>{c.model === 'ABA' ? 'ABA' : 'Modelo Denver'}</strong> · <strong>Plano v{c.planVersion} (vigente)</strong>.
              </p>
              <p className="ap-xs ap-muted" style={{ margin: 0 }}>
                Para alterar critérios ou alvos sem violar a interpretação histórica, crie uma nova versão do plano.
              </p>
            </div>
          </div>
          <Button variant="default" size="sm" onClick={handleRevise}>
            Criar revisão (v{c.planVersion + 1})
          </Button>
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
  const [phaseTarget, setPhaseTarget] = useState<Target | null>(null);

  return (
    <>
      <div className="pro-section-head">
        <h2 className="pro-h2">Objetivos e programas</h2>
        <Button icon={<IconPlus />} onClick={() => setGoalOpen(true)}>Novo objetivo</Button>
      </div>
      {goals.length === 0 && (
        <div className="pro-empty-card"><p>Comece pelos objetivos de longo prazo (por exemplo, “ampliar repertório de mandos”). Depois inclua os programas de ensino e os alvos de cada um.</p></div>
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
                    {targets.map((t) => (
                      <TargetChip key={t.id} t={t} onClick={() => setPhaseTarget(t)} />
                    ))}
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
      {phaseTarget && (
        <PhaseChangeDialog
          target={phaseTarget}
          onClose={() => setPhaseTarget(null)}
          onDone={(msg) => onDone(msg)}
        />
      )}
    </>
  );
}

function TargetChip({ t, onClick }: { t: Target; onClick?: () => void }) {
  return (
    <button
      type="button"
      className="plan-target"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', border: '1px solid var(--ap-border)', background: 'var(--ap-surface)', borderRadius: 'var(--ap-radius-md)', padding: '0.35rem 0.6rem' }}
      title="Toque para alterar a fase deste alvo com justificativa"
    >
      <span style={{ width: 34, height: 34 }}><StimulusArt art={t.art} label={t.name} /></span>
      <span className="ap-small" style={{ fontWeight: 650 }}>{t.name}</span>
      <PhaseBadge phase={t.phase} />
    </button>
  );
}

function PhaseChangeDialog({ target, onClose, onDone }: { target: Target; onClose: () => void; onDone: (msg: string) => void }) {
  const [phase, setPhase] = useState<Target['phase']>(target.phase);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const phases: Array<{ value: Target['phase']; label: string }> = [
    { value: 'baseline', label: 'Linha de base' },
    { value: 'acquisition', label: 'Aquisição' },
    { value: 'maintenance', label: 'Manutenção' },
    { value: 'generalization', label: 'Generalização' },
    { value: 'mastered', label: 'Conquistado' },
    { value: 'review', label: 'Revisão' },
    { value: 'suspended', label: 'Suspenso' },
  ];

  const submit = () => {
    if (phase === target.phase) {
      onClose();
      return;
    }
    if (reason.trim().length < 5) {
      setError('A justificativa clínica é obrigatória (mínimo de 5 caracteres).');
      return;
    }
    try {
      actions.changePhase(target.id, phase, reason);
      onDone(`Fase do alvo “${target.name}” alterada para ${phases.find((p) => p.value === phase)?.label}.`);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Mudar fase: ${target.name}`}
      description="A alteração manual de fase requer justificativa clínica e é registrada de forma imutável na linha do tempo do caso."
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={submit}>Salvar alteração</Button>
        </>
      }
    >
      <div className="ap-stack" style={{ gap: '1rem' }}>
        <Field label="Nova fase">
          {(a) => (
            <select
              id={a.id}
              className="ap-select"
              value={phase}
              onChange={(e) => setPhase(e.target.value as Target['phase'])}
            >
              {phases.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Justificativa clínica" error={error}>
          {(a) => (
            <textarea
              id={a.id}
              className="ap-textarea"
              placeholder="Descreva a razão clínica para a mudança de fase (ex: atingiu critério em sessões não informatizadas, estabilidade de linha de base demonstrada)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          )}
        </Field>
      </div>
    </Dialog>
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

/* Editor de alvo em 6 etapas estruturadas (Doc B §10.3 / Plano V2 F2) */
function TargetDialog({ program, onClose, onDone }: { program: Program | null; onClose: () => void; onDone: (name: string) => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [art, setArt] = useState('');
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<Target['teachingChannel']>('table');
  const [errorCorrectionType, setErrorCorrectionType] = useState('re-present');
  const [criterionSessions, setCriterionSessions] = useState(2);
  const [criterionPct, setCriterionPct] = useState(90);
  const [generalizationNotes, setGeneralizationNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setStep(1);
    setArt('');
    setName('');
    setError(null);
    onClose();
  };

  const isStepComplete = (s: number) => {
    if (s === 1) return true; // Nome é opcional ou preenchido
    if (s === 2) return Boolean(art); // Estímulo é obrigatório
    if (s === 3) return Boolean(channel);
    if (s === 4) return Boolean(errorCorrectionType);
    if (s === 5) return criterionPct >= 50 && criterionSessions >= 1;
    if (s === 6) return true;
    return false;
  };

  const canSave = Boolean(art) && criterionPct >= 50 && criterionSessions >= 1;

  const submit = () => {
    if (!program) return;
    if (!art) return setError('Escolha o estímulo.');
    try {
      const finalName = name || STIMULUS_ART[art]!.label;
      actions.addTarget(program.id, finalName, art, channel);
      onDone(finalName);
      close();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Dialog
      open={!!program}
      onClose={close}
      size="lg"
      title={`Alvo em etapas: ${program?.name}`}
      description="Definição em 6 passos clínicos obrigatórios para garantir alinhamento metodológico (Doc B §10.3)."
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            {step > 1 && (
              <Button onClick={() => setStep((s) => (s - 1) as any)}>
                ← Voltar
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button onClick={close}>Cancelar</Button>
            {step < 6 ? (
              <Button
                variant="primary"
                disabled={!isStepComplete(step)}
                onClick={() => setStep((s) => (s + 1) as any)}
              >
                Próximo passo →
              </Button>
            ) : (
              <Button variant="primary" disabled={!canSave} onClick={submit}>
                Salvar alvo
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Indicador de etapas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--ap-border)', paddingBottom: '0.75rem' }}>
        {[
          { num: 1, label: 'Definição' },
          { num: 2, label: 'Estímulos' },
          { num: 3, label: 'Dicas' },
          { num: 4, label: 'Correção' },
          { num: 5, label: 'Critério' },
          { num: 6, label: 'Generalização' },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num as any)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: step === s.num ? 700 : 500,
              color: step === s.num ? 'var(--ap-primary)' : 'var(--ap-text-muted)',
              fontSize: 'var(--ap-text-xs)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: step === s.num ? 'var(--ap-primary)' : 'var(--ap-surface-sunken)',
                color: step === s.num ? 'var(--ap-text-inverse)' : 'inherit',
              }}
            >
              {s.num}
            </span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="ap-stack" style={{ gap: '1rem' }}>
          <Field label="Nome do alvo (opcional)" hint="Se vazio, usará o nome do estímulo selecionado.">
            {(a) => <input id={a.id} className="ap-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: bola" />}
          </Field>
          <p className="ap-small ap-muted">
            O alvo começará automaticamente em <strong>Linha de Base</strong>, conforme protocolo clínico. Nenhuma dica é permitida nas 3 sondas iniciais.
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="ap-field">
          <span className="ap-label">Selecione o estímulo no acervo</span>
          <div className="stim-grid" role="group" aria-label="Estímulos">
            {STIMULUS_KEYS.map((k) => (
              <button key={k} type="button" aria-pressed={art === k} onClick={() => { setArt(k); setError(null); }}>
                <StimulusArt art={k} label={STIMULUS_ART[k]!.label} />
                {STIMULUS_ART[k]!.label}
              </button>
            ))}
          </div>
          <span className="ap-hint">O mesmo estímulo é utilizado nas fichas da mesa e nos jogos digitais.</span>
        </div>
      )}

      {step === 3 && (
        <div className="ap-stack" style={{ gap: '1rem' }}>
          <div className="ap-field">
            <span className="ap-label">Canal de ensino primário</span>
            <Segmented
              label="Canal de ensino"
              value={channel}
              onChange={setChannel}
              options={[
                { value: 'table', label: 'Mesa (DTT)' },
                { value: 'digital', label: 'Jogo digital' },
                { value: 'natural', label: 'Natural (NET)' },
              ]}
            />
          </div>
          <p className="ap-small ap-muted">
            Hierarquia de dicas do programa: Menos para mais intrusiva (IND → GES → MOD → FP → FT).
          </p>
        </div>
      )}

      {step === 4 && (
        <div className="ap-stack" style={{ gap: '1rem' }}>
          <Field label="Procedimento de correção de erro">
            {(a) => (
              <select
                id={a.id}
                className="ap-select"
                value={errorCorrectionType}
                onChange={(e) => setErrorCorrectionType(e.target.value)}
              >
                <option value="re-present">Reapresentação com dica imediata (0s de atraso)</option>
                <option value="model-lead-test">Modelo → Imitação guiada → Teste independente</option>
                <option value="extinction-redirect">Extinção de erro com redirecionamento de alta probabilidade</option>
              </select>
            )}
          </Field>
          <p className="ap-small ap-muted">
            Garante que tentativas incorretas não sejam reforçadas e recebam auxílio na intrusividade correta.
          </p>
        </div>
      )}

      {step === 5 && (
        <div className="ap-stack" style={{ gap: '1rem' }}>
          <div className="form-row">
            <Field label="Percentual de acertos independentes (%)">
              {(a) => (
                <input
                  id={a.id}
                  type="number"
                  className="ap-input"
                  min={50}
                  max={100}
                  value={criterionPct}
                  onChange={(e) => setCriterionPct(Number(e.target.value))}
                />
              )}
            </Field>
            <Field label="Sessões consecutivas obrigatórias">
              {(a) => (
                <input
                  id={a.id}
                  type="number"
                  className="ap-input"
                  min={1}
                  max={5}
                  value={criterionSessions}
                  onChange={(e) => setCriterionSessions(Number(e.target.value))}
                />
              )}
            </Field>
          </div>
          <p className="ap-small ap-muted">
            Critério padrão: ≥ {criterionPct}% em {criterionSessions} sessões seguidas com pelo menos 10 oportunidades.
          </p>
        </div>
      )}

      {step === 6 && (
        <div className="ap-stack" style={{ gap: '1rem' }}>
          <Field label="Plano de generalização (ambientes, pessoas e materiais)">
            {(a) => (
              <textarea
                id={a.id}
                className="ap-textarea"
                placeholder="Ex: generalizar para casa com os pais; testar com 2 novos materiais na escola..."
                value={generalizationNotes}
                onChange={(e) => setGeneralizationNotes(e.target.value)}
                rows={3}
              />
            )}
          </Field>
          <p className="ap-small ap-muted">
            Jogos compatíveis vinculados: {program?.compatibleApps.map((a) => GAMES[a]?.manifest.name ?? a).join(', ') || 'Nenhum jogo digital (apenas natural/mesa).'}.
          </p>
        </div>
      )}

      {error && <p role="alert" className="form-error" style={{ color: 'var(--ap-danger)', marginTop: '0.5rem' }}>{error}</p>}
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
      <div className="pro-section-head">
        <h2 className="pro-h2">Objetivos trimestrais</h2>
        <Button icon={<IconPlus />} onClick={() => setObjOpen(true)}>Novo objetivo</Button>
      </div>
      {objectives.length === 0 && <div className="pro-empty-card"><p>Inclua os objetivos do ciclo, cada um dividido em passos de aprendizagem do mais simples ao objetivo final.</p></div>}
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
