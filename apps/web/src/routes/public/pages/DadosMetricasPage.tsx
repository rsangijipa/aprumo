import { FeatureCard, PublicPageLayout, Section } from '../PublicNav';

const RULES = [
  { code: 'R1', title: 'Critério de domínio atingido', text: 'Indica quando o alvo atingiu a meta de acertos independentes no número de sessões consecutivas exigido pelo plano.' },
  { code: 'R3', title: 'Dependência de dica persistente', text: 'Sinaliza acerto alto, mas sempre sob dica, sem progressão para o esvanecimento.' },
  { code: 'R6', title: 'Falta sonda de generalização', text: 'Avisa que um alvo dominado no tablet ainda não foi verificado com material concreto fora da tela.' },
  { code: 'R8', title: 'Controle por posição', text: 'Detecta toques concentrados em uma posição da tela em vez de discriminação do estímulo.' },
  { code: 'R10', title: 'Saciação de reforçador', text: 'Verifica queda de engajamento com um reforçador entregue repetidamente nas últimas sessões.' },
  { code: 'R13', title: 'Limite diário de tela', text: 'Alerta e bloqueia o uso acima das recomendações por idade da Sociedade Brasileira de Pediatria.' },
];

export default function DadosMetricasPage() {
  return (
    <PublicPageLayout
      eyebrow="Dados e métricas"
      title={<>Dados que sustentam decisões, <em>não só números acumulados</em></>}
      lead="Análise visual assistida, com critérios conservadores e 15 regras transparentes que indicam quando vale a pena revisar um alvo."
      ctaText="Ver gráficos na demonstração"
      secondaryCtaText="Como funciona o ciclo"
      secondaryCtaHref="/como-funciona"
      closing={{
        title: 'Os dados sugerem. O profissional decide.',
        text: 'A tecnologia apoia o julgamento clínico; nunca o substitui.',
        primary: { label: 'Explorar a análise visual', href: '/entrar' },
        secondary: { label: 'Falar com a equipe', href: '/contato' },
      }}
    >
      <Section sunken eyebrow="Rigor na análise" title="Onde os gráficos tradicionais falham">
        <div className="lp-grid lp-grid--2">
          <FeatureCard title="Critério duplo conservador (CDC)">
            A análise visual a olho nu é suscetível a vieses. O Aprumo traça as linhas do critério duplo conservador
            (Fisher, Kelley e Lomas, 2003) a partir do nível e da tendência da linha de base, oferecendo um critério
            objetivo para avaliar se a mudança acompanha a intervenção.
          </FeatureCard>
          <FeatureCard title="Independente separado de com dica">
            Somar acerto com dica e acerto independente no mesmo percentual esconde dependência. No Aprumo, toda
            contagem, curva e tabela separa as duas respostas, o que evita altas prematuras.
          </FeatureCard>
        </div>
      </Section>

      <Section
        center
        eyebrow="Motor de regras (R1 a R15)"
        title="Alertas com a evidência à vista"
        lead="As regras avaliam cada alvo após cada sessão. Nenhuma altera o plano sozinha: elas apontam o fato clínico, com o tamanho da amostra, para a decisão humana."
      >
        <div className="lp-grid">
          {RULES.map((r) => (
            <FeatureCard key={r.code} kicker={r.code} title={r.title}>
              {r.text}
            </FeatureCard>
          ))}
        </div>
      </Section>
    </PublicPageLayout>
  );
}
