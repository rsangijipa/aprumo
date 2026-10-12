import { describe, it, expect } from 'vitest';
import { PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import { INDEPENDENCE_MISSIONS, planMissionTrials } from './logic';

function mockConfig(choices = 3): SessionConfig {
  return {
    protocolVersion: PROTOCOL_VERSION,
    runId: 'test-run',
    appId: 'missao-independencia',
    appVersion: '2.0.0',
    childDisplayName: 'Leo',
    clinical: {
      model: 'ABA',
      targets: [],
      trialsPerTarget: 5,
      interleave: true,
      seed: 123,
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

describe('Missão Independência Logic', () => {
  it('defines 4 comprehensive autonomous life skill missions', () => {
    expect(INDEPENDENCE_MISSIONS.length).toBe(4);
    const ids = INDEPENDENCE_MISSIONS.map((m) => m.id);
    expect(ids).toContain('arrumar-mochila');
    expect(ids).toContain('mercadinho-compras');
    expect(ids).toContain('transporte-itinerario');
    expect(ids).toContain('rotina-matinal');

    for (const m of INDEPENDENCE_MISSIONS) {
      expect(m.steps.length).toBe(5);
      expect(m.title).toBeTruthy();
      expect(m.context).toBeTruthy();
    }
  });

  it('plans trials with counterbalanced positions and non-null target steps', () => {
    const config = mockConfig(3);
    const trials = planMissionTrials(config, 0);

    expect(trials.length).toBe(5);
    for (const t of trials) {
      expect(t.options.length).toBe(3);
      expect(t.options[t.positionOfTarget]).toEqual(t.targetStep);
      expect(t.positionOfTarget).toBeGreaterThanOrEqual(0);
      expect(t.positionOfTarget).toBeLessThan(3);
      expect(t.instruction).toBeTruthy();
    }
  });

  it('guarantees unique options per trial across all missions', () => {
    const config = mockConfig(4);
    for (let mIdx = 0; mIdx < INDEPENDENCE_MISSIONS.length; mIdx++) {
      const trials = planMissionTrials(config, mIdx);
      expect(trials.length).toBe(5);
      for (const t of trials) {
        expect(t.options.length).toBe(4);
        const ids = t.options.map((o) => o.stimulusId);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
      }
    }
  });
});
