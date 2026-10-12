/**
 * Física leve e determinística (sem dependências): o veículo anda AO LONGO da pista (1D por comprimento
 * de arco), com gravidade, atrito de rolamento e arrasto. Colisões são varridas (sweep) entre o passo
 * anterior e o novo, com subdivisão do passo e velocidade máxima de 30 px/quadro: não há tunneling.
 * A trava só abre por `release()` — nenhum passo da simulação solta o veículo sozinho.
 */
import { WEIGHT_MASS, vehicleById, type TrackSpec, type VehicleId, type Weight } from './logic';

export const G = 900; // unidades/s²
export const FPS = 60;
export const DT = 1 / FPS;
/** 30 px por quadro (spec §7). */
export const MAX_SPEED = 30 * FPS;
export const PIN_H = 46;
export const PIN_GAP = 26;
export const PIN_MASS = 0.35;
const MAX_SUB_STEP = 6; // unidades por subpasso
const SETTLE_V = 4;

export interface Vec { x: number; y: number }

export interface BuiltSeg {
  kind: TrackSpec['segments'][number]['kind'];
  x0: number; y0: number; x1: number; y1: number;
  /** Ângulo de descida em rad (0 = plano). */
  angle: number;
  s0: number; s1: number;
}

export interface BuiltTrack {
  spec: TrackSpec;
  segs: BuiltSeg[];
  length: number;
  start: Vec;
  ground: number;
  /** Largura do mundo (para a câmera). */
  width: number;
  /** Posição (comprimento de arco) do alvo macio, dos pinos e da parede final. */
  bumperS: number | null;
  pinsS: number[];
  wallS: number;
}

export const WORLD_H = 600;
export const VIEW_W = 1000;
export const LOCK_X = 120;
const GROUND_Y = 500;

export function buildTrack(spec: TrackSpec): BuiltTrack {
  let drop = 0;
  for (const s of spec.segments) if (s.kind === 'ramp') drop += s.length * Math.sin(((s.angleDeg ?? 0) * Math.PI) / 180);
  const start = { x: LOCK_X, y: GROUND_Y - drop };
  const segs: BuiltSeg[] = [];
  let x = start.x, y = start.y, s = 0;
  for (const seg of spec.segments) {
    const angle = seg.kind === 'ramp' ? ((seg.angleDeg ?? 0) * Math.PI) / 180 : 0;
    const x1 = x + seg.length * Math.cos(angle);
    const y1 = y + seg.length * Math.sin(angle);
    segs.push({ kind: seg.kind, x0: x, y0: y, x1, y1, angle, s0: s, s1: s + seg.length });
    x = x1; y = y1; s += seg.length;
  }
  // Zona do alvo: um trecho plano extra no fim, com pinos ou caixa macia e a parede da garagem.
  const tail = 150;
  segs.push({ kind: 'flat', x0: x, y0: y, x1: x + tail, y1: y, angle: 0, s0: s, s1: s + tail });
  const pinCount = spec.target === 'pins' ? spec.pins ?? 5 : 0;
  const pinsS = Array.from({ length: pinCount }, (_, k) => s + 20 + k * PIN_GAP);
  const bumperS = spec.target === 'bumper' ? s + 60 : null;
  const length = s + tail;
  return { spec, segs, length, start, ground: y, width: Math.max(VIEW_W, x + tail + 40), bumperS, pinsS, wallS: length };
}

export function segAt(t: BuiltTrack, s: number): BuiltSeg {
  for (const seg of t.segs) if (s < seg.s1) return seg;
  return t.segs[t.segs.length - 1]!;
}

export function pointAt(t: BuiltTrack, s: number): Vec {
  const cl = Math.max(0, Math.min(t.length, s));
  const seg = segAt(t, cl);
  const k = (cl - seg.s0) / Math.max(1e-6, seg.s1 - seg.s0);
  return { x: seg.x0 + (seg.x1 - seg.x0) * k, y: seg.y0 + (seg.y1 - seg.y0) * k };
}

/* ------------------------------------------------------------------ estado */

export interface Body {
  vehicle: VehicleId;
  half: number;
  mass: number;
  rolling: number;
  restitution: number;
  drag: number;
  s: number;
  v: number;
  /** Rotação acumulada das rodas (rad). */
  spin: number;
  locked: boolean;
  settled: boolean;
  targetHit: boolean;
  hitAt: number | null;
  releasedAt: number | null;
}

export interface Pin { s: number; phi: number; omega: number; falling: boolean; down: boolean }

export type SimEvent =
  | { kind: 'pin'; index: number }
  | { kind: 'bump'; speed: number }
  | { kind: 'wall'; speed: number }
  | { kind: 'settle' };

export interface Lane {
  body: Body;
  pins: Pin[];
  /** Mola visual da caixa macia (amassado). */
  squash: number;
  squashV: number;
}

export interface Sim {
  t: number;
  lanes: Lane[];
  events: SimEvent[];
}

export function createBody(track: BuiltTrack, vehicle: VehicleId, weight: Weight): Body {
  const v = vehicleById(vehicle);
  const half = v.length / 2;
  const mass = v.massFactor * WEIGHT_MASS[weight];
  return {
    vehicle, half, mass, rolling: v.rolling, restitution: v.restitution,
    drag: weight === 'pesado' ? 0.00012 : 0.0004,
    s: half + 2, v: 0, spin: 0, locked: true, settled: false, targetHit: false, hitAt: null, releasedAt: null,
  };
}

export function createSim(track: BuiltTrack, vehicles: VehicleId[], weight: Weight): Sim {
  return {
    t: 0,
    events: [],
    lanes: vehicles.map((v) => ({
      body: createBody(track, v, weight),
      pins: track.pinsS.map((s) => ({ s, phi: 0, omega: 0, falling: false, down: false })),
      squash: 0,
      squashV: 0,
    })),
  };
}

/** Única forma de abrir a trava (ação do adulto). Libera todas as raias juntas (modo corrida). */
export function release(sim: Sim): void {
  for (const l of sim.lanes) if (l.body.locked) { l.body.locked = false; l.body.releasedAt = sim.t; }
}

const isRunning = (l: Lane) => !l.body.locked && !l.body.settled;
export const pinsActive = (l: Lane) => l.pins.some((p) => p.falling && !p.down);

export function simSettled(sim: Sim): boolean {
  return sim.lanes.every((l) => !l.body.locked && l.body.settled && !pinsActive(l));
}

function stepBody(sim: Sim, lane: Lane, track: BuiltTrack, h: number): void {
  const b = lane.body;
  const seg = segAt(track, b.s);
  const dir = Math.sign(b.v);
  let a = G * Math.sin(seg.angle) - b.rolling * G * Math.cos(seg.angle) * dir - (b.drag / b.mass) * b.v * Math.abs(b.v);
  // Atrito estático no plano: parado continua parado.
  if (seg.angle === 0 && Math.abs(b.v) < 1) { a = 0; b.v = 0; }
  let v = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, b.v + a * h));
  if (dir !== 0 && Math.sign(v) !== dir && seg.angle === 0) v = 0; // atrito não inverte o sentido
  let s1 = b.s + v * h;
  const front0 = b.s + b.half;

  // Pinos (varredura em ordem).
  if (v > 0) {
    lane.pins.forEach((p, i) => {
      if (p.falling || p.down) return;
      if (front0 <= p.s + 1e-6 && s1 + b.half >= p.s) {
        if (v > 30) {
          p.falling = true;
          p.omega = Math.min(14, ((v / PIN_H) * 0.9 * b.mass) / (b.mass + PIN_MASS));
          v *= b.mass / (b.mass + PIN_MASS);
          b.targetHit = true;
          b.hitAt ??= sim.t;
          sim.events.push({ kind: 'pin', index: i });
        } else {
          s1 = p.s - b.half;
          v = 0;
        }
      }
    });
  }
  // Caixa macia (alvo).
  if (track.bumperS != null && v > 0 && front0 <= track.bumperS + 1e-6 && s1 + b.half >= track.bumperS) {
    s1 = track.bumperS - b.half;
    if (v > 20) {
      b.targetHit = true;
      b.hitAt ??= sim.t;
      lane.squashV += Math.min(6, v / 120);
      sim.events.push({ kind: 'bump', speed: Math.round(v) });
    }
    v = -b.restitution * v;
  }
  // Parede da garagem (fim da pista).
  if (v > 0 && s1 + b.half >= track.wallS) {
    s1 = track.wallS - b.half;
    sim.events.push({ kind: 'wall', speed: Math.round(v) });
    v = -b.restitution * v;
  }
  if (s1 - b.half < 0) { s1 = b.half; v = 0; }
  b.spin += (s1 - b.s) / Math.max(8, b.half * 0.35);
  b.s = s1;
  b.v = v;
}

function stepPins(sim: Sim, lane: Lane, dt: number): void {
  const ps = lane.pins;
  ps.forEach((p, i) => {
    if (!p.falling || p.down) return;
    p.omega += (G / PIN_H) * 1.2 * Math.sin(p.phi + 0.08) * dt;
    p.phi = Math.min(Math.PI / 2, p.phi + p.omega * dt);
    const next = ps[i + 1];
    if (next && !next.falling && !next.down && Math.sin(p.phi) * PIN_H >= next.s - p.s && p.omega > 2) {
      next.falling = true;
      next.omega = p.omega * 0.7;
      sim.events.push({ kind: 'pin', index: i + 1 });
    }
    if (p.phi >= Math.PI / 2) { p.down = true; p.omega = 0; }
  });
}

/** Avança a simulação em `dt` (padrão 1 quadro), com subdivisão do passo. Mutável (desempenho). */
export function step(sim: Sim, track: BuiltTrack, dt = DT): void {
  sim.t += dt;
  for (const lane of sim.lanes) {
    const b = lane.body;
    if (isRunning(lane)) {
      const n = Math.max(1, Math.min(16, Math.ceil((Math.abs(b.v) * dt) / MAX_SUB_STEP)));
      for (let k = 0; k < n; k++) stepBody(sim, lane, track, dt / n);
      const onFlat = segAt(track, b.s).angle === 0;
      const since = b.releasedAt == null ? 0 : sim.t - b.releasedAt;
      if ((onFlat && Math.abs(b.v) < SETTLE_V && since > 0.3) || since > 12) {
        b.v = 0;
        b.settled = true;
        sim.events.push({ kind: 'settle' });
      }
    }
    stepPins(sim, lane, dt);
    lane.squashV += (-90 * lane.squash - 9 * lane.squashV) * dt;
    lane.squash += lane.squashV * dt;
    if (Math.abs(lane.squash) < 0.001 && Math.abs(lane.squashV) < 0.01) { lane.squash = 0; lane.squashV = 0; }
  }
}

/** Movimento estático: resolve a descida inteira de uma vez (transição instantânea). */
export function simulateToRest(sim: Sim, track: BuiltTrack, maxSeconds = 30): Sim {
  const n = Math.ceil(maxSeconds * FPS);
  for (let k = 0; k < n && !simSettled(sim); k++) step(sim, track);
  for (const l of sim.lanes) { l.squash = 0; l.squashV = 0; }
  return sim;
}

export const pinsDown = (l: Lane) => l.pins.filter((p) => p.falling || p.down).length;

/** Vencedor da corrida: quem atinge o alvo primeiro; senão, quem foi mais longe. Raia 0 = criança. */
export function raceWinner(sim: Sim): 'child' | 'adult' | 'tie' | null {
  const [c, a] = sim.lanes;
  if (!c || !a) return null;
  const tc = c.body.hitAt, ta = a.body.hitAt;
  if (tc != null && ta != null) return Math.abs(tc - ta) < 1 / FPS ? 'tie' : tc < ta ? 'child' : 'adult';
  if (tc != null) return 'child';
  if (ta != null) return 'adult';
  const d = (c.body.s - c.body.half) - (a.body.s - a.body.half);
  return Math.abs(d) < 4 ? 'tie' : d > 0 ? 'child' : 'adult';
}

/** Pose para desenhar: centro e ângulo pelas rodas traseira/dianteira (suaviza as junções). */
export function bodyPose(track: BuiltTrack, b: Body): { x: number; y: number; deg: number } {
  const r = pointAt(track, b.s - b.half * 0.7);
  const f = pointAt(track, b.s + b.half * 0.7);
  return { x: (r.x + f.x) / 2, y: (r.y + f.y) / 2, deg: (Math.atan2(f.y - r.y, f.x - r.x) * 180) / Math.PI };
}

/** Câmera horizontal: segue o veículo com lerp 0.1 quando a pista excede a tela. */
export function cameraTarget(track: BuiltTrack, viewW: number, x: number): number {
  return Math.max(0, Math.min(track.width - viewW, x - 380));
}
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
