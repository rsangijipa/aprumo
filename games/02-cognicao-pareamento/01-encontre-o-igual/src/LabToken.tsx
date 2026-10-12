import { StimulusArt } from '@aprumo/stimuli';
import { parseToken, type Color, type Shape } from './logic';

/** Cores dos tokens abstratos: médias, distinguíveis, nunca neon. [preenchimento, contorno] */
const INK: Record<Color, [string, string]> = {
  vermelho: ['#d4573f', '#a63f2b'],
  azul: ['#3f7ac3', '#2a5992'],
  amarelo: ['#ebb733', '#b98b18'],
  verde: ['#4c9a5e', '#33724a'],
  roxo: ['#8b64b9', '#664590'],
  rosa: ['#e489ad', '#b95f85'],
};

const star = Array.from({ length: 10 }, (_, k) => {
  const r = k % 2 ? 19 : 44;
  const a = (Math.PI / 5) * k - Math.PI / 2;
  return `${(60 + r * Math.cos(a)).toFixed(1)},${(63 + r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

function ShapePath({ shape, fill, stroke }: { shape: Shape; fill: string; stroke: string }) {
  const p = { fill, stroke, strokeWidth: 5, strokeLinejoin: 'round' as const };
  switch (shape) {
    case 'circulo': return <circle cx="60" cy="60" r="40" {...p} />;
    case 'quadrado': return <rect x="22" y="22" width="76" height="76" rx="14" {...p} />;
    case 'triangulo': return <path d="M60 19 L103 97 L17 97 Z" {...p} strokeWidth={7} />;
    case 'estrela': return <polygon points={star} {...p} />;
    case 'coracao': return <path d="M60 99 C22 74 13 52 25 36 C37 21 54 25 60 40 C66 25 83 21 95 36 C107 52 98 74 60 99 Z" {...p} />;
    case 'losango': return <path d="M60 14 L101 60 L60 106 L19 60 Z" {...p} />;
  }
}

/** Token de cor/forma desenhado pelo jogo (volume suave, sem brilho especular agressivo). */
export function LabToken({ art, label }: { art: string; label: string }) {
  const t = parseToken(art);
  if (!t) return null;
  const [fill, stroke] = INK[t.color];
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" role="img" aria-label={label}>
      <ellipse cx="60" cy="108" rx="34" ry="5" fill="rgb(40 30 20 / .12)" />
      <ShapePath shape={t.shape} fill={fill} stroke={stroke} />
      <ellipse cx="46" cy="44" rx="13" ry="8" fill="#fff" opacity=".28" transform="rotate(-24 46 44)" />
    </svg>
  );
}

/** Estímulo do acervo compartilhado ou token do laboratório. */
export function Stim({ art, label }: { art: string; label: string }) {
  return art.startsWith('lab:') ? <LabToken art={art} label={label} /> : <StimulusArt art={art} label={label} />;
}
