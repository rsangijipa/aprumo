import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'causa-efeito',
  version: '1.0.0',
  name: 'Causa e Efeito',
  kind: 'game',
  summary: 'Intencionalidade e regulação: toques táteis criam estrelas flutuantes e sons pentatônicos calmantes sem frustração.',
  clinical: {
    purposes: ['regulation', 'reinforcer', 'teaching'],
    models: { ABA: 'support', DENVER: 'joint-routine' },
    repertoires: ['play'],
    autoScoring: ['play'],
    therapistScoring: [],
    playLevel: 'exploratory',
    trialUnit: 'Toque intencional na superfície com emissão de resposta audiovisual.',
    correctResponse: 'Toque na tela em qualquer ponto ativo.',
    minFieldSize: 1,
    maxFieldSize: 5,
    latencyMaxMs: 30000,
    builtInPrompts: [{ code: 'GENTLE_PULSE', afterMs: 15000, intrusiveness: 0.1 }],
    prerequisites: [],
    ageRangeMonths: [12, 72],
    requiresAdult: false,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'TRIAL_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
