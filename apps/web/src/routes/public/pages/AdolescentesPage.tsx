import {
  Card,
  
  
  
  
  
  
} from '@aprumo/ui';
import { PublicPageLayout } from '../PublicNav';

export default function AdolescentesPage() {
  return (
    <PublicPageLayout
      eyebrow="Para Jovens e Adolescentes"
      title={
        <>
          Autonomia, habilidades sociais e <em>interfaces que respeitam a idade</em>
        </>
      }
      lead="Adolescentes atípicos rejeitam interfaces infantis de bichinhos coloridos. O Aprumo oferece uma experiência visual madura, estilo graphic novel e 3D contemporâneo, focada em metas de vida real, conversas, dilemas e independência urbana."
      ctaText="Explorar jogos para jovens"
      ctaHref="/games"
      secondaryCtaText="Conhecer o Social City 3D"
      secondaryCtaHref="/games#social-city"
    >
      <section className="lp-section lp-section--sunken">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Direção de Arte & Metodologia</span>
            <h2 className="lp-h2 ap-display">Projetado com a estética e os desafios da juventude contemporânea</h2>
            <p className="lp-sub">Foco nas habilidades que preparam para a vida adulta, o ensino médio, o trabalho e a convivência social comunitária.</p>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <Card title="Social City 3D: Simulação Urbana">
              <p className="ap-small ap-muted">
                Ambiente 3D estilizado (Three.js/R3F) onde o jovem pratica situações como pedir um café, esperar a vez na fila, lidar com troco errado, pedir informações no ponto de ônibus ou recusar convites indesejados.
              </p>
            </Card>

            <Card title="Co-op Escape Lab: Resolução Compartilhada">
              <p className="ap-small ap-muted">
                Desafios cooperativos em que dois jogadores possuem pistas complementares. O objetivo é exercitar comunicação intencional, pedido de ajuda e negociação mútua para superar o quebra-cabeça.
              </p>
            </Card>

            <Card title="Missão Independência & AVDs">
              <p className="ap-small ap-muted">
                Rotinas da vida prática: organização da mochila, conferência de horários e itinerários, controle de gastos pessoais e planejamento de refeições saudáveis com visual isométrico moderno.
              </p>
            </Card>

            <Card title="Árvore das Emoções (Modo Teen)">
              <p className="ap-small ap-muted">
                Painel clean e analítico para identificação de sensações físicas, intensidade de estresse ou sobrecarga sensorial e escolha consciente de estratégias de descompressão (mindfulness, música, isolamento momentâneo).
              </p>
            </Card>

            <Card title="Autoavaliação e Metas Claras">
              <p className="ap-small ap-muted">
                O jovem tem acesso à visão das suas próprias metas da sessão e participa ativamente da sua autoavaliação, construindo autodefesa (*self-advocacy*) e autodeterminação.
              </p>
            </Card>

            <Card title="Estilo Visual Graphic Novel">
              <p className="ap-small ap-muted">
                Paletas sóbrias com sálvia, ardósia e terracota, tipografia contemporânea Plus Jakarta Sans e acabamento gráfico com nível de produção de games independentes premiados.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
