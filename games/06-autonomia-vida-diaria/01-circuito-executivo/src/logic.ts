/**
 * Aprumo — Circuito Executivo.
 * Um circuito de três estações com o robô Bip (cada estação é uma fase/LEVEL):
 *   1. Coleta (Go/No-Go): baterias caem por gravidade — toque para pegar; gotas d'água NÃO
 *      (curto-circuito). 70% go / 30% no-go (resposta prepotente). Escada: a gravidade aumenta após
 *      acertos e diminui após erros (janela de resposta adaptativa).
 *   2. Troca de regra (DCCS): cartas de cor+forma; fase "cor", depois "forma" (troca), e opcionalmente
 *      "misto" (moldura = forma; sem moldura = cor).
 *   3. Memória (Corsi): 9 luzes; repetir a sequência. Span começa em 2, sobe após 2 acertos no mesmo
 *      tamanho e a estação termina com 2 erros no mesmo tamanho (regra clássica).
 */
import { seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig } from '@aprumo/protocol';

export type ExecutiveChallengeType = 'gonogo' | 'ruleshift' | 'workingmemory';
export const STATION_ORDER: ExecutiveChallengeType[] = ['gonogo', 'ruleshift', 'workingmemory'];
export const STATION_TITLE: Record<ExecutiveChallengeType, string> = {
  gonogo: 'Coleta de energia',
  ruleshift: 'Troca de regra',
  workingmemory: 'Luzes da memória',
};

/** Estações pedidas em `params.stations` (padrão: as três, na ordem do circuito). */
export function stationsFrom(params: Record<string, unknown>): ExecutiveChallengeType[] {
  const v = params.stations;
  if (!Array.isArray(v)) return STATION_ORDER;
  const ok = STATION_ORDER.filter((s) => v.includes(s));
  return ok.length ? ok : STATION_ORDER;
}

/* ------------------------------------------------------------ 1. Go / No-Go */

export interface GoNoGoTrial {
  id: string;
  type: 'go' | 'nogo';
  targetSymbol: string;
  displayDurationMs: number;
  /** Coluna de queda (0–4). */
  lane: number;
}

/**
 * Sequência pseudoaleatória 70/30 sem mais de 2 no-go seguidos e sem no-go nas 2 primeiras
 * (a criança aprende a responder antes de inibir).
 */
export function planGoNoGo(n: number, rnd: () => number): GoNoGoTrial[] {
  const nogos = Math.max(1, Math.round(n * 0.3));
  const types: ('go' | 'nogo')[] = shuffle([...Array(n - nogos).fill('go'), ...Array(nogos).fill('nogo')], rnd);
  // Reparos: começa com 2 go; no máximo 2 no-go seguidos.
  for (let i = 0; i < types.length; i++) {
    const tooMany = i >= 2 && types[i] === 'nogo' && types[i - 1] === 'nogo' && types[i - 2] === 'nogo';
    if ((i < 2 && types[i] === 'nogo') || tooMany) {
      const j = types.findIndex((t, k) => k > i && t === 'go');
      if (j > 0) [types[i], types[j]] = [types[j]!, types[i]!];
    }
  }
  let lastLane = -1;
  return types.map((type, i) => {
    let lane = Math.floor(rnd() * 5);
    if (lane === lastLane) lane = (lane + 2) % 5;
    lastLane = lane;
    return { id: `gn-${i + 1}`, type, targetSymbol: type === 'go' ? 'bateria' : 'gota', displayDurationMs: 0, lane };
  });
}

export function evaluateGoNoGo(trialType: 'go' | 'nogo', didTap: boolean): { outcome: 'hit' | 'miss' | 'false_alarm' | 'correct_inhibition'; isCorrect: boolean } {
  if (trialType === 'go') return didTap ? { outcome: 'hit', isCorrect: true } : { outcome: 'miss', isCorrect: false };
  return didTap ? { outcome: 'false_alarm', isCorrect: false } : { outcome: 'correct_inhibition', isCorrect: true };
}

/** Escada de gravidade (px/s²): acerto acelera 8%, erro desacelera 12%, dentro de [300, 1400]. */
export function nextGravity(g: number, correct: boolean): number {
  return Math.round(Math.max(300, Math.min(1400, g * (correct ? 1.08 : 0.88))));
}

/** Tempo de queda (ms) de uma altura h sob gravidade g, partindo do repouso: t = √(2h/g). */
export function fallTimeMs(heightPx: number, gravity: number): number {
  return Math.round(Math.sqrt((2 * Math.max(1, heightPx)) / Math.max(1, gravity)) * 1000);
}

/* ------------------------------------------------------------ 2. DCCS */

export type CardColor = 'laranja' | 'azul';
export type CardShape = 'engrenagem' | 'raio';
export type Rule = 'color' | 'shape' | 'mixed';

export interface RuleShiftTrial {
  id: string;
  card: { color: CardColor; shape: CardShape; border: boolean };
  activeRule: 'color' | 'shape';
  phase: Rule;
  /** Bandejas-alvo fixas: 0 = laranja/engrenagem, 1 = azul/raio. */
  correctTray: 0 | 1;
  /** Compatibilidade com a API anterior. */
  options: Array<{ id: string; color: 'blue' | 'orange'; shape: 'circle' | 'square'; label: string }>;
  correctOptionId: string;
}

/** Bandejas-alvo do DCCS: as cartas de teste sempre conflitam (cor de uma, forma da outra). */
export const TRAYS: { color: CardColor; shape: CardShape }[] = [
  { color: 'laranja', shape: 'engrenagem' },
  { color: 'azul', shape: 'raio' },
];

export function correctTrayFor(card: RuleShiftTrial['card'], rule: 'color' | 'shape'): 0 | 1 {
  if (rule === 'color') return card.color === TRAYS[0]!.color ? 0 : 1;
  return card.shape === TRAYS[0]!.shape ? 0 : 1;
}

export function planRuleShift(perPhase: number, rnd: () => number, mixed = false): RuleShiftTrial[] {
  const conflict: RuleShiftTrial['card'][] = [
    { color: 'azul', shape: 'engrenagem', border: false },
    { color: 'laranja', shape: 'raio', border: false },
  ];
  const out: RuleShiftTrial[] = [];
  const phases: Rule[] = mixed ? ['color', 'shape', 'mixed'] : ['color', 'shape'];
  for (const phase of phases) {
    // Alterna as duas cartas de conflito de forma balanceada e embaralhada.
    const cards = shuffle(Array.from({ length: perPhase }, (_, i) => conflict[i % 2]!), rnd);
    cards.forEach((c, i) => {
      const border = phase === 'mixed' ? rnd() < 0.5 : false;
      const card = { ...c, border };
      const activeRule: 'color' | 'shape' = phase === 'mixed' ? (border ? 'shape' : 'color') : phase;
      const tray = correctTrayFor(card, activeRule);
      out.push({
        id: `rs-${phase}-${i + 1}`,
        card,
        activeRule,
        phase,
        correctTray: tray,
        options: [
          { id: 'opt-orange', color: 'orange', shape: 'circle', label: activeRule === 'color' ? 'Laranja' : 'Engrenagem' },
          { id: 'opt-blue', color: 'blue', shape: 'square', label: activeRule === 'color' ? 'Azul' : 'Raio' },
        ],
        correctOptionId: tray === 0 ? 'opt-orange' : 'opt-blue',
      });
    });
  }
  return out;
}

/* ------------------------------------------------------------ 3. Corsi */

export interface MemorySequenceTrial {
  id: string;
  sequence: number[];
  sequenceLength: number;
}

/** Posições irregulares das 9 luzes (estilo blocos de Corsi), em % da placa. */
export const CORSI_LAYOUT: [number, number][] = [
  [14, 18], [48, 10], [80, 22], [26, 46], [62, 40], [88, 58], [12, 78], [44, 72], [74, 86],
];

/** Sequência sem repetir luz e sem vizinhos imediatos na ordem do layout (mais legível). */
export function makeSequence(length: number, rnd: () => number): number[] {
  const out: number[] = [];
  while (out.length < length) {
    const n = Math.floor(rnd() * CORSI_LAYOUT.length);
    if (!out.includes(n) && out[out.length - 1] !== n) out.push(n);
  }
  return out;
}

export function evaluateSequence(expected: number[], input: number[]): { isCorrect: boolean; isComplete: boolean } {
  if (input.length === 0) return { isCorrect: true, isComplete: false };
  for (let i = 0; i < input.length; i++) if (input[i] !== expected[i]) return { isCorrect: false, isComplete: false };
  return { isCorrect: true, isComplete: input.length === expected.length };
}

export interface CorsiState {
  span: number;
  correctAtSpan: number;
  errorsAtSpan: number;
  bestSpan: number;
  done: boolean;
  trials: number;
}

export const initialCorsi = (start = 2): CorsiState => ({ span: start, correctAtSpan: 0, errorsAtSpan: 0, bestSpan: 0, done: false, trials: 0 });

/** Regra clássica: 2 acertos no tamanho → +1; 2 erros no mesmo tamanho → fim. Limites: 9 luzes, 14 tentativas. */
export function stepCorsi(s: CorsiState, correct: boolean, maxTrials = 14): CorsiState {
  const trials = s.trials + 1;
  if (correct) {
    const bestSpan = Math.max(s.bestSpan, s.span);
    if (s.correctAtSpan + 1 >= 2) {
      const span = Math.min(9, s.span + 1);
      return { ...s, span, correctAtSpan: 0, errorsAtSpan: 0, bestSpan, trials, done: trials >= maxTrials || (span === 9 && s.span === 9) };
    }
    return { ...s, correctAtSpan: s.correctAtSpan + 1, bestSpan, trials, done: trials >= maxTrials };
  }
  const errorsAtSpan = s.errorsAtSpan + 1;
  return { ...s, errorsAtSpan, trials, done: errorsAtSpan >= 2 || trials >= maxTrials };
}

/* ------------------------------------------------------------ plano da sessão */

export interface CircuitPlan {
  stations: ExecutiveChallengeType[];
  gonogo: GoNoGoTrial[];
  ruleshift: RuleShiftTrial[];
  corsiStart: number;
  seed: number;
}

export function planCircuit(config: Pick<SessionConfig, 'clinical' | 'params'>): CircuitPlan {
  const rnd = seededRandom(config.clinical.seed);
  const t = config.clinical.trialsPerTarget;
  const corsiStart = typeof config.params.corsiStart === 'number' ? Math.max(2, Math.min(6, Math.floor(config.params.corsiStart))) : 2;
  return {
    stations: stationsFrom(config.params),
    gonogo: planGoNoGo(Math.max(10, Math.min(30, t * 3)), rnd),
    ruleshift: planRuleShift(Math.max(3, Math.min(8, t)), rnd, config.params.dccsMixed === true),
    corsiStart,
    seed: config.clinical.seed,
  };
}

/* ------------------------------------------------------------ compatibilidade */

export const GONOGO_PRESETS: GoNoGoTrial[] = planGoNoGo(6, seededRandom(1)).map((g, i) => ({ ...g, displayDurationMs: 1400 - i * 40 }));
export const RULE_SHIFT_PRESETS: RuleShiftTrial[] = planRuleShift(2, seededRandom(1));
export const MEMORY_PRESETS: MemorySequenceTrial[] = [2, 3, 4].map((len, i) => ({ id: `mem-${i + 1}`, sequence: makeSequence(len, seededRandom(i + 1)), sequenceLength: len }));

export function planExecutiveTrials(challenge: ExecutiveChallengeType, _config?: SessionConfig | null) {
  if (challenge === 'gonogo') return GONOGO_PRESETS;
  if (challenge === 'ruleshift') return RULE_SHIFT_PRESETS;
  return MEMORY_PRESETS;
}
