/**
 * Encaixa Aí — lógica pura: parâmetros, tabela de níveis, montagem do quebra-cabeça,
 * detecção de encaixe (distância + diferença angular normalizada) e registro de cada passo.
 * Unidades: o palco lógico tem 1200×760; 1 unidade = 1 px de referência (raios da tabela 4.3).
 */
import type { InputMode, PromptSource, SessionConfig, TargetConfig, TrialCompletedPayload, TrialResponse } from '@aprumo/protocol';
import { shuffle } from '@aprumo/game-sdk';
import { CHAIN_TYPES, DEFAULT_RULES, type ChainRules, type ChainState, type ChainType } from './chain';
import { pathBBox, type Pt } from './geometry';
import { puzzleFromSvg } from './puzzleFromSvg';
import { ANIMALS, FARM, SHAPES, type Anim, type ShapeDef } from './shapes';

export type Sensory = 'minimal' | 'normal' | 'rich';
export type MotionLevel = 'static' | 'reduced' | 'normal';
export type PromptKind = 'VIS' | 'GEST' | 'POS';
export type TraySide = 'left' | 'right';
export interface Rect { x: number; y: number; w: number; h: number }

export const STAGE = { w: 1200, h: 760 } as const;
export const ROTATE_STEP = 90;
export const HOLD_MS = 1000;
export const RETURN_MS = 350;
export const SNAP_MS = 180;

/* ------------------------------------------------------------------ níveis (tabela 4.3) */

export type Pool = 'starter' | 'shapes' | 'animals' | 'farm' | 'tiles';
export interface LevelSpec { level: number; minPieces: number; maxPieces: number; pool: Pool; captureRadius: number; rotation: boolean }
export const LEVELS: readonly LevelSpec[] = [
  { level: 1, minPieces: 1, maxPieces: 2, pool: 'starter', captureRadius: 70, rotation: false },
  { level: 2, minPieces: 3, maxPieces: 3, pool: 'shapes', captureRadius: 55, rotation: false },
  { level: 3, minPieces: 4, maxPieces: 5, pool: 'animals', captureRadius: 45, rotation: false },
  { level: 4, minPieces: 4, maxPieces: 5, pool: 'animals', captureRadius: 40, rotation: true },
  { level: 5, minPieces: 6, maxPieces: 8, pool: 'farm', captureRadius: 35, rotation: true },
  { level: 6, minPieces: 9, maxPieces: 12, pool: 'tiles', captureRadius: 30, rotation: true },
];
export const levelSpec = (level: number): LevelSpec => LEVELS[Math.max(1, Math.min(6, Math.round(level))) - 1]!;

/* ------------------------------------------------------------------ parâmetros */

export interface Settings {
  level: number;
  chainType: ChainType;
  startK: number;
  rules: ChainRules;
  /** Quebra-cabeças (rodadas) por sessão. */
  rounds: number;
  pieces: number | null;
  captureRadius: number;
  angleTolerance: number;
  traySide: TraySide;
  promptKind: PromptKind;
  sensory: Sensory;
  motion: MotionLevel | null;
  svg: string | null;
}

const rec = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {});
function oneOf<T extends string>(v: unknown, xs: readonly T[]): T | null {
  return typeof v === 'string' && (xs as readonly string[]).includes(v) ? (v as T) : null;
}
function int(v: unknown, min: number, max: number): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : null;
}
const CHAIN_ALIASES: Record<string, ChainType> = { reverso: 'backward', direto: 'forward', 'tarefa-total': 'total', total: 'total' };

export function resolveSettings(config: Pick<SessionConfig, 'params' | 'adaptation'>): Settings {
  const p = rec(config.params);
  const fb = config.adaptation.feedback;
  const level = int(p.level, 1, 6) ?? 1;
  const hand = oneOf(p.hand, ['left', 'right'] as const);
  return {
    level,
    chainType: oneOf(p.chainType, CHAIN_TYPES) ?? (typeof p.chainType === 'string' ? CHAIN_ALIASES[p.chainType] : undefined) ?? 'backward',
    startK: int(p.startK, 1, 12) ?? 1,
    rules: { criterion: int(p.criterion, 1, 10) ?? DEFAULT_RULES.criterion, regressAfter: int(p.regressAfter, 1, 10) ?? DEFAULT_RULES.regressAfter },
    rounds: int(p.rounds, 1, 20) ?? 5,
    pieces: int(p.pieces, 1, 12),
    captureRadius: int(p.captureRadiusPx, 10, 150) ?? levelSpec(level).captureRadius,
    angleTolerance: int(p.angleToleranceDeg, 5, 45) ?? 20,
    traySide: oneOf(p.traySide, ['left', 'right'] as const) ?? hand ?? 'left',
    promptKind: oneOf(p.promptType, ['VIS', 'GEST', 'POS'] as const) ?? 'VIS',
    sensory: oneOf(p.sensory, ['minimal', 'normal', 'rich'] as const) ?? (fb === 'none' ? 'minimal' : fb === 'festive' ? 'rich' : 'normal'),
    motion: oneOf(p.motion, ['static', 'reduced', 'normal'] as const),
    svg: typeof p.svg === 'string' && p.svg.trim() ? p.svg : null,
  };
}

/** Sensorial mínimo é estático; a preferência do sistema por menos movimento nunca é ignorada. */
export function resolveMotion(s: Pick<Settings, 'sensory' | 'motion'>, sdk: 'full' | 'reduced' | 'static', systemReduced: boolean): MotionLevel {
  if (s.sensory === 'minimal') return 'static';
  const m: MotionLevel = s.motion ?? (sdk === 'full' ? 'normal' : sdk);
  return systemReduced && m === 'normal' ? 'reduced' : m;
}

/** Contagem de peças dentro da faixa do nível; recorte só em grades 3×3 ou 4×3. */
export function pieceCount(s: Pick<Settings, 'level' | 'pieces'>): number {
  const spec = levelSpec(s.level);
  const fallback = spec.level === 1 ? 2 : spec.minPieces;
  const n = Math.max(spec.minPieces, Math.min(spec.maxPieces, s.pieces ?? fallback));
  if (spec.pool === 'tiles') return n <= 10 ? 9 : 12;
  return n;
}

export const DEFAULT_TARGET: TargetConfig = {
  targetId: 'encaixa-ai-encaixe',
  name: 'Completar quebra-cabeça de encaixe',
  phase: 'acquisition',
  repertoire: 'matching',
  fieldSize: 4,
  stimulus: { stimulusId: 'ea-quebra-cabeca', label: 'Quebra-cabeça', art: 'encaixa-ai' },
  distractors: [],
  promptHierarchy: [
    { code: 'IND', label: 'Independente', intrusiveness: 0 },
    { code: 'VIS', label: 'Visual (cavidade brilha)', intrusiveness: 0.2 },
    { code: 'GEST', label: 'Gestual (peça fantasma)', intrusiveness: 0.4 },
    { code: 'POS', label: 'Posicional (peça mais perto)', intrusiveness: 0.5 },
  ],
  scoring: 'auto',
};

/* ------------------------------------------------------------------ quebra-cabeça */

export interface PieceDef {
  id: string;
  label: string;
  d: string;
  /** Pivô (centro) nas coordenadas do path. */
  cx: number;
  cy: number;
  w: number;
  h: number;
  color: string;
  symmetry: number;
  anim: Anim;
  /** Recorte (nível 6): retângulo da cena que a peça mostra. */
  tile?: { x: number; y: number; w: number; h: number };
}
export type Theme = 'formas' | 'bichos' | 'fazenda' | 'recorte' | 'importado';
export interface Puzzle {
  theme: Theme;
  /** Em ordem de cadeia. */
  pieces: PieceDef[];
  /** Centro de cada cavidade no palco (mesma ordem de `pieces`). */
  slots: Pt[];
  /** Unidades do palco por unidade do path. */
  scale: number;
  rotation: boolean;
  /** Cavidades desenhadas? (recorte do nível 6 não tem cavidade). */
  cavities: boolean;
  tray: Rect;
  board: Rect;
  /** Moldura da imagem (recorte / SVG importado). */
  frame: Rect | null;
}

export const SCENE = { w: 600, h: 450 } as const;

export function stageRects(side: TraySide): { tray: Rect; board: Rect } {
  const tray = { x: side === 'left' ? 20 : 900, y: 30, w: 280, h: 700 };
  const board = { x: side === 'left' ? 330 : 20, y: 30, w: 850, h: 700 };
  return { tray, board };
}

function fromShape(s: ShapeDef): PieceDef {
  const b = pathBBox(s.d);
  return { id: s.id, label: s.label, d: s.d, cx: 0, cy: 0, w: b.w, h: b.h, color: s.color, symmetry: s.symmetry, anim: s.anim };
}

/** Centros de uma grade com a última linha centralizada. */
export function gridCenters(n: number, area: Rect): { centers: Pt[]; cell: number } {
  const cols = n <= 3 ? n : n === 4 ? 2 : n <= 6 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  const cw = area.w / cols, ch = area.h / rows;
  const centers: Pt[] = [];
  for (let r = 0; r < rows; r++) {
    const inRow = Math.min(cols, n - r * cols);
    const offset = ((cols - inRow) * cw) / 2;
    for (let c = 0; c < inRow; c++) centers.push({ x: area.x + offset + cw * (c + 0.5), y: area.y + ch * (r + 0.5) });
  }
  return { centers, cell: Math.min(cw, ch) };
}

function fitFrame(w: number, h: number, board: Rect, fill: number): { frame: Rect; scale: number } {
  const scale = Math.min((board.w * fill) / w, (board.h * fill) / h);
  const fw = w * scale, fh = h * scale;
  return { scale, frame: { x: board.x + (board.w - fw) / 2, y: board.y + (board.h - fh) / 2, w: fw, h: fh } };
}

export function buildPuzzle(s: Settings, rnd: () => number): Puzzle {
  const { tray, board } = stageRects(s.traySide);
  const spec = levelSpec(s.level);

  if (s.svg) {
    const r = puzzleFromSvg(s.svg);
    if (r.ok) {
      const { viewBox: vb } = r.puzzle;
      const { frame, scale } = fitFrame(vb.w, vb.h, board, 0.9);
      const pieces: PieceDef[] = r.puzzle.pieces.map((p) => ({ ...p }));
      const slots = pieces.map((p) => ({ x: frame.x + (p.cx - vb.x) * scale, y: frame.y + (p.cy - vb.y) * scale }));
      return { theme: 'importado', pieces, slots, scale, rotation: spec.rotation, cavities: true, tray, board, frame };
    }
  }

  const n = pieceCount(s);
  if (spec.pool === 'tiles') {
    const cols = n === 9 ? 3 : 4, rows = 3;
    const tw = SCENE.w / cols, th = SCENE.h / rows;
    const { frame, scale } = fitFrame(SCENE.w, SCENE.h, board, 0.86);
    const pieces: PieceDef[] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = c * tw, y = r * th;
      pieces.push({
        id: `recorte-${r}-${c}`, label: `pedaço ${r * cols + c + 1}`,
        d: `M${x},${y}H${x + tw}V${y + th}H${x}Z`, cx: x + tw / 2, cy: y + th / 2, w: tw, h: th,
        color: 'none', symmetry: 360, anim: 'glow', tile: { x, y, w: tw, h: th },
      });
    }
    const slots = pieces.map((p) => ({ x: frame.x + p.cx * scale, y: frame.y + p.cy * scale }));
    return { theme: 'recorte', pieces, slots, scale, rotation: true, cavities: false, tray, board, frame };
  }

  const pool = spec.pool === 'starter' ? SHAPES.slice(0, 2) : spec.pool === 'shapes' ? SHAPES : spec.pool === 'animals' ? ANIMALS : FARM;
  // Sorteio do conjunto, mas ordem da cadeia estável (ordem do acervo).
  const chosen = new Set(shuffle(pool, rnd).slice(0, n).map((x) => x.id));
  const pieces = pool.filter((x) => chosen.has(x.id)).map(fromShape);
  const area = { x: board.x + 20, y: board.y + 20, w: board.w - 40, h: board.h - 40 };
  const { centers, cell } = gridCenters(pieces.length, area);
  const size = Math.max(90, Math.min(210, cell * 0.64));
  const order = shuffle(centers, rnd);
  return {
    theme: spec.pool === 'animals' ? 'bichos' : spec.pool === 'farm' ? 'fazenda' : 'formas',
    pieces, slots: pieces.map((_, i) => order[i]!), scale: size / 100, rotation: spec.rotation, cavities: true, tray, board, frame: null,
  };
}

export const extentOf = (p: Pick<PieceDef, 'w' | 'h'>, scale: number) => Math.max(p.w, p.h) * scale;

/** Bandeja: 1 coluna até 5 peças, depois 2. Escala reduzida só se não couber (nunca abaixo do alvo mínimo). */
export function trayLayout(pieces: readonly PieceDef[], ids: readonly string[], scale: number, tray: Rect, minUnits = 48): Record<string, { x: number; y: number; s: number }> {
  const cols = ids.length <= 5 ? 1 : 2;
  const rows = Math.max(1, Math.ceil(ids.length / cols));
  const sw = tray.w / cols, sh = tray.h / rows;
  const out: Record<string, { x: number; y: number; s: number }> = {};
  ids.forEach((id, i) => {
    const p = pieces.find((q) => q.id === id);
    if (!p) return;
    const ext = extentOf(p, scale);
    const fit = Math.min(1, (0.84 * Math.min(sw, sh)) / ext);
    out[id] = { x: tray.x + sw * ((i % cols) + 0.5), y: tray.y + sh * (Math.floor(i / cols) + 0.5), s: Math.max(fit, Math.min(1, minUnits / ext)) };
  });
  return out;
}

/** Ângulos iniciais (níveis com rotação): múltiplos de 90°, ao menos uma peça girada. */
export function initialAngles(ids: readonly string[], rotation: boolean, rnd: () => number): Record<string, number> {
  const out: Record<string, number> = {};
  if (!rotation) { ids.forEach((id) => (out[id] = 0)); return out; }
  ids.forEach((id) => (out[id] = [0, 90, 180, 270][Math.floor(rnd() * 4)]!));
  if (ids.length && ids.every((id) => out[id] === 0)) out[ids[0]!] = 90;
  return out;
}

/** Dica posicional: a peça é oferecida perto da cavidade (fora do raio de captura), do lado da bandeja. */
export function offerNear(slot: Pt, side: TraySide, distance: number, board: Rect): Pt {
  const dir = side === 'left' ? -1 : 1;
  const x = Math.max(board.x + 40, Math.min(board.x + board.w - 40, slot.x + dir * distance));
  return { x, y: slot.y };
}

/* ------------------------------------------------------------------ encaixe */

const norm360 = (a: number) => ((a % 360) + 360) % 360;
/** Diferença angular normalizada: min(|a−b|, 360−|a−b|), com a e b em [0, 360). */
export function angleDiff(a: number, b: number): number {
  const d = Math.abs(norm360(a) - norm360(b));
  return Math.min(d, 360 - d);
}
/** Erro angular até o encaixe (alvo 0°), considerando a simetria rotacional da peça. */
export function angleError(angle: number, symmetry: number): number {
  if (symmetry <= 0) return 0;
  if (symmetry >= 360) return +angleDiff(angle, 0).toFixed(1);
  const m = ((angle % symmetry) + symmetry) % symmetry;
  return +Math.min(m, symmetry - m).toFixed(1);
}
/** Ângulo final do assentamento: o múltiplo da simetria mais próximo (sem giro desnecessário). */
export function snapAngle(angle: number, symmetry: number): number {
  if (symmetry <= 0) return angle;
  return Math.round(angle / symmetry) * symmetry;
}

export interface OpenSlot { index: number; pieceId: string; x: number; y: number }
export type DropResult =
  | { kind: 'empty' }
  | { kind: 'snap' | 'angle_miss' | 'wrong_slot'; slotIndex: number; distance: number; angleError: number };

/**
 * Soltura: cavidade aberta mais próxima dentro do raio de captura.
 * Fora de qualquer raio = 'empty' (nunca registrado como erro). Cavidade certa + ângulo dentro da
 * tolerância = 'snap'; certa com ângulo fora = 'angle_miss'; cavidade errada dentro do raio = 'wrong_slot'.
 */
export function evaluateDrop(
  drop: { pieceId: string; x: number; y: number; angle: number; symmetry: number },
  open: readonly OpenSlot[],
  radius: number,
  tolerance: number,
): DropResult {
  let best: OpenSlot | null = null;
  let bestD = Infinity;
  for (const s of open) {
    const d = Math.hypot(drop.x - s.x, drop.y - s.y);
    if (d <= radius && d < bestD) { best = s; bestD = d; }
  }
  if (!best) return { kind: 'empty' };
  const err = angleError(drop.angle, drop.symmetry);
  const distance = Math.round(bestD);
  if (best.pieceId !== drop.pieceId) return { kind: 'wrong_slot', slotIndex: best.index, distance, angleError: err };
  return { kind: err <= tolerance ? 'snap' : 'angle_miss', slotIndex: best.index, distance, angleError: err };
}

/* ------------------------------------------------------------------ registro do passo */

export interface StepLog {
  latencyMs: number | null;
  /** Tentativas claras (soltas dentro de algum raio de captura), incluindo a que encaixou. */
  attempts: number;
  wrongAttempts: number;
  angleMisses: number;
  emptyDrops: number;
  rotations: number;
  firstSlot: number | null;
  snapDistance: number | null;
  angleError: number | null;
  inputMode: InputMode | null;
  promptLevel: string;
  promptSource: PromptSource;
  hints: string[];
}
export const newStepLog = (): StepLog => ({
  latencyMs: null, attempts: 0, wrongAttempts: 0, angleMisses: 0, emptyDrops: 0, rotations: 0,
  firstSlot: null, snapDistance: null, angleError: null, inputMode: null, promptLevel: 'IND', promptSource: 'none', hints: [],
});

/** Registra uma soltura no log do passo (puro: devolve um novo log). */
export function logDrop(log: StepLog, r: DropResult, latencyMs: number, mode: InputMode): StepLog {
  if (r.kind === 'empty') return { ...log, emptyDrops: log.emptyDrops + 1 };
  const first = log.attempts === 0;
  return {
    ...log,
    attempts: log.attempts + 1,
    latencyMs: first ? Math.max(0, Math.round(latencyMs)) : log.latencyMs,
    firstSlot: first ? r.slotIndex : log.firstSlot,
    inputMode: first ? mode : log.inputMode,
    wrongAttempts: log.wrongAttempts + (r.kind === 'wrong_slot' ? 1 : 0),
    angleMisses: log.angleMisses + (r.kind === 'angle_miss' ? 1 : 0),
    snapDistance: r.kind === 'snap' ? r.distance : log.snapDistance,
    angleError: r.kind === 'wrong_slot' ? log.angleError : r.angleError,
  };
}

/** Incorreta só quando houve tentativa clara em cavidade errada; giro errado não é erro de forma. */
export function stepResponse(log: StepLog, placed: boolean): TrialResponse {
  if (!placed) return 'no_response';
  return log.wrongAttempts > 0 ? 'incorrect' : 'correct';
}

export function buildTrialPayload(a: {
  targetId: string;
  trialIndex: number;
  presented: string[];
  pieceId: string;
  slotPieceIds: readonly string[];
  log: StepLog;
  placed: boolean;
  assemblyMs: number;
  chain: ChainState;
  chainStep: number;
  level: number;
  round: number;
  theme: Theme;
  settings: Pick<Settings, 'captureRadius' | 'angleTolerance' | 'sensory'>;
  motion: MotionLevel;
}): TrialCompletedPayload {
  const { log } = a;
  const response = stepResponse(log, a.placed);
  return {
    targetId: a.targetId,
    stimulusId: a.pieceId,
    trialIndex: a.trialIndex,
    presented: a.presented,
    positionOfTarget: Math.max(0, a.slotPieceIds.indexOf(a.pieceId)),
    selected: log.firstSlot == null ? null : a.slotPieceIds[log.firstSlot] ?? null,
    selectedPosition: log.firstSlot,
    response,
    latencyMs: response === 'no_response' ? null : log.latencyMs ?? Math.max(0, Math.round(a.assemblyMs)),
    promptLevel: log.promptLevel,
    promptSource: log.promptSource,
    attempts: Math.max(1, log.attempts),
    detail: {
      chainType: a.chain.type,
      chainStep: a.chainStep,
      k: a.chain.k,
      n: a.chain.n,
      pieceId: a.pieceId,
      snapDistancePx: a.placed ? log.snapDistance : null,
      angleErrorDeg: log.angleError,
      attemptsBeforeSnap: a.placed ? log.attempts : null,
      rotationsUsed: log.rotations,
      wrongSlotAttempts: log.wrongAttempts,
      angleMisses: log.angleMisses,
      emptyDrops: log.emptyDrops,
      inputMode: log.inputMode,
      hints: log.hints,
      assemblyMs: Math.max(0, Math.round(a.assemblyMs)),
      level: a.level,
      round: a.round,
      theme: a.theme,
      captureRadiusPx: a.settings.captureRadius,
      angleToleranceDeg: a.settings.angleTolerance,
      sensory: a.settings.sensory,
      motion: a.motion,
    },
  };
}
