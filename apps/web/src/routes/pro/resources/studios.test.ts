import { describe, it, expect } from 'vitest';
import { REGULATION_ZONES } from './RegulationZonesStudio';
import { THERMOMETER_LEVELS } from './FeelingsThermometerStudio';

describe('Therapeutic Resource Studios Logic & Configuration', () => {
  describe('Regulation Zones (The Zones of Regulation)', () => {
    it('contains exactly 4 core zones', () => {
      expect(REGULATION_ZONES).toHaveLength(4);
      const zoneIds = REGULATION_ZONES.map((z) => z.id);
      expect(zoneIds).toEqual(['blue', 'green', 'yellow', 'red']);
    });

    it('each zone provides sensations, feelings, and coping strategies', () => {
      for (const zone of REGULATION_ZONES) {
        expect(zone.name).toBeTruthy();
        expect(zone.energyLevel).toBeTruthy();
        expect(zone.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(zone.feelings.length).toBeGreaterThan(0);
        expect(zone.sensations.length).toBeGreaterThan(0);
        expect(zone.strategies.length).toBeGreaterThan(0);
      }
    });

    it('green zone represents optimal regulation and calm', () => {
      const green = REGULATION_ZONES.find((z) => z.id === 'green')!;
      expect(green.energyLevel).toContain('Ideal');
      expect(green.feelings).toContain('Calmo');
    });
  });

  describe('Feelings Thermometer (The Incredible 5-Point Scale)', () => {
    it('contains 5 progressive levels from 1 to 5', () => {
      expect(THERMOMETER_LEVELS).toHaveLength(5);
      expect(THERMOMETER_LEVELS.map((l) => l.level)).toEqual([1, 2, 3, 4, 5]);
    });

    it('each level specifies observable behavior and regulation actions', () => {
      for (const level of THERMOMETER_LEVELS) {
        expect(level.looksLike).toBeTruthy();
        expect(level.feelsLike).toBeTruthy();
        expect(level.whatICanDo).toBeTruthy();
        expect(level.emoji).toBeTruthy();
      }
    });

    it('level 1 is relaxed and level 5 is crisis/out of control', () => {
      const l1 = THERMOMETER_LEVELS[0]!;
      const l5 = THERMOMETER_LEVELS[4]!;
      expect(l1.name).toContain('Tranquilo');
      expect(l5.name).toContain('Sem Controle');
    });
  });
});
