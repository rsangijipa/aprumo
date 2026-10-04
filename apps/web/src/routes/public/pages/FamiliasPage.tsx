import { FeatureCard, PublicPageLayout, Section } from '../PublicNav';

export default function FamiliasPage() {
  return (
    <PublicPageLayout
      eyebrow="Para famílias"
      title={<>Acompanhe o desenvolvimento com <em>clareza e parceria</em></>}
      lead="Uma visão transparente, sem jargão técnico, do que seu filho está aprendendo, das conquistas da semana e de como apoiar a generalização em casa."
      ctaText="Ver o portal da família"
      ctaHref="/familia"
      secondaryCtaText="Como protegemos a privacidade"
      secondaryCtaHref="/seguranca-privacidade"
      closing={{
        title: 'Conheça o portal da família',
        text: 'Navegue pela demonstração de uma mãe acompanhando a evolução do pequeno Teo.',
        primary: { label: 'Abrir o portal de demonstração', href: '/familia' },
        secondary: { label: 'Falar com a equipe', href: '/contato' },
      }}
    >
      <Section
        sunken
        eyebrow="Compromisso com a família"
        title="A intervenção continua depois da sessão"
        lead="Crianças aprendem mais quando família e equipe caminham na mesma direção."
      >
        <div className="lp-grid">
          <FeatureCard title="Progresso em linguagem simples">
            Em vez de termos como “extinção” ou “tato”, você vê a habilidade — “Pedir água com palavras” — e a
            conquista: “Já faz sozinho 4 de 5 vezes”.
          </FeatureCard>
          <FeatureCard title="Atividades para fazer em casa">
            A equipe sugere práticas do dia a dia, como escolher a fruta no mercado ou calçar o sapato. Você marca com
            um toque como foi.
          </FeatureCard>
          <FeatureCard title="Vídeos e orientações">
            Guias curtos gravados pelo terapeuta do caso mostram como posicionar o brinquedo, esperar a iniciativa e
            comemorar o acerto.
          </FeatureCard>
          <FeatureCard title="A voz da família">
            Questionários periódicos para você avaliar se as metas estão fazendo diferença na rotina da casa e na
            autonomia do seu filho.
          </FeatureCard>
          <FeatureCard title="Documentos e relatórios">
            Relatórios periódicos, declarações para a escola e laudos assinados pelo profissional, disponíveis para
            leitura e download seguro em PDF.
          </FeatureCard>
          <FeatureCard title="Respeito ao tempo da família">
            Sem notificações fora de hora nem metas inalcançáveis. O vínculo familiar vem antes de qualquer registro.
          </FeatureCard>
        </div>
      </Section>
    </PublicPageLayout>
  );
}
