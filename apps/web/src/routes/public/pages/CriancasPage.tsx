import { FeatureCard, PublicPageLayout, Section } from '../PublicNav';

export default function CriancasPage() {
  return (
    <PublicPageLayout
      eyebrow="Para crianças"
      title={<>Um espaço lúdico, <em>calmo e seguro</em></>}
      lead="Diferente de aplicativos de jogos comuns, o Aprumo segue diretrizes clínicas e pediátricas: sem anúncios, sem compras, sem luzes piscantes e com tempo de tela controlado."
      ctaText="Ver jogos para crianças"
      ctaHref="/games"
      secondaryCtaText="Conhecer os recursos terapêuticos"
      secondaryCtaHref="/recursos-terapeuticos"
    >
      <Section sunken eyebrow="Proteção ética e pediátrica" title="O que torna o ambiente infantil diferente">
        <div className="lp-grid">
          <FeatureCard title="Sem mecânicas predatórias">
            Sem moedas virtuais, caixas de sorteio, notificações que disputam a atenção da criança ou anúncios.
          </FeatureCard>
          <FeatureCard title="Cuidado sensorial">
            Nada de flashes piscantes, sons em tons suaves e transições lentas, para evitar sobrecarga.
          </FeatureCard>
          <FeatureCard title="Tempo de tela controlado">
            Seguindo a Sociedade Brasileira de Pediatria (2024), menores de 2 anos não usam a tela sozinhos e as
            crianças maiores têm limite diário monitorado.
          </FeatureCard>
          <FeatureCard title="Formas confortáveis">
            Ilustrações que lembram massinha e brinquedos táteis, com formas arredondadas que convidam à exploração
            tranquila.
          </FeatureCard>
          <FeatureCard title="Reforçamento saudável">
            A criança ganha estrelas de esforço e escolhe figurinhas para o seu álbum, valorizando a tentativa e o
            progresso individual.
          </FeatureCard>
          <FeatureCard title="Saída protegida por adulto">
            O modo infantil só é encerrado com um toque longo seguido do PIN do adulto, mantendo o ambiente estável
            durante o atendimento.
          </FeatureCard>
        </div>
      </Section>
    </PublicPageLayout>
  );
}
