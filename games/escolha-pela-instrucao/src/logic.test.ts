import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import { planListenerTrials } from './logic';

const stim = (id: string, label = id) => ({ stimulusId: id, label, art: id });

const config: SessionConfig = {
  protocolVersion: PROTOCOL_VERSION, runId: 'r', appId: 'escolha-pela-instrucao', appVersion: '1.0.0', childDisplayName: 'Teo',
  clinical: {
    model: 'ABA', trialsPerTarget: 6, interleave: false, seed: 3,
    targets: [{
      targetId: 't', name: 'bola', phase: 'acquisition', repertoire: 'listener', fieldSize: 3,
      stimulus: stim('bola'), distractors: [stim('carro'), stim('uva'), stim('banana', 'banana')],
      promptHierarchy: [{ code: 'IND', label: 'Ind', intrusiveness: 0 }], scoring: 'auto',
    }],
  },
  adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 3 }, params: {},
};

describe('Escolha pela Instrução', () => {
  it('instrução com contração correta e alvo na posição planejada', () => {
    const trials = planListenerTrials(config);
    expect(trials[0]!.instruction).toBe('Toque na bola');
    for (const t of trials) expect(t.options[t.positionOfTarget]!.stimulusId).toBe('bola');
  });
  it('campo nunca abaixo de 2 nem acima de maxChoices', () => {
    for (const t of planListenerTrials({ ...config, adaptation: { ...config.adaptation, maxChoices: 1 } })) expect(t.options).toHaveLength(2);
  });
});
