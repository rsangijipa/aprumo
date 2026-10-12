import { describe, it, expect } from 'vitest';
import {
  calculateNormalizedAngleError,
  calculateDistance,
  evaluateSnap,
} from '../utils/snapMath';

describe('ABA-03: Angular & Snap Math (snapMath.ts)', () => {
  describe('calculateNormalizedAngleError', () => {
    it('returns 0 for identical angles', () => {
      expect(calculateNormalizedAngleError(0, 0)).toBe(0);
      expect(calculateNormalizedAngleError(90, 90)).toBe(0);
      expect(calculateNormalizedAngleError(360, 0)).toBe(0);
    });

    it('wraps around 0/360 degrees boundary correctly', () => {
      // 10 deg and 350 deg are 20 deg apart
      expect(calculateNormalizedAngleError(10, 350)).toBe(20);
      expect(calculateNormalizedAngleError(350, 10)).toBe(20);

      // 5 deg and 355 deg are 10 deg apart
      expect(calculateNormalizedAngleError(5, 355)).toBe(10);
    });

    it('calculates right angles and opposite angles accurately', () => {
      expect(calculateNormalizedAngleError(0, 90)).toBe(90);
      expect(calculateNormalizedAngleError(0, 180)).toBe(180);
      expect(calculateNormalizedAngleError(0, 270)).toBe(90);
    });

    it('handles negative angles properly', () => {
      expect(calculateNormalizedAngleError(-45, 45)).toBe(90);
      expect(calculateNormalizedAngleError(-10, 10)).toBe(20);
      expect(calculateNormalizedAngleError(-350, 10)).toBe(0);
    });

    it('handles multi-revolution angles', () => {
      expect(calculateNormalizedAngleError(720, 0)).toBe(0);
      expect(calculateNormalizedAngleError(730, 0)).toBe(10);
    });
  });

  describe('calculateDistance', () => {
    it('calculates Euclidean distance correctly', () => {
      expect(calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(calculateDistance({ x: 100, y: 100 }, { x: 100, y: 100 })).toBe(0);
      expect(calculateDistance({ x: 10, y: 20 }, { x: 10, y: 50 })).toBe(30);
    });
  });

  describe('evaluateSnap', () => {
    const cavityPos = { x: 200, y: 200 };
    const targetAngle = 0;
    const captureRadiusPx = 50;
    const angleToleranceDeg = 20;

    it('snaps when position and angle are within tolerance', () => {
      const piecePos = { x: 215, y: 210 }; // distance ~18px (< 50px)
      const currentAngle = 12; // error 12 deg (< 20 deg)

      const result = evaluateSnap(
        piecePos,
        cavityPos,
        currentAngle,
        targetAngle,
        captureRadiusPx,
        angleToleranceDeg,
        true
      );

      expect(result.canSnap).toBe(true);
      expect(result.isWithinDistance).toBe(true);
      expect(result.isWithinAngle).toBe(true);
    });

    it('fails to snap when position is too far, even if angle is 0', () => {
      const piecePos = { x: 270, y: 200 }; // distance 70px (> 50px)
      const currentAngle = 0;

      const result = evaluateSnap(
        piecePos,
        cavityPos,
        currentAngle,
        targetAngle,
        captureRadiusPx,
        angleToleranceDeg,
        true
      );

      expect(result.canSnap).toBe(false);
      expect(result.isWithinDistance).toBe(false);
    });

    it('fails to snap when angle exceeds tolerance, even if position is exact', () => {
      const piecePos = { x: 200, y: 200 }; // exact position
      const currentAngle = 45; // 45 deg error (> 20 deg)

      const result = evaluateSnap(
        piecePos,
        cavityPos,
        currentAngle,
        targetAngle,
        captureRadiusPx,
        angleToleranceDeg,
        true
      );

      expect(result.canSnap).toBe(false);
      expect(result.isWithinDistance).toBe(true);
      expect(result.isWithinAngle).toBe(false);
    });

    it('ignores angle error when allowRotation is false (levels 1-3)', () => {
      const piecePos = { x: 210, y: 200 }; // distance 10px (< 50px)
      const currentAngle = 90; // normally invalid, but allowRotation is false

      const result = evaluateSnap(
        piecePos,
        cavityPos,
        currentAngle,
        targetAngle,
        captureRadiusPx,
        angleToleranceDeg,
        false // rotation disabled
      );

      expect(result.canSnap).toBe(true);
      expect(result.angleErrorDeg).toBe(0);
    });
  });
});
