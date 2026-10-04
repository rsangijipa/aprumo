import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'quadro-de-fichas',
  version: '1.0.0',
  name: 'Quadro de Fichas',
  kind: 'support',
  summary: 'Economia de fichas com fichas do tema preferido; o reforçador de troca é escolhido antes e fica visível.',
  clinical: {
    purposes: ['support', 'reinforcer'],
    models: { ABA: 'support', DENVER: 'not-indicated' },
    repertoires: [],
    autoScoring: [],
    therapistScoring: [],
    playLevel: 'functional',
    trialUnit: 'Não se aplica (recurso de apoio).',
    correctResponse: 'Não se aplica.',
    minFieldSize: 1,
    maxFieldSize: 1,
    latencyMaxMs: 1000,
    builtInPrompts: [],
    prerequisites: ['reforcador-de-troca-identificado'],
    ageRangeMonths: [30, 216],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'low' },
    emits: ['TOKEN_DELIVERED', 'BOARD_COMPLETED', 'EXCHANGE_STARTED', 'EXCHANGE_ENDED'],
  },
};
