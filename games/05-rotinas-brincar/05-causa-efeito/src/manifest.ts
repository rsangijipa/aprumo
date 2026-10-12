import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: 'causa-efeito',
  version: '2.0.0',
  name: 'Causa e Efeito',
  kind: 'game',
  summary: 'Jardim de Luzes: 5 fases de contingência causa-efeito (tocar, estourar bolhas, segurar e soltar, arrastar, acionar um único alvo) com física suave, som espacial pentatônico e zero frustração.',
  clinical: {
    purposes: ['regulation', 'reinforcer', 'teaching'],
    models: { ABA: 'support', DENVER: 'joint-routine' },
    repertoires: ['play'],
    autoScoring: ['play'],
    therapistScoring: [],
    playLevel: 'exploratory',
    trialUnit: 'Ação intencional (toque, estouro, segurar ≥450 ms, traço ≥140 px ou acionar o sol) com efeito audiovisual imediato.',
    correctResponse: 'Ação intencional no alvo ativo da fase; toques fora do alvo só geram eco e são contados no detail.',
    minFieldSize: 1,
    maxFieldSize: 5,
    latencyMaxMs: 30000,
    builtInPrompts: [{ code: 'GENTLE_PULSE', afterMs: 15000, intrusiveness: 0.1 }],
    prerequisites: [],
    ageRangeMonths: [12, 72],
    requiresAdult: false,
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED'],
  },
};
