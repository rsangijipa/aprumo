import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'agenda-visual',
  version: '1.0.0',
  name: 'Agenda Visual',
  kind: 'support',
  summary: 'Sequência de atividades e primeiro–depois num varal de cartões, com aviso antecipado de transição.',
  clinical: {
    purposes: ['support', 'regulation'],
    models: { ABA: 'support', DENVER: 'support' },
    repertoires: [],
    autoScoring: [],
    therapistScoring: [],
    playLevel: 'functional',
    trialUnit: 'Não se aplica (recurso de apoio).',
    correctResponse: 'Não se aplica.',
    minFieldSize: 1,
    maxFieldSize: 1,
    latencyMaxMs: 1000,
    builtInPrompts: [],
    prerequisites: ['reconhece-pictogramas'],
    ageRangeMonths: [30, 216],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'low' },
    emits: ['SCHEDULE_ITEM_STARTED', 'SCHEDULE_ITEM_COMPLETED'],
  },
};
