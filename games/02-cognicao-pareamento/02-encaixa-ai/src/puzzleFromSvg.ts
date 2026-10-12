/**
 * Gerador de quebra-cabeça a partir de SVG com paths nomeados (o supervisor importa temas sem código).
 * Cada `<path id="…" d="…">` vira uma peça; a cavidade é o mesmo path com sombra interna, na posição
 * em que o path está no SVG. Atributos opcionais: `data-label`, `fill`, `data-symmetry`, `data-order`
 * (ordem na cadeia) e `data-role="decor"` (ignora). Parser puro, sem DOM: só lê texto.
 */
import { pathBBox } from './geometry';
import type { Anim } from './shapes';

export interface SvgPiece {
  id: string;
  label: string;
  d: string;
  /** Centro da caixa envolvente, nas coordenadas do SVG (é o pivô de rotação e do encaixe). */
  cx: number;
  cy: number;
  w: number;
  h: number;
  color: string;
  symmetry: number;
  anim: Anim;
}
export interface SvgPuzzle { viewBox: { x: number; y: number; w: number; h: number }; pieces: SvgPiece[] }
export type SvgPuzzleResult = { ok: true; puzzle: SvgPuzzle } | { ok: false; reason: string };

export const MAX_PIECES = 12;
const SAFE_D = /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+$/;
const SAFE_COLOR = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,20}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\))$/;
const SAFE_ID = /^[A-Za-z][\w-]{0,40}$/;
const DEFAULT_COLORS = ['sol', 'ceu', 'folha', 'mostarda', 'coral', 'lilas', 'terracota', 'petroleo'];

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) out[m[1]!.toLowerCase()] = m[2] ?? m[3] ?? '';
  return out;
}

const humanize = (id: string) => id.replace(/[-_]+/g, ' ').trim().toLowerCase();

export function puzzleFromSvg(svg: string): SvgPuzzleResult {
  if (typeof svg !== 'string' || !/<svg\b/i.test(svg)) return { ok: false, reason: 'não é um SVG' };
  if (svg.length > 400_000) return { ok: false, reason: 'SVG grande demais' };
  const root = attrs(/<svg\b([^>]*)>/i.exec(svg)?.[1] ?? '');
  const pieces: (SvgPiece & { order: number })[] = [];
  const seen = new Set<string>();
  let k = 0;
  for (const m of svg.matchAll(/<path\b([^>]*?)\/?>/gi)) {
    const a = attrs(m[1] ?? '');
    const id = a.id, d = a.d;
    if (!id || !d || a['data-role'] === 'decor') continue;
    if (!SAFE_ID.test(id) || seen.has(id)) return { ok: false, reason: `id inválido ou repetido: ${id}` };
    if (!SAFE_D.test(d)) return { ok: false, reason: `path com caracteres inválidos: ${id}` };
    let box;
    try { box = pathBBox(d); } catch { return { ok: false, reason: `path ilegível: ${id}` }; }
    if (box.w <= 0 || box.h <= 0) return { ok: false, reason: `path sem área: ${id}` };
    seen.add(id);
    const fill = a.fill && a.fill !== 'none' && SAFE_COLOR.test(a.fill) ? a.fill : DEFAULT_COLORS[k % DEFAULT_COLORS.length]!;
    const sym = Number(a['data-symmetry']);
    const order = Number(a['data-order']);
    pieces.push({
      id, d, label: (a['data-label'] || humanize(id)).slice(0, 40),
      cx: box.cx, cy: box.cy, w: box.w, h: box.h, color: fill,
      symmetry: Number.isFinite(sym) && sym >= 0 && sym <= 360 ? sym : 360,
      anim: 'bob',
      order: Number.isFinite(order) ? order : 1000 + k,
    });
    k++;
  }
  if (!pieces.length) return { ok: false, reason: 'nenhum <path> com id' };
  if (pieces.length > MAX_PIECES) return { ok: false, reason: `máximo de ${MAX_PIECES} peças` };

  const vb = (root.viewbox ?? '').split(/[\s,]+/).map(Number);
  let viewBox: SvgPuzzle['viewBox'];
  if (vb.length === 4 && vb.every(Number.isFinite) && vb[2]! > 0 && vb[3]! > 0) viewBox = { x: vb[0]!, y: vb[1]!, w: vb[2]!, h: vb[3]! };
  else if (Number(root.width) > 0 && Number(root.height) > 0) viewBox = { x: 0, y: 0, w: Number(root.width), h: Number(root.height) };
  else {
    const x0 = Math.min(...pieces.map((p) => p.cx - p.w / 2)), y0 = Math.min(...pieces.map((p) => p.cy - p.h / 2));
    const x1 = Math.max(...pieces.map((p) => p.cx + p.w / 2)), y1 = Math.max(...pieces.map((p) => p.cy + p.h / 2));
    const pad = Math.max(x1 - x0, y1 - y0) * 0.08;
    viewBox = { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
  }
  const ordered = pieces.sort((p, q) => p.order - q.order).map(({ order: _o, ...p }) => p);
  return { ok: true, puzzle: { viewBox, pieces: ordered } };
}
