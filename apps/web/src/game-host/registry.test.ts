import { describe, it, expect } from 'vitest';
import { GameManifest } from '@aprumo/protocol';
import { GAMES, SUPPORT_RESOURCES } from './registry';

describe('Game Registry Release Gate', () => {
  it('registers all games with valid clinical manifests and matching keys', () => {
    const entries = Object.entries(GAMES);
    expect(entries.length).toBeGreaterThanOrEqual(14);

    for (const [key, entry] of entries) {
      expect(entry.manifest.appId).toBe(key);
      const parsed = GameManifest.safeParse(entry.manifest);
      if (!parsed.success) {
        throw new Error(`Invalid manifest for game ${key}: ${parsed.error.message}`);
      }
      expect(parsed.success).toBe(true);

      // Clinical parameters assertions
      expect(entry.manifest.clinical.purposes.length).toBeGreaterThan(0);
      expect(entry.manifest.clinical.repertoires.length).toBeGreaterThan(0);
      expect(entry.manifest.clinical.ageRangeMonths[0]).toBeLessThan(entry.manifest.clinical.ageRangeMonths[1]);
      expect(typeof entry.load).toBe('function');
    }
  });

  it('includes Phase 2 games: Detetive das Emoções, Circuito Executivo, and MiniMundos', () => {
    expect(GAMES['detetive-das-emocoes']).toBeDefined();
    expect(GAMES['circuito-executivo']).toBeDefined();
    expect(GAMES['minimundos']).toBeDefined();

    expect(GAMES['detetive-das-emocoes']!.manifest.name).toBe('Detetive das Emoções');
    expect(GAMES['circuito-executivo']!.manifest.name).toBe('Circuito Executivo');
    expect(GAMES['minimundos']!.manifest.name).toBe('MiniMundos');
  });

  it('validates support resources manifests', () => {
    for (const res of SUPPORT_RESOURCES) {
      const parsed = GameManifest.safeParse(res);
      expect(parsed.success).toBe(true);
      expect(res.kind).toBe('support');
    }
  });

  it('can dynamically load game components without errors', async () => {
    for (const [key, entry] of Object.entries(GAMES)) {
      const Comp = await entry.load();
      expect(Comp).toBeDefined();
    }
  });
});
