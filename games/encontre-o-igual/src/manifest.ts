import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'encontre-o-igual',
  version: '1.0.0',
  name: 'Encontre o Igual',
  kind: 'game',
  summary: 'Pareamento de idênticos numa mesa de feltro: a criança leva o cartão igual ao modelo da bandeja.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'not-indicated' },
    repertoires: ['matching'],
    autoScoring: ['matching'],
    therapistScoring: [],
    playLevel: 'constructive',
    trialUnit: 'Seleção do cartão idêntico ao modelo em campo de N cartões.',
    correctResponse: 'Toque no cartão idêntico ao modelo em até 8 s.',
    minFieldSize: 1,
    maxFieldSize: 4,
    latencyMaxMs: 8000,
    builtInPrompts: [{ code: 'HIGHLIGHT', afterMs: 6000, intrusiveness: 0.25 }],
    prerequisites: ['tolera-tablet', 'toca-alvo-intencional'],
    ageRangeMonths: [30, 96],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'TRIAL_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
