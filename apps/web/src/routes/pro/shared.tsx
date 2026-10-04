import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Button,
  Dialog,
  IconAlert,
  IconCheck,
  IconCloudCheck,
  IconCloudOff,
  IconInfo,
  IconSpark,
  PHASE_LABEL,
} from '@aprumo/ui';
import type { Child } from '../../data/types';
import { actions, db, getState, useStore, type CaseAlert } from '../../data/store';

export function Avatar({ child, size = 'md' }: { child: Child; size?: 'md' | 'lg' }) {
  return (
    <span className={`avatar${size === 'lg' ? ' avatar--lg' : ''}`} style={{ background: `hsl(${child.hue} 34% 44%)` }} aria-hidden="true">
      {child.preferredName.slice(0, 1)}
    </span>
  );
}

export function SyncPill() {
  const pending = useStore((s) => s.pendingSync);
  const online = useStore((s) => s.online);
  if (!online)
    return (
      <span className="sync-pill sync-pill--offline" role="status">
        <IconCloudOff /> Offline{pending ? ` · ${pending} pendente${pending > 1 ? 's' : ''}` : ''}
      </span>
    );
  if (pending)
    return (
      <span className="sync-pill sync-pill--pending" role="status">
        <IconCloudOff /> Sincronizando {pending}
      </span>
    );
  return (
    <span className="sync-pill" role="status">
      <IconCloudCheck /> Sincronizado
    </span>
  );
}

const SEVERITY_ICON = { priority: IconSpark, attention: IconAlert, info: IconInfo } as const;
const SEVERITY_LABEL = { priority: 'Prioridade', attention: 'Atenção', info: 'Informativo' } as const;

/** Para cada regra, qual mudança de fase o supervisor pode confirmar diretamente. */
const PHASE_ACTION: Partial<Record<string, { to: keyof typeof PHASE_LABEL; label: string }>> = {
  R1: { to: 'maintenance', label: 'Confirmar domínio' },
  R5: { to: 'acquisition', label: 'Reabrir aquisição' },
  R2: { to: 'review', label: 'Colocar em revisão' },
};

export function AlertList({ alerts, showCase = false, limit }: { alerts: CaseAlert[]; showCase?: boolean; limit?: number }) {
  const [decide, setDecide] = useState<CaseAlert | null>(null);
  const [dismiss, setDismiss] = useState<CaseAlert | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  const shown = limit ? alerts.slice(0, limit) : alerts;
  if (!shown.length) {
    return <p className="ap-muted ap-small" style={{ padding: '1rem 1.25rem' }}>Nenhum alerta pendente. Os alertas aparecem após cada sessão sincronizada.</p>;
  }

  const close = () => {
    setDecide(null);
    setDismiss(null);
    setReason('');
    setError(null);
  };

  return (
    <>
      <div role="list">
        {shown.map((a) => {
          const Icon = SEVERITY_ICON[a.severity];
          const action = PHASE_ACTION[a.ruleId];
          const isTarget = getState().targets.some((t) => t.id === a.subjectId);
          const c = db.caseById(a.caseId)!;
          return (
            <div className="alert-item" role="listitem" key={a.key}>
              <span className={`alert-item__icon alert-item__icon--${a.severity}`} title={SEVERITY_LABEL[a.severity]}>
                <Icon />
              </span>
              <div>
                <div className="alert-item__title">
                  <span className="rule-chip">{a.ruleId}</span> {a.title}
                </div>
                <div className="alert-item__meta">
                  {showCase && <><Link to={`/app/casos/${a.caseId}`}>{db.childOf(c).preferredName}</Link> · </>}
                  {a.subjectName}
                </div>
                <p className="alert-item__evidence">{a.evidence}</p>
                <p className="ap-xs ap-muted" style={{ marginTop: '0.3rem' }}>
                  <strong>Sugestão:</strong> {a.suggestedAction} <span title="Fundamento">· {a.basis}</span>
                </p>
              </div>
              <div className="alert-item__actions">
                {action && isTarget ? (
                  <Button size="sm" variant="primary" icon={<IconCheck />} onClick={() => setDecide(a)}>{action.label}</Button>
                ) : (
                  <Button size="sm" onClick={() => nav(`/app/casos/${a.caseId}/dados`)}>Ver dados</Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setDismiss(a)}>Dispensar</Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={!!decide}
        onClose={close}
        title={decide ? PHASE_ACTION[decide.ruleId]?.label ?? 'Decisão' : ''}
        footer={
          <>
            <Button onClick={close}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                try {
                  const act = PHASE_ACTION[decide!.ruleId]!;
                  actions.changePhase(decide!.subjectId, act.to as never, reason, decide!.ruleId);
                  close();
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Registrar decisão
            </Button>
          </>
        }
      >
        {decide && (
          <>
            <p className="ap-small">
              <strong>{decide.subjectName}</strong> passará para{' '}
              <strong>{PHASE_LABEL[PHASE_ACTION[decide.ruleId]!.to]}</strong>. A decisão fica registrada na linha do
              tempo com o alerta que a motivou.
            </p>
            <p className="ap-xs ap-muted">{decide.evidence}</p>
            <div className="ap-field">
              <label className="ap-label" htmlFor="reason">Justificativa clínica</label>
              <textarea id="reason" className="ap-textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: critério atingido com estímulos do conjunto 2; iniciar sondas de manutenção em 1, 2 e 4 semanas." />
            </div>
            {error && <p role="alert" className="ap-small" style={{ color: 'var(--ap-danger)' }}>{error}</p>}
          </>
        )}
      </Dialog>

      <Dialog
        open={!!dismiss}
        onClose={close}
        title="Dispensar alerta"
        footer={
          <>
            <Button onClick={close}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (reason.trim().length < 5) return setError('Informe o motivo (mínimo de 5 caracteres).');
                actions.dismissAlert(dismiss!.key, reason);
                close();
              }}
            >
              Dispensar
            </Button>
          </>
        }
      >
        <p className="ap-small">O motivo fica registrado e ajuda a calibrar as regras com a prática da equipe.</p>
        <div className="ap-field">
          <label className="ap-label" htmlFor="dreason">Motivo</label>
          <textarea id="dreason" className="ap-textarea" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        {error && <p role="alert" className="ap-small" style={{ color: 'var(--ap-danger)' }}>{error}</p>}
      </Dialog>
    </>
  );
}

/** Conta alvos por fase para a barra do cartão de caso. */
export function phaseCounts(caseId: string) {
  const ts = getState().targets.filter((t) => t.caseId === caseId);
  const order = ['baseline', 'acquisition', 'maintenance', 'generalization', 'mastered', 'review'] as const;
  return order.map((p) => ({ phase: p, n: ts.filter((t) => t.phase === p).length })).filter((x) => x.n);
}
