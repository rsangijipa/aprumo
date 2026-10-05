import { describe, it, expect } from 'vitest';
import {
  createBubble,
  createBubbleBatch,
  updateBubblePositions,
  popBubble,
  shouldEnterPause,
  resolveMandPromptLevel,
  calculateSpontaneousRate,
} from './logic';

describe('Bolhas Mágicas — Clinical Logic & Mechanics', () => {
  it('creates individual bubbles with valid physics parameters', () => {
    const bubble = createBubble('b-1', 100, 200, 42);
    expect(bubble.id).toBe('b-1');
    expect(bubble.x).toBe(100);
    expect(bubble.y).toBe(200);
    expect(bubble.size).toBeGreaterThanOrEqual(50);
    expect(bubble.speedY).toBeGreaterThan(0);
    expect(bubble.popped).toBe(false);
  });

  it('creates a batch of bubbles respecting bounds', () => {
    const batch = createBubbleBatch(6, 400, 600, 100);
    expect(batch).toHaveLength(6);
    for (const b of batch) {
      expect(b.popped).toBe(false);
      expect(b.x).toBeGreaterThanOrEqual(40);
    }
  });

  it('updates bubble positions moving upward', () => {
    const batch = createBubbleBatch(3, 400, 600, 10);
    const initialY = batch[0]!.y;
    const updated = updateBubblePositions(batch, 400, 600);
    expect(updated[0]!.y).toBeLessThan(initialY);
  });

  it('pops a single bubble correctly without affecting others', () => {
    const batch = createBubbleBatch(3, 400, 600, 10);
    const targetId = batch[1]!.id;
    const { updated, poppedBubble } = popBubble(batch, targetId);

    expect(poppedBubble).not.toBeNull();
    expect(poppedBubble?.id).toBe(targetId);
    expect(updated.find((b) => b.id === targetId)?.popped).toBe(true);
    expect(updated.filter((b) => !b.popped)).toHaveLength(2);
  });

  it('detects when all bubbles are popped to trigger behavioral pause', () => {
    const batch = createBubbleBatch(2, 400, 600, 1);
    expect(shouldEnterPause(batch)).toBe(false);

    const step1 = popBubble(batch, batch[0]!.id).updated;
    expect(shouldEnterPause(step1)).toBe(false);

    const step2 = popBubble(step1, step1[1]!.id).updated;
    expect(shouldEnterPause(step2)).toBe(true);
  });

  it('resolves prompt level based on latency (N0 spontaneous <5s, N1 5-10s, N2 10-15s, N3 >15s)', () => {
    expect(resolveMandPromptLevel(2500)).toBe('N0');
    expect(resolveMandPromptLevel(6000)).toBe('N1');
    expect(resolveMandPromptLevel(12000)).toBe('N2');
    expect(resolveMandPromptLevel(18000)).toBe('N3');
  });

  it('calculates spontaneous mand percentage accurately', () => {
    expect(calculateSpontaneousRate(4, 5)).toBe(80);
    expect(calculateSpontaneousRate(0, 5)).toBe(0);
    expect(calculateSpontaneousRate(0, 0)).toBe(0);
  });
});
