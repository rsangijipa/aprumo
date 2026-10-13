import { Link } from 'react-router';
import {
  IconArrowRight,
  IconCheck,
  IconCloudOff,
  IconEye,
  IconLock,
  IconShield,
  IconSpark,
  IconTarget,
} from '@aprumo/ui';
import { CtaBand, PublicFooter, PublicHeader } from './PublicNav';
import { GameIllustration } from '../../components/GameIllustration';
import './landing.css';

interface ExploreItem {
  href: string;
  title: string;
  text: string;
}

const EXPLORE: Array<{ title: string; items: ExploreItem[] }> = [
  {
    title: 'A plataforma',
    items: [
      { href: '/produto', title: 'Produto', text: 'Os módulos do plano à análise, em um único fluxo.' },
      { href: '/como-funciona', title: 'Como funciona', text: 'Planejar, aplicar, analisar e decidir, sem retrabalho.' },
      { href: '/supervisao-clinica', title: 'Supervisão clínica', text: 'Fidelidade procedural, IOA e treino da equipe.' },
      { href: '/dados-metricas', title: 'Dados e métricas', text: 'Análise visual com critério conservador e regras explícitas.' },
    ],
  },
  {
    title: 'Para quem',
    items: [
      { href: '/profissionais', title: 'Profissionais', text: 'Supervisores, aplicadores e ATs, cada um com sua ferramenta.' },
      { href: '/familias', title: 'Famílias', text: 'Progresso em linguagem simples e orientações para casa.' },
      { href: '/criancas', title: 'Crianças', text: 'Ambiente lúdico, sem anúncios e sensorialmente calmo.' },
      { href: '/adolescentes', title: 'Adolescentes', text: 'Habilidades para a vida real, com visual adequado à idade.' },
    ],
  },
  {
    title: 'Recursos e confiança',
    items: [
      { href: '/recursos-terapeuticos', title: 'Recursos terapêuticos', text: 'Suportes visuais e CAA para tela e impressão.' },
      { href: '/games', title: 'Games', text: 'Jogos com propósito clínico e registro padronizado.' },
      { href: '/seguranca-privacidade', title: 'Segurança e privacidade', text: 'LGPD, ECA Digital e prontuário imutável.' },
      { href: '/sobre', title: 'Sobre o Aprumo', text: 'Origem, fundamentação científica e acessibilidade.' },
    ],
  },
];

const TRUST = [
  { icon: <IconShield />, title: 'LGPD e ECA Digital', text: 'Dados de saúde de crianças tratados com consentimento e finalidade definida.' },
  { icon: <IconLock />, title: 'Registro imutável', text: 'Correções viram adendos com autor, data e motivo.' },
  { icon: <IconCloudOff />, title: 'Funciona sem internet', text: 'A sessão continua offline e sincroniza sem perder tentativas.' },
  { icon: <IconEye />, title: 'Acessibilidade WCAG 2.2 AA', text: 'Contraste verificado, alvos de toque amplos e movimento reduzido.' },
];

const VALUE_POINTS = [
  { title: 'Independente não é o mesmo que com dica', text: 'A separação aparece em toda contagem, gráfico e relatório.' },
  { title: 'O sistema sugere, o profissional decide', text: 'Alertas com evidência numérica; nenhuma mudança de fase é automática.' },
  { title: 'ABA ou Denver, nunca misturados', text: 'Cada caso segue a lógica de um único modelo, garantida no banco de dados.' },
];

const FEATURED_GAMES = [
  {
    id: 'bolhas-magicas',
    name: 'Bolhas Mágicas',
    category: 'Comunicação',
    model: 'Denver / Apoio',
    summary: 'Estouro de bolhas sonoras responsivas e vocábulos com feedback suave.',
  },
  {
    id: 'encontre-o-igual',
    name: 'Encontre o Igual',
    category: 'Cognição',
    model: 'ABA / Tentativas',
    summary: 'Pareamento visual idêntico com estímulos balanceados e dicas graduadas.',
  },
  {
    id: 'detetive-das-emocoes',
    name: 'Detetive das Emoções',
    category: 'Social & Emoções',
    model: 'Cognição Social',
    summary: 'Identificação de expressões faciais e pistas sociais com cenários ilustrados.',
  },
  {
    id: 'banda-do-tico',
    name: 'Banda do Tico',
    category: 'Imitação & Música',
    model: 'Ritmo & Resposta',
    summary: 'Ritmo musical interativo e controle inibitório com personagens carismáticos.',
  },
  {
    id: 'rampa-maluca',
    name: 'Rampa Maluca',
    category: 'Rotinas & Brincar',
    model: 'Denver / Rotina',
    summary: 'Pausa estruturada de espera de comunicação antes de liberar o carrinho.',
  },
  {
    id: 'mercadinho-da-esquina',
    name: 'Mercadinho da Esquina',
    category: 'Autonomia & AVDs',
    model: 'Vida Real',
    summary: 'Lista de compras, identificação de produtos e troca de moedas com autonomia.',
  },
];

export function Landing() {
  return (
    <div className="lp">
      <a className="ap-skip-link" href="#conteudo">Pular para o conteúdo principal</a>
      <PublicHeader />

      <main id="conteudo" tabIndex={-1}>
        {/* ------------------------------------------------------------ hero */}
        <section className="lp-hero" aria-labelledby="hero-title">
          <div className="lp-wrap lp-hero__grid">
            <div>
              <span className="ap-eyebrow">ABA e Modelo Denver · planejamento, aplicação e análise</span>
              <h1 id="hero-title" className="ap-display">
                Tudo o que acompanha uma intervenção, <em>no mesmo lugar.</em>
              </h1>
              <p className="lp-hero__lead">
                Plano individualizado, registro de sessão no tablet ou celular, jogos terapêuticos e análise visual
                de dados, com o alvo clínico no centro de cada decisão.
              </p>
              <div className="lp-hero__cta">
                <Link className="ap-btn ap-btn--primary ap-btn--lg" to="/entrar">
                  Explorar demonstração <IconArrowRight />
                </Link>
                <Link className="ap-btn ap-btn--lg" to="/produto">
                  Conhecer o produto
                </Link>
              </div>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* ------------------------------------------------------------ proposta de valor */}
        <section className="lp-section lp-section--sunken" aria-labelledby="valor">
          <div className="lp-wrap lp-value">
            <div>
              <span className="ap-eyebrow">Por que o Aprumo existe</span>
              <h2 id="valor" className="lp-h2 ap-display">Dado clínico só tem valor quando sustenta uma decisão.</h2>
            </div>
            <div>
              <p className="lp-sub">
                Planilhas e aplicativos avulsos produzem números, mas raramente dizem a qual objetivo uma tentativa
                pertencia, com qual dica e sob qual critério. O Aprumo guarda esse contexto em cada registro.
              </p>
              <ul className="lp-value__points">
                {VALUE_POINTS.map((p) => (
                  <li key={p.title}>
                    <IconCheck />
                    <div>
                      <strong>{p.title}</strong>
                      <span>{p.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ explorar */}
        <section className="lp-section" aria-labelledby="explorar">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="ap-eyebrow">Explore</span>
              <h2 id="explorar" className="lp-h2 ap-display">Encontre o que importa para você.</h2>
            </div>
            <div className="lp-explore">
              {EXPLORE.map((group) => (
                <div key={group.title}>
                  <h3 className="lp-explore__title">{group.title}</h3>
                  <ul className="lp-grid lp-grid--4 lp-unlist">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link to={item.href} className="lp-link-card">
                          <strong>{item.title}</strong>
                          <span>{item.text}</span>
                          <IconArrowRight />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ vitrine de games */}
        <section className="lp-section lp-section--sunken" aria-labelledby="vitrine-games">
          <div className="lp-wrap">
            <div className="lp-games-showcase__head">
              <div>
                <span className="ap-eyebrow">Jogos Clínicos</span>
                <h2 id="vitrine-games" className="lp-h2 ap-display">
                  34 Jogos Terapêuticos Padronizados
                </h2>
                <p className="lp-sub">
                  Categorizados em 6 domínios de desenvolvimento com ilustrações exclusivas, acessibilidade sensorial e conformidade aos protocolos ABA e Denver.
                </p>
              </div>
              <Link to="/games" className="ap-btn ap-btn--secondary">
                Ver catálogo completo (34 jogos) <IconArrowRight />
              </Link>
            </div>

            <div className="lp-games-showcase__grid">
              {FEATURED_GAMES.map((g) => (
                <div key={g.id} className="ap-game-card">
                  <div className="ap-game-card__art" aria-hidden="true">
                    <GameIllustration appId={g.id} name={g.name} interactive />
                  </div>
                  <div className="ap-game-card__body">
                    <div className="ap-game-card__badges">
                      <span className="ap-badge">{g.category}</span>
                      <span className="ap-badge ap-badge--info">{g.model}</span>
                    </div>
                    <h3 className="ap-game-card__title">{g.name}</h3>
                    <p className="ap-game-card__summary">{g.summary}</p>
                    <div className="ap-game-card__actions">
                      <Link to="/demonstracao" className="ap-btn ap-btn--sm ap-btn--secondary">
                        Experimentar jogo
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ confiança */}
        <section className="lp-section lp-section--tight" aria-labelledby="confianca">
          <div className="lp-wrap">
            <h2 id="confianca" className="lp-explore__title">Compromissos de projeto</h2>
            <ul className="lp-trustbar">
              {TRUST.map((t) => (
                <li key={t.title}>
                  <span className="lp-card__icon" aria-hidden="true">{t.icon}</span>
                  <div>
                    <strong>{t.title}</strong>
                    <span>{t.text}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="lp-trustbar__more">
              <Link className="lp-text-link" to="/seguranca-privacidade">Como protegemos os dados</Link>
            </p>
          </div>
        </section>

        <CtaBand
          title="Traga o rigor da supervisão para cada sessão."
          text="Conheça o ambiente de demonstração com casos fictícios em ABA e no Modelo Denver."
          primary={{ label: 'Explorar demonstração', href: '/entrar' }}
          secondary={{ label: 'Falar com a equipe', href: '/contato' }}
        />
      </main>

      <PublicFooter />
    </div>
  );
}

/* ---------------------------------------------------------------- visual do produto */
function HeroVisual() {
  // Série ilustrativa: linha de base → aquisição atingindo o critério.
  const ind = [10, 20, 10, 30, 40, 40, 55, 60, 70, 80, 90, 100];
  const pr = [0, 0, 0, 50, 40, 45, 30, 30, 20, 15, 10, 0];
  const W = 520, H = 210, l = 34, r = 12, t = 26, b = 26;
  const x = (i: number) => l + (i / (ind.length - 1)) * (W - l - r);
  const y = (v: number) => t + (H - t - b) * (1 - v / 100);
  const path = (arr: number[], from: number, to: number) =>
    arr.slice(from, to).map((v, k) => `${k ? 'L' : 'M'}${x(from + k).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const phaseX = (x(2) + x(3)) / 2;

  return (
    <div className="lp-visual" aria-hidden="true">
      <div className="lp-window">
        <div className="lp-window__bar">
          <div className="lp-window__dots"><i /><i /><i /></div>
          <span className="lp-window__title">Dados do caso · Ouvinte — objetos comuns</span>
        </div>
        <div className="lp-window__body">
          <div className="lp-case">
            <div className="lp-case__av">T</div>
            <div>
              <div className="lp-case__name">Teo <span className="ap-badge ap-badge--aba">ABA</span></div>
              <div className="lp-case__sub">4 a 2 m · Plano v2 · alvo “bola”</div>
            </div>
            <span className="ap-badge ap-phase ap-phase--acquisition lp-case__phase">Aquisição</span>
          </div>
          <svg className="lp-window__chart" viewBox={`0 0 ${W} ${H}`}>
            {[0, 50, 100].map((v) => (
              <g key={v}>
                <line x1={l} x2={W - r} y1={y(v)} y2={y(v)} stroke="var(--ap-chart-grid)" />
                <text x={l - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill="var(--ap-text-subtle)">{v}%</text>
              </g>
            ))}
            <line x1={l} x2={W - r} y1={y(90)} y2={y(90)} stroke="var(--ap-chart-criterion)" strokeDasharray="2 5" />
            <text x={W - r} y={y(90) - 5} textAnchor="end" fontSize="10" fill="var(--ap-chart-criterion)">critério 90%</text>
            <line x1={phaseX} x2={phaseX} y1={t - 10} y2={H - b} stroke="var(--ap-text-subtle)" strokeDasharray="4 4" />
            <text x={l + 4} y={t - 12} fontSize="10.5" fontWeight="650" fill="var(--ap-phase-baseline)">Linha de base</text>
            <text x={phaseX + 6} y={t - 12} fontSize="10.5" fontWeight="650" fill="var(--ap-phase-acquisition)">Aquisição</text>
            <path d={path(pr, 3, 12)} fill="none" stroke="var(--ap-chart-prompted)" strokeWidth="1.6" strokeDasharray="5 4" />
            <path d={path(ind, 0, 3)} fill="none" stroke="var(--ap-chart-independent)" strokeWidth="2.2" />
            <path d={path(ind, 3, 12)} fill="none" stroke="var(--ap-chart-independent)" strokeWidth="2.2" />
            {ind.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="4" fill={i === 5 || i === 8 ? 'var(--ap-surface)' : 'var(--ap-chart-independent)'} stroke="var(--ap-chart-independent)" strokeWidth="2" />)}
            {pr.slice(3).map((v, k) => <rect key={k} x={x(k + 3) - 3} y={y(v) - 3} width="6" height="6" fill="var(--ap-surface)" stroke="var(--ap-chart-prompted)" strokeWidth="1.4" />)}
          </svg>
        </div>
      </div>

      <div className="lp-float lp-float--rec">
        <div className="lp-float__title"><IconTarget /> Tentativa 7 de 10</div>
        <div className="lp-mini-prompts"><span data-on>IND</span><span>GES</span><span>MOD</span><span>FP</span></div>
        <div className="lp-mini-btns">
          <span className="is-ok">✓</span>
          <span className="is-err">✕</span>
          <span className="is-none">–</span>
        </div>
      </div>

      <div className="lp-float lp-float--alert">
        <div className="lp-float__title"><IconSpark /> <span>R1 · Critério de domínio atingido</span></div>
        <p>2/2 sessões consecutivas com ≥ 90% independente e ≥ 10 oportunidades.</p>
        <div className="lp-float__actions">
          <span className="ap-btn ap-btn--primary ap-btn--sm"><IconCheck /> Confirmar domínio</span>
          <span className="ap-btn ap-btn--sm">Ver dados</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- ilustrações (reutilizadas em /games, na biblioteca e no espaço da criança) */

export const ArtMatch = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#3d6b4f" />
    <rect width="160" height="120" fill="url(#felt)" opacity=".25" />
    <defs><pattern id="felt" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#fff" /></pattern></defs>
    <rect x="52" y="10" width="56" height="34" rx="6" fill="#b98a5a" />
    <rect x="66" y="14" width="28" height="26" rx="4" fill="#fffaf0" /><circle cx="80" cy="27" r="8" fill="#e8574a" />
    {[20, 66, 112].map((xx, i) => (<g key={xx}><rect x={xx} y="64" width="28" height="36" rx="5" fill="#fffaf0" transform={`rotate(${[-4, 1, 3][i]} ${xx + 14} 82)`} /></g>))}
    <circle cx="34" cy="82" r="8" fill="#2f6fb0" /><circle cx="80" cy="82" r="8" fill="#e8574a" /><rect x="119" y="75" width="14" height="14" rx="2" fill="#f2cd3c" />
  </svg>
);
export const ArtListener = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#2c2540" />
    <path d="M80 0 40 120h80z" fill="#fff5d6" opacity=".12" />
    <rect x="12" y="58" width="136" height="50" rx="6" fill="#d9b98f" />
    {[18, 64, 110].map((xx) => <rect key={xx} x={xx} y="64" width="32" height="38" rx="4" fill="#efe0c8" />)}
    <circle cx="34" cy="83" r="9" fill="#d93b3b" /><path d="M76 74h22l-4 18h-14z" fill="#7fc1de" /><rect x="116" y="76" width="20" height="14" rx="2" fill="#c0503f" />
    <circle cx="80" cy="30" r="13" fill="#f2b84b" /><path d="M76 25v10l7-5z" fill="#2c2540" />
  </svg>
);
export const ArtTurns = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#f3e3cf" />
    <ellipse cx="80" cy="104" rx="64" ry="10" fill="#e3c9a8" />
    {[['#e07a5f', 0], ['#3d85c6', 1], ['#f2cc8f', 2], ['#81b29a', 3], ['#e07a5f', 4]].map(([c, i]) => (
      <rect key={i as number} x={62 + ((i as number) % 2 ? 4 : -2)} y={84 - (i as number) * 16} width="36" height="16" rx="3" fill={c as string} stroke="#00000022" />
    ))}
    <rect x="10" y="20" width="30" height="10" rx="5" fill="#3d405b" /><circle cx="25" cy="44" r="10" fill="#81b29a" /><circle cx="135" cy="44" r="10" fill="#e07a5f" opacity=".45" />
  </svg>
);
export const ArtTokens = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#a8744a" />
    <rect x="14" y="20" width="132" height="80" rx="12" fill="#c8915f" stroke="#7a4e2c" strokeWidth="2" />
    {[0, 1, 2, 3, 4].map((i) => (<g key={i}><circle cx={34 + i * 23} cy="50" r="9" fill="#7a4e2c" opacity=".5" />{i < 3 && <path d={`M${34 + i * 23} 41l2.6 5.6 6 .7-4.5 4 1.3 6-5.4-3-5.4 3 1.3-6-4.5-4 6-.7z`} fill="#ffd166" />}</g>))}
    <rect x="58" y="70" width="44" height="22" rx="6" fill="#fff6e8" /><circle cx="80" cy="81" r="6" fill="#7fc1de" />
  </svg>
);
export const ArtSchedule = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#dfeaf2" />
    <path d="M0 30 Q80 46 160 30" fill="none" stroke="#6b7a88" strokeWidth="1.5" />
    {[12, 62, 112].map((xx, i) => (<g key={xx}><rect x={xx} y={i === 1 ? 38 : 40} width="36" height="46" rx="5" fill="#fff" stroke={i === 0 ? '#3f6b67' : '#c8d3dc'} strokeWidth={i === 0 ? 2.5 : 1} /><rect x={xx + 14} y="34" width="8" height="10" rx="2" fill="#d68c71" /></g>))}
    <circle cx="30" cy="60" r="8" fill="#81b29a" /><rect x="72" y="54" width="16" height="14" rx="2" fill="#f2cc8f" /><path d="M122 66l8-12 8 12z" fill="#7186d6" />
  </svg>
);

export const ArtDetective = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#2d3748" />
    <circle cx="80" cy="55" r="32" fill="#4a5568" opacity="0.6" />
    <circle cx="70" cy="50" r="24" fill="#e2e8f0" stroke="#cbd5e0" strokeWidth="3" opacity="0.9" />
    <circle cx="70" cy="50" r="18" fill="#fbd38d" />
    <circle cx="64" cy="46" r="2.5" fill="#2d3748" />
    <circle cx="76" cy="46" r="2.5" fill="#2d3748" />
    <path d="M 64 54 Q 70 60 76 54" fill="none" stroke="#2d3748" strokeWidth="2" strokeLinecap="round" />
    <line x1="87" y1="67" x2="108" y2="88" stroke="#b7791f" strokeWidth="6" strokeLinecap="round" />
    <path d="M 50 28 Q 70 18 90 28 L 94 33 L 46 33 Z" fill="#744210" />
    <rect x="42" y="32" width="56" height="4" rx="2" fill="#975a16" />
    <circle cx="125" cy="35" r="4" fill="#ecc94b" />
    <circle cx="35" cy="80" r="3" fill="#63b3ed" />
  </svg>
);

export const ArtExecutive = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#1a365d" />
    <path d="M 20 60 H 60 V 30 H 100 V 90 H 140" fill="none" stroke="#2b6cb0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="45" cy="60" r="12" fill="#38a169" stroke="#22543d" strokeWidth="2" />
    <path d="M 40 60 L 44 64 L 51 56" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="80" cy="30" r="12" fill="#e53e3e" stroke="#742a2a" strokeWidth="2" />
    <path d="M 75 25 L 85 35 M 85 25 L 75 35" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="100" cy="90" r="12" fill="#ecc94b" stroke="#744210" strokeWidth="2" />
    <circle cx="100" cy="90" r="5" fill="#fff" />
    <circle cx="130" cy="90" r="6" fill="#63b3ed" opacity="0.8" />
    <path d="M 120 40 L 135 25" stroke="#4fd1c5" strokeWidth="2" strokeDasharray="3 3" />
  </svg>
);

export const ArtMiniWorlds = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#234e52" />
    <polygon points="80,35 135,62 80,90 25,62" fill="#319795" />
    <polygon points="25,62 80,90 80,102 25,74" fill="#285e61" />
    <polygon points="135,62 80,90 80,102 135,74" fill="#1d4044" />
    <polygon points="65,50 85,38 105,50 85,62" fill="#f6ad55" />
    <polygon points="65,50 85,62 85,74 65,62" fill="#dd6b20" />
    <polygon points="105,50 85,62 85,74 105,62" fill="#c05621" />
    <polygon points="85,26 62,40 85,52 108,40" fill="#e53e3e" />
    <rect x="42" y="55" width="4" height="10" fill="#744210" />
    <circle cx="44" cy="50" r="8" fill="#48bb78" />
    <rect x="100" y="65" width="14" height="8" rx="2" fill="#4299e1" />
    <circle cx="103" cy="73" r="2.5" fill="#1a202c" />
    <circle cx="111" cy="73" r="2.5" fill="#1a202c" />
  </svg>
);

export const ArtChef = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#7b341e" />
    {/* Bancada da cozinha */}
    <rect x="0" y="75" width="160" height="45" fill="#c05621" />
    {/* Chapéu de chef */}
    <path d="M 65 35 C 55 20, 105 20, 95 35 Z" fill="#ffffff" />
    <circle cx="65" cy="28" r="10" fill="#ffffff" />
    <circle cx="80" cy="22" r="12" fill="#ffffff" />
    <circle cx="95" cy="28" r="10" fill="#ffffff" />
    <rect x="65" y="34" width="30" height="8" rx="2" fill="#edf2f7" />
    {/* Tigela colorida */}
    <path d="M 50 65 L 110 65 C 105 85, 55 85, 50 65 Z" fill="#38a169" stroke="#22543d" strokeWidth="2" />
    {/* Ingredientes na bancada */}
    <circle cx="35" cy="80" r="8" fill="#e53e3e" />
    <path d="M 125 74 C 130 84, 140 82, 142 76" fill="none" stroke="#ecc94b" strokeWidth="6" strokeLinecap="round" />
    {/* Colher de pau */}
    <line x1="88" y1="50" x2="105" y2="72" stroke="#d69e2e" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const ArtIndependence = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#1a365d" />
    {/* Cenário urbano com calçada */}
    <rect x="0" y="78" width="160" height="42" fill="#4a5568" />
    <line x1="0" y1="78" x2="160" y2="78" stroke="#cbd5e0" strokeWidth="3" />
    {/* Mochila escolar */}
    <rect x="25" y="44" width="34" height="42" rx="8" fill="#319795" stroke="#234e52" strokeWidth="2" />
    <rect x="30" y="56" width="24" height="22" rx="4" fill="#285e61" />
    <line x1="42" y1="50" x2="42" y2="76" stroke="#ecc94b" strokeWidth="2.5" strokeDasharray="2 2" />
    {/* Ônibus ao fundo */}
    <rect x="75" y="38" width="65" height="38" rx="6" fill="#3182ce" stroke="#2b6cb0" strokeWidth="2" />
    <rect x="82" y="44" width="14" height="12" rx="2" fill="#ebf8ff" />
    <rect x="102" y="44" width="28" height="12" rx="2" fill="#ebf8ff" />
    <circle cx="90" cy="76" r="6" fill="#1a202c" />
    <circle cx="125" cy="76" r="6" fill="#1a202c" />
    <circle cx="140" cy="52" r="3" fill="#ecc94b" />
  </svg>
);

export const ArtSocialCity = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#1a202c" />
    <polygon points="20,80 50,45 80,80" fill="#2d3748" />
    <rect x="25" y="45" width="28" height="55" rx="3" fill="#2b6cb0" />
    <rect x="65" y="30" width="35" height="70" rx="3" fill="#319795" />
    <rect x="110" y="50" width="30" height="50" rx="3" fill="#dd6b20" />
    {[0, 1, 2, 3].map((row) => (
      <g key={row}>
        <circle cx="34" cy={55 + row * 10} r="2" fill="#fefcbf" />
        <circle cx="44" cy={55 + row * 10} r="2" fill="#fefcbf" />
        <circle cx="75" cy={40 + row * 12} r="2.5" fill="#fefcbf" />
        <circle cx="88" cy={40 + row * 12} r="2.5" fill="#fefcbf" />
      </g>
    ))}
    <rect x="0" y="95" width="160" height="25" fill="#4a5568" />
    <line x1="0" y1="95" x2="160" y2="95" stroke="#e2e8f0" strokeWidth="2" />
    <line x1="60" y1="108" x2="100" y2="108" stroke="#ffffff" strokeWidth="4" strokeDasharray="6 6" />
    <path d="M 65 15 L 115 15 C 120 15, 120 28, 115 28 L 85 28 L 78 35 L 80 28 L 65 28 C 60 28, 60 15, 65 15 Z" fill="#ecc94b" />
    <text x="90" y="24" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#744210">💬 Olá!</text>
  </svg>
);

export const ArtCategory = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#2c5282" />
    {/* Caixas de classificação */}
    <rect x="20" y="55" width="55" height="48" rx="8" fill="#319795" stroke="#234e52" strokeWidth="2" />
    <rect x="85" y="55" width="55" height="48" rx="8" fill="#dd6b20" stroke="#9c4221" strokeWidth="2" />
    {/* Rótulo das caixas */}
    <circle cx="47" cy="80" r="14" fill="#ebf8ff" />
    <polygon points="47,70 57,88 37,88" fill="#319795" />
    <circle cx="112" cy="80" r="14" fill="#fffaf0" />
    <rect x="104" y="72" width="16" height="16" rx="3" fill="#dd6b20" />
    {/* Formas flutuantes prontas para organizar */}
    <circle cx="47" cy="30" r="12" fill="#ecc94b" stroke="#b7791f" strokeWidth="2" />
    <polygon points="112,18 124,38 100,38" fill="#e53e3e" stroke="#9b2c2c" strokeWidth="2" />
  </svg>
);

export const ArtAnimalMemory = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#285e61" />
    {/* Duas cartas do jogo da memória */}
    <rect x="25" y="25" width="50" height="70" rx="10" fill="#ffffff" stroke="#319795" strokeWidth="3" />
    <rect x="85" y="25" width="50" height="70" rx="10" fill="#ffffff" stroke="#319795" strokeWidth="3" />
    {/* Bichinho na carta 1 */}
    <circle cx="50" cy="55" r="16" fill="#fbd38d" />
    <circle cx="42" cy="42" r="5" fill="#fbd38d" />
    <circle cx="58" cy="42" r="5" fill="#fbd38d" />
    <circle cx="45" cy="52" r="2" fill="#1a202c" />
    <circle cx="55" cy="52" r="2" fill="#1a202c" />
    <ellipse cx="50" cy="59" rx="3" ry="2" fill="#c05621" />
    {/* Patinha na carta 2 */}
    <ellipse cx="110" cy="62" rx="9" ry="7" fill="#319795" />
    <circle cx="103" cy="50" r="3.5" fill="#319795" />
    <circle cx="110" cy="47" r="3.5" fill="#319795" />
    <circle cx="117" cy="50" r="3.5" fill="#319795" />
  </svg>
);

export const ArtStoryOrder = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#4a5568" />
    {/* 3 cards de sequência temporal */}
    <rect x="15" y="35" width="38" height="55" rx="6" fill="#edf2f7" stroke="#cbd5e0" strokeWidth="2" />
    <text x="34" y="52" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2b6cb0">1</text>
    <circle cx="34" cy="72" r="5" fill="#744210" />

    <rect x="61" y="30" width="38" height="60" rx="6" fill="#edf2f7" stroke="#3182ce" strokeWidth="2.5" />
    <text x="80" y="48" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#3182ce">2</text>
    <line x1="80" y1="76" x2="80" y2="65" stroke="#38a169" strokeWidth="3" />
    <circle cx="80" cy="62" r="4" fill="#48bb78" />

    <rect x="107" y="35" width="38" height="55" rx="6" fill="#edf2f7" stroke="#cbd5e0" strokeWidth="2" />
    <text x="126" y="52" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2b6cb0">3</text>
    <line x1="126" y1="78" x2="126" y2="62" stroke="#38a169" strokeWidth="3" />
    <circle cx="126" cy="58" r="6" fill="#e53e3e" />
  </svg>
);

export const ArtCauseEffect = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#322659" />
    {/* Botão mágico iluminado */}
    <circle cx="80" cy="65" r="32" fill="#553c9a" stroke="#805ad5" strokeWidth="3" />
    <circle cx="80" cy="63" r="24" fill="#b794f4" />
    <circle cx="80" cy="60" r="16" fill="#faf5ff" />
    {/* Efeito de brilho estelar ao tocar */}
    <polygon points="40,25 43,35 53,38 43,41 40,51 37,41 27,38 37,35" fill="#ecc94b" />
    <polygon points="120,30 122,37 129,39 122,41 120,48 118,41 111,39 118,37" fill="#f6ad55" />
    <polygon points="135,75 137,80 142,82 137,84 135,89 133,84 128,82 133,80" fill="#68d391" />
  </svg>
);

export const ArtMagicMirror = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#1d4044" />
    {/* Moldura do espelho mágico */}
    <ellipse cx="80" cy="60" rx="46" ry="52" fill="#d69e2e" />
    <ellipse cx="80" cy="60" rx="40" ry="46" fill="#ebf8ff" stroke="#b7791f" strokeWidth="2" />
    {/* Avatar demonstrando gesto motor */}
    <circle cx="80" cy="45" r="14" fill="#fed7aa" stroke="#c05621" strokeWidth="1.5" />
    <circle cx="75" cy="44" r="2" fill="#1a202c" />
    <circle cx="85" cy="44" r="2" fill="#1a202c" />
    <path d="M 76 50 Q 80 54 84 50" fill="none" stroke="#c05621" strokeWidth="1.5" strokeLinecap="round" />
    {/* Mão acenando */}
    <rect x="68" y="60" width="24" height="26" rx="6" fill="#38a169" />
    <circle cx="55" cy="50" r="5" fill="#fed7aa" />
    <circle cx="105" cy="50" r="5" fill="#fed7aa" />
  </svg>
);

export const ArtSharedAttention = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#1a365d" />
    {/* Olhos amigáveis */}
    <ellipse cx="50" cy="65" rx="14" ry="10" fill="#ffffff" />
    <circle cx="54" cy="63" r="5" fill="#2b6cb0" />
    <circle cx="56" cy="61" r="1.8" fill="#ffffff" />

    <ellipse cx="85" cy="65" rx="14" ry="10" fill="#ffffff" />
    <circle cx="89" cy="63" r="5" fill="#2b6cb0" />
    <circle cx="91" cy="61" r="1.8" fill="#ffffff" />

    {/* Trajetória do olhar / apontar */}
    <path d="M 95 55 Q 115 45 130 30" fill="none" stroke="#63b3ed" strokeWidth="2" strokeDasharray="3 3" />
    {/* Estrela alvo compartilhada */}
    <polygon points="135,20 138,28 146,30 138,32 135,40 132,32 124,30 132,28" fill="#f6e05e" />
  </svg>
);

export const ArtEncaixaAi = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#78350f" />
    {/* Tabuleiro de madeira de encaixe */}
    <rect x="14" y="16" width="132" height="88" rx="10" fill="#d97706" stroke="#b45309" strokeWidth="3" />
    {/* Cavidades vazias */}
    <circle cx="44" cy="45" r="16" fill="#451a03" opacity="0.8" />
    <rect x="74" y="32" width="28" height="28" rx="4" fill="#451a03" opacity="0.8" />
    <polygon points="124,31 138,58 110,58" fill="#451a03" opacity="0.8" />
    {/* Peça com pino sendo encaixada (círculo azul suave) */}
    <g transform="translate(42, 43)">
      <circle cx="0" cy="0" r="15" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
      {/* Pino central de madeira para segurar */}
      <circle cx="0" cy="0" r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
      <circle cx="0" cy="-1" r="2.5" fill="#ffffff" opacity="0.7" />
    </g>
    {/* Peça quadrada já encaixada com pino */}
    <g transform="translate(88, 46)">
      <rect x="-13" y="-13" width="26" height="26" rx="3" fill="#4ade80" stroke="#16a34a" strokeWidth="2" />
      <circle cx="0" cy="0" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
    </g>
    {/* Peça triangular aguardando no rodapé */}
    <g transform="translate(75, 82)">
      <polygon points="0,-12 13,10 -13,10" fill="#f43f5e" stroke="#e11d48" strokeWidth="2" />
      <circle cx="0" cy="2" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
    </g>
  </svg>
);

export const ArtRampaMaluca = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#1e293b" />
    {/* Rampa inclinada */}
    <path d="M 15 32 L 145 92 L 145 106 L 15 106 Z" fill="#334155" />
    <line x1="15" y1="32" x2="145" y2="92" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
    {/* Trava mecânica "Preparar... apontar..." */}
    <rect x="48" y="24" width="8" height="28" rx="2" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
    <circle cx="52" cy="24" r="5" fill="#fef08a" />
    {/* Carrinho na rampa esperando o sinal do adulto */}
    <g transform="translate(32, 28) rotate(22)">
      <rect x="-14" y="-10" width="26" height="14" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
      <rect x="-6" y="-8" width="10" height="6" rx="2" fill="#e0f2fe" />
      <circle cx="-8" cy="4" r="3.5" fill="#0f172a" />
      <circle cx="6" cy="4" r="3.5" fill="#0f172a" />
    </g>
    {/* Linhas de movimento e bolinha descendo na ponta */}
    <circle cx="118" cy="80" r="8" fill="#ec4899" stroke="#db2777" strokeWidth="1.5" />
    <line x1="90" y1="67" x2="105" y2="74" stroke="#f472b6" strokeWidth="2" strokeDasharray="3 3" />
    {/* Placa "JÁ!" */}
    <rect x="110" y="14" width="36" height="20" rx="6" fill="#22c55e" />
    <text x="128" y="28" textAnchor="middle" fontSize="10" fontWeight="900" fill="#ffffff">JÁ!</text>
  </svg>
);

export const ArtLancheDoUrso = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#451a03" />
    {/* Toalha de piquenique / mesa */}
    <rect x="0" y="65" width="160" height="55" fill="#fef3c7" />
    <path d="M 0 65 L 160 65" stroke="#f59e0b" strokeWidth="3" />
    {/* Ursinho fofo sentado */}
    <g transform="translate(50, 48)">
      {/* Orelhas */}
      <circle cx="-16" cy="-14" r="7" fill="#b45309" />
      <circle cx="-16" cy="-14" r="3.5" fill="#fde68a" />
      <circle cx="16" cy="-14" r="7" fill="#b45309" />
      <circle cx="16" cy="-14" r="3.5" fill="#fde68a" />
      {/* Cabeça */}
      <circle cx="0" cy="0" r="20" fill="#b45309" />
      {/* Focinho */}
      <ellipse cx="0" cy="5" rx="8" ry="6" fill="#fde68a" />
      <circle cx="0" cy="3" r="2.5" fill="#451a03" />
      {/* Olhos amigáveis */}
      <circle cx="-6" cy="-2" r="2.2" fill="#1e293b" />
      <circle cx="6" cy="-2" r="2.2" fill="#1e293b" />
      {/* Babador */}
      <path d="M -10 18 Q 0 28 10 18 L 8 26 L -8 26 Z" fill="#38bdf8" />
    </g>
    {/* Tigela e comidinha na mesa */}
    <g transform="translate(105, 82)">
      <ellipse cx="0" cy="0" rx="18" ry="8" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
      <ellipse cx="0" cy="-2" rx="14" ry="5" fill="#fef08a" />
      {/* Colher */}
      <path d="M -6 -10 L 8 -1" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="9" cy="0" rx="3.5" ry="2.5" fill="#94a3b8" />
    </g>
    {/* Copinho de água */}
    <g transform="translate(136, 74)">
      <path d="M -6 -10 L -4 6 L 4 6 L 6 -10 Z" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
      <line x1="-3" y1="-2" x2="3" y2="-2" stroke="#38bdf8" strokeWidth="2" />
    </g>
  </svg>
);

export const ArtFazendinhaSonora = () => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
    <rect width="160" height="120" fill="#14532d" />
    {/* Capa do livro de abas com grama e céu suave */}
    <rect x="12" y="14" width="136" height="92" rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="2" />
    <rect x="12" y="70" width="136" height="36" rx="0 0 8 8" fill="#bbf7d0" />
    {/* Celeiro ao fundo */}
    <path d="M 45 42 L 70 24 L 95 42 L 95 72 L 45 72 Z" fill="#dc2626" />
    <polygon points="70,24 45,42 95,42" fill="#b91c1c" />
    {/* Aba "Cadê a vaca?" sendo levantada */}
    <g transform="translate(70, 56)">
      {/* Vaquinha atrás da aba */}
      <ellipse cx="0" cy="0" rx="16" ry="12" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="-10" cy="-5" r="4" fill="#1e293b" />
      <ellipse cx="0" cy="4" rx="8" ry="5" fill="#fbcfe8" />
      <circle cx="-3" cy="4" r="1.2" fill="#1e293b" />
      <circle cx="3" cy="4" r="1.2" fill="#1e293b" />
      <circle cx="-5" cy="-2" r="1.5" fill="#1e293b" />
      <circle cx="5" cy="-2" r="1.5" fill="#1e293b" />
      {/* Aba de papel levantada em ângulo */}
      <path d="M -16 6 L 16 6 L 22 -14 L -10 -14 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" opacity="0.92" />
      <text x="6" y="-2" fontSize="7" fontWeight="bold" fill="#713f12">CADÊ?</text>
    </g>
    {/* Notas musicais / som do "Muuu!" */}
    <g fill="#0284c7">
      <path d="M 112 36 L 118 34 L 118 42 A 3 3 0 1 1 115 39 L 115 35 Z" />
      <path d="M 124 46 L 130 44 L 130 52 A 3 3 0 1 1 127 49 L 127 45 Z" />
    </g>
  </svg>
);

export default Landing;
