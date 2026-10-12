import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'torre-derruba',
  version: '1.0.0',
  name: 'Torre Derruba',
  kind: 'game',
  summary: 'Rotina de atividade conjunta Denver (JAR) de empilhamento e derrubada de blocos de madeira com física realista, troca de turnos e contagem regressiva.',
  clinical: {
    purposes: ['teaching', 'reinforcer', 'regulation'],
    models: {"ABA":"support","DENVER":"joint-routine"},
    repertoires: ["play","imitation","social"],
    autoScoring: ["play","imitation","social"],
    therapistScoring: [],
    playLevel: 'functional',
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
    ageRangeMonths: [12,60],
    requiresAdult: true,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED']
  }
};
