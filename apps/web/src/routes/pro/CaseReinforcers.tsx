/**
 * Reforçadores: inventário por criança e avaliação de preferência.
 * MSWO (DeLeon e Iwata, 1996): a cada rodada a criança escolhe um item, que sai do conjunto; a ordem de
 * escolha forma a hierarquia. O formato digital com figuras exige pré-requisitos (Morris e Vollmer, 2020).
 */
import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { RewardIcon } from '@aprumo/resource-quadro-de-fichas';
import { Badge, Button, Card, Dialog, Field, IconAlert, IconPlus, Segmented, Toast } from '@aprumo/ui';
import { actions, useStore } from '../../data/store';
import type { Reinforcer } from '../../data/types';
import './forms.css';

const CATEGORIES: Array<Reinforcer['category']> = ['tangível', 'atividade', 'social', 'digital', 'comestível'];

export default function CaseReinforcers() {
  const { caseId = '' } = useParams();
  const st = useStore((s) => s);
  const c = st.cases.find((x) => x.id === caseId)!;
  const items = st.reinforcers.filter((r) => r.caseId === caseId).sort((a, b) => a.rank - b.rank);
  const assessments = st.preferenceAssessments.filter((a) => a.caseId === caseId).sort((a, b) => b.at.localeCompare(a.at));
  const last = assessments[0];
  const expired = !last || Date.parse(last.validUntil) < Date.now();
  const [adding, setAdding] = useState(false);
  const [mswo, setMswo] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="grid-main">
      <Card title="Inventário de reforçadores" actions={<Button size="sm" icon={<IconPlus />} onClick={() => setAdding(true)}>Item</Button>}>
        {items.length === 0 && <p className="ap-small ap-muted">Inclua itens, atividades e interações de que a criança gosta. Depois faça uma avaliação de preferência.</p>}
        <ol className="reinf-list">
          {items.map((r) => {
            const rates = r.choiceRates;
            const dropping = rates.length >= 2 && rates.at(-1)! < rates[0]! * 0.6;
            return (
              <li key={r.id}>
                <span className="reinf-rank">{r.assessedAt ? r.rank : '–'}</span>
                <span className="reinf-icon"><RewardIcon category={r.category} /></span>
                <span style={{ minWidth: 0 }}>
                  <strong>{r.name}</strong>
                  <small>{r.category}{r.assessedAt ? ` · avaliado em ${new Date(r.assessedAt).toLocaleDateString('pt-BR')}` : ' · ainda não avaliado'}</small>
                </span>
                {dropping && <Badge tone="warning">possível saciação</Badge>}
              </li>
            );
          })}
        </ol>
        {c.restrictions.length > 0 && (
          <p className="ap-callout" style={{ marginTop: '1rem', background: 'var(--ap-warning-soft)' }}><IconAlert style={{ color: 'var(--ap-warning)' }} /> Restrições da ficha: {c.restrictions.join('; ')}.</p>
        )}
      </Card>

      <div className="ap-stack" style={{ gap: '1.25rem', alignContent: 'start' }}>
        <Card title="Avaliação de preferência">
          <div className="ap-stack" style={{ gap: '0.75rem' }}>
            {last ? (
              <p className="ap-small">
                Última: {last.method === 'mswo' ? 'MSWO' : last.method === 'paired' ? 'pareada' : 'operante livre'} {last.format === 'digital' ? 'digital' : 'presencial'},
                {' '}{new Date(last.at).toLocaleDateString('pt-BR')}.{' '}
                {expired ? <Badge tone="warning">vencida</Badge> : <Badge tone="success">válida até {new Date(last.validUntil).toLocaleDateString('pt-BR')}</Badge>}
              </p>
            ) : <p className="ap-small ap-muted">Nenhuma avaliação registrada.</p>}
            <p className="ap-xs ap-muted">A preferência muda com o tempo e com a saciação. Resultados valem por 7 dias; a sessão mostra os 3 itens de maior preferência válida.</p>
            <Button variant="primary" disabled={items.length < 2} onClick={() => setMswo(true)}>Fazer avaliação MSWO</Button>
            {items.length < 2 && <span className="ap-hint">Inclua ao menos 2 itens no inventário.</span>}
          </div>
        </Card>
        <Card title="Histórico">
          <ul className="ap-stack" style={{ listStyle: 'none', margin: 0, padding: 0, gap: '0.6rem' }}>
            {assessments.map((a) => (
              <li key={a.id} className="ap-small">
                <strong>{new Date(a.at).toLocaleDateString('pt-BR')}</strong> · {a.method.toUpperCase()} {a.format === 'digital' ? 'digital' : 'presencial'}
                <div className="ap-xs ap-muted">{a.ranking.map((id, i) => `${i + 1}. ${st.reinforcers.find((r) => r.id === id)?.name ?? '?'}`).join(' · ')}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <AddDialog open={adding} caseId={caseId} onClose={() => setAdding(false)} onDone={() => setToast('Item incluído no inventário.')} />
      {mswo && <MswoDialog caseId={caseId} items={items} onClose={() => setMswo(false)} onDone={() => setToast('Avaliação registrada. A hierarquia foi atualizada.')} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function AddDialog({ open, caseId, onClose, onDone }: { open: boolean; caseId: string; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Reinforcer['category']>('tangível');
  const [error, setError] = useState<string | null>(null);
  const restrictions = useStore((s) => s.cases.find((c) => c.id === caseId)?.restrictions ?? []);
  return (
    <Dialog open={open} onClose={onClose} title="Novo item" footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={() => {
      try { actions.addReinforcer(caseId, name, category); setName(''); setError(null); onClose(); onDone(); } catch (e) { setError((e as Error).message); }
    }}>Incluir</Button></>}>
      <Field label="Item ou atividade" error={error}>{(a) => <input id={a.id} aria-invalid={a.invalid} className="ap-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex.: carrinho de corrida, bolhas, cócegas" />}</Field>
      <div className="ap-field"><span className="ap-label">Categoria</span>
        <Segmented label="Categoria" value={category} onChange={setCategory} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
      </div>
      {category === 'comestível' && restrictions.length > 0 && <p className="ap-callout" style={{ background: 'var(--ap-warning-soft)' }}><IconAlert /> Confira as restrições: {restrictions.join('; ')}.</p>}
    </Dialog>
  );
}

/** Condução do MSWO pelo toque: o aplicador toca no item que a criança escolheu. */
function MswoDialog({ caseId, items, onClose, onDone }: { caseId: string; items: Reinforcer[]; onClose: () => void; onDone: () => void }) {
  const [format, setFormat] = useState<'in_person' | 'digital'>('in_person');
  const [chosen, setChosen] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const digitalAllowed = actions.canRunDigitalMswo(caseId);
  // Ordem de apresentação embaralhada a cada rodada para não favorecer posição.
  const remaining = useMemo(() => {
    const rest = items.filter((i) => !chosen.includes(i.id));
    return [...rest].sort(() => Math.random() - 0.5);
  }, [items, chosen]);
  const done = remaining.length <= 1;

  const finish = () => {
    const ranking = [...chosen, ...remaining.map((r) => r.id)];
    try { actions.recordPreferenceAssessment(caseId, 'mswo', format, ranking); onClose(); onDone(); } catch (e) { setError((e as Error).message); }
  };

  return (
    <Dialog open onClose={onClose} size="lg" title="Avaliação de preferência (MSWO)"
      description="Apresente todos os itens, deixe a criança escolher um e toque nele aqui. O item escolhido sai; repita até o fim."
      footer={<><Button onClick={() => setChosen((c) => c.slice(0, -1))} disabled={!chosen.length}>Desfazer última escolha</Button><Button variant="primary" disabled={!done} onClick={finish}>Registrar hierarquia</Button></>}>
      <div className="ap-field">
        <span className="ap-label">Formato</span>
        <Segmented label="Formato" value={format} onChange={(v) => { if (v === 'digital' && !digitalAllowed) return; setFormat(v); }}
          options={[{ value: 'in_person', label: 'Presencial (objetos)' }, { value: 'digital', label: 'Digital (figuras)', title: digitalAllowed ? undefined : 'Exige sondas de pareamento e identificação de figuras' }]} />
        {!digitalAllowed && <span className="ap-hint">Digital bloqueado: faltam as sondas de pareamento e de identificação de figuras (aba Perfil). Sem elas, a hierarquia com figuras pode não ser válida.</span>}
      </div>
      <p className="ap-label">Rodada {Math.min(chosen.length + 1, items.length)} de {items.length}{done ? ' · concluída' : ''}</p>
      {!done ? (
        <div className="mswo-grid">
          {remaining.map((r) => (
            <button key={r.id} type="button" className="mswo-item" onClick={() => setChosen((c) => [...c, r.id])}>
              <RewardIcon category={r.category} />
              <span>{r.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="ap-small">Último item: <strong>{remaining[0]?.name}</strong> (menor preferência nesta rodada).</p>
      )}
      {chosen.length > 0 && (
        <ol className="mswo-rank">
          {chosen.map((id) => <li key={id}>{items.find((i) => i.id === id)?.name}</li>)}
        </ol>
      )}
      {error && <p role="alert" className="form-error">{error}</p>}
    </Dialog>
  );
}
