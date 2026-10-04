import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import {
  Button,
  IconBell,
  IconCases,
  IconHome,
  IconLibrary,
  IconLogout,
  IconMenu,
  IconMoon,
  IconSearch,
  IconSettings,
  IconShield,
  IconSun,
  IconTeam,
  IconX,
  Logo,
} from '@aprumo/ui';
import { CURRENT_USER_ID } from '../../data/seed';
import { currentStep, isSupabaseConfigured, signOut } from '../../data/supabase';
import { actions, alertsForCase, db, outbox, syncNow, useStore } from '../../data/store';
import { SyncPill } from './shared';

export default function ProLayout() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const me = db.professional(CURRENT_USER_ID)!;
  const st = useStore((s) => s);
  const settings = st.settings;
  const alertCount = useMemo(
    () => st.cases.filter((c) => c.team.some((m) => m.professionalId === me.id)).reduce((n, c) => n + alertsForCase(st, c.id).length, 0),
    [st, me.id],
  );

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
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

  const logout = async () => {
    // Só limpa a fila do aparelho depois que tudo foi confirmado pelo servidor.
    await syncNow();
    if ((await outbox?.count()) === 0) await outbox?.wipe();
    await signOut();
    nav('/');
  };

  const search = (q: string) => {
    const query = q.trim().toLowerCase();
    if (!query) return;
    const hit = st.cases.find((c) => db.childOf(c).preferredName.toLowerCase().startsWith(query));
    if (hit) nav(`/app/casos/${hit.id}`);
  };

  return (
    <div className="pro-shell">
      <a className="ap-skip-link" href="#main">Pular para o conteúdo</a>
      {open && <button type="button" className="pro-scrim" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      <aside className="pro-sidebar" data-open={open} aria-label="Navegação do profissional">
        <div className="ap-row" style={{ justifyContent: 'space-between' }}>
          <Logo href="/app" />
          <Button className="pro-menu-close" variant="ghost" iconOnly icon={<IconX />} onClick={() => setOpen(false)}>Fechar menu</Button>
        </div>
        <nav className="pro-nav">
          <NavLink to="/app" end><IconHome /> Início</NavLink>
          <NavLink to="/app/casos"><IconCases /> Casos</NavLink>
          <NavLink to="/app/alertas">
            <IconBell /> Alertas {alertCount > 0 && <span className="pro-nav__count" aria-label={`${alertCount} alertas`}>{alertCount}</span>}
          </NavLink>
          <NavLink to="/app/supervisao"><IconShield /> Supervisão</NavLink>
          <NavLink to="/app/recursos"><IconLibrary /> Recursos</NavLink>
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
          <form
            className="pro-search"
            data-open={searchOpen}
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              search(String(new FormData(e.currentTarget).get('q') ?? ''));
            }}
          >
            <IconSearch />
            <input name="q" className="ap-input" type="search" placeholder="Buscar caso pelo nome" aria-label="Buscar caso pelo nome de preferência" list="pro-case-names" />
            <datalist id="pro-case-names">{st.cases.map((c) => <option key={c.id} value={db.childOf(c).preferredName} />)}</datalist>
          </form>
          <div className="ap-row pro-topbar__actions">
            <Button className="pro-search-btn" variant="ghost" iconOnly icon={<IconSearch />} aria-expanded={searchOpen} onClick={() => setSearchOpen((o) => !o)}>Buscar</Button>
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

      {/* Navegação inferior: alcançável com o polegar no celular. */}
      <nav className="pro-tabbar" aria-label="Navegação principal">
        <NavLink to="/app" end><IconHome /><span>Início</span></NavLink>
        <NavLink to="/app/casos"><IconCases /><span>Casos</span></NavLink>
        <NavLink to="/app/alertas"><IconBell /><span>Alertas</span>{alertCount > 0 && <i aria-label={`${alertCount} alertas`}>{alertCount}</i>}</NavLink>
        <NavLink to="/app/supervisao"><IconShield /><span>Supervisão</span></NavLink>
        <button type="button" onClick={() => setOpen(true)} aria-expanded={open}><IconMenu /><span>Mais</span></button>
      </nav>
    </div>
  );
}
