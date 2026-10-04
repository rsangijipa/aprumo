import { describe, expect, it } from 'vitest';
import { createBubble, PENTATONIC_FREQS, shouldTriggerMilestone } from './logic';

describe('Causa e Efeito', () => {
  it('cria bolhas com frequências pentatônicas suaves válidas', () => {
    const bubble = createBubble('b1', 100, 200, 3);
    expect(PENTATONIC_FREQS).toContain(bubble.noteFreq);
    expect(bubble.size).toBeGreaterThanOrEqual(64);
    expect(bubble.x).toBe(100);
    expect(bubble.y).toBe(200);
  });

  it('detecta marcos de comemoração a cada intervalo definido', () => {
    expect(shouldTriggerMilestone(0, 5)).toBe(false);
    expect(shouldTriggerMilestone(5, 5)).toBe(true);
    expect(shouldTriggerMilestone(7, 5)).toBe(false);
    expect(shouldTriggerMilestone(10, 5)).toBe(true);
  });
});
