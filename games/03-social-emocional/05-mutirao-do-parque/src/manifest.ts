import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'mutirao-do-parque',
  version: '1.0.0',
  name: 'Mutirão do Parque',
  kind: 'game',
  summary: 'Experiência cooperativa de convivência comunitária, divisão de papéis e trabalho em equipe no cuidado e limpeza de um parque público.',
  clinical: {
    purposes: ['teaching', 'reinforcer', 'regulation'],
    models: {"ABA":"support","DENVER":"joint-routine"},
    repertoires: ["social","play"],
    autoScoring: ["social","play"],
    therapistScoring: [],
    playLevel: 'cooperative',
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
    ageRangeMonths: [60,156],
    requiresAdult: false,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED']
  }
};
