/**
 * Dados FICTÍCIOS do ambiente de demonstração. Nenhuma pessoa real.
 * Gerados de forma determinística para que gráficos e alertas mostrem situações clínicas típicas:
 * domínio atingido (R1), estagnação (R2), dependência de dica (R3), regressão em manutenção (R5),
 * lacuna de generalização (R6), viés de posição (R8), saciação (R10), aumento de comportamento (R11),
 * passo Denver estagnado (R14) e ciclo vencendo (R15).
 */
import { seededRandom, shuffle } from '@aprumo/game-sdk';
import { DEFAULT_ADAPTATION } from '@aprumo/protocol';
import type {
  ChildSpace,
  ClinicalDocument,
  Competency,
  FidelityObservation,
  IoaSession,
  PreferenceAssessment,
  PrerequisiteProbe,
  SupervisionLog,
  Guardian,
  Guidance,
  HomeTask,
  HomeTaskRecord,
  BehaviorDefinition,
  BehaviorEvent,
  CaseRecord,
  Child,
  DenverCycle,
  DenverObjective,
  Fact,
  Goal,
  Professional,
  Program,
  PromptHierarchy,
  Reinforcer,
  SessionRecord,
  Target,
  TimelineEvent,
} from './types';

const DAY = 86_400_000;
const now = Date.now();
const daysAgo = (d: number, hour = 14) => {
  const t = new Date(now - d * DAY);
  t.setHours(hour, 0, 0, 0);
  return t.toISOString();
};
const yearsAgo = (y: number, m = 0) => {
  const t = new Date(now);
  t.setFullYear(t.getFullYear() - y);
  t.setMonth(t.getMonth() - m);
  return t.toISOString().slice(0, 10);
};

export const professionals: Professional[] = [
  { id: 'pro-helena', name: 'Helena Prado', shortName: 'Helena', role: 'Psicóloga · supervisora clínica', council: 'CRP (demonstração)' },
  { id: 'pro-rafael', name: 'Rafael Lima', shortName: 'Rafael', role: 'Aplicador' },
  { id: 'pro-julia', name: 'Júlia Ramos', shortName: 'Júlia', role: 'Aplicadora' },
];
export const CURRENT_USER_ID = 'pro-helena';

export const hierarchies: PromptHierarchy[] = [
  {
    id: 'ph-ltm',
    name: 'Menos para mais intrusiva (5 níveis)',
    kind: 'least_to_most',
    levels: [
      { code: 'IND', label: 'Independente', intrusiveness: 0 },
      { code: 'GES', label: 'Gestual', intrusiveness: 0.25 },
      { code: 'MOD', label: 'Modelo', intrusiveness: 0.5 },
      { code: 'FP', label: 'Física parcial', intrusiveness: 0.75 },
      { code: 'FT', label: 'Física total', intrusiveness: 1 },
    ],
  },
];

export const children: Child[] = [
  { id: 'ch-teo', preferredName: 'Teo', fullName: 'Teodoro (fictício)', birthDate: yearsAgo(4, 2), hue: 162, accessCode: 'TEO-4821' },
  { id: 'ch-lia', preferredName: 'Lia', fullName: 'Lia (fictícia)', birthDate: yearsAgo(2, 8), hue: 262, accessCode: 'LIA-3157' },
  { id: 'ch-davi', preferredName: 'Davi', fullName: 'Davi (fictício)', birthDate: yearsAgo(7, 1), hue: 28, accessCode: 'DAVI-7094' },
  { id: 'ch-bento', preferredName: 'Bento', fullName: 'Bento (fictício)', birthDate: yearsAgo(13, 4), hue: 205, accessCode: 'BENTO-5530' },
  { id: 'ch-nina', preferredName: 'Nina', fullName: 'Nina (fictícia)', birthDate: yearsAgo(1, 8), hue: 336, accessCode: 'NINA-2260' },
];

export const cases: CaseRecord[] = [
  {
    id: 'case-bento', childId: 'ch-bento', model: 'ABA', status: 'active', openedAt: daysAgo(160),
    planVersion: 2, planStatus: 'active', planApprovedAt: daysAgo(30), planReviewOn: daysAgo(-60).slice(0, 10),
    team: [{ professionalId: 'pro-helena', role: 'supervisor' }, { professionalId: 'pro-rafael', role: 'responsible' }],
    adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 4, feedback: 'subtle', motion: 'reduced', palette: 'calm' },
    interests: ['futebol', 'música eletrônica', 'mapas'],
    restrictions: [],
    tokenTheme: 'bola',
    releasedApps: ['encontre-o-igual', 'escolha-pela-instrucao', 'minha-vez-sua-vez', 'prancha', 'calma'],
  },
  {
    id: 'case-teo', childId: 'ch-teo', model: 'ABA', status: 'active', openedAt: daysAgo(120),
    planVersion: 2, planStatus: 'active', planApprovedAt: daysAgo(45), planReviewOn: daysAgo(-12).slice(0, 10),
    team: [
      { professionalId: 'pro-helena', role: 'responsible' },
      { professionalId: 'pro-rafael', role: 'implementer' },
      { professionalId: 'pro-julia', role: 'implementer' },
    ],
    adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 3, feedback: 'subtle', motion: 'reduced', builtInPromptAfterMs: 6000 },
    interests: ['trens', 'bolhas de sabão', 'música'],
    restrictions: ['Sem comestíveis com glúten'],
    tokenTheme: 'trem',
    releasedApps: ['encontre-o-igual', 'escolha-pela-instrucao', 'minha-vez-sua-vez', 'prancha', 'calma'],
  },
  {
    id: 'case-lia', childId: 'ch-lia', model: 'DENVER', status: 'active', openedAt: daysAgo(90),
    planVersion: 1, planStatus: 'active', planApprovedAt: daysAgo(76), planReviewOn: daysAgo(-8).slice(0, 10),
    team: [
      { professionalId: 'pro-helena', role: 'responsible' },
      { professionalId: 'pro-julia', role: 'implementer' },
    ],
    adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 2, sound: 'low', motion: 'static', feedback: 'subtle' },
    interests: ['bolhas', 'músicas com gestos', 'blocos'],
    restrictions: ['Sensível a sons altos'],
    tokenTheme: 'estrela',
    releasedApps: ['minha-vez-sua-vez', 'prancha', 'calma'],
  },
  {
    id: 'case-davi', childId: 'ch-davi', model: 'ABA', status: 'active', openedAt: daysAgo(200),
    planVersion: 3, planStatus: 'active', planApprovedAt: daysAgo(20), planReviewOn: daysAgo(-40).slice(0, 10),
    team: [
      { professionalId: 'pro-rafael', role: 'responsible' },
      { professionalId: 'pro-helena', role: 'supervisor' },
    ],
    adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 4, feedback: 'festive', motion: 'full', palette: 'vivid', sound: 'normal' },
    interests: ['dinossauros', 'quebra-cabeças'],
    restrictions: [],
    tokenTheme: 'dinossauro',
    releasedApps: ['encontre-o-igual', 'escolha-pela-instrucao', 'minha-vez-sua-vez', 'prancha', 'calma'],
  },
  {
    id: 'case-nina', childId: 'ch-nina', model: 'DENVER', status: 'active', openedAt: daysAgo(30),
    planVersion: 1, planStatus: 'active', planApprovedAt: daysAgo(21), planReviewOn: daysAgo(-63).slice(0, 10),
    team: [{ professionalId: 'pro-helena', role: 'responsible' }],
    adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 1, motion: 'static', sound: 'low' },
    interests: ['cantigas', 'água'],
    restrictions: [],
    tokenTheme: 'folha',
    releasedApps: [],
  },
];

export const goals: Goal[] = [
  { id: 'g-teo-1', caseId: 'case-teo', domain: 'Linguagem receptiva', description: 'Responder como ouvinte a nomes de objetos do dia a dia.' },
  { id: 'g-teo-2', caseId: 'case-teo', domain: 'Discriminação visual', description: 'Parear estímulos idênticos com independência em campo de 3.' },
  { id: 'g-teo-3', caseId: 'case-teo', domain: 'Habilidades sociais', description: 'Esperar a vez e participar de trocas de turno em brincadeira.' },
  { id: 'g-bento-1', caseId: 'case-bento', domain: 'Habilidades sociais', description: 'Manter conversas recíprocas com colegas.' },
  { id: 'g-davi-1', caseId: 'case-davi', domain: 'Comunicação funcional', description: 'Pedir itens e atividades com frase de 3 palavras.' },
];

export const programs: Program[] = [
  {
    id: 'p-bento-turnos', caseId: 'case-bento', goalId: 'g-bento-1', name: 'Conversa em turnos', repertoire: 'social', procedure: 'DTT',
    operationalDefinition: 'Espera o parceiro terminar a fala e responde no tema em até 8 s.',
    sdTemplate: 'Sua vez', errorCorrection: 'Pista visual de vez e nova oportunidade.',
    promptHierarchyId: 'ph-ltm', masteryPct: 90, compatibleApps: ['minha-vez-sua-vez'],
  },
  {
    id: 'p-teo-ouvinte', caseId: 'case-teo', goalId: 'g-teo-1', name: 'Ouvinte — objetos comuns', repertoire: 'listener', procedure: 'DTT',
    operationalDefinition: 'Toca a figura correspondente ao nome falado, em campo de 3, em até 5 s após a instrução.',
    sdTemplate: 'Toque na {alvo}', errorCorrection: 'Reapresentar com dica gestual e, em seguida, tentativa de transferência.',
    promptHierarchyId: 'ph-ltm', masteryPct: 90, compatibleApps: ['escolha-pela-instrucao'],
  },
  {
    id: 'p-teo-pareamento', caseId: 'case-teo', goalId: 'g-teo-2', name: 'Pareamento de idênticos', repertoire: 'matching', procedure: 'DTT',
    operationalDefinition: 'Coloca/toca o cartão idêntico ao modelo, em campo de 3, sem dica.',
    sdTemplate: 'Encontre o igual', errorCorrection: 'Retornar o cartão e reapresentar com dica posicional.',
    promptHierarchyId: 'ph-ltm', masteryPct: 90, compatibleApps: ['encontre-o-igual'],
  },
  {
    id: 'p-teo-turnos', caseId: 'case-teo', goalId: 'g-teo-3', name: 'Troca de turnos em jogo', repertoire: 'social', procedure: 'DTT',
    operationalDefinition: 'Aguarda sem tocar durante a vez do parceiro e joga na própria vez em até 8 s.',
    sdTemplate: 'Minha vez… agora é sua vez!', errorCorrection: 'Bloqueio gentil e pista visual do bastão.',
    promptHierarchyId: 'ph-ltm', masteryPct: 90, compatibleApps: ['minha-vez-sua-vez'],
  },
  {
    id: 'p-davi-mando', caseId: 'case-davi', goalId: 'g-davi-1', name: 'Mando com frase', repertoire: 'mand', procedure: 'NET',
    operationalDefinition: 'Emite pedido vocal com 3 palavras (ex.: "quero o dinossauro") diante do item visível e inacessível.',
    sdTemplate: 'Oportunidade natural com item preferido', errorCorrection: 'Modelo ecoico da frase e entrega após tentativa.',
    promptHierarchyId: 'ph-ltm', masteryPct: 90, compatibleApps: [],
  },
];

export const targets: Target[] = [
  { id: 't-bento-turno', programId: 'p-bento-turnos', caseId: 'case-bento', name: 'esperar e responder na vez', art: 'bola', phase: 'maintenance', teachingChannel: 'digital', phaseChangedAt: daysAgo(20), defaultPrompt: 'IND' },
  { id: 't-bento-pedir', programId: 'p-bento-turnos', caseId: 'case-bento', name: 'pedir esclarecimento', art: 'livro', phase: 'acquisition', teachingChannel: 'table', phaseChangedAt: daysAgo(12), defaultPrompt: 'GES' },
  { id: 't-bola', programId: 'p-teo-ouvinte', caseId: 'case-teo', name: 'bola', art: 'bola', phase: 'acquisition', teachingChannel: 'table', phaseChangedAt: daysAgo(30), defaultPrompt: 'IND' },
  { id: 't-copo', programId: 'p-teo-ouvinte', caseId: 'case-teo', name: 'copo', art: 'copo', phase: 'acquisition', teachingChannel: 'table', phaseChangedAt: daysAgo(30), defaultPrompt: 'GES' },
  { id: 't-carro', programId: 'p-teo-ouvinte', caseId: 'case-teo', name: 'carro', art: 'carro', phase: 'maintenance', teachingChannel: 'table', phaseChangedAt: daysAgo(14), defaultPrompt: 'IND' },
  { id: 't-maca', programId: 'p-teo-ouvinte', caseId: 'case-teo', name: 'maçã', art: 'maca', phase: 'baseline', teachingChannel: 'table', phaseChangedAt: daysAgo(4), defaultPrompt: 'IND' },
  { id: 't-sapato', programId: 'p-teo-pareamento', caseId: 'case-teo', name: 'sapato', art: 'sapato', phase: 'acquisition', teachingChannel: 'digital', phaseChangedAt: daysAgo(30), defaultPrompt: 'IND' },
  { id: 't-livro', programId: 'p-teo-pareamento', caseId: 'case-teo', name: 'livro', art: 'livro', phase: 'maintenance', teachingChannel: 'digital', phaseChangedAt: daysAgo(18), defaultPrompt: 'IND' },
  { id: 't-turno', programId: 'p-teo-turnos', caseId: 'case-teo', name: 'esperar e jogar na vez', art: 'bola', phase: 'acquisition', teachingChannel: 'digital', phaseChangedAt: daysAgo(30), defaultPrompt: 'GES' },
  { id: 't-davi-dino', programId: 'p-davi-mando', caseId: 'case-davi', name: '"quero o dinossauro"', art: 'bola', phase: 'acquisition', teachingChannel: 'natural', phaseChangedAt: daysAgo(18), defaultPrompt: 'MOD' },
];

/* ------------------------------------------------------- histórico de sessões */
const rnd = seededRandom(20261004);
const sessionDays = [40, 38, 35, 33, 31, 28, 26, 24, 21, 19, 17, 14, 12, 10, 7, 5, 3];

export const sessions: SessionRecord[] = [];
export const facts: Fact[] = [];
export const behaviorEvents: BehaviorEvent[] = [];

const L = hierarchies[0]!.levels;
let factSeq = 0;

function trials(
  target: Target,
  session: SessionRecord,
  n: number,
  pInd: number,
  pPrompted: number,
  channel: Fact['channel'],
  opts: { phase?: Fact['phase']; probe?: boolean; positionBias?: boolean; promptCode?: string } = {},
) {
  const kInd = Math.round(n * pInd);
  const kPr = Math.min(n - kInd, Math.round(n * pPrompted));
  const outcomes = shuffle(
    [
      ...Array.from({ length: kInd }, () => 'ind'),
      ...Array.from({ length: kPr }, () => 'pr'),
      ...Array.from({ length: n - kInd - kPr }, () => 'err'),
    ],
    rnd,
  );
  outcomes.forEach((o) => {
    const prompt = o === 'ind' ? L[0]! : o === 'pr' ? L.find((l) => l.code === (opts.promptCode ?? 'GES'))! : L[rnd() < 0.5 ? 2 : 3]!;
    const pos = Math.floor(rnd() * 3);
    facts.push({
      id: `f-${++factSeq}`,
      targetId: target.id,
      sessionId: session.id,
      sessionAt: session.startedAt,
      phase: opts.phase ?? target.phase,
      response: o === 'err' ? (rnd() < 0.7 ? 'incorrect' : 'no_response') : 'correct',
      promptIntrusiveness: o === 'ind' ? 0 : prompt.intrusiveness,
      promptCode: o === 'ind' ? 'IND' : prompt.code,
      latencyMs: Math.round(1400 + rnd() * 2600 - (o === 'ind' ? 300 : 0)),
      channel,
      setting: session.setting,
      implementerId: session.implementerId,
      probe: opts.probe ?? false,
      fieldSize: 3,
      positionOfTarget: pos,
      selectedPosition: opts.positionBias ? (rnd() < 0.72 ? 0 : pos) : o === 'err' ? (pos + 1) % 3 : pos,
      art: target.art,
    });
  });
}

const T = (id: string) => targets.find((t) => t.id === id)!;
const ramp = (i: number, total: number, from: number, to: number) => from + ((to - from) * i) / Math.max(1, total - 1);

sessionDays.forEach((d, i) => {
  const implementer = i % 3 === 2 ? 'pro-julia' : 'pro-rafael';
  const s: SessionRecord = {
    id: `s-teo-${i + 1}`, caseId: 'case-teo', model: 'ABA', setting: i === 9 ? 'home' : 'clinic',
    implementerId: implementer, startedAt: daysAgo(d, 9 + (i % 2) * 5), endedAt: daysAgo(d, 10 + (i % 2) * 5),
    status: 'completed', clinicalNote: 'Sessão aplicada conforme plano. Criança engajada na maior parte do tempo.', screenSeconds: 480,
  };
  sessions.push(s);
  const total = sessionDays.length;

  // bola: aquisição crescente até atingir o critério nas duas últimas sessões (R1)
  if (i >= 3) {
    const k = i - 3;
    const n = total - 3;
    const pInd = k >= n - 2 ? (k === n - 1 ? 1 : 0.9) : ramp(k, n - 2, 0.2, 0.8);
    trials(T('t-bola'), s, 10, pInd, Math.max(0, 0.85 - pInd), 'table', { phase: 'acquisition' });
  } else {
    trials(T('t-bola'), s, 6, [0.1, 0.2, 0.1][i]!, 0, 'table', { phase: 'baseline' });
  }

  // copo: estagnação nas últimas sessões (R2)
  if (i >= 4) trials(T('t-copo'), s, 10, [0.3, 0.4, 0.4, 0.5, 0.5, 0.4, 0.5, 0.4, 0.4, 0.4, 0.3, 0.4, 0.3][i - 4] ?? 0.4, 0.3, 'table', { phase: 'acquisition' });

  // carro: aquisição → domínio → manutenção com queda na última sonda (R5)
  if (i < 10) trials(T('t-carro'), s, 10, Math.min(1, ramp(i, 10, 0.4, 1)), 0.1, 'table', { phase: 'acquisition' });
  else if (i === 13 || i === 16) trials(T('t-carro'), s, 5, i === 16 ? 0.6 : 0.9, 0, 'table', { phase: 'maintenance', probe: true });

  // sapato: jogo digital em aquisição, com viés de posição recente (R8)
  if (i >= 5) trials(T('t-sapato'), s, 8, ramp(i - 5, total - 5, 0.3, 0.55), 0.15, 'digital', { phase: 'acquisition', positionBias: i >= 13 });

  // livro: dominado no jogo, em manutenção, sem sonda fora da tela recente (R6)
  if (i < 9) trials(T('t-livro'), s, 8, Math.min(1, ramp(i, 9, 0.5, 1)), 0.1, 'digital', { phase: 'acquisition' });
  else if (i === 15) trials(T('t-livro'), s, 5, 1, 0, 'digital', { phase: 'maintenance', probe: true });

  // turnos: dependência de dica (R3)
  if (i >= 8) trials(T('t-turno'), s, 10, 0.1, 0.8, 'digital', { phase: 'acquisition', promptCode: i > 12 ? 'MOD' : 'GES' });

  // comportamento: "jogar-se no chão" estável e com aumento na última sessão (R11)
  const count = i === total - 1 ? 7 : [1, 2, 1, 0, 2, 1, 1, 2, 0, 1, 1, 2, 1, 1, 0, 2][i] ?? 1;
  for (let k = 0; k < count; k++) {
    behaviorEvents.push({
      id: `be-${i}-${k}`, sessionId: s.id, definitionId: 'bd-teo-chao', at: s.startedAt,
      antecedent: k % 2 ? 'Transição de atividade' : 'Retirada do item preferido', consequence: 'Bloqueio + redirecionamento',
    });
  }
});

// Davi: algumas sessões em NET
[16, 12, 9, 6, 2].forEach((d, i) => {
  const s: SessionRecord = {
    id: `s-davi-${i + 1}`, caseId: 'case-davi', model: 'ABA', setting: 'clinic', implementerId: 'pro-rafael',
    startedAt: daysAgo(d, 16), endedAt: daysAgo(d, 17), status: 'completed', clinicalNote: 'Oportunidades criadas no brincar com dinossauros.', screenSeconds: 0,
  };
  sessions.push(s);
  trials(T('t-davi-dino'), s, 8, [0.25, 0.375, 0.5, 0.5, 0.625][i]!, 0.25, 'natural', { phase: 'acquisition', promptCode: 'MOD' });
});

// Lia (Denver): sessões sem tentativas discretas
[20, 16, 13, 9, 6, 2].forEach((d, i) =>
  sessions.push({
    id: `s-lia-${i + 1}`, caseId: 'case-lia', model: 'DENVER', setting: i === 3 ? 'home' : 'clinic', implementerId: 'pro-julia',
    startedAt: daysAgo(d, 10), endedAt: daysAgo(d, 11), status: 'completed', clinicalNote: 'Rotinas sensório-sociais com bolhas e música; boa regulação.', screenSeconds: 0,
  }),
);

export const behaviorDefinitions: BehaviorDefinition[] = [
  {
    id: 'bd-teo-chao', caseId: 'case-teo', name: 'Jogar-se no chão', topography: 'Corpo inteiro no chão, com ou sem choro, por ≥ 3 s.', measure: 'frequency', risk: false,
    examples: ['Deita no chão ao ouvir “acabou”', 'Senta e se joga para trás ao ser chamado para a mesa'],
    nonExamples: ['Sentar no chão para brincar', 'Deitar no tapete na rotina de descanso'],
    hypothesizedFunction: 'escape',
    plan: {
      antecedentStrategies: 'Aviso de transição com agenda visual e cronômetro; oferecer escolha entre duas atividades.',
      replacementBehavior: 'Pedir “pausa” com o cartão de pausa (ensinado como mando).',
      consequences: 'Sem retirada da demanda após o comportamento; reforçar imediatamente o pedido de pausa.',
    },
  },
  {
    id: 'bd-teo-morder', caseId: 'case-teo', name: 'Morder a mão', topography: 'Dentes em contato com a própria mão com pressão visível.', measure: 'frequency', risk: true,
    hypothesizedFunction: 'unknown',
    plan: {
      antecedentStrategies: 'Reduzir demandas sucessivas; pausas sensoriais programadas a cada 10 minutos.',
      replacementBehavior: 'Apertar o mordedor ou a bola sensorial.',
      consequences: 'Bloqueio suave e redirecionamento ao mordedor, sem comentários.',
      safetyProtocol: 'Se houver lesão de pele: interromper a sessão, higienizar, registrar incidente e avisar a supervisora e a família no mesmo dia.',
    },
  },
];

export const reinforcers: Reinforcer[] = [
  { id: 'r-bolhas', caseId: 'case-teo', name: 'Bolhas de sabão', category: 'atividade', rank: 1, assessedAt: daysAgo(9), choiceRates: [0.8, 0.7, 0.5, 0.35] },
  { id: 'r-trem', caseId: 'case-teo', name: 'Trem de brinquedo', category: 'tangível', rank: 2, assessedAt: daysAgo(9), choiceRates: [0.6, 0.6, 0.65, 0.7] },
  { id: 'r-musica', caseId: 'case-teo', name: 'Música no tablet (2 min)', category: 'digital', rank: 3, assessedAt: daysAgo(9), choiceRates: [0.4, 0.45, 0.4, 0.5] },
  { id: 'r-cocegas', caseId: 'case-teo', name: 'Cócegas e “vou te pegar”', category: 'social', rank: 4, assessedAt: daysAgo(9), choiceRates: [0.5, 0.5, 0.55, 0.5] },
  { id: 'r-dino', caseId: 'case-davi', name: 'Dinossauros de vinil', category: 'tangível', rank: 1, assessedAt: daysAgo(5), choiceRates: [0.9, 0.85, 0.9, 0.9] },
  { id: 'r-lia-bolhas', caseId: 'case-lia', name: 'Bolhas', category: 'atividade', rank: 1, assessedAt: daysAgo(12), choiceRates: [0.9, 0.9, 0.85, 0.9] },
];

export const denverCycles: DenverCycle[] = [
  { id: 'dc-lia-1', caseId: 'case-lia', startsOn: daysAgo(76).slice(0, 10), endsOn: daysAgo(-8).slice(0, 10) },
  { id: 'dc-nina-1', caseId: 'case-nina', startsOn: daysAgo(21).slice(0, 10), endsOn: daysAgo(-63).slice(0, 10) },
];

export const denverObjectives: DenverObjective[] = [
  {
    id: 'do-lia-1', caseId: 'case-lia', domain: 'Atenção conjunta', level: 1,
    description: 'Segue o apontar do adulto para objetos próximos durante rotinas de brincadeira.',
    steps: [
      { id: 'ds-1', description: 'Olha para o objeto tocado pelo adulto', status: 'mastered', proportions: [0.5, 0.7, 0.8, 0.9, 1, 1] },
      { id: 'ds-2', description: 'Segue o apontar a 30 cm', status: 'acquisition', proportions: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7] },
      { id: 'ds-3', description: 'Segue o apontar a 1 m', status: 'not_started', proportions: [] },
    ],
  },
  {
    id: 'do-lia-2', caseId: 'case-lia', domain: 'Imitação', level: 1,
    description: 'Imita ações com objetos em rotinas de atividade conjunta.',
    steps: [
      { id: 'ds-4', description: 'Imita 1 ação com objeto idêntico', status: 'acquisition', proportions: [0.4, 0.45, 0.4, 0.35, 0.4, 0.35] },
      { id: 'ds-5', description: 'Imita 3 ações diferentes', status: 'not_started', proportions: [] },
    ],
  },
  {
    id: 'do-lia-3', caseId: 'case-lia', domain: 'Comunicação expressiva', level: 1,
    description: 'Usa gesto ou vocalização dirigida para pedir continuação da rotina.',
    steps: [
      { id: 'ds-6', description: 'Olha + vocaliza para pedir “mais”', status: 'acquisition', proportions: [0.3, 0.4, 0.5, 0.55, 0.65, 0.7] },
    ],
  },
  {
    id: 'do-nina-1', caseId: 'case-nina', domain: 'Comunicação receptiva', level: 1,
    description: 'Orienta-se ao ouvir o próprio nome em rotinas sensório-sociais.',
    steps: [{ id: 'ds-7', description: 'Orienta-se ao nome a 1 m, com rotina pausada', status: 'acquisition', proportions: [0.3, 0.4] }],
  },
];

export const timeline: TimelineEvent[] = [
  { id: 'tl-1', caseId: 'case-teo', at: daysAgo(45), kind: 'plan_approved', title: 'Plano ABA v2 aprovado', detail: 'Inclusão de troca de turnos.' },
  { id: 'tl-2', caseId: 'case-teo', at: daysAgo(14), kind: 'phase_change', title: '“carro” → Manutenção', detail: 'Critério atingido (90% em 2 sessões).' },
  { id: 'tl-3', caseId: 'case-teo', at: daysAgo(19), kind: 'context', title: 'Início de nova medicação (informado pela família)' },
  { id: 'tl-4', caseId: 'case-lia', at: daysAgo(76), kind: 'plan_approved', title: 'Plano Denver v1 aprovado', detail: 'Ciclo trimestral 1.' },
];

/* ------------------------------------------------------- família e documentos */

export const guardians: Guardian[] = [
  { id: 'gd-teo-mae', name: 'Marina (fictícia)', relationship: 'mãe', childId: 'ch-teo' },
  { id: 'gd-lia-pai', name: 'Caio (fictício)', relationship: 'pai', childId: 'ch-lia' },
];

export const homeTasks: HomeTask[] = [
  {
    id: 'ht-1', caseId: 'case-teo', targetId: 't-bola', title: 'Pegar a bola quando pedirem',
    instructions: 'Na hora de brincar, deixe 3 brinquedos à vista e peça: “Me dá a bola”. Espere 5 segundos. Se ele pegar, comemore e brinque junto. Se não, aponte para a bola e repita uma vez.',
    frequency: '3 vezes por dia', active: true, createdAt: daysAgo(10),
  },
  {
    id: 'ht-2', caseId: 'case-teo', targetId: 't-turno', title: 'Minha vez, sua vez no jogo de encaixe',
    instructions: 'Revezem peças de um brinquedo de encaixe. Diga “minha vez” ao jogar e “sua vez” ao entregar a peça. Se ele pegar na sua vez, segure a peça com calma e mostre que logo é a vez dele.',
    frequency: '1 vez por dia', active: true, createdAt: daysAgo(6),
  },
];

export const homeTaskRecords: HomeTaskRecord[] = [5, 4, 3, 2, 1].flatMap((d, i) => [
  { id: `htr-a${i}`, taskId: 'ht-1', occurredOn: daysAgo(d).slice(0, 10), opportunities: 3, successes: [1, 1, 2, 2, 3][i]!, guardianId: 'gd-teo-mae', recordedAt: daysAgo(d, 20) },
  ...(i % 2 === 0 ? [{ id: `htr-b${i}`, taskId: 'ht-2', occurredOn: daysAgo(d).slice(0, 10), opportunities: 4, successes: [1, 2, 2][i / 2]!, guardianId: 'gd-teo-mae', recordedAt: daysAgo(d, 19) }] : []),
]);

export const guidance: Guidance[] = [
  {
    id: 'gu-1',
    caseId: 'case-teo',
    title: 'Como ajudar sem dar a resposta (Espera e Dicas Leves)',
    authorId: 'pro-helena',
    publishedAt: daysAgo(12),
    readBy: ['gd-teo-mae'],
    body: 'Quando o Teo demorar para responder, espere alguns segundos antes de ajudar. Se for preciso, comece pela ajuda mais leve (apontar) e só depois pegue na mão dele. Assim ele aprende a fazer sozinho.',
    objective: 'Promover iniciativa e autonomia na comunicação funcional em casa.',
    strategy: 'Dar tempo de latência de 3 a 5 segundos após a instrução antes de fornecer qualquer dica física.',
    avoid: 'Dar a resposta imediatamente ou pegar na mão antes que ele tente por conta própria.',
    practiceTip: 'Experimente na hora das refeições e ao escolher brinquedos favoritos.',
    frequency: 'Praticar diariamente durante atividades naturais.',
  },
  {
    id: 'gu-2',
    caseId: 'case-teo',
    title: 'Transições mais tranquilas com Suporte Visual',
    authorId: 'pro-helena',
    publishedAt: daysAgo(3),
    readBy: [],
    body: 'Antes de terminar uma brincadeira de que ele gosta, avise: “mais um pouquinho e depois vamos lanchar”. Mostrar a figura da próxima atividade ajuda. Evite tirar o brinquedo de surpresa.',
    objective: 'Reduzir comportamentos de frustração nas mudanças de atividade.',
    strategy: 'Avisar 2 minutos antes e usar o Primeiro → Depois (Primeiro guardar, Depois lanchar).',
    avoid: 'Interromper a brincadeira abruptamente sem aviso prévio ou suporte visual.',
    practiceTip: 'Deixe o relógio/timer ou a figura da próxima atividade ao alcance visual dele.',
    frequency: 'Em todas as transições de atividade de alta para baixa preferência.',
  },
];

export const documents: ClinicalDocument[] = [
  {
    id: 'doc-1', caseId: 'case-teo', kind: 'family_summary', title: 'Resumo para a família — setembro', sharedWithFamily: true,
    versions: [{
      version: 1, status: 'final', authorId: 'pro-helena', council: 'CRP (demonstração)', createdAt: daysAgo(4), hash: 'demo',
      analysis: 'O Teo tem participado bem das sessões. Ele já reconhece o carro quando pedimos e está muito perto de reconhecer a bola. Vamos continuar treinando em casa com as tarefas combinadas.',
      snapshot: { periodFrom: daysAgo(34).slice(0, 10), periodTo: daysAgo(4).slice(0, 10), sessions: 12, targets: [] },
    }],
  },
];

/* ------------------------------------------------------- avaliação e supervisão */
export const prerequisiteProbes: PrerequisiteProbe[] = [
  { id: 'pp-1', caseId: 'case-teo', skill: 'tolera-tablet', passed: true, at: daysAgo(60), by: 'pro-helena' },
  { id: 'pp-2', caseId: 'case-teo', skill: 'toca-alvo-intencional', passed: true, at: daysAgo(60), by: 'pro-helena' },
  { id: 'pp-3', caseId: 'case-teo', skill: 'pareia-figura-identica', passed: true, at: daysAgo(45), by: 'pro-rafael' },
  { id: 'pp-4', caseId: 'case-teo', skill: 'identifica-figura-nomeada', passed: false, at: daysAgo(45), by: 'pro-rafael' },
  { id: 'pp-5', caseId: 'case-davi', skill: 'tolera-tablet', passed: true, at: daysAgo(100), by: 'pro-rafael' },
];

export const preferenceAssessments: PreferenceAssessment[] = [
  { id: 'pa-1', caseId: 'case-teo', method: 'mswo', format: 'in_person', ranking: ['r-bolhas', 'r-trem', 'r-musica', 'r-cocegas'], at: daysAgo(9), by: 'pro-rafael', validUntil: daysAgo(2).slice(0, 10) },
];

const comp = (name: string, observed: number, correct: number) => ({ name, observed, correct });
export const fidelityObservations: FidelityObservation[] = [
  {
    id: 'fo-1', caseId: 'case-teo', programId: 'p-teo-ouvinte', implementerId: 'pro-rafael', observerId: 'pro-helena', at: daysAgo(16), mode: 'live',
    components: [comp('Obtém atenção antes da instrução', 10, 10), comp('Apresenta a instrução conforme definida', 10, 9), comp('Aguarda a latência programada', 10, 7), comp('Aplica a dica do nível previsto', 4, 3), comp('Aplica a consequência programada', 10, 10), comp('Registra a tentativa', 10, 10)],
    notes: 'Esperar 5 s antes da dica em todas as tentativas; tendência a antecipar a ajuda.',
  },
  {
    id: 'fo-2', caseId: 'case-teo', programId: 'p-teo-pareamento', implementerId: 'pro-julia', observerId: 'pro-helena', at: daysAgo(8), mode: 'video',
    components: [comp('Obtém atenção antes da instrução', 8, 8), comp('Apresenta a instrução conforme definida', 8, 8), comp('Aguarda a latência programada', 8, 8), comp('Aplica a dica do nível previsto', 2, 2), comp('Aplica a consequência programada', 8, 7), comp('Registra a tentativa', 8, 8)],
    notes: 'Procedimento consistente.',
  },
];

export const ioaSessions: IoaSession[] = [
  { id: 'ioa-1', caseId: 'case-teo', targetId: 't-bola', observerA: 'pro-rafael', observerB: 'pro-helena', at: daysAgo(12), a: ['+', '+', '-', '+', '+', '0', '+', '+', '-', '+'], b: ['+', '+', '-', '+', '-', '0', '+', '+', '-', '+'] },
];

export const supervisionLogs: SupervisionLog[] = [
  { id: 'sl-1', implementerId: 'pro-rafael', caseId: 'case-teo', supervisorId: 'pro-helena', at: daysAgo(16), minutes: 45, kind: 'direct', notes: 'Observação ao vivo + feedback sobre latência antes da dica.' },
  { id: 'sl-2', implementerId: 'pro-julia', caseId: 'case-teo', supervisorId: 'pro-helena', at: daysAgo(8), minutes: 30, kind: 'indirect', notes: 'Revisão de vídeo e de gráficos.' },
  { id: 'sl-3', implementerId: 'pro-julia', caseId: 'case-lia', supervisorId: 'pro-helena', at: daysAgo(5), minutes: 60, kind: 'direct', notes: 'Modelação de rotina sensório-social com fechamento.' },
];

export const competencies: Competency[] = [
  { professionalId: 'pro-rafael', procedure: 'DTT', status: 'competent', at: daysAgo(200) },
  { professionalId: 'pro-rafael', procedure: 'NET', status: 'competent', at: daysAgo(150) },
  { professionalId: 'pro-rafael', procedure: 'behavior_recording', status: 'in_training', at: daysAgo(20) },
  { professionalId: 'pro-julia', procedure: 'DTT', status: 'competent', at: daysAgo(120) },
  { professionalId: 'pro-julia', procedure: 'denver_routine', status: 'competent', at: daysAgo(90) },
  { professionalId: 'pro-julia', procedure: 'chaining', status: 'in_training', at: daysAgo(10) },
];

/* ------------------------------------------------------- espaço da criança */
export const childSpaces: ChildSpace[] = [
  {
    childId: 'ch-teo', avatar: 'raposa', theme: 'sol', sound: true,
    stars: { 'encontre-o-igual': 9, 'escolha-pela-instrucao': 6, 'minha-vez-sua-vez': 3 },
    stickers: ['trem', 'bola', 'peixe'],
    plays: [],
  },
  { childId: 'ch-bento', avatar: 'onda', theme: 'noite', sound: false, stars: { 'minha-vez-sua-vez': 12, 'escolha-pela-instrucao': 6 }, stickers: ['aviao', 'bola', 'casa'], plays: [] },
  { childId: 'ch-davi', avatar: 'dino', theme: 'floresta', sound: true, stars: { 'encontre-o-igual': 15 }, stickers: ['dinossauro', 'aviao'], plays: [] },
];
