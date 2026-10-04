import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'missao-independencia',
  version: '1.0.0',
  name: 'Missão Independência',
  kind: 'game',
  summary: 'Autonomia em AVDs: a criança pratica a sequência de tarefas de vida diária (lavar mãos, escovar dentes, calçar sapatos).',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['adl', 'imitation'],
    autoScoring: ['adl'],
    therapistScoring: [],
    playLevel: 'functional',
    trialUnit: 'Resolução da etapa sequencial de rotina de vida diária (AVD).',
    correctResponse: 'Identificação e toque na ação subsequente correta da rotina.',
    minFieldSize: 2,
    maxFieldSize: 3,
    latencyMaxMs: 15000,
    builtInPrompts: [{ code: 'ARROW', afterMs: 8000, intrusiveness: 0.3 }],
    prerequisites: ['tolera-tablet', 'compreensao-rotina-basica'],
    ageRangeMonths: [36, 120],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'TRIAL_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
