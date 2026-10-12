import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'par-perfeito',
  version: '1.0.0',
  name: 'Par Perfeito',
  kind: 'game',
  summary: 'Programa estruturado de pareamento idêntico ABA com máquina de estados finitos (XState), suporte a ponte física-digital e esvanecimento gradual de ajuda.',
  clinical: {
    purposes: ['teaching', 'reinforcer', 'regulation'],
    models: {"ABA":"trial-based","DENVER":"support"},
    repertoires: ["matching"],
    autoScoring: ["matching"],
    therapistScoring: [],
    playLevel: 'constructive',
    trialUnit: 'Ciclo interativo estruturado com feedback comportamental e telemetria.',
    correctResponse: 'Resposta adaptativa ou comunicação intencional correspondente ao objetivo do ensaio.',
    minFieldSize: 1,
    maxFieldSize: 4,
    latencyMaxMs: 15000,
    builtInPrompts: [
      { code: 'HINT_HIGHLIGHT', afterMs: 5000, intrusiveness: 0.3 },
      { code: 'AUDIO_PROMPT', afterMs: 10000, intrusiveness: 0.6 }
    ],
    prerequisites: [],
    ageRangeMonths: [24,96],
    requiresAdult: false,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED']
  }
};
