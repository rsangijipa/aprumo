/**
 * Protocolo Aprumo v2 — o único contrato comum a todos os jogos e recursos.
 * Cada jogo tem visual e lógica próprios; os dados que ele devolve seguem este formato.
 */
import { z } from 'zod';

export const PROTOCOL_VERSION = '2.0.0';

export const InterventionModel = z.enum(['ABA', 'DENVER']);
export type InterventionModel = z.infer<typeof InterventionModel>;

export const TargetPhase = z.enum([
  'baseline',
  'acquisition',
  'maintenance',
  'generalization',
  'mastered',
  'review',
  'suspended',
]);
export type TargetPhase = z.infer<typeof TargetPhase>;

export const Repertoire = z.enum([
  'mand',
  'tact',
  'echoic',
  'intraverbal',
  'listener',
  'imitation',
  'matching',
  'social',
  'play',
  'adl',
  'academic',
  'alternative_behavior',
]);
export type Repertoire = z.infer<typeof Repertoire>;

export const TrialResponse = z.enum(['correct', 'incorrect', 'no_response']);
export type TrialResponse = z.infer<typeof TrialResponse>;

/** Quem forneceu a dica: o profissional ou o próprio jogo (dica embutida). */
export const PromptSource = z.enum(['none', 'therapist', 'built_in']);
export type PromptSource = z.infer<typeof PromptSource>;

export const PromptLevelRef = z.object({
  code: z.string().min(1).max(16),
  label: z.string(),
  /** 0 = independente; 1 = mais intrusiva da hierarquia. */
  intrusiveness: z.number().min(0).max(1),
});
export type PromptLevelRef = z.infer<typeof PromptLevelRef>;

export const StimulusRef = z.object({
  stimulusId: z.string(),
  label: z.string(),
  /** Chave da arte no acervo compartilhado (packages/stimuli). */
  art: z.string(),
});
export type StimulusRef = z.infer<typeof StimulusRef>;

export const TargetConfig = z.object({
  targetId: z.string(),
  name: z.string(),
  phase: TargetPhase,
  repertoire: Repertoire,
  fieldSize: z.number().int().min(1).max(6),
  stimulus: StimulusRef,
  distractors: z.array(StimulusRef),
  promptHierarchy: z.array(PromptLevelRef).min(1),
  scoring: z.enum(['auto', 'therapist']),
});
export type TargetConfig = z.infer<typeof TargetConfig>;

export const Adaptation = z.object({
  motion: z.enum(['full', 'reduced', 'static']),
  sound: z.enum(['off', 'low', 'normal']),
  feedback: z.enum(['none', 'subtle', 'festive']),
  palette: z.enum(['calm', 'vivid', 'high-contrast']),
  maxChoices: z.number().int().min(1).max(6),
  /** Multiplicador do tamanho dos alvos de toque (1 = 64px base). */
  touchScale: z.number().min(1).max(2),
  /** Dica embutida do jogo após N ms sem resposta; null desativa. */
  builtInPromptAfterMs: z.number().int().positive().nullable(),
  screenBudgetSec: z.number().int().positive(),
});
export type Adaptation = z.infer<typeof Adaptation>;

export const DEFAULT_ADAPTATION: Adaptation = {
  motion: 'reduced',
  sound: 'low',
  feedback: 'subtle',
  palette: 'calm',
  maxChoices: 3,
  touchScale: 1,
  builtInPromptAfterMs: null,
  screenBudgetSec: 600,
};

export const SessionConfig = z.object({
  protocolVersion: z.literal(PROTOCOL_VERSION),
  runId: z.string(),
  appId: z.string(),
  appVersion: z.string(),
  /** Nome de preferência (apelido). Nunca nome completo nem diagnóstico. */
  childDisplayName: z.string().max(40),
  clinical: z.object({
    model: InterventionModel,
    targets: z.array(TargetConfig),
    trialsPerTarget: z.number().int().min(1).max(50),
    interleave: z.boolean(),
    seed: z.number().int(),
  }),
  adaptation: Adaptation,
  /** Parâmetros específicos do jogo, validados pelo próprio jogo. */
  params: z.record(z.string(), z.unknown()),
});
export type SessionConfig = z.infer<typeof SessionConfig>;

/* ---------------------------------------------------------------- eventos */

const TrialCompletedPayload = z.object({
  targetId: z.string(),
  stimulusId: z.string(),
  trialIndex: z.number().int().min(0),
  /** IDs apresentados, na ordem das posições na tela. */
  presented: z.array(z.string()),
  positionOfTarget: z.number().int().min(0).nullable(),
  selected: z.string().nullable(),
  /** Posição tocada, para detectar viés de posição (R8). */
  selectedPosition: z.number().int().min(0).nullable(),
  response: TrialResponse,
  latencyMs: z.number().int().min(0).nullable(),
  promptLevel: z.string(),
  promptSource: PromptSource,
  /** Detalhes próprios do jogo (ex.: instrução repetida, interrupções). */
  detail: z.record(z.string(), z.unknown()).default({}),
});
export type TrialCompletedPayload = z.infer<typeof TrialCompletedPayload>;

export const EventPayloads = {
  SESSION_STARTED: z.object({ configVersion: z.string() }),
  TRIAL_STARTED: z.object({
    targetId: z.string(),
    trialIndex: z.number().int(),
    presented: z.array(z.string()),
  }),
  TRIAL_COMPLETED: TrialCompletedPayload,
  PROMPT_USED: z.object({
    targetId: z.string(),
    trialIndex: z.number().int(),
    level: z.string(),
    source: PromptSource,
    latencyMs: z.number().int().min(0),
  }),
  REWARD_TRIGGERED: z.object({
    kind: z.enum(['visual', 'sound', 'token', 'access']),
    contingentOn: z.string().nullable(),
  }),
  TOKEN_DELIVERED: z.object({
    boardId: z.string(),
    tokenIndex: z.number().int().min(0),
    tokensRequired: z.number().int().min(1),
    contingentOn: z.string().nullable(),
  }),
  BOARD_COMPLETED: z.object({ boardId: z.string(), backupReinforcerId: z.string() }),
  EXCHANGE_STARTED: z.object({ boardId: z.string(), accessSec: z.number().int().min(0) }),
  EXCHANGE_ENDED: z.object({ boardId: z.string(), endedBy: z.enum(['timer', 'adult']) }),
  SCHEDULE_ITEM_STARTED: z.object({
    scheduleId: z.string(),
    itemId: z.string(),
    transitionLatencyMs: z.number().int().min(0).nullable(),
  }),
  SCHEDULE_ITEM_COMPLETED: z.object({ scheduleId: z.string(), itemId: z.string() }),
  SESSION_PAUSED: z.object({ reason: z.string().nullable() }),
  SESSION_RESUMED: z.object({}),
  SESSION_COMPLETED: z.object({ trialsCompleted: z.number().int().min(0) }),
  ERROR_OCCURRED: z.object({ code: z.string(), recoverable: z.boolean() }),
  APP_CLOSED: z.object({ reason: z.string() }),
} as const;

export type EventType = keyof typeof EventPayloads;
export const EVENT_TYPES = Object.keys(EventPayloads) as EventType[];
export type EventPayload<T extends EventType> = z.infer<(typeof EventPayloads)[T]>;

/** Eventos clínicos entram nos gráficos; os demais são de controle. */
export const CLINICAL_EVENT_TYPES: ReadonlySet<EventType> = new Set<EventType>([
  'TRIAL_COMPLETED',
  'PROMPT_USED',
  'TOKEN_DELIVERED',
  'BOARD_COMPLETED',
  'SCHEDULE_ITEM_STARTED',
  'SCHEDULE_ITEM_COMPLETED',
]);

export const EventEnvelope = z.object({
  eventId: z.string().min(8),
  sequence: z.number().int().min(0),
  runId: z.string(),
  protocolVersion: z.literal(PROTOCOL_VERSION),
  appId: z.string(),
  type: z.enum(EVENT_TYPES as [EventType, ...EventType[]]),
  occurredAt: z.iso.datetime(),
  payload: z.unknown(),
});
export type EventEnvelope<T extends EventType = EventType> = Omit<
  z.infer<typeof EventEnvelope>,
  'type' | 'payload'
> & { type: T; payload: EventPayload<T> };

export type ValidationResult =
  | { ok: true; event: EventEnvelope }
  | { ok: false; reason: string };

/** Valida envelope e payload. Falhas vão para a quarentena, nunca para os registros clínicos. */
export function validateEvent(raw: unknown): ValidationResult {
  const env = EventEnvelope.safeParse(raw);
  if (!env.success) return { ok: false, reason: `envelope: ${env.error.issues[0]?.message ?? 'inválido'}` };
  const schema = EventPayloads[env.data.type];
  const payload = schema.safeParse(env.data.payload);
  if (!payload.success) {
    const issue = payload.error.issues[0];
    return { ok: false, reason: `payload ${env.data.type}: ${issue?.path.join('.')} ${issue?.message}` };
  }
  return { ok: true, event: { ...env.data, payload: payload.data } as EventEnvelope };
}

/* --------------------------------------------- mensagens hospedeiro ↔ jogo */

export type GameToHost =
  | { kind: 'APP_READY'; appId: string; appVersion: string; protocolVersion: string }
  | { kind: 'EVENT'; event: EventEnvelope };

export type HostToGame =
  | { kind: 'SESSION_CONFIG'; config: SessionConfig }
  | { kind: 'EVENT_ACK'; eventId: string }
  | { kind: 'PAUSE' }
  | { kind: 'RESUME' }
  | { kind: 'END'; reason: string }
  /** Nível de dica marcado pelo profissional para a tentativa em curso. */
  | { kind: 'SET_PROMPT'; level: string }
  /** Pontuação do profissional para jogos com scoring 'therapist'. */
  | { kind: 'SCORE_TRIAL'; response: TrialResponse };

export const MESSAGE_CHANNEL = 'aprumo/v2';

/* ------------------------------------------------------- manifesto clínico */

export const PlayLevel = z.enum([
  'regulation',
  'exploratory',
  'functional',
  'constructive',
  'symbolic',
  'reciprocal',
  'cooperative',
  'community',
]);

export const GameManifest = z.object({
  appId: z.string().regex(/^[a-z0-9-]+$/),
  version: z.string(),
  name: z.string(),
  kind: z.enum(['game', 'support']),
  summary: z.string(),
  clinical: z.object({
    purposes: z.array(z.enum(['teaching', 'reinforcer', 'regulation', 'probe', 'support'])).min(1),
    models: z.object({
      ABA: z.enum(['trial-based', 'support', 'not-indicated']),
      DENVER: z.enum(['joint-routine', 'support', 'not-indicated']),
    }),
    repertoires: z.array(Repertoire),
    autoScoring: z.array(Repertoire),
    therapistScoring: z.array(Repertoire),
    playLevel: PlayLevel,
    trialUnit: z.string(),
    correctResponse: z.string(),
    minFieldSize: z.number().int().min(1),
    maxFieldSize: z.number().int().max(6),
    latencyMaxMs: z.number().int().positive(),
    builtInPrompts: z.array(
      z.object({ code: z.string(), afterMs: z.number().int(), intrusiveness: z.number().min(0).max(1) }),
    ),
    prerequisites: z.array(z.string()),
    ageRangeMonths: z.tuple([z.number().int(), z.number().int()]),
    requiresAdult: z.boolean(),
    sensory: z.object({
      flashes: z.literal(false),
      motionReducible: z.boolean(),
      sound: z.enum(['none', 'low', 'adjustable']),
    }),
    emits: z.array(z.enum(EVENT_TYPES as [EventType, ...EventType[]])),
  }),
});
export type GameManifest = z.infer<typeof GameManifest>;

/* ------------------------------------------------ sessão infantil segura */

export const ChildSessionResolved = z.object({
  valid: z.boolean(),
  child_session_id: z.string().optional(),
  session_id: z.string().optional(),
  child_id: z.string().optional(),
  preferred_name: z.string().optional(),
  age_months: z.number().optional(),
  adaptation: Adaptation.optional(),
  allowed_apps: z.array(z.string()).optional(),
  expires_at: z.string().optional(),
  reason: z.string().optional(),
});
export type ChildSessionResolved = z.infer<typeof ChildSessionResolved>;

/* ------------------------------------------------ retratação (desfazer) */

export const TrialRetractionRecord = z.object({
  session_id: z.string(),
  trial_client_event_id: z.string(),
  reason: z.string(),
});
export type TrialRetractionRecord = z.infer<typeof TrialRetractionRecord>;

/* ------------------------------------------------ ingestão em lote (outbox) */

export const IngestBatchRequest = z.object({
  sessionId: z.string().uuid(),
  caseId: z.string().uuid(),
  trials: z.array(z.record(z.string(), z.unknown())).default([]),
  opportunities: z.array(z.record(z.string(), z.unknown())).default([]),
  chainSteps: z.array(z.record(z.string(), z.unknown())).default([]),
  denverStepScores: z.array(z.record(z.string(), z.unknown())).default([]),
  behaviors: z.array(z.record(z.string(), z.unknown())).default([]),
  retractions: z.array(TrialRetractionRecord).default([]),
  pauses: z.array(z.record(z.string(), z.unknown())).default([]),
  notes: z.array(z.record(z.string(), z.unknown())).default([]),
});
export type IngestBatchRequest = z.infer<typeof IngestBatchRequest>;

export const IngestBatchResponse = z.object({
  success: z.boolean(),
  persistedCount: z.number().int(),
  quarantinedCount: z.number().int(),
  quarantinedErrors: z.array(z.object({ id: z.string(), reason: z.string() })).default([]),
  alertsTriggered: z.number().int().default(0),
});
export type IngestBatchResponse = z.infer<typeof IngestBatchResponse>;

/* ------------------------------------------------ motor de regras no servidor */

export const RulesEvaluateRequest = z.object({
  caseId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
});
export type RulesEvaluateRequest = z.infer<typeof RulesEvaluateRequest>;

export const RulesEvaluateResponse = z.object({
  generatedAlerts: z.number().int(),
  rulesEvaluated: z.array(z.string()),
  evaluatedAt: z.string(),
});
export type RulesEvaluateResponse = z.infer<typeof RulesEvaluateResponse>;

/* ------------------------------------------------ adiar alertas */

export const SnoozeAlertRequest = z.object({
  alertId: z.string().uuid(),
  until: z.string(),
  reason: z.string().min(5),
});
export type SnoozeAlertRequest = z.infer<typeof SnoozeAlertRequest>;

/* ------------------------------------------------ telemetria e estado lúdico */

export const ChildSpaceState = z.object({
  starsEarned: z.number().int().nonnegative(),
  tokensBalance: z.number().int().nonnegative(),
  dailyScreenTimeUsedSeconds: z.number().int().nonnegative(),
  screenTimeLimitMinutes: z.number().int().positive(),
  preferences: z.record(z.string(), z.unknown()).default({}),
});
export type ChildSpaceState = z.infer<typeof ChildSpaceState>;

export const PracticeRunPayload = z.object({
  token: z.string().min(8),
  appId: z.string(),
  durationSeconds: z.number().int().nonnegative(),
  starsAwarded: z.number().int().nonnegative(),
  telemetry: z.record(z.string(), z.unknown()).default({}),
});
export type PracticeRunPayload = z.infer<typeof PracticeRunPayload>;

