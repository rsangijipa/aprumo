import { describe, expect, it } from 'vitest';
import { seededRandom } from '@aprumo/game-sdk';
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import { ANIMALS } from './Art';
import { animalMotif, buildBoard, evaluatePair, gridCols, isMatch, levelOutcome, maxPairsFor, partnerPos, planLevels, planMemoryBoard } from './logic';

const cfg = (maxChoices: number, params: Record<string, unknown> = {}): SessionConfig => ({
  protocolVersion: PROTOCOL_VERSION,
  runId: 'r',
  appId: 'memoria-bichos',
  appVersion: '2.0.0',
  childDisplayName: 'Teo',
  clinical: { model: 'ABA', targets: [], trialsPerTarget: 4, interleave: false, seed: 42 },
  adaptation: { ...DEFAULT_ADAPTATION, maxChoices },
  params,
});

describe('Memória dos Bichos', () => {
  it('fases crescem em pares e respeitam o teto da adaptação', () => {
    expect(planLevels(cfg(3)).map((l) => l.pairs)).toEqual([2, 3, 4]);
    expect(planLevels(cfg(6)).map((l) => l.pairs)).toEqual([2, 3, 4, 6]);
    expect(planLevels(cfg(1)).map((l) => l.pairs)).toEqual([2]);
    expect(planLevels(cfg(3, { maxPairs: 6, levels: 2 })).map((l) => l.pairs)).toEqual([2, 3]);
    expect(maxPairsFor(cfg(12))).toBe(6);
  });

  it('as primeiras fases têm espiada; dá para desligar', () => {
    const lv = planLevels(cfg(6));
    expect(lv[0]!.previewMs).toBeGreaterThan(lv[1]!.previewMs);
    expect(lv[2]!.previewMs).toBe(0);
    expect(planLevels(cfg(6, { preview: false })).every((l) => l.previewMs === 0)).toBe(true);
  });

  it('todos os bichos da fase existem no acervo e não se repetem na fase', () => {
    for (const l of planLevels(cfg(6))) {
      expect(new Set(l.animals).size).toBe(l.pairs);
      expect(l.animals.every((a) => ANIMALS[a])).toBe(true);
    }
  });

  it('monta tabuleiro com exatamente 2 cartas de cada bicho', () => {
    const b = buildBoard({ animals: ['gato', 'sapo', 'vaca'] }, seededRandom(1));
    expect(b).toHaveLength(6);
    for (const a of ['gato', 'sapo', 'vaca']) expect(b.filter((c) => c.pairKey === a)).toHaveLength(2);
    expect(isMatch(b[0]!, b[partnerPos(b, 0)]!)).toBe(true);
  });

  it('avalia tentativa com posição do alvo, revisita e "sabia mas errou"', () => {
    const b = buildBoard({ animals: ['gato', 'sapo'] }, seededRandom(9));
    const p = partnerPos(b, 0);
    const other = [1, 2, 3].find((i) => i !== p)!;
    expect(evaluatePair(b, 0, p, new Set([0]))).toMatchObject({ match: true, positionOfTarget: p });
    expect(evaluatePair(b, 0, other, new Set([0, p]))).toMatchObject({ match: false, knownMiss: true });
    expect(evaluatePair(b, 0, other, new Set([0, other]))).toMatchObject({ revisit: true, knownMiss: false });
  });

  it('repete a fase uma única vez quando há muitos erros', () => {
    expect(levelOutcome(5, 2, false)).toBe('repeated');
    expect(levelOutcome(5, 2, true)).toBe('advanced');
    expect(levelOutcome(2, 2, false)).toBe('advanced');
  });

  it('grade, motivos sonoros e API legada', () => {
    expect([4, 6, 8, 12].map(gridCols)).toEqual([2, 3, 4, 4]);
    expect(animalMotif('sapo').length).toBeGreaterThan(0);
    expect(planMemoryBoard(cfg(3))).toHaveLength(4);
  });
});
