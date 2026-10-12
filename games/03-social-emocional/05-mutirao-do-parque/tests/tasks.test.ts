import { describe, it, expect } from 'vitest';
import { TaskSystem } from '../src/simulation/TaskSystem';
import { InventorySystem } from '../src/simulation/InventorySystem';
import { CharacterSystem } from '../src/simulation/CharacterSystem';

describe('TaskSystem', () => {
  it('should validate tool and item requirements', () => {
    const taskDef = TaskSystem.getTaskDefById('task_ipe_amarelo')!;
    expect(taskDef).toBeDefined();

    const inv = InventorySystem.createEmptyInventory();
    // Missing tool (pá) and items
    const check1 = TaskSystem.canPlayerWorkOnTask(taskDef, inv);
    expect(check1.canWork).toBe(false);

    // Add required tool and items
    InventorySystem.addItem(inv, 'item_pa');
    InventorySystem.addItem(inv, 'item_muda_ipe');
    InventorySystem.addItem(inv, 'item_regador');

    const check2 = TaskSystem.canPlayerWorkOnTask(taskDef, inv);
    expect(check2.canWork).toBe(true);
  });

  it('should auto-water plants when rain event is active', () => {
    const taskDef = TaskSystem.getTaskDefById('task_ipe_amarelo')!;
    const inv = InventorySystem.createEmptyInventory();
    InventorySystem.addItem(inv, 'item_pa');
    InventorySystem.addItem(inv, 'item_muda_ipe');
    // Note: No regador in inventory!

    const checkWithoutRain = TaskSystem.canPlayerWorkOnTask(taskDef, inv, false);
    expect(checkWithoutRain.canWork).toBe(false);

    const checkWithRain = TaskSystem.canPlayerWorkOnTask(taskDef, inv, true);
    expect(checkWithRain.canWork).toBe(true);
  });

  it('should complete task progression when progress reaches 100%', () => {
    const taskDef = TaskSystem.getTaskDefById('task_girassois')!;
    const taskState = {
      taskId: taskDef.id,
      progress: 90,
      currentStepIndex: 0,
      assignedPlayerIds: ['p1'],
      isCompleted: false,
      activeContributorsCount: 1
    };

    const p1 = CharacterSystem.createPlayerState('p1', 'char_luan', false, 100, 100);
    const result = TaskSystem.updateTaskProgress(taskState, taskDef, [p1], 2.0);

    expect(result.completedNow).toBe(true);
    expect(taskState.isCompleted).toBe(true);
    expect(taskState.progress).toBe(100);
  });
});
