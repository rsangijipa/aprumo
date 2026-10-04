import { FeatureCard, PublicPageLayout, Section } from '../PublicNav';

export default function ProfissionaisPage() {
  return (
    <PublicPageLayout
      eyebrow="Para profissionais"
      title={<>Mais tempo para a intervenção, <em>menos tempo com papelada</em></>}
      lead="Feito para a rotina de consultório, escola e domicílio: coleta ágil, supervisão baseada em dados e documentos alinhados às normas do CFP."
      secondaryCtaText="Ver o construtor de PEI"
      secondaryCtaHref="/app/ferramentas/plano-individual"
    >
      <Section sunken eyebrow="Por papel" title="Ferramentas para as responsabilidades de cada função">
        <div className="lp-grid">
          <FeatureCard
            title="Supervisor clínico"
            items={[
              'Aprovação e versionamento de planos (PEI e Denver)',
              'Concordância entre observadores (IOA)',
              'Alertas de domínio, estagnação e saciação',
              'Documentos conforme a Resolução CFP 06/2019',
            ]}
          >
            Controle do plano terapêutico, revisão de fidelidade da equipe, análise visual e alertas do motor de regras.
          </FeatureCard>
          <FeatureCard
            title="Aplicador"
            items={[
              'Coleta DTT, NET e análise de tarefas em dois toques',
              'Latência medida por tentativa, sem cronômetro manual',
              'Desfazer por 5 segundos',
              'Registro rápido de ABC',
            ]}
          >
            Atenção no paciente, não na tela: registro em tela cheia, otimizado para toque, com a hierarquia de dicas
            sempre visível.
          </FeatureCard>
          <FeatureCard
            id="at"
            title="Acompanhante terapêutico (AT)"
            items={[
              'Sondas de generalização fora da clínica',
              'Checklists de rotina e atividades de vida diária',
              'Sincronização criptografada ao reconectar',
              'Comunicação alinhada com a coordenação do caso',
            ]}
          >
            Registro prático na escola e em casa, com interface leve para celular que funciona sem internet.
          </FeatureCard>
        </div>
      </Section>

      <Section
        eyebrow="ABA e Denver"
        title="Rigor metodológico, sem misturar lógicas diferentes"
        lead="Um caso em ABA trabalha com tentativa, resposta e critério de domínio. Um caso em Denver trabalha com passos de aprendizagem, rotinas conjuntas e amostragem por intervalo. O Aprumo respeita cada um."
      >
        <div className="lp-grid lp-grid--2">
          <FeatureCard variant="aba" title="Análise do Comportamento Aplicada" foot={<span className="ap-badge ap-badge--aba">ABA</span>}>
            Programas com estímulo discriminativo (Sd) definido, correção de erro, nível inicial de dica e critério de
            domínio composto — por exemplo, 90% em 3 sessões consecutivas com ao menos 2 aplicadores.
          </FeatureCard>
          <FeatureCard variant="denver" title="Modelo Denver de Intervenção Precoce" foot={<span className="ap-badge ap-badge--denver">Denver</span>}>
            Objetivos trimestrais divididos em passos de aprendizagem. O registro privilegia a qualidade da interação,
            a iniciativa da criança e os episódios de atenção compartilhada.
          </FeatureCard>
        </div>
      </Section>
    </PublicPageLayout>
  );
}
