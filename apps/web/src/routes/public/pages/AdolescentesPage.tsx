import { FeatureCard, PublicPageLayout, Section } from '../PublicNav';

export default function AdolescentesPage() {
  return (
    <PublicPageLayout
      eyebrow="Para adolescentes"
      title={<>Autonomia e habilidades sociais, <em>com visual adequado à idade</em></>}
      lead="Adolescentes não querem interfaces infantis. O Aprumo oferece uma experiência visual madura, focada em metas da vida real: conversas, dilemas e independência na cidade."
      ctaText="Ver jogos para jovens"
      ctaHref="/games"
      secondaryCtaText="Conhecer o Social City 3D"
      secondaryCtaHref="/games#social-city"
    >
      <Section
        sunken
        eyebrow="Direção de arte e metodologia"
        title="Pensado para os desafios da adolescência"
        lead="Foco nas habilidades que preparam para a vida adulta: escola, trabalho e convivência na comunidade."
      >
        <div className="lp-grid">
          <FeatureCard title="Social City 3D">
            Cidade 3D estilizada para praticar situações como pedir um café, esperar na fila, lidar com troco errado,
            pedir informação no ponto de ônibus ou recusar um convite.
          </FeatureCard>
          <FeatureCard title="Co-op Escape Lab">
            Desafios para dois jogadores com pistas complementares, que exercitam comunicação intencional, pedido de
            ajuda e negociação.
          </FeatureCard>
          <FeatureCard title="Missão Independência">
            Rotinas práticas: organizar a mochila, conferir horários e itinerários, controlar gastos e planejar
            refeições.
          </FeatureCard>
          <FeatureCard title="Árvore das Emoções (modo teen)">
            Painel sóbrio para identificar sensações físicas, nível de estresse ou sobrecarga sensorial e escolher uma
            estratégia de regulação.
          </FeatureCard>
          <FeatureCard title="Autoavaliação e metas claras">
            O jovem vê as próprias metas da sessão e participa da autoavaliação, desenvolvendo autodefesa e
            autodeterminação.
          </FeatureCard>
          <FeatureCard title="Estética contemporânea">
            Paleta sóbria em sálvia, ardósia e terracota, tipografia atual e acabamento inspirado em graphic novels.
          </FeatureCard>
        </div>
      </Section>
    </PublicPageLayout>
  );
}
