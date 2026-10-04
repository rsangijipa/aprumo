import { type ReactNode } from 'react';
import { Link } from 'react-router';
import {
  IconArrowRight,
  IconBook,
  IconCheck,
  IconCloudOff,
  IconEye,
  IconHeart,
  IconLock,
  IconRoute,
  IconShield,
  IconSpark,
  IconTablet,
  IconTarget,
  Logo,
} from '@aprumo/ui';
import { PublicHeader, PublicFooter } from './PublicNav';
import './landing.css';

export function Landing() {
  return (
    <div className="lp">
      <a className="ap-skip-link" href="#conteudo">Pular para o conteúdo principal</a>
      <PublicHeader />

      <main id="conteudo">
        {/* ------------------------------------------------------------ hero */}
        <section className="lp-hero">
          <div className="lp-wrap lp-hero__grid">
            <div>
              <span className="ap-eyebrow">ABA + Denver • planejamento, aplicação e análise</span>
              <h1 className="ap-display">
                Tudo o que acompanha uma intervenção, <em>no mesmo lugar.</em>
              </h1>
              <p className="lp-hero__lead">
                Plano individualizado operacional, aplicação de sessão em tablet ou celular com medição de latência, biblioteca de jogos terapêuticos e análise visual de dados com o alvo clínico no centro de tudo.
              </p>
              <div className="lp-hero__cta">
                <Link className="ap-btn ap-btn--primary ap-btn--lg" to="/entrar">
                  Explorar demonstração <IconArrowRight />
                </Link>
                <Link className="ap-btn ap-btn--lg" to="/produto">
                  Conhecer o Produto
                </Link>
              </div>
              <div className="lp-trust" aria-label="Compromissos de projeto">
                <span><IconShield /> Projetado para a LGPD e o ECA Digital</span>
                <span><IconLock /> Registro clínico imutável e auditável</span>
                <span><IconCloudOff /> Funciona 100% sem internet</span>
                <span><IconEye /> Acessibilidade WCAG 2.2 AA</span>
              </div>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* ------------------------------------------------------------ problema */}
        <section className="lp-section lp-section--sunken" aria-labelledby="problema">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="ap-eyebrow">Por que o Aprumo existe</span>
              <h2 id="problema" className="lp-h2 ap-display">Dado clínico só tem valor quando sustenta uma decisão.</h2>
              <p className="lp-sub">
                Folhas de registro, planilhas e aplicativos avulsos produzem números, mas raramente dizem a qual
                objetivo uma tentativa pertencia, com qual dica e sob qual critério.
              </p>
            </div>
            <div className="lp-problem">
              <div>
                <span className="lp-problem__k">01</span>
                <strong>Acerto com ajuda não é acerto independente</strong>
                <p>O Aprumo separa resposta independente e resposta com dica em toda contagem, gráfico e relatório.</p>
              </div>
              <div>
                <span className="lp-problem__k">02</span>
                <strong>Uma sessão boa não demonstra domínio</strong>
                <p>O critério tem nível e frequência, é configurável por alvo e fica sempre visível junto do resultado.</p>
              </div>
              <div>
                <span className="lp-problem__k">03</span>
                <strong>Aprender no tablet não é generalizar</strong>
                <p>Alvos trabalhados em jogo pedem sondas fora da tela, com outro material, pessoa ou ambiente.</p>
              </div>
              <div>
                <span className="lp-problem__k">04</span>
                <strong>“80% em atenção” não diz nada</strong>
                <p>O sistema nunca mistura alvos diferentes em um índice geral, nem compara crianças.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ como funciona */}
        <section className="lp-section" id="como-funciona" aria-labelledby="cf">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="ap-eyebrow">Como funciona</span>
              <h2 id="cf" className="lp-h2 ap-display">Um ciclo clínico completo, sem retrabalho.</h2>
            </div>
            <ol className="lp-steps" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li className="lp-step">
                <div className="lp-step__art"><StepPlan /></div>
                <span className="lp-step__n">01 · Planejar</span>
                <h3>Plano individual operacional</h3>
                <p>Objetivos, programas e alvos com definição operacional, hierarquia de dicas, correção de erro e critério de domínio versionado.</p>
              </li>
              <li className="lp-step">
                <div className="lp-step__art"><StepApply /></div>
                <span className="lp-step__n">02 · Aplicar</span>
                <h3>Registro em dois toques</h3>
                <p>Nível de dica e resposta, na mesa ou no jogo, no tablet ou no celular. Funciona offline e sincroniza sem perder tentativas.</p>
              </li>
              <li className="lp-step">
                <div className="lp-step__art"><StepAnalyze /></div>
                <span className="lp-step__n">03 · Analisar</span>
                <h3>Gráficos que o supervisor usa</h3>
                <p>Linhas de fase, independente versus com dica, sondas, eventos de contexto e análise visual assistida pelo critério duplo conservador.</p>
              </li>
              <li className="lp-step">
                <div className="lp-step__art"><StepDecide /></div>
                <span className="lp-step__n">04 · Decidir</span>
                <h3>O motor sugere, você decide</h3>
                <p>Alertas fundamentados (domínio, estagnação, dependência de dica, saciação). Toda mudança de fase exige justificativa e fica na trilha.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------------------ modelos */}
        <section className="lp-section lp-section--sunken" id="modelos" aria-labelledby="mod">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="ap-eyebrow">Rigor metodológico</span>
              <h2 id="mod" className="lp-h2 ap-display">ABA ou Denver. Cada um com sua lógica, nunca misturados.</h2>
              <p className="lp-sub">
                Os dois modelos têm unidades de análise, procedimentos de coleta e critérios de domínio diferentes.
                Por isso cada caso é conduzido em um único modelo, e o próprio banco de dados garante isso.
              </p>
            </div>
            <div className="lp-models">
              <article className="lp-model lp-model--aba">
                <span className="ap-badge ap-badge--aba" style={{ justifySelf: 'start' }}>ABA</span>
                <h3>Análise do Comportamento Aplicada</h3>
                <dl>
                  <dt>Unidade</dt><dd>Tentativa, oportunidade, passo de cadeia ou episódio de comportamento</dd>
                  <dt>Registro</dt><dd>DTT, NET, análise de tarefa, frequência, duração, intervalo, ABC</dd>
                  <dt>Domínio</dt><dd>Critério por alvo (nível × frequência), manutenção e generalização</dd>
                  <dt>Fidelidade</dt><dd>Checklist derivado dos componentes do procedimento</dd>
                </dl>
              </article>
              <article className="lp-model lp-model--denver">
                <span className="ap-badge ap-badge--denver" style={{ justifySelf: 'start' }}>Denver</span>
                <h3>Modelo Denver de Intervenção Precoce</h3>
                <dl>
                  <dt>Unidade</dt><dd>Passo de aprendizagem do objetivo trimestral</dd>
                  <dt>Registro</dt><dd>Rotinas de atividade conjunta, com amostragem por intervalo (padrão de 15 min)</dd>
                  <dt>Domínio</dt><dd>Desempenho consistente por passo e revisão a cada ciclo</dd>
                  <dt>Primeira infância</dt><dd>Abaixo de 2 anos não há portal infantil: a plataforma é ferramenta do adulto</dd>
                </dl>
              </article>
            </div>
            <div className="lp-rule">
              <IconRoute />
              <p>
                A troca de modelo é uma decisão clínica formal: o plano vigente é encerrado com justificativa, os
                gráficos são preservados e um novo plano começa com nova linha de base.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ recursos */}
        <section className="lp-section lp-section--deep" id="recursos" aria-labelledby="rec">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="ap-eyebrow">Jogos e recursos terapêuticos</span>
              <h2 id="rec" className="lp-h2 ap-display">Cada recurso tem o seu mundo. Os dados falam a mesma língua.</h2>
              <p className="lp-sub">
                Os jogos são recursos de ensino configurados pelo profissional, não terapeutas. Cada um tem visual,
                ritmo e lógica próprios, pensados para o tablet e para o perfil sensorial da criança, e todos
                devolvem o mesmo registro clínico.
              </p>
            </div>
            <div className="lp-games">
              <GameCard tag="Pareamento" name="Encontre o Igual" text="Mesa de feltro com cartões. Campo de 1 a 4 e posição contrabalanceada." art={<ArtMatch />} />
              <GameCard tag="Resposta de ouvinte" name="Escolha pela Instrução" text="Estante iluminada e instrução falada. A luz vira dica e se esvanece." art={<ArtListener />} />
              <GameCard tag="Troca de turnos" name="Minha Vez, Sua Vez" text="Torre construída a quatro mãos. O bastão mostra de quem é a vez." art={<ArtTurns />} />
              <GameCard tag="Apoio" name="Quadro de Fichas" text="Fichas do tema preferido. O reforçador é escolhido antes e fica à vista." art={<ArtTokens />} />
              <GameCard tag="Apoio" name="Agenda Visual" text="Varal de cartões e primeiro–depois. O aviso antecipa a transição." art={<ArtSchedule />} />
            </div>

            <div className="ap-row" style={{ marginTop: '2rem', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link className="ap-btn ap-btn--primary" to="/recursos-terapeuticos">
                Explorar todos os suportes visuais <IconArrowRight />
              </Link>
              <Link className="ap-btn" to="/games">
                Ver catálogo completo de games →
              </Link>
            </div>

            <div className="lp-datacontract">
              <div>
                <h3 style={{ color: '#fff', fontSize: 'var(--ap-text-xl)' }}>Um único contrato de dados</h3>
                <p className="lp-sub" style={{ fontSize: 'var(--ap-text-md)' }}>
                  O jogo recebe só o necessário (apelido, alvos, estímulos e adaptação sensorial) e nunca nome
                  completo ou diagnóstico. Cada tentativa volta com alvo, posição, latência e origem da dica. A
                  pontuação clínica é calculada pela plataforma, não pelo jogo.
                </p>
              </div>
              <pre className="lp-code" aria-label="Exemplo de evento de tentativa">
{`{ `}<span className="k">"type"</span>: <span className="s">"TRIAL_COMPLETED"</span>,{`
  `}<span className="k">"targetId"</span>: <span className="s">"tgt_bola"</span>,{`
  `}<span className="k">"presented"</span>: [<span className="s">"bola"</span>, <span className="s">"copo"</span>, <span className="s">"livro"</span>],{`
  `}<span className="k">"positionOfTarget"</span>: <span className="n">0</span>, <span className="k">"selectedPosition"</span>: <span className="n">0</span>,{`
  `}<span className="k">"response"</span>: <span className="s">"correct"</span>, <span className="k">"latencyMs"</span>: <span className="n">2140</span>,{`
  `}<span className="k">"promptLevel"</span>: <span className="s">"IND"</span>, <span className="k">"promptSource"</span>: <span className="s">"none"</span> {`}`}
              </pre>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ inteligência */}
        <section className="lp-section" aria-labelledby="int">
          <div className="lp-wrap lp-intel">
            <div>
              <span className="ap-eyebrow">Inteligência clínica transparente</span>
              <h2 id="int" className="lp-h2 ap-display">Regras com fundamento declarado. Decisão sempre humana.</h2>
              <p className="lp-sub">
                Após cada sessão sincronizada, quinze regras avaliam os dados de cada alvo e geram alertas com
                evidência numérica e tamanho de amostra. Nenhuma regra altera o plano sozinha.
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <Link className="ap-btn" to="/dados-metricas">
                  Ver detalhes das métricas e regras →
                </Link>
              </div>
            </div>
            <div className="lp-rules">
              <ul>
                <li><b>R1</b><span>Critério de domínio atingido<em>Nível × frequência, com regra e versão visíveis</em></span></li>
                <li><b>R3</b><span>Possível dependência de dica<em>Acertos com dica persistentes sem redução do nível</em></span></li>
                <li><b>R6</b><span>Generalização fora da tela não verificada<em>Alvo dominado no jogo sem sonda em outro contexto</em></span></li>
                <li><b>R8</b><span>Escolhas concentradas em uma posição<em>Controle por posição em vez de pelo estímulo</em></span></li>
                <li><b>R13</b><span>Limite diário de tela ultrapassado<em>Limites por faixa etária (SBP, 2024)</em></span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ segurança */}
        <section className="lp-section lp-section--deep" id="seguranca" aria-labelledby="seg">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="ap-eyebrow">Segurança, ética e privacidade</span>
              <h2 id="seg" className="lp-h2 ap-display">Dados de saúde de crianças exigem o máximo cuidado.</h2>
            </div>
            <div className="lp-sec-grid">
              <div><IconLock /><strong>Acesso por vínculo com o caso</strong><p>Cada pessoa vê só os casos em que atua. A gestão da clínica não acessa conteúdo clínico por padrão.</p></div>
              <div><IconBook /><strong>Prontuário imutável</strong><p>Registros não são apagados nem reescritos: correções são adendos com autor, data e motivo.</p></div>
              <div><IconEye /><strong>Auditoria de leitura</strong><p>Saber quem consultou é tão importante quanto saber quem alterou.</p></div>
              <div><IconHeart /><strong>Sem engajamento predatório</strong><p>Sem ranking entre crianças, caixa-surpresa, notificações para a criança ou compras.</p></div>
              <div><IconTablet /><strong>Tela proporcional à idade</strong><p>Medidor diário por criança e nenhum acesso infantil autônomo abaixo dos 2 anos.</p></div>
              <div><IconShield /><strong>Sem triagem pública</strong><p>Nenhum escore sobre uma criança fora de um vínculo profissional e de consentimento.</p></div>
            </div>
            <div className="ap-row" style={{ marginTop: '2.5rem', justifyContent: 'center' }}>
              <Link className="ap-btn ap-btn--lg" to="/seguranca-privacidade">
                Saiba como cumprimos a LGPD e o ECA Digital →
              </Link>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ ciência */}
        <section className="lp-section" id="ciencia" aria-labelledby="cie">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="ap-eyebrow">Fundamentação</span>
              <h2 id="cie" className="lp-h2 ap-display">Construído sobre a literatura, não sobre suposições.</h2>
            </div>
            <ul className="lp-refs">
              <li><b>Baer, Wolf e Risley (1968).</b> As sete dimensões da ABA: base para definição operacional, análise e generalidade.</li>
              <li><b>Fuller e Fienup (2018).</b> Critério de domínio tem nível e frequência; critérios mais altos favorecem a manutenção.</li>
              <li><b>Fisher, Kelley e Lomas (2003).</b> Critério duplo conservador como apoio à análise visual.</li>
              <li><b>Steinbrenner et al. (2020).</b> 28 práticas baseadas em evidência, incluindo intervenção mediada por tecnologia e CAA.</li>
              <li><b>Schreibman et al. (2015).</b> Intervenções comportamentais desenvolvimentistas naturalistas (NDBI).</li>
              <li><b>Wang et al. (2022).</b> Meta-análise de ensaios randomizados do Modelo Denver.</li>
              <li><b>DeLeon e Iwata (1996).</b> Avaliação de preferência por estímulos múltiplos sem reposição (MSWO).</li>
              <li><b>Sociedade Brasileira de Pediatria (2024).</b> Recomendações de tempo de tela por faixa etária.</li>
            </ul>
          </div>
        </section>

        {/* ------------------------------------------------------------ FAQ */}
        <section className="lp-section lp-section--sunken" aria-labelledby="faq">
          <div className="lp-wrap">
            <div className="lp-head lp-head--center">
              <span className="ap-eyebrow">Perguntas frequentes</span>
              <h2 id="faq" className="lp-h2 ap-display">O que as equipes costumam perguntar</h2>
            </div>
            <div className="lp-faq">
              <details><summary>A plataforma faz diagnóstico ou avaliação psicológica?</summary><p>Não. Desempenho em jogo é evidência contextual de uma tarefa, nunca teste psicológico, QI ou diagnóstico. Instrumentos protegidos só entram com licença, e testes psicológicos dependem de parecer favorável do SATEPSI.</p></details>
              <details><summary>Funciona sem internet?</summary><p>Sim. A sessão inteira pode ser aplicada offline. Os registros ficam numa fila local cifrada e só saem do aparelho depois que o servidor confirma o recebimento de cada um.</p></details>
              <details><summary>Posso usar o Modelo Denver com os itens oficiais do currículo?</summary><p>A plataforma armazena a estrutura (níveis, domínios, objetivos e passos) e os escores do profissional. Os textos dos itens da Lista de Verificação são protegidos e só entram mediante licença do detentor dos direitos.</p></details>
              <details><summary>A família vê tudo o que a equipe registra?</summary><p>Não. A família vê relatórios em linguagem acessível, orientações e tarefas de generalização. Notas clínicas internas ficam restritas à equipe do caso.</p></details>
              <details><summary>E a inteligência artificial?</summary><p>A inteligência atual é feita de regras clínicas transparentes. Recursos de IA generativa entrarão depois e somente como rascunho, sempre revisado e assinado por um profissional.</p></details>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ CTA */}
        <section className="lp-section" id="contato" aria-labelledby="cta">
          <div className="lp-wrap lp-final">
            <Logo compact />
            <h2 id="cta" className="ap-display">Traga o rigor da supervisão para cada sessão.</h2>
            <p className="lp-sub" style={{ marginTop: 0 }}>Conheça o ambiente de demonstração com casos fictícios em ABA e no Modelo Denver.</p>
            <div className="ap-row" style={{ justifyContent: 'center' }}>
              <Link className="ap-btn ap-btn--primary ap-btn--lg" to="/entrar">Acessar a demonstração <IconArrowRight /></Link>
            </div>
          </div>
        </section>
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
          <span className="ap-xs ap-muted" style={{ fontWeight: 600 }}>Dados do caso · Ouvinte — objetos comuns</span>
        </div>
        <div className="lp-window__body">
          <div className="lp-case">
            <div className="lp-case__av">T</div>
            <div>
              <div className="lp-case__name">Teo <span className="ap-badge ap-badge--aba" style={{ marginLeft: 6 }}>ABA</span></div>
              <div className="lp-case__sub">4 a 2 m · Plano v2 · alvo “bola”</div>
            </div>
            <span className="ap-badge ap-phase ap-phase--acquisition" style={{ marginLeft: 'auto' }}>Aquisição</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
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
        <div className="lp-float__title" style={{ color: 'var(--ap-text)' }}><IconTarget style={{ color: 'var(--ap-sage-700)' }} /> Tentativa 7 de 10</div>
        <div className="lp-mini-prompts"><span data-on>IND</span><span>GES</span><span>MOD</span><span>FP</span></div>
        <div className="lp-mini-btns">
          <span style={{ color: 'var(--ap-success)' }}>✓</span>
          <span style={{ color: 'var(--ap-danger)' }}>✕</span>
          <span style={{ color: 'var(--ap-text-muted)' }}>–</span>
        </div>
      </div>

      <div className="lp-float lp-float--alert">
        <div className="lp-float__title"><IconSpark /> <span>R1 · Critério de domínio atingido</span></div>
        <p>2/2 sessões consecutivas com ≥ 90% independente e ≥ 10 oportunidades.</p>
        <div className="ap-row" style={{ marginTop: '0.6rem', gap: '0.4rem' }}>
          <span className="ap-btn ap-btn--primary ap-btn--sm"><IconCheck /> Confirmar domínio</span>
          <span className="ap-btn ap-btn--sm">Ver dados</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- ilustrações dos passos */
const StepPlan = () => (
  <svg viewBox="0 0 120 70"><rect x="20" y="8" width="80" height="54" rx="6" fill="#fff" stroke="var(--ap-sage-300)" />
    {[20, 32, 44].map((yy, i) => (<g key={yy}><circle cx="32" cy={yy} r="4" fill={i === 0 ? 'var(--ap-sage-500)' : 'var(--ap-sage-200)'} /><rect x="42" y={yy - 3} width={i === 1 ? 36 : 46} height="6" rx="3" fill="var(--ap-sage-100)" /></g>))}
  </svg>
);
const StepApply = () => (
  <svg viewBox="0 0 120 70"><rect x="24" y="6" width="72" height="58" rx="8" fill="#fff" stroke="var(--ap-sage-300)" />
    <rect x="32" y="40" width="16" height="16" rx="4" fill="#e6f2ec" stroke="#2f7d5a" /><rect x="52" y="40" width="16" height="16" rx="4" fill="#f8e5e2" stroke="#b03f33" /><rect x="72" y="40" width="16" height="16" rx="4" fill="#f3f1ec" stroke="#8a8d8b" />
    <rect x="32" y="16" width="56" height="16" rx="4" fill="var(--ap-sage-50)" stroke="var(--ap-sage-500)" />
  </svg>
);
const StepAnalyze = () => (
  <svg viewBox="0 0 120 70"><path d="M14 60h94M14 8v52" stroke="var(--ap-sage-300)" />
    <path d="M44 8v52" stroke="var(--ap-sage-300)" strokeDasharray="3 3" />
    <path d="M18 50 28 52 38 48M50 44 62 36 74 30 86 20 98 14" fill="none" stroke="var(--ap-sage-700)" strokeWidth="2.2" />
    <path d="M14 18h94" stroke="#2f7d5a" strokeDasharray="2 4" />
  </svg>
);
const StepDecide = () => (
  <svg viewBox="0 0 120 70"><rect x="16" y="14" width="88" height="42" rx="10" fill="#fff" stroke="var(--ap-terra-300)" />
    <path d="m30 30 3.5-7 3.5 7 7 1.5-7 1.5-3.5 7-3.5-7-7-1.5z" fill="var(--ap-terra-500)" />
    <rect x="48" y="25" width="44" height="6" rx="3" fill="var(--ap-terra-100)" /><rect x="48" y="36" width="30" height="8" rx="4" fill="var(--ap-sage-700)" />
  </svg>
);

/* ---------------------------------------------------------------- miniaturas dos recursos */
function GameCard({ tag, name, text, art }: { tag: string; name: string; text: string; art: ReactNode }) {
  return (
    <article className="lp-game">
      <div className="lp-game__art" aria-hidden="true">{art}</div>
      <div className="lp-game__body"><span className="lp-game__tag">{tag}</span><strong>{name}</strong><p>{text}</p></div>
    </article>
  );
}

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

export default Landing;
