import { Link } from 'react-router';
import {
  Card,
  IconArrowRight,
  
  
  
  IconPrinter,
  
} from '@aprumo/ui';
import { PublicPageLayout } from '../PublicNav';

export default function RecursosPage() {
  return (
    <PublicPageLayout
      eyebrow="Aprumo Resource Studio"
      title={
        <>
          Recursos visuais interativos e <em>materiais estruturados</em>
        </>
      }
      lead="Uma biblioteca clínica completa de suportes visuais, pranchas de comunicação alternativa, agendas de transição e rotinas, prontos para uso em tela cheia no tablet ou impressão em alta resolução."
      ctaText="Explorar o Resource Studio"
      ctaHref="/app/recursos"
      secondaryCtaText="Conhecer o catálogo de games"
      secondaryCtaHref="/games"
    >
      <section className="lp-section lp-section--sunken">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Acervo Baseado em Evidências</span>
            <h2 className="lp-h2 ap-display">Instrumentos de apoio clínico e pedagógico</h2>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <Card title="Timer Visual Circular">
              <p className="ap-small ap-muted">
                Cronômetro visual de contagem regressiva para antecipação de transições, término de blocos de ensino e redução de ansiedade frente ao tempo.
              </p>
              <span className="ap-badge ap-badge--info">Interativo em Tela</span>
            </Card>

            <Card title="Primeiro → Depois (Princípio de Premack)">
              <p className="ap-small ap-muted">
                Quadro de contingência simples que associa uma tarefa de menor probabilidade a uma recompensa ou atividade de alta preferência imediata.
              </p>
              <span className="ap-badge ap-badge--success">Tela + Imprimível</span>
            </Card>

            <Card title="Agenda de Rotina Diária">
              <p className="ap-small ap-muted">
                Sequência temporal de atividades com checagem tátil de passos concluídos. Modos para consultório, escola, rotina matinal e noturna.
              </p>
              <span className="ap-badge ap-badge--success">Tela + Imprimível</span>
            </Card>

            <Card title="Quadro de Fichas (Economia de Fichas)">
              <p className="ap-small ap-muted">
                Sistema de reforçamento condicionado com 3, 5, 8 ou 10 fichas colecionáveis com 8 temas de interesse (dinossauros, planetas, trens, etc.).
              </p>
              <span className="ap-badge ap-badge--info">Interativo em Tela</span>
            </Card>

            <Card title="Análise de Tarefas (Task Analysis / Chaining)">
              <p className="ap-small ap-muted">
                Desdobramento de AVDs em passos operacionais para encadeamento para frente, para trás e tarefa completa com controle de dicas.
              </p>
              <span className="ap-badge ap-badge--success">Tela + Imprimível</span>
            </Card>

            <Card title="Pranchas de Comunicação (PECS / CAA)">
              <p className="ap-small ap-muted">
                Comunicação Alternativa e Aumentativa com tira de sentenças, síntese de voz (TTS) em português e compatibilidade com Open Board Format (OBF).
              </p>
              <span className="ap-badge ap-badge--info">Interativo com Voz</span>
            </Card>

            <Card title="Semáforo de Regulação & Termômetro">
              <p className="ap-small ap-muted">
                Mapeamento visual dos 4 estados fisiológicos (Zones of Regulation) e escala de intensidade de 5 pontos para suporte à autorregulação.
              </p>
              <span className="ap-badge ap-badge--success">Tela + Imprimível</span>
            </Card>

            <Card title="Social Story Studio (Histórias Sociais)">
              <p className="ap-small ap-muted">
                Narrativas ilustradas slide a slide para previsibilidade de situações sociais novas (consulta médica, corte de cabelo, esperar a vez).
              </p>
              <span className="ap-badge ap-badge--info">Interativo em Slides</span>
            </Card>

            <Card title="Contador de Frequência & Registro ABC">
              <p className="ap-small ap-muted">
                Clicker digital em tempo real com cálculo de taxa de comportamento por minuto e registro rápido da tríplice contingência comportamental.
              </p>
              <span className="ap-badge ap-badge--warning">Ferramenta do Aplicador</span>
            </Card>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-wrap lp-final">
          <IconPrinter style={{ width: 44, height: 44, color: 'var(--ap-sage-700)' }} />
          <h2 className="ap-display">Pronto para a Clínica e para a Mesa</h2>
          <p className="lp-sub" style={{ marginTop: 0 }}>
            Utilize as ferramentas de forma digital no tablet durante o atendimento ou imprima pranchas laminadas com alta qualidade gráfica.
          </p>
          <Link className="ap-btn ap-btn--primary ap-btn--lg" to="/entrar">
            Abrir Resource Studio na Demonstração <IconArrowRight />
          </Link>
        </div>
      </section>
    </PublicPageLayout>
  );
}
