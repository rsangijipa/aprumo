import { useMemo } from 'react';
import { Card } from '@aprumo/ui';
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
      <div className="page-head">
        <div>
          <h1>Alertas do motor de regras</h1>
          <p>Cada alerta traz evidência, tamanho de amostra e fundamento. O motor sugere; a decisão é sempre sua e fica registrada.</p>
        </div>
      </div>
      {groups.map((g) => {
        const list = alerts.filter((a) => a.severity === g.key);
        return (
          <Card key={g.key} title={`${g.title} (${list.length})`}>
            <div style={{ margin: '-1.25rem' }}><AlertList alerts={list} showCase /></div>
          </Card>
        );
      })}
    </>
  );
}
