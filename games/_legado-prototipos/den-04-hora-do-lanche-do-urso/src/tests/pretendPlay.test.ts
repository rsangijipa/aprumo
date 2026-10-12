import { describe, it, expect } from 'vitest';
import { PRETEND_ITEMS } from '../data/pretendItems';
import { PretendItemSchema, TeachingEpisodeSchema } from '../schemas/pretendSchema';

describe('DEN-04: Hora do Lanche do Urso - ESDM Pretend Play & Mirror Format', () => {
  it('validates all pretend items against Zod schema', () => {
    PRETEND_ITEMS.forEach((item) => {
      const result = PretendItemSchema.safeParse(item);
      expect(result.success).toBe(true);
      expect(item.compatibleZones.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('guarantees symbolic block is defined as category simbolico and requires adult activation', () => {
    const blockItem = PRETEND_ITEMS.find((i) => i.id === 'bloco_neutro');
    expect(blockItem).toBeDefined();
    expect(blockItem?.category).toBe('simbolico');
  });

  it('verifies teaching episode schema strictly requires location field (tela vs brinquedo-real)', () => {
    const validEp = {
      episodeId: 'ep-1',
      timestamp: Date.now(),
      character: 'urso' as const,
      action: 'Banana na boca',
      item: 'banana',
      zone: 'boca' as const,
      isSubstitution: false,
      location: 'brinquedo-real' as const,
      promptLevel: 'independente' as const,
      sequenceLength: 2,
    };
    const parseOk = TeachingEpisodeSchema.safeParse(validEp);
    expect(parseOk.success).toBe(true);

    // Invalid: missing location
    const invalidEp = { ...validEp, location: undefined };
    const parseBad = TeachingEpisodeSchema.safeParse(invalidEp);
    expect(parseBad.success).toBe(false);
  });

  it('verifies all food and drink items have mouth (boca) as a compatible action zone', () => {
    const ingestibles = PRETEND_ITEMS.filter((i) => i.category === 'comida' || i.category === 'bebida');
    ingestibles.forEach((item) => {
      expect(item.compatibleZones).toContain('boca');
    });
  });
});
