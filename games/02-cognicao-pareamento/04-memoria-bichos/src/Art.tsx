/**
 * Bichos da Memória — ilustrações próprias (viewBox 100×100), traço grosso e silhueta distinta:
 * cada bicho tem forma E cor diferentes (discriminável sem depender só de cor).
 */
import type { ReactElement } from 'react';

const INK = '#3a2e2a';
const eye = (cx: number, cy: number, r = 4) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={INK} />
    <circle cx={cx + r * 0.35} cy={cy - r * 0.35} r={r * 0.35} fill="#fff" />
  </g>
);
const cheek = (cx: number, cy: number) => <ellipse cx={cx} cy={cy} rx="5" ry="3" fill="#f39a9a" opacity=".55" />;

export const ANIMALS: Record<string, { label: string; article: 'o' | 'a'; draw: () => ReactElement }> = {
  cachorro: {
    label: 'cachorro',
    article: 'o',
    draw: () => (
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path d="M22 30c-8 4-10 22-4 30 4 4 10 0 10-6z" fill="#8a5a3c" />
        <path d="M78 30c8 4 10 22 4 30-4 4-10 0-10-6z" fill="#8a5a3c" />
        <ellipse cx="50" cy="50" rx="27" ry="26" fill="#d9a066" />
        <ellipse cx="50" cy="62" rx="15" ry="11" fill="#f3d3a8" />
        <ellipse cx="50" cy="56" rx="6" ry="4.5" fill={INK} />
        <path d="M50 61v5m-6 1c3 3 9 3 12 0" fill="none" strokeLinecap="round" />
        {eye(40, 44)}
        {eye(60, 44)}
      </g>
    ),
  },
  gato: {
    label: 'gato',
    article: 'o',
    draw: () => (
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path d="M26 40 22 14l20 14zM74 40l4-26-20 14z" fill="#9aa3ad" />
        <path d="M27 34 26 21l9 8zM73 34l1-13-9 8z" fill="#f2b8c6" stroke="none" />
        <ellipse cx="50" cy="54" rx="28" ry="25" fill="#b8c0c8" />
        {eye(40, 50)}
        {eye(60, 50)}
        <path d="M47 60h6l-3 3z" fill="#e88aa0" />
        <path d="M50 63c-2 4-7 4-8 1m8-1c2 4 7 4 8 1" fill="none" strokeLinecap="round" />
        <path d="M22 58h-12M22 63l-11 3M78 58h12M78 63l11 3" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  peixe: {
    label: 'peixe',
    article: 'o',
    draw: () => (
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path d="M74 50 92 34v32z" fill="#f08a3c" />
        <ellipse cx="46" cy="50" rx="32" ry="22" fill="#f5a64a" />
        <path d="M40 30c8-10 20-8 24 2z" fill="#f08a3c" />
        <path d="M34 40c6 6 6 14 0 20" fill="none" />
        <path d="M50 42c4 4 4 12 0 16M60 44c3 3 3 9 0 12" fill="none" strokeWidth="2" opacity=".6" />
        {eye(24, 46, 5)}
        <path d="M16 56c3 2 6 2 8 0" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  passaro: {
    label: 'passarinho',
    article: 'o',
    draw: () => (
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path d="M70 66 90 74 76 58z" fill="#3f86c7" />
        <circle cx="50" cy="52" r="28" fill="#5aa9e6" />
        <ellipse cx="54" cy="62" rx="16" ry="12" fill="#cfe8fb" />
        <path d="M40 54c10 2 18 10 18 20-12 0-20-8-18-20z" fill="#3f86c7" />
        <path d="M22 46 8 50l14 6z" fill="#f6c143" />
        {eye(34, 44)}
        <path d="M46 26c2-8 8-10 12-8-4 2-6 6-6 10" fill="#3f86c7" />
      </g>
    ),
  },
  coelho: {
    label: 'coelho',
    article: 'o',
    draw: () => (
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <ellipse cx="38" cy="24" rx="8" ry="20" fill="#f4f1ec" />
        <ellipse cx="62" cy="24" rx="8" ry="20" fill="#f4f1ec" />
        <ellipse cx="38" cy="25" rx="3.5" ry="13" fill="#f2b8c6" stroke="none" />
        <ellipse cx="62" cy="25" rx="3.5" ry="13" fill="#f2b8c6" stroke="none" />
        <ellipse cx="50" cy="60" rx="26" ry="24" fill="#f4f1ec" />
        {eye(41, 56)}
        {eye(59, 56)}
        <path d="M47 64h6l-3 3z" fill="#e88aa0" />
        <path d="M50 67v4m-4 0h8" fill="none" strokeLinecap="round" strokeWidth="2.5" />
        {cheek(34, 66)}
        {cheek(66, 66)}
      </g>
    ),
  },
  sapo: {
    label: 'sapo',
    article: 'o',
    draw: () => (
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <circle cx="33" cy="32" r="12" fill="#6cc04a" />
        <circle cx="67" cy="32" r="12" fill="#6cc04a" />
        <ellipse cx="50" cy="58" rx="34" ry="24" fill="#7fd05a" />
        <circle cx="33" cy="32" r="6" fill="#fff" stroke="none" />
        <circle cx="67" cy="32" r="6" fill="#fff" stroke="none" />
        {eye(33, 33, 3.6)}
        {eye(67, 33, 3.6)}
        <path d="M30 62c10 10 30 10 40 0" fill="none" strokeLinecap="round" />
        {cheek(26, 58)}
        {cheek(74, 58)}
      </g>
    ),
  },
  tartaruga: {
    label: 'tartaruga',
    article: 'a',
    draw: () => (
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <ellipse cx="24" cy="74" rx="8" ry="6" fill="#9ccf6e" />
        <ellipse cx="70" cy="76" rx="8" ry="6" fill="#9ccf6e" />
        <circle cx="84" cy="52" r="11" fill="#9ccf6e" />
        {eye(87, 49, 3)}
        <path d="M14 70c0-26 18-40 36-40s34 14 34 40z" fill="#5f9e45" />
        <path d="M30 70V54l10-10h20l10 10v16M40 44v26M60 44v26M30 56h40" fill="none" strokeWidth="2.5" />
        <path d="M14 70h70" />
      </g>
    ),
  },
  joaninha: {
    label: 'joaninha',
    article: 'a',
    draw: () => (
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path d="M40 22c-4-8-10-10-14-8M60 22c4-8 10-10 14-8" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="30" r="12" fill="#2b2b2b" />
        <circle cx="50" cy="60" r="30" fill="#e5483c" />
        <path d="M50 30v60" />
        {[[38, 50], [62, 50], [34, 70], [66, 70], [50, 80]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" fill="#2b2b2b" stroke="none" />
        ))}
        <circle cx="45" cy="28" r="2.5" fill="#fff" stroke="none" />
        <circle cx="55" cy="28" r="2.5" fill="#fff" stroke="none" />
      </g>
    ),
  },
  vaca: {
    label: 'vaca',
    article: 'a',
    draw: () => (
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path d="M26 30c-6-6-6-14 0-16M74 30c6-6 6-14 0-16" fill="none" stroke="#c9b27a" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="18" cy="40" rx="10" ry="6" fill="#fff" transform="rotate(-20 18 40)" />
        <ellipse cx="82" cy="40" rx="10" ry="6" fill="#fff" transform="rotate(20 82 40)" />
        <ellipse cx="50" cy="48" rx="28" ry="26" fill="#fff" />
        <path d="M30 32c6 0 10 6 8 12-6 2-12-2-12-8z" fill="#2b2b2b" stroke="none" />
        <ellipse cx="50" cy="70" rx="22" ry="14" fill="#f4b6c2" />
        <ellipse cx="42" cy="70" rx="3" ry="4" fill={INK} stroke="none" />
        <ellipse cx="58" cy="70" rx="3" ry="4" fill={INK} stroke="none" />
        {eye(40, 46)}
        {eye(60, 46)}
      </g>
    ),
  },
  porco: {
    label: 'porquinho',
    article: 'o',
    draw: () => (
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path d="M26 34 22 16l16 10zM74 34l4-18-16 10z" fill="#f29bb0" />
        <circle cx="50" cy="54" r="30" fill="#f7b4c4" />
        <ellipse cx="50" cy="62" rx="14" ry="10" fill="#f29bb0" />
        <ellipse cx="45" cy="62" rx="2.6" ry="4" fill={INK} stroke="none" />
        <ellipse cx="55" cy="62" rx="2.6" ry="4" fill={INK} stroke="none" />
        {eye(38, 46)}
        {eye(62, 46)}
      </g>
    ),
  },
  pato: {
    label: 'patinho',
    article: 'o',
    draw: () => (
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <ellipse cx="54" cy="68" rx="30" ry="18" fill="#ffd84d" />
        <path d="M70 60c10-4 16 0 16 6-8 2-14 0-16-6z" fill="#f2c230" />
        <circle cx="38" cy="38" r="18" fill="#ffd84d" />
        <path d="M18 40 4 44l14 6c4 0 6-6 0-10z" fill="#f28c28" />
        {eye(36, 34)}
        {cheek(44, 44)}
      </g>
    ),
  },
  leao: {
    label: 'leão',
    article: 'o',
    draw: () => (
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path
          d="M50 10l8 10 12-4 2 12 12 4-6 11 8 9-10 7 4 12-13 0-4 12-13-6-13 6-4-12-13 0 4-12-10-7 8-9-6-11 12-4 2-12 12 4z"
          fill="#d9822b"
        />
        <circle cx="50" cy="52" r="24" fill="#f6c25a" />
        <ellipse cx="50" cy="62" rx="12" ry="9" fill="#fbe2a6" />
        <path d="M46 58h8l-4 4z" fill={INK} />
        <path d="M50 62c-2 4-6 4-7 1m7-1c2 4 6 4 7 1" fill="none" strokeLinecap="round" />
        {eye(41, 48)}
        {eye(59, 48)}
      </g>
    ),
  },
};

export const ANIMAL_KEYS = Object.keys(ANIMALS);

export function AnimalArt({ animal, title }: { animal: string; title?: string }) {
  const a = ANIMALS[animal];
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-label={title ?? a?.label ?? animal}>
      {a ? a.draw() : <circle cx="50" cy="50" r="30" fill="#ccc" />}
    </svg>
  );
}

/** Verso da carta: patinha com padrão próprio (não revela nada do bicho). */
export function CardBack() {
  return (
    <svg viewBox="0 0 100 130" width="100%" height="100%" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="mdb-dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2.4" fill="var(--mdb-back-dot)" />
        </pattern>
      </defs>
      <rect width="100" height="130" fill="url(#mdb-dots)" />
      <g transform="translate(50 66)" fill="var(--mdb-back-paw)">
        <ellipse cx="0" cy="8" rx="15" ry="12" />
        <ellipse cx="-16" cy="-8" rx="6" ry="8" />
        <ellipse cx="-6" cy="-18" rx="6" ry="8" />
        <ellipse cx="6" cy="-18" rx="6" ry="8" />
        <ellipse cx="16" cy="-8" rx="6" ry="8" />
      </g>
    </svg>
  );
}

/** Celeiro onde os pares encontrados vão morar (ilustração do rodapé). */
export function Barn() {
  return (
    <svg viewBox="0 0 120 100" width="100%" height="100%" aria-hidden="true">
      <path d="M10 46 60 10l50 36v50H10z" fill="var(--mdb-barn)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M4 50 60 8l56 42" fill="none" stroke="var(--mdb-barn-roof)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="42" y="56" width="36" height="40" fill="var(--mdb-barn-door)" stroke={INK} strokeWidth="3" />
      <path d="M42 56l36 40M78 56 42 96" stroke="#fff" strokeWidth="3" />
      <circle cx="60" cy="36" r="7" fill="#fff" stroke={INK} strokeWidth="3" />
    </svg>
  );
}
