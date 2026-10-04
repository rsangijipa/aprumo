import { FeatureCard, PublicPageLayout, Section } from '../PublicNav';

type Mode = 'tela' | 'ambos' | 'voz' | 'slides' | 'aplicador';
const MODE: Record<Mode, { label: string; cls: string }> = {
  tela: { label: 'Interativo em tela', cls: 'ap-badge--info' },
  ambos: { label: 'Tela e impressão', cls: 'ap-badge--success' },
  voz: { label: 'Interativo com voz', cls: 'ap-badge--info' },
  slides: { label: 'Interativo em slides', cls: 'ap-badge--info' },
  aplicador: { label: 'Ferramenta do aplicador', cls: 'ap-badge--warning' },
};

const RESOURCES: Array<{ title: string; text: string; mode: Mode }> = [
  { title: 'Timer visual', mode: 'tela',
    text: 'Contagem regressiva visual para antecipar transições, encerrar blocos de ensino e reduzir a ansiedade com o tempo.' },
  { title: 'Primeiro → Depois', mode: 'ambos',
    text: 'Quadro de contingência que liga uma tarefa menos preferida a uma atividade de alta preferência (princípio de Premack).' },
  { title: 'Agenda de rotina', mode: 'ambos',
    text: 'Sequência de atividades com marcação dos passos concluídos. Modelos para consultório, escola, manhã e noite.' },
  { title: 'Economia de fichas', mode: 'tela',
    text: 'Reforçamento condicionado com 3, 5, 8 ou 10 fichas e 8 temas de interesse, como dinossauros, planetas e trens.' },
  { title: 'Análise de tarefas', mode: 'ambos',
    text: 'AVDs divididas em passos para encadeamento para frente, para trás ou de tarefa total, com controle de dicas.' },
  { title: 'Pranchas de comunicação (CAA)', mode: 'voz',
    text: 'Comunicação alternativa com tira de frases, síntese de voz em português e compatibilidade com Open Board Format (OBF).' },
  { title: 'Semáforo e termômetro de regulação', mode: 'ambos',
    text: 'Quatro estados de regulação e escala de intensidade de 5 pontos para apoiar a autorregulação.' },
  { title: 'Histórias sociais', mode: 'slides',
    text: 'Narrativas ilustradas, slide a slide, que dão previsibilidade a situações novas: consulta médica, corte de cabelo, esperar a vez.' },
  { title: 'Contador de frequência e ABC', mode: 'aplicador',
    text: 'Contador em tempo real com taxa por minuto e registro rápido de antecedente, comportamento e consequência.' },
];

export default function RecursosPage() {
  return (
    <PublicPageLayout
      eyebrow="Recursos terapêuticos"
      title={<>Suportes visuais e <em>materiais estruturados</em></>}
      lead="Uma biblioteca de suportes visuais, pranchas de comunicação, agendas e rotinas, prontos para usar em tela cheia no tablet ou imprimir."
      ctaText="Abrir a biblioteca na demonstração"
      secondaryCtaText="Conhecer os games"
      secondaryCtaHref="/games"
      closing={{
        title: 'Na tela durante a sessão ou impresso na mesa',
        text: 'Use os recursos no tablet durante o atendimento ou imprima pranchas em alta resolução.',
        primary: { label: 'Explorar demonstração', href: '/entrar' },
        secondary: { label: 'Falar com a equipe', href: '/contato' },
      }}
    >
      <Section sunken eyebrow="Acervo" title="Instrumentos de apoio clínico e pedagógico">
        <div className="lp-grid">
          {RESOURCES.map((r) => (
            <FeatureCard
              key={r.title}
              title={r.title}
              foot={<span className={`ap-badge ${MODE[r.mode].cls}`}>{MODE[r.mode].label}</span>}
            >
              {r.text}
            </FeatureCard>
          ))}
        </div>
      </Section>
    </PublicPageLayout>
  );
}
