import { describe, it, expect } from 'vitest';
import { TaskSystem } from '../src/simulation/TaskSystem';
import { CharacterSystem } from '../src/simulation/CharacterSystem';
import { CoopSystem } from '../src/simulation/CoopSystem';

describe('CoopAssist & Synergy System', () => {
  it('should progress at least 2x faster when 2 players cooperate on a task', () => {
    const taskDef = TaskSystem.getTaskDefById('task_pintar_bancos')!;
    const p1 = CharacterSystem.createPlayerState('p1', 'char_luan', false, 100, 100);
    const p2 = CharacterSystem.createPlayerState('p2', 'char_samira', false, 100, 100);

    // Solo progress
    const soloState = {
      taskId: taskDef.id,
      progress: 0,
      currentStepIndex: 0,
      assignedPlayerIds: ['p1'],
      isCompleted: false,
      activeContributorsCount: 1
    };
    const soloRes = TaskSystem.updateTaskProgress(soloState, taskDef, [p1], 1.0);

    // Duo cooperative progress
    const duoState = {
      taskId: taskDef.id,
      progress: 0,
      currentStepIndex: 0,
      assignedPlayerIds: ['p1', 'p2'],
      isCompleted: false,
      activeContributorsCount: 2
    };
    const duoRes = TaskSystem.updateTaskProgress(duoState, taskDef, [p1, p2], 1.0);

    expect(duoRes.progressGained).toBeGreaterThanOrEqual(soloRes.progressGained * 2.0);
  });

  it('should grant superior synergy multiplier with Davi (Conciliador)', () => {
    const taskDef = TaskSystem.getTaskDefById('task_mesas_piquenique')!;
    const p1 = CharacterSystem.createPlayerState('p1', 'char_luan', false, 100, 100);
    const pDavi = CharacterSystem.createPlayerState('p2', 'char_davi', false, 100, 100);

    const state = {
      taskId: taskDef.id,
      progress: 0,
      currentStepIndex: 0,
      assignedPlayerIds: ['p1', 'p2'],
      isCompleted: false,
      activeContributorsCount: 2
    };
    const res = TaskSystem.updateTaskProgress(state, taskDef, [p1, pDavi], 1.0);

    // Rate should exceed 2.5x
    const expectedBase = (100 / taskDef.baseDuration) * 2.5;
    expect(res.progressGained).toBeGreaterThanOrEqual(expectedBase);
  });

  it('should increase wheelbarrow pushing speed when two players push together', () => {
    const cart = CoopSystem.createWheelbarrow(100, 100, 4);

    // 1 pusher
    CoopSystem.updateWheelbarrowPhysics(cart, 1, 100, 0, 1.0);
    const speed1 = cart.vx;

    // Reset and test with 2 pushers
    const cart2 = CoopSystem.createWheelbarrow(100, 100, 4);
    CoopSystem.updateWheelbarrowPhysics(cart2, 2, 100, 0, 1.0);
    const speed2 = cart2.vx;

    expect(speed2).toBeGreaterThan(speed1);
  });
});
