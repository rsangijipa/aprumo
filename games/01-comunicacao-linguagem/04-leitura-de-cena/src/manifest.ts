import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'leitura-de-cena',
  version: '1.0.0',
  name: 'Leitura de Cena',
  kind: 'game',
  summary: 'Interpretação de situações sociais e leitura de contexto: identificação de emoções em personagens, pistas no ambiente e escolha de respostas adaptativas.',
  clinical: {
    purposes: ['teaching', 'reinforcer', 'regulation'],
    models: {"ABA":"trial-based","DENVER":"joint-routine"},
    repertoires: ["social","listener","tact"],
    autoScoring: ["social","listener","tact"],
    therapistScoring: [],
    playLevel: 'symbolic',
    trialUnit: 'Ciclo interativo estruturado com feedback comportamental e telemetria.',
    correctResponse: 'Resposta adaptativa ou comunicação intencional correspondente ao objetivo do ensaio.',
    minFieldSize: 1,
    maxFieldSize: 4,
    latencyMaxMs: 15000,
    builtInPrompts: [
      { code: 'HINT_HIGHLIGHT', afterMs: 5000, intrusiveness: 0.3 },
      { code: 'AUDIO_PROMPT', afterMs: 10000, intrusiveness: 0.6 }
    ],
    prerequisites: [],
    ageRangeMonths: [48,144],
    requiresAdult: false,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED']
  }
};
