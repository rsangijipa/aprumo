import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'historia-ordem',
  version: '2.0.0',
  name: 'História em Ordem',
  kind: 'game',
  summary: 'Sequenciamento temporal e causalidade: 9 histórias ilustradas de 3, 4 e 5 cenas em escada adaptativa, arrastar ou tocar, correção sem erro (cenas certas travam) e replay narrado da história.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['intraverbal', 'listener', 'academic'],
    autoScoring: ['intraverbal', 'academic'],
    therapistScoring: [],
    playLevel: 'symbolic',
    trialUnit: 'Montagem completa de uma história (3 a 5 cenas) na linha do tempo; só a primeira montagem é pontuada.',
    correctResponse: 'Todas as cenas na ordem cronológica correta na primeira montagem.',
    minFieldSize: 3,
    maxFieldSize: 5,
    latencyMaxMs: 20000,
    builtInPrompts: [{ code: 'NUMBER_HINT', afterMs: 12000, intrusiveness: 0.35 }],
    prerequisites: ['tolera-tablet', 'compreensao-temporal-inicial'],
    ageRangeMonths: [42, 120],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
