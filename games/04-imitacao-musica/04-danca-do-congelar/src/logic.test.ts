import { describe, expect, it } from 'vitest';
import {
  classifyTaps,
  computeDanceDuration,
  computeFreezeDuration,
  DANCE_LEVELS,
  evaluateFreezePerformance,
  evaluateGoWindow,
  getDanceBeatTone,
  GRACE_MS,
  planRounds,
  startLevelFrom,
  stepMs,
} from './logic';

describe('Dança do Congelar', () => {
  it('distribui as rodadas pelas 4 fases, em ordem', () => {
    const plan = planRounds(8, 1);
    expect(plan.map((r) => r.level)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
    expect(planRounds(6, 1, 2).every((r) => r.level >= 2)).toBe(true);
  });

  it('durações ficam dentro das faixas da fase e são imprevisíveis', () => {
    const plan = planRounds(16, 9);
    for (const r of plan) {
      const L = DANCE_LEVELS[r.level]!;
      expect(r.danceMs).toBeGreaterThanOrEqual(L.danceMs[0]);
      expect(r.danceMs).toBeLessThanOrEqual(L.danceMs[1]);
      expect(r.windowMs).toBeGreaterThanOrEqual(L.windowMs[0]);
      expect(r.windowMs).toBeLessThanOrEqual(L.windowMs[1]);
    }
    expect(new Set(plan.map((r) => r.danceMs)).size).toBeGreaterThan(8);
  });

  it('pistas "go" só existem na última fase e nunca duas seguidas', () => {
    const plan = planRounds(40, 3);
    expect(plan.filter((r) => r.level < 3).every((r) => r.cue === 'freeze')).toBe(true);
    expect(plan.some((r) => r.cue === 'go')).toBe(true);
    for (let i = 1; i < plan.length; i++) expect(plan[i]!.cue === 'go' && plan[i - 1]!.cue === 'go').toBe(false);
  });

  it('distrações aparecem dentro da janela nas fases com pegadinha', () => {
    for (const r of planRounds(12, 5)) {
      if (!DANCE_LEVELS[r.level]!.distractors) expect(r.distractorAt).toEqual([]);
      else for (const t of r.distractorAt) expect(t).toBeLessThan(r.windowMs);
    }
  });

  it('só a estátua perfeita conta como acerto; mensagens continuam acolhedoras', () => {
    expect(evaluateFreezePerformance(0, 3000)).toMatchObject({ passed: true, rating: 'perfect' });
    expect(evaluateFreezePerformance(2, 3000)).toMatchObject({ passed: false, rating: 'good' });
    expect(evaluateFreezePerformance(5, 3000)).toMatchObject({ passed: false, rating: 'impulsive' });
    expect(evaluateGoWindow(3).passed).toBe(true);
    expect(evaluateGoWindow(0).passed).toBe(false);
  });

  it('toques na graça de reação não contam como impulso', () => {
    expect(classifyTaps([100, 300])).toEqual({ impulsive: 0, firstImpulsiveMs: null });
    expect(classifyTaps([100, GRACE_MS + 50, 2000])).toEqual({ impulsive: 2, firstImpulsiveMs: GRACE_MS + 50 });
  });

  it('música: melodia pentatônica, passo pelo BPM e API legada', () => {
    expect(getDanceBeatTone(0).freq).toBeCloseTo(261.63);
    expect(stepMs(120)).toBe(250);
    expect(computeDanceDuration(1)).toBe(7500);
    expect(computeFreezeDuration(2)).toBe(3500);
    expect(startLevelFrom({ startLevel: 7 })).toBe(3);
  });
});
