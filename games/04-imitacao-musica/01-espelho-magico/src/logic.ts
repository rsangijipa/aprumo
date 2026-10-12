import type { PromptLevelRef, SessionConfig, TargetConfig, TrialResponse } from '@aprumo/protocol';

/* ------------------------------------------------------------------ geometria do modelo */

export type Category = 'gross' | 'fine' | 'object';
export type HandShape = 'open' | 'fist' | 'point';
export type Prop = 'none' | 'drum' | 'block';
export type BlockAt = 'table' | 'hand' | 'tower';
export interface Pt { x: number; y: number }

/** Pose-chave: alvos das mãos (coordenadas do corpo, viewBox 240×280) + deslocamento vertical. */
export interface Pose {
  lh: Pt;
  rh: Pt;
  /** Deslocamento vertical do corpo (negativo = no ar; positivo = agachado). */
  lift: number;
  lShape: HandShape;
  rShape: HandShape;
  block?: BlockAt;
}

export const SHOULDER_L: Pt = { x: 96, y: 130 };
export const SHOULDER_R: Pt = { x: 144, y: 130 };
export const UPPER_ARM = 44;
export const FOREARM = 40;
export const BLOCK_TABLE: Pt = { x: 166, y: 201 };
export const BLOCK_TOWER: Pt = { x: 120, y: 179 };

const REST: Pose = { lh: { x: 88, y: 200 }, rh: { x: 152, y: 200 }, lift: 0, lShape: 'open', rShape: 'open' };
export const REST_POSE = REST;
const p = (lh: [number, number], rh: [number, number], extra: Partial<Pose> = {}): Pose => ({
  ...REST,
  lh: { x: lh[0], y: lh[1] },
  rh: { x: rh[0], y: rh[1] },
  ...extra,
});

export interface Keyframe { pose: Pose; /** Som suave de contato (palma, batida). */ beat?: boolean; /** Pose mantida mais tempo. */ long?: boolean }

export interface ImitationAction {
  id: string;
  label: string;
  /** Instrução curta para a fala/legenda. */
  cue: string;
  category: Category;
  prop: Prop;
  /** Mãos ampliadas (motor fino). */
  handScale: number;
  /** Ciclo que se repete na demonstração. */
  cycle: Keyframe[];
  /** Ações com objeto que mudam de estado não repetem dentro da mesma demonstração. */
  singleCycle?: boolean;
  /** Pose inicial (antes do ciclo). */
  start?: Pose;
}

const HANDS_FWD_L: [number, number] = [78, 150];
const HANDS_FWD_R: [number, number] = [162, 150];

export const ACTIONS: readonly ImitationAction[] = [
  {
    id: 'bater-palmas', label: 'Bater palmas', cue: 'Bate palmas!', category: 'gross', prop: 'none', handScale: 1,
    cycle: [{ pose: p([84, 168], [156, 168]) }, { pose: p([114, 160], [126, 160]), beat: true }],
  },
  {
    id: 'bracos-para-cima', label: 'Braços para cima', cue: 'Braços para cima!', category: 'gross', prop: 'none', handScale: 1,
    cycle: [{ pose: p([90, 50], [150, 50]), long: true }, { pose: REST }],
  },
  {
    id: 'tocar-cabeca', label: 'Tocar a cabeça', cue: 'Mão na cabeça!', category: 'gross', prop: 'none', handScale: 1,
    cycle: [{ pose: p([94, 52], [146, 52]), long: true }, { pose: REST }],
  },
  {
    id: 'pular', label: 'Pular', cue: 'Pula!', category: 'gross', prop: 'none', handScale: 1,
    cycle: [
      { pose: p([84, 194], [156, 194], { lift: 8 }) },
      { pose: p([80, 140], [160, 140], { lift: -28 }) },
      { pose: p([86, 198], [154, 198], { lift: 4 }), beat: true },
      { pose: REST },
    ],
  },
  {
    id: 'abrir-fechar-maos', label: 'Abrir e fechar as mãos', cue: 'Abre e fecha!', category: 'fine', prop: 'none', handScale: 1.6,
    start: p(HANDS_FWD_L, HANDS_FWD_R),
    cycle: [
      { pose: p(HANDS_FWD_L, HANDS_FWD_R) },
      { pose: p(HANDS_FWD_L, HANDS_FWD_R, { lShape: 'fist', rShape: 'fist' }) },
    ],
  },
  {
    id: 'apontar', label: 'Apontar', cue: 'Aponta!', category: 'fine', prop: 'none', handScale: 1.4,
    cycle: [{ pose: p([88, 200], [220, 110], { rShape: 'point' }), long: true }, { pose: REST }],
  },
  {
    id: 'bater-tambor', label: 'Bater o tambor', cue: 'Bate no tambor!', category: 'object', prop: 'drum', handScale: 1,
    start: p([96, 178], [144, 178]),
    cycle: [
      { pose: p([106, 196], [150, 168]), beat: true },
      { pose: p([90, 168], [134, 196]), beat: true },
    ],
  },
  {
    id: 'empilhar-bloco', label: 'Empilhar o bloco', cue: 'Põe o bloco em cima!', category: 'object', prop: 'block', handScale: 1,
    singleCycle: true,
    start: { ...REST, block: 'table' },
    cycle: [
      { pose: p([88, 200], [166, 194], { block: 'table' }) },
      { pose: p([88, 200], [166, 194], { block: 'hand' }) },
      { pose: p([88, 200], [146, 158], { block: 'hand' }) },
      { pose: p([88, 200], [120, 172], { block: 'hand' }) },
      { pose: p([88, 200], [120, 172], { block: 'tower' }), beat: true },
      { pose: p([88, 200], [152, 196], { block: 'tower' }), long: true },
    ],
  },
];

export const ACTION_IDS = ACTIONS.map((a) => a.id);
export const actionById = (id: string) => ACTIONS.find((a) => a.id === id);

/** IK de dois segmentos com o cotovelo para fora (longe do centro do corpo). */
export function solveArm(shoulder: Pt, hand: Pt, center = 120): { elbow: Pt; hand: Pt } {
  let dx = hand.x - shoulder.x;
  let dy = hand.y - shoulder.y;
  let d = Math.hypot(dx, dy);
  const max = UPPER_ARM + FOREARM - 0.01;
  const min = Math.abs(UPPER_ARM - FOREARM) + 0.01;
  if (d < 1e-6) { dx = 0; dy = 1; d = 1; }
  const k = Math.min(max, Math.max(min, d)) / d;
  const h = { x: shoulder.x + dx * k, y: shoulder.y + dy * k };
  const dd = Math.min(max, Math.max(min, d));
  const a = (UPPER_ARM * UPPER_ARM - FOREARM * FOREARM + dd * dd) / (2 * dd);
  const off = Math.sqrt(Math.max(0, UPPER_ARM * UPPER_ARM - a * a));
  const ux = dx / d, uy = dy / d;
  const mx = shoulder.x + ux * a, my = shoulder.y + uy * a;
  const e1 = { x: mx - uy * off, y: my + ux * off };
  const e2 = { x: mx + uy * off, y: my - ux * off };
  const elbow = Math.abs(e1.x - center) >= Math.abs(e2.x - center) ? e1 : e2;
  return { elbow, hand: h };
}

/** Posição do bloco móvel para a pose. */
export function blockPosition(pose: Pose): Pt {
  if (pose.block === 'hand') return { x: pose.rh.x, y: pose.rh.y + 7 };
  if (pose.block === 'tower') return BLOCK_TOWER;
  return BLOCK_TABLE;
}

/* ------------------------------------------------------------------ linha do tempo */

export type MotionLevel = 'static' | 'reduced' | 'normal';
export interface Segment { pose: Pose; tweenMs: number; holdMs: number; beat: boolean }

const TIMING: Record<MotionLevel, { tween: number; hold: number; long: number }> = {
  /** Estático: poses-chave sem interpolação, mantidas o bastante para a criança observar. */
  static: { tween: 0, hold: 1100, long: 1600 },
  reduced: { tween: 650, hold: 380, long: 900 },
  normal: { tween: 420, hold: 220, long: 700 },
};

/** Demonstração completa: pose inicial → ciclo × N → repouso. */
export function buildTimeline(action: ImitationAction, motion: MotionLevel, cycles: number): Segment[] {
  const t = TIMING[motion];
  const n = action.singleCycle ? 1 : Math.max(1, Math.min(5, Math.round(cycles)));
  const segs: Segment[] = [{ pose: action.start ?? REST, tweenMs: 0, holdMs: motion === 'static' ? 700 : 450, beat: false }];
  for (let i = 0; i < n; i++) {
    for (const k of action.cycle) segs.push({ pose: k.pose, tweenMs: t.tween, holdMs: k.long ? t.long : t.hold, beat: !!k.beat });
  }
  const end = action.prop === 'block' ? { ...REST, block: 'tower' as const } : REST;
  segs.push({ pose: end, tweenMs: t.tween, holdMs: 0, beat: false });
  return segs;
}

export const timelineDuration = (segs: Segment[]) => segs.reduce((s, g) => s + g.tweenMs + g.holdMs, 0);

const ease = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

export function interpolatePose(a: Pose, b: Pose, t: number): Pose {
  const k = ease(Math.min(1, Math.max(0, t)));
  const snap = k >= 0.5 ? b : a;
  return {
    lh: lerpPt(a.lh, b.lh, k),
    rh: lerpPt(a.rh, b.rh, k),
    lift: lerp(a.lift, b.lift, k),
    lShape: snap.lShape,
    rShape: snap.rShape,
    block: snap.block,
  };
}

export interface Sample { pose: Pose; index: number; phase: 'tween' | 'hold'; done: boolean }

/** Pose no instante `ms` da demonstração. */
export function samplePose(segs: Segment[], ms: number): Sample {
  let prev = segs[0]!.pose;
  let t = Math.max(0, ms);
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i]!;
    if (t < s.tweenMs) return { pose: interpolatePose(prev, s.pose, t / s.tweenMs), index: i, phase: 'tween', done: false };
    t -= s.tweenMs;
    if (t < s.holdMs) return { pose: s.pose, index: i, phase: 'hold', done: false };
    t -= s.holdMs;
    prev = s.pose;
  }
  return { pose: segs[segs.length - 1]!.pose, index: segs.length - 1, phase: 'hold', done: true };
}

/* ------------------------------------------------------------------ registro do adulto */

export type Outcome = 'independent' | 'partial' | 'full' | 'none';
export const OUTCOMES: Array<{ id: Outcome; label: string; hint: string }> = [
  { id: 'independent', label: 'Independente', hint: 'Imitou sem ajuda' },
  { id: 'partial', label: 'Ajuda parcial', hint: 'Com ajuda física parcial' },
  { id: 'full', label: 'Ajuda total', hint: 'Com ajuda física total' },
  { id: 'none', label: 'Não realizou', hint: 'Não imitou' },
];

export const DEFAULT_HIERARCHY: PromptLevelRef[] = [
  { code: 'IND', label: 'Independente', intrusiveness: 0 },
  { code: 'PP', label: 'Física parcial', intrusiveness: 0.5 },
  { code: 'FP', label: 'Física total', intrusiveness: 1 },
];

export interface OutcomeRecord { response: TrialResponse; promptLevel: string; promptSource: 'none' | 'therapist' }

/** Mapeia o botão do adulto para resposta + nível de dica da hierarquia do alvo. */
export function outcomeToRecord(outcome: Outcome, hierarchy: PromptLevelRef[] = DEFAULT_HIERARCHY): OutcomeRecord {
  if (outcome === 'independent') return { response: 'correct', promptLevel: hierarchy.find((h) => h.intrusiveness === 0)?.code ?? 'IND', promptSource: 'none' };
  if (outcome === 'none') return { response: 'no_response', promptLevel: 'IND', promptSource: 'none' };
  const mids = hierarchy.filter((h) => h.intrusiveness > 0 && h.intrusiveness < 1);
  const partial = mids.length
    ? mids.reduce((best, h) => (Math.abs(h.intrusiveness - 0.5) < Math.abs(best.intrusiveness - 0.5) ? h : best))
    : null;
  if (outcome === 'partial') return { response: 'correct', promptLevel: partial?.code ?? 'PP', promptSource: 'therapist' };
  const top = hierarchy.reduce<PromptLevelRef | null>((m, h) => (!m || h.intrusiveness > m.intrusiveness ? h : m), null);
  const full = top && top.intrusiveness > (partial?.intrusiveness ?? 0) ? top.code : 'FP';
  return { response: 'correct', promptLevel: full, promptSource: 'therapist' };
}

/* ------------------------------------------------------------------ parâmetros e plano */

export type Sensory = 'minimal' | 'normal' | 'rich';
export interface Settings {
  sensory: Sensory;
  motion: MotionLevel | null;
  /** Repetições do ciclo em cada demonstração. */
  demoCycles: number;
  /** Fala a instrução (Web Speech) quando o som permite. */
  voice: boolean;
  /** Ações permitidas quando o alvo não define uma ação. */
  pool: string[];
}

const oneOf = <T extends string>(v: unknown, xs: readonly T[]): T | undefined => (xs.includes(v as T) ? (v as T) : undefined);
const rec = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/**
 * Lê `config.params`:
 *   actions (ids do catálogo), categories ('gross'|'fine'|'object'), demoCycles (1–5),
 *   sensory ('minimal'|'normal'|'rich'), motion ('static'|'reduced'|'normal'), voice (bool),
 *   targets: { [targetId]: { actions?: string[] } }.
 */
export function resolveSettings(config: SessionConfig): Settings {
  const prm = rec(config.params);
  const fb = config.adaptation.feedback;
  const cats = strs(prm.categories).filter((c): c is Category => c === 'gross' || c === 'fine' || c === 'object');
  let pool = strs(prm.actions).filter((id) => actionById(id));
  if (!pool.length) pool = ACTIONS.filter((a) => !cats.length || cats.includes(a.category)).map((a) => a.id);
  if (!pool.length) pool = [...ACTION_IDS];
  const cyc = typeof prm.demoCycles === 'number' ? prm.demoCycles : 2;
  return {
    sensory: oneOf(prm.sensory, ['minimal', 'normal', 'rich'] as const) ?? (fb === 'none' ? 'minimal' : fb === 'festive' ? 'rich' : 'normal'),
    motion: oneOf(prm.motion, ['static', 'reduced', 'normal'] as const) ?? null,
    demoCycles: Math.max(1, Math.min(5, Math.round(cyc))),
    voice: prm.voice !== false,
    pool,
  };
}

/** Movimento final: sensorial mínimo é estático; prefers-reduced-motion nunca é ignorado. */
export function resolveMotion(settings: Pick<Settings, 'sensory' | 'motion'>, sdk: 'full' | 'reduced' | 'static', systemReduced: boolean): MotionLevel {
  if (settings.sensory === 'minimal') return 'static';
  const m: MotionLevel = settings.motion ?? (sdk === 'full' ? 'normal' : sdk);
  return systemReduced && m === 'normal' ? 'reduced' : m;
}

/** Ações associadas ao alvo (params.targets, ou id/arte/nome que cite uma ação do catálogo). */
export function actionsForTarget(target: TargetConfig, config: SessionConfig, fallback: string[]): string[] {
  const own = strs(rec(rec(rec(config.params).targets)[target.targetId]).actions).filter((id) => actionById(id));
  if (own.length) return own;
  const hay = [target.stimulus.art, target.stimulus.stimulusId, target.targetId, target.name].join(' ').toLowerCase();
  const hit = ACTION_IDS.filter((id) => hay.includes(id));
  return hit.length ? hit : fallback;
}

/** Sorteia `n` ações do conjunto sem repetir a anterior (quando há alternativa). */
export function selectSequence(pool: readonly string[], n: number, rnd: () => number, previous: string | null = null): string[] {
  const out: string[] = [];
  let last = previous;
  for (let i = 0; i < n; i++) {
    const opts = pool.length > 1 ? pool.filter((a) => a !== last) : [...pool];
    const pick = opts[Math.floor(rnd() * opts.length) % opts.length]!;
    out.push(pick);
    last = pick;
  }
  return out;
}

export interface PlannedTrial { trialIndex: number; target: TargetConfig; action: ImitationAction }

export const FALLBACK_TARGET: TargetConfig = {
  targetId: 'imitacao-motora',
  name: 'Imitação motora',
  phase: 'acquisition',
  repertoire: 'imitation',
  fieldSize: 1,
  stimulus: { stimulusId: 'modelo-animado', label: 'Modelo animado', art: 'espelho-magico' },
  distractors: [],
  promptHierarchy: DEFAULT_HIERARCHY,
  scoring: 'therapist',
};

/** Plano da sessão: por alvo (em bloco ou intercalado), sem repetir a mesma ação em sequência. */
export function planTrials(config: SessionConfig, settings: Settings, rnd: () => number): PlannedTrial[] {
  const targets = config.clinical.targets.length ? config.clinical.targets : [FALLBACK_TARGET];
  const per = config.clinical.trialsPerTarget;
  const order: TargetConfig[] = [];
  if (config.clinical.interleave) {
    for (let i = 0; i < per; i++) order.push(...targets);
  } else {
    for (const t of targets) for (let i = 0; i < per; i++) order.push(t);
  }
  const pools = new Map(targets.map((t) => [t.targetId, actionsForTarget(t, config, settings.pool)]));
  let last: string | null = null;
  return order.map((target, trialIndex) => {
    const id = selectSequence(pools.get(target.targetId)!, 1, rnd, last)[0]!;
    last = id;
    return { trialIndex, target, action: actionById(id)! };
  });
}
