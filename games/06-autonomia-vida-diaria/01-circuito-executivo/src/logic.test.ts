import { describe, expect, it } from 'vitest';
import { seededRandom } from '@aprumo/game-sdk';
import {
  correctTrayFor,
  evaluateGoNoGo,
  evaluateSequence,
  fallTimeMs,
  initialCorsi,
  makeSequence,
  nextGravity,
  planCircuit,
  planExecutiveTrials,
  planGoNoGo,
  planRuleShift,
  stationsFrom,
  stepCorsi,
} from './logic';

describe('Circuito Executivo', () => {
  describe('Go / No-Go', () => {
    it('avalia acertos, omissões, alarmes falsos e inibições', () => {
      expect(evaluateGoNoGo('go', true)).toEqual({ outcome: 'hit', isCorrect: true });
      expect(evaluateGoNoGo('go', false)).toEqual({ outcome: 'miss', isCorrect: false });
      expect(evaluateGoNoGo('nogo', true)).toEqual({ outcome: 'false_alarm', isCorrect: false });
      expect(evaluateGoNoGo('nogo', false)).toEqual({ outcome: 'correct_inhibition', isCorrect: true });
    });

    it('sequência ~70/30, começa com go e nunca tem 3 no-go seguidos', () => {
      const seq = planGoNoGo(20, seededRandom(3));
      expect(seq.filter((t) => t.type === 'nogo')).toHaveLength(6);
      expect(seq[0]!.type).toBe('go');
      expect(seq[1]!.type).toBe('go');
      for (let i = 2; i < seq.length; i++) expect(seq[i]!.type === 'nogo' && seq[i - 1]!.type === 'nogo' && seq[i - 2]!.type === 'nogo').toBe(false);
      for (let i = 1; i < seq.length; i++) expect(seq[i]!.lane).not.toBe(seq[i - 1]!.lane);
    });

    it('escada de gravidade e tempo de queda físico', () => {
      expect(nextGravity(500, true)).toBe(540);
      expect(nextGravity(500, false)).toBe(440);
      expect(nextGravity(1400, true)).toBe(1400);
      expect(nextGravity(300, false)).toBe(300);
      expect(fallTimeMs(400, 800)).toBe(1000);
    });
  });

  describe('DCCS', () => {
    it('cartas de conflito: a bandeja certa muda com a regra', () => {
      const card = { color: 'azul' as const, shape: 'engrenagem' as const, border: false };
      expect(correctTrayFor(card, 'color')).toBe(1);
      expect(correctTrayFor(card, 'shape')).toBe(0);
    });

    it('fase cor antes da forma; misto usa a moldura como pista', () => {
      const t = planRuleShift(4, seededRandom(2), true);
      expect(t.map((x) => x.phase)).toEqual(['color', 'color', 'color', 'color', 'shape', 'shape', 'shape', 'shape', 'mixed', 'mixed', 'mixed', 'mixed']);
      for (const x of t.filter((y) => y.phase === 'mixed')) expect(x.activeRule).toBe(x.card.border ? 'shape' : 'color');
      for (const x of t) expect(x.correctTray).toBe(correctTrayFor(x.card, x.activeRule));
    });
  });

  describe('Corsi', () => {
    it('sequências sem repetir luz', () => {
      const s = makeSequence(6, seededRandom(4));
      expect(new Set(s).size).toBe(6);
      expect(evaluateSequence([1, 2], [1])).toEqual({ isCorrect: true, isComplete: false });
      expect(evaluateSequence([1, 2], [1, 3])).toEqual({ isCorrect: false, isComplete: false });
    });

    it('regra clássica: 2 acertos sobem o span, 2 erros no mesmo span encerram', () => {
      let s = initialCorsi(2);
      s = stepCorsi(stepCorsi(s, true), true);
      expect(s).toMatchObject({ span: 3, bestSpan: 2 });
      s = stepCorsi(s, true);
      s = stepCorsi(s, false);
      expect(s.done).toBe(false);
      s = stepCorsi(s, false);
      expect(s).toMatchObject({ done: true, bestSpan: 3 });
    });
  });

  it('plano do circuito respeita params.stations e a quantidade de tentativas', () => {
    const plan = planCircuit({ clinical: { model: 'ABA', targets: [], trialsPerTarget: 4, interleave: false, seed: 1 }, params: { stations: ['workingmemory', 'gonogo'] } });
    expect(plan.stations).toEqual(['gonogo', 'workingmemory']);
    expect(plan.gonogo).toHaveLength(12);
    expect(stationsFrom({ stations: ['xyz'] })).toHaveLength(3);
    expect(planExecutiveTrials('workingmemory')).toHaveLength(3);
  });
});
