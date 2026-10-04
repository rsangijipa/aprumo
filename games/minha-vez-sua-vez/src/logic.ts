/**
 * Lógica de Minha Vez / Sua Vez — motor de TURNOS (não de seleção).
 *  - O parceiro (adulto ou par) abre a rotina, como no modelo de abertura do ESDM.
 *  - Durante a vez do parceiro, toques da criança na própria cesta são "interrupções" (dado), nunca punição.
 *  - Cada vez da criança é uma tentativa: correta se esperou E jogou na sua vez dentro da latência.
 *  - Sem resposta na vez da criança: a tentativa é registrada como sem resposta e a vez continua aberta
 *    (o adulto pode ajudar); o bloco colocado depois não gera nova pontuação.
 */
import type { TrialResponse } from '@aprumo/protocol';

export type Side = 'child' | 'partner';

export interface TurnState {
  whose: Side;
  tower: Side[];
  childTurnsScored: number;
  totalChildTurns: number;
  interruptions: number;
  turnStartedAt: number;
  partnerWaitMs: number;
  /** A vez atual da criança já foi pontuada (ex.: sem resposta)? */
  scored: boolean;
  done: boolean;
}

export interface TurnTrial {
  trialIndex: number;
  response: TrialResponse;
  latencyMs: number | null;
  interruptions: number;
  waitMs: number;
}

export function initialTurns(totalChildTurns: number, now: number): TurnState {
  return { whose: 'partner', tower: [], childTurnsScored: 0, totalChildTurns, interruptions: 0, turnStartedAt: now, partnerWaitMs: 0, scored: false, done: false };
}

export type TurnEvent =
  | { type: 'PARTNER_PLACE'; now: number }
  | { type: 'CHILD_TOUCH'; now: number }
  | { type: 'CHILD_TIMEOUT'; now: number };

export function reduceTurns(s: TurnState, e: TurnEvent): { state: TurnState; trial?: TurnTrial; interrupted?: boolean } {
  if (s.done) return { state: s };

  if (e.type === 'PARTNER_PLACE') {
    if (s.whose !== 'partner') return { state: s };
    return {
      state: { ...s, tower: [...s.tower, 'partner'], whose: 'child', partnerWaitMs: e.now - s.turnStartedAt, turnStartedAt: e.now, scored: false },
    };
  }

  if (e.type === 'CHILD_TOUCH') {
    if (s.whose === 'partner') return { state: { ...s, interruptions: s.interruptions + 1 }, interrupted: true };
    const next: TurnState = {
      ...s,
      tower: [...s.tower, 'child'],
      whose: 'partner',
      turnStartedAt: e.now,
      interruptions: 0,
      childTurnsScored: s.scored ? s.childTurnsScored : s.childTurnsScored + 1,
      scored: false,
    };
    next.done = next.childTurnsScored >= s.totalChildTurns;
    if (s.scored) return { state: next };
    return {
      state: next,
      trial: {
        trialIndex: s.childTurnsScored,
        response: s.interruptions === 0 ? 'correct' : 'incorrect',
        latencyMs: e.now - s.turnStartedAt,
        interruptions: s.interruptions,
        waitMs: s.partnerWaitMs,
      },
    };
  }

  // CHILD_TIMEOUT
  if (s.whose !== 'child' || s.scored) return { state: s };
  const state = { ...s, scored: true, childTurnsScored: s.childTurnsScored + 1 };
  return {
    state,
    trial: { trialIndex: s.childTurnsScored, response: 'no_response', latencyMs: null, interruptions: s.interruptions, waitMs: s.partnerWaitMs },
  };
}
