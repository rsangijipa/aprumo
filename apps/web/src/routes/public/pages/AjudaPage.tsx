import { Link } from 'react-router';
import {
  Card,
  
  
  
  
  
} from '@aprumo/ui';
import { PublicPageLayout } from '../PublicNav';

export default function AjudaPage() {
  return (
    <PublicPageLayout
      eyebrow="Central de Ajuda & FAQ"
      title={
        <>
          Dúvidas frequentes, <em>guias práticos e orientações de uso</em>
        </>
      }
      lead="Encontre respostas rápidas sobre a metodologia, funcionamento offline, configuração de casos em ABA ou Denver, conformidade com a LGPD e suporte aos portais."
      ctaText="Falar com o suporte"
      ctaHref="/contato"
      secondaryCtaText="Explorar demonstração"
      secondaryCtaHref="/entrar"
    >
      <section className="lp-section lp-section--sunken">
        <div className="lp-wrap">
          <div className="lp-head lp-head--center">
            <span className="ap-eyebrow">Perguntas Mais Frequentes</span>
            <h2 className="lp-h2 ap-display">O que profissionais e famílias costumam perguntar</h2>
          </div>

          <div className="lp-faq" style={{ maxWidth: '52rem', margin: '0 auto', display: 'grid', gap: '0.75rem' }}>
            <details>
              <summary>A plataforma faz diagnóstico ou emite laudos automáticos?</summary>
              <p>
                <strong>Não.</strong> Em estrita conformidade com o Código de Ética Profissional do Psicólogo e as diretrizes do Conselho Federal de Psicologia (CFP), o desempenho em jogos e tarefas do Aprumo representa evidência contextual observada de uma habilidade específica. A plataforma nunca gera diagnósticos automáticos, escores de inteligência (QI) ou laudos fechados. Toda decisão clínica é exclusivamente humana.
              </p>
            </details>

            <details>
              <summary>Como funciona a coleta em locais sem internet (offline)?</summary>
              <p>
                O Aprumo foi desenvolvido com arquitetura <em>offline-first</em>. A sessão completa (tentativas, notas, registros de comportamento e pausas) pode ser realizada normalmente mesmo em modo avião ou sem sinal de Wi-Fi/4G. Os registros ficam protegidos em uma fila local criptografada (IndexedDB com outbox) e são transmitidos de forma segura e idempotente assim que a conexão for restabelecida.
              </p>
            </details>

            <details>
              <summary>Posso utilizar o Modelo Denver com os itens oficiais da Lista de Verificação?</summary>
              <p>
                A plataforma fornece a infraestrutura completa de planejamento e registro (níveis, domínios, passos trimestrais e amostragem por intervalo). Os textos literais dos itens do currículo oficial do ESDM possuem direitos autorais protegidos pela Guilford Press e só podem ser inseridos diretamente pelo usuário que possua o material licenciado.
              </p>
            </details>

            <details>
              <summary>O que a família consegue enxergar no portal dedicado?</summary>
              <p>
                A família tem acesso a uma interface acolhedora em linguagem desmistificada, contendo: metas ativas de aprendizagem, tarefas práticas de generalização para fazer em casa, vídeos de orientação parental e relatórios periódicos finalizados pelo responsável técnico. Notas clínicas internas da equipe e detalhes de manejo comportamental restrito nunca são compartilhados.
              </p>
            </details>

            <details>
              <summary>Como é garantida a segurança dos dados de saúde (LGPD)?</summary>
              <p>
                O Aprumo cumpre integralmente os artigos 11 e 14 da LGPD (dados de saúde e de crianças/adolescentes). Os dados são hospedados em servidores de alta segurança no Brasil (sa-east-1), com criptografia em trânsito (TLS 1.3) e em repouso. O sistema mantém registros imutáveis de prontuário e trilha de auditoria para qualquer consulta ou alteração.
              </p>
            </details>

            <details>
              <summary>Crianças pequenas podem usar o Aprumo livremente?</summary>
              <p>
                Seguindo as diretrizes da Sociedade Brasileira de Pediatria (SBP, 2024), crianças menores de 2 anos (24 meses) não possuem acesso autônomo ao ambiente digital da plataforma — para essa faixa etária, o sistema opera exclusivamente como ferramenta de registro do adulto. Para crianças maiores, o tempo diário de tela é monitorado e bloqueado quando a cota recomendada é atingida.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Primeiros Passos</span>
            <h2 className="lp-h2 ap-display">Guias rápidos de implementação na sua clínica</h2>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <Card title="1. Cadastro e Perfil Sensorial">
              <p className="ap-small ap-muted">
                Aprenda a cadastrar um novo caso, registrar os dados dos responsáveis, selecionar o modelo clínico (ABA ou Denver) e calibrar o perfil sensorial da criança.
              </p>
              <Link to="/app/casos/novo" className="ap-btn ap-btn--sm ap-btn--primary" style={{ marginTop: '0.75rem' }}>Ver assistente de cadastro</Link>
            </Card>

            <Card title="2. Elaborando o Primeiro Plano (PEI)">
              <p className="ap-small ap-muted">
                Descubra como estruturar objetivos, programas de ensino com modelos prontos e alvos com estímulos do acervo compartilhado e critérios versionados.
              </p>
              <Link to="/app/ferramentas/plano-individual" className="ap-btn ap-btn--sm ap-btn--primary" style={{ marginTop: '0.75rem' }}>Abrir construtor de PEI</Link>
            </Card>

            <Card title="3. Aplicando Sessões no Tablet">
              <p className="ap-small ap-muted">
                Conheça os atalhos de teclado (teclas 1, 2, 3), a medição de latência automática e a transição fluida para atividades na tela da criança com fichas integradas.
              </p>
              <Link to="/entrar" className="ap-btn ap-btn--sm ap-btn--primary" style={{ marginTop: '0.75rem' }}>Testar no SessionRunner</Link>
            </Card>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
