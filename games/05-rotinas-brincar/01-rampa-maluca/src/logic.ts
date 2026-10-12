/**
 * Rampa Maluca (DEN-03) — lógica pura (sem React/DOM): configurações, veículos, pistas por JSON,
 * registro do adulto e montagem da telemetria do TeachingEpisode.
 * Rotina de atividade conjunta (Denver): "Preparar… apontar…" → pausa → sinal da criança → adulto valida → descida.
 */
import { seededRandom, shuffle } from '@aprumo/game-sdk';
import type { PromptSource, SessionConfig, TargetConfig, TrialResponse } from '@aprumo/protocol';

/* ------------------------------------------------------------------ veículos */

export const VEHICLES = [
  { id: 'carro', label: 'Carro', length: 74, height: 40, massFactor: 1, rolling: 0.03, restitution: 0.12 },
  { id: 'caminhao', label: 'Caminhão', length: 90, height: 50, massFactor: 1.35, rolling: 0.034, restitution: 0.1 },
  { id: 'bolinha', label: 'Bolinha', length: 40, height: 40, massFactor: 0.7, rolling: 0.04, restitution: 0.4 },
  { id: 'onibus', label: 'Ônibus', length: 100, height: 52, massFactor: 1.45, rolling: 0.035, restitution: 0.1 },
] as const;
export type VehicleId = (typeof VEHICLES)[number]['id'];
export type VehicleSpec = (typeof VEHICLES)[number];
export const VEHICLE_IDS = VEHICLES.map((v) => v.id) as VehicleId[];
export const vehicleById = (id: VehicleId): VehicleSpec => VEHICLES.find((v) => v.id === id)!;

export type Weight = 'leve' | 'pesado';
/** Densidade relativa (spec: chassi 0.002 leve → 0.006 pesado). */
export const WEIGHT_MASS: Record<Weight, number> = { leve: 1, pesado: 3 };

/* ------------------------------------------------------------------ pistas (JSON do TrackBuilder) */

export type SegmentKind = 'ramp' | 'flat' | 'bridge' | 'tunnel';
export interface TrackSegment {
  kind: SegmentKind;
  /** Comprimento em unidades do mundo (1 unidade ≈ 1 px no viewBox de 1000×600). */
  length: number;
  /** Só para 'ramp': inclinação em graus (descendo para a direita). */
  angleDeg?: number;
}
export interface TrackSpec {
  id: string;
  label: string;
  segments: TrackSegment[];
  target: 'bumper' | 'pins';
  pins?: number;
}

export const ANGLE_MIN = 15;
export const ANGLE_MAX = 40;
export const MAX_DROP = 420;
export const MAX_TRACK_LENGTH = 2600;
export const clampAngle = (a: number) => Math.max(ANGLE_MIN, Math.min(ANGLE_MAX, Math.round(a)));

/** Variações conduzidas pelo adulto (fase de Elaboração). */
export const VARIATIONS = ['nenhuma', 'tunel', 'ponte', 'pinos'] as const;
export type BuiltinVariation = (typeof VARIATIONS)[number];
export type Variation = BuiltinVariation | `custom:${string}`;
export const VARIATION_LABELS: Record<BuiltinVariation, string> = {
  nenhuma: 'Rampa simples',
  tunel: 'Túnel',
  ponte: 'Ponte no igarapé',
  pinos: 'Pinos',
};

/** Passos de inclinação do adulto (no app sem número; no painel do adulto, em graus). */
export const ANGLE_STEPS = [
  { id: 'baixa', label: 'Baixa', deg: 18 },
  { id: 'media', label: 'Média', deg: 28 },
  { id: 'alta', label: 'Alta', deg: 38 },
] as const;

export function builtinTrack(variation: BuiltinVariation, angleDeg: number): TrackSpec {
  const ramp: TrackSegment = { kind: 'ramp', length: 430, angleDeg: clampAngle(angleDeg) };
  switch (variation) {
    case 'tunel':
      return { id: 'tunel', label: VARIATION_LABELS.tunel, target: 'bumper', segments: [ramp, { kind: 'flat', length: 170 }, { kind: 'tunnel', length: 220 }, { kind: 'flat', length: 150 }] };
    case 'ponte':
      return { id: 'ponte', label: VARIATION_LABELS.ponte, target: 'bumper', segments: [ramp, { kind: 'flat', length: 120 }, { kind: 'bridge', length: 270 }, { kind: 'flat', length: 150 }] };
    case 'pinos':
      return { id: 'pinos', label: VARIATION_LABELS.pinos, target: 'pins', pins: 5, segments: [ramp, { kind: 'flat', length: 470 }] };
    default:
      return { id: 'nenhuma', label: VARIATION_LABELS.nenhuma, target: 'bumper', segments: [ramp, { kind: 'flat', length: 520 }] };
  }
}

const rec = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export type ParseResult = { ok: true; track: TrackSpec } | { ok: false; errors: string[] };

/**
 * Valida uma pista criada no clinic (objeto ou string JSON). Regras: começa por rampa de 15°–40°,
 * segmentos conhecidos, comprimentos positivos, queda total que cabe na tela, extensão máxima.
 */
export function parseTrack(input: unknown): ParseResult {
  let raw: unknown = input;
  if (typeof input === 'string') {
    try { raw = JSON.parse(input); } catch { return { ok: false, errors: ['JSON inválido'] }; }
  }
  const o = rec(raw);
  const errors: string[] = [];
  const id = typeof o.id === 'string' && /^[a-z0-9-]{1,32}$/.test(o.id) ? o.id : null;
  if (!id) errors.push('id deve ter 1–32 caracteres [a-z0-9-]');
  const label = typeof o.label === 'string' && o.label.trim() ? o.label.trim().slice(0, 40) : id ?? 'Pista';
  const target = o.target === 'pins' ? 'pins' : o.target === 'bumper' || o.target == null ? 'bumper' : null;
  if (!target) errors.push('target deve ser "bumper" ou "pins"');
  const pins = target === 'pins' ? Math.max(1, Math.min(8, Math.round(num(o.pins) ?? 5))) : undefined;
  const segsRaw = Array.isArray(o.segments) ? o.segments : null;
  if (!segsRaw || segsRaw.length === 0 || segsRaw.length > 12) errors.push('segments deve ter de 1 a 12 itens');
  const segments: TrackSegment[] = [];
  let drop = 0;
  let total = 0;
  (segsRaw ?? []).forEach((sr, k) => {
    const s = rec(sr);
    const kind = (['ramp', 'flat', 'bridge', 'tunnel'] as const).find((x) => x === s.kind);
    const length = num(s.length);
    if (!kind) { errors.push(`segmento ${k}: kind desconhecido`); return; }
    if (length == null || length < 40 || length > 1200) { errors.push(`segmento ${k}: length entre 40 e 1200`); return; }
    if (kind === 'ramp') {
      const a = num(s.angleDeg);
      const min = k === 0 ? ANGLE_MIN : 5;
      if (a == null || a < min || a > ANGLE_MAX) { errors.push(`segmento ${k}: angleDeg entre ${min} e ${ANGLE_MAX}`); return; }
      drop += length * Math.sin((a * Math.PI) / 180);
      segments.push({ kind, length, angleDeg: a });
    } else segments.push({ kind, length });
    total += length;
  });
  if (segments[0] && segments[0].kind !== 'ramp') errors.push('a pista deve começar por uma rampa');
  if (drop > MAX_DROP) errors.push(`queda total acima de ${MAX_DROP}`);
  if (total > MAX_TRACK_LENGTH) errors.push(`extensão total acima de ${MAX_TRACK_LENGTH}`);
  if (errors.length) return { ok: false, errors };
  return { ok: true, track: { id: id!, label, target: target!, ...(pins ? { pins } : {}), segments } };
}

/** Pista efetiva: a inclinação do adulto substitui a da primeira rampa (também nas pistas JSON). */
export function trackFor(variation: Variation, angleDeg: number, custom: readonly TrackSpec[]): TrackSpec {
  if (variation.startsWith('custom:')) {
    const t = custom.find((c) => `custom:${c.id}` === variation);
    if (t) {
      const [first, ...rest] = t.segments;
      return { ...t, segments: first && first.kind === 'ramp' ? [{ ...first, angleDeg: clampAngle(angleDeg) }, ...rest] : t.segments };
    }
    return builtinTrack('nenhuma', angleDeg);
  }
  return builtinTrack(variation as BuiltinVariation, angleDeg);
}

/* ------------------------------------------------------------------ configurações */

export type Sensory = 'minimal' | 'normal' | 'rich';
export type MotionLevel = 'static' | 'reduced' | 'normal';

export interface Settings {
  sensory: Sensory;
  motion: MotionLevel | null;
  /** Pausa expectante antes do "já" (ms). Padrão 3 s. */
  pauseMs: number;
  angleDeg: number;
  weight: Weight;
  variation: Variation;
  /** Rostos sutis nos veículos (o supervisor escolhe por paciente). */
  faces: boolean;
  /** As duas opções da Abertura. */
  vehicles: [VehicleId, VehicleId];
  customTracks: TrackSpec[];
  trackErrors: string[];
  voice: boolean;
  stripCollapsed: boolean;
  /** Largadas planejadas antes de sugerir o Fechamento. */
  launches: number;
}

function oneOf<T extends string>(v: unknown, xs: readonly T[]): T | null {
  return typeof v === 'string' && (xs as readonly string[]).includes(v) ? (v as T) : null;
}

export function resolveSettings(config: Pick<SessionConfig, 'params' | 'adaptation' | 'clinical'>): Settings {
  const p = rec(config.params);
  const fb = config.adaptation.feedback;
  const customTracks: TrackSpec[] = [];
  const trackErrors: string[] = [];
  const tracksRaw = Array.isArray(p.tracks) ? p.tracks : p.track != null ? [p.track] : [];
  for (const t of tracksRaw.slice(0, 8)) {
    const r = parseTrack(t);
    if (r.ok) { if (!customTracks.some((c) => c.id === r.track.id)) customTracks.push(r.track); }
    else trackErrors.push(...r.errors);
  }
  const vRaw = Array.isArray(p.vehicles) ? p.vehicles.map((v) => oneOf(v, VEHICLE_IDS)).filter((v): v is VehicleId => v != null) : [];
  const picked = [...new Set(vRaw)];
  if (picked.length < 2) {
    const rnd = seededRandom(config.clinical.seed);
    for (const v of shuffle(VEHICLE_IDS, rnd)) if (picked.length < 2 && !picked.includes(v)) picked.push(v);
  }
  const variationParam = typeof p.variation === 'string' ? p.variation : '';
  const variation: Variation =
    oneOf(variationParam, VARIATIONS) ??
    (variationParam.startsWith('custom:') && customTracks.some((c) => `custom:${c.id}` === variationParam) ? (variationParam as Variation) : 'nenhuma');
  return {
    sensory: oneOf(p.sensory, ['minimal', 'normal', 'rich'] as const) ?? (fb === 'none' ? 'minimal' : fb === 'festive' ? 'rich' : 'normal'),
    motion: oneOf(p.motion, ['static', 'reduced', 'normal'] as const),
    pauseMs: Math.max(1000, Math.min(10000, Math.round(num(p.pauseMs) ?? 3000))),
    angleDeg: clampAngle(num(p.angleDeg) ?? 28),
    weight: oneOf(p.weight, ['leve', 'pesado'] as const) ?? 'leve',
    variation,
    faces: p.faces === true,
    vehicles: [picked[0]!, picked[1]!],
    customTracks,
    trackErrors,
    voice: p.voice !== false,
    stripCollapsed: p.adultStrip === 'collapsed',
    launches: Math.max(1, Math.min(50, Math.round(num(p.launches) ?? config.clinical.trialsPerTarget))),
  };
}

/** Sensorial mínimo é estático; a preferência do sistema por menos movimento nunca é ignorada. */
export function resolveMotion(settings: Pick<Settings, 'sensory' | 'motion'>, sdk: 'full' | 'reduced' | 'static', systemReduced: boolean): MotionLevel {
  if (settings.sensory === 'minimal') return 'static';
  const m: MotionLevel = settings.motion ?? (sdk === 'full' ? 'normal' : sdk);
  return systemReduced && m === 'normal' ? 'reduced' : m;
}

/** Alvo de toque: nunca abaixo de 48px × touchScale. */
export const touchPx = (touchScale: number, base = 64) => Math.round(Math.max(48, base) * Math.max(1, Math.min(2, touchScale)));

/* ------------------------------------------------------------------ alvos clínicos */

export const DEFAULT_TARGET: TargetConfig = {
  targetId: 'rampa-maluca-ja',
  name: 'Completar "preparar, apontar… já!" para soltar o veículo',
  phase: 'acquisition',
  repertoire: 'mand',
  fieldSize: 1,
  stimulus: { stimulusId: 'rm-largada', label: 'Largada', art: 'rampa-maluca' },
  distractors: [],
  promptHierarchy: [
    { code: 'IND', label: 'Independente', intrusiveness: 0 },
    { code: 'MOD', label: 'Modelo verbal', intrusiveness: 0.5 },
  ],
  scoring: 'therapist',
};

/** Alvo do episódio k (rodízio entre os alvos configurados). */
export function targetFor(config: Pick<SessionConfig, 'clinical'>, episode: number): TargetConfig {
  const ts = config.clinical.targets;
  return ts.length ? ts[episode % ts.length]! : DEFAULT_TARGET;
}

/* ------------------------------------------------------------------ registro do adulto */

export const COMM_OUTCOMES = [
  { id: 'vocal', label: '"Já!" falado', hint: 'palavra completa', form: 'vocal', response: 'correct' },
  { id: 'approx', label: 'Aproximação', hint: '"á", "jaa…"', form: 'approximation', response: 'correct' },
  { id: 'gesture', label: 'Gesto / olhar', hint: 'aponta, olha, estende a mão', form: 'gesture', response: 'correct' },
  { id: 'modeled', label: 'Após modelo', hint: 'repetiu o "já" do adulto', form: 'echoic', response: 'correct' },
  { id: 'none', label: 'Sem sinal', hint: 'adulto solta com modelo', form: 'none', response: 'no_response' },
] as const;
export type CommOutcome = (typeof COMM_OUTCOMES)[number]['id'] | 'remote';

export interface OutcomeRecord {
  response: TrialResponse;
  promptLevel: string;
  promptSource: PromptSource;
  form: string;
}

/** Converte o registro rápido do adulto em resposta/dica (modelo verbal = MOD do profissional). */
export function outcomeToRecord(outcome: CommOutcome, remote?: TrialResponse): OutcomeRecord {
  if (outcome === 'remote') {
    const r = remote ?? 'correct';
    return { response: r, promptLevel: r === 'correct' ? 'IND' : 'MOD', promptSource: r === 'correct' ? 'none' : 'therapist', form: 'unspecified' };
  }
  const o = COMM_OUTCOMES.find((x) => x.id === outcome)!;
  const prompted = outcome === 'modeled' || outcome === 'none';
  return { response: o.response, promptLevel: prompted ? 'MOD' : 'IND', promptSource: prompted ? 'therapist' : 'none', form: o.form };
}

/* ------------------------------------------------------------------ telemetria do episódio */

export interface EpisodeFacts {
  vehicle: VehicleId;
  adultVehicle: VehicleId | null;
  rampAngleDeg: number;
  variation: Variation;
  trackId: string;
  raceMode: boolean;
  weight: Weight;
  targetHit: boolean;
  pinsDown: number;
  pinsTotal: number;
  raceWinner: 'child' | 'adult' | 'tie' | null;
  outcome: CommOutcome;
  form: string;
  released: boolean;
  spontaneousRequest: boolean;
  lookedAtAdult: boolean;
  commented: boolean;
  imitatedSound: boolean;
  signalBeforePause: boolean;
  countdownPauseMs: number;
  placedBy: 'child' | 'adult';
  placeMode: 'drag' | 'tap' | 'adult';
  choiceBy: 'child' | 'adult';
  defaults: { angleDeg: number; weight: Weight; variation: Variation };
  sensory: Sensory;
  motion: MotionLevel;
  recordLatencyMs: number | null;
}

/** Fase Denver do episódio: qualquer variação introduzida pelo adulto é Elaboração. */
export function routinePhase(f: Pick<EpisodeFacts, 'rampAngleDeg' | 'weight' | 'variation' | 'raceMode' | 'defaults'>): 'theme' | 'elaboration' {
  const d = f.defaults;
  return f.raceMode || f.variation !== d.variation || f.weight !== d.weight || f.rampAngleDeg !== d.angleDeg ? 'elaboration' : 'theme';
}

/** `detail` do TRIAL_COMPLETED: inclui o gameSpecific do spec { vehicle, rampAngleDeg, variation, raceMode, targetHit }. */
export function episodeDetail(f: EpisodeFacts): Record<string, unknown> {
  return {
    episodeKind: 'TeachingEpisode',
    routinePhase: routinePhase(f),
    gameSpecific: { vehicle: f.vehicle, rampAngleDeg: f.rampAngleDeg, variation: f.variation, raceMode: f.raceMode, targetHit: f.targetHit },
    vehicle: f.vehicle,
    adultVehicle: f.adultVehicle,
    rampAngleDeg: f.rampAngleDeg,
    variation: f.variation,
    trackId: f.trackId,
    raceMode: f.raceMode,
    raceWinner: f.raceWinner,
    weight: f.weight,
    targetHit: f.targetHit,
    pinsDown: f.pinsDown,
    pinsTotal: f.pinsTotal,
    outcome: f.outcome,
    commForm: f.form,
    vocalJa: f.form === 'vocal',
    released: f.released,
    spontaneousRequest: f.spontaneousRequest,
    lookedAtAdult: f.lookedAtAdult,
    commented: f.commented,
    imitatedSound: f.imitatedSound,
    signalBeforePause: f.signalBeforePause,
    countdownPauseMs: f.countdownPauseMs,
    placedBy: f.placedBy,
    placeMode: f.placeMode,
    choiceBy: f.choiceBy,
    inputMode: 'therapist',
    recordLatencyMs: f.recordLatencyMs,
    sensory: f.sensory,
    motion: f.motion,
  };
}

/** Comentário de ação falado após a descida (linguagem simples, sem "errou"). */
export function actionComment(targetHit: boolean, pinsDown: number): string {
  if (pinsDown > 0) return 'Caiu!';
  return targetHit ? 'Bateu!' : 'Parou!';
}
