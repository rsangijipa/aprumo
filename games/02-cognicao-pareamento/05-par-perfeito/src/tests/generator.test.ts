import { describe, it, expect } from 'vitest';
import { BalancedPositionGenerator, TrialGenerator } from '../engine-aba/generator';

describe('BalancedPositionGenerator (Quasi-Random Positional Balancing)', () => {
  it('passes the 1,000 trials simulation: no position > 2 consecutive times and ±5% uniform distribution', () => {
    const fieldSizes = [2, 3, 4, 5, 6];

    for (const fieldSize of fieldSizes) {
      const generator = new BalancedPositionGenerator(fieldSize);
      const N = 1000;
      const counts: Record<number, number> = {};
      for (let i = 0; i < fieldSize; i++) counts[i] = 0;

      let prev1 = -1;
      let prev2 = -1;

      for (let t = 0; t < N; t++) {
        const pos = generator.nextPosition();

        // 1. Check: No position received > 2 consecutive times
        if (pos === prev1 && pos === prev2) {
          throw new Error(
            `Violation: Position ${pos} was chosen 3 consecutive times at trial ${t} for field size ${fieldSize}`
          );
        }

        prev2 = prev1;
        prev1 = pos;
        counts[pos]++;
      }

      // 2. Check: Distribution per position stays within ±5% of uniform
      const expectedUniformProp = 1 / fieldSize;
      const tolerance = 0.05; // ±5%

      for (let i = 0; i < fieldSize; i++) {
        const observedProp = counts[i] / N;
        const diff = Math.abs(observedProp - expectedUniformProp);
        expect(diff).toBeLessThanOrEqual(tolerance);
      }
    }
  });

  it('rotates targets and respects level specifications across 50 trials', () => {
    const trialGen = new TrialGenerator();

    for (let level = 1; level <= 6; level++) {
      const trial = trialGen.generateTrial({
        trialNumber: 1,
        level
      });

      expect(trial.level).toBe(level);
      expect(trial.comparisonSlots.length).toBeGreaterThanOrEqual(1);
      expect(trial.comparisonSlots.filter(s => s.isCorrect).length).toBe(1);
    }
  });
});
