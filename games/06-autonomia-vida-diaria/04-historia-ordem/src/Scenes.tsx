/**
 * História em Ordem — cenas próprias (viewBox 120×90). Cada etapa muda UMA coisa visível em relação
 * à anterior (a pista temporal está no desenho, não em números ou texto).
 */
import type { ReactElement, ReactNode } from 'react';

const INK = '#3b3340';
const SKIN = '#f2c6a0';
const HAIR = '#5b3a29';

/* ------------------------------------------------------------ cenários */

const Outdoor = ({ children, sun = true }: { children: ReactNode; sun?: boolean }) => (
  <g>
    <rect width="120" height="90" fill="#cfe9f5" />
    {sun && <circle cx="102" cy="16" r="9" fill="#ffd65a" />}
    <path d="M0 66c30-8 60-8 120 0v24H0z" fill="#9fd08a" />
    {children}
  </g>
);
const Indoor = ({ children, wall = '#f5ead9', floor = '#d9b98f' }: { children: ReactNode; wall?: string; floor?: string }) => (
  <g>
    <rect width="120" height="90" fill={wall} />
    <rect y="68" width="120" height="22" fill={floor} />
    <path d="M0 68h120" stroke={INK} strokeOpacity=".2" strokeWidth="2" />
    {children}
  </g>
);
const Beach = ({ children }: { children: ReactNode }) => (
  <g>
    <rect width="120" height="90" fill="#bfe6f7" />
    <circle cx="20" cy="16" r="8" fill="#ffd65a" />
    <path d="M0 50c20-4 40 4 60 0s40-4 60 0v8H0z" fill="#6fc0e0" />
    <path d="M0 56h120v34H0z" fill="#f3dca4" />
    {children}
  </g>
);

/* ------------------------------------------------------------ peças */

function Kid({ x, y, s = 1, mood = 'smile', shirt = '#5aa9e6' }: { x: number; y: number; s?: number; mood?: 'smile' | 'sleep' | 'open'; shirt?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
      <path d="M-10 28c0-12 4-18 10-18s10 6 10 18z" fill={shirt} />
      <circle cx="0" cy="0" r="10" fill={SKIN} />
      <path d="M-10-2c0-8 6-11 10-11s10 3 10 11c-4-4-8-5-10-5s-6 1-10 5z" fill={HAIR} />
      {mood === 'sleep' ? (
        <path d="M-6 1q2 2 4 0M2 1q2 2 4 0" fill="none" strokeLinecap="round" />
      ) : (
        <g fill={INK} stroke="none">
          <circle cx="-4" cy="1" r="1.4" />
          <circle cx="4" cy="1" r="1.4" />
        </g>
      )}
      {mood === 'open' ? <ellipse cx="0" cy="6" rx="2.2" ry="2.6" fill="#b44" /> : <path d="M-3 5q3 3 6 0" fill="none" strokeLinecap="round" />}
    </g>
  );
}
const Hand = ({ x, y, r = 0, s = 1 }: { x: number; y: number; r?: number; s?: number }) => (
  <path
    transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
    d="M-8 6c-3-6-2-12 2-12h2v-4c0-2 3-2 3 0v3-5c0-2 3-2 3 0v5-4c0-2 3-2 3 0v5-2c0-2 3-2 3 0v8c0 6-4 10-9 10h-1c-3 0-5-2-6-4z"
    fill={SKIN}
    stroke={INK}
    strokeWidth="1.6"
    strokeLinejoin="round"
  />
);
const Pot = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
    <path d="M-14 0h28l-4 18h-20z" fill="#d07a4e" />
    <path d="M-16-4h32v5h-32z" fill="#e08d5f" />
    <ellipse cx="0" cy="-3" rx="14" ry="2.5" fill="#6b4a32" stroke="none" />
  </g>
);
const Block = ({ x, y, c }: { x: number; y: number; c: string }) => <rect x={x} y={y} width="22" height="16" rx="3" fill={c} stroke={INK} strokeWidth="1.8" />;
const Leaf = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="1.6">
    <path d="M-30 4c10-18 44-22 60-6-16 16-48 16-60 6z" fill="#7cc06a" />
    <path d="M-26 4c18-4 36-4 54-6" fill="none" strokeOpacity=".5" />
  </g>
);
const Bowl = ({ x, y, fill = '#fff' }: { x: number; y: number; fill?: string }) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="1.8">
    <path d="M-18 0h36c0 10-8 16-18 16S-18 10-18 0z" fill={fill} />
  </g>
);
const Cone = ({ x, y, scoops }: { x: number; y: number; scoops: number }) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
    {scoops >= 2 && <circle cx="0" cy="-16" r="8" fill="#f7a8c0" />}
    {scoops >= 1 && <circle cx="0" cy="-6" r={scoops >= 2 ? 9 : 7} fill="#fbe3a1" />}
    {scoops === 0.5 && <path d="M-6-2q6-6 12 0" fill="#fbe3a1" />}
    <path d="M-9 0h18L0 24z" fill="#e3a65a" />
    <path d="M-5 4l8 6M-6 8l9 6M2 2l-6 10" stroke="#b97d36" strokeWidth="1.2" />
  </g>
);
const Sparkle = ({ x, y }: { x: number; y: number }) => <path transform={`translate(${x} ${y})`} d="M0-6 1.5-1.5 6 0 1.5 1.5 0 6-1.5 1.5-6 0-1.5-1.5z" fill="#ffd65a" stroke={INK} strokeWidth="0.8" />;

/* ------------------------------------------------------------ cenas */

export const SCENES: Record<string, () => ReactElement> = {
  /* Planta (3) */
  'planta-1': () => (
    <Outdoor>
      <Pot x={60} y={60} />
      <Hand x={74} y={30} r={-15} />
      <ellipse cx="62" cy="48" rx="3" ry="2" fill="#7a5230" stroke={INK} strokeWidth="1" />
      <path d="M62 52v4" stroke={INK} strokeDasharray="1.5 2" />
    </Outdoor>
  ),
  'planta-2': () => (
    <Outdoor>
      <Pot x={56} y={60} />
      <path d="M56 56c0-6 0-8 0-10m0 4c-4-4-8-4-10-2 2 3 6 4 10 2m0-2c4-4 8-4 10-2-2 3-6 4-10 2" fill="#7cc06a" stroke={INK} strokeWidth="1.6" />
      <g stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
        <path d="M80 26h18v14H80z" fill="#5aa9e6" />
        <path d="M80 30l-12-6" stroke="#5aa9e6" strokeWidth="4" />
        <path d="M98 28c6 0 6 10 0 10" fill="none" />
      </g>
      {[[64, 34], [61, 40], [66, 44]].map(([x, y]) => <path key={`${x}${y}`} d={`M${x} ${y}q-2 3 0 4q2-1 0-4z`} fill="#5aa9e6" stroke={INK} strokeWidth=".8" />)}
    </Outdoor>
  ),
  'planta-3': () => (
    <Outdoor>
      <Pot x={60} y={60} />
      <path d="M60 56V30" stroke="#4f8a4a" strokeWidth="3" />
      <path d="M60 46c-8-6-14-4-16 0 4 4 10 4 16 0z" fill="#7cc06a" stroke={INK} strokeWidth="1.4" />
      <g transform="translate(60 26)" stroke={INK} strokeWidth="1.4">
        {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-8" rx="5" ry="8" fill="#f28db2" transform={`rotate(${a})`} />)}
        <circle r="5" fill="#ffd65a" />
      </g>
    </Outdoor>
  ),
  /* Banana (3) */
  'banana-1': () => (
    <Indoor>
      <rect x="20" y="58" width="80" height="6" rx="2" fill="#b98a5a" stroke={INK} strokeWidth="1.6" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${44 + i * 10} 58c-6-14 2-28 14-34-6 10-8 22-4 34z`} fill="#ffd84d" stroke={INK} strokeWidth="1.6" />)}
    </Indoor>
  ),
  'banana-2': () => (
    <Indoor>
      <path d="M60 24c-6 14-6 28 0 40 6-12 6-26 0-40z" fill="#fff6cf" stroke={INK} strokeWidth="1.6" />
      <path d="M58 46c-10 4-16 12-16 20 8-4 14-10 16-20zM62 46c10 4 16 12 16 20-8-4-14-10-16-20zM60 50c0 8 0 14 0 18" fill="#ffd84d" stroke={INK} strokeWidth="1.6" />
      <Hand x={60} y={70} s={1.1} />
    </Indoor>
  ),
  'banana-3': () => (
    <Indoor>
      <ellipse cx="44" cy="70" rx="22" ry="5" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <path d="M34 68c4-6 10-6 12 0M44 68c2-6 8-8 12-2" fill="#ffd84d" stroke={INK} strokeWidth="1.4" />
      <Kid x={86} y={36} mood="smile" />
      <path d="M96 22h8M100 18v8" stroke="#f28db2" strokeWidth="2.4" strokeLinecap="round" />
    </Indoor>
  ),
  /* Torre (3) */
  'torre-1': () => (
    <Indoor wall="#eaf2f7">
      <Block x={49} y={52} c="#f28db2" />
    </Indoor>
  ),
  'torre-2': () => (
    <Indoor wall="#eaf2f7">
      <Block x={49} y={52} c="#f28db2" />
      <Block x={49} y={36} c="#ffd84d" />
    </Indoor>
  ),
  'torre-3': () => (
    <Indoor wall="#eaf2f7">
      <Block x={49} y={52} c="#f28db2" />
      <Block x={49} y={36} c="#ffd84d" />
      <Block x={49} y={20} c="#7cc06a" />
      <path d="M60 20V6" stroke={INK} strokeWidth="1.8" />
      <path d="M60 6h12l-4 4 4 4H60z" fill="#5aa9e6" stroke={INK} strokeWidth="1.4" />
    </Indoor>
  ),
  /* Lavar as mãos (4) */
  'maos-1': () => (
    <Indoor wall="#e3f1f1" floor="#b9d6d3">
      <Hand x={44} y={46} s={1.4} r={-10} />
      <Hand x={76} y={46} s={1.4} r={10} />
      {[[40, 44], [46, 52], [74, 42], [80, 50], [77, 54]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="2" fill="#8a6a4a" />)}
    </Indoor>
  ),
  'maos-2': () => (
    <Indoor wall="#e3f1f1" floor="#b9d6d3">
      <Hand x={50} y={48} s={1.4} r={-30} />
      <Hand x={70} y={48} s={1.4} r={30} />
      {[[52, 32, 6], [62, 28, 5], [70, 34, 7], [58, 40, 4], [80, 26, 4], [40, 30, 3]].map(([x, y, r]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fff" stroke="#9fc9e3" strokeWidth="1.4" />
      ))}
    </Indoor>
  ),
  'maos-3': () => (
    <Indoor wall="#e3f1f1" floor="#b9d6d3">
      <path d="M50 8h20v8H62v6h-4v-6h-8z" fill="#b8c4cc" stroke={INK} strokeWidth="1.6" />
      <path d="M60 22v22" stroke="#5aa9e6" strokeWidth="5" strokeLinecap="round" strokeDasharray="4 3" />
      <Hand x={52} y={56} s={1.3} r={-30} />
      <Hand x={68} y={56} s={1.3} r={30} />
    </Indoor>
  ),
  'maos-4': () => (
    <Indoor wall="#e3f1f1" floor="#b9d6d3">
      <path d="M36 30h48v26c0 4-4 6-8 6H44c-4 0-8-2-8-6z" fill="#f28db2" stroke={INK} strokeWidth="1.6" />
      <path d="M36 38h48M36 46h48" stroke="#fff" strokeWidth="2" />
      <Hand x={44} y={62} s={1.2} r={-10} />
      <Hand x={76} y={62} s={1.2} r={10} />
      <Sparkle x={30} y={56} />
      <Sparkle x={92} y={52} />
    </Indoor>
  ),
  /* Bolo (4) */
  'bolo-1': () => (
    <Indoor>
      <Bowl x={40} y={50} />
      <ellipse cx="78" cy="58" rx="7" ry="9" fill="#fff8e8" stroke={INK} strokeWidth="1.6" />
      <path d="M90 40h14v26H90z" fill="#e9dcc3" stroke={INK} strokeWidth="1.6" />
      <path d="M90 46h14" stroke={INK} strokeWidth="1.2" />
    </Indoor>
  ),
  'bolo-2': () => (
    <Indoor>
      <Bowl x={56} y={50} fill="#fff" />
      <ellipse cx="56" cy="51" rx="16" ry="3" fill="#f6dca0" />
      <path d="M62 50 78 22" stroke="#b98a5a" strokeWidth="4" strokeLinecap="round" />
      <path d="M48 46q6-6 14 0" fill="none" stroke={INK} strokeWidth="1.2" strokeDasharray="2 2" />
      <Hand x={80} y={26} r={-20} />
    </Indoor>
  ),
  'bolo-3': () => (
    <Indoor>
      <rect x="30" y="20" width="60" height="48" rx="4" fill="#cfd6dc" stroke={INK} strokeWidth="1.8" />
      <rect x="38" y="30" width="44" height="28" rx="3" fill="#ffb347" stroke={INK} strokeWidth="1.6" />
      <path d="M46 52h28v-8c0-4-6-6-14-6s-14 2-14 6z" fill="#e8b46e" stroke={INK} strokeWidth="1.4" />
      {[40, 52, 64, 76].map((x) => <circle key={x} cx={x} cy="25" r="2" fill={INK} />)}
    </Indoor>
  ),
  'bolo-4': () => (
    <Indoor>
      <ellipse cx="60" cy="64" rx="30" ry="5" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <path d="M36 62V46h48v16z" fill="#e8b46e" stroke={INK} strokeWidth="1.6" />
      <path d="M36 46c4 6 8 0 12 4s8-2 12 2 8-2 12 0 8 4 12-6" fill="#f7a8c0" stroke={INK} strokeWidth="1.4" />
      <rect x="57" y="30" width="6" height="14" fill="#5aa9e6" stroke={INK} strokeWidth="1.2" />
      <path d="M60 22c-3 4-3 6 0 8 3-2 3-4 0-8z" fill="#ffb347" stroke={INK} strokeWidth="1" />
    </Indoor>
  ),
  /* Borboleta (4) */
  'borboleta-1': () => (
    <Outdoor>
      <Leaf x={60} y={50} />
      <ellipse cx="58" cy="46" rx="3" ry="3.6" fill="#fff8e8" stroke={INK} strokeWidth="1.2" />
      <ellipse cx="64" cy="47" rx="3" ry="3.6" fill="#fff8e8" stroke={INK} strokeWidth="1.2" />
    </Outdoor>
  ),
  'borboleta-2': () => (
    <Outdoor>
      <Leaf x={60} y={50} />
      {[44, 51, 58, 65].map((x, i) => <circle key={x} cx={x} cy={44 - (i % 2) * 2} r="5" fill="#9ad16a" stroke={INK} strokeWidth="1.4" />)}
      <circle cx="72" cy="40" r="6" fill="#9ad16a" stroke={INK} strokeWidth="1.4" />
      <circle cx="74" cy="38" r="1.2" fill={INK} />
    </Outdoor>
  ),
  'borboleta-3': () => (
    <Outdoor>
      <path d="M20 14h80" stroke="#8a5a3c" strokeWidth="5" strokeLinecap="round" />
      <path d="M60 16v4" stroke={INK} strokeWidth="1.4" />
      <path d="M60 20c-8 4-8 24 0 32 8-8 8-28 0-32z" fill="#c9b27a" stroke={INK} strokeWidth="1.6" />
      <path d="M55 30h10M54 38h12M56 46h8" stroke={INK} strokeOpacity=".4" />
    </Outdoor>
  ),
  'borboleta-4': () => (
    <Outdoor>
      <g transform="translate(60 40)" stroke={INK} strokeWidth="1.6">
        <path d="M0 0c-6-16-24-20-26-8-2 10 12 14 26 8zM0 0c6-16 24-20 26-8 2 10-12 14-26 8z" fill="#f28d4e" />
        <path d="M0 2c-6 12-20 14-20 6 0-6 10-8 20-6zM0 2c6 12 20 14 20 6 0-6-10-8-20-6z" fill="#ffd84d" />
        <path d="M0-8v18" strokeWidth="3" />
        <path d="M0-8c-2-6-6-8-8-8M0-8c2-6 6-8 8-8" fill="none" />
      </g>
    </Outdoor>
  ),
  /* Manhã (5) */
  'manha-1': () => (
    <Indoor wall="#d8def5">
      <path d="M14 56h92v10H14zM14 46h18v20H14z" fill="#b98a5a" stroke={INK} strokeWidth="1.6" />
      <path d="M32 48h74v10H32z" fill="#9fc9e3" stroke={INK} strokeWidth="1.6" />
      <Kid x={42} y={40} s={0.8} mood="sleep" />
      <path d="M86 18a8 8 0 1 0 6 12 7 7 0 0 1-6-12z" fill="#ffd65a" stroke={INK} strokeWidth="1.2" />
      <text x="56" y="30" fontSize="10" fill={INK} fontWeight="700">z z</text>
    </Indoor>
  ),
  'manha-2': () => (
    <Indoor wall="#e3f1f1" floor="#b9d6d3">
      <rect x="64" y="14" width="34" height="30" rx="4" fill="#cfe9f5" stroke={INK} strokeWidth="1.6" />
      <Kid x={44} y={34} mood="open" />
      <path d="M50 40 66 32" stroke="#4fb3a9" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M48 41v-4" stroke="#fff" strokeWidth="3" />
    </Indoor>
  ),
  'manha-3': () => (
    <Indoor wall="#f5ead9">
      <Kid x={56} y={30} shirt="#7cc06a" />
      <path d="M40 58h32v10H40z" fill="#5a6fb0" stroke={INK} strokeWidth="1.6" />
      <path d="M86 40h20M96 34v40" stroke="#b98a5a" strokeWidth="2.4" />
      <path d="M88 44h16l-2 14h-12z" fill="#f28db2" stroke={INK} strokeWidth="1.4" />
    </Indoor>
  ),
  'manha-4': () => (
    <Indoor>
      <rect x="14" y="56" width="92" height="6" rx="2" fill="#b98a5a" stroke={INK} strokeWidth="1.6" />
      <Kid x={60} y={30} shirt="#7cc06a" />
      <Bowl x={60} y={48} fill="#fff" />
      <ellipse cx="60" cy="49" rx="16" ry="3" fill="#f3d27a" />
      <rect x="84" y="40" width="10" height="16" rx="2" fill="#fff" stroke={INK} strokeWidth="1.4" />
    </Indoor>
  ),
  'manha-5': () => (
    <Outdoor>
      <path d="M78 30h34v36H78z" fill="#e5735c" stroke={INK} strokeWidth="1.6" />
      <path d="M74 32l21-16 21 16" fill="#b8473a" stroke={INK} strokeWidth="1.6" />
      <rect x="90" y="48" width="10" height="18" fill="#ffd84d" stroke={INK} strokeWidth="1.4" />
      <Kid x={40} y={40} shirt="#7cc06a" />
      <rect x="22" y="40" width="10" height="16" rx="3" fill="#5a6fb0" stroke={INK} strokeWidth="1.4" />
    </Outdoor>
  ),
  /* Castelo de areia (5) */
  'castelo-1': () => (
    <Beach>
      <path d="M48 58h20l-3 16h-14z" fill="#f28db2" stroke={INK} strokeWidth="1.6" />
      <path d="M50 58c0-8 16-8 16 0" fill="none" stroke={INK} strokeWidth="1.6" />
      <path d="M76 74 88 54" stroke="#5aa9e6" strokeWidth="3" />
      <path d="M86 50l6-2 2 6-6 4z" fill="#5aa9e6" stroke={INK} strokeWidth="1.2" />
    </Beach>
  ),
  'castelo-2': () => (
    <Beach>
      <path d="M48 58h20l-3 16h-14z" fill="#f28db2" stroke={INK} strokeWidth="1.6" />
      <path d="M48 58c2-6 18-6 20 0z" fill="#e6c27a" stroke={INK} strokeWidth="1.2" />
      <path d="M70 52 86 40" stroke="#5aa9e6" strokeWidth="3" />
      <path d="M58 48c2 2 4 4 6 4" stroke="#e6c27a" strokeWidth="3" strokeLinecap="round" />
      <Hand x={90} y={40} r={20} />
    </Beach>
  ),
  'castelo-3': () => (
    <Beach>
      <path d="M50 74h20l-3-16h-14z" fill="#f28db2" stroke={INK} strokeWidth="1.6" />
      <path d="M44 56c4-10 28-10 32 0" fill="none" stroke={INK} strokeWidth="1.4" strokeDasharray="3 2" />
      <path d="M40 54l4 4M80 54l-4 4" stroke={INK} strokeWidth="1.4" />
    </Beach>
  ),
  'castelo-4': () => (
    <Beach>
      <path d="M44 74V58h8v-4h4v4h8v-4h4v4h8v16z" fill="#e6c27a" stroke={INK} strokeWidth="1.6" />
      <path d="M52 66h4v8h-4z" fill="#c9a35a" />
    </Beach>
  ),
  'castelo-5': () => (
    <Beach>
      <path d="M44 74V58h8v-4h4v4h8v-4h4v4h8v16z" fill="#e6c27a" stroke={INK} strokeWidth="1.6" />
      <path d="M60 54V40" stroke={INK} strokeWidth="1.6" />
      <path d="M60 40h12l-3 3 3 3H60z" fill="#e5483c" stroke={INK} strokeWidth="1.2" />
      <path d="M70 68c2-4 6-4 8 0z" fill="#f7a8c0" stroke={INK} strokeWidth="1.2" />
      <Kid x={96} y={52} s={0.8} />
    </Beach>
  ),
  /* Sorvete (5) */
  'sorvete-1': () => (
    <Outdoor>
      <rect x="30" y="34" width="56" height="28" rx="4" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <path d="M26 34c10-14 54-14 64 0z" fill="#f28db2" stroke={INK} strokeWidth="1.6" />
      <circle cx="40" cy="66" r="6" fill="#555" stroke={INK} strokeWidth="1.4" />
      <circle cx="76" cy="66" r="6" fill="#555" stroke={INK} strokeWidth="1.4" />
      <circle cx="48" cy="46" r="5" fill="#fbe3a1" stroke={INK} strokeWidth="1.2" />
      <circle cx="60" cy="46" r="5" fill="#f7a8c0" stroke={INK} strokeWidth="1.2" />
      <circle cx="72" cy="46" r="5" fill="#9ad16a" stroke={INK} strokeWidth="1.2" />
    </Outdoor>
  ),
  'sorvete-2': () => (
    <Outdoor>
      <rect x="60" y="34" width="50" height="28" rx="4" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <Hand x={44} y={46} r={80} s={1.2} />
      <circle cx="58" cy="40" r="6" fill="#ffd65a" stroke={INK} strokeWidth="1.4" />
      <text x="55.5" y="43" fontSize="8" fontWeight="700" fill={INK}>$</text>
    </Outdoor>
  ),
  'sorvete-3': () => (
    <Outdoor>
      <Cone x={60} y={40} scoops={2} />
      <Hand x={60} y={70} />
    </Outdoor>
  ),
  'sorvete-4': () => (
    <Outdoor>
      <Cone x={60} y={40} scoops={1} />
      <Hand x={60} y={70} />
    </Outdoor>
  ),
  'sorvete-5': () => (
    <Outdoor>
      <Kid x={60} y={40} />
      <path d="M50 46q10 6 20 0" fill="none" stroke="#f7a8c0" strokeWidth="2" />
      <Sparkle x={82} y={24} />
      <Sparkle x={36} y={28} />
    </Outdoor>
  ),
};

export function SceneArt({ scene, label }: { scene: string; label: string }) {
  const draw = SCENES[scene];
  return (
    <svg viewBox="0 0 120 90" width="100%" height="100%" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      {draw ? draw() : <rect width="120" height="90" fill="#eee" />}
    </svg>
  );
}
