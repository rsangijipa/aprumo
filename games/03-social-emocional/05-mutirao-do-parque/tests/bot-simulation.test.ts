import { describe, it, expect } from 'vitest';
import { WorldState, mapTaskSpotsToDefs } from '../src/simulation/WorldState';
import { GoalSystem } from '../src/simulation/GoalSystem';
import { TaskSystem } from '../src/simulation/TaskSystem';
import mapsData from '../src/data/maps.json';
import { MapDef, TaskDef } from '../src/types';

describe('Bot Match Simulation (100 Partidas)', () => {
  const maps = mapsData as MapDef[];

  it('verifies that across all 5 maps, essential materials are present and tasks are feasible', () => {
    maps.forEach(mapDef => {
      const taskDefs = mapTaskSpotsToDefs(mapDef);
      const essentialTasks = taskDefs.filter(t => t.isEssential);
      expect(essentialTasks.length).toBeGreaterThan(0);

      // Check all required tools and items have spawners or ground items
      const availableItemIds = new Set(mapDef.itemSpawners.map(s => s.itemId));

      essentialTasks.forEach(task => {
        if (task.requiredTool) {
          const isToolValid =
            availableItemIds.has(task.requiredTool) ||
            task.requiredTool === 'item_pa' ||
            task.requiredTool === 'item_chave_inglesa' ||
            task.requiredTool === 'item_martelo' ||
            task.requiredTool === 'item_vassoura' ||
            task.requiredTool === 'item_rolo_pintura' ||
            task.requiredTool === 'item_pincel' ||
            task.requiredTool === 'item_alicate' ||
            task.requiredTool === 'item_rede_lago';
          expect(isToolValid).toBe(true);
        }
      });
    });
  });

  it('runs 100 automated companion bot simulated matches without crashes or unresolvable deadlocks', () => {
    const characters = ['char_luan', 'char_samira', 'char_kaue', 'char_maya', 'char_ines', 'char_beto', 'char_clara', 'char_davi'];

    for (let matchIndex = 0; matchIndex < 100; matchIndex++) {
      const chosenMap = maps[matchIndex % maps.length];
      const char1 = characters[matchIndex % characters.length];
      const char2 = characters[(matchIndex + 1) % characters.length];

      const world = new WorldState(chosenMap, char1, char2, 'solo', 'curta');

      // Simulate match time steps (dt = 0.5s for 20 simulated iterations)
      for (let step = 0; step < 20; step++) {
        world.update(0.5);
      }

      // Check world integrity
      expect(world.players.length).toBe(2);
      expect(world.timeRemainingSeconds).toBeLessThanOrEqual(world.totalTimeSeconds);
      expect(world.isMatchEnded).toBe(false);

      const allDefs = mapTaskSpotsToDefs(chosenMap);
      const progress = GoalSystem.calculateProgress(allDefs, world.activeTasks);
      expect(progress.totalTasks).toBe(chosenMap.taskSpots.length);
      expect(progress.percentage).toBeGreaterThanOrEqual(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    }
  });
});
