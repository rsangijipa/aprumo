/* Arte autoral em SVG (recorte de papel cartão). Cores via tokens --fs-*; animais em cores naturais. */
import type { ReactNode } from 'react';
import type { AnimalId, Book, HidingSpot, Scene } from './logic';

const Eye = ({ x, y, r = 3.2 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#2b2a33" />
    <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" />
  </g>
);
const Smile = ({ d }: { d: string }) => <path d={d} fill="none" stroke="#2b2a33" strokeWidth="1.8" strokeLinecap="round" />;
const Cheek = ({ x, y }: { x: number; y: number }) => <ellipse cx={x} cy={y} rx="3.6" ry="2.2" fill="#f2a59a" opacity="0.7" />;

const ANIMAL_ART: Record<AnimalId, ReactNode> = {
  vaca: (
    <g>
      <ellipse cx="54" cy="68" rx="30" ry="19" fill="#fbf7ef" stroke="#4a3f3a" strokeWidth="1.5" />
      <path d="M44 54c6 2 8 9 3 13s-12 0-11-6 4-8 8-7zM66 66c5-1 9 3 7 8s-9 5-11 1 0-8 4-9z" fill="#3d3532" />
      <rect x="32" y="80" width="7" height="15" rx="3" fill="#fbf7ef" stroke="#4a3f3a" strokeWidth="1.3" />
      <rect x="68" y="80" width="7" height="15" rx="3" fill="#fbf7ef" stroke="#4a3f3a" strokeWidth="1.3" />
      <path d="M17 34l-4-7 7 3zM39 34l4-7-7 3z" fill="#e9d9b8" />
      <ellipse cx="13" cy="40" rx="6" ry="3.5" fill="#fbf7ef" stroke="#4a3f3a" strokeWidth="1.2" />
      <ellipse cx="43" cy="40" rx="6" ry="3.5" fill="#fbf7ef" stroke="#4a3f3a" strokeWidth="1.2" />
      <circle cx="28" cy="46" r="15" fill="#fbf7ef" stroke="#4a3f3a" strokeWidth="1.5" />
      <ellipse cx="28" cy="56" rx="11" ry="7.5" fill="#f3b7a8" />
      <circle cx="24" cy="56" r="1.6" fill="#7a4a43" /><circle cx="32" cy="56" r="1.6" fill="#7a4a43" />
      <Eye x={22} y={43} /><Eye x={34} y={43} />
    </g>
  ),
  boi: (
    <g>
      <ellipse cx="55" cy="68" rx="31" ry="19" fill="#e8e3da" stroke="#5a524c" strokeWidth="1.5" />
      <path d="M44 50c6-8 16-8 18 0z" fill="#d9d2c6" stroke="#5a524c" strokeWidth="1.2" />
      <rect x="33" y="80" width="7" height="15" rx="3" fill="#e8e3da" stroke="#5a524c" strokeWidth="1.3" />
      <rect x="70" y="80" width="7" height="15" rx="3" fill="#e8e3da" stroke="#5a524c" strokeWidth="1.3" />
      <path d="M19 33c-6-2-9-8-8-12 3 4 6 6 11 7zM37 33c6-2 9-8 8-12-3 4-6 6-11 7z" fill="#cdb98f" />
      <ellipse cx="13" cy="42" rx="6" ry="3" fill="#d9d2c6" />
      <ellipse cx="43" cy="42" rx="6" ry="3" fill="#d9d2c6" />
      <circle cx="28" cy="46" r="15" fill="#e8e3da" stroke="#5a524c" strokeWidth="1.5" />
      <ellipse cx="28" cy="56" rx="10" ry="7" fill="#8f8780" />
      <circle cx="24" cy="56" r="1.5" fill="#3a3430" /><circle cx="32" cy="56" r="1.5" fill="#3a3430" />
      <Eye x={22} y={43} /><Eye x={34} y={43} />
    </g>
  ),
  cavalo: (
    <g>
      <ellipse cx="58" cy="66" rx="28" ry="16" fill="#9a5f3b" />
      <rect x="38" y="76" width="6" height="19" rx="3" fill="#9a5f3b" /><rect x="72" y="76" width="6" height="19" rx="3" fill="#9a5f3b" />
      <path d="M84 60c8 2 10 14 6 22-1-8-4-12-8-14z" fill="#4b2e20" />
      <path d="M30 66c-2-14 0-26 8-34l12 8c-6 6-8 16-6 26z" fill="#9a5f3b" />
      <path d="M38 30c6-2 14 2 16 10l-6 2c-2-4-6-6-10-6z" fill="#4b2e20" />
      <path d="M22 30c4-8 14-10 20-4l2 10c-4 10-10 14-18 12-6-2-8-10-4-18z" fill="#a86a43" />
      <path d="M33 22l3-7 3 8z" fill="#9a5f3b" />
      <ellipse cx="22" cy="44" rx="7" ry="5" fill="#c99877" />
      <circle cx="19" cy="44" r="1.3" fill="#4b2e20" />
      <Eye x={31} y={33} />
    </g>
  ),
  galinha: (
    <g>
      <path d="M44 92h4M58 92h4" stroke="#e0a02c" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M46 84v8M60 84v8" stroke="#e0a02c" strokeWidth="2.5" />
      <path d="M78 50c10-4 14 10 6 18z" fill="#a8532e" />
      <ellipse cx="54" cy="68" rx="26" ry="20" fill="#b9643a" />
      <path d="M48 64c8-4 18-2 20 6-8 4-16 2-20-6z" fill="#8d4627" />
      <circle cx="38" cy="44" r="14" fill="#c4703f" />
      <path d="M30 31c2-6 6-6 7-1 2-5 6-5 7 0 2-3 5-1 4 3z" fill="#d8443a" />
      <path d="M24 46l-8 3 8 3z" fill="#e8b23a" />
      <path d="M27 52c0 5 3 7 5 5" fill="#d8443a" />
      <Eye x={34} y={42} r={2.8} />
    </g>
  ),
  pato: (
    <g>
      <path d="M44 93h8M60 93h8" stroke="#e98a2c" strokeWidth="3" strokeLinecap="round" />
      <path d="M48 84v9M64 84v9" stroke="#e98a2c" strokeWidth="2.5" />
      <ellipse cx="58" cy="70" rx="28" ry="16" fill="#fbfaf5" stroke="#c9c3b5" strokeWidth="1.2" />
      <path d="M84 62l8-6-2 12z" fill="#fbfaf5" stroke="#c9c3b5" strokeWidth="1" />
      <path d="M52 66c8-4 18-2 22 6-10 3-18 2-22-6z" fill="#ebe6d9" />
      <circle cx="36" cy="46" r="13" fill="#fbfaf5" stroke="#c9c3b5" strokeWidth="1.2" />
      <path d="M38 58c-2 4-2 8 2 10" fill="none" stroke="#c9c3b5" strokeWidth="1.2" />
      <path d="M24 46c-8 0-12 3-12 5s6 3 13 1z" fill="#ef9a3a" />
      <Eye x={33} y={43} r={2.8} />
    </g>
  ),
  cachorro: (
    <g>
      <path d="M82 58c10-6 12-14 8-18-2 6-6 10-12 12z" fill="#c98a4a" />
      <ellipse cx="58" cy="68" rx="27" ry="16" fill="#d69a58" />
      <ellipse cx="58" cy="74" rx="16" ry="8" fill="#f0d2a6" />
      <rect x="38" y="76" width="7" height="18" rx="3.5" fill="#d69a58" /><rect x="70" y="76" width="7" height="18" rx="3.5" fill="#d69a58" />
      <circle cx="32" cy="46" r="16" fill="#d69a58" />
      <path d="M18 36c-6 4-6 16 0 20 4-4 4-14 0-20zM46 36c6 4 6 16 0 20-4-4-4-14 0-20z" fill="#a8693a" />
      <ellipse cx="32" cy="54" rx="9" ry="6.5" fill="#f0d2a6" />
      <ellipse cx="32" cy="50" rx="3.4" ry="2.4" fill="#3a2b25" />
      <Smile d="M28 56q4 3 8 0" />
      <Eye x={26} y={43} /><Eye x={38} y={43} />
    </g>
  ),
  gato: (
    <g>
      <path d="M80 72c12-2 14-18 8-26" fill="none" stroke="#8e8a92" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="58" cy="74" rx="24" ry="15" fill="#a29da6" />
      <path d="M52 62v20M60 60v22M68 62v18" stroke="#7d7882" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="40" y="80" width="7" height="14" rx="3.5" fill="#a29da6" /><rect x="68" y="80" width="7" height="14" rx="3.5" fill="#a29da6" />
      <path d="M20 40l2-16 10 9zM44 40l-2-16-10 9z" fill="#a29da6" />
      <path d="M23 35l1-7 4 4zM41 35l-1-7-4 4z" fill="#f0b5b0" />
      <circle cx="32" cy="48" r="15" fill="#a29da6" />
      <path d="M32 54l-2.5-2.5h5z" fill="#e88f95" />
      <path d="M14 50h10M14 55l10-2M50 50H40M50 55l-10-2" stroke="#5a5560" strokeWidth="1" />
      <Smile d="M28 58q2 2 4 0q2 2 4 0" />
      <Eye x={26} y={45} r={3} /><Eye x={38} y={45} r={3} />
    </g>
  ),
  porco: (
    <g>
      <path d="M84 64c6-2 6 6 2 6s-2-6 4-6" fill="none" stroke="#e48fa0" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="58" cy="68" rx="28" ry="18" fill="#f4abb8" />
      <rect x="38" y="78" width="7" height="16" rx="3" fill="#f4abb8" /><rect x="70" y="78" width="7" height="16" rx="3" fill="#f4abb8" />
      <path d="M20 36l4-10 6 8zM44 36l-4-10-6 8z" fill="#e48fa0" />
      <circle cx="32" cy="50" r="16" fill="#f7b6c2" />
      <ellipse cx="32" cy="56" rx="8" ry="6" fill="#e88a9c" />
      <ellipse cx="29" cy="56" rx="1.6" ry="2.2" fill="#a2475a" /><ellipse cx="35" cy="56" rx="1.6" ry="2.2" fill="#a2475a" />
      <Cheek x={21} y={53} /><Cheek x={43} y={53} />
      <Eye x={26} y={45} r={2.8} /><Eye x={38} y={45} r={2.8} />
    </g>
  ),
  arara: (
    <g>
      <path d="M8 86h84" stroke="#7a5536" strokeWidth="5" strokeLinecap="round" />
      <path d="M58 70l8 26-12-4z" fill="#2f6fb5" /><path d="M54 72l2 24-8-6z" fill="#d8443a" />
      <ellipse cx="50" cy="58" rx="16" ry="22" fill="#d8443a" />
      <path d="M58 48c10 6 10 22 2 30-4-8-6-20-2-30z" fill="#2f6fb5" />
      <path d="M58 52c4 2 5 8 3 12" fill="none" stroke="#f0c43a" strokeWidth="3" />
      <circle cx="46" cy="34" r="12" fill="#d8443a" />
      <ellipse cx="42" cy="34" rx="5" ry="6" fill="#fbf4ea" />
      <path d="M36 36c-6 0-8 6-4 10 2-4 4-6 6-6z" fill="#3a3438" />
      <path d="M44 84h4M52 84h4" stroke="#5a5560" strokeWidth="2.5" strokeLinecap="round" />
      <Eye x={43} y={33} r={2.4} />
    </g>
  ),
  capivara: (
    <g>
      <path d="M22 66c0-16 14-24 34-24s30 8 30 22-8 22-30 22-34-6-34-20z" fill="#8a6446" />
      <rect x="34" y="80" width="8" height="14" rx="3" fill="#7a5638" /><rect x="68" y="80" width="8" height="14" rx="3" fill="#7a5638" />
      <path d="M12 52c0-10 8-16 18-16s14 6 14 16-6 16-16 16-16-6-16-16z" fill="#93694a" />
      <ellipse cx="34" cy="38" rx="4" ry="3" fill="#7a5638" />
      <ellipse cx="14" cy="56" rx="5" ry="6" fill="#6e4d33" />
      <circle cx="13" cy="54" r="1.2" fill="#2b2a33" />
      <Smile d="M14 62q4 2 7 0" />
      <Eye x={26} y={46} r={2.6} />
    </g>
  ),
  sapo: (
    <g>
      <path d="M18 92c4-8 12-10 18-6M82 92c-4-8-12-10-18-6" fill="none" stroke="#4f9a4a" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="50" cy="70" rx="32" ry="22" fill="#6db35f" />
      <ellipse cx="50" cy="78" rx="20" ry="11" fill="#cfe7a8" />
      <circle cx="34" cy="48" r="11" fill="#6db35f" /><circle cx="66" cy="48" r="11" fill="#6db35f" />
      <circle cx="34" cy="47" r="6.5" fill="#fff" /><circle cx="66" cy="47" r="6.5" fill="#fff" />
      <Eye x={35} y={48} r={3.6} /><Eye x={65} y={48} r={3.6} />
      <Smile d="M34 66q16 10 32 0" />
      <Cheek x={28} y={64} /><Cheek x={72} y={64} />
    </g>
  ),
};

export function AnimalArt({ id, baby }: { id: AnimalId; baby?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true" className="fs-animal__svg">
      <ellipse cx="50" cy="95" rx={baby ? 22 : 36} ry="3.5" fill="#000" opacity="0.12" />
      <g transform={baby ? 'translate(50 96) scale(0.62) translate(-50 -96)' : undefined}>{ANIMAL_ART[id]}</g>
    </svg>
  );
}

/* ------------------------------------------------------------------ esconderijos (frente da aba) */

const HIDING_VIEW: Record<HidingSpot, [number, number]> = {
  celeiro: [100, 112], porteira: [100, 73], moita: [100, 77], lagoa: [100, 47], 'pe-de-manga': [100, 106], ipe: [100, 112], curral: [100, 66],
};

const HIDING_ART: Record<HidingSpot, ReactNode> = {
  celeiro: (
    <g>
      <path d="M6 44L50 6l44 38v66H6z" fill="var(--fs-barn)" stroke="var(--fs-paper-edge)" strokeWidth="2" />
      <path d="M2 46L50 4l48 42" fill="none" stroke="var(--fs-barn-roof)" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
      <rect x="22" y="58" width="56" height="52" fill="var(--fs-barn-dark)" />
      <path d="M22 58l56 52M78 58l-56 52" stroke="var(--fs-paper)" strokeWidth="4" />
      <rect x="22" y="58" width="56" height="52" fill="none" stroke="var(--fs-paper)" strokeWidth="4" />
      <circle cx="50" cy="36" r="8" fill="var(--fs-paper)" />
    </g>
  ),
  porteira: (
    <g>
      <rect x="4" y="4" width="10" height="68" rx="3" fill="var(--fs-wood-dark)" />
      <rect x="86" y="4" width="10" height="68" rx="3" fill="var(--fs-wood-dark)" />
      {[12, 30, 48].map((y) => <rect key={y} x="10" y={y} width="80" height="11" rx="3" fill="var(--fs-wood)" stroke="var(--fs-paper-edge)" strokeWidth="1.2" />)}
      <path d="M14 58L86 14" stroke="var(--fs-wood)" strokeWidth="10" strokeLinecap="round" />
      <path d="M14 58L86 14" stroke="var(--fs-paper-edge)" strokeWidth="1.2" opacity="0.5" />
    </g>
  ),
  moita: (
    <g>
      <path d="M8 76c-8-14 0-30 14-30 0-16 18-26 30-16 8-14 30-10 32 6 14 2 20 22 10 32-2 6-6 8-10 8H14c-3 0-5-0-6 0z" fill="var(--fs-bush)" stroke="var(--fs-bush-dark)" strokeWidth="2" />
      <path d="M26 54c6-4 12-2 14 4M56 40c6-2 12 2 12 8M64 62c4-4 10-2 12 2" fill="none" stroke="var(--fs-bush-dark)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="36" cy="66" r="3" fill="var(--fs-berry)" /><circle cx="72" cy="50" r="3" fill="var(--fs-berry)" />
    </g>
  ),
  lagoa: (
    <g>
      <ellipse cx="50" cy="26" rx="48" ry="19" fill="var(--fs-water)" stroke="var(--fs-water-dark)" strokeWidth="2" />
      <path d="M20 22q6-4 12 0M54 30q6-4 12 0M40 16q5-3 10 0" fill="none" stroke="var(--fs-paper)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <ellipse cx="74" cy="20" rx="9" ry="4" fill="var(--fs-bush)" /><circle cx="76" cy="19" r="2" fill="var(--fs-berry)" />
      <path d="M8 30c0-12 2-20 4-24M14 30c1-10 4-16 6-18" stroke="var(--fs-bush-dark)" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  'pe-de-manga': (
    <g>
      <rect x="44" y="70" width="12" height="36" rx="4" fill="var(--fs-wood-dark)" />
      <path d="M8 56c-8-22 10-44 30-40 8-14 32-14 40 2 18 2 24 26 14 40-4 14-20 18-32 14-10 8-30 6-36-2-10 0-14-6-16-14z" fill="var(--fs-tree)" stroke="var(--fs-bush-dark)" strokeWidth="2" />
      {[[30, 44], [58, 36], [70, 58], [40, 66]].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="5" ry="6.5" fill="var(--fs-mango)" />
      ))}
    </g>
  ),
  ipe: (
    <g>
      <path d="M46 112V66M50 80l14-12M48 88L34 76" stroke="var(--fs-wood-dark)" strokeWidth="7" strokeLinecap="round" />
      <path d="M10 52c-6-20 12-40 30-34 8-12 30-12 36 2 16 2 22 24 12 36-4 12-18 16-30 12-10 6-28 4-34-2-8 0-12-6-14-14z" fill="var(--fs-ipe)" stroke="var(--fs-ipe-dark)" strokeWidth="2" />
      {[[28, 36], [52, 28], [70, 46], [36, 58], [60, 62]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="var(--fs-ipe-dark)" opacity="0.55" />
      ))}
    </g>
  ),
  curral: (
    <g>
      {[6, 32, 58, 84].map((x) => <rect key={x} x={x} y="4" width="10" height="60" rx="3" fill="var(--fs-wood-dark)" />)}
      {[14, 32, 48].map((y) => <rect key={y} x="2" y={y} width="96" height="9" rx="3" fill="var(--fs-wood)" stroke="var(--fs-paper-edge)" strokeWidth="1.2" />)}
    </g>
  ),
};

export function HidingArt({ hide }: { hide: HidingSpot }) {
  const [w, h] = HIDING_VIEW[hide];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true" className="fs-hide__svg">
      {HIDING_ART[hide]}
    </svg>
  );
}

/* ------------------------------------------------------------------ cenários */

export function SceneArt({ scene, plain }: { scene: Scene; plain: boolean }) {
  if (plain) {
    return (
      <svg viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true" className="fs-scene__svg">
        <rect width="1000" height="560" fill="var(--fs-page)" />
        <path d="M0 400H1000" stroke="var(--fs-paper-edge)" strokeWidth="3" opacity="0.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true" className="fs-scene__svg">
      <defs>
        <filter id="fs-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.2  0 0 0 0.08 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="fs-cut" x="-5%" y="-5%" width="110%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#4a3b2a" floodOpacity="0.22" />
        </filter>
      </defs>
      <rect width="1000" height="560" fill="var(--fs-sky)" />
      <circle cx="880" cy="80" r="44" fill="var(--fs-sun)" filter="url(#fs-cut)" />
      <path d="M150 90c0-18 26-24 36-10 8-14 34-10 34 8 14 0 18 18 4 22H160c-14 0-18-14-10-20z" fill="var(--fs-cloud)" filter="url(#fs-cut)" />
      {scene === 'fazenda' ? (
        <g filter="url(#fs-cut)">
          <path d="M0 300C160 230 300 250 460 290S780 250 1000 280V560H0z" fill="var(--fs-hill)" />
          <path d="M0 360C200 320 420 350 600 370S860 340 1000 350V560H0z" fill="var(--fs-ground)" />
          <path d="M0 470C220 450 480 470 1000 455V560H0z" fill="var(--fs-ground-2)" />
          {[60, 140, 220, 300, 380].map((x) => <rect key={x} x={x} y="330" width="8" height="40" fill="var(--fs-wood-dark)" opacity="0.7" />)}
          <path d="M50 340H392M50 356H392" stroke="var(--fs-wood)" strokeWidth="6" opacity="0.7" />
        </g>
      ) : (
        <g filter="url(#fs-cut)">
          <path d="M0 290C180 250 340 270 520 300S820 260 1000 290V560H0z" fill="var(--fs-hill)" />
          <path d="M0 380C240 350 520 370 1000 360V560H0z" fill="var(--fs-ground)" />
          <path d="M0 450C200 425 420 470 620 450S880 430 1000 445V560H0z" fill="var(--fs-water)" />
          <path d="M60 490q30-12 60 0M300 470q30-12 60 0M560 500q30-12 60 0M820 480q30-12 60 0" fill="none" stroke="var(--fs-paper)" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
          {[30, 46, 960, 975].map((x) => <path key={x} d={`M${x} 452c-2-30 2-50 8-64`} stroke="var(--fs-bush-dark)" strokeWidth="5" fill="none" strokeLinecap="round" />)}
        </g>
      )}
      <rect width="1000" height="560" filter="url(#fs-grain)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ mão desenhada do adulto */

export function PointerHand() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true" className="fs-hand__svg">
      <g transform="rotate(-35 40 40)">
        <path d="M36 6c4 0 6 3 6 7v24h-12V13c0-4 2-7 6-7z" fill="var(--fs-hand)" stroke="var(--fs-hand-edge)" strokeWidth="2" />
        <path d="M26 34c0-4 4-6 8-6h16c6 0 10 4 10 10v14c0 12-8 20-20 20s-18-8-18-18V40c0-3 2-6 4-6z" fill="var(--fs-hand)" stroke="var(--fs-hand-edge)" strokeWidth="2" />
        <path d="M42 36v8M50 36v8" stroke="var(--fs-hand-edge)" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 74l6-10h28l6 10z" fill="var(--fs-sleeve)" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ capa do livro */

export function BookCover({ book }: { book: Book }) {
  const first = book.pages[0]?.flaps[0]?.animal ?? 'vaca';
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" className="fs-cover__svg">
      <rect x="4" y="4" width="152" height="112" rx="14" fill={book.scene === 'rio' ? 'var(--fs-cover-rio)' : 'var(--fs-cover-farm)'} />
      <rect x="4" y="4" width="14" height="112" rx="6" fill="#000" opacity="0.12" />
      <rect x="28" y="16" width="116" height="88" rx="10" fill="var(--fs-page)" />
      <g transform="translate(46 22) scale(0.82)">
        <AnimalArtInline id={first} />
      </g>
    </svg>
  );
}
function AnimalArtInline({ id }: { id: AnimalId }) {
  return <g>{ANIMAL_ART[id]}</g>;
}
