import { describe, expect, it } from 'vitest';
import { seededRandom } from '@aprumo/game-sdk';
import {
  blowBubbles,
  bubblesPerRound,
  calculateSpontaneousRate,
  createBubble,
  mandLevelFrom,
  MAND_LEVELS,
  nextMandLevel,
  popBubble,
  promptSchedule,
  resolveMandPromptLevel,
  sentenceReady,
  shouldEnterPause,
  splitGiant,
  startMandLevel,
  stepBubbles,
} from './logic';

const bounds = { left: 0, top: 70, right: 500, bottom: 700 };

describe('Bolhas Mágicas — mando e física', () => {
  it('três fases de mando em ordem (mais → escolha → frase)', () => {
    expect(MAND_LEVELS.map((l) => l.phase)).toEqual(['single', 'choice', 'sentence']);
    expect(startMandLevel({ mandLevel: 2 })).toBe(2);
    expect(startMandLevel({ mandLevel: 9 })).toBe(2);
    expect(startMandLevel({})).toBe(0);
  });

  it('agenda de dicas cresce em intrusividade e respeita o atraso base', () => {
    const s = promptSchedule(4000);
    expect(s.map((p) => p.level)).toEqual(['N1', 'N2', 'N3']);
    expect(s.map((p) => p.atMs)).toEqual([4000, 8000, 12000]);
    expect(s[0]!.intrusiveness).toBeLessThan(s[2]!.intrusiveness);
    expect(promptSchedule(null)[0]!.atMs).toBe(5000);
    expect(promptSchedule(100)[0]!.atMs).toBe(2000);
  });

  it('o nível da tentativa é a dica mais intrusiva entregue', () => {
    expect(mandLevelFrom([])).toBe('N0');
    expect(mandLevelFrom(['N1'])).toBe('N1');
    expect(mandLevelFrom(['N1', 'N2', 'N3'])).toBe('N3');
    expect(resolveMandPromptLevel(12000)).toBe('N2');
  });

  it('sobe de fase só com mandos espontâneos seguidos', () => {
    expect(nextMandLevel(0, 1)).toBe(0);
    expect(nextMandLevel(0, 2)).toBe(1);
    expect(nextMandLevel(2, 5)).toBe(2);
  });

  it('tira de frase só fica pronta com QUERO + reforçador', () => {
    expect(sentenceReady(['quero', 'bolhona'])).toBe('bolhona');
    expect(sentenceReady(['', 'bolhona'])).toBeNull();
    expect(sentenceReady(['quero'])).toBeNull();
  });

  it('a varinha sopra para cima, as bolhas ficam no céu e estouram sozinhas no fim da vida', () => {
    const rnd = seededRandom(4);
    const bs = blowBubbles('t', 6, { x: 70, y: 600 }, rnd);
    expect(bs.every((b) => b.vy < 0)).toBe(true);
    let expired = 0;
    for (let i = 0; i < 30 * 25; i++) {
      const gone = stepBubbles(bs, 1 / 30, i / 30, bounds);
      expired += gone.length;
      for (const b of bs) {
        expect(b.x - b.r).toBeGreaterThanOrEqual(-0.01);
        expect(b.y - b.r).toBeGreaterThanOrEqual(bounds.top - 0.01);
      }
      gone.forEach((g) => bs.splice(bs.indexOf(g), 1));
    }
    expect(expired).toBe(6);
  });

  it('a bolhona pede dois toques e se divide em bolhinhas', () => {
    const [g] = blowBubbles('g', 1, { x: 100, y: 300 }, seededRandom(1), 'giant');
    expect(g!.hp).toBe(2);
    const minis = splitGiant(g!, seededRandom(2));
    expect(minis).toHaveLength(4);
    expect(minis.every((m) => m.kind === 'mini' && m.r * 2 >= 64)).toBe(true);
  });

  it('quantidade por rodada cresce e respeita a adaptação', () => {
    expect(bubblesPerRound(0, 3, 'bolhinhas')).toBe(4);
    expect(bubblesPerRound(10, 3, 'bolhinhas')).toBe(9);
    expect(bubblesPerRound(3, 3, 'bolhona')).toBe(1);
  });

  it('API legada continua funcionando', () => {
    const b = createBubble('x', 10, 20, 3);
    const { updated, poppedBubble } = popBubble([b], 'x');
    expect(poppedBubble?.id).toBe('x');
    expect(shouldEnterPause(updated)).toBe(true);
    expect(calculateSpontaneousRate(3, 4)).toBe(75);
  });
});
