import { describe, it, expect } from 'vitest';
import {
  computeDanceDuration,
  computeFreezeDuration,
  evaluateFreezePerformance,
  getDanceBeatTone,
} from './logic';

describe('danca-do-congelar logic', () => {
  it('computes varying, unpredictable durations for dance and freeze phases', () => {
    const dance1 = computeDanceDuration(0);
    const dance2 = computeDanceDuration(1);
    expect(dance1).toBeGreaterThanOrEqual(5000);
    expect(dance2).toBeGreaterThanOrEqual(5000);
    expect(dance1).not.toBe(dance2);

    const freeze1 = computeFreezeDuration(0);
    const freeze2 = computeFreezeDuration(1);
    expect(freeze1).toBeGreaterThanOrEqual(3500);
    expect(freeze2).toBeGreaterThanOrEqual(3500);
  });

  it('evaluates perfect freeze when impulsiveTaps is 0', () => {
    const res = evaluateFreezePerformance(0, 4000);
    expect(res.passed).toBe(true);
    expect(res.rating).toBe('perfect');
    expect(res.scoreDelta).toBe(100);
  });

  it('evaluates good freeze when impulsiveTaps is 1 or 2', () => {
    const res = evaluateFreezePerformance(2, 4000);
    expect(res.passed).toBe(true);
    expect(res.rating).toBe('good');
  });

  it('evaluates failed/impulsive freeze when impulsiveTaps > 2', () => {
    const res = evaluateFreezePerformance(4, 4000);
    expect(res.passed).toBe(false);
    expect(res.rating).toBe('impulsive');
  });

  it('generates melodic frequencies for dance steps', () => {
    const tone0 = getDanceBeatTone(0);
    const tone1 = getDanceBeatTone(1);
    expect(tone0.freq).toBe(261.63);
    expect(tone1.freq).toBe(293.66);
    expect(tone0.type).toBe('triangle');
  });
});
