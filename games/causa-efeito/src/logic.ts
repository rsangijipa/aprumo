export interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  noteFreq: number;
  label: string;
}

export const PENTATONIC_FREQS = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
];

export const CALM_COLORS = [
  '#e886b0', // Rosa suave
  '#f5c84a', // Dourado
  '#6aa857', // Verde sálvia claro
  '#7fc1de', // Azul celeste
  '#b39ddb', // Lavanda Denver
];

export function createBubble(id: string, x: number, y: number, seed = 0): Bubble {
  const noteIdx = Math.abs(seed) % PENTATONIC_FREQS.length;
  const colorIdx = Math.abs(seed) % CALM_COLORS.length;

  return {
    id,
    x,
    y,
    size: 64 + (Math.abs(seed * 7) % 32),
    color: CALM_COLORS[colorIdx]!,
    noteFreq: PENTATONIC_FREQS[noteIdx]!,
    label: 'Bolha sonora',
  };
}

export function shouldTriggerMilestone(totalTaps: number, interval = 5): boolean {
  return totalTaps > 0 && totalTaps % interval === 0;
}
