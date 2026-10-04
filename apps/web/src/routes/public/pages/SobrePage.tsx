import { FeatureCard, PublicPageLayout, Section } from '../PublicNav';

export default function SobrePage() {
  return (
    <PublicPageLayout
      eyebrow="Sobre o Aprumo"
      title={<>O prumo como símbolo de <em>alinhamento e rigor</em></>}
      lead="Na construção, o prumo garante a vertical exata, sem desvios nem ilusões de ótica. O Aprumo nasceu para levar esse alinhamento ao acompanhamento do neurodesenvolvimento infantil."
      ctaText="Conhecer o produto"
      ctaHref="/produto"
      secondaryCtaText="Falar com a equipe"
      secondaryCtaHref="/contato"
    >
      <Section sunken eyebrow="Origem e propósito" title="Por que criamos o Aprumo">
        <div className="lp-prose">
          <p>
            Durante anos, vimos clínicas e famílias lidando com planilhas desconexas, fichas de papel que se perdiam e
            aplicativos que tratavam a aprendizagem de crianças com Transtorno do Espectro Autista (TEA) como um jogo
            qualquer, cheio de propagandas e moedas virtuais.
          </p>
          <p>
            Reunimos analistas do comportamento, psicólogos, especialistas no Modelo Denver, terapeutas ocupacionais e
            engenheiros de software para construir uma plataforma em que cada dado tenha significado clínico claro e
            em que a criança seja respeitada no seu ritmo.
          </p>
        </div>
      </Section>

      <Section
        id="fundamentacao"
        eyebrow="Fundamentação científica"
        title="Apoiado na literatura internacional"
        lead="As principais escolhas de produto derivam de estudos publicados e revisados por pares."
      >
        <ul className="lp-refs">
          <li><b>Baer, Wolf e Risley (1968).</b> <i>Some current dimensions of applied behavior analysis.</i> Journal of Applied Behavior Analysis. Base para definição operacional, replicação e generalidade.</li>
          <li><b>Fuller e Fienup (2018).</b> <i>A systematic review of mastery criteria in behavioral interventions.</i> Critérios com nível e frequência reduzem a perda de habilidades aprendidas.</li>
          <li><b>Fisher, Kelley e Lomas (2003).</b> <i>Visual aids and conservative dual-criterion in single-case experimental designs.</i> Journal of Applied Behavior Analysis.</li>
          <li><b>Steinbrenner et al. (2020).</b> <i>Evidence-Based Practices for Children, Youth, and Young Adults with Autism.</i> FPG Child Development Institute. Inclui tecnologia assistiva, suportes visuais e CAA.</li>
          <li><b>Schreibman et al. (2015).</b> <i>Naturalistic Developmental Behavioral Interventions (NDBI).</i> Fundamento para integrar ABA e abordagens desenvolvimentistas como o ESDM.</li>
          <li><b>Wang et al. (2022).</b> <i>Meta-analysis of randomized controlled trials of the Early Start Denver Model.</i> Autism Research.</li>
          <li><b>DeLeon e Iwata (1996).</b> <i>Evaluation of a multiple-stimulus presentation format for assessing reinforcer preferences (MSWO).</i></li>
          <li><b>Sociedade Brasileira de Pediatria (2024).</b> <i>Manual de Orientação: Menos Telas, Mais Saúde.</i> Departamento de Desenvolvimento e Comportamento da SBP.</li>
        </ul>
      </Section>

      <Section sunken id="acessibilidade" eyebrow="Acessibilidade" title="Declaração de acessibilidade (WCAG 2.2, nível AA)">
        <div className="lp-grid">
          <FeatureCard title="Tipografia hiperlegível">
            Suporte à fonte Atkinson Hyperlegible, criada pelo Braille Institute para distinguir glifos parecidos como
            1, I, l, 0 e O. Ativável nas configurações do usuário.
          </FeatureCard>
          <FeatureCard title="Movimento e estímulos sensoriais">
            A preferência do sistema por movimento reduzido é respeitada, e os jogos têm modo estático para evitar
            desconforto ou desregulação.
          </FeatureCard>
          <FeatureCard title="Contraste mínimo de 4,5:1">
            Cores verificadas para manter a leitura em tablets sob luz forte e em celulares de acompanhantes
            terapêuticos.
          </FeatureCard>
        </div>
      </Section>
    </PublicPageLayout>
  );
}
