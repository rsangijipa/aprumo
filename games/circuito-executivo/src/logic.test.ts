import { describe, it, expect } from 'vitest';
import {
  evaluateGoNoGo,
  evaluateSequence,
  planExecutiveTrials,
  GONOGO_PRESETS,
  RULE_SHIFT_PRESETS,
  MEMORY_PRESETS,
} from './logic';

describe('Circuito Executivo — logic', () => {
  describe('Go / No-Go', () => {
    it('evaluates hits and misses on Go trials', () => {
      expect(evaluateGoNoGo('go', true)).toEqual({ outcome: 'hit', isCorrect: true });
      expect(evaluateGoNoGo('go', false)).toEqual({ outcome: 'miss', isCorrect: false });
    });

    it('evaluates false alarms and correct inhibitions on No-Go trials', () => {
      expect(evaluateGoNoGo('nogo', true)).toEqual({ outcome: 'false_alarm', isCorrect: false });
      expect(evaluateGoNoGo('nogo', false)).toEqual({ outcome: 'correct_inhibition', isCorrect: true });
    });
  });

  describe('Working Memory Sequence', () => {
    it('evaluates step-by-step sequence input', () => {
      const expected = [0, 2, 1];
      expect(evaluateSequence(expected, [0])).toEqual({ isCorrect: true, isComplete: false });
      expect(evaluateSequence(expected, [0, 2])).toEqual({ isCorrect: true, isComplete: false });
      expect(evaluateSequence(expected, [0, 2, 1])).toEqual({ isCorrect: true, isComplete: true });
      expect(evaluateSequence(expected, [0, 3])).toEqual({ isCorrect: false, isComplete: false });
    });
  });

  describe('Trial Planning', () => {
    it('plans presets for each challenge type', () => {
      expect(planExecutiveTrials('gonogo')).toEqual(GONOGO_PRESETS);
      expect(planExecutiveTrials('ruleshift')).toEqual(RULE_SHIFT_PRESETS);
      expect(planExecutiveTrials('workingmemory')).toEqual(MEMORY_PRESETS);
    });
  });
});
