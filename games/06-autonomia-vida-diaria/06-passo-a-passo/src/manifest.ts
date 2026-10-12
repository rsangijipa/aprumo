import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'passo-a-passo',
  version: '1.0.0',
  name: 'Passo a Passo (Análise de Tarefas)',
  kind: 'game',
  summary: 'Encadeamento de atividades de vida diária (AVDs) através de análise de tarefas passo a passo, suporte visual de prancha e registro de independência.',
  clinical: {
    purposes: ['teaching', 'reinforcer', 'regulation'],
    models: {"ABA":"trial-based","DENVER":"support"},
    repertoires: ["adl","listener"],
    autoScoring: ["adl","listener"],
    therapistScoring: [],
    playLevel: 'constructive',
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
    ageRangeMonths: [36,192],
    requiresAdult: false,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED']
  }
};
