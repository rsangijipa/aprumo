import { Link } from 'react-router';
import { FeatureCard, PublicPageLayout, Section } from '../PublicNav';

const FAQ = [
  {
    q: 'A plataforma faz diagnóstico ou emite laudos automáticos?',
    a: 'Não. Conforme o Código de Ética Profissional do Psicólogo e as diretrizes do CFP, o desempenho em jogos e tarefas é evidência observada de uma habilidade específica. O Aprumo não gera diagnósticos, escores de QI nem laudos fechados. Toda decisão clínica é humana.',
  },
  {
    q: 'Como funciona a coleta sem internet?',
    a: 'A arquitetura é offline-first. A sessão inteira — tentativas, notas, registros de comportamento e pausas — funciona em modo avião ou sem sinal. Os registros ficam em uma fila local criptografada e são enviados com segurança, sem duplicação, quando a conexão volta.',
  },
  {
    q: 'Posso usar o Modelo Denver com os itens oficiais da Lista de Verificação?',
    a: 'A plataforma oferece a estrutura de planejamento e registro (níveis, domínios, passos trimestrais e amostragem por intervalo). Os textos dos itens do currículo oficial do ESDM são protegidos por direitos autorais da Guilford Press e só podem ser inseridos por quem possui o material licenciado.',
  },
  {
    q: 'O que a família vê no portal?',
    a: 'Metas ativas em linguagem simples, tarefas de generalização para casa, vídeos de orientação e relatórios finalizados pelo responsável técnico. Notas clínicas internas e detalhes de manejo restrito não são compartilhados.',
  },
  {
    q: 'Como a segurança dos dados de saúde é garantida?',
    a: 'O Aprumo segue os artigos 11 e 14 da LGPD. Os dados ficam hospedados no Brasil (sa-east-1), com criptografia em trânsito (TLS 1.3) e em repouso, prontuário imutável e trilha de auditoria para qualquer consulta ou alteração.',
  },
  {
    q: 'Crianças pequenas podem usar o Aprumo sozinhas?',
    a: 'Seguindo a Sociedade Brasileira de Pediatria (2024), crianças menores de 2 anos não têm acesso autônomo à tela: nessa faixa, o sistema funciona apenas como ferramenta de registro do adulto. Para crianças maiores, o tempo diário de tela é monitorado e bloqueado ao atingir a cota recomendada.',
  },
];

const GUIDES = [
  {
    title: '1. Cadastro e perfil sensorial',
    text: 'Cadastre um caso, registre os responsáveis, escolha o modelo clínico (ABA ou Denver) e ajuste o perfil sensorial da criança.',
    href: '/app/casos/novo',
    cta: 'Abrir cadastro de caso',
  },
  {
    title: '2. Primeiro plano (PEI)',
    text: 'Estruture objetivos, programas a partir de modelos e alvos com estímulos do acervo e critérios versionados.',
    href: '/app/ferramentas/plano-individual',
    cta: 'Abrir construtor de PEI',
  },
  {
    title: '3. Sessões no tablet',
    text: 'Conheça os atalhos (teclas 1, 2 e 3), a medição de latência e a passagem para atividades na tela da criança.',
    href: '/entrar',
    cta: 'Testar uma sessão',
  },
];

export default function AjudaPage() {
  return (
    <PublicPageLayout
      eyebrow="Ajuda"
      title={<>Perguntas frequentes e <em>primeiros passos</em></>}
      lead="Respostas sobre metodologia, uso offline, casos em ABA ou Denver, LGPD e portais."
      ctaText="Falar com o suporte"
      ctaHref="/contato"
      secondaryCtaText="Explorar demonstração"
      secondaryCtaHref="/entrar"
      closing={{
        title: 'Não encontrou o que procurava?',
        text: 'Nossa equipe responde dúvidas sobre uso, implantação e privacidade.',
        primary: { label: 'Falar com o suporte', href: '/contato' },
        secondary: { label: 'Explorar demonstração', href: '/entrar' },
      }}
    >
      <Section sunken center eyebrow="Perguntas frequentes" title="O que profissionais e famílias costumam perguntar">
        <div className="lp-faq">
          {FAQ.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section eyebrow="Primeiros passos" title="Guias rápidos para começar na sua clínica">
        <div className="lp-grid">
          {GUIDES.map((g) => (
            <FeatureCard
              key={g.title}
              title={g.title}
              foot={<Link to={g.href} className="ap-btn ap-btn--sm">{g.cta}</Link>}
            >
              {g.text}
            </FeatureCard>
          ))}
        </div>
      </Section>
    </PublicPageLayout>
  );
}
