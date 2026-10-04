import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import { isMatch, planMemoryBoard } from './logic';

const config: SessionConfig = {
  protocolVersion: PROTOCOL_VERSION,
  runId: 'mem-test',
  appId: 'memoria-bichos',
  appVersion: '1.0.0',
  childDisplayName: 'Leo',
  clinical: {
    model: 'ABA',
    trialsPerTarget: 1,
    interleave: false,
    seed: 123,
    targets: [],
  },
  adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 4 },
  params: {},
};

describe('Memória dos Bichos', () => {
  it('gera 4 cartas quando maxChoices <= 4', () => {
    const cards = planMemoryBoard(config);
    expect(cards).toHaveLength(4);
  });

  it('gera 6 cartas quando maxChoices > 4', () => {
    const cards = planMemoryBoard({
      ...config,
      adaptation: { ...config.adaptation, maxChoices: 6 },
    });
    expect(cards).toHaveLength(6);
  });

  it('verifica pares corretamente', () => {
    const cardA1 = { id: 'gato-1', pairKey: 'gato', art: 'gato', label: 'Gato' };
    const cardA2 = { id: 'gato-2', pairKey: 'gato', art: 'gato', label: 'Gato' };
    const cardB1 = { id: 'peixe-1', pairKey: 'peixe', art: 'peixe', label: 'Peixe' };

    expect(isMatch(cardA1, cardA2)).toBe(true);
    expect(isMatch(cardA1, cardB1)).toBe(false);
    expect(isMatch(cardA1, cardA1)).toBe(false);
  });
});
