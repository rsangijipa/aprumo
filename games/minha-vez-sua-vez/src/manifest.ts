import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'minha-vez-sua-vez',
  version: '1.0.0',
  name: 'Minha Vez, Sua Vez',
  kind: 'game',
  summary: 'Torre construída a quatro mãos no tapete. Um bastão mostra de quem é a vez; esperar também é aprender.',
  clinical: {
    purposes: ['teaching'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['social', 'play'],
    autoScoring: ['social'],
    therapistScoring: ['play'],
    playLevel: 'reciprocal',
    trialUnit: 'Uma vez da criança, precedida pela vez do parceiro.',
    correctResponse: 'Não toca durante a vez do parceiro e coloca o bloco na própria vez em até 10 s.',
    minFieldSize: 1,
    maxFieldSize: 1,
    latencyMaxMs: 10000,
    builtInPrompts: [{ code: 'BASKET_GLOW', afterMs: 5000, intrusiveness: 0.25 }],
    prerequisites: ['tolera-tablet', 'toca-alvo-intencional', 'tolera-adulto-proximo'],
    ageRangeMonths: [30, 120],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'TRIAL_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
