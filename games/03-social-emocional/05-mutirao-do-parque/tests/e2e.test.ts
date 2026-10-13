import { describe, it, expect } from 'vitest';
import { WorldState } from '../src/simulation/WorldState';
import { TaskSystem } from '../src/simulation/TaskSystem';
import { InventorySystem } from '../src/simulation/InventorySystem';
import { QUICK_COMM_MESSAGES } from '../src/simulation/CoopSystem';
import mapsData from '../src/data/maps.json';
import charactersData from '../src/data/characters.json';
import { MapDef, CharacterDef } from '../src/types';

describe('E2E Match & Lifecycle Flows', () => {
  const map = mapsData[0] as MapDef;
  const char1 = (charactersData as CharacterDef[])[0]; // Luan
  const char2 = (charactersData as CharacterDef[])[3]; // Maya (wheelchair)

  it('completes a full cooperative workflow: setup -> execution -> help -> ping -> review', () => {
    // 1. Initialize match
    const world = new WorldState(map, char1.id, char2.id, 'solo', 'curta');
    expect(world.players.length).toBe(2);
    expect(world.timeRemainingSeconds).toBe(8 * 60);

    // 2. Drop a cooperative ping
    const ping = world.addPing(120, 160, 'Luan', '#4F8198', 'Pin');
    expect(world.pings.length).toBe(1);
    expect(ping.senderName).toBe('Luan');

    // 3. Quick Comms verification
    expect(QUICK_COMM_MESSAGES.length).toBe(6);
    world.players[0].currentSpeechBubble = 'Me ajuda aqui?';
    world.players[0].speechBubbleTimer = 4.0;

    // 4. Companion bot responds to the call
    world.update(0.5);
    expect(world.players[1].isHelping || world.players[1].vx !== 0).toBe(true);

    // 5. Complete an essential task cooperatively
    const firstTaskSpot = map.taskSpots[0];
    const taskDef = TaskSystem.getTaskDefById(firstTaskSpot.taskId)!;
    expect(taskDef.id).toBe(firstTaskSpot.taskId);
    const taskState = world.activeTasks.get(firstTaskSpot.taskId)!;

    // Give player the needed tools
    InventorySystem.addItem(world.inventories.get('p1')!, 'item_pa');
    InventorySystem.addItem(world.inventories.get('p1')!, 'item_muda_ipe');
    InventorySystem.addItem(world.inventories.get('p1')!, 'item_regador');

    // Teleport both players to the task spot
    world.players[0].x = firstTaskSpot.x * 32;
    world.players[0].y = firstTaskSpot.y * 32;
    world.players[1].x = firstTaskSpot.x * 32 + 5;
    world.players[1].y = firstTaskSpot.y * 32 + 5;
    world.players[1].isHelping = true;

    // Update simulation until task is done
    for (let i = 0; i < 20; i++) {
      world.update(0.5);
      if (taskState.isCompleted) break;
    }

    expect(taskState.isCompleted).toBe(true);
    expect(world.helpsGivenCount).toBeGreaterThan(0);

    // 6. Finish match and inspect collective results (NO defeat)
    world.finishMatch();
    expect(world.isMatchEnded).toBe(true);
    expect(world.stats).toBeDefined();
    expect(world.stats?.tasksCompleted).toBeGreaterThanOrEqual(1);

    // 7. Test "Continue without timer" feature
    world.continueWithoutTime();
    expect(world.isMatchEnded).toBe(false);
    expect(world.isTimerActive).toBe(false);
    expect(world.matchDuration).toBe('livre');
  });
});
