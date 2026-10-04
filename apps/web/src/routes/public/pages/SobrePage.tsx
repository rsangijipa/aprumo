import {
  Card,
  
  
  
  
  
  
  
  
} from '@aprumo/ui';
import { PublicPageLayout } from '../PublicNav';

export default function SobrePage() {
  return (
    <PublicPageLayout
      eyebrow="Nossa História & Missão"
      title={
        <>
          O prumo como símbolo de <em>alinhamento, rigor e equilíbrio</em>
        </>
      }
      lead="Na construção civil e na marcenaria, o prumo é o instrumento que garante a vertical exata: sem desvios, sem ilusões de ótica. O Aprumo nasceu para trazer esse mesmo alinhamento rigoroso e ético para o acompanhamento do neurodesenvolvimento infantil."
      ctaText="Conhecer o produto"
      ctaHref="/produto"
      secondaryCtaText="Falar com nossa equipe"
      secondaryCtaHref="/contato"
    >
      <section className="lp-section lp-section--sunken">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Origem & Propósito</span>
            <h2 className="lp-h2 ap-display">Por que criamos o Aprumo</h2>
          </div>

          <div className="ap-stack" style={{ gap: '1.5rem', maxWidth: '52rem' }}>
            <p className="ap-muted" style={{ fontSize: 'var(--ap-text-md)', lineHeight: 1.7 }}>
              Durante anos, observamos clínicas e famílias sobrecarregadas por planilhas desconexas, fichas de papel amassadas que se perdiam nas mochilas e aplicativos comerciais que tratavam a aprendizagem de crianças com Transtorno do Espectro Autista (TEA) como se fosse um jogo qualquer de celular repleto de propagandas e moedas virtuais.
            </p>
            <p className="ap-muted" style={{ fontSize: 'var(--ap-text-md)', lineHeight: 1.7 }}>
              Reunimos analistas do comportamento, psicólogos clínicos, especialistas no Modelo Denver, terapeutas ocupacionais e engenheiros de software para construir uma solução definitiva: uma plataforma onde cada dado coletado tenha significado clínico claro e onde a criança seja respeitada no seu ritmo sensorial.
            </p>
          </div>
        </div>
      </section>

      <section className="lp-section" id="fundamentacao">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Fundamentação Científica</span>
            <h2 className="lp-h2 ap-display">Construído sobre a literatura internacional de evidências</h2>
            <p className="lp-sub">Todas as escolhas arquiteturais do Aprumo derivam de estudos publicados e revisados por pares.</p>
          </div>

          <ul className="lp-refs" style={{ fontSize: 'var(--ap-text-sm)', lineHeight: 1.6 }}>
            <li><b>Baer, Wolf e Risley (1968).</b> <i>Some current dimensions of applied behavior analysis.</i> Journal of Applied Behavior Analysis. Base para definição operacional, replicação e generalidade.</li>
            <li><b>Fuller e Fienup (2018).</b> <i>A systematic review of mastery criteria in behavioral interventions.</i> Critérios com nível e frequência evitam regressão de habilidades aprendidas.</li>
            <li><b>Fisher, Kelley e Lomas (2003).</b> <i>Visual aids and conservative dual-criterion in single-case experimental designs.</i> Journal of Applied Behavior Analysis.</li>
            <li><b>Steinbrenner et al. (2020).</b> <i>Evidence-Based Practices for Children, Youth, and Young Adults with Autism.</i> FPG Child Development Institute. Inclui tecnologia assistiva, suportes visuais e CAA.</li>
            <li><b>Schreibman et al. (2015).</b> <i>Naturalistic Developmental Behavioral Interventions (NDBI).</i> Fundamento para integração de ABA e abordagens desenvolvimentistas como o ESDM.</li>
            <li><b>Wang et al. (2022).</b> <i>Meta-analysis of randomized controlled trials of the Early Start Denver Model.</i> Autism Research.</li>
            <li><b>DeLeon e Iwata (1996).</b> <i>Evaluation of a multiple-stimulus presentation format for assessing reinforcer preferences (MSWO).</i></li>
            <li><b>Sociedade Brasileira de Pediatria (2024).</b> <i>Manual de Orientação: Menos Telas, Mais Saúde.</i> Departamento de Desenvolvimento e Comportamento da SBP.</li>
          </ul>
        </div>
      </section>

      <section className="lp-section lp-section--sunken" id="acessibilidade">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Inclusão Digital</span>
            <h2 className="lp-h2 ap-display">Declaração de Acessibilidade (WCAG 2.2 Nível AA)</h2>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <Card title="Tipografia Hiperlegível">
              <p className="ap-small ap-muted">
                Suporte nativo à fonte <strong>Atkinson Hyperlegible</strong> (desenvolvida pelo Braille Institute para máxima distinção de glifos semelhantes como 1, I, l, 0, O), ativável nas configurações do usuário.
              </p>
            </Card>

            <Card title="Acomodação Sensorial & Movimento">
              <p className="ap-small ap-muted">
                Respeito rigoroso à preferência do sistema operacional por movimento reduzido (`prefers-reduced-motion`) e opção de modo estático nos jogos para eliminar náuseas ou desregulação vestibular.
              </p>
            </Card>

            <Card title="Contraste Verificado ≥ 4.5:1">
              <p className="ap-small ap-muted">
                Cores auditadas digitalmente para garantir legibilidade mesmo em tablets expostos a luz solar de consultório ou telas de celulares de acompanhantes terapêuticos.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
