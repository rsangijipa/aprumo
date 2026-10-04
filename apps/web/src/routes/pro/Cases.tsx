import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Card,
  EmptyState,
  IconArrowRight,
  IconCases,
  IconGrid,
  IconList,
  IconPlus,
  IconSearch,
  ModelBadge,
  Segmented,
} from '@aprumo/ui';
import { alertsForCase, db, formatAge, useStore } from '../../data/store';
import { Avatar } from './shared';
import { CaseCard } from './Home';

type FilterTab = 'all' | 'ABA' | 'DENVER' | 'alerts' | 'draft';
type ViewMode = 'grid' | 'list';

export default function Cases() {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [view, setView] = useState<ViewMode>('grid');
  const [q, setQ] = useState('');
  const st = useStore((s) => s);

  const alerts = useMemo(
    () => Object.fromEntries(st.cases.map((c) => [c.id, alertsForCase(st, c.id).length])),
    [st],
  );

  const list = useMemo(() => {
    return st.cases.filter((c) => {
      const child = db.childOf(c);
      const matchesQuery = child.preferredName.toLowerCase().includes(q.trim().toLowerCase()) ||
        child.fullName.toLowerCase().includes(q.trim().toLowerCase());
      if (!matchesQuery) return false;

      if (filter === 'ABA') return c.model === 'ABA';
      if (filter === 'DENVER') return c.model === 'DENVER';
      if (filter === 'alerts') return (alerts[c.id] ?? 0) > 0;
      if (filter === 'draft') return c.planStatus === 'draft';
      return true;
    });
  }, [st.cases, filter, q, alerts]);

  return (
    <div className="ap-stack" style={{ gap: '1.25rem' }}>
      <div className="page-head">
        <div>
          <h1>Casos</h1>
          <p>Você vê apenas os casos em que tem vínculo ativo. Cada caso é conduzido em um único modelo clínico.</p>
        </div>
        <Link className="ap-btn ap-btn--primary" to="/app/casos/novo">
          <IconPlus /> Novo caso
        </Link>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="ap-row" style={{ justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Segmented<FilterTab>
          label="Filtrar casos"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `Todos (${st.cases.length})` },
            { value: 'ABA', label: 'ABA' },
            { value: 'DENVER', label: 'Denver' },
            { value: 'alerts', label: 'Com alerta' },
            { value: 'draft', label: 'Rascunho' },
          ]}
        />

        <div className="ap-row" style={{ gap: '0.5rem' }}>
          <div style={{ position: 'relative', minWidth: 240 }}>
            <input
              className="ap-input"
              type="search"
              placeholder="Buscar pelo nome…"
              aria-label="Filtrar casos pelo nome"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ paddingLeft: '2.2rem' }}
            />
            <IconSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 16, color: 'var(--ap-text-muted)' }} />
          </div>

          <Segmented<ViewMode>
            label="Modo de visualização"
            value={view}
            onChange={setView}
            options={[
              { value: 'grid', label: <IconGrid style={{ width: 16 }} />, title: 'Grade' },
              { value: 'list', label: <IconList style={{ width: 16 }} />, title: 'Lista compacta' },
            ]}
          />
        </div>
      </div>

      {/* Visualização em Grade */}
      {view === 'grid' && (
        <div className="grid-3">
          {list.map((c) => (
            <CaseCard key={c.id} caseId={c.id} alerts={alerts[c.id] ?? 0} />
          ))}
        </div>
      )}

      {/* Visualização em Lista Compacta */}
      {view === 'list' && (
        <Card bodyClassName="ap-stack">
          <div style={{ overflowX: 'auto' }}>
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Criança / Caso</th>
                  <th>Modelo</th>
                  <th>Idade</th>
                  <th>Plano</th>
                  <th>Alertas</th>
                  <th>Última Sessão</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => {
                  const child = db.childOf(c);
                  const caseAlerts = alerts[c.id] ?? 0;
                  const lastSession = st.sessions
                    .filter((x) => x.caseId === c.id)
                    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

                  return (
                    <tr key={c.id}>
                      <td>
                        <Link
                          to={`/app/casos/${c.id}`}
                          className="ap-row"
                          style={{ textDecoration: 'none', color: 'inherit', gap: '0.65rem' }}
                        >
                          <Avatar child={child} />
                          <div>
                            <strong>{child.preferredName}</strong>
                            <div className="ap-xs ap-muted">{child.fullName}</div>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <ModelBadge model={c.model} />
                      </td>
                      <td className="ap-tabular">{formatAge(child.birthDate)}</td>
                      <td>
                        <span className="ap-small">
                          v{c.planVersion} {c.planStatus === 'draft' && <span className="ap-badge ap-badge--warning">rascunho</span>}
                        </span>
                      </td>
                      <td>
                        {caseAlerts > 0 ? (
                          <span className="ap-badge ap-badge--warning">{caseAlerts} alerta{caseAlerts > 1 ? 's' : ''}</span>
                        ) : (
                          <span className="ap-xs ap-muted">Regular</span>
                        )}
                      </td>
                      <td className="ap-tabular ap-small ap-muted">
                        {lastSession ? new Date(lastSession.startedAt).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/app/casos/${c.id}`} className="ap-btn ap-btn--ghost ap-btn--sm">
                          Abrir <IconArrowRight style={{ width: 14 }} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {list.length === 0 && (
        <EmptyState
          icon={<IconCases style={{ width: 44, height: 44, color: 'var(--ap-sage-300)' }} />}
          title="Nenhum caso encontrado"
        >
          <p className="ap-muted ap-small">
            Tente alterar o filtro ou o termo de busca para localizar os registros de pacientes.
          </p>
        </EmptyState>
      )}
    </div>
  );
}
