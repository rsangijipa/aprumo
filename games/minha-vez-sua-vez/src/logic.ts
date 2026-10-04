/**
 * Lógica de Minha Vez / Sua Vez — motor de TURNOS (não de seleção).
 *  - O parceiro (adulto ou par) abre a rotina, como no modelo de abertura do ESDM.
 *  - Durante a vez do parceiro, toques da criança na própria cesta são "toques fora da vez" (dado):
 *    apenas sinalizados suavemente e contados (detail.offTurnTouches), nunca punidos — o bloco da criança
 *    continua garantido na vez dela.
 *  - O tempo de espera (vez do parceiro) é medido em detail.waitMs; pausas não entram nos tempos.
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
  offTurnTouches: number;
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
  offTurnTouches: number;
  waitMs: number;
}

export function initialTurns(totalChildTurns: number, now: number): TurnState {
  return { whose: 'partner', tower: [], childTurnsScored: 0, totalChildTurns, offTurnTouches: 0, turnStartedAt: now, partnerWaitMs: 0, scored: false, done: false };
}

export type TurnEvent =
  | { type: 'PARTNER_PLACE'; now: number }
  | { type: 'RESUME'; pausedMs: number }
  | { type: 'CHILD_TOUCH'; now: number }
  | { type: 'CHILD_TIMEOUT'; now: number };

export function reduceTurns(s: TurnState, e: TurnEvent): { state: TurnState; trial?: TurnTrial; offTurn?: boolean } {
  if (s.done) return { state: s };

  // Retomada após pausa: o tempo pausado não conta como espera nem como latência.
  if (e.type === 'RESUME') return { state: { ...s, turnStartedAt: s.turnStartedAt + Math.max(0, e.pausedMs) } };

  if (e.type === 'PARTNER_PLACE') {
    if (s.whose !== 'partner') return { state: s };
    return {
      state: { ...s, tower: [...s.tower, 'partner'], whose: 'child', partnerWaitMs: e.now - s.turnStartedAt, turnStartedAt: e.now, scored: false },
    };
  }

  if (e.type === 'CHILD_TOUCH') {
    if (s.whose === 'partner') return { state: { ...s, offTurnTouches: s.offTurnTouches + 1 }, offTurn: true };
    const next: TurnState = {
      ...s,
      tower: [...s.tower, 'child'],
      whose: 'partner',
      turnStartedAt: e.now,
      offTurnTouches: 0,
      childTurnsScored: s.scored ? s.childTurnsScored : s.childTurnsScored + 1,
      scored: false,
    };
    next.done = next.childTurnsScored >= s.totalChildTurns;
    if (s.scored) return { state: next };
    return {
      state: next,
      trial: {
        trialIndex: s.childTurnsScored,
        response: s.offTurnTouches === 0 ? 'correct' : 'incorrect',
        latencyMs: e.now - s.turnStartedAt,
        offTurnTouches: s.offTurnTouches,
        waitMs: s.partnerWaitMs,
      },
    };
  }

  // CHILD_TIMEOUT
  if (s.whose !== 'child' || s.scored) return { state: s };
  const state = { ...s, scored: true, childTurnsScored: s.childTurnsScored + 1 };
  return {
    state,
    trial: { trialIndex: s.childTurnsScored, response: 'no_response', latencyMs: null, offTurnTouches: s.offTurnTouches, waitMs: s.partnerWaitMs },
  };
}

/* ------------------------------------------------------------ parceiro e indicador de vez */

export type PartnerKind = 'adulto' | 'colega';

/** Lê `params.partner` ('adulto' | 'colega'). Padrão: adulto. */
export function partnerKindFrom(params: Record<string, unknown>): PartnerKind {
  return params.partner === 'colega' || params.partner === 'peer' ? 'colega' : 'adulto';
}

/** Rótulo do indicador, do ponto de vista da criança: "Minha vez" / "Sua vez". */
export function turnLabel(s: Pick<TurnState, 'whose' | 'done'>): string {
  if (s.done) return 'Pronto!';
  return s.whose === 'child' ? 'Minha vez' : 'Sua vez';
}

/** Tempo restante de um temporizador da vez, descontando o que já passou (útil na retomada). */
export function remainingMs(totalMs: number, s: Pick<TurnState, 'turnStartedAt'>, now: number): number {
  return Math.max(0, totalMs - (now - s.turnStartedAt));
}

/** Detalhe próprio do jogo para TRIAL_COMPLETED. */
export function turnDetail(t: TurnTrial, partner: PartnerKind): Record<string, unknown> {
  return { waitMs: Math.round(t.waitMs), offTurnTouches: t.offTurnTouches, partner, waitedWithoutTouching: t.offTurnTouches === 0 };
}
