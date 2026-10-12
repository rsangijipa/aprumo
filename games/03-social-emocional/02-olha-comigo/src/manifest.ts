import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'olha-comigo',
  version: '1.0.0',
  name: 'Olha Comigo',
  kind: 'game',
  summary:
    'Atenção compartilhada: um guia amigo olha, aponta e diz "Olha!" para um objeto da cena; a criança segue a pista e toca o objeto. As pistas esvanecem do mais ao menos apoio. Zero captura de rosto ou biometria.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['social'],
    autoScoring: ['social'],
    therapistScoring: ['social'],
    playLevel: 'reciprocal',
    trialUnit: 'O guia dá uma pista de atenção (olhar, olhar + apontar ou olhar + apontar + "Olha!") para um entre 2 e 4 objetos.',
    correctResponse: 'Tocar o objeto para o qual o guia está olhando/apontando.',
    minFieldSize: 2,
    maxFieldSize: 4,
    latencyMaxMs: 20000,
    builtInPrompts: [{ code: 'HIGHLIGHT', afterMs: 8000, intrusiveness: 0.3 }],
    prerequisites: ['Tolerar sentar diante da tela por alguns minutos', 'Tocar a tela com intenção'],
    ageRangeMonths: [24, 84],
    requiresAdult: false,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: [
      'SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED',
      'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED',
      'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED',
    ],
  },
};
