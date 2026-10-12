import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'espelho-magico',
  version: '1.0.0',
  name: 'Espelho Mágico',
  kind: 'game',
  summary: 'Imitação motora: um personagem no espelho demonstra ações (palmas, braços, tambor, blocos) e o adulto registra a ajuda usada.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['imitation'],
    autoScoring: [],
    therapistScoring: ['imitation'],
    playLevel: 'functional',
    trialUnit: 'Demonstração animada de uma ação motora seguida do registro do adulto.',
    correctResponse: 'A criança reproduz a ação demonstrada pelo modelo (motora grossa, fina ou com objeto).',
    minFieldSize: 1,
    maxFieldSize: 1,
    latencyMaxMs: 60000,
    builtInPrompts: [],
    prerequisites: ['Atenção ao modelo por alguns segundos', 'Tolera ajuda física leve'],
    ageRangeMonths: [24, 96],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: [
      'SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'PROMPT_USED',
      'TRIAL_COMPLETED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_COMPLETED',
    ],
  },
};
