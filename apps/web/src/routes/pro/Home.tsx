import { useMemo } from 'react';
import { Link } from 'react-router';
import { Card, EmptyState, IconArrowRight, IconBell, IconCases, IconLibrary, IconRoute, ModelBadge, PageHeader, SectionHeader } from '@aprumo/ui';
import { CURRENT_USER_ID } from '../../data/seed';
import { alertsForCase, db, formatAge, useStore } from '../../data/store';
import { AlertList, Avatar, phaseCounts } from './shared';

const DAY = 86_400_000;

export default function Home() {
  const st = useStore((s) => s);
  const me = db.professional(CURRENT_USER_ID)!;
  const myCases = db.cases.filter((c) => c.team.some((m) => m.professionalId === me.id) && c.status === 'active');
  const alerts = useMemo(() => myCases.flatMap((c) => alertsForCase(st, c.id)), [st, myCases]);
  const priority = alerts.filter((a) => a.severity === 'priority').length;
  const weekSessions = st.sessions.filter((s) => myCases.some((c) => c.id === s.caseId) && Date.now() - Date.parse(s.startedAt) < 7 * DAY).length;
  const reviews = myCases
    .map((c) => ({ c, days: Math.ceil((Date.parse(c.planReviewOn) - Date.now()) / DAY) }))
    .filter((x) => x.days <= 21)
    .sort((a, b) => a.days - b.days);
  const recent = [...st.timeline].filter((t) => myCases.some((c) => c.id === t.caseId)).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <>
      <PageHeader
        title={<>{greet}, {me.shortName}</>}
        description={<><span className="pro-capitalize">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span> · o que precisa de você hoje</>}
        actions={
          <>
            <Link to="/app/casos/novo" className="ap-btn">Novo caso</Link>
            <Link to="/app/ferramentas/plano-individual" className="ap-btn ap-btn--primary">Criar PEI / Plano</Link>
          </>
        }
      />

      <nav className="pro-shortcuts" aria-label="Atalhos rápidos">
        <Link to="/app/casos" className="pro-shortcut">
          <IconCases aria-hidden="true" /> Meus casos <span className="pro-shortcut__n">{myCases.length}</span>
        </Link>
        <Link to="/app/ferramentas/plano-individual" className="pro-shortcut">
          <IconRoute aria-hidden="true" /> Construtor de Plano
        </Link>
        <Link to="/app/recursos" className="pro-shortcut">
          <IconLibrary aria-hidden="true" /> Resource Studio
        </Link>
        <Link to="/app/alertas" className="pro-shortcut">
          <IconBell aria-hidden="true" /> Alertas clínicos <span className="pro-shortcut__n">{alerts.length}</span>
        </Link>
      </nav>

      <div className="pro-stats">
        <Card className="pro-stat" as="div"><div className="stat"><span className="stat__value">{myCases.length}</span><span className="stat__label">Casos ativos sob sua responsabilidade</span></div></Card>
        <Card className={`pro-stat${priority > 0 ? ' pro-stat--alert' : ''}`} as="div"><div className="stat"><span className="stat__value">{priority}</span><span className="stat__label">Decisões prioritárias aguardando</span></div></Card>
        <Card className="pro-stat" as="div"><div className="stat"><span className="stat__value">{alerts.length - priority}</span><span className="stat__label">Outros alertas do motor de regras</span></div></Card>
        <Card className="pro-stat" as="div"><div className="stat"><span className="stat__value">{weekSessions}</span><span className="stat__label">Sessões nos últimos 7 dias</span></div></Card>
      </div>

      <div className="grid-main">
        <Card title="Precisa da sua atenção" actions={<Link className="pro-card-link" to="/app/alertas">Ver todos</Link>} bodyClassName="pro-card-flush">
          <AlertList alerts={alerts} showCase limit={5} />
        </Card>

        <div className="ap-stack">
          <Card title="Hoje & Próximas revisões">
            {reviews.length === 0 ? (
              <p className="pro-empty-line">Nenhuma revisão de plano nas próximas 3 semanas.</p>
            ) : (
              <ul className="pro-list">
                {reviews.map(({ c, days }) => (
                  <li key={c.id} className="pro-list__row">
                    <Link to={`/app/casos/${c.id}/plano`} className="pro-list__link">
                      <Avatar child={db.childOf(c)} />
                      <span><strong>{db.childOf(c).preferredName}</strong><br /><span className="ap-xs ap-muted">Plano {c.model === 'ABA' ? 'ABA' : 'Denver'} v{c.planVersion}</span></span>
                    </Link>
                    <span className={`ap-badge ${days <= 10 ? 'ap-badge--warning' : ''}`}>{days < 0 ? 'vencida' : `em ${days} dias`}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Atividade recente da equipe">
            {recent.length === 0 && <p className="pro-empty-line">Ainda não há atividade registrada nos seus casos.</p>}
            <ul className="timeline">
              {recent.map((t) => (
                <li key={t.id}>
                  <div>
                    <div className="ap-small pro-strong">{t.title}</div>
                    <div className="ap-xs ap-muted">
                      {db.childOf(db.caseById(t.caseId)!).preferredName} · {new Date(t.at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <section className="ap-stack">
        <SectionHeader
          title="Seus casos"
          actions={<><Link className="pro-card-link" to="/app/casos">Todos os casos</Link><Link className="ap-btn ap-btn--sm" to="/app/casos/novo">Novo caso</Link></>}
        />
        {myCases.length === 0 ? (
          <EmptyState icon={<IconCases />} title="Nenhum caso ativo">
            <p>Crie um caso ou peça ao supervisor para incluir você na equipe.</p>
          </EmptyState>
        ) : (
          <div className="grid-3">
            {myCases.map((c) => (
              <CaseCard key={c.id} caseId={c.id} alerts={alerts.filter((a) => a.caseId === c.id).length} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function CaseCard({ caseId, alerts }: { caseId: string; alerts: number }) {
  const c = db.caseById(caseId)!;
  const child = db.childOf(c);
  const counts = phaseCounts(c.id);
  const total = counts.reduce((a, x) => a + x.n, 0);
  const lastSession = useStore((s) => s.sessions.filter((x) => x.caseId === c.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]);
  const denverSteps = db.denverObjectives.filter((o) => o.caseId === c.id).flatMap((o) => o.steps);

  return (
    <Link to={`/app/casos/${c.id}`} className="ap-card case-card" aria-label={`Abrir caso de ${child.preferredName}`}>
      <div className="case-card__top">
        <Avatar child={child} />
        <div className="case-card__id">
          <div className="case-card__name">{child.preferredName}</div>
          <div className="ap-xs ap-muted">{formatAge(child.birthDate)} · Plano v{c.planVersion}</div>
        </div>
        <ModelBadge model={c.model} />
        {c.planStatus === 'draft' && <span className="ap-badge ap-badge--warning">rascunho</span>}
      </div>
      {c.model === 'ABA' ? (
        <div className="case-card__phases">
          <div className="phase-bar" aria-hidden="true">
            {counts.map((x) => <span key={x.phase} style={{ width: `${(x.n / total) * 100}%`, background: `var(--ap-phase-${x.phase})` }} />)}
          </div>
          <span className="ap-xs ap-muted">{counts.map((x) => `${x.n} ${phaseShort[x.phase]}`).join(' · ')}</span>
        </div>
      ) : (
        <span className="ap-xs ap-muted">
          {denverSteps.filter((s) => s.status === 'acquisition').length} passos em aquisição · {denverSteps.filter((s) => s.status === 'mastered').length} dominados
        </span>
      )}
      <div className="case-card__foot">
        <span className="ap-xs ap-muted">
          {lastSession ? `Última sessão ${new Date(lastSession.startedAt).toLocaleDateString('pt-BR')}` : 'Sem sessões'}
        </span>
        {alerts > 0 ? <span className="ap-badge ap-badge--warning">{alerts} alerta{alerts > 1 ? 's' : ''}</span> : <IconArrowRight className="case-card__arrow" />}
      </div>
    </Link>
  );
}

const phaseShort: Record<string, string> = {
  baseline: 'linha de base', acquisition: 'aquisição', maintenance: 'manutenção', generalization: 'generalização', mastered: 'concluídos', review: 'em revisão',
};
