/**
 * Bolhas Mágicas — treino de mando (pedido) com reforçador natural (bolhas).
 * Ciclo: a varinha sopra → a criança estoura/observa → as bolhas acabam (pausa comportamental) →
 * a criança PEDE → a varinha sopra de novo. Cada pausa é uma tentativa de mando.
 *
 * Fases de mando (estilo PECS/ensino de mando):
 *   1. "Mais" — um único cartão.
 *   2. "Escolha" — dois reforçadores (bolhinhas ou bolhona): a criança pede o que quer.
 *   3. "Frase" — monta QUERO + [reforçador] na tira de frase.
 * Dicas reais em hierarquia crescente (gesto → modelo verbal → demonstração), registradas no
 * PROMPT_USED; o nível da tentativa é a dica mais intrusiva entregue antes do pedido.
 */
import { bounceInBounds, collideCircles, integrate, wobble, type Body, type Spring, type WorldBounds } from '@aprumo/game-sdk';

/* ------------------------------------------------------------ fases e dicas */

export type MandPhase = 'single' | 'choice' | 'sentence';

export interface MandLevel {
  id: string;
  phase: MandPhase;
  title: string;
  /** Fala da pausa (sem pedir pela criança: só abre a oportunidade). */
  cue: string;
}

export const MAND_LEVELS: MandLevel[] = [
  { id: 'mando-mais', phase: 'single', title: 'Pedir mais', cue: 'Acabaram as bolhas!' },
  { id: 'mando-escolha', phase: 'choice', title: 'Escolher o que pedir', cue: 'Acabou! O que você quer agora?' },
  { id: 'mando-frase', phase: 'sentence', title: 'Montar o pedido', cue: 'Acabou! Monte o seu pedido.' },
];

export type ReinforcerId = 'bolhinhas' | 'bolhona';
export const REINFORCERS: Record<ReinforcerId, { id: ReinforcerId; label: string; spoken: string }> = {
  bolhinhas: { id: 'bolhinhas', label: 'Bolhinhas', spoken: 'bolhinhas' },
  bolhona: { id: 'bolhona', label: 'Bolhona', spoken: 'bolhona' },
};

export type MandPromptLevel = 'N0' | 'N1' | 'N2' | 'N3';

export interface PromptStep {
  level: Exclude<MandPromptLevel, 'N0'>;
  code: 'PULSE_MORE' | 'VOICE_PROMPT' | 'MODEL_TAP';
  atMs: number;
  intrusiveness: number;
}

/** Agenda das dicas a partir de um atraso base (padrão 5 s): 1×, 2× e 3× o atraso. */
export function promptSchedule(baseMs: number | null | undefined): PromptStep[] {
  const b = Math.max(2000, baseMs ?? 5000);
  return [
    { level: 'N1', code: 'PULSE_MORE', atMs: b, intrusiveness: 0.2 },
    { level: 'N2', code: 'VOICE_PROMPT', atMs: b * 2, intrusiveness: 0.5 },
    { level: 'N3', code: 'MODEL_TAP', atMs: b * 3, intrusiveness: 0.8 },
  ];
}

/** Nível da tentativa = dica mais intrusiva já entregue (N0 = espontâneo). */
export function mandLevelFrom(delivered: readonly MandPromptLevel[]): MandPromptLevel {
  return (['N3', 'N2', 'N1'] as const).find((l) => delivered.includes(l)) ?? 'N0';
}

/** Compatibilidade: nível estimado só pela latência (painéis antigos). */
export function resolveMandPromptLevel(latencyMs: number): MandPromptLevel {
  if (latencyMs < 5000) return 'N0';
  if (latencyMs < 10000) return 'N1';
  if (latencyMs < 15000) return 'N2';
  return 'N3';
}

export function calculateSpontaneousRate(spontaneous: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((spontaneous / total) * 100);
}

/**
 * Sobe de fase depois de `need` mandos espontâneos seguidos (N0). Nunca desce durante a sessão
 * (descer seria punitivo); a dica volta a ajudar naturalmente.
 */
export function nextMandLevel(level: number, spontaneousStreak: number, need = 2): number {
  return spontaneousStreak >= need ? Math.min(MAND_LEVELS.length - 1, level + 1) : level;
}

export function startMandLevel(params: Record<string, unknown>): number {
  const v = params.mandLevel;
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(MAND_LEVELS.length - 1, Math.floor(v))) : 0;
}

/** A tira de frase está completa e na ordem certa (QUERO + reforçador)? */
export function sentenceReady(strip: readonly string[]): ReinforcerId | null {
  if (strip.length !== 2 || strip[0] !== 'quero') return null;
  return strip[1] === 'bolhinhas' || strip[1] === 'bolhona' ? strip[1] : null;
}

/* ------------------------------------------------------------ física das bolhas */

export type BubbleKind = 'normal' | 'giant' | 'mini';

export interface Bubble extends Body {
  id: string;
  kind: BubbleKind;
  hue: number;
  seed: number;
  /** Segundos de vida restantes (a bolha "envelhece" e estoura sozinha). */
  life: number;
  /** Toques que ainda faltam (bolhona precisa de 2). */
  hp: number;
  squash: Spring;
}

/**
 * A varinha sopra `count` bolhas a partir de `wand`, num leque para cima e para o lado.
 * `kind` define o tamanho; `scale` respeita o tamanho mínimo de toque.
 */
export function blowBubbles(prefix: string, count: number, wand: { x: number; y: number }, rnd: () => number, kind: BubbleKind = 'normal', scale = 1): Bubble[] {
  const out: Bubble[] = [];
  for (let i = 0; i < count; i++) {
    const base = kind === 'giant' ? 78 : kind === 'mini' ? 30 : 38 + rnd() * 16;
    const r = Math.max(32, base) * Math.max(1, scale);
    const angle = -Math.PI / 2 + 0.25 + rnd() * 0.9; // para cima e para a direita
    const sp = (kind === 'giant' ? 120 : 230) * (0.6 + rnd() * 0.6);
    out.push({
      id: `${prefix}-${i}`,
      kind,
      x: wand.x + (rnd() - 0.5) * 10,
      y: wand.y + (rnd() - 0.5) * 10,
      vx: Math.cos(angle) * sp,
      vy: Math.sin(angle) * sp,
      r,
      m: r / 40,
      hue: Math.floor(rnd() * 360),
      seed: rnd() * 100,
      life: (kind === 'giant' ? 18 : 11) + rnd() * 5,
      hp: kind === 'giant' ? 2 : 1,
      squash: { value: 1, velocity: 0 },
    });
  }
  return out;
}

/**
 * Um passo de física: empuxo leve, deriva sinuosa, arrasto do ar, colisões elásticas entre bolhas e
 * com as paredes; o teto é macio. Retorna as bolhas que estouraram sozinhas (fim da vida).
 */
export function stepBubbles(bs: Bubble[], dt: number, t: number, bounds: WorldBounds, speed = 1): Bubble[] {
  const expired: Bubble[] = [];
  for (const b of bs) {
    b.life -= dt;
    const sway = wobble(t * 0.7, b.seed) * 30 * speed;
    const lift = (b.kind === 'giant' ? -14 : -24) * speed;
    integrate(b, dt, sway, lift, 0.9);
    const maxV = 220 * Math.max(0.5, speed);
    const v = Math.hypot(b.vx, b.vy);
    if (v > maxV) {
      b.vx *= maxV / v;
      b.vy *= maxV / v;
    }
    if (b.life <= 0) expired.push(b);
  }
  // Colisões antes das paredes: as paredes têm a última palavra (nada sai do céu).
  for (let i = 0; i < bs.length; i++) {
    for (let j = i + 1; j < bs.length; j++) {
      if (collideCircles(bs[i]!, bs[j]!, 0.85)) {
        bs[i]!.squash.velocity -= 1.2;
        bs[j]!.squash.velocity -= 1.2;
      }
    }
  }
  for (const b of bs) if (bounceInBounds(b, bounds, 0.55).hit) b.squash.velocity -= 2.5;
  return expired;
}

/** A bolhona estourada se divide em minis que saem em leque (conservando o impulso). */
export function splitGiant(g: Bubble, rnd: () => number, scale = 1): Bubble[] {
  const minis = blowBubbles(`${g.id}-m`, 4, g, rnd, 'mini', scale);
  minis.forEach((m, i) => {
    const a = (i / minis.length) * Math.PI * 2;
    m.vx = g.vx + Math.cos(a) * 140;
    m.vy = g.vy + Math.sin(a) * 140;
    m.hue = (g.hue + i * 40) % 360;
  });
  return minis;
}

/** Quantas bolhas a varinha sopra por rodada (cresce um pouco, respeitando a adaptação). */
export function bubblesPerRound(round: number, maxChoices: number, kind: 'bolhinhas' | 'bolhona'): number {
  if (kind === 'bolhona') return 1;
  return Math.max(4, Math.min(9, 4 + Math.floor(round / 2) + Math.max(0, maxChoices - 3)));
}

/* ------------------------------------------------------------ compatibilidade (API antiga) */

export interface LegacyBubble {
  id: string;
  x: number;
  y: number;
  size: number;
  speedY: number;
  driftX: number;
  color: string;
  popped: boolean;
}

export const BUBBLE_COLORS = ['rgba(184, 224, 245, 0.75)', 'rgba(244, 185, 66, 0.65)', 'rgba(242, 160, 196, 0.65)', 'rgba(142, 124, 195, 0.65)', 'rgba(123, 196, 127, 0.65)'];

export function createBubble(id: string, x: number, y: number, seed: number): LegacyBubble {
  return {
    id,
    x,
    y,
    size: 50 + (seed % 40),
    speedY: 0.8 + (seed % 10) * 0.15,
    driftX: (seed % 2 === 0 ? 1 : -1) * (0.3 + (seed % 5) * 0.1),
    color: BUBBLE_COLORS[seed % BUBBLE_COLORS.length]!,
    popped: false,
  };
}

export function popBubble<B extends { id: string; popped?: boolean }>(bubbles: B[], id: string): { updated: B[]; poppedBubble: B | null } {
  let poppedBubble: B | null = null;
  const updated = bubbles.map((b) => {
    if (b.id === id && !b.popped) {
      poppedBubble = b;
      return { ...b, popped: true };
    }
    return b;
  });
  return { updated, poppedBubble };
}

export function shouldEnterPause(bubbles: { popped?: boolean }[]): boolean {
  return bubbles.filter((b) => !b.popped).length === 0;
}
