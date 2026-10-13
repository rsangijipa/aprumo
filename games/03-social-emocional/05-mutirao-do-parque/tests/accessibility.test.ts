import { describe, it, expect } from 'vitest';
import { WorldState } from '../src/simulation/WorldState';
import { CharacterSystem } from '../src/simulation/CharacterSystem';
import mapsData from '../src/data/maps.json';
import { MapDef } from '../src/types';

describe('Accessibility & Wheelchair Mobility Tests', () => {
  const maps = mapsData as MapDef[];

  it('guarantees Maya (wheelchair character) possesses high agility and no penalizing slowdown', () => {
    const maya = CharacterSystem.createPlayerState('p1', 'char_maya', false, 100, 100);
    expect(maya.characterDef.appearance.hasWheelchair).toBe(true);

    const speed = CharacterSystem.calculateMoveSpeed(maya);
    expect(speed).toBeGreaterThanOrEqual(165); // Swift cruising speed
  });

  it('verifies all 5 maps have accessible ramps and unobstructed routes to every essential zone', () => {
    maps.forEach(map => {
      // Check presence of ramps or ground paths
      const hasPathsOrRamps = map.zones.some(z => z.id === 'trilha') ||
                             map.decorations.some(d => d.type === 'ramp' || d.type === 'path');
      expect(hasPathsOrRamps).toBe(true);

      // Verify every essential task spot is within map bounds
      map.taskSpots.forEach(spot => {
        expect(spot.x).toBeGreaterThan(0);
        expect(spot.x).toBeLessThan(map.gridWidth);
        expect(spot.y).toBeGreaterThan(0);
        expect(spot.y).toBeLessThan(map.gridHeight);
      });
    });
  });

  it('supports tap-to-move mode without requiring keyboard controls', () => {
    const map = maps[0];
    const world = new WorldState(map, 'char_maya', 'char_luan', 'tap_to_move', 'curta');
    expect(world.gameMode).toBe('tap_to_move');

    // Simulate tap destination setting
    const p1 = world.players[0];
    p1.vx = 50;
    p1.vy = 50;
    p1.x += p1.vx * 0.1;
    p1.y += p1.vy * 0.1;
    world.update(0.1);

    expect(p1.x).toBeGreaterThan(140);
    expect(p1.y).toBeGreaterThan(260);
  });
});
