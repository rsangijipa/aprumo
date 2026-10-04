import { Link } from 'react-router';
import {
  Card,
  IconArrowRight,
  
  IconHeart,
  
  
  
} from '@aprumo/ui';
import { PublicPageLayout } from '../PublicNav';

export default function FamiliasPage() {
  return (
    <PublicPageLayout
      eyebrow="Para Pais, Cuidadores e Famílias"
      title={
        <>
          Acompanhe o desenvolvimento com <em>clareza, acolhimento e parceria</em>
        </>
      }
      lead="Uma visão transparente e sem termos técnicos indecifráveis sobre o que seu filho está aprendendo, quais foram as conquistas da semana e como apoiar a generalização no dia a dia em casa."
      ctaText="Ver demonstração do portal da família"
      ctaHref="/familia"
      secondaryCtaText="Como protegemos a privacidade"
      secondaryCtaHref="/seguranca-privacidade"
    >
      <section className="lp-section lp-section--sunken">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Compromisso com os Pais</span>
            <h2 className="lp-h2 ap-display">A intervenção não termina quando a sessão na clínica acaba</h2>
            <p className="lp-sub">Crianças aprendem muito mais rápido quando família e equipe caminham na mesma direção.</p>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <Card title="Progresso em Linguagem Simples">
              <p className="ap-small ap-muted">
                Em vez de jargões como "extinção", "SD" ou "tato puro", você vê exatamente a habilidade: "Apontar figuras no livro", "Pedir água com palavras" e a conquista: "Já faz sozinho 4 de 5 vezes".
              </p>
            </Card>

            <Card title="Tarefas Práticas para Fazer em Casa">
              <p className="ap-small ap-muted">
                A equipe envia atividades simples do cotidiano (ex.: "pedir para escolher a fruta no mercado" ou "treinar calçar o sapato"). Você marca com um toque como foi a experiência.
              </p>
            </Card>

            <Card title="Vídeos e Orientações Parentais">
              <p className="ap-small ap-muted">
                Acesso direto a guias e vídeos curtos gravados pelo terapeuta do caso demonstrando como posicionar o brinquedo, como esperar a iniciativa e como comemorar o acerto.
              </p>
            </Card>

            <Card title="Validação Social & Voz da Família">
              <p className="ap-small ap-muted">
                Questionários periódicos para você avaliar se as metas trabalhadas estão realmente fazendo diferença na qualidade de vida da sua casa e na autonomia do seu filho.
              </p>
            </Card>

            <Card title="Documentos e Relatórios Finais">
              <p className="ap-small ap-muted">
                Relatórios periódicos, declarações para a escola e laudos com assinatura e registro profissional, disponíveis para leitura e download seguro em PDF.
              </p>
            </Card>

            <Card title="Respeito ao Tempo da Família">
              <p className="ap-small ap-muted">
                Sem notificações invasivas de madrugada ou metas inatingíveis. O Aprumo valoriza o vínculo afetivo familiar acima de qualquer registro.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-wrap lp-final">
          <IconHeart style={{ width: 44, height: 44, color: 'var(--ap-terra-500)' }} />
          <h2 className="ap-display">Conheça o Portal da Família</h2>
          <p className="lp-sub" style={{ marginTop: 0 }}>
            Navegue pelo ambiente demonstrativo de uma mãe acompanhando a evolução do pequeno Téo.
          </p>
          <Link className="ap-btn ap-btn--primary ap-btn--lg" to="/familia">
            Abrir Demonstração do Portal <IconArrowRight />
          </Link>
        </div>
      </section>
    </PublicPageLayout>
  );
}
