import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import { planChefTrials, RECIPE_STEPS } from './logic';

const config: SessionConfig = {
  protocolVersion: PROTOCOL_VERSION,
  runId: 'chef-test',
  appId: 'pequeno-chef',
  appVersion: '1.0.0',
  childDisplayName: 'Davi',
  clinical: {
    model: 'ABA',
    trialsPerTarget: 1,
    interleave: false,
    seed: 77,
    targets: [],
  },
  adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 3 },
  params: {},
};

describe('Pequeno Chef', () => {
  it('planeja 4 passos encadeados da receita', () => {
    const trials = planChefTrials(config);
    expect(trials).toHaveLength(RECIPE_STEPS.length);
    for (let i = 0; i < trials.length; i++) {
      const t = trials[i]!;
      expect(t.stepIndex).toBe(i);
      expect(t.options[t.positionOfTarget]!.stimulusId).toBe(RECIPE_STEPS[i]!.item.stimulusId);
      expect(t.options).toHaveLength(3);
    }
  });

  it('respeita maxChoices da adaptação sensorial', () => {
    const trials = planChefTrials({
      ...config,
      adaptation: { ...config.adaptation, maxChoices: 2 },
    });
    for (const t of trials) {
      expect(t.options).toHaveLength(2);
    }
  });
});
