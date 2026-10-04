import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { IconPlus, Segmented } from '@aprumo/ui';
import { alertsForCase, db, useStore } from '../../data/store';
import { CaseCard } from './Home';

export default function Cases() {
  const [model, setModel] = useState<'all' | 'ABA' | 'DENVER'>('all');
  const [q, setQ] = useState('');
  const st = useStore((s) => s);
  const list = db.cases
    .filter((c) => model === 'all' || c.model === model)
    .filter((c) => db.childOf(c).preferredName.toLowerCase().includes(q.trim().toLowerCase()));
  const alerts = useMemo(() => Object.fromEntries(db.cases.map((c) => [c.id, alertsForCase(st, c.id).length])), [st]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Casos</h1>
          <p>Você vê apenas os casos em que tem vínculo. Cada caso é conduzido em um único modelo.</p>
        </div>
        <Link className="ap-btn ap-btn--primary" to="/app/casos/novo"><IconPlus /> Novo caso</Link>
      </div>
      <div className="ap-row" style={{ justifyContent: 'space-between' }}>
        <Segmented
          label="Filtrar por modelo"
          value={model}
          onChange={setModel}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'ABA', label: 'ABA' },
            { value: 'DENVER', label: 'Denver' },
          ]}
        />
        <input className="ap-input" style={{ maxWidth: 280 }} type="search" placeholder="Filtrar pelo nome" aria-label="Filtrar casos pelo nome" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid-3">
        {list.map((c) => <CaseCard key={c.id} caseId={c.id} alerts={alerts[c.id] ?? 0} />)}
      </div>
      {list.length === 0 && <p className="ap-muted">Nenhum caso encontrado.</p>}
    </>
  );
}
