import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import { planStoryTrials, STORIES } from './logic';

const config: SessionConfig = {
  protocolVersion: PROTOCOL_VERSION,
  runId: 'hist-test',
  appId: 'historia-ordem',
  appVersion: '1.0.0',
  childDisplayName: 'Ana',
  clinical: {
    model: 'ABA',
    trialsPerTarget: 1,
    interleave: false,
    seed: 99,
    targets: [],
  },
  adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 3 },
  params: {},
};

describe('História em Ordem', () => {
  it('planeja histórias com 3 passos ordenáveis', () => {
    const trials = planStoryTrials(config);
    expect(trials).toHaveLength(STORIES.length);
    for (const t of trials) {
      expect(t.story.steps).toHaveLength(3);
      expect(t.shuffledSteps).toHaveLength(3);
    }
  });

  it('mantém integridade dos passos de cada história', () => {
    const trials = planStoryTrials(config);
    const story1 = trials[0]!;
    const stepNums = story1.shuffledSteps.map((s) => s.stepNumber).sort();
    expect(stepNums).toEqual([1, 2, 3]);
  });
});
