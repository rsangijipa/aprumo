/**
 * Encadeamento (análise de tarefas). k = quantos passos da cadeia a criança executa.
 * - Reverso: N−k peças já encaixadas; a criança termina as k últimas (reforço natural de completar).
 * - Direto: a criança encaixa as k primeiras; o app completa o resto.
 * - Tarefa total: todas as N peças, dicas só quando necessárias.
 * k avança após `criterion` conclusões independentes seguidas no mesmo k e regride após
 * `regressAfter` falhas seguidas no mesmo k.
 */
import type { TrialResponse } from '@aprumo/protocol';

export type ChainType = 'backward' | 'forward' | 'total';
export const CHAIN_TYPES: readonly ChainType[] = ['backward', 'forward', 'total'];

export interface ChainState {
  type: ChainType;
  n: number;
  k: number;
  /** Conclusões independentes seguidas no k atual. */
  independentStreak: number;
  /** Falhas seguidas no k atual. */
  failStreak: number;
}

export interface ChainRules { criterion: number; regressAfter: number }
export const DEFAULT_RULES: ChainRules = { criterion: 3, regressAfter: 2 };

export type RunOutcome = 'independent' | 'prompted' | 'failed';
export type ChainChange = 'advanced' | 'regressed' | 'held' | 'mastered';

const clampK = (k: number, n: number) => Math.max(1, Math.min(n, Math.round(k)));

export function initChain(type: ChainType, n: number, startK = 1): ChainState {
  const size = Math.max(1, Math.round(n));
  return { type, n: size, k: type === 'total' ? size : clampK(startK, size), independentStreak: 0, failStreak: 0 };
}

/** Índices (ordem da cadeia) que a criança executa nesta rodada. */
export function childSteps(s: ChainState): number[] {
  const all = Array.from({ length: s.n }, (_, i) => i);
  if (s.type === 'backward') return all.slice(s.n - s.k);
  if (s.type === 'forward') return all.slice(0, s.k);
  return all;
}
/** Já encaixadas ao iniciar (reverso). */
export function preplacedSteps(s: ChainState): number[] {
  return s.type === 'backward' ? Array.from({ length: s.n - s.k }, (_, i) => i) : [];
}
/** Completadas pelo app depois da criança (direto). */
export function autoCompleteSteps(s: ChainState): number[] {
  return s.type === 'forward' ? Array.from({ length: s.n - s.k }, (_, i) => s.k + i) : [];
}
/** Posição do passo na cadeia, dado quantas peças a criança já encaixou nesta rodada. */
export function chainStepIndex(s: ChainState, placedByChild: number): number {
  return s.type === 'backward' ? s.n - s.k + placedByChild : placedByChild;
}

/** Falha = algum passo incorreto ou sem resposta; com dica (sem erro) não é independente nem falha. */
export function classifyRun(steps: readonly { response: TrialResponse; promptLevel: string }[]): RunOutcome {
  if (!steps.length || steps.some((s) => s.response !== 'correct')) return 'failed';
  if (steps.some((s) => s.promptLevel !== 'IND')) return 'prompted';
  return 'independent';
}

export function updateChain(s: ChainState, outcome: RunOutcome, rules: ChainRules = DEFAULT_RULES): { state: ChainState; change: ChainChange } {
  if (outcome === 'prompted') return { state: { ...s, independentStreak: 0, failStreak: 0 }, change: 'held' };
  if (outcome === 'failed') {
    const failStreak = s.failStreak + 1;
    if (failStreak >= rules.regressAfter && s.type !== 'total' && s.k > 1) {
      return { state: { ...s, k: s.k - 1, independentStreak: 0, failStreak: 0 }, change: 'regressed' };
    }
    return { state: { ...s, independentStreak: 0, failStreak }, change: 'held' };
  }
  const independentStreak = s.independentStreak + 1;
  if (independentStreak >= rules.criterion) {
    if (s.type !== 'total' && s.k < s.n) return { state: { ...s, k: s.k + 1, independentStreak: 0, failStreak: 0 }, change: 'advanced' };
    return { state: { ...s, independentStreak, failStreak: 0 }, change: 'mastered' };
  }
  return { state: { ...s, independentStreak, failStreak: 0 }, change: 'held' };
}
