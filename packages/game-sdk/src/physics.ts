/**
 * Física 2D mínima e determinística para jogos (sem dependências, sem DOM).
 * Só cinemática e colisão: o visual de cada jogo continua sendo dele.
 * - Integração semi-implícita de Euler com `dt` em segundos (estável para passos ≤ 1/30 s).
 * - Molas criticamente amortecidas para "squash & stretch" e retorno suave.
 * - Colisão círculo-círculo e círculo-parede com restituição.
 */

export interface Vec2 {
  x: number;
  y: number;
}

/** Posição + velocidade (partículas não precisam de raio). */
export interface Kinematic {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Body extends Kinematic {
  /** Raio (px) para colisões circulares. */
  r: number;
  /** Massa relativa (padrão 1). */
  m?: number;
}

export interface WorldBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const dist = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);

/** Easing com leve "overshoot" (útil para entradas de cartas e peças). */
export function easeOutBack(t: number, s = 1.70158): number {
  const u = t - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
}
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/**
 * Avança um corpo por `dt` segundos sob aceleração (ax, ay) e arrasto linear `drag` (1/s).
 * Muta e retorna o próprio corpo (laços de animação evitam alocação por quadro).
 */
export function integrate<B extends Kinematic>(b: B, dt: number, ax = 0, ay = 0, drag = 0): B {
  const k = Math.max(0, 1 - drag * dt);
  b.vx = (b.vx + ax * dt) * k;
  b.vy = (b.vy + ay * dt) * k;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  return b;
}

/**
 * Mantém o corpo dentro dos limites, refletindo a velocidade com restituição `e` (0–1).
 * Retorna quais paredes foram tocadas (para som/partícula de impacto).
 */
export function bounceInBounds(b: Body, w: WorldBounds, e = 0.6): { hit: boolean; floor: boolean } {
  let hit = false;
  let floor = false;
  if (b.x - b.r < w.left) {
    b.x = w.left + b.r;
    b.vx = Math.abs(b.vx) * e;
    hit = true;
  } else if (b.x + b.r > w.right) {
    b.x = w.right - b.r;
    b.vx = -Math.abs(b.vx) * e;
    hit = true;
  }
  if (b.y - b.r < w.top) {
    b.y = w.top + b.r;
    b.vy = Math.abs(b.vy) * e;
    hit = true;
  } else if (b.y + b.r > w.bottom) {
    b.y = w.bottom - b.r;
    b.vy = -Math.abs(b.vy) * e;
    hit = true;
    floor = true;
  }
  return { hit, floor };
}

/**
 * Resolve sobreposição e troca de momento entre dois círculos (colisão elástica com restituição `e`).
 * Retorna true quando houve contato.
 */
export function collideCircles(a: Body, b: Body, e = 0.8): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  const min = a.r + b.r;
  if (d >= min || d === 0) return false;
  const nx = dx / d;
  const ny = dy / d;
  const ma = a.m ?? 1;
  const mb = b.m ?? 1;
  // Separação proporcional à massa inversa.
  const overlap = min - d;
  const inv = 1 / ma + 1 / mb;
  a.x -= nx * overlap * (1 / ma / inv);
  a.y -= ny * overlap * (1 / ma / inv);
  b.x += nx * overlap * (1 / mb / inv);
  b.y += ny * overlap * (1 / mb / inv);
  // Impulso apenas se estão se aproximando.
  const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (rel < 0) {
    const j = (-(1 + e) * rel) / inv;
    a.vx -= (j / ma) * nx;
    a.vy -= (j / ma) * ny;
    b.vx += (j / mb) * nx;
    b.vy += (j / mb) * ny;
  }
  return true;
}

/** Estado de uma mola 1D. */
export interface Spring {
  value: number;
  velocity: number;
}

/**
 * Mola amortecida (oscilador harmônico) rumo a `target`.
 * `stiffness` (k) e `damping` (c) em unidades por segundo; valores padrão dão um "boing" curto.
 */
export function stepSpring(s: Spring, target: number, dt: number, stiffness = 260, damping = 18): Spring {
  const f = -stiffness * (s.value - target) - damping * s.velocity;
  s.velocity += f * dt;
  s.value += s.velocity * dt;
  return s;
}

/** A mola já está parada no alvo (para encerrar animações)? */
export function springAtRest(s: Spring, target: number, eps = 0.001): boolean {
  return Math.abs(s.value - target) < eps && Math.abs(s.velocity) < eps * 10;
}

/** Ponto dentro de círculo (acerto de toque com folga `slop` em px). */
export function hitCircle(p: Vec2, c: Body, slop = 0): boolean {
  return dist(p, c) <= c.r + slop;
}

/**
 * Ruído suave 1D determinístico (soma de senoides), para "flutuar" objetos sem aleatoriedade por quadro.
 * Retorna valor em [-1, 1].
 */
export function wobble(t: number, seed = 0): number {
  return (Math.sin(t * 1.3 + seed) * 0.6 + Math.sin(t * 2.7 + seed * 1.7) * 0.3 + Math.sin(t * 0.7 + seed * 0.3) * 0.1);
}
