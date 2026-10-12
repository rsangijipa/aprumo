import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'bolhas-magicas',
  version: '2.0.0',
  name: 'Bolhas Mágicas',
  kind: 'game',
  summary: 'Treino de mando com reforçador natural: a varinha sopra bolhas com física real (empuxo, colisão, bolhona que se divide); na pausa a criança pede em 3 fases (MAIS → escolha → frase QUERO + item), com dicas graduais reais (gesto, modelo verbal, demonstração).',
  clinical: {
    purposes: ['teaching', 'reinforcer', 'regulation'],
    models: { ABA: 'support', DENVER: 'joint-routine' },
    repertoires: ['mand', 'play'],
    autoScoring: ['mand'],
    therapistScoring: [],
    playLevel: 'functional',
    trialUnit: 'Ciclo de sopro de bolhas, estouro sensorial e pedido (mand) durante a pausa comportamental.',
    correctResponse: 'Pedido comunicado na pausa (cartão MAIS, escolha do reforçador ou frase QUERO + item); o nível é a dica mais intrusiva entregue antes.',
    minFieldSize: 1,
    maxFieldSize: 3,
    latencyMaxMs: 15000,
    builtInPrompts: [
      { code: 'PULSE_MORE', afterMs: 5000, intrusiveness: 0.2 },
      { code: 'VOICE_PROMPT', afterMs: 10000, intrusiveness: 0.5 },
      { code: 'MODEL_TAP', afterMs: 15000, intrusiveness: 0.8 },
    ],
    prerequisites: [],
    ageRangeMonths: [12, 60],
    requiresAdult: false,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
