import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'detetive-das-emocoes',
  version: '1.0.0',
  name: 'Detetive das Emoções',
  kind: 'game',
  summary: 'Cognição social e teoria da mente: analise pistas faciais, postura corporal e contexto situacional para desvendar sentimentos e intenções sem infantilização.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['social'],
    autoScoring: ['social'],
    therapistScoring: [],
    playLevel: 'cooperative',
    trialUnit: 'Cenário social apresentado com pistas investigativas progressivas e alternativas emocionais plausíveis.',
    correctResponse: 'A criança ou adolescente seleciona a emoção correta ou nuance emocional plausível baseando-se nas pistas.',
    minFieldSize: 2,
    maxFieldSize: 4,
    latencyMaxMs: 45000,
    builtInPrompts: [],
    prerequisites: ['Reconhecimento de expressões básicas', 'Compreensão de situações sociais simples'],
    ageRangeMonths: [72, 192],
    requiresAdult: false,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: [
      'SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED',
      'TRIAL_COMPLETED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_COMPLETED',
    ],
  },
};
