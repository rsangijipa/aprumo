import { describe, it, expect, beforeEach } from 'vitest';
import { BubbleEngine } from '../utils/physics';

describe('DEN-01: Bolhas - ESDM Sensory-Social Routine Physics Engine', () => {
  let engine: BubbleEngine;

  beforeEach(() => {
    engine = new BubbleEngine();
  });

  it('INVIOLABLE RULE: 500 random child touches never create new bubbles', () => {
    // Start with 10 adult-spawned bubbles
    engine.spawnAdultBubbles(10, 800, 600, 'normal');
    expect(engine.bubbles.length).toBe(10);
    const initialSpawned = engine.totalSpawned;

    // Simulate 500 arbitrary touch events across the viewport
    for (let i = 0; i < 500; i++) {
      const randomX = Math.random() * 800;
      const randomY = Math.random() * 600;
      engine.handleChildTouch(randomX, randomY);
    }

    // Number of spawned bubbles must NEVER increase from child touches
    expect(engine.totalSpawned).toBe(initialSpawned);
    // Bubble count in scene must be less than or equal to initial 10
    expect(engine.bubbles.length).toBeLessThanOrEqual(10);
  });

  it('correctly pops a bubble when child touches inside its radius', () => {
    engine.spawnAdultBubbles(1, 800, 600, 'normal');
    const bubble = engine.bubbles[0];
    const initialCount = engine.bubbles.length;

    // Touch directly at bubble center
    const result = engine.handleChildTouch(bubble.x, bubble.y);

    expect(result.popped).toBe(true);
    expect(result.bubble?.id).toBe(bubble.id);
    expect(engine.bubbles.length).toBe(initialCount - 1);
    expect(engine.totalPopped).toBe(1);
  });

  it('implements expectant pause deceleration within 400ms', () => {
    engine.spawnAdultBubbles(5, 800, 600, 'normal');
    engine.setExpectantPause(true);

    expect(engine.config.isPaused).toBe(true);

    // Simulate 450ms later
    const futureTime = Date.now() + 450;
    engine.update(0.45, 800, 600, futureTime);

    // Pause decay factor should be reduced to micro-oscillation level (<= 0.1)
    expect(engine.config.pauseDecay).toBeLessThanOrEqual(0.1);
  });

  it('respects low sensory profile bubble limit and suppresses particle explosions', () => {
    engine.setLowSensory(true);
    expect(engine.config.maxBubbles).toBe(18);

    // Attempt to spawn 50 bubbles
    engine.spawnAdultBubbles(50, 800, 600, 'normal');
    expect(engine.bubbles.length).toBeLessThanOrEqual(18);

    // Pop one bubble in low sensory mode
    const b = engine.bubbles[0];
    engine.handleChildTouch(b.x, b.y);

    // In low sensory profile, drop particle splatter is suppressed (0 particles)
    expect(engine.particles.length).toBe(0);
  });

  it('enforces soft repulsion between bubbles to prevent collision overlap', () => {
    engine.spawnAdultBubbles(2, 800, 600, 'normal');
    const b1 = engine.bubbles[0];
    const b2 = engine.bubbles[1];

    // Artificially place them very close
    b1.x = 400;
    b1.y = 300;
    b2.x = 405;
    b2.y = 300;

    const initialDistance = Math.abs(b2.x - b1.x);

    // Run physics update for 10 frames
    for (let f = 0; f < 10; f++) {
      engine.update(0.016, 800, 600);
    }

    const finalDistance = Math.abs(b2.x - b1.x);
    expect(finalDistance).toBeGreaterThan(initialDistance);
  });
});
