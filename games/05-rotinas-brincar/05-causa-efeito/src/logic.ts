/**
 * Causa e Efeito — "Jardim de Luzes".
 * Cinco fases que seguem o desenvolvimento da contingência causa-efeito (do mais simples ao mais
 * específico): qualquer toque → alvo móvel → duração do gesto → gesto contínuo → um único alvo ativo.
 * Toda ação intencional vira uma tentativa correta (jogo de regulação, sem erro); toques fora do alvo
 * nas fases discriminativas só geram um eco suave e entram no `detail` (nunca são punidos).
 */
import { bounceInBounds, collideCircles, integrate, wobble, type Body, type WorldBounds } from '@aprumo/game-sdk';
import type { SessionConfig } from '@aprumo/protocol';

export type PhaseKind = 'surface' | 'bubbles' | 'hold' | 'trail' | 'switch';

export interface PhaseDef {
  id: string;
  kind: PhaseKind;
  title: string;
  /** Frase curta falada/lida ao começar a fase. */
  instruction: string;
  /** Ações intencionais para concluir a fase. */
  actions: number;
}

const PHASE_BASE: Omit<PhaseDef, 'actions'>[] = [
  { id: 'jardim-toque', kind: 'surface', title: 'Toque e floresça', instruction: 'Toque em qualquer lugar e veja as flores nascerem!' },
  { id: 'jardim-bolhas', kind: 'bubbles', title: 'Bolhas de luz', instruction: 'Estoure as bolhas que flutuam!' },
  { id: 'jardim-balao', kind: 'hold', title: 'Segure e solte', instruction: 'Segure o dedo para encher o balão. Depois solte!' },
  { id: 'jardim-rastro', kind: 'trail', title: 'Rastro de estrelas', instruction: 'Arraste o dedo e desenhe com luz!' },
  { id: 'jardim-sol', kind: 'switch', title: 'Acorde o sol', instruction: 'Toque no botão do sol para acender o dia!' },
];

/**
 * Plano da sessão. `params.phases` limita quantas fases entram (1–5, padrão: todas) e
 * `params.startPhase` permite começar adiante (criança que já domina o toque simples).
 */
export function planPhases(config: Pick<SessionConfig, 'clinical' | 'params'>): PhaseDef[] {
  const per = Math.max(3, Math.min(12, config.clinical.trialsPerTarget));
  const start = clampInt(config.params.startPhase, 0, PHASE_BASE.length - 1, 0);
  const count = clampInt(config.params.phases, 1, PHASE_BASE.length - start, PHASE_BASE.length - start);
  return PHASE_BASE.slice(start, start + count).map((p) => ({ ...p, actions: p.kind === 'switch' ? Math.max(3, per - 1) : per }));
}

function clampInt(v: unknown, lo: number, hi: number, fallback: number): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.floor(v) : fallback;
  return Math.min(hi, Math.max(lo, n));
}

/* ------------------------------------------------------------ som espacial */

/** Pentatônica de Dó (sem semitons: qualquer combinação soa agradável). */
export const PENTATONIC_FREQS = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
export const NOTE_NAMES = ['Dó', 'Ré', 'Mi', 'Sol', 'Lá', 'Dó agudo', 'Ré agudo', 'Mi agudo'];

/**
 * Mapeia a posição horizontal para a escala (esquerda grave → direita aguda):
 * a criança descobre que ONDE toca muda o som — uma segunda camada de causa e efeito.
 */
export function noteIndexFor(x: number, width: number): number {
  if (width <= 0) return 0;
  const t = Math.min(0.9999, Math.max(0, x / width));
  return Math.floor(t * PENTATONIC_FREQS.length);
}
export const noteFor = (x: number, width: number) => PENTATONIC_FREQS[noteIndexFor(x, width)]!;

/* ------------------------------------------------------------ paletas (canvas) */

export type Palette = 'calm' | 'vivid' | 'high-contrast';
export const PALETTES: Record<Palette, { hues: string[]; ink: string; glow: string }> = {
  calm: { hues: ['#e9a6c4', '#f2cf72', '#8cc493', '#93c9e3', '#c0aee0'], ink: '#2f4f4c', glow: '#fff7d6' },
  vivid: { hues: ['#ff5d8f', '#ffc21a', '#3ccf6e', '#2fa8f5', '#9b6cff'], ink: '#1d2a3a', glow: '#fffbe0' },
  'high-contrast': { hues: ['#ffffff', '#ffe500', '#00e0ff', '#ff7ad9', '#7dff6b'], ink: '#000000', glow: '#ffffff' },
};

/* ------------------------------------------------------------ bolhas (física) */

export interface Bubble extends Body {
  id: string;
  colorIdx: number;
  noteIdx: number;
  seed: number;
}

/** Bolha nova entrando por baixo, com tamanho mínimo de toque respeitando `touchScale`. */
export function spawnBubble(id: string, rnd: () => number, bounds: WorldBounds, touchScale = 1, fromBottom = true): Bubble {
  const r = (34 + rnd() * 18) * Math.max(1, touchScale);
  const w = bounds.right - bounds.left;
  const x = bounds.left + r + rnd() * Math.max(1, w - 2 * r);
  const y = fromBottom ? bounds.bottom + r * 0.5 : bounds.top + r + rnd() * Math.max(1, bounds.bottom - bounds.top - 2 * r);
  return {
    id,
    x,
    y,
    vx: (rnd() - 0.5) * 30,
    vy: fromBottom ? -40 - rnd() * 30 : 0,
    r,
    m: r / 40,
    colorIdx: Math.floor(rnd() * 5),
    noteIdx: noteIndexFor(x - bounds.left, w),
    seed: rnd() * 100,
  };
}

/**
 * Um passo de física das bolhas: empuxo para cima, deriva sinuosa, arrasto do ar, colisões
 * entre bolhas e paredes. Bolhas que saem pelo topo reentram por baixo (o campo nunca esvazia).
 */
export function stepBubbles(bubbles: Bubble[], dt: number, t: number, bounds: WorldBounds, speed = 1): void {
  const buoyancy = -70 * speed;
  for (const b of bubbles) {
    const sway = wobble(t * 0.8, b.seed) * 26 * speed;
    integrate(b, dt, sway, buoyancy, 0.8);
    // Velocidade terminal suave (bolha de sabão não acelera muito).
    const maxV = 110 * speed;
    const v = Math.hypot(b.vx, b.vy);
    if (v > maxV) {
      b.vx *= maxV / v;
      b.vy *= maxV / v;
    }
    if (b.y + b.r < bounds.top) {
      b.y = bounds.bottom + b.r;
      b.vy = -20;
    }
  }
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) collideCircles(bubbles[i]!, bubbles[j]!, 0.9);
  }
  // Paredes laterais e chão depois das colisões (o teto é livre para a bolha "sair").
  for (const b of bubbles) bounceInBounds(b, { ...bounds, top: -Infinity, bottom: bounds.bottom + b.r * 2 }, 0.7);
}

/* ------------------------------------------------------------ partículas */

export type ParticleKind = 'star' | 'dot' | 'petal' | 'ring';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  colorIdx: number;
  kind: ParticleKind;
  spin: number;
}

export type MotionLevel = 'full' | 'reduced' | 'static';

/** Explosão radial de partículas. Em movimento estático, só um anel que esmaece no lugar. */
export function burst(x: number, y: number, colorIdx: number, rnd: () => number, motion: MotionLevel, strength = 1): Particle[] {
  if (motion === 'static') {
    return [{ x, y, vx: 0, vy: 0, life: 0.5, maxLife: 0.5, size: 30 * strength, colorIdx, kind: 'ring', spin: 0 }];
  }
  const n = Math.round((motion === 'full' ? 22 : 10) * strength);
  const out: Particle[] = [{ x, y, vx: 0, vy: 0, life: 0.6, maxLife: 0.6, size: 24 * strength, colorIdx, kind: 'ring', spin: 0 }];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd() * 0.4;
    const sp = (motion === 'full' ? 160 : 90) * (0.5 + rnd()) * strength;
    out.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 40,
      life: 0.7 + rnd() * 0.5,
      maxLife: 1.2,
      size: 5 + rnd() * 7,
      colorIdx: (colorIdx + (i % 3)) % 5,
      kind: i % 3 === 0 ? 'star' : 'dot',
      spin: (rnd() - 0.5) * 8,
    });
  }
  return out;
}

/** Avança partículas (gravidade leve e arrasto) e descarta as que acabaram. Retorna o novo array. */
export function stepParticles(ps: Particle[], dt: number, gravity = 220): Particle[] {
  const out: Particle[] = [];
  for (const p of ps) {
    p.life -= dt;
    if (p.life <= 0) continue;
    if (p.kind !== 'ring') integrate(p, dt, 0, p.kind === 'petal' ? gravity * 0.25 : gravity, 1.6);
    out.push(p);
  }
  return out;
}

/* ------------------------------------------------------------ segurar (balão) */

/** Tempo mínimo segurando para "encher" o balão (ms). Menos que isso: o balão murcha sem penalidade. */
export const HOLD_MIN_MS = 450;
export const HOLD_FULL_MS = 1600;

/** Escala do balão (0,35 → 1) conforme o tempo segurando. */
export function holdScale(ms: number): number {
  const t = Math.min(1, Math.max(0, ms / HOLD_FULL_MS));
  return 0.35 + 0.65 * (1 - (1 - t) * (1 - t));
}

/* ------------------------------------------------------------ rastro */

/** Distância (px) de arraste que conta como um traço intencional. */
export const TRAIL_STROKE_PX = 140;

/** Marco de comemoração (mantido para compatibilidade com o painel). */
export function shouldTriggerMilestone(totalTaps: number, interval = 5): boolean {
  return totalTaps > 0 && totalTaps % interval === 0;
}
