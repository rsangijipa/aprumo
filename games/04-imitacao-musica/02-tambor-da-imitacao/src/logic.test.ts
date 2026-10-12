import { describe, it, expect } from 'vitest';
import {
  evaluateInputSequence,
  getPatternForLevel,
  getPercussionParams,
  checkProgression,
  type DrumZone,
} from './logic';

describe('tambor-da-imitacao logic', () => {
  it('returns valid patterns for level 1, 2 and 3', () => {
    const p1 = getPatternForLevel(1, 0);
    expect(p1.length).toBe(1);

    const p2 = getPatternForLevel(2, 0);
    expect(p2.length).toBe(2);

    const p3 = getPatternForLevel(3, 0);
    expect(p3.length).toBe(3);
  });

  it('correctly evaluates partial and complete matching sequences', () => {
    const pattern: DrumZone[] = ['center', 'rim', 'center'];

    // Empty input
    const evalEmpty = evaluateInputSequence(pattern, []);
    expect(evalEmpty.matchSoFar).toBe(true);
    expect(evalEmpty.isComplete).toBe(false);
    expect(evalEmpty.isError).toBe(false);

    // Partial correct hit 1
    const eval1 = evaluateInputSequence(pattern, ['center']);
    expect(eval1.matchSoFar).toBe(true);
    expect(eval1.isComplete).toBe(false);
    expect(eval1.isError).toBe(false);
    expect(eval1.matchedCount).toBe(1);

    // Partial correct hit 2
    const eval2 = evaluateInputSequence(pattern, ['center', 'rim']);
    expect(eval2.matchSoFar).toBe(true);
    expect(eval2.isComplete).toBe(false);
    expect(eval2.matchedCount).toBe(2);

    // Full correct sequence
    const evalFull = evaluateInputSequence(pattern, ['center', 'rim', 'center']);
    expect(evalFull.matchSoFar).toBe(true);
    expect(evalFull.isComplete).toBe(true);
    expect(evalFull.isError).toBe(false);
    expect(evalFull.matchedCount).toBe(3);
  });

  it('correctly detects an error hit in sequence', () => {
    const pattern: DrumZone[] = ['center', 'rim'];

    const evalWrong = evaluateInputSequence(pattern, ['rim']);
    expect(evalWrong.matchSoFar).toBe(false);
    expect(evalWrong.isError).toBe(true);
    expect(evalWrong.isComplete).toBe(false);
  });

  it('generates distinct sound synthesis parameters for center vs rim', () => {
    const centerSound = getPercussionParams('center');
    const rimSound = getPercussionParams('rim');

    expect(centerSound.baseFreq).toBeLessThan(rimSound.baseFreq);
    expect(centerSound.dur).toBeGreaterThan(rimSound.dur);
    expect(centerSound.type).toBe('sine');
    expect(rimSound.type).toBe('triangle');
  });

  it('handles phase progression criteria for Denver reciprocity and imitation mastery', () => {
    expect(checkProgression('reciprocity', 2, 0).canAdvancePhase).toBe(false);
    expect(checkProgression('reciprocity', 3, 0).canAdvancePhase).toBe(true);

    expect(checkProgression('imitation', 0, 5).hasFinished).toBe(false);
    expect(checkProgression('imitation', 0, 8).hasFinished).toBe(true);
  });
});
