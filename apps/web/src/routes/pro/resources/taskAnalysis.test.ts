import { describe, it, expect } from 'vitest';
import {
  calculateIndependencePercentage,
  findTargetStepIndex,
  isTaskFullyIndependent,
  PROMPT_HIERARCHY,
  TASK_PRESETS,
} from './taskAnalysis';

describe('taskAnalysis logic', () => {
  it('correctly calculates independence percentage', () => {
    expect(calculateIndependencePercentage({}, 0)).toBe(0);
    expect(calculateIndependencePercentage({ 0: 'I', 1: 'DV', 2: 'I', 3: 'DG' }, 4)).toBe(50);
    expect(calculateIndependencePercentage({ 0: 'I', 1: 'I', 2: 'I' }, 3)).toBe(100);
    expect(calculateIndependencePercentage({ 0: 'DFP', 1: 'DFT' }, 2)).toBe(0);
  });

  it('determines the teaching target step in forward chaining', () => {
    // In forward chaining, teaching progresses from step 0 upwards
    const scores = { 0: 'I', 1: 'I', 2: 'DV', 3: 'DFT' } as const;
    expect(findTargetStepIndex('forward', scores, 4)).toBe(2);

    const initial = { 0: 'DV', 1: 'DFT' } as const;
    expect(findTargetStepIndex('forward', initial, 2)).toBe(0);
  });

  it('determines the teaching target step in backward chaining', () => {
    // In backward chaining, earlier steps are done by therapist, child learns the last unmastered step
    const scores = { 0: 'DFT', 1: 'DFT', 2: 'DV', 3: 'I' } as const;
    expect(findTargetStepIndex('backward', scores, 4)).toBe(2);

    const initial = { 0: 'DFT', 1: 'DV' } as const;
    expect(findTargetStepIndex('backward', initial, 2)).toBe(1);
  });

  it('evaluates total task mode target', () => {
    expect(findTargetStepIndex('total-task', { 0: 'DV' }, 4)).toBe(-1);
  });

  it('detects 100% task independence correctly', () => {
    expect(isTaskFullyIndependent({ 0: 'I', 1: 'I', 2: 'I' }, 3)).toBe(true);
    expect(isTaskFullyIndependent({ 0: 'I', 1: 'DV', 2: 'I' }, 3)).toBe(false);
    expect(isTaskFullyIndependent({}, 0)).toBe(false);
  });

  it('contains valid task presets with structured steps', () => {
    expect(TASK_PRESETS.length).toBeGreaterThanOrEqual(4);
    for (const preset of TASK_PRESETS) {
      expect(preset.steps.length).toBeGreaterThan(0);
      expect(preset.title).toBeTruthy();
      expect(['forward', 'backward', 'total-task']).toContain(preset.defaultMode);
    }
  });

  it('provides a complete prompt hierarchy with clear codes', () => {
    const codes = PROMPT_HIERARCHY.map((p) => p.code);
    expect(codes).toEqual(['I', 'DV', 'DG', 'DFP', 'DFT']);
  });
});
