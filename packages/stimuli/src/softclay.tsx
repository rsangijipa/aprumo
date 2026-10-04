import type { ReactNode } from 'react';

export function StimulusAppleSoftClay({ size = 120 }: { size?: number }): ReactNode {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="sc-apple-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sc-apple-body" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#ff6b6b" />
          <stop offset="25%" stopColor="#ee3838" />
          <stop offset="70%" stopColor="#c91a1a" />
          <stop offset="92%" stopColor="#910f0f" />
          <stop offset="100%" stopColor="#6b0808" />
        </radialGradient>
        <linearGradient id="sc-apple-stem" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#785028" />
          <stop offset="50%" stopColor="#543719" />
          <stop offset="100%" stopColor="#3b230d" />
        </linearGradient>
      </defs>
      <ellipse cx="512" cy="880" rx="320" ry="55" fill="url(#sc-apple-shadow)" />
      <path d="M 512 290 C 510 220, 545 160, 580 130 C 590 120, 605 130, 595 145 C 565 180, 538 230, 532 295 Z" fill="url(#sc-apple-stem)" />
      <path
        d="M 512 300 C 420 230, 240 250, 180 390 C 110 550, 190 780, 370 850 C 440 878, 485 860, 512 840 C 539 860, 584 878, 654 850 C 834 780, 914 550, 844 390 C 784 250, 604 230, 512 300 Z"
        fill="url(#sc-apple-body)"
      />
      <ellipse cx="360" cy="420" rx="140" ry="110" transform="rotate(-30 360 420)" fill="#ffffff" opacity="0.35" />
      <ellipse cx="330" cy="380" rx="60" ry="40" transform="rotate(-30 330 380)" fill="#ffffff" opacity="0.5" />
      <ellipse cx="512" cy="300" rx="50" ry="20" fill="#4d0808" opacity="0.55" />
    </svg>
  );
}

export function StimulusCarSoftClay({ size = 120 }: { size?: number }): ReactNode {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="sc-car-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sc-car-body" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="70%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e40af" />
        </radialGradient>
        <radialGradient id="sc-car-tire" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>
      <ellipse cx="512" cy="790" rx="390" ry="70" fill="url(#sc-car-shadow)" />
      <ellipse cx="260" cy="700" rx="65" ry="90" fill="url(#sc-car-tire)" />
      <ellipse cx="740" cy="690" rx="60" ry="85" fill="url(#sc-car-tire)" />
      <path
        d="M 170 650 C 160 580, 200 520, 260 520 C 310 520, 360 480, 410 380 C 450 300, 520 280, 620 290 C 720 300, 770 380, 810 490 C 870 510, 910 560, 900 640 C 890 710, 840 730, 780 730 C 740 730, 700 700, 670 700 C 620 700, 580 730, 480 730 C 420 730, 380 700, 340 700 C 280 700, 220 730, 180 720 C 165 710, 165 670, 170 650 Z"
        fill="url(#sc-car-body)"
      />
      <path d="M 430 380 C 460 320, 510 310, 580 320 L 580 470 C 510 470, 450 460, 400 450 C 410 420, 420 400, 430 380 Z" fill="#e0f2fe" />
      <path d="M 610 320 C 680 330, 720 390, 750 470 C 700 480, 650 480, 610 470 Z" fill="#e0f2fe" />
      <ellipse cx="560" cy="330" rx="90" ry="25" fill="#ffffff" opacity="0.35" />
      <ellipse cx="880" cy="580" rx="22" ry="32" transform="rotate(10 880 580)" fill="#facc15" />
      <ellipse cx="320" cy="740" rx="75" ry="105" fill="url(#sc-car-tire)" />
      <ellipse cx="320" cy="740" rx="40" ry="60" fill="#ffffff" />
      <ellipse cx="780" cy="725" rx="75" ry="105" fill="url(#sc-car-tire)" />
      <ellipse cx="780" cy="725" rx="40" ry="60" fill="#ffffff" />
    </svg>
  );
}

export function RoutineBrushTeeth({ size = 120 }: { size?: number }): ReactNode {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="sc-brush-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sc-brush-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="sc-brush-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <radialGradient id="sc-brush-paste" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="70%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>
      </defs>
      <ellipse cx="512" cy="800" rx="360" ry="50" fill="url(#sc-brush-shadow)" transform="rotate(-18 512 800)" />
      <g transform="rotate(-32 512 512)">
        <path d="M 280 480 C 280 460, 310 450, 380 460 L 760 485 C 830 490, 870 520, 870 545 C 870 570, 830 600, 760 600 L 380 570 C 310 570, 280 550, 280 520 Z" fill="url(#sc-brush-blue)" />
        <path d="M 520 480 C 550 480, 680 490, 710 495 C 715 530, 715 565, 710 595 C 680 595, 550 585, 520 580 Z" fill="url(#sc-brush-yellow)" />
        <rect x="180" y="475" width="130" height="60" rx="28" fill="url(#sc-brush-blue)" />
        <path d="M 190 475 C 190 420, 205 380, 220 380 L 280 380 C 295 380, 310 420, 310 475 Z" fill="#38bdf8" />
        <path d="M 185 390 C 185 350, 210 330, 240 330 C 270 330, 315 340, 335 370 C 320 400, 290 405, 230 400 C 205 400, 185 410, 185 390 Z" fill="url(#sc-brush-paste)" />
        <path d="M 210 360 C 240 345, 280 350, 310 375" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
      </g>
    </svg>
  );
}

export function RoutineWashHands({ size = 120 }: { size?: number }): ReactNode {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="sc-soap" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#bae6fd" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id="sc-skin" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="60%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </radialGradient>
      </defs>
      <circle cx="512" cy="460" r="130" fill="url(#sc-soap)" />
      <circle cx="430" cy="400" r="75" fill="url(#sc-soap)" />
      <circle cx="590" cy="410" r="85" fill="url(#sc-soap)" />
      <path d="M 230 760 C 240 680, 270 560, 360 490 C 400 460, 470 480, 480 530 C 490 570, 460 620, 420 670 Z" fill="url(#sc-skin)" />
      <rect x="360" y="440" width="130" height="48" rx="24" transform="rotate(-25 360 440)" fill="url(#sc-skin)" />
      <rect x="375" y="495" width="140" height="48" rx="24" transform="rotate(-15 375 495)" fill="url(#sc-skin)" />
      <path d="M 790 760 C 780 680, 750 560, 660 490 C 620 460, 550 480, 540 530 C 530 570, 560 620, 600 670 Z" fill="url(#sc-skin)" />
      <rect x="530" y="440" width="130" height="48" rx="24" transform="rotate(25 530 440)" fill="url(#sc-skin)" />
      <rect x="510" y="495" width="140" height="48" rx="24" transform="rotate(15 510 495)" fill="url(#sc-skin)" />
      <circle cx="512" cy="500" r="95" fill="url(#sc-soap)" />
      <circle cx="450" cy="560" r="55" fill="url(#sc-soap)" />
      <circle cx="570" cy="550" r="65" fill="url(#sc-soap)" />
      <ellipse cx="485" cy="470" rx="24" ry="12" transform="rotate(-30 485 470)" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

export function AvatarImitationChild({ size = 160 }: { size?: number }): ReactNode {
  return (
    <svg viewBox="0 0 1024 1536" width={size} height={Math.round(size * 1.5)} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="sc-avatar-skin" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="70%" stopColor="#fba868" />
          <stop offset="100%" stopColor="#ea7a28" />
        </radialGradient>
        <linearGradient id="sc-avatar-shirt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#84a98c" />
          <stop offset="70%" stopColor="#52796f" />
          <stop offset="100%" stopColor="#2f3e46" />
        </linearGradient>
      </defs>
      <ellipse cx="512" cy="1440" rx="280" ry="45" fill="#000000" opacity="0.15" />
      <path d="M 410 890 L 400 1320 C 400 1340, 460 1340, 460 1320 L 485 890 Z" fill="#475569" />
      <path d="M 539 890 L 564 1320 C 564 1340, 624 1340, 624 1320 L 614 890 Z" fill="#475569" />
      <ellipse cx="420" cy="1360" rx="65" ry="32" fill="#ffffff" />
      <ellipse cx="604" cy="1360" rx="65" ry="32" fill="#ffffff" />
      <path d="M 370 540 C 370 500, 430 480, 512 480 C 594 480, 654 500, 654 540 L 634 910 C 634 930, 390 930, 390 910 Z" fill="url(#sc-avatar-shirt)" />
      <path d="M 390 510 L 260 620 C 240 640, 270 680, 300 660 L 390 590 Z" fill="url(#sc-avatar-shirt)" />
      <path d="M 634 510 L 764 620 C 784 640, 754 680, 724 660 L 634 590 Z" fill="url(#sc-avatar-shirt)" />
      {/* Mãos abertas de imitação */}
      <circle cx="180" cy="830" r="48" fill="url(#sc-avatar-skin)" />
      <rect x="120" y="810" width="45" height="22" rx="11" transform="rotate(-30 120 810)" fill="url(#sc-avatar-skin)" />
      <circle cx="844" cy="830" r="48" fill="url(#sc-avatar-skin)" />
      <rect x="860" y="810" width="45" height="22" rx="11" transform="rotate(30 860 810)" fill="url(#sc-avatar-skin)" />
      <ellipse cx="512" cy="340" rx="135" ry="155" fill="url(#sc-avatar-skin)" />
      <path d="M 370 320 C 350 180, 420 120, 512 120 C 604 120, 674 180, 654 320 Z" fill="#58310c" />
      <circle cx="455" cy="345" r="16" fill="#1e293b" />
      <circle cx="460" cy="340" r="5" fill="#ffffff" />
      <circle cx="569" cy="345" r="16" fill="#1e293b" />
      <circle cx="574" cy="340" r="5" fill="#ffffff" />
      <path d="M 465 410 Q 512 445 559 410" fill="none" stroke="#c2410c" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function EnvironmentTeenCafe({ size = 240 }: { size?: number }): ReactNode {
  return (
    <svg viewBox="0 0 1920 1080" width={size} height={Math.round((size * 9) / 16)} preserveAspectRatio="xMidYMid slice">
      <rect width="1920" height="1080" fill="#f8fafc" />
      <rect x="0" y="0" width="1920" height="720" fill="#cbd5ce" />
      <rect x="180" y="100" width="750" height="520" fill="#bae6fd" />
      <circle cx="300" cy="580" r="140" fill="#86efac" opacity="0.6" />
      <circle cx="480" cy="560" r="180" fill="#4ade80" opacity="0.5" />
      <rect x="180" y="100" width="750" height="520" fill="none" stroke="#334155" strokeWidth="16" />
      <line x1="430" y1="100" x2="430" y2="620" stroke="#334155" strokeWidth="12" />
      <line x1="680" y1="100" x2="680" y2="620" stroke="#334155" strokeWidth="12" />
      <polygon points="0,680 1920,680 1920,1080 0,1080" fill="#c4b898" />
      <polygon points="1060,560 1920,530 1920,950 1060,980" fill="#78350f" />
      <polygon points="1030,550 1920,520 1920,560 1030,590" fill="#f8fafc" />
      <rect x="1260" y="440" width="180" height="120" rx="14" fill="#475569" stroke="#1e293b" strokeWidth="4" />
      <ellipse cx="430" cy="830" rx="230" ry="85" fill="#d97706" />
      <ellipse cx="430" cy="820" rx="226" ry="80" fill="#fde68a" />
      <ellipse cx="420" cy="800" rx="35" ry="14" fill="#ffffff" />
    </svg>
  );
}

export function CharacterSheetLeo({ size = 240 }: { size?: number }): ReactNode {
  return (
    <svg viewBox="0 0 1536 1024" width={size} height={Math.round((size * 2) / 3)} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="sc-leo-floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sc-leo-skin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="sc-leo-shirt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <rect width="1536" height="1024" fill="#eceff1" rx="24" />
      {/* Front */}
      <g transform="translate(768, 100)">
        <ellipse cx="0" cy="720" rx="120" ry="24" fill="url(#sc-leo-floor)" />
        <rect x="-40" y="480" width="34" height="200" rx="14" fill="#94a3b8" />
        <rect x="6" y="480" width="34" height="200" rx="14" fill="#94a3b8" />
        <rect x="-50" y="280" width="100" height="210" rx="24" fill="url(#sc-leo-shirt)" />
        <ellipse cx="0" cy="180" rx="46" ry="52" fill="url(#sc-leo-skin)" />
        <path d="M -46 160 C -48 100, 48 100, 46 160 Z" fill="#78350f" />
        <circle cx="-16" cy="180" r="5" fill="#1e293b" />
        <circle cx="16" cy="180" r="5" fill="#1e293b" />
        <path d="M -10 205 Q 0 215 10 205" fill="none" stroke="#c2410c" strokeWidth="3" strokeLinecap="round" />
        <text y="770" textAnchor="middle" fontFamily="sans-serif" fontSize="24" fontWeight="700" fill="#334155">
          VISTA FRONTAL
        </text>
      </g>
      {/* Profile */}
      <g transform="translate(320, 100)">
        <ellipse cx="0" cy="720" rx="90" ry="22" fill="url(#sc-leo-floor)" />
        <rect x="-15" y="480" width="32" height="200" rx="14" fill="#94a3b8" />
        <rect x="-30" y="280" width="65" height="210" rx="24" fill="url(#sc-leo-shirt)" />
        <circle cx="0" cy="180" r="46" fill="url(#sc-leo-skin)" />
        <path d="M -30 160 C -30 100, 30 110, 38 160 Z" fill="#78350f" />
        <circle cx="20" cy="178" r="4.5" fill="#1e293b" />
        <text y="770" textAnchor="middle" fontFamily="sans-serif" fontSize="24" fontWeight="700" fill="#64748b">
          PERFIL
        </text>
      </g>
      {/* 3/4 */}
      <g transform="translate(1216, 100)">
        <ellipse cx="0" cy="720" rx="100" ry="22" fill="url(#sc-leo-floor)" />
        <rect x="-32" y="480" width="32" height="200" rx="14" fill="#94a3b8" />
        <rect x="6" y="482" width="32" height="198" rx="14" fill="#94a3b8" />
        <rect x="-42" y="280" width="85" height="210" rx="24" fill="url(#sc-leo-shirt)" />
        <ellipse cx="0" cy="180" rx="44" ry="50" fill="url(#sc-leo-skin)" />
        <path d="M -42 160 C -42 100, 42 105, 42 160 Z" fill="#78350f" />
        <circle cx="-10" cy="178" r="4.5" fill="#1e293b" />
        <circle cx="20" cy="178" r="4.5" fill="#1e293b" />
        <text y="770" textAnchor="middle" fontFamily="sans-serif" fontSize="24" fontWeight="700" fill="#64748b">
          VISTA 3/4
        </text>
      </g>
    </svg>
  );
}
