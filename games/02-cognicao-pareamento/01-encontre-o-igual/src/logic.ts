/**
 * Lógica do Match Lab (pareamento). Pura e determinística: a mesma configuração gera a mesma sessão.
 *
 *  Dimensões de pareamento
 *   - identical : modelo = alvo (pareamento de idênticos).
 *   - color     : o correto tem a MESMA COR do modelo e outra forma; distratores têm outra cor.
 *   - shape     : o correto tem a MESMA FORMA do modelo e outra cor; distratores têm outra forma.
 *   - category  : o modelo é outro membro da categoria do alvo; distratores vêm de outras categorias.
 *   - function  : o modelo é um item associado funcionalmente ao alvo (cachorro → bola).
 *  Campo: 1, 2, 3, 4, 6, 8 ou 12 estímulos. Posição do correto contrabalanceada por alvo.
 *  Distratores: primeiro os configurados pelo profissional; completa com o acervo quando falta.
 */
import { counterbalancedPositions, seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig, StimulusRef, TargetConfig } from '@aprumo/protocol';
import { STIMULUS_ART } from '@aprumo/stimuli';

export const DIMENSIONS = ['identical', 'color', 'shape', 'category', 'function'] as const;
export type Dimension = (typeof DIMENSIONS)[number];
export const FIELD_SIZES = [1, 2, 3, 4, 6, 8, 12] as const;
export type ResponseMode = 'tap' | 'drag';
export type Preset = 'soft-clay' | 'cozy-cartoon' | 'lab-clean';
export type Sensory = 'minimal' | 'normal' | 'rich';
export type MotionLevel = 'static' | 'reduced' | 'normal';

export interface PlannedTrial {
  index: number;
  /** Alvo clínico. Em cor/forma, `target.stimulus` é o token correto gerado para a tentativa. */
  target: TargetConfig;
  /** O que aparece na bandeja. */
  model: StimulusRef;
  options: StimulusRef[];
  positionOfTarget: number;
  dimension: Dimension;
  fieldSize: number;
  /** A dimensão pedida não era viável para o alvo e caiu para idênticos. */
  dimensionFallback: boolean;
}

/* ------------------------------------------------------------------ tokens abstratos (cor/forma) */

export const SHAPES = ['circulo', 'quadrado', 'triangulo', 'estrela', 'coracao', 'losango'] as const;
export const COLORS = ['vermelho', 'azul', 'amarelo', 'verde', 'roxo', 'rosa'] as const;
export type Shape = (typeof SHAPES)[number];
export type Color = (typeof COLORS)[number];
const SHAPE_LABEL: Record<Shape, string> = { circulo: 'círculo', quadrado: 'quadrado', triangulo: 'triângulo', estrela: 'estrela', coracao: 'coração', losango: 'losango' };
const FEMININE: Shape[] = ['estrela'];
const COLOR_LABEL: Record<Color, [string, string]> = {
  vermelho: ['vermelho', 'vermelha'], azul: ['azul', 'azul'], amarelo: ['amarelo', 'amarela'],
  verde: ['verde', 'verde'], roxo: ['roxo', 'roxa'], rosa: ['rosa', 'rosa'],
};

/** Arte `lab:<forma>:<cor>`, desenhada pelo próprio jogo. */
export function tokenRef(shape: Shape, color: Color): StimulusRef {
  const label = `${SHAPE_LABEL[shape]} ${COLOR_LABEL[color][FEMININE.includes(shape) ? 1 : 0]}`;
  return { stimulusId: `lab-${shape}-${color}`, label, art: `lab:${shape}:${color}` };
}
export function parseToken(art: string): { shape: Shape; color: Color } | null {
  const [p, s, c] = art.split(':');
  if (p !== 'lab' || !SHAPES.includes(s as Shape) || !COLORS.includes(c as Color)) return null;
  return { shape: s as Shape, color: c as Color };
}

/* ------------------------------------------------------------------ acervo */

export const categoryOf = (art: string): string | undefined => STIMULUS_ART[art]?.category;
export const libraryRef = (art: string): StimulusRef => ({ stimulusId: art, label: STIMULUS_ART[art]?.label ?? art, art });
const LIBRARY = Object.keys(STIMULUS_ART);

/** Associações funcionais padrão (bidirecionais). O profissional pode sobrescrever em params.associations. */
export const DEFAULT_ASSOCIATIONS: Array<[string, string]> = [
  ['cachorro', 'bola'],
  ['gato', 'peixe'],
  ['colher', 'copo'],
  ['escova', 'copo'],
  ['sapato', 'camisa'],
  ['livro', 'casa'],
];
export function associatesOf(art: string, pairs: Array<[string, string]>): string[] {
  return pairs.flatMap(([a, b]) => (a === art ? [b] : b === art ? [a] : []));
}

/* ------------------------------------------------------------------ configuração */

export interface TargetSettings { dimension: Dimension; fieldSize: number }
export interface Settings {
  responseMode: ResponseMode;
  preset: Preset;
  sensory: Sensory;
  motion: MotionLevel | null;
  associations: Array<[string, string]>;
  /** Completar o campo com o acervo quando faltam distratores configurados. */
  fillFromLibrary: boolean;
  forTarget: (t: TargetConfig) => TargetSettings;
}

const oneOf = <T extends string>(v: unknown, xs: readonly T[]): T | undefined => (xs.includes(v as T) ? (v as T) : undefined);
const rec = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** Maior tamanho permitido ≤ n (1…12). */
export function snapFieldSize(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return [...FIELD_SIZES].reverse().find((s) => s <= n) ?? 1;
}

export function presetForAge(months: number): Preset {
  return months < 72 ? 'soft-clay' : months < 120 ? 'cozy-cartoon' : 'lab-clean';
}

/**
 * Lê `config.params`:
 *   dimension, fieldSize, responseMode ('tap'|'drag'), preset, ageMonths | ageYears,
 *   sensory ('minimal'|'normal'|'rich'), motion ('static'|'reduced'|'normal'),
 *   associations ({ arteA: arteB }), fillFromLibrary (bool),
 *   targets: { [targetId]: { dimension?, fieldSize? } }.
 * `fieldSize` explícito em params é decisão da sessão e pode passar de adaptation.maxChoices (8, 12);
 * sem ele, vale min(target.fieldSize, maxChoices).
 */
export function resolveSettings(config: SessionConfig): Settings {
  const p = rec(config.params);
  const perTarget = rec(p.targets);
  const age = typeof p.ageMonths === 'number' ? p.ageMonths : typeof p.ageYears === 'number' ? p.ageYears * 12 : null;
  const fb = config.adaptation.feedback;
  const assoc = Object.entries(rec(p.associations)).filter((e): e is [string, string] => typeof e[1] === 'string');
  const globalDim = oneOf(p.dimension, DIMENSIONS) ?? 'identical';
  const globalField = typeof p.fieldSize === 'number' ? p.fieldSize : null;
  return {
    responseMode: oneOf(p.responseMode, ['tap', 'drag'] as const) ?? 'tap',
    preset: oneOf(p.preset, ['soft-clay', 'cozy-cartoon', 'lab-clean'] as const) ?? (age != null ? presetForAge(age) : 'soft-clay'),
    sensory: oneOf(p.sensory, ['minimal', 'normal', 'rich'] as const) ?? (fb === 'none' ? 'minimal' : fb === 'festive' ? 'rich' : 'normal'),
    motion: oneOf(p.motion, ['static', 'reduced', 'normal'] as const) ?? null,
    associations: assoc.length ? assoc : DEFAULT_ASSOCIATIONS,
    fillFromLibrary: p.fillFromLibrary !== false,
    forTarget: (t) => {
      const o = rec(perTarget[t.targetId]);
      const explicit = typeof o.fieldSize === 'number' ? o.fieldSize : globalField;
      return {
        dimension: oneOf(o.dimension, DIMENSIONS) ?? globalDim,
        fieldSize: snapFieldSize(Math.min(12, explicit ?? Math.min(t.fieldSize, config.adaptation.maxChoices))),
      };
    },
  };
}

/** Movimento final: perfil sensorial mínimo é estático; preferência do sistema nunca é ignorada. */
export function resolveMotion(settings: Settings, sdk: 'full' | 'reduced' | 'static', systemReduced: boolean): MotionLevel {
  if (settings.sensory === 'minimal') return 'static';
  const m: MotionLevel = settings.motion ?? (sdk === 'full' ? 'normal' : sdk);
  return systemReduced && m === 'normal' ? 'reduced' : m;
}

/* ------------------------------------------------------------------ geração por dimensão */

interface Design { model: StimulusRef; correct: StimulusRef; distractors: StimulusRef[]; dimension: Dimension; fallback: boolean }

/** Monta modelo, correto e o banco de distratores válidos (sem segundo correto, sem duplicatas). */
export function designFor(target: TargetConfig, dimension: Dimension, settings: Pick<Settings, 'associations' | 'fillFromLibrary'>, rnd: () => number, need: number): Design {
  const stim = target.stimulus;
  if (dimension === 'color' || dimension === 'shape') {
    const tok = parseToken(stim.art) ?? { shape: SHAPES[Math.floor(rnd() * SHAPES.length)]!, color: COLORS[Math.floor(rnd() * COLORS.length)]! };
    const model = tokenRef(tok.shape, tok.color);
    const key = dimension === 'color' ? 'color' : 'shape';
    const other = dimension === 'color' ? 'shape' : 'color';
    const pool = SHAPES.flatMap((s) => COLORS.map((c) => ({ shape: s, color: c })));
    const correctTok = shuffle(pool.filter((t) => t[key] === tok[key] && t[other] !== tok[other]), rnd)[0]!;
    const wrong = shuffle(pool.filter((t) => t[key] !== tok[key]), rnd);
    // Competidor: um distrator compartilha o atributo irrelevante do modelo (evita parear pela dimensão errada).
    const lure = wrong.findIndex((t) => t[other] === tok[other]);
    if (lure > 0) wrong.unshift(wrong.splice(lure, 1)[0]!);
    return { model, correct: tokenRef(correctTok.shape, correctTok.color), distractors: wrong.map((t) => tokenRef(t.shape, t.color)), dimension, fallback: false };
  }

  let model: StimulusRef | null = stim;
  let excluded = new Set<string>([stim.art]);
  if (dimension === 'category') {
    const cat = categoryOf(stim.art);
    const mates = cat ? LIBRARY.filter((a) => a !== stim.art && categoryOf(a) === cat) : [];
    model = mates.length ? libraryRef(shuffle(mates, rnd)[0]!) : null;
    if (model) excluded = new Set(LIBRARY.filter((a) => categoryOf(a) === cat));
  } else if (dimension === 'function') {
    const mates = associatesOf(stim.art, settings.associations);
    model = mates.length ? libraryRef(shuffle(mates, rnd)[0]!) : null;
    if (model) excluded = new Set([stim.art, model.art, ...associatesOf(model.art, settings.associations)]);
  }
  if (!model) return { ...designFor(target, 'identical', settings, rnd, need), dimension: 'identical', fallback: true };

  const seen = new Set<string>();
  const ok = (s: StimulusRef) => !excluded.has(s.art) && s.stimulusId !== stim.stimulusId && s.art !== model!.art && !seen.has(s.art) && (seen.add(s.art), true);
  const configured = shuffle(target.distractors, rnd).filter(ok);
  const fillPool = parseToken(stim.art) ? SHAPES.flatMap((s) => COLORS.map((c) => tokenRef(s, c))) : LIBRARY.map(libraryRef);
  const fill = settings.fillFromLibrary && configured.length < need ? shuffle(fillPool, rnd).filter(ok) : [];
  return { model, correct: stim, distractors: [...configured, ...fill], dimension, fallback: false };
}

/* ------------------------------------------------------------------ planejamento */

export function planTrials(config: SessionConfig, settings: Settings = resolveSettings(config)): PlannedTrial[] {
  const rnd = seededRandom(config.clinical.seed);
  const { trialsPerTarget, interleave } = config.clinical;
  const perTarget = config.clinical.targets.map((target) => {
    const ts = settings.forTarget(target);
    // Tamanho efetivo do campo: limitado pelo banco disponível (o primeiro desenho mede o banco).
    const probe = designFor(target, ts.dimension, settings, seededRandom(config.clinical.seed + 7), ts.fieldSize - 1);
    const field = snapFieldSize(Math.min(ts.fieldSize, probe.distractors.length + 1));
    const positions = counterbalancedPositions(trialsPerTarget, field, rnd);
    return positions.map((pos) => {
      const d = designFor(target, ts.dimension, settings, rnd, field - 1);
      const options = d.distractors.slice(0, field - 1);
      options.splice(pos, 0, d.correct);
      return {
        target: d.correct === target.stimulus ? target : { ...target, stimulus: d.correct },
        model: d.model, options, positionOfTarget: pos, dimension: d.dimension, fieldSize: field, dimensionFallback: d.fallback,
      };
    });
  });
  const flat = interleave ? interleaveNoLongRuns(perTarget, rnd) : perTarget.flat();
  return flat.map((t, index) => ({ ...t, index }));
}

/** Intercala alvos evitando mais de 2 tentativas seguidas do mesmo alvo quando possível. */
function interleaveNoLongRuns<T extends { target: TargetConfig }>(groups: T[][], rnd: () => number): T[] {
  const pools = groups.map((g) => [...g]);
  const out: T[] = [];
  while (pools.some((p) => p.length)) {
    const last2 = out.slice(-2).map((t) => t.target.targetId);
    const blocked = last2.length === 2 && last2[0] === last2[1] ? last2[0] : undefined;
    const candidates = pools.map((p, i) => ({ p, i })).filter(({ p }) => p.length && p[0]!.target.targetId !== blocked);
    const pick = (candidates.length ? candidates : pools.map((p, i) => ({ p, i })).filter(({ p }) => p.length))[
      Math.floor(rnd() * (candidates.length || 1))
    ]!;
    out.push(pools[pick.i]!.shift()!);
  }
  return out;
}

/* ------------------------------------------------------------------ layout e tentativas */

export interface GridFit { cols: number; rows: number; item: number; gap: number; fits: boolean }

/**
 * Grade que maximiza o tamanho do cartão na área disponível (w × h, px). Só usa colunas que dividem o
 * campo (linhas completas, nada "sobra" sozinho) e no máximo 6 colunas. O cartão nunca fica abaixo de
 * 48px × touchScale; se nem assim couber, `fits` = false e a área rola (último recurso).
 */
export function fitGrid(field: number, w: number, h: number, touchScale = 1): GridFit {
  const n = Math.max(1, field);
  const gap = w < 480 ? 10 : w < 900 ? 16 : 22;
  const minItem = 48 * touchScale;
  const maxItem = 220;
  let best = { cols: 1, rows: n, fit: -Infinity };
  for (let cols = 1; cols <= Math.min(n, 6); cols++) {
    if (n % cols) continue;
    const rows = n / cols;
    const fit = Math.min((w - (cols - 1) * gap) / cols, (h - (rows - 1) * gap) / rows);
    if (fit > best.fit + 0.5) best = { cols, rows, fit };
  }
  const item = Math.floor(Math.max(minItem, Math.min(best.fit, maxItem)));
  return { cols: best.cols, rows: best.rows, item, gap, fits: best.fit >= minItem };
}

/**
 * Resumo das tentativas de resposta antes da confirmação (arrastar / pegar-e-colocar).
 * `pickups`: posições pegas em ordem; trocas consecutivas iguais contam uma vez.
 */
export function summarizeAttempts(pickups: number[], committed: number, positionOfTarget: number): { attempts: number; selfCorrected: boolean } {
  const seq = [...pickups, committed].filter((p, i, a) => i === 0 || a[i - 1] !== p);
  return { attempts: seq.length, selfCorrected: committed === positionOfTarget && seq.some((p) => p !== positionOfTarget) };
}
