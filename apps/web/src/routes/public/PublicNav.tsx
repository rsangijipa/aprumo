import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { Link, useLocation } from 'react-router';
import {
  IconArrowRight,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconLock,
  IconMenu,
  IconShield,
  IconX,
  Logo,
} from '@aprumo/ui';
import { INSTITUTION_CONFIG } from '../../config/institution';
import './landing.css';

/* ==========================================================================
   Mapa de navegação pública — fonte única para cabeçalho, gaveta e trilha.
   ========================================================================== */
interface NavLeaf {
  href: string;
  label: string;
  desc?: string;
}
type NavEntry =
  | { kind: 'link'; href: string; label: string }
  | { kind: 'menu'; id: string; label: string; items: NavLeaf[] };

const AUDIENCES: NavLeaf[] = [
  { href: '/profissionais', label: 'Profissionais', desc: 'Supervisores, terapeutas e acompanhantes terapêuticos' },
  { href: '/familias', label: 'Famílias', desc: 'Acompanhar a evolução e apoiar em casa' },
  { href: '/criancas', label: 'Crianças', desc: 'Ambiente lúdico, protegido e sensorialmente calmo' },
  { href: '/adolescentes', label: 'Adolescentes', desc: 'Autonomia com visual adequado à idade' },
];

const RESOURCES: NavLeaf[] = [
  { href: '/recursos-terapeuticos', label: 'Recursos terapêuticos', desc: 'Suportes visuais e CAA para tela e impressão' },
  { href: '/games', label: 'Games', desc: 'Jogos com registro clínico padronizado' },
  { href: '/supervisao-clinica', label: 'Supervisão clínica', desc: 'Fidelidade, IOA e treino da equipe' },
  { href: '/dados-metricas', label: 'Dados e métricas', desc: 'Análise visual e regras transparentes' },
];

const PRIMARY_NAV: NavEntry[] = [
  { kind: 'link', href: '/produto', label: 'Produto' },
  { kind: 'menu', id: 'para-quem', label: 'Para quem', items: AUDIENCES },
  { kind: 'menu', id: 'recursos', label: 'Recursos', items: RESOURCES },
  { kind: 'link', href: '/como-funciona', label: 'Como funciona' },
  { kind: 'link', href: '/seguranca-privacidade', label: 'Segurança' },
];

const DRAWER_GROUPS: Array<{ title: string; items: NavLeaf[] }> = [
  {
    title: 'Plataforma',
    items: [
      { href: '/', label: 'Início' },
      { href: '/produto', label: 'Produto' },
      { href: '/como-funciona', label: 'Como funciona' },
      { href: '/seguranca-privacidade', label: 'Segurança e privacidade' },
    ],
  },
  { title: 'Para quem', items: AUDIENCES },
  { title: 'Recursos', items: RESOURCES },
  {
    title: 'Institucional',
    items: [
      { href: '/sobre', label: 'Sobre o Aprumo' },
      { href: '/ajuda', label: 'Ajuda' },
      { href: '/contato', label: 'Contato' },
    ],
  },
];

/** Rótulos curtos usados na trilha de navegação das páginas dedicadas. */
const PAGE_LABELS: Record<string, string> = Object.fromEntries(
  DRAWER_GROUPS.flatMap((g) => g.items).map((i) => [i.href, i.label]),
);

const isActivePath = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* ==========================================================================
   Cabeçalho
   ========================================================================== */
export function PublicHeader() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Fecha tudo ao trocar de rota.
  useEffect(() => {
    setOpenMenu(null);
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Clique/toque fora fecha o menu suspenso.
  useEffect(() => {
    if (!openMenu) return;
    const onPointer = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [openMenu]);

  const closeDrawer = useCallback(() => {
    setDrawer(false);
    menuBtnRef.current?.focus();
  }, []);

  return (
    <>
      <header className="lp-header" data-scrolled={scrolled}>
        <div className="lp-wrap lp-header__in">
          <Logo href="/" />

          <nav ref={navRef} className="lp-nav" aria-label="Navegação principal">
            <ul className="lp-nav__list">
              {PRIMARY_NAV.map((entry) =>
                entry.kind === 'link' ? (
                  <li key={entry.href}>
                    <Link
                      to={entry.href}
                      className="lp-nav__link"
                      aria-current={isActivePath(pathname, entry.href) ? 'page' : undefined}
                    >
                      {entry.label}
                    </Link>
                  </li>
                ) : (
                  <li key={entry.id}>
                    <NavMenu
                      entry={entry}
                      pathname={pathname}
                      open={openMenu === entry.id}
                      onOpenChange={(o) => setOpenMenu(o ? entry.id : null)}
                    />
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="lp-header__actions">
            <Link className="ap-btn ap-btn--ghost lp-header__enter" to="/entrar">
              Entrar
            </Link>
            <Link className="ap-btn ap-btn--primary lp-header__cta" to="/entrar">
              Ver demonstração
            </Link>
            <button
              ref={menuBtnRef}
              type="button"
              className="lp-menu-btn"
              aria-expanded={drawer}
              aria-controls="lp-drawer"
              aria-label="Abrir menu de navegação"
              onClick={() => setDrawer(true)}
            >
              <IconMenu />
            </button>
          </div>
        </div>
      </header>

      {/* Fora do <header>: o backdrop-filter criaria um bloco de contenção para position:fixed. */}
      {drawer && <MobileDrawer pathname={pathname} onClose={closeDrawer} />}
    </>
  );
}

function NavMenu({
  entry,
  pathname,
  open,
  onOpenChange,
}: {
  entry: Extract<NavEntry, { kind: 'menu' }>;
  pathname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const panelId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const active = entry.items.some((i) => isActivePath(pathname, i.href));
  const focusItem = (idx: number) => {
    const items = panelRef.current?.querySelectorAll<HTMLAnchorElement>('a');
    if (!items?.length) return;
    items[(idx + items.length) % items.length]?.focus();
  };

  const onBtnKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onOpenChange(true);
      setTimeout(() => focusItem(0), 0);
    } else if (e.key === 'Escape' && open) {
      onOpenChange(false);
    }
  };

  const onPanelKey = (e: ReactKeyboardEvent) => {
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>('a') ?? []);
    const idx = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      onOpenChange(false);
      btnRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusItem(idx + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusItem(idx - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusItem(items.length - 1);
    }
  };

  return (
    <div
      className="lp-dd"
      onBlur={(e) => {
        if (open && !e.currentTarget.contains(e.relatedTarget as Node | null)) onOpenChange(false);
      }}
    >
      <button
        ref={btnRef}
        type="button"
        className="lp-nav__link"
        aria-expanded={open}
        aria-controls={panelId}
        data-active={active || undefined}
        onClick={() => onOpenChange(!open)}
        onKeyDown={onBtnKey}
      >
        {entry.label}
        <IconChevronRight className="lp-nav__chev" />
      </button>
      {open && (
        // O teclado é delegado: setas/Home/End movem o foco entre os links (focáveis) da lista.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <ul id={panelId} ref={panelRef} className="lp-dd__panel" onKeyDown={onPanelKey}>
          {entry.items.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="lp-dd__item"
                aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
                onClick={() => onOpenChange(false)}
              >
                <strong>{item.label}</strong>
                {item.desc && <span>{item.desc}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MobileDrawer({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLElement>('.lp-drawer__close')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const nodes = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!nodes.length) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    // Fecha se a janela crescer até o layout de desktop.
    const mq = window.matchMedia('(min-width: 1061px)');
    const onMq = () => mq.matches && onClose();

    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [onClose]);

  return (
    <>
      <div className="lp-drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={ref} id="lp-drawer" className="lp-drawer" role="dialog" aria-modal="true" aria-label="Menu de navegação">
        <div className="lp-drawer__head">
          <Logo href="/" />
          <button type="button" className="lp-menu-btn lp-menu-btn--show lp-drawer__close" aria-label="Fechar menu" onClick={onClose}>
            <IconX />
          </button>
        </div>
        <nav className="lp-drawer__body" aria-label="Navegação principal">
          {DRAWER_GROUPS.map((group) => (
            <div key={group.title} className="lp-drawer__group">
              <h2 className="lp-drawer__title">{group.title}</h2>
              <ul>
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="lp-drawer__link"
                      aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
                      onClick={onClose}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="lp-drawer__foot">
          <Link className="ap-btn ap-btn--primary" to="/entrar" onClick={onClose}>
            Ver demonstração
          </Link>
          <Link className="ap-btn" to="/entrar" onClick={onClose}>
            Entrar
          </Link>
        </div>
      </div>
    </>
  );
}

/* ==========================================================================
   Rodapé
   ========================================================================== */
export function PublicFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap">
        <div className="lp-footer__grid">
          <div className="lp-footer__col lp-footer__col--brand">
            <Logo href="/" />
            <p className="lp-footer__mission">
              Plataforma clínica para planejar, aplicar e analisar intervenções em ABA e no Modelo Denver de
              Intervenção Precoce (ESDM), com o alvo clínico no centro de cada decisão.
            </p>
            <div className="lp-footer__legal">
              <span><strong>{INSTITUTION_CONFIG.companyName}</strong> · CNPJ {INSTITUTION_CONFIG.cnpj}</span>
              <span>Responsável técnico: {INSTITUTION_CONFIG.technicalLead} ({INSTITUTION_CONFIG.councilRegistration})</span>
              <span>
                Encarregado de dados (LGPD, art. 41):{' '}
                <a href={`mailto:${INSTITUTION_CONFIG.dpoEmail}`}>{INSTITUTION_CONFIG.dpoEmail}</a>
              </span>
              <span>Hospedagem dos dados: {INSTITUTION_CONFIG.dataRegion}</span>
            </div>
            <div className="lp-footer__badges">
              <span className="ap-badge"><IconShield /> LGPD e ECA Digital</span>
              <span className="ap-badge"><IconLock /> Registro imutável</span>
              <span className="ap-badge"><IconEye /> WCAG 2.2 AA</span>
            </div>
          </div>

          <FooterCol
            title="Plataforma"
            links={[
              ['/produto', 'Produto'],
              ['/como-funciona', 'Como funciona'],
              ['/recursos-terapeuticos', 'Recursos terapêuticos'],
              ['/games', 'Games'],
              ['/supervisao-clinica', 'Supervisão clínica'],
              ['/dados-metricas', 'Dados e métricas'],
            ]}
          />
          <FooterCol
            title="Para quem"
            links={[
              ['/profissionais', 'Profissionais'],
              ['/profissionais#at', 'Acompanhantes terapêuticos'],
              ['/familias', 'Famílias'],
              ['/criancas', 'Crianças'],
              ['/adolescentes', 'Adolescentes'],
            ]}
          />
          <FooterCol
            title="Institucional"
            links={[
              ['/sobre', 'Sobre o Aprumo'],
              ['/sobre#fundamentacao', 'Fundamentação científica'],
              ['/sobre#acessibilidade', 'Acessibilidade'],
              ['/ajuda', 'Ajuda'],
              ['/contato', 'Contato'],
            ]}
          />
        </div>

        <div className="lp-footer__bottom">
          <p>
            © {new Date().getFullYear()} Aprumo. O Aprumo é um instrumento de apoio e não substitui o julgamento clínico
            do profissional responsável.
          </p>
          <ul className="lp-footer__bottom-links">
            <li><Link to="/seguranca-privacidade">Privacidade</Link></li>
            <li><Link to="/seguranca-privacidade#termos">Termos de uso</Link></li>
            <li><Link to="/seguranca-privacidade#seguranca">Segurança</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<[string, string]> }) {
  const id = useId();
  return (
    <nav className="lp-footer__col" aria-labelledby={id}>
      <h2 id={id} className="lp-footer__title">{title}</h2>
      <ul className="lp-footer__links">
        {links.map(([href, label]) => (
          <li key={href}><Link to={href}>{label}</Link></li>
        ))}
      </ul>
    </nav>
  );
}

/* ==========================================================================
   Blocos compartilhados das páginas públicas
   ========================================================================== */

/** Link que aceita rotas internas e URLs externas (mailto:, https:). */
export function SmartLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  if (/^(mailto:|tel:|https?:)/.test(to)) {
    return <a href={to} className={className}>{children}</a>;
  }
  return <Link to={to} className={className}>{children}</Link>;
}

export function Section({
  id,
  eyebrow,
  title,
  lead,
  sunken,
  center,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  sunken?: boolean;
  center?: boolean;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section
      id={id}
      className={`lp-section${sunken ? ' lp-section--sunken' : ''}`}
      aria-labelledby={title ? headingId : undefined}
    >
      <div className="lp-wrap">
        {(eyebrow || title || lead) && (
          <div className={`lp-head${center ? ' lp-head--center' : ''}`}>
            {eyebrow && <span className="ap-eyebrow">{eyebrow}</span>}
            {title && <h2 id={headingId} className="lp-h2 ap-display">{title}</h2>}
            {lead && <p className="lp-sub">{lead}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function FeatureCard({
  title,
  icon,
  kicker,
  items,
  foot,
  id,
  variant,
  children,
}: {
  title: ReactNode;
  icon?: ReactNode;
  kicker?: string;
  items?: string[];
  foot?: ReactNode;
  id?: string;
  variant?: 'aba' | 'denver';
  children?: ReactNode;
}) {
  return (
    <article id={id} className={`lp-card${variant ? ` lp-card--${variant}` : ''}`}>
      {icon && <span className="lp-card__icon" aria-hidden="true">{icon}</span>}
      {kicker && <span className="lp-card__kicker">{kicker}</span>}
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {items && (
        <ul className="lp-checks">
          {items.map((it) => (
            <li key={it}><IconCheck /> <span>{it}</span></li>
          ))}
        </ul>
      )}
      {foot && <div className="lp-card__foot">{foot}</div>}
    </article>
  );
}

export interface CtaConfig {
  title: ReactNode;
  text?: ReactNode;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}

const DEFAULT_CTA: CtaConfig = {
  title: 'Veja o Aprumo funcionando com casos fictícios',
  text: 'A demonstração traz casos em ABA e no Modelo Denver, prontos para explorar sem cadastro.',
  primary: { label: 'Explorar demonstração', href: '/entrar' },
  secondary: { label: 'Falar com a equipe', href: '/contato' },
};

export function CtaBand({ title, text, primary, secondary }: CtaConfig) {
  const id = useId();
  return (
    <section className="lp-section" aria-labelledby={id}>
      <div className="lp-wrap">
        <div className="lp-cta">
          <h2 id={id} className="ap-display">{title}</h2>
          {text && <p>{text}</p>}
          <div className="lp-cta__actions">
            <SmartLink to={primary.href} className="ap-btn ap-btn--primary ap-btn--lg">
              {primary.label} <IconArrowRight />
            </SmartLink>
            {secondary && (
              <SmartLink to={secondary.href} className="ap-btn ap-btn--lg ap-btn--ghost-light">
                {secondary.label}
              </SmartLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Layout das páginas dedicadas
   ========================================================================== */
export function PublicPageLayout({
  children,
  eyebrow,
  title,
  lead,
  ctaText = 'Explorar demonstração',
  ctaHref = '/entrar',
  secondaryCtaText,
  secondaryCtaHref,
  closing = DEFAULT_CTA,
}: {
  children: ReactNode;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  /** CTA final da página; `false` para omitir. */
  closing?: CtaConfig | false;
}) {
  const { pathname } = useLocation();
  const crumb = PAGE_LABELS[pathname];

  return (
    <div className="lp">
      <a className="ap-skip-link" href="#conteudo">Pular para o conteúdo principal</a>
      <PublicHeader />

      <main id="conteudo" tabIndex={-1}>
        <section className="lp-page-hero">
          <div className="lp-wrap">
            <nav className="lp-crumbs" aria-label="Trilha de navegação">
              <ol>
                <li>
                  <Link to="/"><IconChevronLeft /> Início</Link>
                </li>
                {crumb && (
                  <>
                    <li className="lp-crumbs__sep" aria-hidden="true">/</li>
                    <li><span aria-current="page">{crumb}</span></li>
                  </>
                )}
              </ol>
            </nav>
            <div className="lp-page-hero__in">
              {eyebrow && <span className="ap-eyebrow">{eyebrow}</span>}
              <h1 className="ap-display">{title}</h1>
              {lead && <p className="lp-hero__lead">{lead}</p>}
              <div className="lp-hero__cta">
                <SmartLink className="ap-btn ap-btn--primary ap-btn--lg" to={ctaHref}>
                  {ctaText} <IconArrowRight />
                </SmartLink>
                {secondaryCtaText && secondaryCtaHref && (
                  <SmartLink className="ap-btn ap-btn--lg" to={secondaryCtaHref}>
                    {secondaryCtaText}
                  </SmartLink>
                )}
              </div>
            </div>
          </div>
        </section>

        {children}

        {closing && <CtaBand {...closing} />}
      </main>

      <PublicFooter />
    </div>
  );
}
