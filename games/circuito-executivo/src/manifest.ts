import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'circuito-executivo',
  version: '1.0.0',
  name: 'Circuito Executivo',
  kind: 'game',
  summary: 'Funções executivas: desafios adaptativos de controle inibitório (Go/No-Go), flexibilidade cognitiva (troca de regra) e memória operacional de trabalho.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['academic'],
    autoScoring: ['academic'],
    therapistScoring: [],
    playLevel: 'constructive',
    trialUnit: 'Desafio neurocognitivo com registro de tempo de reação em milissegundos, comissões, omissões e flexibilidade.',
    correctResponse: 'Inibição intencional de toque no No-Go, resposta ágil no Go, alternância de regra e reprodução correta de sequências.',
    minFieldSize: 1,
    maxFieldSize: 4,
    latencyMaxMs: 30000,
    builtInPrompts: [],
    prerequisites: ['Atenção sustentada básica', 'Discriminação visual de cor e forma'],
    ageRangeMonths: [84, 192],
    requiresAdult: false,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: [
      'SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED',
      'TRIAL_COMPLETED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_COMPLETED',
    ],
  },
};
