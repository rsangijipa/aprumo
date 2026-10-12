import { describe, it, expect } from 'vitest';
import {
  WORLD_ENVIRONMENTS,
  getWorld,
  checkMissionProgress,
  planWorldTrials,
} from './logic';

describe('MiniMundos — logic', () => {
  it('contains all 4 representative environments with objects and missions', () => {
    const worlds = planWorldTrials();
    expect(worlds.length).toBe(4);
    for (const w of worlds) {
      expect(w.name).toBeTruthy();
      expect(w.objects.length).toBeGreaterThanOrEqual(4);
      expect(w.mission.targetObjectIds.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('evaluates mission completion correctly', () => {
    const mission = WORLD_ENVIRONMENTS.casa.mission;
    expect(checkMissionProgress(mission, []).isCompleted).toBe(false);
    expect(checkMissionProgress(mission, ['cama']).isCompleted).toBe(false);
    expect(checkMissionProgress(mission, ['cama', 'lampada']).isCompleted).toBe(true);
    expect(checkMissionProgress(mission, ['cama', 'lampada', 'fruta']).isCompleted).toBe(true);
  });

  it('retrieves specific world environment by theme', () => {
    const mercado = getWorld('mercado');
    expect(mercado.name).toContain('Mercadinho');
    expect(mercado.objects.map((o) => o.id)).toContain('carrinho');
  });
});
