import { useMemo } from 'react';
import { Card, EmptyState, IconBell, PageHeader } from '@aprumo/ui';
import { CURRENT_USER_ID } from '../../data/seed';
import { alertsForCase, db, useStore } from '../../data/store';
import { AlertList } from './shared';

export default function Alerts() {
  const st = useStore((s) => s);
  const alerts = useMemo(
    () => db.cases.filter((c) => c.team.some((m) => m.professionalId === CURRENT_USER_ID)).flatMap((c) => alertsForCase(st, c.id)),
    [st],
  );
  const groups = [
    { key: 'priority', title: 'Prioridade · decisões de fase e segurança' },
    { key: 'attention', title: 'Atenção · revisar procedimento' },
    { key: 'info', title: 'Informativos' },
  ] as const;

  return (
    <>
      <PageHeader
        title="Alertas do motor de regras"
        description="Cada alerta traz evidência, tamanho de amostra e fundamento. O motor sugere; a decisão é sempre sua e fica registrada."
      />
      {alerts.length === 0 && (
        <EmptyState icon={<IconBell />} title="Tudo em dia">
          <p className="ap-small">Nenhum alerta pendente nos seus casos. Novos alertas aparecem após cada sessão sincronizada.</p>
        </EmptyState>
      )}
      {alerts.length > 0 && groups.map((g) => {
        const list = alerts.filter((a) => a.severity === g.key);
        return (
          <Card key={g.key} title={`${g.title} (${list.length})`} bodyClassName="pro-card-flush">
            <AlertList alerts={list} showCase />
          </Card>
        );
      })}
    </>
  );
}
