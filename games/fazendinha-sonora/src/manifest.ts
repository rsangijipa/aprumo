import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'fazendinha-sonora',
  version: '1.0.0',
  name: 'Fazendinha Sonora',
  kind: 'game',
  summary:
    'Leitura compartilhada (Denver): livro de abas "Cadê a vaca?" com sons de animais. O adulto revela devagar, aponta, imita e registra apontar, seguir o apontar e onomatopeias. O toque da criança nunca toca som sozinho.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'not-indicated', DENVER: 'joint-routine' },
    repertoires: ['social', 'echoic', 'imitation', 'mand', 'tact', 'listener'],
    autoScoring: [],
    therapistScoring: ['social', 'echoic', 'imitation', 'mand', 'tact', 'listener'],
    playLevel: 'reciprocal',
    trialUnit: 'Episódio de ensino na rotina do livro: "cadê?" → a criança aponta/vocaliza → o adulto revela o animal e registra a resposta.',
    correctResponse: 'Apontar para pedir ou mostrar, seguir o apontar do adulto, imitar ou emitir a onomatopeia ou nomear o animal.',
    minFieldSize: 1,
    maxFieldSize: 3,
    latencyMaxMs: 120000,
    builtInPrompts: [],
    prerequisites: ['Sentar junto do adulto diante do tablet', 'Interesse por figuras ou sons de animais'],
    ageRangeMonths: [12, 48],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: [
      'SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'PROMPT_USED', 'TRIAL_COMPLETED',
      'LEVEL_COMPLETED', 'SESSION_COMPLETED',
    ],
  },
};
