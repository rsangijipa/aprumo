import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'encontre-o-igual',
  version: '2.0.0',
  name: 'Match Lab',
  kind: 'game',
  summary: 'Laboratório de pareamento: idêntico, cor, forma, categoria e associação funcional, com campo de 2 a 12 estímulos, toque ou arrastar e visual por idade (Soft Clay, Cozy Cartoon, Laboratório Clean).',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'not-indicated' },
    repertoires: ['matching'],
    autoScoring: ['matching'],
    therapistScoring: [],
    playLevel: 'constructive',
    trialUnit: 'Seleção (toque ou arrastar até a bandeja) do cartão que combina com o modelo pela dimensão configurada, em campo de N cartões.',
    correctResponse: 'Escolher o cartão que combina com o modelo (idêntico, mesma cor, mesma forma, mesma categoria ou associado) em até 8 s.',
    minFieldSize: 1,
    /** Até 6 via alvo/perfil; 8 e 12 via params.fieldSize (decisão explícita da sessão). */
    maxFieldSize: 6,
    latencyMaxMs: 8000,
    builtInPrompts: [{ code: 'HIGHLIGHT', afterMs: 6000, intrusiveness: 0.25 }],
    prerequisites: ['tolera-tablet', 'toca-alvo-intencional'],
    ageRangeMonths: [24, 216],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'TRIAL_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
