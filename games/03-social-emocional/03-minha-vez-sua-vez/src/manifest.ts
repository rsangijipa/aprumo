import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'minha-vez-sua-vez',
  version: '1.1.0',
  name: 'Minha Vez, Sua Vez',
  kind: 'game',
  summary: 'Torre construída a quatro mãos no tapete com um parceiro (adulto ou colega). O indicador mostra “Minha vez” / “Sua vez”; o tempo de espera é medido e toques fora da vez são só sinalizados com suavidade, nunca punidos.',
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
    ageRangeMonths: [36, 120],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: [
      'SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'PROMPT_USED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED',
      'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED',
    ],
  },
};
