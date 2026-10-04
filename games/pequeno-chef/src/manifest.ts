import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'pequeno-chef',
  version: '1.0.0',
  name: 'Pequeno Chef',
  kind: 'game',
  summary: 'Análise de tarefas e seguimento de passos: a criança prepara uma receita passo a passo adicionando os ingredientes na tigela.',
  clinical: {
    purposes: ['teaching', 'probe'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    repertoires: ['adl', 'imitation', 'play'],
    autoScoring: ['adl', 'play'],
    therapistScoring: [],
    playLevel: 'functional',
    trialUnit: 'Execução de etapa na cadeia da receita culinária.',
    correctResponse: 'Seleção do ingrediente ou utensílio solicitado pela etapa da receita.',
    minFieldSize: 2,
    maxFieldSize: 4,
    latencyMaxMs: 15000,
    builtInPrompts: [{ code: 'PULSE', afterMs: 9000, intrusiveness: 0.25 }],
    prerequisites: ['tolera-tablet', 'atencao-compartilhada-inicial'],
    ageRangeMonths: [30, 96],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'TRIAL_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
