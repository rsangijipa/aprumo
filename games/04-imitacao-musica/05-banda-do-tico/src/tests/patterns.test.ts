// src/tests/patterns.test.ts
import { describe, it, expect } from 'vitest';
import { PATTERNS_LIBRARY } from '../rhythm/patterns/library';

describe('Rhythm Patterns Library', () => {
  it('contains at least 30 diverse rhythmic patterns as required by criterion 9', () => {
    expect(PATTERNS_LIBRARY.length).toBeGreaterThanOrEqual(30);
  });

  it('ensures each pattern has valid metadata and steps', () => {
    PATTERNS_LIBRARY.forEach((pattern) => {
      expect(pattern.id).toBeTruthy();
      expect(pattern.name).toBeTruthy();
      expect(pattern.style).toBeTruthy();
      expect(pattern.defaultBpm).toBeGreaterThanOrEqual(60);
      expect(pattern.defaultBpm).toBeLessThanOrEqual(160);
      expect(pattern.lengthBeats).toBeGreaterThan(0);
      expect(pattern.steps.length).toBeGreaterThan(0);

      pattern.steps.forEach((step) => {
        expect(step.beat).toBeGreaterThanOrEqual(0);
        expect(step.beat).toBeLessThan(pattern.lengthBeats);
        expect(step.instrumentId).toBeTruthy();
      });
    });
  });
});
