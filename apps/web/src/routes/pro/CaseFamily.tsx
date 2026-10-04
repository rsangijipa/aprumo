import { useState } from 'react';
import { useParams } from 'react-router';
import { Badge, Button, Card, Dialog, IconCheck, IconPlus } from '@aprumo/ui';
import { actions, db, useStore } from '../../data/store';

const DAY = 86_400_000;

export default function CaseFamily() {
  const { caseId = '' } = useParams();
  const c = db.caseById(caseId)!;
  const st = useStore((s) => s);
  const tasks = st.homeTasks.filter((t) => t.caseId === caseId);
  const guidance = st.guidance.filter((g) => g.caseId === caseId).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const guardians = db.guardians.filter((g) => g.childId === c.childId);
  const validity = st.socialValidity.filter((v) => v.caseId === caseId);
  const [newTask, setNewTask] = useState(false);
  const [newGuidance, setNewGuidance] = useState(false);

  return (
    <div className="grid-main">
      <div className="ap-stack" style={{ gap: '1.25rem' }}>
        <Card title="Tarefas de generalização em casa" actions={<Button size="sm" icon={<IconPlus />} onClick={() => setNewTask(true)}>Nova tarefa</Button>}>
          {tasks.length === 0 && <p className="ap-muted ap-small">Nenhuma tarefa. Tarefas curtas ligadas a alvos levam o aprendizado para fora da clínica (P8).</p>}
          <div className="ap-stack">
            {tasks.map((t) => {
              const recs = st.homeRecords.filter((r) => r.taskId === t.id).sort((a, b) => a.occurredOn.localeCompare(b.occurredOn));
              const week = recs.filter((r) => Date.now() - Date.parse(r.occurredOn) <= 7 * DAY);
              const opp = week.reduce((a, r) => a + r.opportunities, 0);
              const ok = week.reduce((a, r) => a + r.successes, 0);
              const target = st.targets.find((x) => x.id === t.targetId);
              return (
                <article key={t.id} className="ap-card" style={{ boxShadow: 'none', background: 'var(--ap-surface-sunken)' }}>
                  <div className="ap-card__body ap-stack" style={{ gap: '0.6rem' }}>
                    <div className="ap-row" style={{ justifyContent: 'space-between' }}>
                      <strong>{t.title}</strong>
                      <span className="ap-xs ap-muted">{t.frequency}{target ? ` · alvo “${target.name}”` : ''}</span>
                    </div>
                    <p className="ap-small ap-muted">{t.instructions}</p>
                    <div className="ap-row" style={{ alignItems: 'flex-end', gap: 4, height: 48 }} role="img" aria-label={`Relato da família: ${recs.map((r) => `${r.successes} de ${r.opportunities}`).join(', ')}`}>
                      {recs.slice(-14).map((r) => (
                        <div key={r.id} title={`${new Date(r.occurredOn).toLocaleDateString('pt-BR')}: ${r.successes}/${r.opportunities}`}
                          style={{ flex: 1, maxWidth: 28, height: `${(r.successes / Math.max(1, r.opportunities)) * 100}%`, minHeight: 3, background: 'var(--ap-terra-500)', borderRadius: 3 }} />
                      ))}
                    </div>
                    <span className="ap-xs ap-muted">
                      Últimos 7 dias: {ok} de {opp} oportunidades ({opp ? Math.round((ok / opp) * 100) : 0}%) · <strong>relato do responsável</strong>, separado dos dados da equipe.
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>

        <Card title="Orientações para a família" actions={<Button size="sm" icon={<IconPlus />} onClick={() => setNewGuidance(true)}>Publicar orientação</Button>}>
          <ul className="ap-stack" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {guidance.map((g) => (
              <li key={g.id} className="ap-stack" style={{ gap: '0.3rem', borderBottom: '1px solid var(--ap-border)', paddingBottom: '0.8rem' }}>
                <div className="ap-row" style={{ justifyContent: 'space-between' }}>
                  <strong className="ap-small">{g.title}</strong>
                  {g.readBy.length ? <Badge tone="success"><IconCheck /> lida</Badge> : <Badge>não lida</Badge>}
                </div>
                <p className="ap-small ap-muted">{g.body}</p>
                <span className="ap-xs ap-muted">{new Date(g.publishedAt).toLocaleDateString('pt-BR')} · versão imutável; correções são publicadas como nova orientação.</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="ap-stack" style={{ gap: '1.25rem' }}>
        <Card title="Responsáveis">
          <ul className="ap-stack" style={{ listStyle: 'none', margin: 0, padding: 0, gap: '0.5rem' }}>
            {guardians.map((g) => (
              <li key={g.id} className="ap-small"><strong>{g.name}</strong> · {g.relationship} <Badge tone="success">consentimento de prontuário vigente</Badge></li>
            ))}
            {guardians.length === 0 && <li className="ap-small ap-muted">Nenhum responsável com acesso ao portal.</li>}
          </ul>
          <p className="ap-xs ap-muted" style={{ marginTop: '0.75rem' }}>
            O portal mostra progresso em linguagem acessível, tarefas, orientações e documentos finalizados compartilhados. Nunca notas internas, comportamento ou dados de outras crianças.
          </p>
        </Card>
        <Card title="Validação social">
          {validity.length === 0 ? (
            <p className="ap-small ap-muted">A família ainda não respondeu neste ciclo.</p>
          ) : (
            validity.map((v) => (
              <dl key={v.id} className="ap-small" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.3rem', margin: 0 }}>
                <dt>Importância dos objetivos</dt><dd style={{ margin: 0 }}>{v.goalsImportance}/5</dd>
                <dt>Aceitabilidade dos procedimentos</dt><dd style={{ margin: 0 }}>{v.proceduresAcceptability}/5</dd>
                <dt>Satisfação</dt><dd style={{ margin: 0 }}>{v.satisfaction}/5</dd>
                {v.comment && <dd style={{ gridColumn: '1 / -1', margin: 0 }} className="ap-muted">“{v.comment}”</dd>}
              </dl>
            ))
          )}
        </Card>
      </div>

      <NewTaskDialog open={newTask} caseId={caseId} onClose={() => setNewTask(false)} />
      <NewGuidanceDialog open={newGuidance} caseId={caseId} onClose={() => setNewGuidance(false)} />
    </div>
  );
}

function NewTaskDialog({ open, caseId, onClose }: { open: boolean; caseId: string; onClose: () => void }) {
  const targets = useStore((s) => s.targets.filter((t) => t.caseId === caseId));
  const [targetId, setTargetId] = useState('');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [frequency, setFrequency] = useState('1 vez por dia');
  const valid = title.trim().length >= 3 && instructions.trim().length >= 10;
  return (
    <Dialog open={open} onClose={onClose} title="Nova tarefa para casa"
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={!valid} onClick={() => { actions.addHomeTask({ caseId, targetId: targetId || null, title, instructions, frequency }); setTitle(''); setInstructions(''); onClose(); }}>Enviar à família</Button></>}>
      <label className="ap-field"><span className="ap-label">Alvo relacionado</span>
        <select className="ap-select" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
          <option value="">Sem alvo específico</option>
          {targets.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>
      <label className="ap-field"><span className="ap-label">Título (curto, em linguagem simples)</span><input className="ap-input" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label className="ap-field"><span className="ap-label">Como fazer</span><textarea className="ap-textarea" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Passos simples, sem jargão. Diga o que fazer se a criança não responder." /></label>
      <label className="ap-field"><span className="ap-label">Frequência</span><input className="ap-input" value={frequency} onChange={(e) => setFrequency(e.target.value)} /></label>
    </Dialog>
  );
}

function NewGuidanceDialog({ open, caseId, onClose }: { open: boolean; caseId: string; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialog open={open} onClose={onClose} title="Publicar orientação"
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={() => { try { actions.publishGuidance(caseId, title, body); setTitle(''); setBody(''); onClose(); } catch (e) { setError((e as Error).message); } }}>Publicar</Button></>}>
      <label className="ap-field"><span className="ap-label">Título</span><input className="ap-input" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label className="ap-field"><span className="ap-label">Texto para a família</span><textarea className="ap-textarea" value={body} onChange={(e) => setBody(e.target.value)} /></label>
      {error && <p role="alert" className="ap-small" style={{ color: 'var(--ap-danger)' }}>{error}</p>}
    </Dialog>
  );
}
