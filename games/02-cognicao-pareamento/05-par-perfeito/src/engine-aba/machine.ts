import { setup, assign } from 'xstate';
import type {
  AbaTrial,
  InteractionMode,
  PromptType,
  TrialConfig
} from '../types';
import { TrialGenerator } from './generator';
import { soundManager } from '../audio/soundManager';

export interface ParPerfeitoContext {
  trialNumber: number;
  maxTrials: number;
  level: number;
  currentTrial: TrialConfig | null;
  interactionMode: InteractionMode;
  promptOverride: PromptType | null;
  activePrompt: PromptType;
  promptIntensity: number;
  consecutivePromptedWins: number;
  stimulusFadingStep: number; // 1 (30%), 2 (60%), 3 (100%)
  coldProbeTrialsTotal: number;
  coldProbeTrialsDone: number;
  isCurrentColdProbe: boolean;
  sdStartTime: number;
  sdEndTime: number;
  trialsHistory: AbaTrial[];
  lastResult: 'independent_correct' | 'prompted_correct' | 'incorrect' | 'timeout' | null;
  isErrorCorrectionPending: boolean;
  failedTargetId: string | null;
  supervisorAlert: string | null;
  trialGenerator: TrialGenerator;
}

export type ParPerfeitoEvent =
  | { type: 'START_TRIAL' }
  | { type: 'SD_FINISHED'; durationMs: number }
  | { type: 'DROP_ON_CORRECT'; dragPathLength: number; dropDistancePx: number; mode: InteractionMode }
  | { type: 'DROP_ON_WRONG'; slotIndex: number; dragPathLength: number; dropDistancePx: number; mode: InteractionMode }
  | { type: 'PROMPT_DUE' }
  | { type: 'PROMPT_COMPLETED' }
  | { type: 'TIMEOUT' }
  | { type: 'REINFORCING_DONE' }
  | { type: 'ERROR_CORRECTION_DONE' }
  | { type: 'ITI_DONE' }
  | { type: 'FINISH_TUTORIAL' }
  | { type: 'SET_LEVEL'; level: number }
  | { type: 'SET_MODE'; mode: InteractionMode }
  | { type: 'SET_PROMPT_OVERRIDE'; prompt: PromptType };

export const parPerfeitoMachine = setup({
  types: {
    context: {} as ParPerfeitoContext,
    events: {} as ParPerfeitoEvent
  },
  actions: {
    generateNewTrial: assign(({ context }) => {
      const nextTrialNum = context.trialNumber + 1;
      const isCold = context.coldProbeTrialsDone < context.coldProbeTrialsTotal;

      let promptToUse: PromptType = 'none';
      if (!isCold) {
        promptToUse = context.promptOverride || (context.level > 1 ? 'VIS' : 'none');
      }

      // If repeating because of error correction, use immediate prompt
      if (context.isErrorCorrectionPending) {
        promptToUse = 'VIS';
      }

      const trial = context.trialGenerator.generateTrial({
        trialNumber: nextTrialNum,
        level: context.level,
        promptType: promptToUse,
        promptIntensity: context.promptIntensity,
        isColdProbe: isCold,
        stimulusFadingStep: context.stimulusFadingStep
      });

      return {
        trialNumber: nextTrialNum,
        currentTrial: trial,
        activePrompt: promptToUse,
        isCurrentColdProbe: isCold,
        sdStartTime: performance.now(),
        lastResult: null
      };
    }),

    recordSDEnd: assign(() => ({
      sdEndTime: performance.now()
    })),

    recordCorrectDrop: assign(({ context, event }) => {
      if (event.type !== 'DROP_ON_CORRECT' || !context.currentTrial) return {};

      // Latency calculated from end of SD audio to drop (with ±20 ms precision)
      const now = performance.now();
      const latencyMs = Math.max(50, Math.round(now - context.sdEndTime));

      const isPrompted = context.activePrompt !== 'none' || context.isErrorCorrectionPending;
      const result = isPrompted ? 'prompted_correct' : 'independent_correct';

      const trialRecord: AbaTrial = {
        trialNumber: context.trialNumber,
        timestamp: new Date().toISOString(),
        targetId: context.currentTrial.target.id,
        targetName: context.currentTrial.target.name,
        targetPosition: context.currentTrial.comparisonSlots.findIndex(s => s.isCorrect),
        fieldSize: context.currentTrial.comparisonSlots.length,
        level: context.level,
        promptLevel: context.activePrompt,
        isColdProbe: context.isCurrentColdProbe,
        result,
        latencyMs,
        gameSpecific: {
          dragPathLength: Math.round(event.dragPathLength),
          dropDistancePx: Math.round(event.dropDistancePx),
          mode: event.mode,
          stimulusLayer: context.currentTrial.sampleLayer,
          distractorSimilarity: context.currentTrial.distractorSimilarity
        }
      };

      // Fading logic: 3 consecutive prompted wins -> fade prompt
      let consecutive = context.consecutivePromptedWins;
      let newIntensity = context.promptIntensity;
      let fadingStep = context.stimulusFadingStep;

      if (isPrompted) {
        consecutive += 1;
        if (consecutive >= 3) {
          consecutive = 0;
          newIntensity = Math.max(0.3, newIntensity - 0.25);
          fadingStep = Math.min(3, fadingStep + 1);
        }
      } else {
        consecutive = 0;
      }

      // Check mastery advancing
      const updatedHistory = [...context.trialsHistory, trialRecord];
      const recentTrials = updatedHistory.slice(-10);
      const independentWins = recentTrials.filter(t => t.result === 'independent_correct').length;
      let newLevel = context.level;
      let alert = context.supervisorAlert;

      if (recentTrials.length >= 10 && independentWins >= 8 && newLevel < 6) {
        newLevel += 1;
        alert = `Critério atingido! Avanço para o Nível ${newLevel}`;
      }

      // Play consequences: Kenney snap + audio praise
      soundManager.playSnap();
      soundManager.playRandomPraise();

      return {
        trialsHistory: updatedHistory,
        lastResult: result,
        consecutivePromptedWins: consecutive,
        promptIntensity: newIntensity,
        stimulusFadingStep: fadingStep,
        coldProbeTrialsDone: context.isCurrentColdProbe ? context.coldProbeTrialsDone + 1 : context.coldProbeTrialsDone,
        isErrorCorrectionPending: false,
        failedTargetId: null,
        level: newLevel,
        supervisorAlert: alert
      };
    }),

    recordWrongDropOrTimeout: assign(({ context, event }) => {
      if (!context.currentTrial) return {};
      const now = performance.now();
      const latencyMs = Math.max(50, Math.round(now - context.sdEndTime));

      const isTimeout = event.type === 'TIMEOUT';
      const result = isTimeout ? 'timeout' : 'incorrect';

      const dragPath = event.type === 'DROP_ON_WRONG' ? event.dragPathLength : 0;
      const dropDist = event.type === 'DROP_ON_WRONG' ? event.dropDistancePx : 0;
      const mode = event.type === 'DROP_ON_WRONG' ? event.mode : context.interactionMode;

      const trialRecord: AbaTrial = {
        trialNumber: context.trialNumber,
        timestamp: new Date().toISOString(),
        targetId: context.currentTrial.target.id,
        targetName: context.currentTrial.target.name,
        targetPosition: context.currentTrial.comparisonSlots.findIndex(s => s.isCorrect),
        fieldSize: context.currentTrial.comparisonSlots.length,
        level: context.level,
        promptLevel: context.activePrompt,
        isColdProbe: context.isCurrentColdProbe,
        result,
        latencyMs,
        gameSpecific: {
          dragPathLength: Math.round(dragPath),
          dropDistancePx: Math.round(dropDist),
          mode,
          stimulusLayer: context.currentTrial.sampleLayer,
          distractorSimilarity: context.currentTrial.distractorSimilarity
        }
      };

      const updatedHistory = [...context.trialsHistory, trialRecord];

      // Regression check: 2 sessions / 10 recent trials < 50% independent -> drop level and alert supervisor
      const recentTrials = updatedHistory.slice(-10);
      const independentWins = recentTrials.filter(t => t.result === 'independent_correct').length;
      let newLevel = context.level;
      let alert = context.supervisorAlert;

      if (recentTrials.length >= 10 && (independentWins / recentTrials.length) < 0.5 && newLevel > 1) {
        newLevel -= 1;
        alert = `Alerta clínico: Desempenho independente < 50%. Retorno ao Nível ${newLevel}`;
      }

      return {
        trialsHistory: updatedHistory,
        lastResult: result,
        isErrorCorrectionPending: true,
        failedTargetId: context.currentTrial.target.id,
        coldProbeTrialsDone: context.isCurrentColdProbe ? context.coldProbeTrialsDone + 1 : context.coldProbeTrialsDone,
        level: newLevel,
        supervisorAlert: alert
      };
    })
  }
}).createMachine({
  id: 'parPerfeito',
  initial: 'idle',
  context: () => ({
    trialNumber: 0,
    maxTrials: 10,
    level: 1,
    currentTrial: null,
    interactionMode: 'drag',
    promptOverride: null,
    activePrompt: 'none',
    promptIntensity: 1.0,
    consecutivePromptedWins: 0,
    stimulusFadingStep: 3,
    coldProbeTrialsTotal: 2,
    coldProbeTrialsDone: 0,
    isCurrentColdProbe: true,
    sdStartTime: 0,
    sdEndTime: 0,
    trialsHistory: [],
    lastResult: null,
    isErrorCorrectionPending: false,
    failedTargetId: null,
    supervisorAlert: null,
    trialGenerator: new TrialGenerator()
  }),
  states: {
    tutorial: {
      on: {
        FINISH_TUTORIAL: 'idle'
      }
    },
    idle: {
      on: {
        START_TRIAL: {
          target: 'presentingSD',
          actions: ['generateNewTrial']
        },
        SET_LEVEL: {
          actions: assign({ level: ({ event }) => event.level })
        },
        SET_MODE: {
          actions: assign({ interactionMode: ({ event }) => event.mode })
        },
        SET_PROMPT_OVERRIDE: {
          actions: assign({ promptOverride: ({ event }) => event.prompt })
        }
      }
    },
    presentingSD: {
      on: {
        SD_FINISHED: {
          target: 'awaitingResponse',
          actions: ['recordSDEnd']
        }
      }
    },
    awaitingResponse: {
      on: {
        DROP_ON_CORRECT: {
          target: 'reinforcing',
          actions: ['recordCorrectDrop']
        },
        DROP_ON_WRONG: {
          target: 'errorCorrection',
          actions: ['recordWrongDropOrTimeout']
        },
        TIMEOUT: {
          target: 'errorCorrection',
          actions: ['recordWrongDropOrTimeout']
        },
        PROMPT_DUE: {
          target: 'prompting'
        },
        SET_MODE: {
          actions: assign({ interactionMode: ({ event }) => event.mode })
        }
      }
    },
    prompting: {
      on: {
        PROMPT_COMPLETED: 'awaitingResponse',
        DROP_ON_CORRECT: {
          target: 'reinforcing',
          actions: ['recordCorrectDrop']
        },
        DROP_ON_WRONG: {
          target: 'errorCorrection',
          actions: ['recordWrongDropOrTimeout']
        },
        TIMEOUT: {
          target: 'errorCorrection',
          actions: ['recordWrongDropOrTimeout']
        }
      }
    },
    reinforcing: {
      on: {
        REINFORCING_DONE: 'iti'
      }
    },
    errorCorrection: {
      on: {
        ERROR_CORRECTION_DONE: 'iti'
      }
    },
    iti: {
      on: {
        ITI_DONE: [
          {
            target: 'sessionEnd',
            guard: ({ context }) => context.trialNumber >= context.maxTrials
          },
          {
            target: 'idle'
          }
        ]
      }
    },
    sessionEnd: {
      on: {
        START_TRIAL: {
          target: 'presentingSD',
          actions: [
            assign({ trialNumber: 0, trialsHistory: [], coldProbeTrialsDone: 0 }),
            'generateNewTrial'
          ]
        },
        SET_LEVEL: {
          actions: assign({ level: ({ event }) => event.level })
        }
      }
    }
  }
});
