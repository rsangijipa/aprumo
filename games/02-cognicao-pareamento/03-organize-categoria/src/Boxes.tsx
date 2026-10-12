/**
 * Recipientes temáticos (viewBox 120×100). Cada categoria tem um "lugar de guardar" com silhueta
 * própria — a criança associa a FUNÇÃO do lugar (cesta de comida, casinha de bicho...), não só a cor.
 */
import type { ReactElement } from 'react';

const INK = '#33302d';
const s = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const };

export const BOX_ART: Record<string, () => ReactElement> = {
  cesta: () => (
    <g>
      <path d="M22 44c0-26 76-26 76 0" fill="none" stroke="#a8743f" strokeWidth="6" strokeLinecap="round" />
      <path d="M10 44h100l-10 48H20z" fill="#d9a066" {...s} />
      <path d="M16 58h88M18 72h84M30 44l4 48M50 44l2 48M70 44l-2 48M90 44l-4 48" stroke="#a8743f" strokeWidth="2.5" />
      <path d="M10 44h100" {...s} />
      <path d="M60 52c-2-2-8-2-8 4s6 10 8 10 8-4 8-10-6-6-8-4z" fill="#e8574a" stroke={INK} strokeWidth="2" />
    </g>
  ),
  casinha: () => (
    <g>
      <path d="M14 48 60 14l46 34v44H14z" fill="#e5735c" {...s} />
      <path d="M6 52 60 10l54 42" fill="none" stroke="#9d3d2c" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M42 92V68a18 18 0 0 1 36 0v24z" fill="#5b3a29" {...s} />
      <ellipse cx="60" cy="40" rx="14" ry="5" fill="#fff" stroke={INK} strokeWidth="2" />
      <text x="60" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill={INK}>AU</text>
    </g>
  ),
  garagem: () => (
    <g>
      <path d="M8 40 60 14l52 26v52H8z" fill="#9fb4c3" {...s} />
      <rect x="22" y="46" width="76" height="46" fill="#e8eef2" {...s} />
      {[54, 62, 70, 78, 86].map((y) => <path key={y} d={`M22 ${y}h76`} stroke="#9fb4c3" strokeWidth="2.5" />)}
      <circle cx="60" cy="30" r="5" fill="#ffd65a" stroke={INK} strokeWidth="2" />
    </g>
  ),
  'guarda-roupa': () => (
    <g>
      <rect x="20" y="10" width="80" height="82" rx="6" fill="#c08457" {...s} />
      <path d="M60 10v82" {...s} />
      <circle cx="54" cy="52" r="3" fill="#ffd65a" stroke={INK} strokeWidth="2" />
      <circle cx="66" cy="52" r="3" fill="#ffd65a" stroke={INK} strokeWidth="2" />
      <path d="M30 22h20v12H30zM70 22h20v12H70z" fill="#e3b17f" stroke={INK} strokeWidth="2" />
      <path d="M26 92v6M94 92v6" {...s} />
    </g>
  ),
  bau: () => (
    <g>
      <path d="M12 46c0-26 96-26 96 0z" fill="#5aa9e6" {...s} />
      <rect x="12" y="46" width="96" height="46" rx="4" fill="#7cc06a" {...s} />
      <path d="M12 60h96" stroke="#4f8a4a" strokeWidth="3" />
      <rect x="52" y="52" width="16" height="16" rx="3" fill="#ffd65a" {...s} />
      <path d="M30 76l6 6 10-12M80 72a6 6 0 1 1 0 .1" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  armario: () => (
    <g>
      <rect x="14" y="12" width="92" height="80" rx="6" fill="#f3e3c3" {...s} />
      <path d="M14 52h92M60 12v80" {...s} />
      <path d="M26 30h22v6H26z" fill="#fff" stroke={INK} strokeWidth="2" />
      <path d="M74 24c0 8 14 8 14 0z" fill="#fff" stroke={INK} strokeWidth="2" />
      <circle cx="54" cy="32" r="2.6" fill={INK} />
      <circle cx="66" cy="72" r="2.6" fill={INK} />
    </g>
  ),
  banheira: () => (
    <g>
      <path d="M86 46V20c0-6 10-6 10 0" fill="none" stroke="#9fb4c3" strokeWidth="5" strokeLinecap="round" />
      <path d="M8 46h104v10c0 20-14 32-34 32H42C22 88 8 76 8 56z" fill="#fff" {...s} />
      {[[30, 40, 8], [46, 34, 10], [64, 38, 7], [78, 32, 6]].map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} fill="#d6ecfa" stroke="#7fb4d8" strokeWidth="2" />)}
      <path d="M22 88l-4 8M98 88l4 8" {...s} />
    </g>
  ),
  mochila: () => (
    <g>
      <path d="M40 22c0-14 40-14 40 0" fill="none" stroke={INK} strokeWidth="5" />
      <rect x="22" y="20" width="76" height="72" rx="20" fill="#f28d4e" {...s} />
      <rect x="34" y="56" width="52" height="30" rx="8" fill="#f6b17e" {...s} />
      <path d="M34 66h52" stroke={INK} strokeWidth="2" />
      <circle cx="60" cy="40" r="5" fill="#ffd65a" stroke={INK} strokeWidth="2" />
    </g>
  ),
  vaso: () => (
    <g>
      <path d="M22 40h76l-10 52H32z" fill="#d07a4e" {...s} />
      <path d="M16 32h88v10H16z" fill="#e08d5f" {...s} />
      <path d="M40 32c-6-14 0-20 8-16M80 32c6-14 0-20-8-16M60 32V12" fill="none" stroke="#4f8a4a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="12" r="6" fill="#f28db2" stroke={INK} strokeWidth="2" />
    </g>
  ),
};

export function BoxArt({ art }: { art: string }) {
  const draw = BOX_ART[art];
  return (
    <svg viewBox="0 0 120 100" width="100%" height="100%" aria-hidden="true">
      {draw ? draw() : <rect x="10" y="20" width="100" height="70" rx="8" fill="#ddd" stroke={INK} strokeWidth="3" />}
    </svg>
  );
}

/** Esteira rolante (fundo do palco). As listras andam via CSS. */
export function Belt() {
  return (
    <svg className="opc-belt__svg" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
      <rect x="0" y="6" width="400" height="28" rx="14" fill="var(--opc-belt)" stroke={INK} strokeWidth="3" />
      <circle cx="16" cy="20" r="10" fill="#cfd6dc" stroke={INK} strokeWidth="3" />
      <circle cx="384" cy="20" r="10" fill="#cfd6dc" stroke={INK} strokeWidth="3" />
    </svg>
  );
}
