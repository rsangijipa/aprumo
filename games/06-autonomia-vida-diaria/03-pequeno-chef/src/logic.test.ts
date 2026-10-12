import { describe, it, expect } from 'vitest';
import { PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import { CHEF_RECIPES, planChefTrials } from './logic';

function mockConfig(choices = 3): SessionConfig {
  return {
    protocolVersion: PROTOCOL_VERSION,
    runId: 'test-run',
    appId: 'pequeno-chef',
    appVersion: '2.0.0',
    childDisplayName: 'Bia',
    clinical: {
      model: 'ABA',
      targets: [],
      trialsPerTarget: 5,
      interleave: true,
      seed: 42,
    },
    adaptation: {
      motion: 'full',
      sound: 'normal',
      feedback: 'subtle',
      palette: 'calm',
      maxChoices: choices,
      touchScale: 1,
      builtInPromptAfterMs: 8000,
      screenBudgetSec: 600,
    },
    params: {},
  };
}

describe('Pequeno Chef Logic', () => {
  it('defines 4 structured clinical recipes', () => {
    expect(CHEF_RECIPES.length).toBe(4);
    const ids = CHEF_RECIPES.map((r) => r.id);
    expect(ids).toContain('salada-frutas');
    expect(ids).toContain('sanduiche');
    expect(ids).toContain('mini-pizza');
    expect(ids).toContain('vitamina-suco');

    for (const r of CHEF_RECIPES) {
      expect(r.steps.length).toBe(5);
      expect(r.title).toBeTruthy();
      expect(r.vessel).toBeTruthy();
    }
  });

  it('plans trials respecting field size and target counterbalancing', () => {
    const config = mockConfig(3);
    const trials = planChefTrials(config, 0);

    expect(trials.length).toBe(5);
    for (const t of trials) {
      expect(t.options.length).toBe(3);
      expect(t.options[t.positionOfTarget]).toEqual(t.targetItem);
      expect(t.positionOfTarget).toBeGreaterThanOrEqual(0);
      expect(t.positionOfTarget).toBeLessThan(3);
      expect(t.instruction).toBeTruthy();
    }
  });

  it('plans trials for all recipes without target collisions in distractors', () => {
    const config = mockConfig(4);
    for (let rIdx = 0; rIdx < CHEF_RECIPES.length; rIdx++) {
      const trials = planChefTrials(config, rIdx);
      expect(trials.length).toBe(5);
      for (const t of trials) {
        expect(t.options.length).toBe(4);
        // Distractors do not contain target stimulusId
        const otherOptions = t.options.filter((_, idx) => idx !== t.positionOfTarget);
        expect(otherOptions.some((o) => o.stimulusId === t.targetItem.stimulusId)).toBe(false);
      }
    }
  });
});
