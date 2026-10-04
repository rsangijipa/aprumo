import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import {
  Button,
  CommandPalette,
  Dialog,
  Drawer,
  IconBell,
  IconCases,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconHeart,
  IconHome,
  IconLibrary,
  IconLogout,
  IconMenu,
  IconMoon,
  IconPlay,
  IconPlus,
  IconRoute,
  IconSearch,
  IconSettings,
  IconShield,
  IconSun,
  IconTeam,
  IconX,
  Logo,
  Tabs,
} from '@aprumo/ui';
import { CURRENT_USER_ID } from '../../data/seed';
import { currentStep, isSupabaseConfigured, signOut } from '../../data/supabase';
import { actions, alertsForCase, db, outbox, syncNow, useStore } from '../../data/store';
import { SyncPill } from './shared';
import './pro-a11y.css';
import './pro-screens.css';

type NavItem = { to: string; label: string; icon: ReactNode; end?: boolean };
const NAV_GROUPS: { id: string; label: string; items: NavItem[] }[] = [
  { id: 'trabalho', label: 'Trabalho', items: [
    { to: '/app', label: 'Início', icon: <IconHome />, end: true },
    { to: '/app/casos', label: 'Casos', icon: <IconCases /> },
  ] },
  { id: 'clinica', label: 'Decisão & Clínica', items: [
    { to: '/app/alertas', label: 'Alertas', icon: <IconBell /> },
    { to: '/app/supervisao', label: 'Supervisão', icon: <IconShield /> },
  ] },
  { id: 'recursos', label: 'Recursos & Ferramentas', items: [
    { to: '/app/recursos', label: 'Resource Studio', icon: <IconLibrary /> },
    { to: '/app/ferramentas/plano-individual', label: 'Construtor de Plano', icon: <IconRoute /> },
  ] },
  { id: 'org', label: 'Organização', items: [
    { to: '/app/equipe', label: 'Equipe', icon: <IconTeam /> },
    { to: '/app/configuracoes', label: 'Configurações', icon: <IconSettings /> },
  ] },
];
const NAV_COLLAPSE_KEY = 'aprumo.pro.nav.collapsed';
function readCollapsed(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(NAV_COLLAPSE_KEY) ?? '{}') as Record<string, boolean>;
  } catch {
    return {};
  }
}

export default function ProLayout() {
  const [open, setOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [quickSessionOpen, setQuickSessionOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<'all' | 'clinical' | 'family' | 'system'>('all');
  const loc = useLocation();
  const nav = useNavigate();
  const me = db.professional(CURRENT_USER_ID)!;
  const st = useStore((s) => s);
  const settings = st.settings;
  const navRef = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(readCollapsed);
  const isActive = (to: string, end?: boolean) =>
    end ? loc.pathname === to : loc.pathname === to || loc.pathname.startsWith(`${to}/`);
  const toggleGroup = (id: string) =>
    setCollapsed((c) => {
      const next = { ...c, [id]: !c[id] };
      try {
        localStorage.setItem(NAV_COLLAPSE_KEY, JSON.stringify(next));
      } catch {
        /* armazenamento indisponível: preferência só nesta sessão */
      }
      return next;
    });

  // Ao navegar, o grupo da página atual se abre e o item ativo fica visível na lista rolável.
  useEffect(() => {
    const g = NAV_GROUPS.find((gr) => gr.items.some((it) => isActive(it.to, it.end)));
    if (g) setCollapsed((c) => (c[g.id] ? { ...c, [g.id]: false } : c));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname]);
  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLElement>('a[aria-current="page"]');
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [loc.pathname, collapsed]);

  const myCases = useMemo(
    () => st.cases.filter((c) => c.team.some((m) => m.professionalId === me.id) && c.status === 'active'),
    [st.cases, me.id],
  );

  const alertCount = useMemo(
    () => myCases.reduce((n, c) => n + alertsForCase(st, c.id).length, 0),
    [myCases, st],
  );

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.legible = String(settings.legibleFont);
  }, [settings.theme, settings.legibleFont]);

  useEffect(() => {
    void syncNow();
  }, []);

  // Com autenticação real, o painel só abre com sessão em AAL2 (senha + segundo fator).
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void currentStep().then((s) => {
      if (s.kind !== 'ready') nav('/entrar', { replace: true });
    });
  }, [nav]);

  // Tecla de atalho global Ctrl+K / Cmd+K para Command Palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const logout = async () => {
    await syncNow();
    if ((await outbox?.count()) === 0) await outbox?.wipe();
    await signOut();
    nav('/');
  };

  // Itens para Command Palette
  const commandItems = useMemo(() => {
    const caseItems = st.cases.map((c) => {
      const child = db.childOf(c);
      return {
        id: `/app/casos/${c.id}`,
        title: `Caso: ${child.preferredName} (${c.model})`,
        category: 'Casos Clínicos',
        icon: <IconCases style={{ width: 16 }} />,
      };
    });

    const routeItems = [
      { id: '/app', title: 'Início / Dashboard', category: 'Navegação', icon: <IconHome style={{ width: 16 }} /> },
      { id: '/app/casos', title: 'Casos Clínicos', category: 'Navegação', icon: <IconCases style={{ width: 16 }} /> },
      { id: '/app/casos/novo', title: 'Criar Novo Caso', category: 'Ações Rápidas', icon: <IconPlus style={{ width: 16 }} /> },
      { id: '/app/ferramentas/plano-individual', title: 'Construtor de Plano Individual (PEI / PIC / ABA)', category: 'Ferramentas', icon: <IconRoute style={{ width: 16 }} /> },
      { id: '/app/recursos', title: 'Aprumo Resource Studio', category: 'Recursos', icon: <IconLibrary style={{ width: 16 }} /> },
      { id: '/app/alertas', title: 'Central de Alertas Clínicos', category: 'Decisão', icon: <IconBell style={{ width: 16 }} /> },
      { id: '/app/supervisao', title: 'Supervisão e Fidelidade (IOA)', category: 'Clínica', icon: <IconShield style={{ width: 16 }} /> },
      { id: '/app/equipe', title: 'Equipe e Permissões', category: 'Organização', icon: <IconTeam style={{ width: 16 }} /> },
      { id: '/app/configuracoes', title: 'Configurações do Aparelho', category: 'Organização', icon: <IconSettings style={{ width: 16 }} /> },
      { id: '/familia', title: 'Portal da Família (Demo)', category: 'Portais', icon: <IconHeart style={{ width: 16 }} /> },
    ];

    return [...routeItems, ...caseItems];
  }, [st.cases]);

  // Lista de notificações de demonstração
  const notifications = useMemo(() => [
    { id: 'n1', title: 'Critério de domínio possivelmente atingido', desc: 'Téo completou 3 sessões consecutivas ≥ 80% no alvo "Aponta figuras".', kind: 'clinical', time: 'há 10 min' },
    { id: 'n2', title: 'Avaliação de preferência requer revisão', desc: 'A avaliação MSWO de Davi vence em 4 dias.', kind: 'clinical', time: 'há 2 horas' },
    { id: 'n3', title: 'Registro de tarefa familiar recebido', desc: 'Mãe de Téo registrou 5 oportunidades de generalização em casa.', kind: 'family', time: 'ontem' },
    { id: 'n4', title: 'Sincronização offline ativa', desc: 'Todos os registros locais estão criptografados e atualizados.', kind: 'system', time: 'agora' },
  ], []);

  const filteredNotifs = notifications.filter((n) => notifTab === 'all' || n.kind === notifTab);

  return (
    <div className="pro-shell">
      <a className="ap-skip-link" href="#main">Pular para o conteúdo</a>
      {open && <button type="button" className="pro-scrim" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      
      <aside className="pro-sidebar" data-open={open} aria-label="Navegação do profissional">
        <div className="pro-sidebar__head">
          <Logo href="/app" />
          <Button className="pro-menu-close" variant="ghost" iconOnly icon={<IconX />} onClick={() => setOpen(false)}>Fechar menu</Button>
        </div>

        <nav className="pro-nav" aria-label="Seções do painel" ref={navRef}>
          {NAV_GROUPS.map((g) => {
            const expanded = !collapsed[g.id];
            const listId = `pro-nav-${g.id}`;
            return (
              <div className="pro-nav__group" key={g.id}>
                <button
                  type="button"
                  className="pro-nav__label"
                  aria-expanded={expanded}
                  aria-controls={listId}
                  onClick={() => toggleGroup(g.id)}
                >
                  <span>{g.label}</span>
                  <IconChevronRight className="pro-nav__chev" aria-hidden="true" />
                </button>
                <div id={listId} className="pro-nav__items" hidden={!expanded}>
                  {g.items.map((it) => (
                    <NavLink key={it.to} to={it.to} end={it.end}>
                      {it.icon}
                      <span className="pro-nav__text">{it.label}</span>
                      {it.to === '/app/alertas' && alertCount > 0 && (
                        <span className="pro-nav__count" aria-label={`${alertCount} alertas`}>{alertCount}</span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="pro-sidebar__foot">
          <Link to="/" className="pro-site-link">
            <IconChevronLeft aria-hidden="true" />
            <span>Voltar ao site</span>
          </Link>
          <div className="pro-user">
            <span className="pro-user__avatar" aria-hidden="true">{me.shortName[0]}</span>
            <div className="pro-user__info">
              <div className="pro-user__name">{me.name}</div>
              <div className="pro-user__role">{me.role}</div>
            </div>
            <Button variant="ghost" iconOnly icon={<IconLogout />} onClick={() => void logout()}>Sair da conta</Button>
          </div>
        </div>
      </aside>

      <div className="pro-main">
        <div className="pro-demo-banner">Ambiente de demonstração · todos os casos e dados são fictícios</div>
        <header className="pro-topbar">
          <Button className="pro-menu-btn" variant="ghost" iconOnly icon={<IconMenu />} aria-expanded={open} onClick={() => setOpen((o) => !o)}>Menu</Button>
          <span className="pro-topbar__logo"><Logo href="/app" /></span>
          
          {/* Botão de busca rápida Command Palette */}
          <button
            type="button"
            className="pro-cmd-trigger ap-row"
            onClick={() => setCmdOpen(true)}
            aria-label="Abrir busca rápida (Ctrl+K)"
          >
            <IconSearch className="pro-cmd-trigger__icon" />
            <span>Buscar casos, ferramentas ou páginas…</span>
            <kbd className="ap-kbd">Ctrl K</kbd>
          </button>

          <div className="ap-row pro-topbar__actions">
            <Button className="pro-search-btn" variant="ghost" iconOnly icon={<IconSearch />} onClick={() => setCmdOpen(true)}>Buscar</Button>
            <Button
              variant="ghost"
              iconOnly
              icon={<IconBell />}
              aria-label={`Notificações ${alertCount > 0 ? `(${alertCount})` : ''}`}
              onClick={() => setNotifOpen(true)}
            >
              {alertCount > 0 && <span className="pro-notif-dot" />}
            </Button>
            <SyncPill />
            <Button
              className="pro-theme-btn"
              variant="ghost"
              iconOnly
              icon={settings.theme === 'dark' ? <IconSun /> : <IconMoon />}
              onClick={() => actions.updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            >
              {settings.theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
            </Button>
          </div>
        </header>

        <main id="main" className="pro-content">
          <Outlet />
        </main>
      </div>

      {/* Navegação inferior móvel: ergonômica com o polegar no celular */}
      <nav className="pro-tabbar" aria-label="Navegação principal">
        <NavLink to="/app" end><IconHome /><span>Início</span></NavLink>
        <NavLink to="/app/casos"><IconCases /><span>Casos</span></NavLink>
        
        {/* Ação central destacada: Registrar / Iniciar Sessão */}
        <button
          type="button"
          className="pro-tabbar__record"
          onClick={() => setQuickSessionOpen(true)}
          aria-label="Registrar atendimento clínico"
        >
          <IconPlay />
          <span>Registrar</span>
        </button>

        <NavLink to="/app/alertas">
          <IconBell />
          <span>Alertas</span>
          {alertCount > 0 && <i aria-label={`${alertCount} alertas`}>{alertCount}</i>}
        </NavLink>
        <button type="button" onClick={() => setOpen(true)} aria-expanded={open}><IconMenu /><span>Mais</span></button>
      </nav>

      {/* Drawer de Notificações */}
      <Drawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="Notificações e Avisos"
        position="right"
      >
        <div className="ap-stack">
          <Tabs
            active={notifTab}
            onChange={setNotifTab}
            items={[
              { id: 'all', label: 'Todas' },
              { id: 'clinical', label: 'Clínica' },
              { id: 'family', label: 'Família' },
              { id: 'system', label: 'Sistema' },
            ]}
          />
          <ul className="pro-list">
            {filteredNotifs.map((n) => (
              <li key={n.id} className="ap-card pro-notif">
                <div className="pro-list__row">
                  <strong className="ap-small">{n.title}</strong>
                  <span className="ap-xs ap-muted">{n.time}</span>
                </div>
                <p className="ap-small ap-muted pro-notif__desc">{n.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </Drawer>

      {/* Modal de Início Rápido de Sessão */}
      <Dialog
        open={quickSessionOpen}
        onClose={() => setQuickSessionOpen(false)}
        title="Iniciar Sessão Clínica"
        description="Selecione o caso para abrir o SessionRunner ou continuar o atendimento."
      >
        <div className="ap-stack pro-gap-sm">
          {myCases.length === 0 && <p className="pro-empty-line">Nenhum caso ativo vinculado a você.</p>}
          {myCases.map((c) => {
            const child = db.childOf(c);
            const activeSession = st.sessions.find((s) => s.caseId === c.id && s.status === 'active');
            return (
              <div key={c.id} className="ap-card pro-quick-case">
                <div className="pro-min0">
                  <strong>{child.preferredName}</strong>
                  <div className="ap-xs ap-muted">Modelo {c.model} · Plano v{c.planVersion}</div>
                </div>
                {activeSession ? (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<IconClock />}
                    onClick={() => {
                      setQuickSessionOpen(false);
                      nav(`/app/sessao/${activeSession.id}`);
                    }}
                  >
                    Continuar sessão
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    icon={<IconPlay />}
                    onClick={() => {
                      setQuickSessionOpen(false);
                      const s = actions.startSession(c.id, 'clinic');
                      nav(`/app/sessao/${s.id}`);
                    }}
                  >
                    Iniciar nova
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Dialog>

      {/* Command Palette acessível com Ctrl+K */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        items={commandItems}
        onSelect={(path) => nav(path)}
      />
    </div>
  );
}
