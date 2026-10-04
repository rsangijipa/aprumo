/**
 * Arte própria do espaço da criança (licença proprietária Aprumo).
 * Avatares: animais simpáticos para crianças; símbolos neutros para adolescentes (sem infantilizar).
 */
import type { ReactElement } from 'react';

const face = (fill: string, ear: ReactElement, extra?: ReactElement) => (
  <g>
    {ear}
    <circle cx="50" cy="54" r="32" fill={fill} />
    {extra}
    <circle cx="39" cy="50" r="4.5" fill="#2b2b2b" />
    <circle cx="61" cy="50" r="4.5" fill="#2b2b2b" />
    <circle cx="40.5" cy="48.5" r="1.4" fill="#fff" />
    <circle cx="62.5" cy="48.5" r="1.4" fill="#2b2b2b" opacity="0" />
    <path d="M42 64q8 7 16 0" fill="none" stroke="#2b2b2b" strokeWidth="3" strokeLinecap="round" />
    <circle cx="31" cy="62" r="4.5" fill="#ff8f8f" opacity=".45" />
    <circle cx="69" cy="62" r="4.5" fill="#ff8f8f" opacity=".45" />
  </g>
);

export const AVATARS: Record<string, { label: string; teen?: boolean; draw: () => ReactElement }> = {
  raposa: { label: 'Raposa', draw: () => face('#f28c38', <g><path d="M22 34 30 10l16 18z" fill="#f28c38" /><path d="M78 34 70 10 54 28z" fill="#f28c38" /></g>, <path d="M34 62q16 18 32 0q-6 14-16 14t-16-14z" fill="#fff4e6" />) },
  gato: { label: 'Gato', draw: () => face('#9aa3b5', <g><path d="M24 36 26 12l18 16z" fill="#9aa3b5" /><path d="M76 36 74 12 56 28z" fill="#9aa3b5" /></g>, <path d="M47 57h6l-3 3z" fill="#e5596b" />) },
  urso: { label: 'Urso', draw: () => face('#b07d4f', <g><circle cx="26" cy="28" r="11" fill="#b07d4f" /><circle cx="74" cy="28" r="11" fill="#b07d4f" /></g>, <ellipse cx="50" cy="63" rx="12" ry="9" fill="#e3c39d" />) },
  coruja: { label: 'Coruja', draw: () => face('#7b6ba8', <g><path d="M26 30 22 14l16 10z" fill="#7b6ba8" /><path d="M74 30 78 14 62 24z" fill="#7b6ba8" /></g>, <g><circle cx="39" cy="50" r="10" fill="#fff" /><circle cx="61" cy="50" r="10" fill="#fff" /><path d="M46 60h8l-4 6z" fill="#f2b84b" /></g>) },
  sapo: { label: 'Sapo', draw: () => face('#6ab04c', <g><circle cx="34" cy="28" r="10" fill="#6ab04c" /><circle cx="66" cy="28" r="10" fill="#6ab04c" /></g>) },
  baleia: { label: 'Baleia', draw: () => face('#4a90d9', <path d="M50 22c-4-8-12-8-14-4 4 0 8 2 10 6M50 22c4-8 12-8 14-4-4 0-8 2-10 6" fill="none" stroke="#9fd0ff" strokeWidth="3" strokeLinecap="round" />) },
  dino: { label: 'Dino', draw: () => face('#4f9a5a', <g><path d="M36 24l6-12 6 12zM46 22l6-12 6 12zM56 24l6-12 6 12z" fill="#f2cc8f" /></g>) },
  // Adolescentes: símbolos, sem rosto infantil.
  onda: { label: 'Onda', teen: true, draw: () => (<g><circle cx="50" cy="50" r="40" fill="#2d3a64" /><path d="M16 58c10-10 18-10 26 0s16 10 26 0 14-8 18-4" fill="none" stroke="#8fb3ff" strokeWidth="7" strokeLinecap="round" /><path d="M22 72c8-6 14-6 20 0s14 6 22 0" fill="none" stroke="#5e7fd6" strokeWidth="5" strokeLinecap="round" /></g>) },
  raio: { label: 'Raio', teen: true, draw: () => (<g><circle cx="50" cy="50" r="40" fill="#3a2f55" /><path d="M56 16 32 54h16l-6 30 26-40H50z" fill="#ffc670" /></g>) },
  montanha: { label: 'Montanha', teen: true, draw: () => (<g><circle cx="50" cy="50" r="40" fill="#24463f" /><path d="M14 74 40 36l12 16 10-12 24 34z" fill="#7cc2a8" /><path d="M40 36l6 8-6 2-5-3z" fill="#fff" /></g>) },
  planeta: { label: 'Planeta', teen: true, draw: () => (<g><circle cx="50" cy="50" r="40" fill="#1f2a44" /><circle cx="50" cy="50" r="18" fill="#e07a5f" /><ellipse cx="50" cy="52" rx="32" ry="9" fill="none" stroke="#f2cc8f" strokeWidth="4" transform="rotate(-18 50 52)" /></g>) },
  nota: { label: 'Música', teen: true, draw: () => (<g><circle cx="50" cy="50" r="40" fill="#3b2a4f" /><path d="M42 66V28l26-6v36" fill="none" stroke="#c9b8ff" strokeWidth="6" strokeLinejoin="round" /><circle cx="36" cy="66" r="8" fill="#c9b8ff" /><circle cx="62" cy="58" r="8" fill="#c9b8ff" /></g>) },
  bola: { label: 'Bola', teen: true, draw: () => (<g><circle cx="50" cy="50" r="40" fill="#1e3d36" /><circle cx="50" cy="50" r="22" fill="#fff" /><path d="m50 38 10 7-4 12H44l-4-12z" fill="#1e3d36" /></g>) },
};

export function Avatar({ id, size = 64 }: { id: string; size?: number }) {
  const a = AVATARS[id] ?? AVATARS.raposa!;
  return <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={a.label}>{a.draw()}</svg>;
}

/* ------------------------------------------------------------ emoções (prancha) */
const emo = (fill: string, mouth: string, brows?: string, extra?: ReactElement) => (
  <g>
    <circle cx="50" cy="50" r="40" fill={fill} stroke="#00000022" strokeWidth="2" />
    {brows && <path d={brows} fill="none" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />}
    <circle cx="37" cy="44" r="5" fill="#2b2b2b" />
    <circle cx="63" cy="44" r="5" fill="#2b2b2b" />
    <path d={mouth} fill="none" stroke="#2b2b2b" strokeWidth="5" strokeLinecap="round" />
    {extra}
  </g>
);

export const FEELINGS: Record<string, { label: string; say: string; draw: () => ReactElement }> = {
  feliz: { label: 'feliz', say: 'Eu estou feliz', draw: () => emo('#ffd166', 'M32 60q18 18 36 0') },
  triste: { label: 'triste', say: 'Eu estou triste', draw: () => emo('#9fc3e8', 'M34 70q16-14 32 0', 'M28 34l14 4M72 34l-14 4', <path d="M64 52q-3 8 0 12q3-4 0-12z" fill="#4a90d9" />) },
  bravo: { label: 'bravo', say: 'Eu estou bravo', draw: () => emo('#f4978e', 'M34 68h32', 'M28 32l14 8M72 32l-14 8') },
  cansado: { label: 'cansado', say: 'Eu estou cansado', draw: () => emo('#cdb4db', 'M38 66q12 6 24 0', undefined, <g><rect x="30" y="42" width="14" height="4" rx="2" fill="#cdb4db" /><rect x="56" y="42" width="14" height="4" rx="2" fill="#cdb4db" /></g>) },
  medo: { label: 'com medo', say: 'Eu estou com medo', draw: () => emo('#b8e0d2', 'M40 68q10-8 20 0', 'M28 36l14-6M72 36l-14-6', <ellipse cx="50" cy="68" rx="8" ry="5" fill="#2b2b2b" />) },
  dor: { label: 'com dor', say: 'Eu estou com dor', draw: () => emo('#f6bd60', 'M34 66l8-4 8 4 8-4 8 4', 'M30 36l12 6M70 36l-12 6') },
};

export function Feeling({ id }: { id: string }) {
  return <svg viewBox="0 0 100 100" aria-hidden="true">{FEELINGS[id]!.draw()}</svg>;
}

/* ------------------------------------------------------------ pedidos (prancha) */
export const NEEDS: Record<string, { label: string; say: string; draw: () => ReactElement }> = {
  agua: { label: 'água', say: 'água', draw: () => (<g><path d="M30 18h40l-6 70H36z" fill="#e7f2f6" stroke="#5f8fa3" strokeWidth="4" strokeLinejoin="round" /><path d="M33 46h34l-4 38H37z" fill="#7fc1de" /></g>) },
  comer: { label: 'comer', say: 'comer', draw: () => (<g><ellipse cx="50" cy="66" rx="36" ry="12" fill="#f4ead6" stroke="#9c8c6a" strokeWidth="3" /><circle cx="50" cy="52" r="16" fill="#d93b3b" /><path d="M50 36v-8" stroke="#6b4a2b" strokeWidth="4" strokeLinecap="round" /></g>) },
  banheiro: { label: 'banheiro', say: 'banheiro', draw: () => (<g><rect x="30" y="20" width="40" height="18" rx="4" fill="#dfe7ee" stroke="#6b7a88" strokeWidth="3" /><path d="M26 46h48c0 18-10 30-24 30S26 64 26 46z" fill="#fff" stroke="#6b7a88" strokeWidth="3" /><path d="M40 76h20v10H40z" fill="#dfe7ee" stroke="#6b7a88" strokeWidth="3" /></g>) },
  ajuda: { label: 'ajuda', say: 'ajuda', draw: () => (<g><path d="M18 60c10-14 22-18 32-12l14 8-8 10-10-4" fill="#f6c9a8" stroke="#b07d55" strokeWidth="3" strokeLinejoin="round" /><path d="M82 60c-10-14-22-18-32-12" fill="none" stroke="#b07d55" strokeWidth="3" /><circle cx="50" cy="26" r="10" fill="#4a90d9" /><path d="M50 20v8M50 32v.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></g>) },
  pausa: { label: 'pausa', say: 'pausa', draw: () => (<g><circle cx="50" cy="50" r="38" fill="#b9d2cf" /><rect x="36" y="32" width="9" height="36" rx="3" fill="#2f524f" /><rect x="55" y="32" width="9" height="36" rx="3" fill="#2f524f" /></g>) },
  mais: { label: 'mais', say: 'mais', draw: () => (<g><circle cx="50" cy="50" r="38" fill="#ffd166" /><path d="M50 30v40M30 50h40" stroke="#7a4e2c" strokeWidth="9" strokeLinecap="round" /></g>) },
  acabou: { label: 'acabou', say: 'acabou', draw: () => (<g><circle cx="50" cy="50" r="38" fill="#f4978e" /><path d="M32 32l36 36M68 32 32 68" stroke="#7a2e2a" strokeWidth="9" strokeLinecap="round" /></g>) },
  brincar: { label: 'brincar', say: 'brincar', draw: () => (<g><rect x="16" y="52" width="26" height="26" rx="4" fill="#e07a5f" /><rect x="44" y="52" width="26" height="26" rx="4" fill="#81b29a" /><rect x="30" y="24" width="26" height="26" rx="4" fill="#f2cc8f" /></g>) },
};

export function Need({ id }: { id: string }) {
  return <svg viewBox="0 0 100 100" aria-hidden="true">{NEEDS[id]!.draw()}</svg>;
}
