import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import {
  Button,
  CommandPalette,
  Dialog,
  Drawer,
  IconBell,
  IconCases,
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
        <div className="ap-row" style={{ justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
          <Logo href="/app" />
          <Button className="pro-menu-close" variant="ghost" iconOnly icon={<IconX />} onClick={() => setOpen(false)}>Fechar menu</Button>
        </div>

        <nav className="pro-nav">
          <span className="pro-nav__label">Trabalho</span>
          <NavLink to="/app" end><IconHome /> Início</NavLink>
          <NavLink to="/app/casos"><IconCases /> Casos</NavLink>
          
          <span className="pro-nav__label">Decisão & Clínica</span>
          <NavLink to="/app/alertas">
            <IconBell /> Alertas {alertCount > 0 && <span className="pro-nav__count" aria-label={`${alertCount} alertas`}>{alertCount}</span>}
          </NavLink>
          <NavLink to="/app/supervisao"><IconShield /> Supervisão</NavLink>
          
          <span className="pro-nav__label">Recursos & Ferramentas</span>
          <NavLink to="/app/recursos"><IconLibrary /> Resource Studio</NavLink>
          <NavLink to="/app/ferramentas/plano-individual"><IconRoute /> Construtor de Plano</NavLink>

          <span className="pro-nav__label">Organização</span>
          <NavLink to="/app/equipe"><IconTeam /> Equipe</NavLink>
          <NavLink to="/app/configuracoes"><IconSettings /> Configurações</NavLink>
        </nav>

        <div className="pro-user">
          <span className="pro-user__avatar" aria-hidden="true">{me.shortName[0]}</span>
          <div style={{ minWidth: 0 }}>
            <div className="pro-user__name">{me.name}</div>
            <div className="pro-user__role">{me.role}</div>
          </div>
          <Button variant="ghost" iconOnly icon={<IconLogout />} onClick={() => void logout()}>Sair</Button>
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
            <IconSearch style={{ width: 16 }} />
            <span>Buscar casos, ferramentas ou páginas…</span>
            <kbd className="ap-kbd">Ctrl K</kbd>
          </button>

          <div className="ap-row pro-topbar__actions">
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
        <div className="ap-stack" style={{ gap: '1rem' }}>
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
          <ul className="ap-stack" style={{ listStyle: 'none', margin: 0, padding: 0, gap: '0.75rem' }}>
            {filteredNotifs.map((n) => (
              <li key={n.id} className="ap-card" style={{ padding: '0.85rem' }}>
                <div className="ap-row" style={{ justifyContent: 'space-between' }}>
                  <strong className="ap-small">{n.title}</strong>
                  <span className="ap-xs ap-muted">{n.time}</span>
                </div>
                <p className="ap-small ap-muted" style={{ margin: '0.3rem 0 0 0' }}>{n.desc}</p>
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
        <div className="ap-stack" style={{ gap: '0.75rem' }}>
          {myCases.map((c) => {
            const child = db.childOf(c);
            const activeSession = st.sessions.find((s) => s.caseId === c.id && s.status === 'active');
            return (
              <div key={c.id} className="ap-card ap-row" style={{ padding: '0.85rem 1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: 'var(--ap-text-md)' }}>{child.preferredName}</strong>
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
