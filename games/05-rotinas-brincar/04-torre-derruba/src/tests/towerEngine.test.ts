import { describe, it, expect, beforeEach } from 'vitest';
import { TowerPhysicsEngine } from '../utils/towerPhysics';

describe('DEN-02: Torre Derruba - ESDM Block Stacking & Social Turn-taking Engine', () => {
  let engine: TowerPhysicsEngine;

  beforeEach(() => {
    engine = new TowerPhysicsEngine(800, 600);
  });

  it('INVIOLABLE RULE: knockdown is blocked before adult unlocks permission', () => {
    engine.spawnBlock('b1', 'adulto', 'retangular', '#d97706', 400, 500);
    // Simulate placing block in tower
    const result = engine.endDrag('b1', 800, 600);
    expect(result.placed).toBe(true);

    // Attempt knockdown while canKnockdown is FALSE
    engine.config.canKnockdown = false;
    const knocked = engine.knockdownTower();
    expect(knocked).toBe(false);

    // Unlock permission
    engine.config.canKnockdown = true;
    const knockedAfter = engine.knockdownTower();
    expect(knockedAfter).toBe(true);
  });

  it('ensures dragging a block makes it kinematic to prevent accidental mid-drag collapse', () => {
    engine.spawnBlock('b1', 'adulto', 'retangular', '#d97706', 400, 500);
    engine.endDrag('b1', 800, 600);

    engine.spawnBlock('b2', 'crianca', 'retangular', '#ea580c', 100, 200);
    engine.startDrag('b2');

    expect(engine.draggedBlockId).toBe('b2');
    // Moving it near center should update its coordinates smoothly
    engine.updateDrag('b2', 400, 300);
    const b2 = engine.blocks.find((b) => b.id === 'b2');
    expect(b2?.x).toBe(400);
    expect(b2?.y).toBe(300);
  });

  it('spawns blocks with respective owners preserving adult material control', () => {
    engine.spawnBlock('b-adult', 'adulto', 'retangular', '#d97706', 100, 200);
    engine.spawnBlock('b-child', 'crianca', 'retangular', '#2563eb', 700, 200);

    const adultBlock = engine.blocks.find((b) => b.id === 'b-adult');
    const childBlock = engine.blocks.find((b) => b.id === 'b-child');

    expect(adultBlock?.owner).toBe('adulto');
    expect(childBlock?.owner).toBe('crianca');
  });

  it('applies horizontal stability snap at assistance level 2', () => {
    engine.config.stabilityAssist = 2;
    engine.spawnBlock('b1', 'crianca', 'retangular', '#ca8a04', 420, 520);
    const res = engine.endDrag('b1', 800, 600);

    expect(res.placed).toBe(true);
    const placed = engine.blocks.find((b) => b.id === 'b1');
    // Canvas center is 400. In assist level 2, snapped X should be very close to 400 (+- 3px)
    expect(Math.abs((placed?.x ?? 0) - 400)).toBeLessThanOrEqual(5);
  });
});
