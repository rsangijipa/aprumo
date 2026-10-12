import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'danca-do-congelar',
  version: '2.0.0',
  name: 'Dança do Congelar',
  kind: 'game',
  summary: 'Controle inibitório motor com música: dançarino com física de molas, música que para no congela, gelo que racha com toques impulsivos e 4 fases (estátua curta, longa, pegadinha com distrações, gelo ou folha go/no-go).',
  clinical: {
    purposes: ['teaching', 'regulation', 'reinforcer'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['play', 'alternative_behavior'],
    autoScoring: ['play', 'alternative_behavior'],
    therapistScoring: [],
    playLevel: 'functional',
    trialUnit: 'Janela após a pista (floco = congelar; folha = continuar dançando), com graça de 400 ms para reação.',
    correctResponse: 'Floco: nenhum toque após a graça. Folha: continuar dançando (≥ 1 toque) até a música voltar.',
    minFieldSize: 1,
    maxFieldSize: 4,
    latencyMaxMs: 15000,
    builtInPrompts: [
      { code: 'ICE_VISUAL_CUE', afterMs: 800, intrusiveness: 0.2 },
      { code: 'STATUE_PROMPT', afterMs: 2000, intrusiveness: 0.4 },
    ],
    prerequisites: ['ouvinte-basico'],
    ageRangeMonths: [24, 96],
    requiresAdult: false,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
