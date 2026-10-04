import { describe, expect, it } from 'vitest';
import { counterbalancedPositions, seededRandom } from './random';

describe('counterbalancedPositions', () => {
  it('distribui de forma equilibrada e evita mais de 2 repetições seguidas', () => {
    const pos = counterbalancedPositions(30, 3, seededRandom(42));
    const counts = [0, 1, 2].map((p) => pos.filter((x) => x === p).length);
    expect(counts).toEqual([10, 10, 10]);
    for (let i = 2; i < pos.length; i++) expect(pos[i] === pos[i - 1] && pos[i] === pos[i - 2]).toBe(false);
  });
  it('é reprodutível pela semente', () => {
    expect(counterbalancedPositions(12, 4, seededRandom(7))).toEqual(counterbalancedPositions(12, 4, seededRandom(7)));
  });
});
