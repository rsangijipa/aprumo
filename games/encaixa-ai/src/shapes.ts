/**
 * Acervo autoral de peças (formas, bichos, fazenda). Cada peça é um único `d` centrado em (0,0),
 * extensão ~100 unidades, para que peça e cavidade venham do mesmo path (como no gerador por SVG).
 */
import { circle, ellipse, poly, regular, star } from './geometry';

/** Animação de conclusão (reforço natural: a cena "ganha vida"). */
export type Anim = 'bob' | 'hop' | 'fly' | 'swim' | 'drive' | 'sway' | 'glow';

export interface ShapeDef {
  id: string;
  label: string;
  d: string;
  /** Token de cor de estímulo (CSS `--ea-p-<color>`) ou cor literal (SVG importado). */
  color: string;
  /** Menor rotação que leva a forma nela mesma (0 = qualquer ângulo, 360 = assimétrica). */
  symmetry: number;
  anim: Anim;
}

export const SHAPES: ShapeDef[] = [
  { id: 'circulo', label: 'círculo', d: circle(0, 0, 46), color: 'sol', symmetry: 0, anim: 'bob' },
  { id: 'quadrado', label: 'quadrado', d: 'M-38,-44H38Q44,-44 44,-38V38Q44,44 38,44H-38Q-44,44 -44,38V-38Q-44,-44 -38,-44Z', color: 'ceu', symmetry: 90, anim: 'bob' },
  { id: 'triangulo', label: 'triângulo', d: poly(regular(3, 54)), color: 'folha', symmetry: 120, anim: 'bob' },
  { id: 'estrela', label: 'estrela', d: poly(star(5, 52, 24)), color: 'mostarda', symmetry: 72, anim: 'bob' },
  { id: 'coracao', label: 'coração', d: 'M0,42C-30,22 -50,4 -48,-16C-46,-38 -16,-46 0,-24C16,-46 46,-38 48,-16C50,4 30,22 0,42Z', color: 'coral', symmetry: 360, anim: 'bob' },
  { id: 'hexagono', label: 'hexágono', d: poly(regular(6, 48, 0)), color: 'lilas', symmetry: 60, anim: 'bob' },
  { id: 'losango', label: 'losango', d: poly([[0, -50], [36, 0], [0, 50], [-36, 0]]), color: 'terracota', symmetry: 180, anim: 'bob' },
  { id: 'cruz', label: 'cruz', d: poly([[-14, -44], [14, -44], [14, -14], [44, -14], [44, 14], [14, 14], [14, 44], [-14, 44], [-14, 14], [-44, 14], [-44, -14], [-14, -14]]), color: 'petroleo', symmetry: 90, anim: 'bob' },
];

const join = (...ds: string[]) => ds.join('');

export const ANIMALS: ShapeDef[] = [
  { id: 'peixe', label: 'peixe', d: join(ellipse(-8, 0, 32, 22), poly([[18, 0], [46, -22], [46, 22]]), poly([[-14, -18], [0, -34], [8, -18]])), color: 'ceu', symmetry: 360, anim: 'swim' },
  { id: 'passaro', label: 'passarinho', d: join(circle(6, 10, 26), circle(-18, -16, 15), poly([[-30, -22], [-46, -14], [-30, -9]]), poly([[24, 2], [46, -12], [44, 18]])), color: 'mostarda', symmetry: 360, anim: 'fly' },
  { id: 'gato', label: 'gato', d: join(ellipse(0, 18, 26, 28), circle(0, -22, 19), poly([[-18, -28], [-16, -48], [-3, -38]]), poly([[18, -28], [16, -48], [3, -38]]), poly([[18, 36], [42, 8], [48, 14], [26, 44]])), color: 'terracota', symmetry: 360, anim: 'hop' },
  { id: 'tartaruga', label: 'tartaruga', d: join(ellipse(-4, 2, 36, 24), circle(38, -6, 11), circle(-26, 24, 9), circle(18, 24, 9), poly([[-40, 4], [-50, 10], [-38, 12]])), color: 'folha', symmetry: 360, anim: 'hop' },
  { id: 'coelho', label: 'coelho', d: join(ellipse(6, 20, 28, 24), circle(-12, -8, 17), ellipse(-20, -32, 6, 17), ellipse(-5, -34, 6, 17), circle(34, 22, 7)), color: 'lilas', symmetry: 360, anim: 'hop' },
];

export const FARM: ShapeDef[] = [
  { id: 'celeiro', label: 'celeiro', d: poly([[-44, 44], [-44, -8], [0, -46], [44, -8], [44, 44]]), color: 'terracota', symmetry: 360, anim: 'glow' },
  { id: 'arvore', label: 'árvore', d: join(circle(0, -16, 28), circle(-22, 0, 19), circle(22, 0, 19), poly([[-8, 12], [8, 12], [8, 48], [-8, 48]])), color: 'folha', symmetry: 360, anim: 'sway' },
  { id: 'carro', label: 'carrinho', d: join(poly([[-46, -4], [46, -4], [46, 20], [-46, 20]]), poly([[-26, -4], [-14, -28], [16, -28], [30, -4]]), circle(-26, 22, 12), circle(26, 22, 12)), color: 'ceu', symmetry: 360, anim: 'drive' },
  { id: 'pato', label: 'pato', d: join(ellipse(6, 14, 32, 20), circle(-22, -14, 14), ellipse(-40, -12, 9, 5), poly([[34, 6], [48, -8], [42, 16]])), color: 'mostarda', symmetry: 360, anim: 'swim' },
  ...ANIMALS.filter((a) => a.id !== 'peixe'),
];

export const ALL_SHAPES: ShapeDef[] = [...SHAPES, ...ANIMALS, ...FARM.slice(0, 4)];
