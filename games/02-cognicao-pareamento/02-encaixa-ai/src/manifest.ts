import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'encaixa-ai',
  version: '1.0.0',
  name: 'Encaixa Aí',
  kind: 'game',
  summary:
    'Quebra-cabeça de encaixe com pino ensinado como cadeia (encadeamento reverso, direto ou tarefa total): cada peça é um passo registrado, com raio de captura e tolerância angular por nível.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'not-indicated' },
    repertoires: ['matching', 'play'],
    autoScoring: ['matching'],
    therapistScoring: [],
    playLevel: 'constructive',
    trialUnit: 'Um passo da cadeia: encaixar uma peça na cavidade correspondente.',
    correctResponse:
      'A peça assenta na cavidade correta sem tentativa anterior em cavidade errada (soltar no vazio nunca conta como erro).',
    minFieldSize: 1,
    maxFieldSize: 12,
    latencyMaxMs: 45000,
    builtInPrompts: [
      { code: 'VIS', afterMs: 8000, intrusiveness: 0.2 },
      { code: 'GEST', afterMs: 8000, intrusiveness: 0.4 },
      { code: 'POS', afterMs: 8000, intrusiveness: 0.5 },
    ],
    prerequisites: ['Arrastar uma peça ou tocar para escolher e tocar no lugar', 'Atenção ao tabuleiro por alguns segundos'],
    ageRangeMonths: [24, 96],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: [
      'SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'PROMPT_USED',
      'TRIAL_COMPLETED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED',
    ],
  },
};
