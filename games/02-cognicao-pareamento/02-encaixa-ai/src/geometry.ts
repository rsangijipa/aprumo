/**
 * Geometria pura das peças: construtores de path (círculo, elipse, polígono) e caixa envolvente
 * de qualquer `d` SVG (M L H V C S Q T A Z, absolutos e relativos). Sem DOM: roda em teste.
 */
export interface Pt { x: number; y: number }
export interface Box { x: number; y: number; w: number; h: number; cx: number; cy: number }

const f = (n: number) => +n.toFixed(2);

/** Círculo em sentido horário (y para baixo), para que subpaths sobrepostos se unam (nonzero). */
export function circle(cx: number, cy: number, r: number): string {
  return `M${f(cx - r)},${f(cy)}A${r},${r} 0 1 1 ${f(cx + r)},${f(cy)}A${r},${r} 0 1 1 ${f(cx - r)},${f(cy)}Z`;
}
export function ellipse(cx: number, cy: number, rx: number, ry: number): string {
  return `M${f(cx - rx)},${f(cy)}A${rx},${ry} 0 1 1 ${f(cx + rx)},${f(cy)}A${rx},${ry} 0 1 1 ${f(cx - rx)},${f(cy)}Z`;
}
/** Polígono fechado, sempre horário na tela (área de Gauss positiva com y para baixo). */
export function poly(pts: readonly (readonly [number, number])[]): string {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!, b = pts[(i + 1) % pts.length]!;
    area += a[0] * b[1] - b[0] * a[1];
  }
  const ordered = area < 0 ? [...pts].reverse() : pts;
  return `M${ordered.map(([x, y]) => `${f(x)},${f(y)}`).join('L')}Z`;
}
export function regular(n: number, r: number, rotDeg = -90): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const a = ((rotDeg + (360 / n) * i) * Math.PI) / 180;
    return [r * Math.cos(a), r * Math.sin(a)] as [number, number];
  });
}
export function star(n: number, outer: number, inner: number): [number, number][] {
  return Array.from({ length: n * 2 }, (_, i) => {
    const a = ((-90 + (180 / n) * i) * Math.PI) / 180;
    const r = i % 2 ? inner : outer;
    return [r * Math.cos(a), r * Math.sin(a)] as [number, number];
  });
}

/* ------------------------------------------------------------------ leitura de paths */

export interface PathCmd { cmd: string; args: number[] }
const TOKEN = /([MmLlHhVvCcSsQqTtAaZz])|([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/g;
const ARITY: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

export function parsePath(d: string): PathCmd[] {
  const out: PathCmd[] = [];
  let cur: PathCmd | null = null;
  for (const m of d.matchAll(TOKEN)) {
    if (m[1]) {
      cur = { cmd: m[1], args: [] };
      out.push(cur);
    } else if (cur) cur.args.push(Number(m[2]));
    else throw new Error('path deve começar com um comando');
  }
  return out;
}

/** Pontos de um arco elíptico (parametrização por centro, SVG 1.1 F.6.5), amostrados. */
function arcPoints(x1: number, y1: number, rx0: number, ry0: number, phi: number, fa: number, fs: number, x2: number, y2: number): Pt[] {
  let rx = Math.abs(rx0), ry = Math.abs(ry0);
  if (rx === 0 || ry === 0) return [{ x: x2, y: y2 }];
  const rad = (phi * Math.PI) / 180, cos = Math.cos(rad), sin = Math.sin(rad);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const x1p = cos * dx + sin * dy, y1p = -sin * dx + cos * dy;
  const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lam > 1) { const s = Math.sqrt(lam); rx *= s; ry *= s; }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  let co = den === 0 ? 0 : Math.sqrt(Math.max(0, num / den));
  if (fa === fs) co = -co;
  const cxp = (co * rx * y1p) / ry, cyp = (-co * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2, cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const ang = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!fs && dt > 0) dt -= 2 * Math.PI;
  else if (fs && dt < 0) dt += 2 * Math.PI;
  const pts: Pt[] = [];
  for (let i = 1; i <= 24; i++) {
    const t = t1 + (dt * i) / 24;
    pts.push({ x: cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin, y: cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos });
  }
  return pts;
}

/** Caixa envolvente (curvas Bézier usam os pontos de controle: estimativa conservadora). */
export function pathBBox(d: string): Box {
  const pts: Pt[] = [];
  let x = 0, y = 0, sx = 0, sy = 0;
  for (const { cmd, args } of parsePath(d)) {
    const up = cmd.toUpperCase();
    const rel = cmd !== up;
    const n = ARITY[up] ?? 0;
    if (n === 0) { x = sx; y = sy; continue; }
    for (let i = 0; i + n <= args.length; i += n) {
      const a = args.slice(i, i + n);
      const ox = rel ? x : 0, oy = rel ? y : 0;
      if (up === 'H') { x = a[0]! + (rel ? x : 0); pts.push({ x, y }); continue; }
      if (up === 'V') { y = a[0]! + (rel ? y : 0); pts.push({ x, y }); continue; }
      if (up === 'A') {
        const ex = a[5]! + ox, ey = a[6]! + oy;
        pts.push(...arcPoints(x, y, a[0]!, a[1]!, a[2]!, a[3]!, a[4]!, ex, ey));
        x = ex; y = ey;
        continue;
      }
      for (let k = 0; k < n; k += 2) pts.push({ x: a[k]! + ox, y: a[k + 1]! + oy });
      x = a[n - 2]! + ox; y = a[n - 1]! + oy;
      if (up === 'M' && i === 0) { sx = x; sy = y; }
    }
  }
  if (!pts.length) throw new Error('path vazio');
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}
