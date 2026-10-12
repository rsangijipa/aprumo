import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'lanche-do-urso',
  version: '1.0.0',
  name: 'Hora do Lanche do Urso',
  kind: 'game',
  summary:
    'Brincar de faz de conta (Denver): dar comida, água, limpar e pôr o urso para dormir; de ações isoladas a sequências e substituição simbólica. Formato espelho com o kit real ao lado do tablet.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'not-indicated', DENVER: 'joint-routine' },
    repertoires: ['play', 'imitation', 'listener', 'social'],
    autoScoring: ['play'],
    therapistScoring: ['play', 'imitation'],
    playLevel: 'symbolic',
    trialUnit: 'Uma ação funcional com objeto dirigida ao personagem (na tela ou no brinquedo real), ou um pedido do personagem disparado pelo adulto (modo missão).',
    correctResponse: 'Modo missão: objeto compatível na zona compatível atendendo ao pedido. Modo livre: não há resposta errada; cada ação é registrada como episódio.',
    minFieldSize: 1,
    maxFieldSize: 1,
    latencyMaxMs: 60000,
    builtInPrompts: [],
    prerequisites: ['Interesse por bonecos ou pelúcias', 'Arrastar ou tocar objetos na tela com intenção'],
    ageRangeMonths: [18, 60],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: [
      'SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'PROMPT_USED',
      'TRIAL_COMPLETED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_COMPLETED',
    ],
  },
};
