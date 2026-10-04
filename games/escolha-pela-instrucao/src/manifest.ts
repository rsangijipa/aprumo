import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'escolha-pela-instrucao',
  version: '1.0.0',
  name: 'Escolha pela Instrução',
  kind: 'game',
  summary: 'Resposta de ouvinte num palco: a instrução é falada e a criança toca o item nomeado na estante.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'not-indicated' },
    repertoires: ['listener', 'tact'],
    autoScoring: ['listener'],
    // Tato exige pontuação do profissional: o jogo só apresenta o estímulo.
    therapistScoring: ['tact'],
    playLevel: 'functional',
    trialUnit: 'Seleção de um item em campo de N após instrução falada “Toque no/na …”.',
    correctResponse: 'Toque no item nomeado em até 8 s após o fim da instrução.',
    minFieldSize: 2,
    maxFieldSize: 4,
    latencyMaxMs: 8000,
    builtInPrompts: [{ code: 'SPOTLIGHT', afterMs: 5000, intrusiveness: 0.25 }],
    prerequisites: ['tolera-tablet', 'toca-alvo-intencional', 'pareia-figura-identica'],
    ageRangeMonths: [30, 120],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'TRIAL_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
