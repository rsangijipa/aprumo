import { setup, assign } from 'xstate';
import type {
  AbaTrialSort,
  BinDefinition,
  ClassificationRule,
  GameMode,
  IndependentTaskStats,
  PromptType,
  SensoryProfile,
  SortItem
} from '../types';
import {
  BinPositionManager,
  generateBinsForRule,
  generateItemsForRule
} from '../rules/rules';
import { soundManager } from '../audio/soundManager';

export interface CadaUmNoSeuPoteContext {
  mode: GameMode;
  rule: ClassificationRule;
  sensoryProfile: SensoryProfile;
  level: number;
  trialNumber: number;
  bins: BinDefinition[];
  currentItem: SortItem | null;
  itemsQueue: SortItem[];
  history: AbaTrialSort[];
  isRuleSwitchPending: boolean;
  isFirstTrialAfterSwitch: boolean;
  activePrompt: PromptType;
  sdEndTime: number;
  // Independent Work Task metrics
  taskStats: IndependentTaskStats;
  binPositionManager: BinPositionManager;
}

export type CadaUmNoSeuPoteEvent =
  | { type: 'START_TRIAL' }
  | { type: 'SD_FINISHED' }
  | { type: 'ITEM_DROPPED_IN_BIN'; item: SortItem; bin: BinDefinition; throwVelocity: number }
  | { type: 'SWITCH_RULE'; newRule: ClassificationRule }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_SENSORY_PROFILE'; profile: SensoryProfile }
  | { type: 'RECORD_ADULT_PROMPT' }
  | { type: 'RECORD_OFF_TASK_PAUSE' }
  | { type: 'REINFORCING_DONE' }
  | { type: 'ERROR_RETURN_DONE' }
  | { type: 'RESET_SESSION' };

export const cadaUmNoSeuPoteMachine = setup({
  types: {
    context: {} as CadaUmNoSeuPoteContext,
    events: {} as CadaUmNoSeuPoteEvent
  },
  actions: {
    setupNewTrialOrTask: assign(({ context }) => {
      const bins = context.binPositionManager.shuffleBins(
        context.bins.length > 0 ? context.bins : generateBinsForRule(context.rule)
      );

      if (context.mode === 'tentativa_discreta') {
        const items = generateItemsForRule(context.rule, 1);
        return {
          bins,
          currentItem: items[0],
          trialNumber: context.trialNumber + 1
        };
      } else {
        // Independent work task (8 items)
        const items = generateItemsForRule(context.rule, 8);
        return {
          bins,
          currentItem: null,
          itemsQueue: items,
          taskStats: {
            itemsTotal: items.length,
            itemsCorrect: 0,
            errorsCount: 0,
            durationMs: 0,
            offTaskPauses: 0,
            adultPrompts: 0,
            isComplete: false
          }
        };
      }
    }),

    recordSDEnd: assign(() => ({
      sdEndTime: performance.now()
    })),

    handleItemDrop: assign(({ context, event }) => {
      if (event.type !== 'ITEM_DROPPED_IN_BIN') return {};

      const { item, bin, throwVelocity } = event;
      const isCorrect = item.attributeValue === bin.attributeValue;

      const latencyMs = Math.max(50, Math.round(performance.now() - context.sdEndTime));

      const trialRecord: AbaTrialSort = {
        trialNumber: context.trialNumber,
        timestamp: new Date().toISOString(),
        itemId: item.id,
        itemName: item.name,
        binIndex: bin.binIndex,
        expectedBinIndex: context.bins.findIndex(b => b.attributeValue === item.attributeValue),
        result: isCorrect ? 'independent_correct' : 'incorrect',
        latencyMs,
        gameSpecific: {
          rule: context.rule,
          attributeValue: item.attributeValue,
          binIndex: bin.binIndex,
          throwVelocity,
          ruleSwitchProbe: context.isFirstTrialAfterSwitch,
          mode: context.mode
        }
      };

      if (isCorrect) {
        soundManager.playMaterialDrop(item.material);
        soundManager.playRandomPraise();
      } else {
        // Incorreto: som do material ao bater, sem som de erro aversivo
        soundManager.playMaterialDrop(item.material);
      }

      // Update independent task stats if in task mode
      let taskStats = { ...context.taskStats };
      if (context.mode === 'tarefa_independente') {
        if (isCorrect) taskStats.itemsCorrect += 1;
        else taskStats.errorsCount += 1;
        taskStats.isComplete = taskStats.itemsCorrect + taskStats.errorsCount >= taskStats.itemsTotal;
      }

      return {
        history: [...context.history, trialRecord],
        isFirstTrialAfterSwitch: false,
        taskStats
      };
    })
  }
}).createMachine({
  id: 'cadaUmNoSeuPote',
  initial: 'idle',
  context: () => ({
    mode: 'tentativa_discreta',
    rule: 'cor',
    sensoryProfile: 'padrao',
    level: 1,
    trialNumber: 0,
    bins: generateBinsForRule('cor'),
    currentItem: null,
    itemsQueue: [],
    history: [],
    isRuleSwitchPending: false,
    isFirstTrialAfterSwitch: false,
    activePrompt: 'none',
    sdEndTime: 0,
    taskStats: {
      itemsTotal: 0,
      itemsCorrect: 0,
      errorsCount: 0,
      durationMs: 0,
      offTaskPauses: 0,
      adultPrompts: 0,
      isComplete: false
    },
    binPositionManager: new BinPositionManager()
  }),
  states: {
    idle: {
      on: {
        START_TRIAL: {
          target: 'presentingSD',
          actions: ['setupNewTrialOrTask']
        },
        SET_MODE: {
          actions: assign({ mode: ({ event }) => event.mode })
        },
        SET_SENSORY_PROFILE: {
          actions: assign({ sensoryProfile: ({ event }) => event.profile })
        },
        SWITCH_RULE: {
          actions: assign({
            rule: ({ event }) => event.newRule,
            bins: ({ event }) => generateBinsForRule(event.newRule),
            isFirstTrialAfterSwitch: true
          })
        }
      }
    },
    presentingSD: {
      on: {
        SD_FINISHED: {
          target: 'sorting',
          actions: ['recordSDEnd']
        }
      }
    },
    sorting: {
      on: {
        ITEM_DROPPED_IN_BIN: [
          {
            target: 'reinforcing',
            guard: ({ event }) => event.item.attributeValue === event.bin.attributeValue,
            actions: ['handleItemDrop']
          },
          {
            target: 'errorReturn',
            actions: ['handleItemDrop']
          }
        ],
        RECORD_ADULT_PROMPT: {
          actions: assign({
            taskStats: ({ context }) => ({
              ...context.taskStats,
              adultPrompts: context.taskStats.adultPrompts + 1
            })
          })
        },
        RECORD_OFF_TASK_PAUSE: {
          actions: assign({
            taskStats: ({ context }) => ({
              ...context.taskStats,
              offTaskPauses: context.taskStats.offTaskPauses + 1
            })
          })
        }
      }
    },
    reinforcing: {
      on: {
        REINFORCING_DONE: [
          {
            target: 'sessionEnd',
            guard: ({ context }) =>
              context.mode === 'tarefa_independente' && context.taskStats.isComplete
          },
          {
            target: 'idle'
          }
        ]
      }
    },
    errorReturn: {
      on: {
        ERROR_RETURN_DONE: 'sorting'
      }
    },
    sessionEnd: {
      on: {
        RESET_SESSION: 'idle'
      }
    }
  }
});
