import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'circuito-executivo',
  version: '2.0.0',
  name: 'Circuito Executivo',
  kind: 'game',
  summary: 'Funções executivas em circuito de 3 estações com o robô Bip: Go/No-Go com itens caindo por gravidade adaptativa (baterias vs. gotas), troca de regra DCCS (cor → forma → misto) e memória Corsi com 9 luzes e span crescente.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['academic'],
    autoScoring: ['academic'],
    therapistScoring: [],
    playLevel: 'constructive',
    trialUnit: 'Go/No-Go: um item caindo; DCCS: uma carta classificada; Corsi: uma sequência reproduzida.',
    correctResponse: 'Pegar baterias e deixar gotas passarem; classificar pela regra ativa; repetir a sequência de luzes na ordem.',
    minFieldSize: 1,
    maxFieldSize: 9,
    latencyMaxMs: 30000,
    builtInPrompts: [],
    prerequisites: ['Atenção sustentada básica', 'Discriminação visual de cor e forma'],
    ageRangeMonths: [84, 192],
    requiresAdult: false,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
