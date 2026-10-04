import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'organize-categoria',
  version: '1.0.0',
  name: 'Organize por Categoria',
  kind: 'game',
  summary: 'Categorização e RFFC: a criança classifica o estímulo na caixa temática correta (alimentos, animais, veículos ou roupas).',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['matching', 'listener', 'academic'],
    autoScoring: ['matching', 'listener'],
    therapistScoring: [],
    playLevel: 'constructive',
    trialUnit: 'Classificação do estímulo na caixa da sua categoria funcional.',
    correctResponse: 'Toque na caixa da categoria correta em até 10 s.',
    minFieldSize: 2,
    maxFieldSize: 4,
    latencyMaxMs: 10000,
    builtInPrompts: [{ code: 'HIGHLIGHT', afterMs: 7000, intrusiveness: 0.3 }],
    prerequisites: ['tolera-tablet', 'discrimina-categorias-basicas'],
    ageRangeMonths: [36, 120],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'TRIAL_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
