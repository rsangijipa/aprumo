import { describe, it, expect } from 'vitest';
import {
  generateBinsForRule,
  generateItemsForRule,
  BinPositionManager
} from '../rules/rules';
import type { ClassificationRule } from '../types';

describe('ABA-02 Rules & Item Generation', () => {
  it('generates valid items for all classification rules', () => {
    const rules: ClassificationRule[] = ['cor', 'forma', 'tamanho', 'categoria'];

    for (const rule of rules) {
      const items = generateItemsForRule(rule, 8);
      expect(items.length).toBe(8);

      for (const item of items) {
        expect(item.rule).toBe(rule);
        expect(item.attributeValue).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.svgIcon).toContain('data:image/svg+xml');
      }
    }
  });

  it('generates bins with redundant patterns for daltonismo support', () => {
    const colorBins = generateBinsForRule('cor');
    expect(colorBins.length).toBeGreaterThanOrEqual(2);

    const patterns = colorBins.map(b => b.samplePattern);
    expect(patterns).toContain('liso');
    expect(patterns).toContain('listrado');
    expect(patterns).toContain('pontilhado');
  });

  it('ensures bins never stay in the exact same order for more than 2 consecutive blocks', () => {
    const manager = new BinPositionManager();
    const bins = generateBinsForRule('cor');

    let prev1 = '';
    let prev2 = '';

    for (let block = 0; block < 100; block++) {
      const shuffled = manager.shuffleBins(bins);
      const currentOrder = shuffled.map(b => b.id).join('-');

      if (currentOrder === prev1 && currentOrder === prev2) {
        throw new Error(`Violation: Bins maintained same position 3 times in a row at block ${block}`);
      }

      prev2 = prev1;
      prev1 = currentOrder;
    }
  });
});
