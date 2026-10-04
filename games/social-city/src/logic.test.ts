import { describe, it, expect } from 'vitest';
import { PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import { SOCIAL_SCENARIOS, planSocialCityTrials } from './logic';

function mockConfig(choices = 4): SessionConfig {
  return {
    protocolVersion: PROTOCOL_VERSION,
    runId: 'test-social-city',
    appId: 'social-city',
    appVersion: '1.0.0',
    childDisplayName: 'Alex',
    clinical: {
      model: 'ABA',
      targets: [],
      trialsPerTarget: 5,
      interleave: true,
      seed: 777,
    },
    adaptation: {
      motion: 'full',
      sound: 'normal',
      feedback: 'subtle',
      palette: 'calm',
      maxChoices: choices,
      touchScale: 1,
      builtInPromptAfterMs: 10000,
      screenBudgetSec: 900,
    },
    params: {},
  };
}

describe('Social City 3D Logic', () => {
  it('defines structured real-world adolescent social scenarios', () => {
    expect(SOCIAL_SCENARIOS.length).toBeGreaterThanOrEqual(4);
    for (const sc of SOCIAL_SCENARIOS) {
      expect(sc.id).toBeTruthy();
      expect(sc.locationName).toBeTruthy();
      expect(sc.position3D.length).toBe(3);
      expect(sc.npc.name).toBeTruthy();
      expect(sc.npcDialogue).toBeTruthy();
      expect(sc.choices.length).toBe(4);

      // Exactly one optimal choice per scenario
      const optimal = sc.choices.filter((c) => c.isOptimal);
      expect(optimal.length).toBe(1);
      expect(optimal[0]!.style).toBe('assertive');
      expect(optimal[0]!.score).toBe(100);
      expect(optimal[0]!.clinicalFeedback).toBeTruthy();
    }
  });

  it('plans trials with counterbalanced positions and non-null target choice', () => {
    const config = mockConfig(3);
    const trials = planSocialCityTrials(config);

    expect(trials.length).toBe(SOCIAL_SCENARIOS.length);
    for (const t of trials) {
      expect(t.options.length).toBe(3);
      expect(t.options[t.positionOfTarget]).toEqual(t.targetChoice);
      expect(t.positionOfTarget).toBeGreaterThanOrEqual(0);
      expect(t.positionOfTarget).toBeLessThan(3);
      expect(t.targetChoice.isOptimal).toBe(true);
    }
  });

  it('supports 4 options when configured', () => {
    const config = mockConfig(4);
    const trials = planSocialCityTrials(config);

    for (const t of trials) {
      expect(t.options.length).toBe(4);
      expect(t.options[t.positionOfTarget]!.isOptimal).toBe(true);
    }
  });
});
