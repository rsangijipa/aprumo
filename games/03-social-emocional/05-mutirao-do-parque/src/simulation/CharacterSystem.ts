import { CharacterDef } from '../types';
import charactersData from '../data/characters.json';

export interface PlayerSimulationState {
  id: string;
  name: string;
  characterDef: CharacterDef;
  isBot: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  stamina: number; // 0 - 100
  maxStamina: number;
  specialCooldownRemaining: number;
  isHelping: boolean;
  activeTaskId: string | null;
  speedBoostRemaining: number;
  facingAngle: number;
  currentSpeechBubble: string | null;
  speechBubbleTimer: number;
}

export class CharacterSystem {
  public static getAllCharacters(): CharacterDef[] {
    return charactersData as CharacterDef[];
  }

  public static getCharacterById(id: string): CharacterDef | undefined {
    return (charactersData as CharacterDef[]).find(c => c.id === id);
  }

  public static createPlayerState(
    id: string,
    characterId: string,
    isBot: boolean,
    startX: number,
    startY: number
  ): PlayerSimulationState {
    const charDef = this.getCharacterById(characterId) || (charactersData[0] as CharacterDef);
    return {
      id,
      name: charDef.name,
      characterDef: charDef,
      isBot,
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      stamina: 100,
      maxStamina: 100,
      specialCooldownRemaining: 0,
      isHelping: false,
      activeTaskId: null,
      speedBoostRemaining: 0,
      facingAngle: 0,
      currentSpeechBubble: null,
      speechBubbleTimer: 0
    };
  }

  public static updatePlayer(
    player: PlayerSimulationState,
    deltaSeconds: number,
    isMoving: boolean
  ): void {
    // Stamina recovery when standing still or slow movement
    if (!isMoving) {
      player.stamina = Math.min(player.maxStamina, player.stamina + 25 * deltaSeconds);
    } else {
      // Light stamina consumption during movement
      const drain = player.characterDef.talent === 'organizado' ? 3 : 5;
      player.stamina = Math.max(10, player.stamina - drain * deltaSeconds);
    }

    // Special ability cooldown countdown
    if (player.specialCooldownRemaining > 0) {
      player.specialCooldownRemaining = Math.max(0, player.specialCooldownRemaining - deltaSeconds);
    }

    // Speed boost expiration
    if (player.speedBoostRemaining > 0) {
      player.speedBoostRemaining = Math.max(0, player.speedBoostRemaining - deltaSeconds);
    }

    // Speech bubble auto fade
    if (player.speechBubbleTimer > 0) {
      player.speechBubbleTimer = Math.max(0, player.speechBubbleTimer - deltaSeconds);
      if (player.speechBubbleTimer === 0) {
        player.currentSpeechBubble = null;
      }
    }
  }

  public static calculateMoveSpeed(player: PlayerSimulationState): number {
    let baseSpeed = 165; // base pixels per second

    // Talents
    if (player.characterDef.talent === 'agil') {
      baseSpeed += 30;
    }
    if (player.characterDef.appearance.hasWheelchair) {
      baseSpeed += 15; // Smooth cruising wheel motion
    }

    // Boosts
    if (player.speedBoostRemaining > 0) {
      baseSpeed *= 1.35;
    }

    // Low stamina gently softens speed without jarring stop
    if (player.stamina < 20) {
      baseSpeed *= 0.85;
    }

    return baseSpeed;
  }

  public static activateSpecial(
    player: PlayerSimulationState,
    allPlayers: PlayerSimulationState[]
  ): string | null {
    if (player.specialCooldownRemaining > 0) {
      return null;
    }

    player.specialCooldownRemaining = player.characterDef.specialCooldown;

    const talent = player.characterDef.talent;
    if (talent === 'agil' || talent === 'cuidadoso' || talent === 'criativo') {
      // Apply boost to nearby teammates
      allPlayers.forEach(other => {
        const dist = Math.hypot(other.x - player.x, other.y - player.y);
        if (dist < 180) {
          other.speedBoostRemaining = 8;
          other.stamina = Math.min(other.maxStamina, other.stamina + 35);
        }
      });
      return `${player.name} ativou ${player.characterDef.specialActionName}! A equipe ganhou impulso!`;
    }

    if (talent === 'conciliador') {
      // Calls bot or signals partner with synergy
      allPlayers.forEach(other => {
        if (other.id !== player.id) {
          other.speedBoostRemaining = 6;
        }
      });
      return `${player.name} fez um Chamado Solidário! Cooperação potencializada!`;
    }

    return `${player.name} usou ${player.characterDef.specialActionName}!`;
  }
}
