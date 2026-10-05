export interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  speedY: number;
  driftX: number;
  color: string;
  popped: boolean;
}

export type MandPromptLevel = 'N0' | 'N1' | 'N2' | 'N3';

export type GameState = 'blowing' | 'active_play' | 'behavioral_pause' | 'celebrating' | 'finished';

export const BUBBLE_COLORS = [
  'rgba(184, 224, 245, 0.75)',
  'rgba(244, 185, 66, 0.65)',
  'rgba(242, 160, 196, 0.65)',
  'rgba(142, 124, 195, 0.65)',
  'rgba(123, 196, 127, 0.65)',
];

export function createBubble(id: string, x: number, y: number, seed: number): Bubble {
  const size = 50 + (seed % 40);
  const color = BUBBLE_COLORS[seed % BUBBLE_COLORS.length]!;
  const speedY = 0.8 + ((seed % 10) * 0.15);
  const driftX = (seed % 2 === 0 ? 1 : -1) * (0.3 + ((seed % 5) * 0.1));

  return {
    id,
    x,
    y,
    size,
    speedY,
    driftX,
    color,
    popped: false,
  };
}

export function createBubbleBatch(count: number, width: number, height: number, baseSeed: number): Bubble[] {
  const list: Bubble[] = [];
  for (let i = 0; i < count; i++) {
    const seed = baseSeed + i * 7;
    const x = 40 + ((seed * 37) % Math.max(100, width - 100));
    const y = height * 0.4 + ((seed * 19) % Math.max(100, height * 0.5));
    list.push(createBubble(`b-${baseSeed}-${i}`, x, y, seed));
  }
  return list;
}

export function updateBubblePositions(
  bubbles: Bubble[],
  width: number,
  height: number
): Bubble[] {
  return bubbles.map((b) => {
    if (b.popped) return b;
    let nextY = b.y - b.speedY;
    const nextX = b.x + b.driftX;

    // Wrap around vertically if floating past top
    if (nextY < -b.size) {
      nextY = height + 10;
    }

    // Bounce off walls
    if (nextX < 10 || nextX > width - b.size - 10) {
      return { ...b, y: nextY, x: nextX, driftX: -b.driftX };
    }

    return { ...b, y: nextY, x: nextX };
  });
}

export function popBubble(bubbles: Bubble[], id: string): { updated: Bubble[]; poppedBubble: Bubble | null } {
  let poppedBubble: Bubble | null = null;
  const updated = bubbles.map((b) => {
    if (b.id === id && !b.popped) {
      poppedBubble = b;
      return { ...b, popped: true };
    }
    return b;
  });
  return { updated, poppedBubble };
}

export function shouldEnterPause(bubbles: Bubble[]): boolean {
  const remaining = bubbles.filter((b) => !b.popped).length;
  return remaining === 0;
}

export function resolveMandPromptLevel(latencyMs: number): MandPromptLevel {
  if (latencyMs < 5000) return 'N0'; // Independent spontaneous mand
  if (latencyMs < 10000) return 'N1'; // Gestural prompt (pulsing)
  if (latencyMs < 15000) return 'N2'; // Verbal prompt ("Pede mais!")
  return 'N3'; // Full demonstration
}

export function calculateSpontaneousRate(spontaneous: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((spontaneous / total) * 100);
}
