export type FreezePhase = 'countdown' | 'dancing' | 'freezing' | 'evaluated' | 'finished';

export interface FreezeEvaluation {
  passed: boolean;
  scoreDelta: number;
  message: string;
  rating: 'perfect' | 'good' | 'impulsive';
}

/** Compute dance music duration in ms (unpredictable between 5s and 8.5s) */
export function computeDanceDuration(roundIndex: number): number {
  // Deterministic pseudo-random variation based on roundIndex
  const offsets = [6000, 7500, 5200, 8000, 6800, 5500];
  const dur = offsets[roundIndex % offsets.length];
  return dur ?? 6000;
}

/** Compute freeze window duration in ms (unpredictable between 3.5s and 6s) */
export function computeFreezeDuration(roundIndex: number): number {
  const offsets = [3800, 4500, 3500, 5200, 4200, 4800];
  const dur = offsets[roundIndex % offsets.length];
  return dur ?? 4000;
}

/** Evaluates the child's motor inhibition during the freeze window */
export function evaluateFreezePerformance(
  impulsiveTaps: number,
  _freezeDurationMs: number
): FreezeEvaluation {
  if (impulsiveTaps === 0) {
    return {
      passed: true,
      scoreDelta: 100,
      message: 'Sensacional! Estátua perfeita de gelo!',
      rating: 'perfect',
    };
  }

  if (impulsiveTaps <= 2) {
    return {
      passed: true,
      scoreDelta: 50,
      message: 'Muito bom! Você congelou quase o tempo todo!',
      rating: 'good',
    };
  }

  return {
    passed: false,
    scoreDelta: 10,
    message: 'Opa! O gelo derreteu com tantos toques! Vamos tentar ficar estátua na próxima!',
    rating: 'impulsive',
  };
}

/** Pentatonic cheerful upbeat notes for web audio dance loop */
export const DANCE_PENTATONIC_FREQS = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

export function getDanceBeatTone(step: number): { freq: number; dur: number; type: OscillatorType } {
  const freq = DANCE_PENTATONIC_FREQS[step % DANCE_PENTATONIC_FREQS.length];
  return {
    freq: freq ?? 261.63,
    dur: 0.16,
    type: 'triangle',
  };
}
