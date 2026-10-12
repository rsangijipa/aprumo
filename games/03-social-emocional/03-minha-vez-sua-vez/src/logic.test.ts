import { describe, expect, it } from 'vitest';
import { initialTurns, partnerKindFrom, reduceTurns, remainingMs, turnDetail, turnLabel } from './logic';

describe('Minha Vez / Sua Vez · turnos', () => {
  it('esperar e jogar na vez é resposta correta, com latência e tempo de espera', () => {
    let s = initialTurns(2, 0);
    s = reduceTurns(s, { type: 'PARTNER_PLACE', now: 3000 }).state;
    const r = reduceTurns(s, { type: 'CHILD_TOUCH', now: 4500 });
    expect(r.trial).toMatchObject({ response: 'correct', latencyMs: 1500, waitMs: 3000, offTurnTouches: 0 });
    expect(r.state.whose).toBe('partner');
    expect(r.state.tower).toEqual(['partner', 'child']);
  });

  it('tocar na vez do parceiro conta interrupção e torna a vez seguinte incorreta', () => {
    let s = initialTurns(2, 0);
    const i = reduceTurns(s, { type: 'CHILD_TOUCH', now: 500 });
    expect(i.offTurn).toBe(true);
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

  it('toques fora da vez são contados, não alteram a torre e não tiram a vez da criança', () => {
    let s = initialTurns(1, 0);
    for (const now of [100, 200, 300]) s = reduceTurns(s, { type: 'CHILD_TOUCH', now }).state;
    expect(s.offTurnTouches).toBe(3);
    expect(s.tower).toEqual([]);
    s = reduceTurns(s, { type: 'PARTNER_PLACE', now: 2000 }).state;
    expect(s.whose).toBe('child');
    const r = reduceTurns(s, { type: 'CHILD_TOUCH', now: 2600 });
    expect(r.state.tower).toEqual(['partner', 'child']);
    expect(turnDetail(r.trial!, 'adulto')).toEqual({ waitMs: 2000, offTurnTouches: 3, partner: 'adulto', waitedWithoutTouching: false });
  });

  it('pausa não conta como espera nem como latência', () => {
    let s = initialTurns(1, 0);
    s = reduceTurns(s, { type: 'RESUME', pausedMs: 5000 }).state;
    s = reduceTurns(s, { type: 'PARTNER_PLACE', now: 7000 }).state;
    s = reduceTurns(s, { type: 'RESUME', pausedMs: 1000 }).state;
    const r = reduceTurns(s, { type: 'CHILD_TOUCH', now: 9000 });
    expect(r.trial).toMatchObject({ waitMs: 2000, latencyMs: 1000 });
    expect(remainingMs(10_000, s, 9000)).toBe(9000);
  });

  it('indicador de vez e tipo de parceiro', () => {
    expect(turnLabel({ whose: 'child', done: false })).toBe('Minha vez');
    expect(turnLabel({ whose: 'partner', done: false })).toBe('Sua vez');
    expect(turnLabel({ whose: 'partner', done: true })).toBe('Pronto!');
    expect(partnerKindFrom({})).toBe('adulto');
    expect(partnerKindFrom({ partner: 'colega' })).toBe('colega');
  });
});
