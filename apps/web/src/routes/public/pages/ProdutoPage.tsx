import { IconCloudOff, IconLock, IconTablet } from '@aprumo/ui';
import { FeatureCard, PublicPageLayout, Section } from '../PublicNav';

const MODULES = [
  {
    title: 'Planejamento (PEI e Denver)',
    text: 'Metas com definição operacional, hierarquia de dicas, critério de domínio versionado e esquema de reforçamento por alvo.',
    items: ['Alvos em ABA e passos trimestrais no Modelo Denver', 'Versões controladas, sem apagar o histórico'],
  },
  {
    title: 'Aplicação de sessão',
    text: 'Registro em dois toques no tablet ou celular, com medição automática de latência, atalhos de teclado e desfazer por 5 segundos.',
    items: ['Funciona sem conexão com a internet', 'Registro de antecedente, comportamento e consequência (ABC)'],
  },
  {
    title: 'Análise visual e decisão',
    text: 'Gráficos com linhas de fase, critério duplo conservador (CDC), independente separado de com dica e 15 regras clínicas transparentes.',
    items: ['Alertas com evidência numérica (R1 a R15)', 'Detecção de dependência de dica e viés de posição'],
  },
  {
    title: 'Suportes visuais',
    text: 'Biblioteca de recursos para tela e impressão: timer visual, Primeiro/Depois, agenda, economia de fichas e análise de tarefa.',
    items: ['Compatível com Open Board Format (OBF)', 'Síntese de voz para pranchas de comunicação'],
  },
  {
    title: 'Jogos terapêuticos',
    text: 'Jogos sobre um runtime comum, com registro clínico padronizado e adaptações de movimento, som e tamanho de alvo por paciente.',
    items: ['Jogos 2D e experiências 3D', 'Ajustes táteis para infância e adolescência'],
  },
  {
    title: 'Portal da família',
    text: 'Parceria com os cuidadores em linguagem acessível: orientações, registro de oportunidades em casa e validação social.',
    items: ['Tarefas práticas com confirmação simples', 'Notas internas da equipe permanecem sigilosas'],
  },
];

export default function ProdutoPage() {
  return (
    <PublicPageLayout
      eyebrow="Produto"
      title={<>Um único fluxo para <em>intervenções de precisão</em></>}
      lead="Do plano individualizado à análise visual. O Aprumo reúne supervisores, aplicadores, acompanhantes, famílias e pacientes com o mesmo rigor metodológico."
      secondaryCtaText="Ver como funciona"
      secondaryCtaHref="/como-funciona"
    >
      <Section
        sunken
        eyebrow="Módulos"
        title="Uma ferramenta para cada momento do ciclo terapêutico"
        lead="Cada módulo parte do alvo clínico, sem planilhas paralelas nem anotações duplicadas."
      >
        <div className="lp-grid">
          {MODULES.map((m) => (
            <FeatureCard key={m.title} title={m.title} items={m.items}>
              {m.text}
            </FeatureCard>
          ))}
        </div>
      </Section>

      <Section eyebrow="Fundamentos técnicos" title="Feito para a rotina real de atendimento">
        <div className="lp-grid">
          <FeatureCard icon={<IconCloudOff />} title="Offline de verdade">
            A sessão pode ser aplicada inteira sem sinal. Os dados ficam criptografados no aparelho e sincronizam com
            confirmação quando a conexão volta.
          </FeatureCard>
          <FeatureCard icon={<IconLock />} title="Prontuário imutável">
            Registros clínicos nunca são apagados. Retificações geram adendos auditáveis com autor, data e motivo.
          </FeatureCard>
          <FeatureCard icon={<IconTablet />} title="Pensado para toque">
            Áreas de toque a partir de 48 px, uso confortável com o polegar, proteção contra toques acidentais e modo
            sensorial calmo.
          </FeatureCard>
        </div>
      </Section>
    </PublicPageLayout>
  );
}
