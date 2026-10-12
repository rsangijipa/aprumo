import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'rampa-maluca',
  version: '1.0.0',
  name: 'Rampa Maluca',
  kind: 'game',
  summary:
    'Rotina de atividade conjunta (Denver) com carrinhos e bolinhas na rampa: o adulto conduz "Preparar… apontar…" e faz uma pausa expectante; a criança sinaliza "já!" (fala, aproximação, gesto ou olhar) e só a validação do adulto abre a trava. O reforço é natural: o veículo desce e a rotina continua, com variações conduzidas pelo adulto (inclinação, túnel, ponte no igarapé, pinos, pesado/leve, corrida).',
  clinical: {
    purposes: ['teaching'],
    models: { ABA: 'not-indicated', DENVER: 'joint-routine' },
    repertoires: ['mand', 'echoic', 'social', 'play'],
    autoScoring: [],
    therapistScoring: ['mand', 'echoic', 'social'],
    playLevel: 'functional',
    trialUnit:
      'Uma largada (TeachingEpisode): veículo preso na trava → contagem "Preparar… apontar…" → pausa expectante → sinal da criança registrado pelo adulto → trava abre → descida até o alvo.',
    correctResponse:
      'A criança sinaliza a largada durante a contagem/pausa ("já!", aproximação vocal, gesto ou olhar para o adulto); o adulto confirma no registro rápido.',
    minFieldSize: 1,
    maxFieldSize: 2,
    latencyMaxMs: 20000,
    builtInPrompts: [],
    prerequisites: ['Interesse por objetos em movimento (carrinhos, bolas)', 'Tolerar esperar alguns segundos com o adulto ao lado'],
    ageRangeMonths: [18, 60],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: [
      'SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'PROMPT_USED', 'TRIAL_COMPLETED',
      'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED',
    ],
  },
};
