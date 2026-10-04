/**
 * Olha Comigo — lógica pura (sem React/DOM): cena, posições, hierarquia de pistas e balanceamento.
 * Atenção compartilhada: a criança segue a pista do guia (olhar → apontar → "Olha!") e toca o objeto.
 * Zero captura de rosto/biometria: o "olhar" é só do personagem desenhado.
 */
import { counterbalancedPositions, seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig, StimulusRef, TargetConfig, TrialResponse } from '@aprumo/protocol';

/* ------------------------------------------------------------------ objetos da cena */

export const OBJECTS = [
  { id: 'oc-bola', label: 'Bola' },
  { id: 'oc-flor', label: 'Flor' },
  { id: 'oc-barco', label: 'Barquinho' },
  { id: 'oc-balao', label: 'Balão' },
  { id: 'oc-pato', label: 'Patinho' },
  { id: 'oc-tambor', label: 'Tambor' },
] as const;
export type ObjectId = (typeof OBJECTS)[number]['id'];

/* ------------------------------------------------------------------ hierarquia de pistas */

/** Do menos ao mais apoio. O destaque luminoso é a dica embutida (useTrialRunner), não um nível de pista. */
export const CUE_LEVELS = ['gaze', 'gaze_point', 'gaze_point_verbal'] as const;
export type CueType = (typeof CUE_LEVELS)[number];

export const CUE_LABELS: Record<CueType, string> = {
  gaze: 'Olhar (cabeça e olhos)',
  gaze_point: 'Olhar + apontar',
  gaze_point_verbal: 'Olhar + apontar + "Olha!"',
};

export const cueHasPoint = (c: CueType) => c !== 'gaze';
export const cueHasVerbal = (c: CueType) => c === 'gaze_point_verbal';

export interface CueOutcome {
  cue: CueType;
  response: TrialResponse;
  /** true quando houve dica (embutida ou do profissional) na tentativa. */
  prompted: boolean;
}

/**
 * Esvanecimento de pistas: começa com mais apoio e retira um nível após `streak` acertos
 * independentes seguidos no nível atual; erro/sem resposta devolve um nível de apoio.
 */
export function nextCue(current: CueType, history: readonly CueOutcome[], streak = 2): CueType {
  const i = CUE_LEVELS.indexOf(current);
  const last = history[history.length - 1];
  if (!last) return current;
  if (last.response !== 'correct') return CUE_LEVELS[Math.min(CUE_LEVELS.length - 1, i + 1)]!;
  const tail = history.slice(-streak);
  const independentRun = tail.length === streak && tail.every((h) => h.cue === current && h.response === 'correct' && !h.prompted);
  return independentRun ? CUE_LEVELS[Math.max(0, i - 1)]! : current;
}

/* ------------------------------------------------------------------ cena e olhar */

export interface Slot {
  /** Centro do objeto em % da cena. */
  x: number;
  y: number;
}

/** O guia fica embaixo ao centro; os objetos formam um arco acima, bem separados angularmente. */
export const GUIDE_ANCHOR: Slot = { x: 50, y: 78 };

const LAYOUTS: Record<number, Slot[]> = {
  2: [{ x: 18, y: 46 }, { x: 82, y: 46 }],
  3: [{ x: 15, y: 52 }, { x: 50, y: 20 }, { x: 85, y: 52 }],
  4: [{ x: 12, y: 60 }, { x: 30, y: 22 }, { x: 70, y: 22 }, { x: 88, y: 60 }],
};

export const clampField = (n: number) => Math.max(2, Math.min(4, Math.round(n)));

export function sceneLayout(fieldSize: number): Slot[] {
  return LAYOUTS[clampField(fieldSize)]!;
}

export interface GazePose {
  /** Giro da cabeça em graus (negativo = esquerda). */
  headTurn: number;
  /** Deslocamento das pupilas (unidades do SVG, -1..1 × amplitude). */
  eyeX: number;
  eyeY: number;
  /** Ângulo do braço apontando (graus, 0 = horizontal direita, sentido anti-horário). */
  armAngle: number;
  side: 'left' | 'right' | 'center';
}

/**
 * Pose do guia ao olhar para um slot (vetor guia → objeto).
 * `aspect` = altura/largura da cena, para que o braço aponte certo em telas não quadradas.
 */
export function gazeToward(slot: Slot, anchor: Slot = GUIDE_ANCHOR, aspect = 1): GazePose {
  const dx = slot.x - anchor.x;
  const dy = (anchor.y - slot.y) * aspect; // para cima é positivo
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // 0..180
  const len = Math.hypot(dx, dy) || 1;
  const side = Math.abs(dx) < 8 ? 'center' : dx < 0 ? 'left' : 'right';
  return {
    headTurn: Math.max(-28, Math.min(28, (dx / 50) * 28)),
    eyeX: dx / len,
    eyeY: -dy / len,
    armAngle: angle,
    side,
  };
}

export const NEUTRAL_POSE: GazePose = { headTurn: 0, eyeX: 0, eyeY: 0, armAngle: 90, side: 'center' };

/** Diferença angular mínima entre slots vizinhos (garante pistas de olhar discrimináveis). */
export function minAngularSeparation(fieldSize: number): number {
  const angles = sceneLayout(fieldSize).map((s) => gazeToward(s).armAngle).sort((a, b) => a - b);
  let min = Infinity;
  for (let k = 1; k < angles.length; k++) min = Math.min(min, angles[k]! - angles[k - 1]!);
  return min;
}

/** Tamanho do alvo de toque: nunca abaixo de 48px × touchScale. */
export function objectSizePx(sceneMinPx: number, touchScale: number, fieldSize: number): number {
  const s = Math.max(1, Math.min(2, touchScale));
  const base = sceneMinPx * (fieldSize >= 4 ? 0.2 : 0.24);
  return Math.round(Math.max(48 * s, Math.min(150, base) * s));
}

/* ------------------------------------------------------------------ configurações */

export type Sensory = 'minimal' | 'normal' | 'rich';
export type MotionLevel = 'static' | 'reduced' | 'normal';

export interface Settings {
  sensory: Sensory;
  motion: MotionLevel | null;
  /** Nível fixo (desliga o esvanecimento) ou null = adaptativo. */
  cueFixed: CueType | null;
  cueStart: CueType;
  fieldSize: number | null;
}

const rec = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
function oneOf<T extends string>(v: unknown, xs: readonly T[]): T | null {
  return typeof v === 'string' && (xs as readonly string[]).includes(v) ? (v as T) : null;
}

export function resolveSettings(config: Pick<SessionConfig, 'params' | 'adaptation'>): Settings {
  const p = rec(config.params);
  const fb = config.adaptation.feedback;
  return {
    sensory: oneOf(p.sensory, ['minimal', 'normal', 'rich'] as const) ?? (fb === 'none' ? 'minimal' : fb === 'festive' ? 'rich' : 'normal'),
    motion: oneOf(p.motion, ['static', 'reduced', 'normal'] as const),
    cueFixed: oneOf(p.cueLevel, CUE_LEVELS),
    cueStart: oneOf(p.cueStart, CUE_LEVELS) ?? 'gaze_point_verbal',
    fieldSize: typeof p.fieldSize === 'number' ? clampField(p.fieldSize) : null,
  };
}

/** Sensorial mínimo é estático; a preferência do sistema por menos movimento nunca é ignorada. */
export function resolveMotion(settings: Pick<Settings, 'sensory' | 'motion'>, sdk: 'full' | 'reduced' | 'static', systemReduced: boolean): MotionLevel {
  if (settings.sensory === 'minimal') return 'static';
  const m: MotionLevel = settings.motion ?? (sdk === 'full' ? 'normal' : sdk);
  return systemReduced && m === 'normal' ? 'reduced' : m;
}

/* ------------------------------------------------------------------ plano de tentativas */

export interface PlannedTrial {
  index: number;
  target: TargetConfig;
  options: StimulusRef[];
  positionOfTarget: number;
  fieldSize: number;
}

export const DEFAULT_TARGET: TargetConfig = {
  targetId: 'olha-comigo-seguir-olhar',
  name: 'Seguir o olhar e o apontar do parceiro',
  phase: 'acquisition',
  repertoire: 'social',
  fieldSize: 2,
  stimulus: { stimulusId: 'oc-bola', label: 'Bola', art: 'oc-bola' },
  distractors: [],
  promptHierarchy: [
    { code: 'IND', label: 'Independente', intrusiveness: 0 },
    { code: 'HIGHLIGHT', label: 'Destaque luminoso', intrusiveness: 0.3 },
  ],
  scoring: 'auto',
};

const toRef = (o: (typeof OBJECTS)[number]): StimulusRef => ({ stimulusId: o.id, label: o.label, art: o.id });

export function planTrials(config: Pick<SessionConfig, 'clinical' | 'adaptation' | 'params'>, settings: Settings = resolveSettings(config)): PlannedTrial[] {
  const rnd = seededRandom(config.clinical.seed);
  const targets = config.clinical.targets.length ? config.clinical.targets : [DEFAULT_TARGET];
  const per = config.clinical.trialsPerTarget;
  const out: Omit<PlannedTrial, 'index'>[] = [];
  const groups = targets.map((target) => {
    const field = settings.fieldSize ?? clampField(Math.min(target.fieldSize, config.adaptation.maxChoices));
    const positions = counterbalancedPositions(per, field, rnd);
    return positions.map((pos) => {
      const options = shuffle(OBJECTS, rnd).slice(0, field).map(toRef);
      return { target: { ...target, stimulus: options[pos]! }, options, positionOfTarget: pos, fieldSize: field };
    });
  });
  if (config.clinical.interleave && groups.length > 1) {
    for (let k = 0; k < per; k++) for (const g of groups) if (g[k]) out.push(g[k]!);
  } else out.push(...groups.flat());
  return out.map((t, index) => ({ ...t, index }));
}

/** Contagem do alvo por posição (para conferir balanceamento). */
export function positionCounts(trials: readonly Pick<PlannedTrial, 'positionOfTarget'>[], fieldSize: number): number[] {
  const c = Array.from({ length: fieldSize }, () => 0);
  for (const t of trials) c[t.positionOfTarget]!++;
  return c;
}

export function longestRun(xs: readonly number[]): number {
  let best = 0, run = 0;
  xs.forEach((x, k) => { run = k > 0 && xs[k - 1] === x ? run + 1 : 1; best = Math.max(best, run); });
  return best;
}
