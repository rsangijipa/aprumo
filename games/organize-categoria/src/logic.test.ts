import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import { getCategoryForItem, planCategoryTrials } from './logic';

const stim = (id: string, label = id) => ({ stimulusId: id, label, art: id });

const config: SessionConfig = {
  protocolVersion: PROTOCOL_VERSION,
  runId: 'run-test',
  appId: 'organize-categoria',
  appVersion: '1.0.0',
  childDisplayName: 'Bia',
  clinical: {
    model: 'ABA',
    trialsPerTarget: 4,
    interleave: false,
    seed: 42,
    targets: [
      {
        targetId: 't1',
        name: 'maca',
        phase: 'acquisition',
        repertoire: 'matching',
        fieldSize: 3,
        stimulus: stim('maca', 'maçã'),
        distractors: [stim('carro'), stim('cachorro')],
        promptHierarchy: [{ code: 'IND', label: 'Ind', intrusiveness: 0 }],
        scoring: 'auto',
      },
    ],
  },
  adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 3 },
  params: {},
};

describe('Organize por Categoria', () => {
  it('identifica categoria do estímulo corretamente', () => {
    expect(getCategoryForItem('maca').id).toBe('alimentos');
    expect(getCategoryForItem('carro').id).toBe('veículos');
    expect(getCategoryForItem('cachorro').id).toBe('animais');
  });

  it('planeja tentativas com a categoria correta na posição especificada', () => {
    const trials = planCategoryTrials(config);
    expect(trials).toHaveLength(4);
    for (const t of trials) {
      expect(t.boxes[t.positionOfTarget]!.id).toBe('alimentos');
      expect(t.boxes).toHaveLength(3);
    }
  });

  it('respeita maxChoices da adaptação sensorial', () => {
    const trials = planCategoryTrials({
      ...config,
      adaptation: { ...config.adaptation, maxChoices: 2 },
    });
    for (const t of trials) {
      expect(t.boxes).toHaveLength(2);
    }
  });
});
