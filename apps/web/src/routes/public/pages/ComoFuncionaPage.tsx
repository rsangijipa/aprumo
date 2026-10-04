import {
  
  
  
  
  
  
  
  
} from '@aprumo/ui';
import { PublicPageLayout } from '../PublicNav';

export default function ComoFuncionaPage() {
  return (
    <PublicPageLayout
      eyebrow="Metodologia & Fluxo de Trabalho"
      title={
        <>
          Um ciclo clínico completo, <em>sem retrabalho e sem atalhos</em>
        </>
      }
      lead="O Aprumo substitui pranchetas manuais, planilhas avulsas e aplicativos desconectados por um fluxo coeso e transparente. Cada tentativa registrada conecta-se diretamente a uma meta planejada."
      ctaText="Ver ciclo em funcionamento"
      ctaHref="/entrar"
      secondaryCtaText="Conhecer o motor de regras"
      secondaryCtaHref="/dados-metricas"
    >
      <section className="lp-section lp-section--sunken">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">As 4 Etapas do Ciclo Aprumo</span>
            <h2 className="lp-h2 ap-display">Da definição de metas à decisão fundamentada</h2>
          </div>

          <div className="ap-stack" style={{ gap: '2rem' }}>
            <div className="ap-card" style={{ padding: '2rem' }}>
              <div className="ap-row" style={{ alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--ap-sage-600)', fontFamily: 'var(--ap-font-display)', lineHeight: 1 }}>
                  01
                </span>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <h3 style={{ fontSize: 'var(--ap-text-2xl)', margin: '0 0 0.5rem' }}>Planejar: O Plano Individual Operacional</h3>
                  <p className="ap-muted" style={{ lineHeight: 1.6 }}>
                    Supervisor e equipe constroem o plano de intervenção (PEI em ABA ou passos trimestrais no Modelo Denver). Cada alvo define de forma explícita: o estímulo discriminativo (Sd), a hierarquia de dicas permitidas, o procedimento de correção de erro, o reforçador contingente e o critério de domínio composto (nível de acerto x número de sessões com estabilidade).
                  </p>
                  <div className="ap-row" style={{ gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <span className="ap-badge ap-badge--aba">Suporte a DTT, NET e Encadeamento</span>
                    <span className="ap-badge ap-badge--denver">Passos do Modelo Denver (a, b, c, d)</span>
                    <span className="ap-badge">Critério Versionado Imutável</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ap-card" style={{ padding: '2rem' }}>
              <div className="ap-row" style={{ alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--ap-sage-600)', fontFamily: 'var(--ap-font-display)', lineHeight: 1 }}>
                  02
                </span>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <h3 style={{ fontSize: 'var(--ap-text-2xl)', margin: '0 0 0.5rem' }}>Aplicar: Registro em Dois Toques (Online ou Offline)</h3>
                  <p className="ap-muted" style={{ lineHeight: 1.6 }}>
                    O terapeuta aplica a sessão no consultório, escola ou domicílio usando tablet ou smartphone. Em 2 toques registra o nível de dica fornecido e a resposta da criança (correta, incorreta ou sem resposta). O sistema mede a latência em milissegundos, sugere alvos menos trabalhados na semana (Regra R12) e permite lançar atividades interativas na tela da criança com um clique.
                  </p>
                  <div className="ap-row" style={{ gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <span className="ap-badge ap-badge--success">100% Funcional Sem Internet</span>
                    <span className="ap-badge">Desfazer Seguro por 5 Segundos</span>
                    <span className="ap-badge ap-badge--info">Integração Imediata com Fichas</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ap-card" style={{ padding: '2rem' }}>
              <div className="ap-row" style={{ alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--ap-sage-600)', fontFamily: 'var(--ap-font-display)', lineHeight: 1 }}>
                  03
                </span>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <h3 style={{ fontSize: 'var(--ap-text-2xl)', margin: '0 0 0.5rem' }}>Analisar: Gráficos de Precisão & Critério Duplo Conservador</h3>
                  <p className="ap-muted" style={{ lineHeight: 1.6 }}>
                    Os dados sincronizados alimentam instantaneamente os gráficos de linha com separação entre acertos espontâneos (independentes) e com ajuda (dica). Linhas verticais de mudança de fase delimitam linha de base, aquisição, manutenção e generalização. Para mitigar erros de interpretação visual subjetiva, o sistema traça as linhas do Critério Duplo Conservador (CDC, Fisher et al., 2003).
                  </p>
                  <div className="ap-row" style={{ gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <span className="ap-badge">Critério Duplo Conservador (CDC)</span>
                    <span className="ap-badge">Gráfico de Dispersão e ABC</span>
                    <span className="ap-badge ap-badge--warning">Sem Comparação Entre Pacientes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ap-card" style={{ padding: '2rem' }}>
              <div className="ap-row" style={{ alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--ap-sage-600)', fontFamily: 'var(--ap-font-display)', lineHeight: 1 }}>
                  04
                </span>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <h3 style={{ fontSize: 'var(--ap-text-2xl)', margin: '0 0 0.5rem' }}>Decidir: O Motor Sugere, o Profissional Decide</h3>
                  <p className="ap-muted" style={{ lineHeight: 1.6 }}>
                    Após a sincronização da sessão, 15 regras clínicas baseadas na literatura avaliam os dados e sinalizam alertas: critério de domínio possivelmente alcançado, estagnação de aprendizagem, dependência de dica ou possível saciação de reforçador. O supervisor analisa a evidência numérica e toma a decisão clínica, justificando qualquer alteração de fase.
                  </p>
                  <div className="ap-row" style={{ gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <span className="ap-badge ap-badge--success">Decisão Sempre Humana</span>
                    <span className="ap-badge">Trilha de Auditoria com Justificativa</span>
                    <span className="ap-badge ap-badge--danger">Zero Decisões Automáticas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
