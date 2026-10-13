import { describe, it, expect } from 'vitest';
import { InventorySystem } from '../src/simulation/InventorySystem';

describe('InventorySystem', () => {
  it('should initialize with exactly 3 empty slots', () => {
    const inv = InventorySystem.createEmptyInventory();
    expect(inv.length).toBe(3);
    expect(inv.every(s => s.item === null)).toBe(true);
    expect(InventorySystem.isFull(inv)).toBe(false);
  });

  it('should add item when slots are available', () => {
    const inv = InventorySystem.createEmptyInventory();
    const success = InventorySystem.addItem(inv, 'item_pa');
    expect(success).toBe(true);
    expect(inv[0].item?.id).toBe('item_pa');
    expect(InventorySystem.hasTool(inv, 'item_pa')).toBe(true);
    expect(InventorySystem.hasItem(inv, 'item_pa')).toBe(true);
  });

  it('should reject adding item when inventory is full (3 items)', () => {
    const inv = InventorySystem.createEmptyInventory();
    InventorySystem.addItem(inv, 'item_pa');
    InventorySystem.addItem(inv, 'item_regador');
    InventorySystem.addItem(inv, 'item_pincel');

    expect(InventorySystem.isFull(inv)).toBe(true);
    const addedFourth = InventorySystem.addItem(inv, 'item_parafusos');
    expect(addedFourth).toBe(false);
  });

  it('should remove and drop items correctly', () => {
    const inv = InventorySystem.createEmptyInventory();
    InventorySystem.addItem(inv, 'item_muda_ipe');
    expect(inv[0].item?.id).toBe('item_muda_ipe');

    const removed = InventorySystem.removeItem(inv, 0);
    expect(removed?.id).toBe('item_muda_ipe');
    expect(inv[0].item).toBe(null);
  });

  it('should consume consumable items gradually without losing other slots', () => {
    const inv = InventorySystem.createEmptyInventory();
    InventorySystem.addItem(inv, 'item_muda_ipe'); // consumable

    expect(inv[0].usesLeft).toBe(3);
    InventorySystem.consumeItem(inv, 'item_muda_ipe');
    expect(inv[0].usesLeft).toBe(2);
    InventorySystem.consumeItem(inv, 'item_muda_ipe');
    expect(inv[0].usesLeft).toBe(1);
    InventorySystem.consumeItem(inv, 'item_muda_ipe');
    // Once depleted, slot becomes empty
    expect(inv[0].item).toBe(null);
  });
});
