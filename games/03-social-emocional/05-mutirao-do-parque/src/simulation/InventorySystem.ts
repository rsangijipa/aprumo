import { InventorySlot, ItemDef } from '../types';
import { ALL_ITEMS } from '../data/items';

export class InventorySystem {
  public static readonly MAX_SLOTS = 3;

  public static createEmptyInventory(): InventorySlot[] {
    return [
      { item: null },
      { item: null },
      { item: null }
    ];
  }

  public static addItem(inventory: InventorySlot[], itemId: string): boolean {
    const itemDef = ALL_ITEMS[itemId];
    if (!itemDef) return false;

    // Find first empty slot
    const emptySlot = inventory.find(slot => slot.item === null);
    if (!emptySlot) return false;

    emptySlot.item = itemDef;
    emptySlot.usesLeft = itemDef.consumable ? 3 : undefined;
    return true;
  }

  public static removeItem(inventory: InventorySlot[], slotIndex: number): ItemDef | null {
    if (slotIndex < 0 || slotIndex >= inventory.length) return null;
    const current = inventory[slotIndex].item;
    inventory[slotIndex].item = null;
    inventory[slotIndex].usesLeft = undefined;
    return current;
  }

  public static hasItem(inventory: InventorySlot[], itemId: string): boolean {
    return inventory.some(slot => slot.item?.id === itemId);
  }

  public static hasTool(inventory: InventorySlot[], toolId?: string): boolean {
    if (!toolId) return true;
    return inventory.some(slot => slot.item?.id === toolId);
  }

  public static consumeItem(inventory: InventorySlot[], itemId: string): boolean {
    const slot = inventory.find(s => s.item?.id === itemId);
    if (!slot || !slot.item) return false;

    if (slot.usesLeft !== undefined && slot.usesLeft > 1) {
      slot.usesLeft -= 1;
      return true;
    }

    // Consumed completely
    slot.item = null;
    slot.usesLeft = undefined;
    return true;
  }

  public static isFull(inventory: InventorySlot[]): boolean {
    return inventory.every(slot => slot.item !== null);
  }
}
