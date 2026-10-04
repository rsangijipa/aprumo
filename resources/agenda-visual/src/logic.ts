/**
 * Lógica pura do Studio de Rotina Visual: progressão de etapas e matemática do timer circular.
 */
import type { EventPayload } from '@aprumo/protocol';

export type StepStatus = 'done' | 'current' | 'next';
export type Orientation = 'horizontal' | 'vertical';
export type Variant = 'playful' | 'sober';

/** A partir desta idade a rotina usa a variante sóbria. */
export const SOBER_FROM_AGE = 10;
export function resolveVariant(opts: { variant?: Variant; ageYears?: number | null }): Variant {
  if (opts.variant) return opts.variant;
  return opts.ageYears != null && opts.ageYears >= SOBER_FROM_AGE ? 'sober' : 'playful';
}

export const stepStatus = (k: number, current: number): StepStatus => (k < current ? 'done' : k === current ? 'current' : 'next');

/** Par "Primeiro → Depois" a partir da etapa atual. */
export function firstThen<T>(items: readonly T[], current: number): { first: T | undefined; then: T | undefined } {
  return { first: items[current], then: items[current + 1] };
}

export interface RoutineState {
  current: number;
  /** Instante (ms) em que a etapa atual começou; null = aguardando início. */
  startedAt: number | null;
  /** Instante (ms) em que a etapa anterior foi concluída (para latência de transição). */
  lastCompletedAt: number | null;
}

export type RoutineEvent =
  | { type: 'SCHEDULE_ITEM_STARTED'; payload: EventPayload<'SCHEDULE_ITEM_STARTED'> }
  | { type: 'SCHEDULE_ITEM_COMPLETED'; payload: EventPayload<'SCHEDULE_ITEM_COMPLETED'> };

export const initialRoutine = (): RoutineState => ({ current: 0, startedAt: null, lastCompletedAt: null });

export const isFinished = (s: RoutineState, total: number) => s.current >= total;

/** Fração concluída (0..1). */
export const progress = (s: RoutineState, total: number) => (total <= 0 ? 1 : Math.min(1, s.current / total));

/** Inicia a etapa atual. Latência = tempo desde a conclusão da anterior (null na primeira). */
export function startStep(s: RoutineState, items: readonly { id: string }[], scheduleId: string, now: number): { state: RoutineState; events: RoutineEvent[] } {
  const it = items[s.current];
  if (!it || s.startedAt !== null) return { state: s, events: [] };
  const transitionLatencyMs = s.lastCompletedAt === null ? null : Math.max(0, Math.round(now - s.lastCompletedAt));
  return {
    state: { ...s, startedAt: now },
    events: [{ type: 'SCHEDULE_ITEM_STARTED', payload: { scheduleId, itemId: it.id, transitionLatencyMs } }],
  };
}

/** Conclui a etapa atual e avança. Com `autoStart`, a próxima começa imediatamente. */
export function completeStep(
  s: RoutineState,
  items: readonly { id: string }[],
  scheduleId: string,
  now: number,
  autoStart = false,
): { state: RoutineState; events: RoutineEvent[] } {
  const it = items[s.current];
  if (!it) return { state: s, events: [] };
  const events: RoutineEvent[] = [{ type: 'SCHEDULE_ITEM_COMPLETED', payload: { scheduleId, itemId: it.id } }];
  let state: RoutineState = { current: s.current + 1, startedAt: null, lastCompletedAt: now };
  if (autoStart) {
    const r = startStep(state, items, scheduleId, now);
    state = r.state;
    events.push(...r.events);
  }
  return { state, events };
}

/** Volta uma etapa (correção do adulto); não emite eventos. */
export function backStep(s: RoutineState): RoutineState {
  return s.current <= 0 ? s : { current: s.current - 1, startedAt: null, lastCompletedAt: null };
}

/* ---------------- timer ---------------- */

/** Fração restante (1 → 0), limitada a [0, 1]. Duração ≤ 0 → 0. */
export function remainingFraction(elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - elapsedMs / durationMs));
}

/** Segundos restantes arredondados para cima (mostra "1" até o último instante). */
export function remainingSeconds(elapsedMs: number, durationMs: number): number {
  return Math.max(0, Math.ceil((durationMs - Math.max(0, elapsedMs)) / 1000));
}

/** "m:ss". */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Traço de um arco circular SVG para a fração restante. */
export function arcDash(radius: number, fraction: number): { dasharray: number; dashoffset: number } {
  const c = 2 * Math.PI * radius;
  const f = Math.min(1, Math.max(0, fraction));
  return { dasharray: c, dashoffset: c * (1 - f) };
}

/** Aviso de transição: últimos 25% ou últimos 60 s, o que vier primeiro. */
export function shouldWarn(remainingSec: number, durationSec: number): boolean {
  if (durationSec <= 0) return false;
  return remainingSec > 0 && remainingSec <= Math.min(60, durationSec * 0.25);
}
