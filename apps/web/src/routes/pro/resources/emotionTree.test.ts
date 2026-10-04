import { describe, it, expect } from 'vitest';
import {
  EMOTION_ZONES,
  BREATHING_CYCLE,
  getZoneData,
  type EmotionZoneKey,
} from './emotionTree';

describe('emotionTree & somatic regulation logic', () => {
  it('defines all 5 emotional / somatic zones', () => {
    const keys: EmotionZoneKey[] = ['green', 'yellow', 'red', 'blue', 'purple'];
    for (const k of keys) {
      const zone = getZoneData(k);
      expect(zone).toBeDefined();
      expect(zone.labelChild).toBeTruthy();
      expect(zone.labelTeen).toBeTruthy();
      expect(zone.strategies.length).toBeGreaterThanOrEqual(3);
      expect(zone.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('provides structured 4-2-4 breathing phases', () => {
    expect(BREATHING_CYCLE.length).toBe(3);
    expect(BREATHING_CYCLE[0]?.seconds).toBe(4);
    expect(BREATHING_CYCLE[1]?.seconds).toBe(2);
    expect(BREATHING_CYCLE[2]?.seconds).toBe(4);
  });

  it('includes somatic strategies with icons and instructions for every zone', () => {
    Object.values(EMOTION_ZONES).forEach((zone) => {
      zone.strategies.forEach((st) => {
        expect(st.title).toBeTruthy();
        expect(st.instruction).toBeTruthy();
        expect(st.icon).toBeTruthy();
      });
    });
  });
});
