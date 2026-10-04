import {
  Card,
  
  
  
  
  
  
  
} from '@aprumo/ui';
import { PublicPageLayout } from '../PublicNav';

export default function SupervisaoPage() {
  return (
    <PublicPageLayout
      eyebrow="Supervisão & Rigor Clínico"
      title={
        <>
          Fidelidade procedural, <em>concordância entre observadores e treino contínuo</em>
        </>
      }
      lead="Supervisão clínica não é apenas assinar folhas no fim do mês. O Aprumo digitaliza checklists de fidelidade procedural, calcula índices de IOA tentativa a tentativa e registra o desenvolvimento de competências da equipe."
      ctaText="Ver módulo de supervisão"
      ctaHref="/entrar"
      secondaryCtaText="Conhecer as métricas clínicas"
      secondaryCtaHref="/dados-metricas"
    >
      <section className="lp-section lp-section--sunken">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Ferramentas de Supervisão</span>
            <h2 className="lp-h2 ap-display">Construído para elevar o padrão técnico da clínica</h2>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <Card title="Checklists de Fidelidade Procedural">
              <p className="ap-small ap-muted">
                Avaliação direta da aplicação: preparação do ambiente, atenção prévia, clareza do estímulo discriminativo (Sd), correção de erro sem punição e reforçamento imediato.
              </p>
              <span className="ap-badge ap-badge--success">Cálculo de % de Fidelidade</span>
            </Card>

            <Card title="Concordância Entre Observadores (IOA)">
              <p className="ap-small ap-muted">
                Coleta dupla simultânea na mesma sessão (supervisor + aplicador) com cálculo automático de concordância tentativa a tentativa, intervalo a intervalo e ocorrência de comportamentos.
              </p>
              <span className="ap-badge ap-badge--info">Padrão Ouro Científico</span>
            </Card>

            <Card title="Trilha de Treino de Competências (BST)">
              <p className="ap-small ap-muted">
                Registro estruturado de Treino Baseado em Habilidades (Instrução, Modelagem, Roleplay e Feedback) para acompanhar a autonomia de estagiários, terapeutas novatos e ATs.
              </p>
              <span className="ap-badge">Behavioral Skills Training</span>
            </Card>

            <Card title="Horas de Supervisão & Diário">
              <p className="ap-small ap-muted">
                Registro imutável de horas de supervisão direta, discussão de caso, revisão de dados e devolutivas, em conformidade com as exigências dos conselhos profissionais e órgãos certificadores.
              </p>
              <span className="ap-badge ap-badge--warning">Auditoria Pronta</span>
            </Card>

            <Card title="Alertas de Fidelidade Degradada">
              <p className="ap-small ap-muted">
                Quando a taxa de acerto de um paciente varia significativamente entre dois aplicadores diferentes no mesmo alvo, o sistema sinaliza divergência de fidelidade para calibragem da equipe.
              </p>
              <span className="ap-badge ap-badge--danger">Alerta Inteligente</span>
            </Card>

            <Card title="Acompanhamento Longitudinal">
              <p className="ap-small ap-muted">
                Gráficos da evolução de cada aplicador ao longo dos meses, demonstrando ganho de consistência técnica e adesão aos protocolos científicos.
              </p>
              <span className="ap-badge">Evolução da Equipe</span>
            </Card>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
