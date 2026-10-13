import { PingData, ItemDef } from '../types';

export const QUICK_COMM_MESSAGES = [
  { id: 'comm_pegar_material', text: 'Vou pegar material.', icon: 'Package' },
  { id: 'comm_me_ajuda', text: 'Me ajuda aqui?', icon: 'HeartHandshake' },
  { id: 'comm_cuida_jardim', text: 'Cuida do jardim?', icon: 'Sprout' },
  { id: 'comm_estou_indo', text: 'Estou indo.', icon: 'Navigation' },
  { id: 'comm_espera', text: 'Espera.', icon: 'Clock' },
  { id: 'comm_pronto', text: 'Pronto!', icon: 'CheckCircle2' }
];

export interface WheelbarrowState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  items: (ItemDef | null)[];
  capacity: number; // 3 to 5
  pushingPlayerIds: string[];
}

export class CoopSystem {
  public static createWheelbarrow(x: number, y: number, capacity: number = 4): WheelbarrowState {
    return {
      x,
      y,
      vx: 0,
      vy: 0,
      items: new Array(capacity).fill(null),
      capacity,
      pushingPlayerIds: []
    };
  }

  public static addItemToWheelbarrow(cart: WheelbarrowState, item: ItemDef): boolean {
    const emptyIndex = cart.items.findIndex(it => it === null);
    if (emptyIndex === -1) return false;
    cart.items[emptyIndex] = item;
    return true;
  }

  public static takeItemFromWheelbarrow(cart: WheelbarrowState, index?: number): ItemDef | null {
    if (index !== undefined) {
      if (index >= 0 && index < cart.items.length && cart.items[index] !== null) {
        const item = cart.items[index];
        cart.items[index] = null;
        return item;
      }
      return null;
    }
    // Take first available
    const foundIndex = cart.items.findIndex(it => it !== null);
    if (foundIndex === -1) return null;
    const item = cart.items[foundIndex];
    cart.items[foundIndex] = null;
    return item;
  }

  public static updateWheelbarrowPhysics(
    cart: WheelbarrowState,
    pushersCount: number,
    targetVx: number,
    targetVy: number,
    deltaSeconds: number
  ): void {
    if (pushersCount === 0) {
      // Smooth friction deceleration
      cart.vx *= Math.pow(0.05, deltaSeconds);
      cart.vy *= Math.pow(0.05, deltaSeconds);
    } else {
      // 1 pusher moves at moderate speed; 2 pushers glide 45% faster together!
      const speedMultiplier = pushersCount > 1 ? 1.45 : 1.0;
      const desiredVx = targetVx * speedMultiplier;
      const desiredVy = targetVy * speedMultiplier;

      // Gentle acceleration inertia
      const accel = 6.0;
      cart.vx += (desiredVx - cart.vx) * Math.min(1, accel * deltaSeconds);
      cart.vy += (desiredVy - cart.vy) * Math.min(1, accel * deltaSeconds);
    }

    cart.x += cart.vx * deltaSeconds;
    cart.y += cart.vy * deltaSeconds;
  }

  public static createPing(
    x: number,
    y: number,
    senderName: string,
    senderColor: string,
    icon: string = 'Pin'
  ): PingData {
    const now = Date.now();
    return {
      id: `ping_${now}_${Math.random().toString(36).slice(2, 6)}`,
      x,
      y,
      senderName,
      senderColor,
      icon,
      timestamp: now,
      expiresAt: now + 8000 // 8 seconds timeout
    };
  }
}
