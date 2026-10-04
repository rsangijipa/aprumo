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
  PageHeader,
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
    <div className="pro-page">
      <PageHeader
        title="Casos"
        description="Você vê apenas os casos em que tem vínculo ativo. Cada caso é conduzido em um único modelo clínico."
        actions={
          <Link className="ap-btn ap-btn--primary" to="/app/casos/novo">
            <IconPlus /> Novo caso
          </Link>
        }
      />

      {/* Barra de Filtros e Busca */}
      <div className="pro-toolbar" role="search" aria-label="Filtrar casos">
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

        <div className="pro-toolbar__group">
          <div className="pro-search-field">
            <input
              className="ap-input"
              type="search"
              placeholder="Buscar pelo nome…"
              aria-label="Filtrar casos pelo nome"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <IconSearch className="pro-search-field__icon" />
          </div>

          <Segmented<ViewMode>
            label="Modo de visualização"
            value={view}
            onChange={setView}
            options={[
              { value: 'grid', label: <><IconGrid className="pro-icon-16" /><span className="ap-visually-hidden">Grade</span></>, title: 'Grade' },
              { value: 'list', label: <><IconList className="pro-icon-16" /><span className="ap-visually-hidden">Lista compacta</span></>, title: 'Lista compacta' },
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
      {view === 'list' && list.length > 0 && (
        <Card bodyClassName="pro-card-flush">
          <div className="ap-table-wrap">
            <table className="ap-table ap-table--stack pro-cases-table">
              <caption className="ap-visually-hidden">Lista de casos</caption>
              <thead>
                <tr>
                  <th>Criança / Caso</th>
                  <th>Modelo</th>
                  <th>Idade</th>
                  <th>Plano</th>
                  <th>Alertas</th>
                  <th>Última Sessão</th>
                  <th className="pro-th-end"><span className="ap-visually-hidden">Ações</span></th>
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
                      <td data-label="" className="pro-cases-table__who">
                        <Link to={`/app/casos/${c.id}`} className="pro-list__link">
                          <Avatar child={child} />
                          <div>
                            <strong>{child.preferredName}</strong>
                            <div className="ap-xs ap-muted">{child.fullName}</div>
                          </div>
                        </Link>
                      </td>
                      <td data-label="Modelo">
                        <ModelBadge model={c.model} />
                      </td>
                      <td data-label="Idade" className="ap-tabular">{formatAge(child.birthDate)}</td>
                      <td data-label="Plano">
                        <span className="ap-small">
                          v{c.planVersion} {c.planStatus === 'draft' && <span className="ap-badge ap-badge--warning">rascunho</span>}
                        </span>
                      </td>
                      <td data-label="Alertas">
                        {caseAlerts > 0 ? (
                          <span className="ap-badge ap-badge--warning">{caseAlerts} alerta{caseAlerts > 1 ? 's' : ''}</span>
                        ) : (
                          <span className="ap-xs ap-muted">Regular</span>
                        )}
                      </td>
                      <td data-label="Última sessão" className="ap-tabular ap-small ap-muted">
                        {lastSession ? new Date(lastSession.startedAt).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td data-label="" className="pro-td-end">
                        <Link to={`/app/casos/${c.id}`} className="ap-btn ap-btn--ghost ap-btn--sm" aria-label={`Abrir caso de ${child.preferredName}`}>
                          Abrir <IconArrowRight className="pro-icon-16" />
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
          icon={<IconCases />}
          title="Nenhum caso encontrado"
        >
          <p className="ap-small">
            Tente alterar o filtro ou o termo de busca para localizar os registros de pacientes.
          </p>
          {(q || filter !== 'all') && (
            <button type="button" className="ap-btn ap-btn--sm" onClick={() => { setQ(''); setFilter('all'); }}>
              Limpar filtros
            </button>
          )}
        </EmptyState>
      )}
    </div>
  );
}
