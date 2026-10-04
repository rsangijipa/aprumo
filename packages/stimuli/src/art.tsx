/**
 * Acervo de estímulos Aprumo — ilustrações próprias (licença: proprietária Aprumo).
 * Regras de desenho para estímulos clínicos:
 *  - silhueta clara e prototípica, sem rosto em objetos, sem fundo, sem texto;
 *  - cor realista e contorno da mesma família tonal (não depende só de cor para discriminar);
 *  - viewBox 120×120, objeto centrado ocupando ~80% da área.
 * Fotografias reais entram depois via `media_path` (tabela stimuli).
 */
import type { ReactElement } from 'react';

const S = (children: ReactElement) => children;

export const STIMULUS_ART: Record<string, { label: string; category: string; article: 'o' | 'a'; draw: () => ReactElement }> = {
  bola: {
    article: 'a',
    label: 'bola',
    category: 'brinquedos',
    draw: () => S(
      <g>
        <circle cx="60" cy="60" r="44" fill="#e8574a" stroke="#a8362c" strokeWidth="3" />
        <path d="M16.5 52c18 9 69 9 87 0" fill="none" stroke="#fff" strokeWidth="9" />
        <path d="M17 70c18 9 68 9 86 0" fill="none" stroke="#2f6fb0" strokeWidth="9" />
        <circle cx="60" cy="60" r="44" fill="none" stroke="#a8362c" strokeWidth="3" />
        <ellipse cx="44" cy="34" rx="10" ry="6" fill="#fff" opacity=".35" transform="rotate(-25 44 34)" />
      </g>,
    ),
  },
  carro: {
    article: 'o',
    label: 'carro',
    category: 'veículos',
    draw: () => S(
      <g>
        <path d="M14 74V62c0-5 3-8 8-9l12-2 12-15c2-3 5-4 8-4h22c4 0 7 2 9 5l10 14 9 2c4 1 6 4 6 8v13z" fill="#2f6fb0" stroke="#1f4c7a" strokeWidth="3" strokeLinejoin="round" />
        <path d="M40 51l9-11c1-2 3-2 5-2h10v13zM70 38h8c2 0 3 1 4 2l7 11H70z" fill="#cfe5f7" stroke="#1f4c7a" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="36" cy="77" r="11" fill="#2b2b2b" /><circle cx="36" cy="77" r="4.5" fill="#bbb" />
        <circle cx="88" cy="77" r="11" fill="#2b2b2b" /><circle cx="88" cy="77" r="4.5" fill="#bbb" />
        <rect x="100" y="60" width="6" height="5" rx="1.5" fill="#f6d36b" />
      </g>,
    ),
  },
  maca_softclay: {
    article: 'a',
    label: 'maçã (soft clay)',
    category: 'alimentos',
    draw: () => S(
      <g transform="scale(0.117) translate(-50, -40)">
        <ellipse cx="512" cy="880" rx="320" ry="55" fill="#000000" opacity="0.18" />
        <path d="M 512 290 C 510 220, 545 160, 580 130 C 590 120, 605 130, 595 145 C 565 180, 538 230, 532 295 Z" fill="#543719" />
        <path d="M 512 300 C 420 230, 240 250, 180 390 C 110 550, 190 780, 370 850 C 440 878, 485 860, 512 840 C 539 860, 584 878, 654 850 C 834 780, 914 550, 844 390 C 784 250, 604 230, 512 300 Z" fill="#c91a1a" />
        <ellipse cx="360" cy="420" rx="140" ry="110" transform="rotate(-30 360 420)" fill="#ffffff" opacity="0.35" />
      </g>,
    ),
  },
  carro_softclay: {
    article: 'o',
    label: 'carro (soft clay)',
    category: 'veículos',
    draw: () => S(
      <g transform="scale(0.117) translate(-50, -50)">
        <ellipse cx="512" cy="790" rx="390" ry="70" fill="#000000" opacity="0.18" />
        <path d="M 170 650 C 160 580, 200 520, 260 520 C 310 520, 360 480, 410 380 C 450 300, 520 280, 620 290 C 720 300, 770 380, 810 490 C 870 510, 910 560, 900 640 C 890 710, 840 730, 780 730 C 740 730, 700 700, 670 700 C 620 700, 580 730, 480 730 C 420 730, 380 700, 340 700 C 280 700, 220 730, 180 720 C 165 710, 165 670, 170 650 Z" fill="#2563eb" />
        <path d="M 430 380 C 460 320, 510 310, 580 320 L 580 470 C 510 470, 450 460, 400 450 C 410 420, 420 400, 430 380 Z" fill="#e0f2fe" />
        <ellipse cx="320" cy="740" rx="75" ry="105" fill="#1e293b" />
        <ellipse cx="780" cy="725" rx="75" ry="105" fill="#1e293b" />
      </g>,
    ),
  },
  maca: {
    article: 'a',
    label: 'maçã',
    category: 'alimentos',
    draw: () => S(
      <g>
        <path d="M60 34c-8-6-30-8-38 10-9 20 4 50 19 56 7 3 12 0 19-2 7 2 12 5 19 2 15-6 28-36 19-56-8-18-30-16-38-10z" fill="#d93b3b" stroke="#982424" strokeWidth="3" strokeLinejoin="round" />
        <path d="M60 34c0-8 2-14 6-19" fill="none" stroke="#6b4a2b" strokeWidth="4" strokeLinecap="round" />
        <path d="M64 24c8-8 18-8 22-6-3 8-12 12-22 6z" fill="#5a9a4a" stroke="#3c6e30" strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="38" cy="50" rx="6" ry="10" fill="#fff" opacity=".3" transform="rotate(20 38 50)" />
      </g>,
    ),
  },
  banana: {
    article: 'a',
    label: 'banana',
    category: 'alimentos',
    draw: () => S(
      <g>
        <path d="M24 30c-4 30 12 58 44 64 14 3 26 0 32-6-4-2-10-2-16-3C56 80 38 58 34 32z" fill="#f2cd3c" stroke="#b08a14" strokeWidth="3" strokeLinejoin="round" />
        <path d="M34 32c4 26 22 48 50 53" fill="none" stroke="#d9ac1e" strokeWidth="3" />
        <path d="M22 31l2-10 10 2-1 9z" fill="#6b4a2b" stroke="#4a321c" strokeWidth="2" strokeLinejoin="round" />
        <path d="M100 88l5 3-2 4-5-2z" fill="#4a321c" />
      </g>,
    ),
  },
  copo: {
    article: 'o',
    label: 'copo',
    category: 'casa',
    draw: () => S(
      <g>
        <path d="M32 22h56l-7 78c0 3-3 6-6 6H45c-3 0-6-3-6-6z" fill="#e7f2f6" stroke="#5f8fa3" strokeWidth="3" strokeLinejoin="round" />
        <path d="M36 52h48l-4 46c0 2-2 4-4 4H44c-2 0-4-2-4-4z" fill="#7fc1de" opacity=".85" />
        <path d="M32 22h56" stroke="#5f8fa3" strokeWidth="3" strokeLinecap="round" />
        <path d="M44 30l3 64" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      </g>,
    ),
  },
  sapato: {
    article: 'o',
    label: 'sapato',
    category: 'roupas',
    draw: () => S(
      <g>
        <path d="M14 82V58c0-4 3-6 6-6h8c6 0 10 4 16 8l18 10c8 4 20 6 32 7 8 1 12 5 12 10v3H14z" fill="#3f7fbf" stroke="#25537f" strokeWidth="3" strokeLinejoin="round" />
        <path d="M14 82h92v8c0 2-2 4-4 4H18c-2 0-4-2-4-4z" fill="#f4f4f2" stroke="#9a9a96" strokeWidth="2.5" />
        <path d="M44 62l-6 8M54 67l-6 8M64 72l-5 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      </g>,
    ),
  },
  cachorro: {
    article: 'o',
    label: 'cachorro',
    category: 'animais',
    draw: () => S(
      <g>
        <path d="M28 70c0-14 10-22 26-22h22c12 0 18 8 18 20v18c0 3-2 5-5 5H33c-3 0-5-2-5-5z" fill="#c98f55" stroke="#8a5a2b" strokeWidth="3" strokeLinejoin="round" />
        <path d="M32 91v12M48 91v12M70 91v12M86 91v12" stroke="#8a5a2b" strokeWidth="7" strokeLinecap="round" />
        <path d="M28 70c-8-2-12-8-12-14" fill="none" stroke="#8a5a2b" strokeWidth="5" strokeLinecap="round" />
        <circle cx="86" cy="42" r="18" fill="#c98f55" stroke="#8a5a2b" strokeWidth="3" />
        <path d="M74 30c-6 4-8 14-4 22l6-4c-2-6-1-12 2-16z" fill="#7a4e24" />
        <ellipse cx="102" cy="46" rx="7" ry="6" fill="#d9a873" stroke="#8a5a2b" strokeWidth="2" />
        <circle cx="106" cy="44" r="2.6" fill="#2b2b2b" />
        <circle cx="90" cy="38" r="2.6" fill="#2b2b2b" />
      </g>,
    ),
  },
  gato: {
    article: 'o',
    label: 'gato',
    category: 'animais',
    draw: () => S(
      <g>
        <path d="M30 104c-4-24 4-44 24-48h12c18 2 26 22 22 48z" fill="#8f8f96" stroke="#5c5c63" strokeWidth="3" strokeLinejoin="round" />
        <path d="M88 96c14-2 20-12 16-24" fill="none" stroke="#5c5c63" strokeWidth="6" strokeLinecap="round" />
        <path d="M38 34l4-20 14 14h8l14-14 4 20c3 6 3 14-2 20-5 6-13 9-20 9s-15-3-20-9c-5-6-5-14-2-20z" fill="#8f8f96" stroke="#5c5c63" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="51" cy="40" r="3" fill="#2b2b2b" /><circle cx="69" cy="40" r="3" fill="#2b2b2b" />
        <path d="M57 48h6l-3 3z" fill="#d97a8a" />
        <path d="M44 50l-12-2M44 53l-12 3M76 50l12-2M76 53l12 3" stroke="#5c5c63" strokeWidth="1.5" strokeLinecap="round" />
      </g>,
    ),
  },
  livro: {
    article: 'o',
    label: 'livro',
    category: 'escola',
    draw: () => S(
      <g>
        <path d="M60 30c-12-8-28-10-44-8v68c16-2 32 0 44 8 12-8 28-10 44-8V22c-16-2-32 0-44 8z" fill="#f7f3ea" stroke="#9a8d70" strokeWidth="3" strokeLinejoin="round" />
        <path d="M60 30v68" stroke="#9a8d70" strokeWidth="3" />
        <path d="M14 26v70c18-3 34-1 46 6 12-7 28-9 46-6V26" fill="none" stroke="#c0503f" strokeWidth="5" strokeLinejoin="round" />
        <path d="M26 42h24M26 52h24M26 62h20M70 42h24M70 52h24M70 62h18" stroke="#c8bfa9" strokeWidth="3" strokeLinecap="round" />
      </g>,
    ),
  },
  colher: {
    article: 'a',
    label: 'colher',
    category: 'casa',
    draw: () => S(
      <g transform="rotate(-35 60 60)">
        <ellipse cx="60" cy="30" rx="16" ry="22" fill="#d8dde0" stroke="#7d878d" strokeWidth="3" />
        <ellipse cx="55" cy="25" rx="5" ry="9" fill="#fff" opacity=".6" />
        <path d="M56 50h8l-1 54c0 3-6 3-6 0z" fill="#d8dde0" stroke="#7d878d" strokeWidth="3" strokeLinejoin="round" />
      </g>,
    ),
  },
  peixe: {
    article: 'o',
    label: 'peixe',
    category: 'animais',
    draw: () => S(
      <g>
        <path d="M20 60c14-22 44-28 66-10l20-14v48L86 70C64 88 34 82 20 60z" fill="#f29a3a" stroke="#b5641a" strokeWidth="3" strokeLinejoin="round" />
        <path d="M54 44c4 10 4 22 0 32" fill="none" stroke="#b5641a" strokeWidth="2.5" />
        <circle cx="36" cy="56" r="4" fill="#2b2b2b" />
        <path d="M58 40l10-12 8 14" fill="#f6b86d" stroke="#b5641a" strokeWidth="2.5" strokeLinejoin="round" />
      </g>,
    ),
  },
  flor: {
    article: 'a',
    label: 'flor',
    category: 'natureza',
    draw: () => S(
      <g>
        <path d="M60 64v44" stroke="#4f8a3e" strokeWidth="5" strokeLinecap="round" />
        <path d="M60 92c-10-14-26-12-30-6 8 6 20 8 30 6zM60 84c10-12 24-10 28-4-8 6-18 7-28 4z" fill="#6aa857" stroke="#3c6e30" strokeWidth="2" strokeLinejoin="round" />
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="60" cy="24" rx="12" ry="18" fill="#e886b0" stroke="#b0517b" strokeWidth="2.5" transform={`rotate(${a} 60 44)`} />
        ))}
        <circle cx="60" cy="44" r="11" fill="#f5c84a" stroke="#b08a14" strokeWidth="2.5" />
      </g>,
    ),
  },
  casa: {
    article: 'a',
    label: 'casa',
    category: 'lugares',
    draw: () => S(
      <g>
        <path d="M24 56v46h72V56" fill="#f1e2c6" stroke="#9a7b4f" strokeWidth="3" strokeLinejoin="round" />
        <path d="M14 60 60 20l46 40" fill="#c0503f" stroke="#86352a" strokeWidth="3" strokeLinejoin="round" />
        <path d="M14 60 60 20l46 40H14z" fill="#c0503f" />
        <rect x="50" y="72" width="20" height="30" rx="2" fill="#7a5532" stroke="#4a321c" strokeWidth="2.5" />
        <rect x="32" y="66" width="13" height="13" fill="#bfe0f2" stroke="#5f8fa3" strokeWidth="2.5" />
        <rect x="75" y="66" width="13" height="13" fill="#bfe0f2" stroke="#5f8fa3" strokeWidth="2.5" />
      </g>,
    ),
  },
  aviao: {
    article: 'o',
    label: 'avião',
    category: 'veículos',
    draw: () => S(
      <g transform="rotate(-20 60 60)">
        <path d="M14 58c0-4 4-6 8-6h70c8 0 16 3 16 8s-8 8-16 8H22c-4 0-8-2-8-6z" fill="#eef1f4" stroke="#6b7a88" strokeWidth="3" />
        <path d="M54 54 38 22h12l26 32zM54 66 38 98h12l26-32z" fill="#2f6fb0" stroke="#1f4c7a" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M20 54 14 36h8l12 18z" fill="#2f6fb0" stroke="#1f4c7a" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M84 55h12" stroke="#7fb3d8" strokeWidth="4" strokeLinecap="round" />
      </g>,
    ),
  },
  escova: {
    article: 'a',
    label: 'escova de dentes',
    category: 'higiene',
    draw: () => S(
      <g transform="rotate(-30 60 60)">
        <rect x="10" y="54" width="70" height="12" rx="6" fill="#4fb3a9" stroke="#2c7a72" strokeWidth="3" />
        <rect x="78" y="54" width="32" height="12" rx="3" fill="#4fb3a9" stroke="#2c7a72" strokeWidth="3" />
        {[82, 88, 94, 100, 106].map((x) => (
          <rect key={x} x={x - 1.5} y="38" width="4" height="16" rx="2" fill="#f4f8fb" stroke="#9fb4c3" strokeWidth="1.2" />
        ))}
      </g>,
    ),
  },
  camisa: {
    article: 'a',
    label: 'camiseta',
    category: 'roupas',
    draw: () => S(
      <g>
        <path d="M44 18 22 28 8 52l16 8 8-12v58h56V48l8 12 16-8-14-24-22-10c-2 8-8 12-16 12s-14-4-16-12z" fill="#5aa070" stroke="#367048" strokeWidth="3" strokeLinejoin="round" />
        <path d="M44 18c2 8 8 12 16 12s14-4 16-12" fill="none" stroke="#367048" strokeWidth="3" />
      </g>,
    ),
  },
  uva: {
    article: 'a',
    label: 'uva',
    category: 'alimentos',
    draw: () => S(
      <g>
        <path d="M60 28V16" stroke="#6b4a2b" strokeWidth="4" strokeLinecap="round" />
        <path d="M62 22c8-8 18-6 22-2-6 6-14 6-22 2z" fill="#6aa857" stroke="#3c6e30" strokeWidth="2" strokeLinejoin="round" />
        {[
          [44, 38], [60, 36], [76, 38], [36, 54], [52, 52], [68, 52], [84, 54],
          [44, 68], [60, 68], [76, 68], [52, 84], [68, 84], [60, 98],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="9.5" fill="#7a4fa3" stroke="#4e2f6e" strokeWidth="2" />
        ))}
      </g>,
    ),
  },
};

export type StimulusKey = keyof typeof STIMULUS_ART;
export const STIMULUS_KEYS = Object.keys(STIMULUS_ART) as StimulusKey[];

/** Renderiza o estímulo. `label` vira o nome acessível (a criança pode usar leitor de tela/AAC). */
export function StimulusArt({ art, label, size = '100%' }: { art: string; label?: string; size?: number | string }) {
  const entry = STIMULUS_ART[art];
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={label ?? entry?.label ?? art}>
      {entry ? entry.draw() : <rect x="10" y="10" width="100" height="100" rx="12" fill="#ddd" />}
    </svg>
  );
}

/** Instrução falada com contração correta: "Toque na bola", "Toque no carro". */
export function instructionFor(art: string, label: string, verb = 'Toque'): string {
  const article = STIMULUS_ART[art]?.article ?? 'o';
  return `${verb} ${article === 'a' ? 'na' : 'no'} ${label}`;
}
