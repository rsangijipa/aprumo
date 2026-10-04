import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import { planTrials } from './logic';

const stim = (id: string) => ({ stimulusId: id, label: id, art: id });
const config = (over: Partial<SessionConfig['clinical']> = {}, maxChoices = 3): SessionConfig => ({
  protocolVersion: PROTOCOL_VERSION,
  runId: 'run-1',
  appId: 'encontre-o-igual',
  appVersion: '1.0.0',
  childDisplayName: 'Teo',
  clinical: {
    model: 'ABA',
    trialsPerTarget: 9,
    interleave: true,
    seed: 11,
    targets: [
      { targetId: 'a', name: 'bola', phase: 'acquisition', repertoire: 'matching', fieldSize: 3, stimulus: stim('bola'), distractors: [stim('copo'), stim('livro'), stim('carro')], promptHierarchy: [{ code: 'IND', label: 'Ind', intrusiveness: 0 }], scoring: 'auto' },
      { targetId: 'b', name: 'copo', phase: 'acquisition', repertoire: 'matching', fieldSize: 3, stimulus: stim('copo'), distractors: [stim('bola'), stim('flor')], promptHierarchy: [{ code: 'IND', label: 'Ind', intrusiveness: 0 }], scoring: 'auto' },
    ],
    ...over,
  },
  adaptation: { ...DEFAULT_ADAPTATION, maxChoices },
  params: {},
});

describe('Encontre o Igual · planTrials', () => {
  it('o correto está sempre na posição declarada e o campo respeita maxChoices', () => {
    const trials = planTrials(config({}, 2));
    expect(trials).toHaveLength(18);
    for (const t of trials) {
      expect(t.options).toHaveLength(2);
      expect(t.options[t.positionOfTarget]!.stimulusId).toBe(t.target.stimulus.stimulusId);
      expect(new Set(t.options.map((o) => o.stimulusId)).size).toBe(t.options.length);
    }
  });

  it('posições equilibradas por alvo', () => {
    const trials = planTrials(config());
    const a = trials.filter((t) => t.target.targetId === 'a').map((t) => t.positionOfTarget);
    expect([0, 1, 2].map((p) => a.filter((x) => x === p).length)).toEqual([3, 3, 3]);
  });

  it('reprodutível pela semente', () => {
    expect(planTrials(config()).map((t) => t.options.map((o) => o.stimulusId).join())).toEqual(
      planTrials(config()).map((t) => t.options.map((o) => o.stimulusId).join()),
    );
  });
});
