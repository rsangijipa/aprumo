import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'escolha-pela-instrucao',
  version: '2.0.0',
  name: 'Missão Instrução',
  kind: 'game',
  summary: 'Resposta de ouvinte num palco: instruções faladas de 1, 2 ou 3 etapas, com cor, tamanho e relações espaciais (dentro, em cima, embaixo, ao lado da caixa). Nível 1 mantém o modo simples “Toque no/na …”.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'not-indicated' },
    repertoires: ['listener', 'tact'],
    autoScoring: ['listener'],
    // Tato exige pontuação do profissional: o jogo só apresenta o estímulo.
    therapistScoring: ['tact'],
    playLevel: 'functional',
    trialUnit: 'Uma instrução falada (1 a 3 etapas); cada etapa é um toque no item ou toque no item → toque no lugar (alternativa acessível ao arrastar).',
    correctResponse: 'Todas as etapas na ordem, com o item e a relação certos, em até 8 s por etapa após o fim da instrução.',
    minFieldSize: 2,
    maxFieldSize: 4,
    latencyMaxMs: 8000,
    builtInPrompts: [{ code: 'SPOTLIGHT', afterMs: 5000, intrusiveness: 0.25 }],
    prerequisites: ['tolera-tablet', 'toca-alvo-intencional', 'pareia-figura-identica'],
    ageRangeMonths: [36, 144],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: [
      'SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'PROMPT_USED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED',
      'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED',
    ],
  },
};
