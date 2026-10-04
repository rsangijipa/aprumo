import { PublicPageLayout, Section } from '../PublicNav';

const STEPS = [
  {
    n: '01',
    title: 'Planejar: o plano individual operacional',
    text: 'Supervisor e equipe constroem o plano de intervenção (PEI em ABA ou passos trimestrais no Modelo Denver). Cada alvo define o estímulo discriminativo (Sd), as dicas permitidas, a correção de erro, o reforçador e o critério de domínio (nível de acerto e número de sessões).',
    tags: [
      { label: 'DTT, NET e encadeamento', cls: 'ap-badge--aba' },
      { label: 'Passos do Modelo Denver', cls: 'ap-badge--denver' },
      { label: 'Critério versionado', cls: '' },
    ],
  },
  {
    n: '02',
    title: 'Aplicar: registro em dois toques, com ou sem internet',
    text: 'No consultório, na escola ou em casa, o aplicador registra o nível de dica e a resposta (correta, incorreta ou sem resposta). O sistema mede a latência, sugere alvos menos trabalhados na semana (regra R12) e abre atividades na tela da criança com um toque.',
    tags: [
      { label: 'Funciona offline', cls: 'ap-badge--success' },
      { label: 'Desfazer por 5 segundos', cls: '' },
      { label: 'Integra com economia de fichas', cls: 'ap-badge--info' },
    ],
  },
  {
    n: '03',
    title: 'Analisar: gráficos de precisão e critério duplo conservador',
    text: 'Os dados alimentam gráficos que separam acertos independentes de acertos com dica. Linhas de fase marcam linha de base, aquisição, manutenção e generalização. Para reduzir a subjetividade da análise visual, o sistema traça o critério duplo conservador (CDC; Fisher, Kelley e Lomas, 2003).',
    tags: [
      { label: 'Critério duplo conservador', cls: '' },
      { label: 'Dispersão e ABC', cls: '' },
      { label: 'Sem comparação entre pacientes', cls: 'ap-badge--warning' },
    ],
  },
  {
    n: '04',
    title: 'Decidir: o sistema sugere, o profissional decide',
    text: 'Após cada sessão, 15 regras baseadas na literatura avaliam os dados e sinalizam domínio provável, estagnação, dependência de dica ou saciação de reforçador. O supervisor examina a evidência e decide; toda mudança de fase exige justificativa.',
    tags: [
      { label: 'Decisão sempre humana', cls: 'ap-badge--success' },
      { label: 'Trilha de auditoria', cls: '' },
    ],
  },
];

export default function ComoFuncionaPage() {
  return (
    <PublicPageLayout
      eyebrow="Como funciona"
      title={<>Um ciclo clínico completo, <em>sem retrabalho</em></>}
      lead="O Aprumo substitui pranchetas, planilhas e aplicativos desconectados por um fluxo único. Cada tentativa registrada se liga a uma meta planejada."
      secondaryCtaText="Conhecer as regras clínicas"
      secondaryCtaHref="/dados-metricas"
    >
      <Section sunken eyebrow="As quatro etapas" title="Da definição de metas à decisão fundamentada">
        <ol className="lp-steps">
          {STEPS.map((s) => (
            <li key={s.n} className="lp-step">
              <span className="lp-step__n" aria-hidden="true">{s.n}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <div className="lp-tags">
                  {s.tags.map((t) => (
                    <span key={t.label} className={`ap-badge ${t.cls}`.trim()}>{t.label}</span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </PublicPageLayout>
  );
}
