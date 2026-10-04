import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import {
  IconArrowRight,
  IconEye,
  
  IconLock,
  IconMenu,
  IconShield,
  IconX,
  Logo,
} from '@aprumo/ui';
import { INSTITUTION_CONFIG } from '../../config/institution';
import './landing.css';

interface NavItem {
  href: string;
  label: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Início' },
  { href: '/produto', label: 'Produto' },
  { href: '/recursos-terapeuticos', label: 'Recursos' },
  { href: '/games', label: 'Games' },
  { href: '/profissionais', label: 'Profissionais' },
  { href: '/familias', label: 'Famílias' },
  { href: '/como-funciona', label: 'Como Funciona' },
  { href: '/ajuda', label: 'Ajuda' },
];

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="lp-header" data-scrolled={scrolled}>
      <div className="lp-wrap lp-header__in">
        <Logo href="/" />

        <nav id="lp-nav" className="lp-nav" data-open={menu} aria-label="Navegação institucional">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={isActive ? 'lp-nav__link--active' : undefined}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMenu(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <Link className="lp-nav__enter hide-desktop" to="/entrar" onClick={() => setMenu(false)}>
            Entrar no Sistema
          </Link>
        </nav>

        <div className="ap-row lp-header__cta">
          <Link className="ap-btn ap-btn--ghost hide-sm" to="/entrar">
            Entrar
          </Link>
          <Link className="ap-btn ap-btn--primary" to="/entrar">
            <span className="hide-sm">Explorar demonstração</span>
            <span className="show-sm">Demonstração</span>
          </Link>
          <button
            type="button"
            className="lp-menu-btn"
            aria-expanded={menu}
            aria-controls="lp-nav"
            aria-label={menu ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            onClick={() => setMenu((m) => !m)}
          >
            {menu ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="lp-footer" role="contentinfo">
      <div className="lp-wrap">
        <div className="lp-footer__grid">
          {/* Coluna 1: Marca & Responsabilidade Técnica */}
          <div className="lp-footer__col lp-footer__col--brand">
            <Logo href="/" />
            <p className="lp-footer__mission">
              Plataforma clínica para planejamento, aplicação e análise de intervenções em ABA e no Modelo Denver de Intervenção Precoce (ESDM). O alvo clínico no centro de cada decisão.
            </p>
            <div className="lp-footer__legal">
              <div><strong>{INSTITUTION_CONFIG.companyName}</strong> · CNPJ {INSTITUTION_CONFIG.cnpj}</div>
              <div>Responsável Técnico: {INSTITUTION_CONFIG.technicalLead} ({INSTITUTION_CONFIG.councilRegistration})</div>
              <div>Canal do Encarregado (DPO · LGPD art. 41): <a href={`mailto:${INSTITUTION_CONFIG.dpoEmail}`}>{INSTITUTION_CONFIG.dpoEmail}</a></div>
              <div>Hospedagem de dados em saúde: {INSTITUTION_CONFIG.dataRegion}</div>
            </div>
            <div className="lp-trust-pills" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="ap-badge"><IconShield /> LGPD & ECA Digital</span>
              <span className="ap-badge"><IconLock /> Prontuário Imutável</span>
              <span className="ap-badge"><IconEye /> WCAG 2.2 AA</span>
            </div>
          </div>

          {/* Coluna 2: Produto & Recursos */}
          <div className="lp-footer__col">
            <strong className="lp-footer__title">Produto & Recursos</strong>
            <ul className="lp-footer__links">
              <li><Link to="/produto">Visão Geral do Produto</Link></li>
              <li><Link to="/recursos-terapeuticos">Recursos Terapêuticos</Link></li>
              <li><Link to="/games">Catálogo de Games</Link></li>
              <li><Link to="/como-funciona">Ciclo Clínico em 4 Etapas</Link></li>
              <li><Link to="/supervisao-clinica">Supervisão & Fidelidade (IOA)</Link></li>
              <li><Link to="/dados-metricas">Dados, Métricas & Critério CDC</Link></li>
              <li><Link to="/app/ferramentas/plano-individual">Construtor de PEI / PIC</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Soluções por Perfil */}
          <div className="lp-footer__col">
            <strong className="lp-footer__title">Soluções por Perfil</strong>
            <ul className="lp-footer__links">
              <li><Link to="/profissionais">Para Psicólogos & Supervisores</Link></li>
              <li><Link to="/profissionais#at">Para Acompanhantes Terapêuticos</Link></li>
              <li><Link to="/familias">Para Famílias & Cuidadores</Link></li>
              <li><Link to="/criancas">Ambiente Infantil Seguro</Link></li>
              <li><Link to="/adolescentes">Ambiente Juvenil & Autonomia</Link></li>
              <li><Link to="/entrar">Acessar Demonstração Local</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Institucional & Apoio */}
          <div className="lp-footer__col">
            <strong className="lp-footer__title">Institucional & Apoio</strong>
            <ul className="lp-footer__links">
              <li><Link to="/sobre">Sobre o Aprumo</Link></li>
              <li><Link to="/sobre#fundamentacao">Fundamentação Científica</Link></li>
              <li><Link to="/ajuda">Central de Ajuda & FAQ</Link></li>
              <li><Link to="/contato">Contato & Suporte</Link></li>
              <li><Link to="/sobre#acessibilidade">Declaração de Acessibilidade</Link></li>
              <li><Link to="/seguranca-privacidade">Segurança & Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="lp-footer__bottom">
          <p>© {new Date().getFullYear()} Aprumo Intervenções Clínicas. Todos os direitos reservados. O Aprumo é instrumento de suporte; não substitui o julgamento clínico do profissional responsável.</p>
          <div className="lp-footer__bottom-links">
            <Link to="/seguranca-privacidade">Privacidade</Link>
            <span>·</span>
            <Link to="/seguranca-privacidade#termos">Termos de Uso</Link>
            <span>·</span>
            <Link to="/seguranca-privacidade#seguranca">Segurança</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicPageLayout({
  children,
  eyebrow,
  title,
  lead,
  ctaText = 'Explorar demonstração',
  ctaHref = '/entrar',
  secondaryCtaText,
  secondaryCtaHref,
  heroVisual,
}: {
  children: ReactNode;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  heroVisual?: ReactNode;
}) {
  return (
    <div className="lp">
      <a className="ap-skip-link" href="#conteudo">Pular para o conteúdo principal</a>
      <PublicHeader />

      <main id="conteudo">
        <section className="lp-hero">
          <div className="lp-wrap lp-hero__grid">
            <div>
              {eyebrow && <span className="ap-eyebrow">{eyebrow}</span>}
              <h1 className="ap-display">{title}</h1>
              {lead && <p className="lp-hero__lead">{lead}</p>}
              <div className="lp-hero__cta">
                <Link className="ap-btn ap-btn--primary ap-btn--lg" to={ctaHref}>
                  {ctaText} <IconArrowRight />
                </Link>
                {secondaryCtaText && secondaryCtaHref && (
                  <Link className="ap-btn ap-btn--lg" to={secondaryCtaHref}>
                    {secondaryCtaText}
                  </Link>
                )}
              </div>
            </div>
            {heroVisual && <div className="lp-hero__art">{heroVisual}</div>}
          </div>
        </section>

        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
