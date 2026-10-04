import { mean, median } from './stats';
import type { Channel, TargetSessionSummary, TrialFact } from './types';

const pct = (n: number, d: number) => (d === 0 ? null : (n / d) * 100);

function mode<T>(xs: readonly T[]): T {
  const counts = new Map<T, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
}

/**
 * Resume as tentativas de UM alvo em UMA sessão.
 * Acerto com dica nunca conta como independente (erro corrigido do Terapia-Arcade).
 */
export function summarizeTargetSession(trials: readonly TrialFact[]): TargetSessionSummary {
  const first = trials[0];
  if (!first) throw new Error('summarizeTargetSession requires at least one trial');
  if (trials.some((t) => t.targetId !== first.targetId || t.sessionId !== first.sessionId)) {
    throw new Error('trials must share targetId and sessionId — never aggregate across targets');
  }
  const correctIndependent = trials.filter(
    (t) => t.response === 'correct' && t.promptIntrusiveness === 0,
  ).length;
  const correctPrompted = trials.filter(
    (t) => t.response === 'correct' && t.promptIntrusiveness > 0,
  ).length;
  const incorrect = trials.filter((t) => t.response === 'incorrect').length;
  const noResponse = trials.filter((t) => t.response === 'no_response').length;
  const n = trials.length;
  const latencies = trials
    .filter((t) => t.response === 'correct' && t.latencyMs != null)
    .map((t) => t.latencyMs!);

  return {
    targetId: first.targetId,
    sessionId: first.sessionId,
    sessionAt: first.sessionAt,
    phase: first.phase,
    opportunities: n,
    correctIndependent,
    correctPrompted,
    incorrect,
    noResponse,
    pctIndependent: pct(correctIndependent, n),
    pctPrompted: pct(correctPrompted, n),
    meanPromptLevel: n ? mean(trials.map((t) => t.promptIntrusiveness)) : null,
    medianLatencyMs: latencies.length ? median(latencies) : null,
    channel: mode(trials.map((t) => t.channel)),
    setting: mode(trials.map((t) => t.setting)),
    implementerId: mode(trials.map((t) => t.implementerId)),
    probe: trials.every((t) => t.probe === true),
  };
}

/** Agrupa fatos por alvo × sessão, em ordem cronológica. */
export function summarizeByTargetSession(trials: readonly TrialFact[]): TargetSessionSummary[] {
  const groups = new Map<string, TrialFact[]>();
  for (const t of trials) {
    const key = `${t.targetId}::${t.sessionId}`;
    const g = groups.get(key);
    if (g) g.push(t);
    else groups.set(key, [t]);
  }
  return [...groups.values()]
    .map(summarizeTargetSession)
    .sort((a, b) => a.sessionAt.localeCompare(b.sessionAt));
}

/**
 * Índice de generalização: % independente fora do canal de ensino ÷ % no canal de ensino.
 * Só calculado com ao menos duas sondas fora do canal.
 */
export function generalizationIndex(
  summaries: readonly TargetSessionSummary[],
  teachingChannel: Channel,
): number | null {
  const inside = summaries.filter((s) => s.channel === teachingChannel && s.pctIndependent != null);
  const outside = summaries.filter((s) => s.channel !== teachingChannel && s.pctIndependent != null);
  if (outside.length < 2 || inside.length === 0) return null;
  const inPct = mean(inside.slice(-3).map((s) => s.pctIndependent!));
  if (inPct === 0) return null;
  return mean(outside.map((s) => s.pctIndependent!)) / inPct;
}
