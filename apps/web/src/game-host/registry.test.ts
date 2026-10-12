// @vitest-environment jsdom
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { GameManifest } from '@aprumo/protocol';
import { GAMES, SUPPORT_RESOURCES } from './registry';

vi.mock('phaser3spectorjs', () => ({ default: {} }));

beforeAll(() => {
  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = (() => ({
      fillStyle: '',
      fillRect: () => {},
      getImageData: () => ({ data: [0, 0, 0, 0] }),
      putImageData: () => {},
      createImageData: () => ({ data: [0, 0, 0, 0] }),
      drawImage: () => {},
    })) as any;
  }
});

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

  it('includes Phase 2 games: Detetive das Emoções, Circuito Executivo, MiniMundos, and Social City 3D', () => {
    expect(GAMES['detetive-das-emocoes']).toBeDefined();
    expect(GAMES['circuito-executivo']).toBeDefined();
    expect(GAMES['minimundos']).toBeDefined();
    expect(GAMES['social-city']).toBeDefined();

    expect(GAMES['detetive-das-emocoes']!.manifest.name).toBe('Detetive das Emoções');
    expect(GAMES['circuito-executivo']!.manifest.name).toBe('Circuito Executivo');
    expect(GAMES['minimundos']!.manifest.name).toBe('MiniMundos');
    expect(GAMES['social-city']!.manifest.name).toBe('Social City 3D');
  });

  it('includes the 4 specialized ABA and Denver games: Bolhas Mágicas, Tambor da Imitação, Siga o Mestre, and Dança do Congelar', () => {
    expect(GAMES['bolhas-magicas']).toBeDefined();
    expect(GAMES['tambor-da-imitacao']).toBeDefined();
    expect(GAMES['siga-o-mestre']).toBeDefined();
    expect(GAMES['danca-do-congelar']).toBeDefined();

    expect(GAMES['bolhas-magicas']!.manifest.name).toBe('Bolhas Mágicas');
    expect(GAMES['tambor-da-imitacao']!.manifest.name).toBe('Tambor da Imitação');
    expect(GAMES['siga-o-mestre']!.manifest.name).toBe('Siga o Mestre');
    expect(GAMES['danca-do-congelar']!.manifest.name).toBe('Dança do Congelar');
  });

  it('includes the 4 specialized games: Encaixa Aí, Rampa Maluca, Hora do Lanche do Urso, and Fazendinha Sonora', () => {
    expect(GAMES['encaixa-ai']).toBeDefined();
    expect(GAMES['rampa-maluca']).toBeDefined();
    expect(GAMES['lanche-do-urso']).toBeDefined();
    expect(GAMES['fazendinha-sonora']).toBeDefined();

    expect(GAMES['encaixa-ai']!.manifest.name).toBe('Encaixa Aí');
    expect(GAMES['rampa-maluca']!.manifest.name).toBe('Rampa Maluca');
    expect(GAMES['lanche-do-urso']!.manifest.name).toBe('Hora do Lanche do Urso');
    expect(GAMES['fazendinha-sonora']!.manifest.name).toBe('Fazendinha Sonora');
  });

  it('includes all newly incorporated games with total 34 games', () => {
    expect(GAMES['leitura-de-cena']).toBeDefined();
    expect(GAMES['par-perfeito']).toBeDefined();
    expect(GAMES['cada-um-no-seu-pote']).toBeDefined();
    expect(GAMES['mutirao-do-parque']).toBeDefined();
    expect(GAMES['banda-do-tico']).toBeDefined();
    expect(GAMES['torre-derruba']).toBeDefined();
    expect(GAMES['mercadinho-da-esquina']).toBeDefined();
    expect(GAMES['passo-a-passo']).toBeDefined();
    expect(GAMES['quadro-de-conquistas']).toBeDefined();
    expect(GAMES['escape-room-kids']).toBeDefined();
    expect(GAMES['vida-online']).toBeDefined();
    expect(Object.keys(GAMES).length).toBe(34);
  });

  it('validates support resources manifests', () => {
    for (const res of SUPPORT_RESOURCES) {
      const parsed = GameManifest.safeParse(res);
      expect(parsed.success).toBe(true);
      expect(res.kind).toBe('support');
    }
  });

  it('can dynamically load game components without errors', async () => {
    for (const entry of Object.values(GAMES)) {
      const Comp = await entry.load();
      expect(Comp).toBeDefined();
    }
  }, 15000);
});
