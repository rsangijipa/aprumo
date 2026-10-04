/**
 * Arte dos 8 temas do Token Board (SVG próprio, sem ativos externos e sem personagens de franquia).
 * Cada tema é desenhado a partir de uma paleta; a variante "sóbria" (≥10 anos) usa ardósia/sálvia
 * e traço fino, mantendo a mesma forma reconhecível sem estética infantil.
 */
import type { ReactElement } from 'react';
import type { BoardTheme, Variant } from './logic';

interface Pal { bg: string; edge: string; a: string; b: string; ink: string }

const PLAYFUL: Record<BoardTheme, Pal> = {
  planetas: { bg: '#1f3b57', edge: '#0f2236', a: '#f2a65a', b: '#ffe2b8', ink: '#0f2236' },
  dinossauros: { bg: '#dbeccf', edge: '#5d8a46', a: '#6fae5c', b: '#3f7a35', ink: '#2c4f24' },
  trens: { bg: '#d6e8f3', edge: '#3f6f8f', a: '#e76f51', b: '#3d405b', ink: '#9c3d26' },
  carros: { bg: '#f3e6d0', edge: '#a3815a', a: '#2a7fb8', b: '#cfe8f7', ink: '#1d4f73' },
  animais: { bg: '#f6e3cf', edge: '#b08257', a: '#8c5a35', b: '#c48b5c', ink: '#5b3a1f' },
  flores: { bg: '#e9f2e1', edge: '#7d9a4a', a: '#ef8fa0', b: '#ffd166', ink: '#b85468' },
  formas: { bg: '#eef1f4', edge: '#6b7a88', a: '#4f9a8a', b: '#e9a23b', ink: '#2f3a45' },
  puzzle: { bg: '#efe7f6', edge: '#7d6aa0', a: '#8e7cc3', b: '#c9bde6', ink: '#4e3f73' },
};
const SOBER: Pal = { bg: '#e7ebee', edge: '#4a5866', a: '#5e7d79', b: '#9aa8b4', ink: '#2c3640' };
const PLANET_HUES = ['#f2a65a', '#7fb3d5', '#e07a5f', '#9bc995', '#c9a0dc'];
const SHAPES = ['circle', 'square', 'triangle', 'star', 'hexagon'] as const;

type Draw = (c: Pal, i: number, w: number) => ReactElement;

const DRAW: Record<BoardTheme, Draw> = {
  planetas: (c, i, w) => (
    <g>
      <circle cx="50" cy="50" r="22" fill={c === SOBER ? c.a : (PLANET_HUES[i % PLANET_HUES.length] ?? c.a)} stroke={c.ink} strokeWidth={w} />
      <ellipse cx="50" cy="52" rx="36" ry="9" fill="none" stroke={c.b} strokeWidth={w + 1.5} transform="rotate(-18 50 52)" />
      <circle cx="78" cy="24" r="3" fill={c.b} />
    </g>
  ),
  dinossauros: (c, _i, w) => (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M18 64c4-14 18-20 32-18 6-12 8-22 16-24 6-2 10 4 6 8l-6 4c-2 8-2 16 2 22 6 6 14 4 18 10-10 4-22 2-30-2-10 4-26 6-38 0z" fill={c.a} stroke={c.ink} strokeWidth={w} />
      <path d="M34 66v12M56 66v12" stroke={c.ink} strokeWidth={w + 3} />
      <circle cx="68" cy="25" r="1.8" fill={c.ink} />
    </g>
  ),
  trens: (c, _i, w) => (
    <g strokeLinejoin="round">
      <rect x="20" y="40" width="38" height="22" rx="4" fill={c.a} stroke={c.ink} strokeWidth={w} />
      <rect x="56" y="30" width="22" height="32" rx="3" fill={c.a} stroke={c.ink} strokeWidth={w} />
      <rect x="60" y="35" width="14" height="10" rx="2" fill={c.bg} />
      <rect x="26" y="28" width="8" height="12" rx="2" fill={c.b} />
      <circle cx="32" cy="66" r="6" fill={c.b} /><circle cx="50" cy="66" r="6" fill={c.b} /><circle cx="68" cy="66" r="6" fill={c.b} />
    </g>
  ),
  carros: (c, _i, w) => (
    <g strokeLinejoin="round">
      <path d="M16 62v-10c0-4 3-6 7-7l10-2 8-10c2-2 4-3 7-3h14c3 0 5 1 7 4l7 10 8 2c3 1 5 3 5 6v10z" fill={c.a} stroke={c.ink} strokeWidth={w} />
      <path d="M44 42l5-7h9v7zM62 35h4l5 7h-9z" fill={c.b} />
      <circle cx="32" cy="64" r="8" fill={c.ink} /><circle cx="70" cy="64" r="8" fill={c.ink} />
      <circle cx="32" cy="64" r="3" fill={c.bg} /><circle cx="70" cy="64" r="3" fill={c.bg} />
    </g>
  ),
  animais: (c, _i, w) => (
    <g stroke={c.ink} strokeWidth={w}>
      <ellipse cx="50" cy="62" rx="17" ry="14" fill={c.a} />
      <ellipse cx="29" cy="44" rx="7" ry="9" fill={c.b} />
      <ellipse cx="42" cy="32" rx="7" ry="9" fill={c.b} />
      <ellipse cx="58" cy="32" rx="7" ry="9" fill={c.b} />
      <ellipse cx="71" cy="44" rx="7" ry="9" fill={c.b} />
    </g>
  ),
  flores: (c, _i, w) => (
    <g stroke={c.ink} strokeWidth={w}>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="50" cy="31" rx="10" ry="15" fill={c.a} transform={`rotate(${r} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="10" fill={c.b} />
    </g>
  ),
  formas: (c, i, w) => {
    const s = SHAPES[i % SHAPES.length];
    const p = { fill: i % 2 ? c.b : c.a, stroke: c.ink, strokeWidth: w, strokeLinejoin: 'round' as const };
    if (s === 'circle') return <circle cx="50" cy="50" r="26" {...p} />;
    if (s === 'square') return <rect x="26" y="26" width="48" height="48" rx="6" {...p} />;
    if (s === 'triangle') return <path d="M50 22l30 52H20z" {...p} />;
    if (s === 'star') return <path d="M50 20l8.8 18 19.8 2.9-14.3 14 3.4 19.7L50 65.3 32.3 74.6l3.4-19.7-14.3-14L41.2 38z" {...p} />;
    return <path d="M50 22l25 14v28L50 78 25 64V36z" {...p} />;
  },
  puzzle: (c, i, w) => (
    <path
      d="M26 30h14c-4-10 16-10 12 0h14v14c10-4 10 16 0 12v14H52c4 10-16 10-12 0H26V56c-10 4-10-16 0-12z"
      fill={i % 2 ? c.b : c.a}
      stroke={c.ink}
      strokeWidth={w}
      strokeLinejoin="round"
      transform={i % 2 ? 'rotate(90 50 50)' : undefined}
    />
  ),
};

/** Ficha de um dos 8 temas. `index` varia levemente a arte (cores de planeta, formas, peças). */
export function ThemeTokenArt({ theme, variant = 'playful', index = 0 }: { theme: BoardTheme; variant?: Variant; index?: number }) {
  const c = variant === 'sober' ? SOBER : PLAYFUL[theme];
  const w = variant === 'sober' ? 2.5 : 3.5;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill={c.bg} stroke={c.edge} strokeWidth={variant === 'sober' ? 2.5 : 4} />
      {DRAW[theme](c, index, w)}
    </svg>
  );
}
