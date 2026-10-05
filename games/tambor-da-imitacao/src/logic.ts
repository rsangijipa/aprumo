export type DrumZone = 'center' | 'rim';

export interface DrumSequenceItem {
  id: string;
  zone: DrumZone;
  durationMs: number;
}

export type TamborPhase = 'reciprocity' | 'imitation';

export interface TamborState {
  phase: TamborPhase;
  level: number;
  expectedPattern: DrumZone[];
  childInput: DrumZone[];
  masteredCount: number;
  isModelPlaying: boolean;
  isChildTurn: boolean;
  status: 'idle' | 'demonstrating' | 'awaiting_child' | 'success' | 'retry' | 'finished';
}

/** Predefined sequence pool for structured Denver imitation levels */
export const IMITATION_LEVEL_PATTERNS: Record<number, DrumZone[][]> = {
  1: [
    ['center'],
    ['rim'],
    ['center'],
  ],
  2: [
    ['center', 'center'],
    ['rim', 'rim'],
    ['center', 'rim'],
    ['rim', 'center'],
  ],
  3: [
    ['center', 'rim', 'center'],
    ['rim', 'center', 'rim'],
    ['center', 'center', 'rim'],
    ['rim', 'rim', 'center'],
  ],
};

/** Get the next target pattern for a given level and round index */
export function getPatternForLevel(level: number, roundIndex: number): DrumZone[] {
  const safeLevel = Math.max(1, Math.min(3, level));
  const pool = IMITATION_LEVEL_PATTERNS[safeLevel] ?? IMITATION_LEVEL_PATTERNS[1] ?? [['center']];
  const item = pool[roundIndex % pool.length];
  return item ?? pool[0] ?? ['center'];
}

export interface BeatEvaluation {
  matchSoFar: boolean;
  isComplete: boolean;
  isError: boolean;
  matchedCount: number;
  targetCount: number;
}

/** Evaluates the child's input sequence against the expected pattern */
export function evaluateInputSequence(
  expected: DrumZone[],
  currentInput: DrumZone[]
): BeatEvaluation {
  if (currentInput.length === 0) {
    return {
      matchSoFar: true,
      isComplete: false,
      isError: false,
      matchedCount: 0,
      targetCount: expected.length,
    };
  }

  // Check if every hit so far matches the target prefix
  for (let i = 0; i < currentInput.length; i++) {
    if (i >= expected.length || currentInput[i] !== expected[i]) {
      return {
        matchSoFar: false,
        isComplete: false,
        isError: true,
        matchedCount: i,
        targetCount: expected.length,
      };
    }
  }

  const isComplete = currentInput.length === expected.length;

  return {
    matchSoFar: true,
    isComplete,
    isError: false,
    matchedCount: currentInput.length,
    targetCount: expected.length,
  };
}

/** Audio synthesis parameters for each drum zone */
export interface PercussionSoundParam {
  zone: DrumZone;
  baseFreq: number;
  endFreq: number;
  dur: number;
  type: OscillatorType;
  filterFreq: number;
}

export function getPercussionParams(zone: DrumZone): PercussionSoundParam {
  if (zone === 'center') {
    return {
      zone: 'center',
      baseFreq: 160,
      endFreq: 45,
      dur: 0.28,
      type: 'sine',
      filterFreq: 300,
    };
  }
  return {
    zone: 'rim',
    baseFreq: 520,
    endFreq: 320,
    dur: 0.12,
    type: 'triangle',
    filterFreq: 1800,
  };
}

/** Check if criteria for phase progression is met (e.g., 3 reciprocal turns or 6 mastered imitations) */
export function checkProgression(
  phase: TamborPhase,
  reciprocalTurns: number,
  masteredCount: number
): { canAdvancePhase: boolean; hasFinished: boolean } {
  if (phase === 'reciprocity') {
    return {
      canAdvancePhase: reciprocalTurns >= 3,
      hasFinished: false,
    };
  }

  return {
    canAdvancePhase: false,
    hasFinished: masteredCount >= 8,
  };
}
