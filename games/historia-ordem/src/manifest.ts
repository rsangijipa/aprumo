import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'historia-ordem',
  version: '1.0.0',
  name: 'História em Ordem',
  kind: 'game',
  summary: 'Sequenciamento temporal e causalidade: a criança organiza 3 etapas cronológicas de uma rotina ou evento.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['intraverbal', 'listener', 'academic'],
    autoScoring: ['intraverbal', 'academic'],
    therapistScoring: [],
    playLevel: 'symbolic',
    trialUnit: 'Ordenação sequencial de 3 cartões de causa e efeito temporal.',
    correctResponse: 'Toque ou seleção dos cartões na ordem cronológica correta (1º, 2º e 3º).',
    minFieldSize: 3,
    maxFieldSize: 3,
    latencyMaxMs: 20000,
    builtInPrompts: [{ code: 'NUMBER_HINT', afterMs: 12000, intrusiveness: 0.35 }],
    prerequisites: ['tolera-tablet', 'compreensao-temporal-inicial'],
    ageRangeMonths: [42, 120],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'TRIAL_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
