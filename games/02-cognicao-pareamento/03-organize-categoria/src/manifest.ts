import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'organize-categoria',
  version: '2.0.0',
  name: 'Organize por Categoria',
  kind: 'game',
  summary: 'Categorização funcional (RFFC: onde guardamos?): esteira com atrito, item lançado em arco até 9 recipientes ilustrados, fases de 2 a 5 caixas, arrastar ou tocar e correção sem erro.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['matching', 'listener', 'academic'],
    autoScoring: ['matching', 'listener'],
    therapistScoring: [],
    playLevel: 'constructive',
    trialUnit: 'Guardar o item (alvo ou distrator conhecido do plano) no recipiente da sua categoria funcional.',
    correctResponse: 'Tocar ou arrastar o item até o recipiente certo em até 10 s.',
    minFieldSize: 2,
    maxFieldSize: 5,
    latencyMaxMs: 10000,
    builtInPrompts: [{ code: 'HIGHLIGHT', afterMs: 7000, intrusiveness: 0.3 }],
    prerequisites: ['tolera-tablet', 'discrimina-categorias-basicas'],
    ageRangeMonths: [36, 120],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
