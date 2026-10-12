/**
 * Detetive das Emoções — rostos paramétricos: cada emoção vira sobrancelha + olhos + boca + detalhe.
 * O mesmo desenho aparece no caso (personagem) e nas alternativas, então a criança aprende a LER
 * as partes do rosto (pista facial), não a decorar um emoji.
 */
import type { ReactElement } from 'react';

export type EmotionId =
  | 'feliz'
  | 'triste'
  | 'bravo'
  | 'medo'
  | 'surpresa'
  | 'ansioso'
  | 'orgulhoso'
  | 'frustrado'
  | 'entediado'
  | 'envergonhado'
  | 'aliviado'
  | 'decepcionado'
  | 'animado';

type Brow = 'neutral' | 'up' | 'down' | 'raised';
type Eyes = 'open' | 'wide' | 'happy' | 'down' | 'closed' | 'side' | 'half';
type Mouth = 'smile' | 'grin' | 'frown' | 'flat' | 'o' | 'wavy' | 'small' | 'tight';
type Extra = 'tear' | 'sweat' | 'blush' | 'steam' | 'sparkle';

export const FACE: Record<EmotionId, { brow: Brow; eyes: Eyes; mouth: Mouth; extra?: Extra[]; tilt?: number }> = {
  feliz: { brow: 'neutral', eyes: 'happy', mouth: 'grin' },
  triste: { brow: 'up', eyes: 'down', mouth: 'frown', extra: ['tear'], tilt: 4 },
  bravo: { brow: 'down', eyes: 'open', mouth: 'tight', extra: ['steam'] },
  medo: { brow: 'up', eyes: 'wide', mouth: 'wavy', extra: ['sweat'] },
  surpresa: { brow: 'raised', eyes: 'wide', mouth: 'o' },
  ansioso: { brow: 'up', eyes: 'open', mouth: 'wavy', extra: ['sweat'] },
  orgulhoso: { brow: 'neutral', eyes: 'happy', mouth: 'small', extra: ['sparkle'], tilt: -6 },
  frustrado: { brow: 'down', eyes: 'down', mouth: 'flat' },
  entediado: { brow: 'neutral', eyes: 'half', mouth: 'flat', tilt: 8 },
  envergonhado: { brow: 'up', eyes: 'side', mouth: 'small', extra: ['blush'] },
  aliviado: { brow: 'neutral', eyes: 'closed', mouth: 'smile', extra: ['sweat'] },
  decepcionado: { brow: 'up', eyes: 'down', mouth: 'flat' },
  animado: { brow: 'raised', eyes: 'happy', mouth: 'grin', extra: ['sparkle'] },
};

export interface Look {
  skin: string;
  hair: string;
  style: 'short' | 'curly' | 'long' | 'puffs';
}

const INK = '#2a2230';

function brows(b: Brow): ReactElement {
  const d: Record<Brow, string> = {
    neutral: 'M30 33q8-4 15 0M55 33q7-4 15 0',
    up: 'M30 34q8-2 15-7M55 27q7 5 15 7',
    down: 'M30 28q8 3 15 8M55 36q7-5 15-8',
    raised: 'M30 25q8-6 15-1M55 24q7-5 15 1',
  };
  return <path d={d[b]} stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />;
}

function eyes(e: Eyes): ReactElement {
  switch (e) {
    case 'happy':
      return <path d="M32 46q6-7 12 0M56 46q6-7 12 0" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />;
    case 'closed':
      return <path d="M32 45q6 5 12 0M56 45q6 5 12 0" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />;
    case 'wide':
      return (
        <g>
          <circle cx="38" cy="44" r="7" fill="#fff" stroke={INK} strokeWidth="2.5" />
          <circle cx="62" cy="44" r="7" fill="#fff" stroke={INK} strokeWidth="2.5" />
          <circle cx="38" cy="44" r="3" fill={INK} />
          <circle cx="62" cy="44" r="3" fill={INK} />
        </g>
      );
    case 'down':
      return (
        <g fill={INK}>
          <ellipse cx="38" cy="48" rx="4" ry="2.6" />
          <ellipse cx="62" cy="48" rx="4" ry="2.6" />
        </g>
      );
    case 'side':
      return (
        <g fill={INK}>
          <ellipse cx="35" cy="47" rx="3.6" ry="4" />
          <ellipse cx="59" cy="47" rx="3.6" ry="4" />
        </g>
      );
    case 'half':
      return (
        <g>
          <path d="M32 45h12M56 45h12" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="38" cy="47.5" rx="3.6" ry="2" fill={INK} />
          <ellipse cx="62" cy="47.5" rx="3.6" ry="2" fill={INK} />
        </g>
      );
    default:
      return (
        <g fill={INK}>
          <circle cx="38" cy="45" r="4.2" />
          <circle cx="62" cy="45" r="4.2" />
          <circle cx="39.4" cy="43.6" r="1.4" fill="#fff" />
          <circle cx="63.4" cy="43.6" r="1.4" fill="#fff" />
        </g>
      );
  }
}

function mouth(m: Mouth): ReactElement {
  const s = { stroke: INK, strokeWidth: 3.5, strokeLinecap: 'round' as const, fill: 'none' };
  switch (m) {
    case 'grin':
      return <path d="M36 62q14 16 28 0z" fill="#7a2e3a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />;
    case 'smile':
      return <path d="M38 63q12 9 24 0" {...s} />;
    case 'small':
      return <path d="M43 64q7 5 14 0" {...s} />;
    case 'frown':
      return <path d="M38 69q12-9 24 0" {...s} />;
    case 'flat':
      return <path d="M40 66h20" {...s} />;
    case 'o':
      return <ellipse cx="50" cy="66" rx="6" ry="8" fill="#7a2e3a" stroke={INK} strokeWidth="3" />;
    case 'tight':
      return <path d="M38 67q6-4 12 0t12 0" {...s} />;
    case 'wavy':
      return <path d="M37 66q4-4 8 0t8 0 8 0" {...s} />;
  }
}

function extras(list: Extra[] = []): ReactElement[] {
  return list.map((x) => {
    if (x === 'tear') return <path key={x} d="M64 52c-3 5-4 8 0 10 4-2 3-5 0-10z" fill="#5ab4f0" stroke="#1f4c7a" strokeWidth="1.5" />;
    if (x === 'sweat') return <path key={x} d="M80 26c-3 5-4 8 0 10 4-2 3-5 0-10z" fill="#9fd8ff" stroke="#1f4c7a" strokeWidth="1.5" />;
    if (x === 'blush')
      return (
        <g key={x} fill="#f27a8a" opacity=".55">
          <ellipse cx="28" cy="56" rx="7" ry="4" />
          <ellipse cx="72" cy="56" rx="7" ry="4" />
        </g>
      );
    if (x === 'steam') return <path key={x} d="M14 16q4-6 0-10M86 16q-4-6 0-10M20 22q6-4 4-10M80 22q-6-4-4-10" stroke="#e5483c" strokeWidth="3" strokeLinecap="round" fill="none" />;
    return <path key={x} d="M84 14l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffd54a" stroke={INK} strokeWidth="1" />;
  });
}

function hair(look: Look): ReactElement {
  const h = look.hair;
  switch (look.style) {
    case 'curly':
      return (
        <g fill={h}>
          {[20, 32, 44, 56, 68, 80].map((x) => (
            <circle key={x} cx={x} cy={x === 20 || x === 80 ? 32 : 20} r="11" />
          ))}
        </g>
      );
    case 'long':
      return <path d="M14 76V40c0-22 16-32 36-32s36 10 36 32v36l-10-6V38c-8-10-44-10-52 0v32z" fill={h} />;
    case 'puffs':
      return (
        <g fill={h}>
          <circle cx="16" cy="26" r="12" />
          <circle cx="84" cy="26" r="12" />
          <path d="M18 36c0-20 14-28 32-28s32 8 32 28c-10-10-20-12-32-12s-22 2-32 12z" />
        </g>
      );
    default:
      return <path d="M18 38c0-20 14-30 32-30s32 10 32 30c-8-8-20-12-32-12s-24 4-32 12z" fill={h} />;
  }
}

export function Face({ emotion, look, label }: { emotion: EmotionId; look?: Look; label?: string }) {
  const f = FACE[emotion];
  const lk = look ?? { skin: '#f6d2b0', hair: '#5b3a29', style: 'short' as const };
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <g transform={`rotate(${f.tilt ?? 0} 50 55)`}>
        {lk.style === 'long' && hair(lk)}
        <circle cx="50" cy="52" r="34" fill={lk.skin} stroke={INK} strokeWidth="3" />
        {lk.style !== 'long' && hair(lk)}
        {brows(f.brow)}
        {eyes(f.eyes)}
        {mouth(f.mouth)}
        {extras(f.extra)}
      </g>
    </svg>
  );
}

export function DetectiveBadge() {
  return (
    <svg viewBox="0 0 100 100" width="48" height="48" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="var(--det-accent)" />
      <polygon points="50,16 60,38 84,38 64,52 72,76 50,62 28,76 36,52 16,38 40,38" fill="#faf9f6" />
      <circle cx="50" cy="50" r="13" fill="none" stroke="var(--det-ink)" strokeWidth="4" />
      <path d="M59 59l9 9" stroke="var(--det-ink)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function MagnifyingGlass() {
  return (
    <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
      <circle cx="26" cy="26" r="17" fill="rgb(255 255 255 / 0.4)" stroke="currentColor" strokeWidth="6" />
      <line x1="39" y1="39" x2="57" y2="57" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

/** Ícones das pistas (rosto, cena, fala, pensamento). */
export function ClueIcon({ type }: { type: 'face' | 'context' | 'speech' | 'belief' }) {
  const s = { stroke: 'currentColor', strokeWidth: 4, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true">
      {type === 'face' && (
        <g {...s}>
          <circle cx="24" cy="24" r="18" />
          <path d="M17 20h2M29 20h2M17 30q7 6 14 0" />
        </g>
      )}
      {type === 'context' && (
        <g {...s}>
          <path d="M6 40 18 22l8 10 6-8 10 16z" />
          <circle cx="34" cy="12" r="4" />
        </g>
      )}
      {type === 'speech' && (
        <g {...s}>
          <path d="M8 10h32v20H22l-8 8v-8H8z" />
        </g>
      )}
      {type === 'belief' && (
        <g {...s}>
          <path d="M14 30a10 10 0 1 1 6-18 10 10 0 0 1 16 4 8 8 0 0 1-2 14z" />
          <circle cx="12" cy="38" r="3" />
          <circle cx="6" cy="44" r="2" />
        </g>
      )}
    </svg>
  );
}
