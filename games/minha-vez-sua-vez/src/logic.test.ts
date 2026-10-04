import { describe, expect, it } from 'vitest';
import { initialTurns, reduceTurns } from './logic';

describe('Minha Vez / Sua Vez · turnos', () => {
  it('esperar e jogar na vez é resposta correta, com latência e tempo de espera', () => {
    let s = initialTurns(2, 0);
    s = reduceTurns(s, { type: 'PARTNER_PLACE', now: 3000 }).state;
    const r = reduceTurns(s, { type: 'CHILD_TOUCH', now: 4500 });
    expect(r.trial).toMatchObject({ response: 'correct', latencyMs: 1500, waitMs: 3000, interruptions: 0 });
    expect(r.state.whose).toBe('partner');
    expect(r.state.tower).toEqual(['partner', 'child']);
  });

  it('tocar na vez do parceiro conta interrupção e torna a vez seguinte incorreta', () => {
    let s = initialTurns(2, 0);
    const i = reduceTurns(s, { type: 'CHILD_TOUCH', now: 500 });
    expect(i.interrupted).toBe(true);
    expect(i.state.tower).toHaveLength(0);
    s = reduceTurns(i.state, { type: 'PARTNER_PLACE', now: 1000 }).state;
    expect(reduceTurns(s, { type: 'CHILD_TOUCH', now: 1800 }).trial?.response).toBe('incorrect');
  });

  it('sem resposta pontua uma vez; o bloco colocado depois não gera nova tentativa', () => {
    let s = initialTurns(1, 0);
    s = reduceTurns(s, { type: 'PARTNER_PLACE', now: 100 }).state;
    const t = reduceTurns(s, { type: 'CHILD_TIMEOUT', now: 10_100 });
    expect(t.trial?.response).toBe('no_response');
    const late = reduceTurns(t.state, { type: 'CHILD_TOUCH', now: 12_000 });
    expect(late.trial).toBeUndefined();
    expect(late.state.done).toBe(true);
  });
});
