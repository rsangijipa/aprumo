import {
  Card,
  
  IconCheck,
  
  
  
  
  
} from '@aprumo/ui';
import { PublicPageLayout } from '../PublicNav';

export default function ProfissionaisPage() {
  return (
    <PublicPageLayout
      eyebrow="Para Terapeutas, Supervisores e ATs"
      title={
        <>
          Mais tempo para a intervenção, <em>menos tempo com burocracia</em>
        </>
      }
      lead="Construído para a rotina real de consultório, escola e domicílio. Agilidade na coleta de dados, supervisão direta baseada em evidência e relatórios prontos em conformidade com o CFP."
      ctaText="Acessar painel do profissional"
      ctaHref="/entrar"
      secondaryCtaText="Conhecer o construtor de PEI"
      secondaryCtaHref="/app/ferramentas/plano-individual"
    >
      <section className="lp-section lp-section--sunken">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Solução para Cada Perfil</span>
            <h2 className="lp-h2 ap-display">Ferramentas desenhadas para as responsabilidades de cada papel</h2>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <Card title="Supervisor Clínico / Analista do Comportamento">
              <p className="ap-small ap-muted">
                Controle total sobre o plano terapêutico, revisão de fidelidade da equipe, análise visual avançada e alertas do motor de regras.
              </p>
              <ul className="ap-stack" style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', gap: '0.4rem', fontSize: 'var(--ap-text-xs)' }}>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Aprovação e versionamento de planos individuais (PEI/Denver)</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Indicadores de concordância entre observadores (IOA)</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Alertas automáticos de domínio, estagnação e saciação</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Emissão de laudos segundo a Resolução CFP 06/2019</li>
              </ul>
            </Card>

            <Card title="Terapeuta Aplicador">
              <p className="ap-small ap-muted">
                Aplicação focada com o paciente sem desviar a atenção. Registro em tela cheia otimizado para toque com hierarquia de dicas evidente.
              </p>
              <ul className="ap-stack" style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', gap: '0.4rem', fontSize: 'var(--ap-text-xs)' }}>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Coleta DTT, NET e análise de tarefas em 2 toques</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Medição de latência por tentativa sem cronômetro manual</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Desfazer instantâneo por 5s contra erros de digitação</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Registro rápido de ABC para comportamentos concorrentes</li>
              </ul>
            </Card>

            <Card title="Acompanhante Terapêutico (AT) / Escolar" id="at">
              <p className="ap-small ap-muted">
                Registro prático em ambiente escolar e domiciliar. Interface leve para celular com funcionamento contínuo sem internet.
              </p>
              <ul className="ap-stack" style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', gap: '0.4rem', fontSize: 'var(--ap-text-xs)' }}>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Sondas de generalização fora da clínica</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Checklists de rotina e atividades de vida diária (AVDs)</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Sincronização offline criptografada ao reconectar</li>
                <li><IconCheck style={{ width: 14, color: 'var(--ap-success)' }} /> Comunicação alinhada com a coordenação do caso</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head lp-head--center">
            <span className="ap-eyebrow">DDT, NET & Denver</span>
            <h2 className="lp-h2 ap-display">Rigor metodológico sem misturar lógicas distintas</h2>
            <p className="lp-sub">
              O Aprumo respeita a identidade metodológica de cada intervenção. Um caso em ABA opera com unidades de tentativa, resposta e critério de domínio. Um caso em Denver opera com passos de aprendizagem, rotinas conjuntas e amostragens por intervalo.
            </p>
          </div>

          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="ap-card" style={{ padding: '2rem', borderTop: '4px solid var(--ap-model-aba)' }}>
              <span className="ap-badge ap-badge--aba">Protocolo ABA</span>
              <h3 style={{ margin: '1rem 0 0.5rem', fontSize: 'var(--ap-text-2xl)' }}>Análise do Comportamento Aplicada</h3>
              <p className="ap-small ap-muted">
                Programas individualizados com definição clara do estímulo discriminativo (Sd), correção de erro, nível inicial de dica e critério de domínio composto (ex.: 90% em 3 sessões consecutivas com pelo menos 2 aplicadores).
              </p>
            </div>

            <div className="ap-card" style={{ padding: '2rem', borderTop: '4px solid var(--ap-model-denver)' }}>
              <span className="ap-badge ap-badge--denver">Protocolo Denver</span>
              <h3 style={{ margin: '1rem 0 0.5rem', fontSize: 'var(--ap-text-2xl)' }}>Modelo Denver de Intervenção Precoce</h3>
              <p className="ap-small ap-muted">
                Estruturação de objetivos trimestrais divididos em 4 passos de aprendizagem (a, b, c, d). Registro focado na qualidade da interação, iniciativa da criança e codificação de episódios de atenção compartilhada.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
