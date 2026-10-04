import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import { ADL_MISSIONS, planMissionTrials } from './logic';

const config: SessionConfig = {
  protocolVersion: PROTOCOL_VERSION,
  runId: 'adl-test',
  appId: 'missao-independencia',
  appVersion: '1.0.0',
  childDisplayName: 'Mariana',
  clinical: {
    model: 'ABA',
    trialsPerTarget: 1,
    interleave: false,
    seed: 55,
    targets: [],
  },
  adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 3 },
  params: {},
};

describe('Missão Independência', () => {
  it('planeja passos da missão com alvo na posição indicada', () => {
    const trials = planMissionTrials(config, 0);
    const mission = ADL_MISSIONS[0]!;
    expect(trials).toHaveLength(mission.steps.length);
    for (let i = 0; i < trials.length; i++) {
      const t = trials[i]!;
      expect(t.options[t.positionOfTarget]!.id).toBe(mission.steps[i]!.id);
      expect(t.options).toHaveLength(3);
    }
  });

  it('respeita maxChoices de adaptação sensorial', () => {
    const trials = planMissionTrials(
      { ...config, adaptation: { ...config.adaptation, maxChoices: 2 } },
      0,
    );
    for (const t of trials) {
      expect(t.options).toHaveLength(2);
    }
  });
});
