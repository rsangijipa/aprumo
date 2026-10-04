import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'memoria-bichos',
  version: '1.0.0',
  name: 'Memória dos Bichos',
  kind: 'game',
  summary: 'Memória de trabalho visual e pareamento diferido: a criança vira cartas para encontrar os pares de bichinhos.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['matching', 'play'],
    autoScoring: ['matching'],
    therapistScoring: [],
    playLevel: 'constructive',
    trialUnit: 'Busca e emparelhamento de cartas idênticas em grid de memória.',
    correctResponse: 'Revelação consecutiva de dois cartões idênticos.',
    minFieldSize: 4,
    maxFieldSize: 6,
    latencyMaxMs: 15000,
    builtInPrompts: [{ code: 'PEEK', afterMs: 10000, intrusiveness: 0.25 }],
    prerequisites: ['tolera-tablet', 'pareamento-identicos-imediato'],
    ageRangeMonths: [36, 108],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'TRIAL_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
