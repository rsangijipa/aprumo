/**
 * Comportamento: sem definição operacional não há medida. A função é hipótese da equipe,
 * nunca inferida automaticamente. O plano de manejo aparece na tela de aplicação.
 */
import { useState } from 'react';
import { useParams } from 'react-router';
import { mean } from '@aprumo/clinical-core';
import { Badge, Button, Card, Dialog, Field, IconAlert, IconPlus, Segmented, Toast } from '@aprumo/ui';
import { actions, useStore } from '../../data/store';
import type { BehaviorDefinition, ManagementPlan } from '../../data/types';
import './forms.css';

const FUNCTION_LABEL: Record<NonNullable<BehaviorDefinition['hypothesizedFunction']>, string> = {
  attention: 'Atenção', escape: 'Fuga ou esquiva', tangible: 'Acesso a tangível', automatic: 'Automático', unknown: 'Ainda não identificada',
};
const MEASURE_LABEL: Record<BehaviorDefinition['measure'], string> = { frequency: 'Frequência', duration: 'Duração', partial_interval: 'Intervalo parcial' };

export default function CaseBehavior() {
  const { caseId = '' } = useParams();
  const st = useStore((s) => s);
  const defs = st.behaviorDefinitions.filter((d) => d.caseId === caseId);
  const sessions = st.sessions.filter((s) => s.caseId === caseId).sort((a, b) => a.startedAt.localeCompare(b.startedAt)).slice(-16);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<BehaviorDefinition | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="pro-page">
      <div className="pro-section-head">
        <div>
          <h2 className="pro-h2">Comportamentos-alvo</h2>
          <p className="ap-small ap-muted">Registro descritivo. A função do comportamento é hipótese da equipe, nunca inferida pelo sistema.</p>
        </div>
        <Button icon={<IconPlus />} onClick={() => setAdding(true)}>Nova definição</Button>
      </div>

      {defs.length === 0 && <div className="pro-empty-card"><p>Nenhum comportamento definido. Defina antes de medir: topografia, exemplos, não exemplos, início e fim.</p></div>}

      <div className="grid-2">
        {defs.map((d) => {
          const values = sessions.map((s) => st.behaviorEvents.filter((e) => e.sessionId === s.id && e.definitionId === d.id).length);
          const max = Math.max(4, ...values);
          const avg = mean(values.slice(0, -1));
          return (
            <Card key={d.id} title={<>{d.name} {d.risk && <Badge tone="danger">risco</Badge>}</>} actions={<Button size="sm" onClick={() => setEditing(d)}>Plano de manejo</Button>}>
              <div className="ap-stack" style={{ gap: '0.8rem' }}>
                <p className="ap-small">{d.topography}</p>
                <dl className="plan-dl">
                  <dt>Medida</dt><dd>{MEASURE_LABEL[d.measure]}</dd>
                  <dt>Hipótese de função</dt><dd>{FUNCTION_LABEL[d.hypothesizedFunction ?? 'unknown']}</dd>
                  {d.examples?.length ? <><dt>Exemplos</dt><dd>{d.examples.join('; ')}</dd></> : null}
                  {d.nonExamples?.length ? <><dt>Não exemplos</dt><dd>{d.nonExamples.join('; ')}</dd></> : null}
                </dl>
                <div className="ap-row" style={{ alignItems: 'flex-end', gap: 4, height: 72 }} role="img" aria-label={`${d.name}: ${values.join(', ')} ocorrências nas últimas ${values.length} sessões`}>
                  {values.map((v, i) => (
                    <div key={i} style={{ flex: 1, height: `${(v / max) * 100}%`, minHeight: 2, background: i === values.length - 1 && v > avg * 2 ? 'var(--ap-danger)' : 'var(--ap-sage-300)', borderRadius: 3 }} />
                  ))}
                </div>
                <span className="ap-xs ap-muted">Ocorrências por sessão (últimas {values.length}). Média anterior: {Number.isNaN(avg) ? '—' : avg.toFixed(1)}.</span>
                {d.plan ? (
                  <div className="behav-plan">
                    <strong className="ap-small">Plano de manejo</strong>
                    <p><b>Antes:</b> {d.plan.antecedentStrategies}</p>
                    <p><b>Ensinar no lugar:</b> {d.plan.replacementBehavior}</p>
                    <p><b>Depois:</b> {d.plan.consequences}</p>
                    {d.plan.safetyProtocol && <p className="behav-safety"><IconAlert /> <span><b>Segurança:</b> {d.plan.safetyProtocol}</span></p>}
                  </div>
                ) : <p className="ap-small" style={{ color: 'var(--ap-warning)' }}>Sem plano de manejo. Inclua antes de aplicar sessões.</p>}
              </div>
            </Card>
          );
        })}
      </div>

      <DefinitionDialog open={adding} caseId={caseId} onClose={() => setAdding(false)} onDone={() => setToast('Definição incluída.')} />
      {editing && <PlanDialog def={editing} onClose={() => setEditing(null)} onDone={() => setToast('Plano de manejo atualizado.')} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function DefinitionDialog({ open, caseId, onClose, onDone }: { open: boolean; caseId: string; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ name: '', topography: '', examples: '', nonExamples: '', measure: 'frequency' as BehaviorDefinition['measure'], risk: false, fn: 'unknown' as NonNullable<BehaviorDefinition['hypothesizedFunction']> });
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    try {
      actions.addBehaviorDefinition({
        caseId, name: f.name, topography: f.topography, measure: f.measure, risk: f.risk, hypothesizedFunction: f.fn,
        examples: f.examples.split('\n').map((x) => x.trim()).filter(Boolean), nonExamples: f.nonExamples.split('\n').map((x) => x.trim()).filter(Boolean),
      });
      setF({ ...f, name: '', topography: '', examples: '', nonExamples: '' });
      setError(null); onClose(); onDone();
    } catch (e) { setError((e as Error).message); }
  };
  return (
    <Dialog open={open} onClose={onClose} size="lg" title="Nova definição operacional" description="Descreva o comportamento de forma que duas pessoas registrem igual."
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={submit}>Incluir</Button></>}>
      <Field label="Nome">{(a) => <input id={a.id} className="ap-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}</Field>
      <Field label="Definição topográfica" hint="O que se vê ou se ouve, início e fim do episódio.">{(a) => (
        <textarea id={a.id} aria-describedby={a.describedBy} className="ap-textarea" value={f.topography} onChange={(e) => setF({ ...f, topography: e.target.value })} />
      )}</Field>
      <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Field label="Exemplos" hint="Um por linha.">{(a) => <textarea id={a.id} className="ap-textarea" style={{ minHeight: 80 }} value={f.examples} onChange={(e) => setF({ ...f, examples: e.target.value })} />}</Field>
        <Field label="Não exemplos" hint="Um por linha.">{(a) => <textarea id={a.id} className="ap-textarea" style={{ minHeight: 80 }} value={f.nonExamples} onChange={(e) => setF({ ...f, nonExamples: e.target.value })} />}</Field>
      </div>
      <div className="ap-field"><span className="ap-label">Medida</span>
        <Segmented label="Medida" value={f.measure} onChange={(v) => setF({ ...f, measure: v })} options={Object.entries(MEASURE_LABEL).map(([value, label]) => ({ value: value as BehaviorDefinition['measure'], label }))} />
      </div>
      <Field label="Hipótese de função (opcional)" hint="Baseada em avaliação funcional descritiva. Pode ficar em aberto.">{(a) => (
        <select id={a.id} aria-describedby={a.describedBy} className="ap-select" value={f.fn} onChange={(e) => setF({ ...f, fn: e.target.value as typeof f.fn })}>
          {Object.entries(FUNCTION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      )}</Field>
      <label className="consent"><input type="checkbox" checked={f.risk} onChange={(e) => setF({ ...f, risk: e.target.checked })} /><span><strong>Comportamento de risco</strong><small>Autolesão, agressão ou fuga. Exige protocolo de segurança no plano de manejo.</small></span></label>
      {error && <p role="alert" className="form-error">{error}</p>}
    </Dialog>
  );
}

function PlanDialog({ def, onClose, onDone }: { def: BehaviorDefinition; onClose: () => void; onDone: () => void }) {
  const [p, setP] = useState<ManagementPlan>(def.plan ?? { antecedentStrategies: '', replacementBehavior: '', consequences: '', safetyProtocol: '' });
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    if (p.antecedentStrategies.trim().length < 5 || p.replacementBehavior.trim().length < 5 || p.consequences.trim().length < 5) return setError('Preencha as três partes do plano.');
    if (def.risk && (p.safetyProtocol ?? '').trim().length < 10) return setError('Comportamento de risco exige protocolo de segurança.');
    actions.updateManagementPlan(def.id, p); onClose(); onDone();
  };
  return (
    <Dialog open onClose={onClose} size="lg" title={`Plano de manejo · ${def.name}`} description="Aparece para o aplicador sempre que o comportamento for registrado na sessão."
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={submit}>Salvar plano</Button></>}>
      <Field label="Estratégias antecedentes (prevenção)">{(a) => <textarea id={a.id} className="ap-textarea" value={p.antecedentStrategies} onChange={(e) => setP({ ...p, antecedentStrategies: e.target.value })} />}</Field>
      <Field label="Comportamento alternativo a ensinar">{(a) => <textarea id={a.id} className="ap-textarea" style={{ minHeight: 70 }} value={p.replacementBehavior} onChange={(e) => setP({ ...p, replacementBehavior: e.target.value })} />}</Field>
      <Field label="Consequências programadas">{(a) => <textarea id={a.id} className="ap-textarea" style={{ minHeight: 70 }} value={p.consequences} onChange={(e) => setP({ ...p, consequences: e.target.value })} />}</Field>
      <Field label={`Protocolo de segurança${def.risk ? ' (obrigatório)' : ''}`} error={error}>{(a) => <textarea id={a.id} className="ap-textarea" style={{ minHeight: 70 }} value={p.safetyProtocol ?? ''} onChange={(e) => setP({ ...p, safetyProtocol: e.target.value })} />}</Field>
    </Dialog>
  );
}
