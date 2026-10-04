import { FeatureCard, PublicPageLayout, Section } from '../PublicNav';

const TOOLS = [
  { title: 'Checklists de fidelidade procedural', tag: 'Percentual de fidelidade', cls: 'ap-badge--success',
    text: 'Avaliação direta da aplicação: preparo do ambiente, atenção prévia, clareza do Sd, correção de erro sem punição e reforço imediato.' },
  { title: 'Concordância entre observadores (IOA)', tag: 'Tentativa a tentativa', cls: 'ap-badge--info',
    text: 'Coleta dupla na mesma sessão (supervisor e aplicador) com cálculo automático de concordância por tentativa, intervalo e ocorrência.' },
  { title: 'Treino de competências (BST)', tag: 'Behavioral Skills Training', cls: '',
    text: 'Registro estruturado de instrução, modelação, ensaio e feedback para acompanhar estagiários, terapeutas iniciantes e ATs.' },
  { title: 'Horas de supervisão e diário', tag: 'Pronto para auditoria', cls: 'ap-badge--warning',
    text: 'Registro imutável de supervisão direta, discussão de caso, revisão de dados e devolutivas, conforme exigem conselhos e certificadoras.' },
  { title: 'Alerta de divergência entre aplicadores', tag: 'Calibração da equipe', cls: '',
    text: 'Quando o desempenho de um paciente no mesmo alvo varia muito entre dois aplicadores, o sistema sinaliza para calibrar a equipe.' },
  { title: 'Acompanhamento longitudinal', tag: 'Evolução da equipe', cls: '',
    text: 'Gráficos da evolução de cada aplicador ao longo dos meses, mostrando consistência técnica e adesão aos protocolos.' },
];

export default function SupervisaoPage() {
  return (
    <PublicPageLayout
      eyebrow="Supervisão clínica"
      title={<>Fidelidade procedural, <em>concordância e treino contínuo</em></>}
      lead="Supervisão vai além de assinar folhas no fim do mês. O Aprumo digitaliza checklists de fidelidade, calcula IOA tentativa a tentativa e registra o desenvolvimento da equipe."
      ctaText="Ver o módulo de supervisão"
      secondaryCtaText="Conhecer as métricas"
      secondaryCtaHref="/dados-metricas"
    >
      <Section sunken eyebrow="Ferramentas de supervisão" title="Para elevar o padrão técnico da clínica">
        <div className="lp-grid">
          {TOOLS.map((t) => (
            <FeatureCard
              key={t.title}
              title={t.title}
              foot={<span className={`ap-badge ${t.cls}`.trim()}>{t.tag}</span>}
            >
              {t.text}
            </FeatureCard>
          ))}
        </div>
      </Section>
    </PublicPageLayout>
  );
}
