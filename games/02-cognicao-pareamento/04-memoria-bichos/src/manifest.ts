import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'memoria-bichos',
  version: '2.0.0',
  name: 'Memória dos Bichos',
  kind: 'game',
  summary: 'Memória de trabalho visual e pareamento diferido: fases de 2 a 6 pares com 12 bichos ilustrados, espiada inicial (ensino sem erro), dica PEEK e registro de posição, revisitas e erros com par já visto.',
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
    maxFieldSize: 12,
    latencyMaxMs: 15000,
    builtInPrompts: [{ code: 'PEEK', afterMs: 10000, intrusiveness: 0.25 }],
    prerequisites: ['tolera-tablet', 'pareamento-identicos-imediato'],
    ageRangeMonths: [36, 108],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
