import { describe, expect, it } from 'vitest';
import { seededRandom } from '@aprumo/game-sdk';
import { DEFAULT_ADAPTATION } from '@aprumo/protocol';
import { circle, pathBBox } from './geometry';
import { buildPuzzle, resolveSettings } from './logic';
import { puzzleFromSvg } from './puzzleFromSvg';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#eee"/>
  <path data-role="decor" id="fundo" d="M0,0H10V10Z"/>
  <path id="barco" data-label="barco" fill="#3f8a86" data-order="2" d="M40,200 L160,200 L140,240 L60,240 Z"/>
  <path d="M300 60 a 30 30 0 1 1 0.1 0 Z" id="sol" data-symmetry="0" data-order="1" />
  <path id='peixe-azul' d='M250,200 q20,-20 40,0 t40,0 l0,20 h-80 z'/>
</svg>`;

describe('geometria', () => {
  it('caixa envolvente de círculo por arcos', () => {
    const b = pathBBox(circle(10, 20, 30));
    expect(b.cx).toBeCloseTo(10, 0);
    expect(b.cy).toBeCloseTo(20, 0);
    expect(b.w).toBeCloseTo(60, 0);
    expect(b.h).toBeCloseTo(60, 0);
  });
  it('comandos relativos e H/V', () => {
    const b = pathBBox('m10,10 h20 v30 h-20 z');
    expect(b).toMatchObject({ x: 10, y: 10, w: 20, h: 30, cx: 20, cy: 25 });
  });
});

describe('puzzleFromSvg', () => {
  it('gera peças a partir de paths nomeados, na ordem data-order, ignorando decoração', () => {
    const r = puzzleFromSvg(SVG);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.puzzle.viewBox).toEqual({ x: 0, y: 0, w: 400, h: 300 });
    expect(r.puzzle.pieces.map((p) => p.id)).toEqual(['sol', 'barco', 'peixe-azul']);
    const barco = r.puzzle.pieces[1]!;
    expect(barco).toMatchObject({ label: 'barco', color: '#3f8a86', cx: 100, cy: 220, w: 120, h: 40, symmetry: 360 });
    expect(r.puzzle.pieces[0]!.symmetry).toBe(0);
    expect(r.puzzle.pieces[2]!.label).toBe('peixe azul');
  });
  it('rejeita SVG sem paths nomeados, ids repetidos e paths inseguros', () => {
    expect(puzzleFromSvg('<svg><rect/></svg>').ok).toBe(false);
    expect(puzzleFromSvg('nada').ok).toBe(false);
    expect(puzzleFromSvg('<svg><path id="a" d="M0,0H5V5Z"/><path id="a" d="M0,0H5V5Z"/></svg>').ok).toBe(false);
    expect(puzzleFromSvg('<svg><path id="a" d="M0,0 url(javascript:x)"/></svg>').ok).toBe(false);
  });
  it('SVG importado vira quebra-cabeça jogável sem código (cavidades onde os paths estão)', () => {
    const settings = resolveSettings({ adaptation: DEFAULT_ADAPTATION, params: { svg: SVG, level: 2 } });
    const pz = buildPuzzle(settings, seededRandom(1));
    expect(pz.theme).toBe('importado');
    expect(pz.pieces).toHaveLength(3);
    expect(pz.cavities).toBe(true);
    const f = pz.frame!;
    // barco (100,220) no SVG 400×300 → posição proporcional dentro da moldura
    expect(pz.slots[1]!.x).toBeCloseTo(f.x + (100 / 400) * f.w, 3);
    expect(pz.slots[1]!.y).toBeCloseTo(f.y + (220 / 300) * f.h, 3);
  });
  it('SVG inválido cai no quebra-cabeça do nível', () => {
    const settings = resolveSettings({ adaptation: DEFAULT_ADAPTATION, params: { svg: '<svg></svg>', level: 1 } });
    expect(buildPuzzle(settings, seededRandom(1)).theme).toBe('formas');
  });
});
