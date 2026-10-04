/**
 * Supervisão e fidelidade. O checklist de fidelidade é derivado dos componentes do procedimento,
 * para que registrar custe quase nada. Métricas de supervisão servem ao cuidado, nunca a ranking de equipe.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Badge, Button, Card, Dialog, Field, IconAlert, IconPlus, Segmented, Stepper, Toast } from '@aprumo/ui';
import { CURRENT_USER_ID } from '../../data/seed';
import { actions, db, useStore } from '../../data/store';
import type { Competency, IoaSession } from '../../data/types';
import { PROCEDURE_LABEL } from '../../data/templates';
import './forms.css';

type Procedure = Competency['procedure'];
const PROC_LABEL: Record<Procedure, string> = { ...(PROCEDURE_LABEL as Record<string, string>), denver_routine: 'Rotina Denver', behavior_recording: 'Registro de comportamento' } as Record<Procedure, string>;

/** Componentes observáveis por procedimento (checklist genérico; escala oficial do ESDM só com licença). */
export const FIDELITY_COMPONENTS: Record<string, string[]> = {
  DTT: ['Obtém atenção antes da instrução', 'Apresenta a instrução conforme definida', 'Aguarda a latência programada', 'Aplica a dica do nível previsto', 'Aplica a consequência programada', 'Corrige o erro conforme o programa', 'Registra a tentativa'],
  NET: ['Cria a oportunidade a partir da motivação', 'Espera a iniciativa da criança', 'Usa a dica conforme a hierarquia', 'Entrega consequência natural relacionada', 'Registra a oportunidade'],
  chaining: ['Apresenta a instrução da cadeia', 'Aplica a dica no passo conforme o plano', 'Reforça ao fim da cadeia', 'Registra cada passo'],
  fluency: ['Apresenta o material conforme definido', 'Controla o tempo corretamente', 'Registra respostas por minuto'],
  denver: ['Segue a liderança da criança', 'Fica de frente, na altura dos olhos', 'Controla o acesso aos materiais', 'Alterna turnos', 'Conduz abertura, elaboração, variação e fechamento', 'Registra os passos no intervalo'],
};

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : null);
export function ioaPercent(s: Pick<IoaSession, 'a' | 'b'>): number | null {
  return pct(s.a.filter((x, i) => x === s.b[i]).length, s.a.length);
}

type Tab = 'overview' | 'fidelity' | 'ioa' | 'hours' | 'competencies';

export default function Supervision() {
  const [tab, setTab] = useState<Tab>('overview');
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Supervisão</h1>
          <p>Fidelidade de procedimento, concordância entre observadores, horas e competências da equipe.</p>
        </div>
      </div>
      <Segmented label="Seções da supervisão" value={tab} onChange={setTab} options={[
        { value: 'overview', label: 'Visão geral' }, { value: 'fidelity', label: 'Fidelidade' }, { value: 'ioa', label: 'Concordância' },
        { value: 'hours', label: 'Horas' }, { value: 'competencies', label: 'Competências' },
      ]} />
      {tab === 'overview' && <Overview />}
      {tab === 'fidelity' && <Fidelity />}
      {tab === 'ioa' && <Ioa />}
      {tab === 'hours' && <Hours />}
      {tab === 'competencies' && <Competencies />}
    </>
  );
}

function myLeadCases() {
  return db.cases.filter((c) => c.team.some((m) => m.professionalId === CURRENT_USER_ID && (m.role === 'responsible' || m.role === 'supervisor')));
}

/* ---------------------------------------------------------------- visão geral */
function Overview() {
  const st = useStore((s) => s);
  const implementers = st.professionals.filter((p) => p.id !== CURRENT_USER_ID);
  const monthAgo = Date.now() - 30 * 86_400_000;
  const gaps = useMemo(() => {
    const out: Array<{ who: string; caseName: string; caseId: string; proc: string }> = [];
    for (const c of st.cases) {
      const procs = new Set(st.programs.filter((p) => p.caseId === c.id).map((p) => p.procedure as string));
      if (c.model === 'DENVER') procs.add('denver_routine');
      for (const m of c.team.filter((x) => x.role === 'implementer')) {
        for (const proc of procs) {
          const ok = st.competencies.some((k) => k.professionalId === m.professionalId && k.procedure === proc && k.status === 'competent');
          if (!ok) out.push({ who: db.professional(m.professionalId)!.name, caseName: db.childOf(c).preferredName, caseId: c.id, proc: PROC_LABEL[proc as Procedure] ?? proc });
        }
      }
    }
    return out;
  }, [st]);

  return (
    <div className="ap-stack" style={{ gap: '1.25rem' }}>
      <div className="grid-3">
        {implementers.map((p) => {
          const fo = st.fidelity.filter((f) => f.implementerId === p.id && Date.parse(f.at) > monthAgo);
          const obs = fo.flatMap((f) => f.components);
          const fid = pct(obs.reduce((a, c) => a + c.correct, 0), obs.reduce((a, c) => a + c.observed, 0));
          const ioa = st.ioa.filter((i) => (i.observerA === p.id || i.observerB === p.id) && Date.parse(i.at) > monthAgo).map(ioaPercent).filter((x): x is number => x != null);
          const minutes = st.supervisionLogs.filter((l) => l.implementerId === p.id && Date.parse(l.at) > monthAgo).reduce((a, l) => a + l.minutes, 0);
          return (
            <Card key={p.id} title={p.name}>
              <dl className="sup-stats">
                <div><dt>Fidelidade (30 dias)</dt><dd>{fid == null ? <span className="ap-muted">sem observação</span> : <>{fid}% {fid < 85 && <Badge tone="warning">abaixo de 85%</Badge>}</>}</dd></div>
                <div><dt>Concordância</dt><dd>{ioa.length ? `${Math.round(ioa.reduce((a, b) => a + b, 0) / ioa.length)}% (${ioa.length})` : <span className="ap-muted">sem sessões</span>}</dd></div>
                <div><dt>Supervisão no mês</dt><dd>{Math.floor(minutes / 60)} h {minutes % 60} min</dd></div>
              </dl>
              {fo.length === 0 && <p className="ap-xs" style={{ color: 'var(--ap-warning)', marginTop: '0.5rem' }}>Meta: ao menos uma observação de fidelidade por mês.</p>}
            </Card>
          );
        })}
      </div>
      <Card title="Competências faltantes nos casos">
        {gaps.length === 0 ? <p className="ap-small ap-muted">Todos os aplicadores têm competência registrada nos procedimentos dos seus casos.</p> : (
          <ul className="ap-stack" style={{ listStyle: 'none', margin: 0, padding: 0, gap: '0.5rem' }}>
            {gaps.map((g, i) => (
              <li key={i} className="ap-small ap-row" style={{ gap: '0.5rem', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                <IconAlert style={{ width: 18, color: 'var(--ap-warning)', flex: 'none' }} />
                <span><strong>{g.who}</strong> aplica <strong>{g.proc}</strong> no caso <Link to={`/app/casos/${g.caseId}`}>{g.caseName}</Link> sem competência registrada.</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <p className="ap-xs ap-muted">Estes números apoiam o desenvolvimento da equipe. Não são ranking de produtividade.</p>
    </div>
  );
}

/* ---------------------------------------------------------------- fidelidade */
function Fidelity() {
  const st = useStore((s) => s);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const list = [...st.fidelity].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <div className="ap-stack" style={{ gap: '1rem' }}>
      <div className="ap-row" style={{ justifyContent: 'flex-end' }}><Button variant="primary" icon={<IconPlus />} onClick={() => setOpen(true)}>Nova observação</Button></div>
      {list.map((f) => {
        const obs = f.components.reduce((a, c) => a + c.observed, 0);
        const ok = f.components.reduce((a, c) => a + c.correct, 0);
        const program = st.programs.find((p) => p.id === f.programId);
        const c = st.cases.find((x) => x.id === f.caseId)!;
        const v = pct(ok, obs)!;
        return (
          <Card key={f.id} title={<>{db.professional(f.implementerId)?.name} · {program?.name ?? 'Rotinas Denver'}</>} actions={<Badge tone={v >= 85 ? 'success' : 'warning'}>{v}%</Badge>}>
            <p className="ap-xs ap-muted" style={{ marginBottom: '0.6rem' }}>{db.childOf(c).preferredName} · {new Date(f.at).toLocaleDateString('pt-BR')} · {f.mode === 'live' ? 'ao vivo' : 'por vídeo (com consentimento)'}</p>
            <ul className="fid-list">
              {f.components.filter((x) => x.observed > 0).map((x) => (
                <li key={x.name}><span>{x.name}</span><span className="fid-bar" aria-hidden="true"><i style={{ width: `${(x.correct / x.observed) * 100}%` }} /></span><span className="ap-tabular">{x.correct}/{x.observed}</span></li>
              ))}
            </ul>
            {f.notes && <p className="ap-small" style={{ marginTop: '0.6rem' }}><strong>Feedback:</strong> {f.notes}</p>}
          </Card>
        );
      })}
      {open && <FidelityDialog onClose={() => setOpen(false)} onDone={() => setToast('Observação de fidelidade registrada.')} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function FidelityDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const st = useStore((s) => s);
  const cases = myLeadCases();
  const [caseId, setCaseId] = useState(cases[0]?.id ?? '');
  const c = st.cases.find((x) => x.id === caseId);
  const programs = st.programs.filter((p) => p.caseId === caseId);
  const [programId, setProgramId] = useState('');
  const pid = c?.model === 'DENVER' ? 'denver' : programId || programs[0]?.id || '';
  const procedure = c?.model === 'DENVER' ? 'denver' : st.programs.find((p) => p.id === pid)?.procedure ?? 'DTT';
  const implementers = c?.team.filter((m) => m.role === 'implementer') ?? [];
  const [implementerId, setImplementerId] = useState('');
  const impl = implementerId || implementers[0]?.professionalId || '';
  const [mode, setMode] = useState<'live' | 'video'>('live');
  const [counts, setCounts] = useState<Record<string, { observed: number; correct: number }>>({});
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const components = FIDELITY_COMPONENTS[procedure] ?? [];
  const get = (n: string) => counts[n] ?? { observed: 0, correct: 0 };
  const totalObs = components.reduce((a, n) => a + get(n).observed, 0);
  const totalOk = components.reduce((a, n) => a + get(n).correct, 0);

  const submit = () => {
    try {
      actions.addFidelityObservation({ caseId, programId: pid, implementerId: impl, mode, components: components.map((n) => ({ name: n, ...get(n) })), notes });
      onClose(); onDone();
    } catch (e) { setError((e as Error).message); }
  };

  return (
    <Dialog open onClose={onClose} size="lg" title="Observação de fidelidade" description="Checklist gerado a partir do procedimento do programa. Marque quantas vezes cada componente foi observado e executado corretamente."
      footer={<><span className="ap-small" style={{ marginRight: 'auto', alignSelf: 'center' }}>Fidelidade: <strong>{pct(totalOk, totalObs) ?? '—'}{totalObs ? '%' : ''}</strong></span><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={submit}>Registrar</Button></>}>
      <div className="form-row--3 form-row">
        <Field label="Caso">{(a) => <select id={a.id} className="ap-select" value={caseId} onChange={(e) => { setCaseId(e.target.value); setProgramId(''); setImplementerId(''); }}>{cases.map((x) => <option key={x.id} value={x.id}>{db.childOf(x).preferredName}</option>)}</select>}</Field>
        {c?.model === 'ABA' ? (
          <Field label="Programa">{(a) => <select id={a.id} className="ap-select" value={pid} onChange={(e) => setProgramId(e.target.value)}>{programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}</Field>
        ) : <Field label="Procedimento">{(a) => <input id={a.id} className="ap-input" value="Rotinas de atividade conjunta" readOnly />}</Field>}
        <Field label="Aplicador">{(a) => <select id={a.id} className="ap-select" value={impl} onChange={(e) => setImplementerId(e.target.value)}>{implementers.map((m) => <option key={m.professionalId} value={m.professionalId}>{db.professional(m.professionalId)?.name}</option>)}</select>}</Field>
      </div>
      <Segmented label="Modo" value={mode} onChange={setMode} options={[{ value: 'live', label: 'Ao vivo' }, { value: 'video', label: 'Por vídeo' }]} />
      <ul className="fid-edit">
        {components.map((n) => {
          const v = get(n);
          return (
            <li key={n}>
              <span>{n}</span>
              <span className="fid-steppers">
                <div><small>observado</small><Stepper label={`${n} observado`} value={v.observed} max={50} onChange={(x) => setCounts({ ...counts, [n]: { observed: x, correct: Math.min(v.correct, x) } })} /></div>
                <div><small>correto</small><Stepper label={`${n} correto`} value={v.correct} max={v.observed} onChange={(x) => setCounts({ ...counts, [n]: { ...v, correct: x } })} /></div>
              </span>
            </li>
          );
        })}
      </ul>
      <Field label="Feedback para o aplicador" error={error}>{(a) => <textarea id={a.id} className="ap-textarea" style={{ minHeight: 70 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="O que manter e o que ajustar, de forma específica." />}</Field>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- concordância */
function Ioa() {
  const st = useStore((s) => s);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  return (
    <div className="ap-stack" style={{ gap: '1rem' }}>
      <div className="ap-row" style={{ justifyContent: 'space-between' }}>
        <p className="ap-small ap-muted">Dois observadores registram a mesma sessão de forma independente. Meta: ≥ 80% em ao menos 20% dos casos por mês.</p>
        <Button variant="primary" icon={<IconPlus />} onClick={() => setOpen(true)}>Nova sessão de concordância</Button>
      </div>
      <Card>
        <div className="ap-table-wrap">
          <table className="ap-table ap-table--stack">
            <thead><tr><th>Data</th><th>Caso · alvo</th><th>Observadores</th><th>Tentativas</th><th>Concordância</th></tr></thead>
            <tbody>
              {[...st.ioa].sort((a, b) => b.at.localeCompare(a.at)).map((i) => {
                const t = st.targets.find((x) => x.id === i.targetId);
                const c = st.cases.find((x) => x.id === i.caseId)!;
                const v = ioaPercent(i);
                return (
                  <tr key={i.id}>
                    <td data-label="Data">{new Date(i.at).toLocaleDateString('pt-BR')}</td>
                    <td data-label="Caso · alvo">{db.childOf(c).preferredName} · {t?.name}</td>
                    <td data-label="Observadores">{db.professional(i.observerA)?.shortName} e {db.professional(i.observerB)?.shortName}</td>
                    <td data-label="Tentativas" className="ap-tabular">{i.a.length}</td>
                    <td data-label="Concordância"><Badge tone={v != null && v >= 80 ? 'success' : 'warning'}>{v}%</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {open && <IoaDialog onClose={() => setOpen(false)} onDone={(v) => setToast(`Concordância registrada: ${v}%.`)} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

const MARKS = [{ v: '+', label: 'Correta' }, { v: '-', label: 'Incorreta' }, { v: '0', label: 'Sem resposta' }] as const;

function IoaDialog({ onClose, onDone }: { onClose: () => void; onDone: (v: number) => void }) {
  const st = useStore((s) => s);
  const cases = myLeadCases().filter((c) => c.model === 'ABA');
  const [caseId, setCaseId] = useState(cases[0]?.id ?? '');
  const targets = st.targets.filter((t) => t.caseId === caseId);
  const [targetId, setTargetId] = useState('');
  const tid = targetId || targets[0]?.id || '';
  const [obsA, setObsA] = useState(st.professionals.find((p) => p.id !== CURRENT_USER_ID)?.id ?? '');
  const [obsB, setObsB] = useState(CURRENT_USER_ID);
  const [rows, setRows] = useState<Array<{ a: string; b: string }>>([{ a: '', b: '' }]);
  const [error, setError] = useState<string | null>(null);
  const complete = rows.filter((r) => r.a && r.b);
  const v = ioaPercent({ a: complete.map((r) => r.a), b: complete.map((r) => r.b) });
  const set = (i: number, k: 'a' | 'b', val: string) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: val } : r)));

  const submit = () => {
    if (rows.some((r) => !r.a || !r.b)) return setError('Complete os dois registros em todas as tentativas.');
    try { actions.addIoa({ caseId, targetId: tid, observerA: obsA, observerB: obsB, a: rows.map((r) => r.a), b: rows.map((r) => r.b) }); onClose(); onDone(v ?? 0); } catch (e) { setError((e as Error).message); }
  };

  return (
    <Dialog open onClose={onClose} size="lg" title="Sessão de concordância (IOA)" description="Concordância tentativa a tentativa: concordâncias ÷ (concordâncias + discordâncias) × 100."
      footer={<><span className="ap-small" style={{ marginRight: 'auto', alignSelf: 'center' }}>Concordância: <strong>{v ?? '—'}{v != null ? '%' : ''}</strong> ({complete.length} tentativas)</span><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={submit}>Registrar</Button></>}>
      <div className="form-row--3 form-row">
        <Field label="Caso">{(a) => <select id={a.id} className="ap-select" value={caseId} onChange={(e) => { setCaseId(e.target.value); setTargetId(''); }}>{cases.map((x) => <option key={x.id} value={x.id}>{db.childOf(x).preferredName}</option>)}</select>}</Field>
        <Field label="Alvo">{(a) => <select id={a.id} className="ap-select" value={tid} onChange={(e) => setTargetId(e.target.value)}>{targets.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>}</Field>
        <div />
        <Field label="Observador A">{(a) => <select id={a.id} className="ap-select" value={obsA} onChange={(e) => setObsA(e.target.value)}>{st.professionals.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}</Field>
        <Field label="Observador B">{(a) => <select id={a.id} className="ap-select" value={obsB} onChange={(e) => setObsB(e.target.value)}>{st.professionals.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}</Field>
      </div>
      <ol className="ioa-rows">
        {rows.map((r, i) => (
          <li key={i} data-disagree={!!(r.a && r.b && r.a !== r.b)}>
            <span className="ioa-n">{i + 1}</span>
            {(['a', 'b'] as const).map((k) => (
              <span key={k} className="ioa-marks" role="group" aria-label={`Tentativa ${i + 1}, observador ${k.toUpperCase()}`}>
                <small>{k.toUpperCase()}</small>
                {MARKS.map((m) => <button key={m.v} type="button" aria-pressed={r[k] === m.v} title={m.label} onClick={() => set(i, k, m.v)}>{m.v === '-' ? '−' : m.v}</button>)}
              </span>
            ))}
          </li>
        ))}
      </ol>
      <Button icon={<IconPlus />} onClick={() => setRows((rs) => [...rs, { a: '', b: '' }])}>Nova tentativa</Button>
      {error && <p role="alert" className="form-error">{error}</p>}
    </Dialog>
  );
}

/* ---------------------------------------------------------------- horas */
function Hours() {
  const st = useStore((s) => s);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const monthAgo = Date.now() - 30 * 86_400_000;
  const people = st.professionals.filter((p) => p.id !== CURRENT_USER_ID);
  return (
    <div className="ap-stack" style={{ gap: '1rem' }}>
      <div className="ap-row" style={{ justifyContent: 'flex-end' }}><Button variant="primary" icon={<IconPlus />} onClick={() => setOpen(true)}>Registrar supervisão</Button></div>
      <div className="grid-3">
        {people.map((p) => {
          const logs = st.supervisionLogs.filter((l) => l.implementerId === p.id && Date.parse(l.at) > monthAgo);
          const d = logs.filter((l) => l.kind === 'direct').reduce((a, l) => a + l.minutes, 0);
          const i = logs.filter((l) => l.kind === 'indirect').reduce((a, l) => a + l.minutes, 0);
          return (
            <Card key={p.id} title={p.name}>
              <dl className="sup-stats">
                <div><dt>Direta (30 dias)</dt><dd>{(d / 60).toFixed(1)} h</dd></div>
                <div><dt>Indireta (30 dias)</dt><dd>{(i / 60).toFixed(1)} h</dd></div>
              </dl>
            </Card>
          );
        })}
      </div>
      <Card title="Registros">
        <ul className="ap-stack" style={{ listStyle: 'none', margin: 0, padding: 0, gap: '0.7rem' }}>
          {[...st.supervisionLogs].sort((a, b) => b.at.localeCompare(a.at)).map((l) => (
            <li key={l.id} className="ap-small">
              <strong>{db.professional(l.implementerId)?.name}</strong> · {l.minutes} min {l.kind === 'direct' ? 'diretos' : 'indiretos'} · {new Date(l.at).toLocaleDateString('pt-BR')}
              {l.caseId && <> · {db.childOf(st.cases.find((c) => c.id === l.caseId)!).preferredName}</>}
              {l.notes && <div className="ap-xs ap-muted">{l.notes}</div>}
            </li>
          ))}
        </ul>
      </Card>
      {open && <HoursDialog onClose={() => setOpen(false)} onDone={() => setToast('Supervisão registrada.')} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function HoursDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const st = useStore((s) => s);
  const people = st.professionals.filter((p) => p.id !== CURRENT_USER_ID);
  const [implementerId, setImplementerId] = useState(people[0]?.id ?? '');
  const [caseId, setCaseId] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [kind, setKind] = useState<'direct' | 'indirect'>('direct');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialog open onClose={onClose} title="Registrar supervisão" footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={() => {
      try { actions.addSupervisionLog({ implementerId, caseId: caseId || null, minutes, kind, notes }); onClose(); onDone(); } catch (e) { setError((e as Error).message); }
    }}>Registrar</Button></>}>
      <Field label="Aplicador">{(a) => <select id={a.id} className="ap-select" value={implementerId} onChange={(e) => setImplementerId(e.target.value)}>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}</Field>
      <Field label="Caso (opcional)">{(a) => <select id={a.id} className="ap-select" value={caseId} onChange={(e) => setCaseId(e.target.value)}><option value="">Geral</option>{st.cases.map((c) => <option key={c.id} value={c.id}>{db.childOf(c).preferredName}</option>)}</select>}</Field>
      <div className="ap-row" style={{ gap: '1.25rem' }}>
        <div className="ap-field"><span className="ap-label">Duração (min)</span><Stepper label="minutos" value={minutes} min={5} max={480} step={5} onChange={setMinutes} /></div>
        <div className="ap-field"><span className="ap-label">Tipo</span><Segmented label="Tipo" value={kind} onChange={setKind} options={[{ value: 'direct', label: 'Direta' }, { value: 'indirect', label: 'Indireta' }]} /></div>
      </div>
      <Field label="Notas" error={error}>{(a) => <textarea id={a.id} className="ap-textarea" style={{ minHeight: 70 }} value={notes} onChange={(e) => setNotes(e.target.value)} />}</Field>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- competências */
function Competencies() {
  const st = useStore((s) => s);
  const procs: Procedure[] = ['DTT', 'NET', 'chaining', 'fluency', 'denver_routine', 'behavior_recording'];
  const people = st.professionals.filter((p) => p.id !== CURRENT_USER_ID);
  const cycle = (pid: string, proc: Procedure) => {
    const cur = st.competencies.find((c) => c.professionalId === pid && c.procedure === proc)?.status;
    actions.setCompetency(pid, proc, cur === 'competent' ? 'in_training' : 'competent');
  };
  return (
    <Card title="Competências por procedimento">
      <p className="ap-small ap-muted" style={{ marginBottom: '0.8rem' }}>Treino por habilidades comportamentais: instrução, modelo, ensaio e feedback. Toque para alternar entre “em treino” e “competente”.</p>
      <div className="ap-table-wrap">
        <table className="ap-table comp-table">
          <thead><tr><th>Profissional</th>{procs.map((p) => <th key={p}>{PROC_LABEL[p]}</th>)}</tr></thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                {procs.map((proc) => {
                  const s = st.competencies.find((c) => c.professionalId === p.id && c.procedure === proc)?.status;
                  return (
                    <td key={proc}>
                      <button type="button" className="comp-cell" data-status={s ?? 'none'} onClick={() => cycle(p.id, proc)} aria-label={`${p.name}, ${PROC_LABEL[proc]}: ${s === 'competent' ? 'competente' : s === 'in_training' ? 'em treino' : 'sem registro'}`}>
                        {s === 'competent' ? 'Competente' : s === 'in_training' ? 'Em treino' : '—'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
