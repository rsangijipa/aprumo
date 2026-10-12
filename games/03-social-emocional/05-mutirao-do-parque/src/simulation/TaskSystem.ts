import { TaskDef, ActiveTaskState, InventorySlot } from '../types';
import tasksData from '../data/tasks.json';
import { InventorySystem } from './InventorySystem';
import { PlayerSimulationState } from './CharacterSystem';

export class TaskSystem {
  public static getAllTaskDefs(): TaskDef[] {
    return tasksData as TaskDef[];
  }

  public static getTaskDefById(id: string): TaskDef | undefined {
    return (tasksData as TaskDef[]).find(t => t.id === id);
  }

  public static initializeActiveTasks(taskIds: string[]): Map<string, ActiveTaskState> {
    const map = new Map<string, ActiveTaskState>();
    taskIds.forEach(id => {
      map.set(id, {
        taskId: id,
        progress: 0,
        currentStepIndex: 0,
        assignedPlayerIds: [],
        isCompleted: false,
        activeContributorsCount: 0
      });
    });
    return map;
  }

  public static canPlayerWorkOnTask(
    taskDef: TaskDef,
    inventory: InventorySlot[],
    isRaining: boolean = false
  ): { canWork: boolean; missingReason?: string } {
    // Check required tool (allowing versatile tool equivalents)
    if (taskDef.requiredTool) {
      let hasTool = InventorySystem.hasTool(inventory, taskDef.requiredTool);
      if (!hasTool) {
        if (taskDef.requiredTool === 'item_rolo_pintura' && InventorySystem.hasTool(inventory, 'item_pincel')) {
          hasTool = true;
        } else if (taskDef.requiredTool === 'item_pincel' && InventorySystem.hasTool(inventory, 'item_rolo_pintura')) {
          hasTool = true;
        } else if (taskDef.requiredTool === 'item_alicate' && InventorySystem.hasTool(inventory, 'item_chave_inglesa')) {
          hasTool = true;
        }
      }

      if (!hasTool) {
        return {
          canWork: false,
          missingReason: `Precisa de ferramenta: ${taskDef.requiredTool.replace('item_', '')}`
        };
      }
    }

    // Special rain condition: rain waters plants automatically!
    if (isRaining && taskDef.category === 'plantio' && taskDef.requiredItems.includes('item_regador')) {
      // Regador requirement bypassed by rain event!
    } else {
      // Check required items
      for (const reqItemId of taskDef.requiredItems) {
        if (!InventorySystem.hasItem(inventory, reqItemId)) {
          return {
            canWork: false,
            missingReason: `Falta item: ${reqItemId.replace('item_', '')}`
          };
        }
      }
    }

    return { canWork: true };
  }

  public static updateTaskProgress(
    taskState: ActiveTaskState,
    taskDef: TaskDef,
    contributors: PlayerSimulationState[],
    deltaSeconds: number
  ): { completedNow: boolean; progressGained: number } {
    if (taskState.isCompleted) return { completedNow: false, progressGained: 0 };

    const activeCount = contributors.length;
    taskState.activeContributorsCount = activeCount;

    if (activeCount === 0) return { completedNow: false, progressGained: 0 };

    // Base fill rate = 100 / baseDuration
    let fillRate = (100 / Math.max(2, taskDef.baseDuration));

    // Cooperative multiplier: 2 players = 2x speed.
    // Plus "Ajudar" bonus!
    if (activeCount > 1) {
      let coopMultiplier = 2.0;
      const hasConciliator = contributors.some(c => c.characterDef.talent === 'conciliador');
      if (hasConciliator) {
        coopMultiplier = 2.6; // Even stronger synergy
      }
      fillRate *= coopMultiplier;
    }

    // Solo talents
    const hasPractico = contributors.some(c => c.characterDef.talent === 'pratico');
    if (hasPractico && (taskDef.category === 'reparo' || taskDef.category === 'iluminacao')) {
      fillRate *= 1.35;
    }

    const progressGained = fillRate * deltaSeconds;
    taskState.progress = Math.min(100, taskState.progress + progressGained);

    if (taskState.progress >= 100) {
      taskState.isCompleted = true;
      taskState.progress = 100;
      return { completedNow: true, progressGained };
    }

    return { completedNow: false, progressGained };
  }
}
