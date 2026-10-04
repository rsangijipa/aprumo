import { Link } from 'react-router';
import {
  Card,
  IconArrowRight,
  
  
  
  
  
} from '@aprumo/ui';
import { PublicPageLayout } from '../PublicNav';

export default function DadosMetricasPage() {
  return (
    <PublicPageLayout
      eyebrow="Ciência de Dados Comportamentais"
      title={
        <>
          Dados que sustentam decisões, <em>não apenas números acumulados</em>
        </>
      }
      lead="A análise do comportamento é uma ciência empírica. O Aprumo fornece análise visual assistida por computador com rigor metodológico, critérios conservadores e 15 regras transparentes que apontam o momento certo de agir."
      ctaText="Ver gráficos na demonstração"
      ctaHref="/entrar"
      secondaryCtaText="Como funciona o ciclo clínico"
      secondaryCtaHref="/como-funciona"
    >
      <section className="lp-section lp-section--sunken">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Rigor Estatístico e Visual</span>
            <h2 className="lp-h2 ap-display">Por que gráficos tradicionais falham e como o Aprumo resolve</h2>
          </div>

          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <Card title="O Critério Duplo Conservador (CDC)">
              <p className="ap-small ap-muted" style={{ lineHeight: 1.6 }}>
                A análise visual puramente a olho nu é suscetível a vieses de confirmação (Fuller & Fienup, 2018). O Aprumo traça as linhas do <strong>Conservative Dual-Criterion (Fisher, Kelley & Lomas, 2003)</strong> com base na tendência e nível da linha de base, oferecendo ao supervisor um critério estatístico objetivo para comprovar que a mudança no comportamento ocorreu pela intervenção e não por mero acaso.
              </p>
            </Card>

            <Card title="Separação Estrita de Independência">
              <p className="ap-small ap-muted" style={{ lineHeight: 1.6 }}>
                Sistemas simplistas misturam "acerto com dica física" e "acerto independente" no mesmo percentual de 80%. No Aprumo, toda contagem, curva e tabela distingue rigorosamente respostas independentes de respostas sob auxílio, prevenindo altas prematuras em pacientes dependentes de dica.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head lp-head--center">
            <span className="ap-eyebrow">Motor de Regras Clínicas (R1 a R15)</span>
            <h2 className="lp-h2 ap-display">Alertas inteligentes com evidência numérica explícita</h2>
            <p className="lp-sub">
              O motor de regras avalia cada alvo após cada sessão. Nenhuma regra altera o plano sozinha; elas sinalizam fatos clínicos com tamanho de amostra e desvio para a tomada de decisão humana.
            </p>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="ap-card" style={{ padding: '1.25rem' }}>
              <strong style={{ color: 'var(--ap-sage-700)', display: 'block', marginBottom: '0.4rem' }}>R1 · Critério de Domínio Atingido</strong>
              <p className="ap-small ap-muted">Identifica quando o alvo atingiu a meta de acertos independentes pelo número consecutivo de sessões exigidas pelo plano.</p>
            </div>

            <div className="ap-card" style={{ padding: '1.25rem' }}>
              <strong style={{ color: 'var(--ap-warning)', display: 'block', marginBottom: '0.4rem' }}>R3 · Dependência de Dica Persistente</strong>
              <p className="ap-small ap-muted">Sinaliza quando a taxa de acerto é alta, mas 100% mantida sob dicas sem progressão para o esvanecimento.</p>
            </div>

            <div className="ap-card" style={{ padding: '1.25rem' }}>
              <strong style={{ color: 'var(--ap-danger)', display: 'block', marginBottom: '0.4rem' }}>R6 · Ausência de Sonda de Generalização</strong>
              <p className="ap-small ap-muted">Alerta que um alvo foi considerado dominado no tablet mas ainda não foi verificado em material concreto fora da tela.</p>
            </div>

            <div className="ap-card" style={{ padding: '1.25rem' }}>
              <strong style={{ color: 'var(--ap-warning)', display: 'block', marginBottom: '0.4rem' }}>R8 · Controle por Posição Geométrica</strong>
              <p className="ap-small ap-muted">Detecta quando os toques da criança concentram-se em uma posição específica da tela em vez de discriminar o estímulo.</p>
            </div>

            <div className="ap-card" style={{ padding: '1.25rem' }}>
              <strong style={{ color: 'var(--ap-terra-700)', display: 'block', marginBottom: '0.4rem' }}>R10 · Saciação de Reforçador</strong>
              <p className="ap-small ap-muted">Verifica queda de engajamento com um reforçador que foi entregue repetidamente ao longo das últimas sessões.</p>
            </div>

            <div className="ap-card" style={{ padding: '1.25rem' }}>
              <strong style={{ color: 'var(--ap-danger)', display: 'block', marginBottom: '0.4rem' }}>R13 · Limite Diário de Tela Ultrapassado</strong>
              <p className="ap-small ap-muted">Bloqueia e alerta o uso excessivo de telas acima das recomendações etárias da Sociedade Brasileira de Pediatria.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section lp-section--deep">
        <div className="lp-wrap lp-final">
          <h2 className="ap-display" style={{ color: '#fff' }}>DADOS SUGEREM. O PROFISSIONAL DECIDE.</h2>
          <p className="lp-sub" style={{ color: '#b9cbc9', margin: 0 }}>
            A tecnologia deve empoderar o julgamento clínico humano, nunca substituí-lo.
          </p>
          <Link className="ap-btn ap-btn--primary ap-btn--lg" to="/entrar">
            Explorar Demonstração de Análise Visual <IconArrowRight />
          </Link>
        </div>
      </section>
    </PublicPageLayout>
  );
}
