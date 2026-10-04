import { describe, expect, it } from 'vitest';
import { EventPayloads } from '@aprumo/protocol';
import {
  BOARD_THEMES, TOKEN_COUNTS, celebrationLevel, deliverToken, initialBoard, isTokenCount, normalizeTokenCount,
  resolveTheme, resolveVariant, undoToken, validateBoardConfig,
} from './logic';

const cfg = { boardId: 'b1', required: 3, backupReinforcerId: 'r1' };

describe('quantidades e temas', () => {
  it('suporta exatamente 1, 2, 3, 5, 8 e 10 fichas', () => {
    expect([...TOKEN_COUNTS]).toEqual([1, 2, 3, 5, 8, 10]);
    expect(isTokenCount(8)).toBe(true);
    expect(isTokenCount(4)).toBe(false);
    expect(normalizeTokenCount(4)).toBe(3);
    expect(normalizeTokenCount(7)).toBe(8);
    expect(normalizeTokenCount(99)).toBe(10);
    expect(normalizeTokenCount(0)).toBe(1);
    expect(normalizeTokenCount(Number.NaN)).toBe(5);
  });
  it('tem 8 temas e resolve desconhecido para neutro, mantendo os antigos', () => {
    expect(BOARD_THEMES).toHaveLength(8);
    expect(resolveTheme('puzzle')).toBe('puzzle');
    expect(resolveTheme('estrela')).toBe('estrela');
    expect(resolveTheme('pokemon')).toBe('formas');
  });
  it('valida a configuração', () => {
    expect(validateBoardConfig({ required: 5, theme: 'flores', backupReinforcerId: 'x' })).toEqual([]);
    expect(validateBoardConfig({ required: 6, theme: 'x', backupReinforcerId: ' ' })).toHaveLength(3);
  });
  it('variante sóbria a partir de 10 anos', () => {
    expect(resolveVariant({ ageYears: 9 })).toBe('playful');
    expect(resolveVariant({ ageYears: 10 })).toBe('sober');
    expect(resolveVariant({})).toBe('playful');
    expect(resolveVariant({ ageYears: 14, variant: 'playful' })).toBe('playful');
  });
});

describe('entrega de fichas', () => {
  it('emite TOKEN_DELIVERED válidos e BOARD_COMPLETED no último', () => {
    let s = initialBoard();
    const all = [];
    for (let k = 0; k < 4; k++) {
      const r = deliverToken(s, cfg, 't1');
      s = r.state;
      all.push(...r.events);
    }
    expect(all.map((e) => e.type)).toEqual(['TOKEN_DELIVERED', 'TOKEN_DELIVERED', 'TOKEN_DELIVERED', 'BOARD_COMPLETED']);
    expect(all[2]?.payload).toEqual({ boardId: 'b1', tokenIndex: 2, tokensRequired: 3, contingentOn: 't1' });
    for (const e of all) expect(EventPayloads[e.type].safeParse(e.payload).success).toBe(true);
    expect(s).toEqual({ earned: 3, completed: true });
  });
  it('quadro de 1 ficha completa na primeira entrega', () => {
    const r = deliverToken(initialBoard(), { ...cfg, required: 1 });
    expect(r.events).toHaveLength(2);
  });
  it('desfaz a última ficha e reabre o quadro', () => {
    let s = initialBoard();
    for (let k = 0; k < 3; k++) s = deliverToken(s, cfg).state;
    const u = undoToken(s);
    expect(u).toEqual({ state: { earned: 2, completed: false }, undoneIndex: 2, reopened: true });
    expect(undoToken(initialBoard()).undoneIndex).toBeNull();
    const again = deliverToken(u.state, cfg);
    expect(again.events.map((e) => e.type)).toEqual(['TOKEN_DELIVERED', 'BOARD_COMPLETED']);
  });
  it('celebração respeita movimento e sensorial', () => {
    expect(celebrationLevel('static')).toBe('none');
    expect(celebrationLevel('full', 'minimal')).toBe('none');
    expect(celebrationLevel('reduced')).toBe('soft');
    expect(celebrationLevel('full', 'rich')).toBe('glow');
  });
});
