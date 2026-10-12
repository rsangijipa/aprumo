import {
  MapDef,
  TaskDef,
  ActiveTaskState,
  MatchDuration,
  GameMode,
  PingData,
  CompletedStats,
  InventorySlot,
  ItemDef
} from '../types';
import { InventorySystem } from './InventorySystem';
import { CharacterSystem, PlayerSimulationState } from './CharacterSystem';
import { TaskSystem } from './TaskSystem';
import { EventSystem, ActiveEventState } from './EventSystem';
import { GoalSystem } from './GoalSystem';
import { CoopSystem, WheelbarrowState } from './CoopSystem';
import { ALL_ITEMS } from '../data/items';

export interface GroundItem {
  id: string;
  itemId: string;
  x: number;
  y: number;
}

export class WorldState {
  public mapDef: MapDef;
  public matchDuration: MatchDuration;
  public gameMode: GameMode;
  public totalTimeSeconds: number;
  public timeRemainingSeconds: number;
  public isTimerActive: boolean;

  public players: PlayerSimulationState[] = [];
  public inventories: Map<string, InventorySlot[]> = new Map();
  public activeTasks: Map<string, ActiveTaskState> = new Map();
  public groundItems: GroundItem[] = [];
  public wheelbarrow: WheelbarrowState;
  public activeEvent: ActiveEventState | null = null;
  public pings: PingData[] = [];

  // Match statistics
  public helpsGivenCount: number = 0;
  public eventsHandledCount: number = 0;
  public isMatchEnded: boolean = false;
  public stats: CompletedStats | null = null;

  // Bot AI timers and goals
  private botTargetTasks: Map<string, string | null> = new Map();
  private botThinkTimers: Map<string, number> = new Map();

  constructor(
    mapDef: MapDef,
    selectedChar1Id: string,
    selectedChar2Id: string,
    gameMode: GameMode = 'solo',
    duration: MatchDuration = 'curta'
  ) {
    this.mapDef = mapDef;
    this.gameMode = gameMode;
    this.matchDuration = duration;

    // Time setup
    switch (duration) {
      case 'curta':
        this.totalTimeSeconds = 8 * 60;
        break;
      case 'padrao':
        this.totalTimeSeconds = 15 * 60;
        break;
      case 'longa':
        this.totalTimeSeconds = 25 * 60;
        break;
      case 'livre':
      default:
        this.totalTimeSeconds = 999999;
        break;
    }
    this.timeRemainingSeconds = this.totalTimeSeconds;
    this.isTimerActive = duration !== 'livre';

    // Spawn players
    const startX = 140;
    const startY = 260;

    const p1 = CharacterSystem.createPlayerState('p1', selectedChar1Id, false, startX, startY);
    this.players.push(p1);
    this.inventories.set('p1', InventorySystem.createEmptyInventory());

    const isP2Bot = gameMode === 'solo' || gameMode === 'tap_to_move';
    const p2 = CharacterSystem.createPlayerState('p2', selectedChar2Id, isP2Bot, startX + 35, startY + 30);
    this.players.push(p2);
    this.inventories.set('p2', InventorySystem.createEmptyInventory());

    // Initialize map tasks
    const mapTaskIds = mapDef.taskSpots.map(t => t.taskId);
    this.activeTasks = TaskSystem.initializeActiveTasks(mapTaskIds);

    // Initialize wheelbarrow
    const cartSpawn = mapDef.itemSpawners.find(s => s.itemId === 'item_carrinho');
    const cartX = cartSpawn ? cartSpawn.x * 32 : 180;
    const cartY = cartSpawn ? cartSpawn.y * 32 : 280;
    this.wheelbarrow = CoopSystem.createWheelbarrow(cartX, cartY, 4);

    // Initial ground items from spawners
    let itemIdCounter = 0;
    mapDef.itemSpawners.forEach(s => {
      if (s.itemId !== 'item_carrinho') {
        this.groundItems.push({
          id: `item_${itemIdCounter++}`,
          itemId: s.itemId,
          x: s.x * 32 + 16,
          y: s.y * 32 + 16
        });
      }
    });
  }

  public update(deltaSeconds: number): void {
    if (this.isMatchEnded) return;

    // 1. Timer countdown
    if (this.isTimerActive && this.matchDuration !== 'livre') {
      this.timeRemainingSeconds = Math.max(0, this.timeRemainingSeconds - deltaSeconds);
      if (this.timeRemainingSeconds <= 0) {
        this.finishMatch();
        return;
      }
    }

    // 2. Events update
    const eventUpdate = EventSystem.updateEvent(this.activeEvent, deltaSeconds);
    this.activeEvent = eventUpdate.updatedEvent;
    if (eventUpdate.phaseChanged && eventUpdate.newEventPhase === 'ended') {
      this.eventsHandledCount++;
    }

    // Random event trigger if none active and chance hits
    if (!this.activeEvent && Math.random() < 0.003) {
      const nextEventDef = EventSystem.pickNextRandomEvent();
      this.activeEvent = EventSystem.startEvent(nextEventDef);
    }

    // 3. Pings clean up
    const now = Date.now();
    this.pings = this.pings.filter(p => p.expiresAt > now);

    // 4. Update Bot Companion AI
    this.players.forEach(player => {
      if (player.isBot) {
        this.updateBotAI(player, deltaSeconds);
      }
    });

    // 5. Update Task progression for working players
    this.updateTasksWork(deltaSeconds);

    // 6. Check Victory Condition
    const allTaskDefs = mapTaskSpotsToDefs(this.mapDef);
    const progress = GoalSystem.calculateProgress(allTaskDefs, this.activeTasks);
    if (progress.allEssentialDone && !this.isMatchEnded) {
      this.finishMatch();
    }
  }

  private updateTasksWork(deltaSeconds: number): void {
    const isRaining = this.activeEvent?.def.type === 'weather' && this.activeEvent.phase === 'active';

    this.mapDef.taskSpots.forEach(spot => {
      const taskState = this.activeTasks.get(spot.taskId);
      if (!taskState || taskState.isCompleted) return;

      const taskDef = TaskSystem.getTaskDefById(spot.taskId);
      if (!taskDef) return;

      const spotWorldX = spot.x * 32;
      const spotWorldY = spot.y * 32;

      // Find players within interaction range (approx 45px)
      const nearbyPlayers = this.players.filter(p => {
        const dist = Math.hypot(p.x - spotWorldX, p.y - spotWorldY);
        return dist <= 48;
      });

      // Valid contributors are players who have tool/item or are assisting
      const activeContributors: PlayerSimulationState[] = [];

      nearbyPlayers.forEach(p => {
        const inv = this.inventories.get(p.id) || [];
        const check = TaskSystem.canPlayerWorkOnTask(taskDef, inv, isRaining);

        if (check.canWork || p.isHelping) {
          activeContributors.push(p);
          p.activeTaskId = spot.taskId;
        } else {
          if (p.activeTaskId === spot.taskId) {
            p.activeTaskId = null;
          }
        }
      });

      if (activeContributors.length > 1) {
        // Cooperation counted!
        this.helpsGivenCount += 1;
      }

      if (activeContributors.length > 0) {
        const res = TaskSystem.updateTaskProgress(taskState, taskDef, activeContributors, deltaSeconds);
        if (res.completedNow) {
          // Consume items from contributors
          activeContributors.forEach(p => {
            const inv = this.inventories.get(p.id);
            if (inv) {
              taskDef.requiredItems.forEach(reqItem => {
                InventorySystem.consumeItem(inv, reqItem);
              });
            }
          });
        }
      }
    });
  }

  private updateBotAI(bot: PlayerSimulationState, deltaSeconds: number): void {
    let timer = this.botThinkTimers.get(bot.id) || 0;
    timer -= deltaSeconds;

    const p1 = this.players.find(p => !p.isBot);
    const p1IsCallingForHelp = p1?.currentSpeechBubble?.includes('ajuda');

    // If P1 called for help or pinged nearby, bot prioritizes running to P1!
    if (p1 && (p1IsCallingForHelp || (p1.activeTaskId && Math.hypot(p1.x - bot.x, p1.y - bot.y) < 220))) {
      const targetX = p1.x + 20;
      const targetY = p1.y + 10;
      this.moveTowards(bot, targetX, targetY, deltaSeconds);
      bot.isHelping = true;
      if (Math.hypot(bot.x - targetX, bot.y - targetY) < 40) {
        bot.currentSpeechBubble = 'Estou aqui ajudando!';
        bot.speechBubbleTimer = 2;
      }
      return;
    }

    bot.isHelping = false;

    // Pick a task to work on if none or every 5 seconds
    if (timer <= 0) {
      this.botThinkTimers.set(bot.id, 4.0);

      // Find an incomplete task
      const openSpot = this.mapDef.taskSpots.find(spot => {
        const state = this.activeTasks.get(spot.taskId);
        return state && !state.isCompleted;
      });

      if (openSpot) {
        this.botTargetTasks.set(bot.id, openSpot.taskId);
      }
    }

    const targetTaskId = this.botTargetTasks.get(bot.id);
    if (!targetTaskId) return;

    const spot = this.mapDef.taskSpots.find(s => s.taskId === targetTaskId);
    const taskDef = TaskSystem.getTaskDefById(targetTaskId);

    if (spot && taskDef) {
      const spotX = spot.x * 32;
      const spotY = spot.y * 32;
      const dist = Math.hypot(bot.x - spotX, bot.y - spotY);

      const inv = this.inventories.get(bot.id) || [];
      const check = TaskSystem.canPlayerWorkOnTask(taskDef, inv);

      if (!check.canWork && taskDef.requiredTool && !InventorySystem.hasTool(inv, taskDef.requiredTool)) {
        // Go fetch tool from ground/spawner
        const toolItem = this.groundItems.find(gi => gi.itemId === taskDef.requiredTool);
        if (toolItem) {
          this.moveTowards(bot, toolItem.x, toolItem.y, deltaSeconds);
          if (Math.hypot(bot.x - toolItem.x, bot.y - toolItem.y) < 30) {
            this.playerPickupItem(bot.id, toolItem.id);
          }
          return;
        }
      }

      // Move to task
      this.moveTowards(bot, spotX, spotY, deltaSeconds);
      if (dist < 40) {
        bot.isHelping = true;
      }
    }
  }

  private moveTowards(bot: PlayerSimulationState, tx: number, ty: number, deltaSeconds: number): void {
    const dx = tx - bot.x;
    const dy = ty - bot.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 8) {
      const speed = CharacterSystem.calculateMoveSpeed(bot);
      bot.vx = (dx / dist) * speed;
      bot.vy = (dy / dist) * speed;
      bot.x += bot.vx * deltaSeconds;
      bot.y += bot.vy * deltaSeconds;
      bot.facingAngle = Math.atan2(dy, dx);
      CharacterSystem.updatePlayer(bot, deltaSeconds, true);
    } else {
      bot.vx = 0;
      bot.vy = 0;
      CharacterSystem.updatePlayer(bot, deltaSeconds, false);
    }
  }

  public playerPickupItem(playerId: string, groundItemId: string): boolean {
    const inv = this.inventories.get(playerId);
    if (!inv || InventorySystem.isFull(inv)) return false;

    const itemIdx = this.groundItems.findIndex(i => i.id === groundItemId);
    if (itemIdx === -1) return false;

    const groundItem = this.groundItems[itemIdx];
    const success = InventorySystem.addItem(inv, groundItem.itemId);
    if (success) {
      this.groundItems.splice(itemIdx, 1);
      return true;
    }
    return false;
  }

  public playerDropItem(playerId: string, slotIndex: number, worldX: number, worldY: number): boolean {
    const inv = this.inventories.get(playerId);
    if (!inv) return false;

    const dropped = InventorySystem.removeItem(inv, slotIndex);
    if (dropped) {
      this.groundItems.push({
        id: `dropped_${Date.now()}_${Math.random()}`,
        itemId: dropped.id,
        x: worldX,
        y: worldY
      });
      return true;
    }
    return false;
  }

  public addPing(x: number, y: number, senderName: string, senderColor: string, icon?: string): PingData {
    const ping = CoopSystem.createPing(x, y, senderName, senderColor, icon);
    this.pings.push(ping);
    return ping;
  }

  public finishMatch(): void {
    this.isMatchEnded = true;
    const allDefs = mapTaskSpotsToDefs(this.mapDef);
    this.stats = GoalSystem.buildSummaryStats(
      this.mapDef.name,
      allDefs,
      this.activeTasks,
      this.helpsGivenCount,
      this.eventsHandledCount,
      this.totalTimeSeconds - this.timeRemainingSeconds
    );
  }

  public continueWithoutTime(): void {
    this.isMatchEnded = false;
    this.isTimerActive = false;
    this.matchDuration = 'livre';
    this.timeRemainingSeconds = 999999;
  }
}

export function mapTaskSpotsToDefs(mapDef: MapDef): TaskDef[] {
  const result: TaskDef[] = [];
  mapDef.taskSpots.forEach(s => {
    const def = TaskSystem.getTaskDefById(s.taskId);
    if (def) result.push(def);
  });
  return result;
}
