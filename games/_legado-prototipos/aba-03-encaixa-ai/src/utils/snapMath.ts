import type { Point } from '../types/puzzle';

/**
 * Calculates the shortest angular difference between two angles in degrees,
 * properly normalized in the range [0, 180].
 * Matches spec formula: min(|a - b|, 360 - |a - b|)
 */
export function calculateNormalizedAngleError(angleA: number, angleB: number): number {
  // Normalize both angles to [0, 360)
  const a = ((angleA % 360) + 360) % 360;
  const b = ((angleB % 360) + 360) % 360;
  const rawDiff = Math.abs(a - b);
  return Math.min(rawDiff, 360 - rawDiff);
}

/**
 * Calculates Euclidean distance between two 2D points.
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

export interface SnapEvaluationResult {
  canSnap: boolean;
  distancePx: number;
  angleErrorDeg: number;
  isWithinDistance: boolean;
  isWithinAngle: boolean;
}

/**
 * Evaluates whether a piece meets the criteria to snap into a cavity.
 */
export function evaluateSnap(
  piecePos: Point,
  cavityPos: Point,
  currentAngle: number,
  targetAngle: number,
  captureRadiusPx: number,
  angleToleranceDeg: number,
  allowRotation: boolean
): SnapEvaluationResult {
  const distancePx = calculateDistance(piecePos, cavityPos);
  const angleErrorDeg = allowRotation
    ? calculateNormalizedAngleError(currentAngle, targetAngle)
    : 0; // If rotation is disabled for early levels, angle is considered aligned

  const isWithinDistance = distancePx <= captureRadiusPx;
  const isWithinAngle = !allowRotation || angleErrorDeg <= angleToleranceDeg;

  return {
    canSnap: isWithinDistance && isWithinAngle,
    distancePx,
    angleErrorDeg,
    isWithinDistance,
    isWithinAngle,
  };
}
