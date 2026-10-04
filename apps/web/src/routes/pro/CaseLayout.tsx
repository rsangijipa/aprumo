import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { BackButton, Breadcrumbs, Button, Dialog, EmptyState, IconPlay, ModelBadge, Segmented } from '@aprumo/ui';
import { actions, db, formatAge, useStore } from '../../data/store';
import type { SessionRecord } from '../../data/types';
import { Avatar } from './shared';
import './pro-a11y.css';

const TABS = [
  ['', 'Visão geral'],
  ['plano', 'Plano'],
  ['dados', 'Dados'],
  ['sessoes', 'Sessões'],
  ['comportamento', 'Comportamento'],
  ['reforcadores', 'Reforçadores'],
  ['perfil', 'Perfil'],
  ['familia', 'Família'],
  ['documentos', 'Documentos'],
] as const;

/** Links internos (<a href>) renderizados por componentes do @aprumo/ui navegam pelo roteador, sem recarregar a página. */
export function useSpaLinks() {
  const nav = useNavigate();
  return (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest('a');
    const href = a?.getAttribute('href');
    if (!a || !href || !href.startsWith('/') || a.target) return;
    e.preventDefault();
    nav(href);
  };
}

/** Abas do caso: rolagem horizontal com indicação de borda e aba ativa sempre visível. */
function CaseTabs() {
  const ref = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ start: el.scrollLeft > 4, end: el.scrollLeft < max - 4 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, []);

  useEffect(() => {
    const active = ref.current?.querySelector<HTMLElement>('[aria-current="page"]');
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    active?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }, [pathname]);

  return (
    <div className="case-tabs-wrap" data-fade-start={edges.start} data-fade-end={edges.end}>
      <nav ref={ref} className="case-tabs" aria-label="Seções do caso">
        {TABS.map(([to, label]) => <NavLink key={to} to={to} end={to === ''}>{label}</NavLink>)}
      </nav>
    </div>
  );
}

export default function CaseLayout() {
  const { caseId } = useParams();
  const { pathname } = useLocation();
  const spaLinks = useSpaLinks();
  const c = useStore((s) => s.cases.find((x) => x.id === caseId));
  const activeSession = useStore((s) => s.sessions.find((x) => x.caseId === caseId && x.status === 'active'));
  const nav = useNavigate();
  const [starting, setStarting] = useState(false);
  const [setting, setSetting] = useState<SessionRecord['setting']>('clinic');
  const [error, setError] = useState<string | null>(null);

  // Auditoria de leitura: abrir o prontuário gera registro (em produção, RPC audit_read).
  useEffect(() => {
    if (c) console.info('[auditoria] leitura do caso', c.id);
  }, [c?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!c) {
    return (
      <div className="pro-page">
        <BackButton label="Voltar para casos" onClick={() => nav('/app/casos')} />
        <EmptyState title="Caso não encontrado">
          O endereço pode estar incorreto, o caso pode ter sido arquivado, ou você não tem vínculo com ele.
        </EmptyState>
        <div>
          <Button variant="primary" onClick={() => nav('/app/casos')}>Ir para a lista de casos</Button>
        </div>
      </div>
    );
  }
  const child = db.childOf(c);
  const policy = db.screenPolicy(child.birthDate);
  const draft = c.planStatus === 'draft';
  const base = `/app/casos/${c.id}`;
  const seg = pathname.startsWith(base) ? pathname.slice(base.length).split('/').filter(Boolean)[0] ?? '' : '';
  const tabLabel = TABS.find(([to]) => to === seg)?.[1];
  const crumbs = [
    { label: 'Início', href: '/app' },
    { label: 'Casos', href: '/app/casos' },
    { label: child.preferredName, href: seg ? base : undefined },
    ...(seg && tabLabel ? [{ label: tabLabel }] : []),
  ];

  return (
    <>
      <div onClickCapture={spaLinks}>
        <Breadcrumbs className="case-crumbs" items={crumbs} />
      </div>
      <header className="case-header">
        <Avatar child={child} size="lg" />
        <div className="case-header__info">
          <div className="case-header__title">
            <h1>{child.preferredName}</h1>
            <ModelBadge model={c.model} />
            {c.isDemo && (
              <span className="ap-badge pro-badge-demo">Demonstração</span>
            )}
            {draft && <span className="ap-badge ap-badge--warning">plano em rascunho</span>}
          </div>
          <p className="case-header__meta">
            {formatAge(child.birthDate)} · Plano {c.model === 'ABA' ? 'ABA' : 'Denver'} v{c.planVersion}
            {!draft && <>, revisão em {new Date(c.planReviewOn).toLocaleDateString('pt-BR')}</>}
            {!policy.childPortalAllowed && ' · sem ambiente infantil (menos de 24 meses)'}
          </p>
        </div>
        <div className="case-header__cta">
          {activeSession ? (
            <Button variant="primary" size="lg" icon={<IconPlay />} onClick={() => nav(`/app/sessao/${activeSession.id}`)}>Continuar sessão</Button>
          ) : (
            <Button variant="primary" size="lg" icon={<IconPlay />} disabled={draft} aria-describedby={draft ? 'case-draft-hint' : undefined} onClick={() => setStarting(true)}>
              Iniciar sessão
            </Button>
          )}
          {draft && !activeSession && <span id="case-draft-hint" className="ap-hint">Aprove o plano para iniciar sessões.</span>}
        </div>
      </header>

      <CaseTabs />

      <Outlet />

      <Dialog
        open={starting}
        onClose={() => setStarting(false)}
        title={`Nova sessão ${c.model === 'ABA' ? 'ABA' : 'Denver'}`}
        description={`Segue o plano vigente (${c.model === 'ABA' ? 'tentativas, oportunidades e comportamento' : 'rotinas de atividade conjunta, com registro por intervalo'}). Funciona sem internet.`}
        footer={
          <>
            <Button onClick={() => setStarting(false)}>Cancelar</Button>
            <Button
              variant="primary"
              icon={<IconPlay />}
              onClick={() => {
                try {
                  const s = actions.startSession(c.id, setting);
                  nav(`/app/sessao/${s.id}`);
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Começar
            </Button>
          </>
        }
      >
        <div className="ap-field">
          <span className="ap-label">Onde a sessão acontece</span>
          <Segmented
            label="Ambiente"
            value={setting}
            onChange={setSetting}
            options={[
              { value: 'clinic', label: 'Clínica' },
              { value: 'home', label: 'Casa' },
              { value: 'school', label: 'Escola' },
              { value: 'community', label: 'Comunidade' },
            ]}
          />
          <span className="ap-hint">O ambiente é usado para diferenciar ensino de generalização nos gráficos.</span>
        </div>
        {error && <p role="alert" className="ap-error">{error}</p>}
      </Dialog>
    </>
  );
}
