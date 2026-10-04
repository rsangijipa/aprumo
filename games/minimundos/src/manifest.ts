import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'minimundos',
  version: '1.0.0',
  name: 'MiniMundos',
  kind: 'game',
  summary: 'Brincar simbólico e funcional: explore ambientes cotidianos acolhedores (casa, mercado, consultório e escola) em modo livre ou cumprindo missões lúdicas.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['play'],
    autoScoring: ['play'],
    therapistScoring: [],
    playLevel: 'functional',
    trialUnit: 'Uso representativo de objetos em rotinas funcionais e resolução de missões simbólicas guiadas.',
    correctResponse: 'A criança interage de maneira representativa com os elementos do cenário (alimentar o boneco, deitar na cama, escanear no caixa).',
    minFieldSize: 1,
    maxFieldSize: 6,
    latencyMaxMs: 60000,
    builtInPrompts: [],
    prerequisites: ['Atenção visual e interesse em interação com objetos'],
    ageRangeMonths: [36, 132],
    requiresAdult: false,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: [
      'SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED',
      'TRIAL_COMPLETED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_COMPLETED',
    ],
  },
};
