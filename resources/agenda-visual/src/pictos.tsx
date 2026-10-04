/**
 * Pictogramas próprios da Agenda Visual (licença proprietária Aprumo).
 * Estilo: formas cheias, contorno escuro, sem texto, uma ação por cartão.
 * Para comunicação aumentativa (pranchas), o padrão será Mulberry (CC BY-SA) via formato Open Board.
 */
import type { ReactElement } from 'react';

export type PictoKey =
  | 'mesa' | 'jogo' | 'brincar' | 'lanche' | 'maos' | 'historia' | 'musica' | 'parque' | 'casa' | 'descanso' | 'bolhas' | 'fichas';

export const PICTOS: Record<PictoKey, { label: string; draw: () => ReactElement }> = {
  mesa: { label: 'Atividade na mesa', draw: () => (<g><rect x="14" y="44" width="72" height="10" rx="3" fill="#b07d4f" stroke="#5c3d22" strokeWidth="3" /><path d="M22 54v28M78 54v28" stroke="#5c3d22" strokeWidth="5" strokeLinecap="round" /><rect x="30" y="28" width="22" height="16" rx="2" fill="#7fc1de" stroke="#2f5d74" strokeWidth="3" /><circle cx="64" cy="37" r="7" fill="#e8574a" stroke="#8e2a22" strokeWidth="3" /></g>) },
  jogo: { label: 'Jogo no tablet', draw: () => (<g><rect x="16" y="22" width="68" height="52" rx="8" fill="#3d405b" /><rect x="22" y="28" width="56" height="40" rx="3" fill="#dfeaf2" /><circle cx="40" cy="48" r="8" fill="#81b29a" /><rect x="52" y="40" width="16" height="16" rx="3" fill="#f2cc8f" /></g>) },
  brincar: { label: 'Brincar', draw: () => (<g><rect x="18" y="56" width="22" height="22" rx="3" fill="#e07a5f" stroke="#8f3f2b" strokeWidth="3" /><rect x="42" y="56" width="22" height="22" rx="3" fill="#81b29a" stroke="#3e6a55" strokeWidth="3" /><rect x="30" y="32" width="22" height="22" rx="3" fill="#f2cc8f" stroke="#a8823c" strokeWidth="3" /><path d="M70 78 82 46" stroke="#3d405b" strokeWidth="4" strokeLinecap="round" /><circle cx="82" cy="40" r="8" fill="#7186d6" stroke="#3d4c8f" strokeWidth="3" /></g>) },
  lanche: { label: 'Lanche', draw: () => (<g><ellipse cx="50" cy="66" rx="34" ry="10" fill="#f4ead6" stroke="#9c8c6a" strokeWidth="3" /><path d="M30 60c2-14 10-20 20-20s18 6 20 20z" fill="#d9a66b" stroke="#8e6232" strokeWidth="3" /><path d="M64 26v18M70 26v18M76 26v18M64 38h12M70 44v20" stroke="#5f6b74" strokeWidth="3" strokeLinecap="round" /></g>) },
  maos: { label: 'Lavar as mãos', draw: () => (<g><path d="M30 20h26v10H42v8" fill="none" stroke="#5f6b74" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><path d="M42 44v6M38 54v4M46 54v4" stroke="#6aa7c9" strokeWidth="4" strokeLinecap="round" /><path d="M24 80c0-12 8-18 18-18s10 6 16 6 10-6 16-6v18z" fill="#f6c9a8" stroke="#b07d55" strokeWidth="3" strokeLinejoin="round" /></g>) },
  historia: { label: 'Hora da história', draw: () => (<g><path d="M50 30c-10-6-22-8-34-6v50c12-2 24 0 34 6 10-6 22-8 34-6V24c-12-2-24 0-34 6z" fill="#fff8ec" stroke="#8a6b47" strokeWidth="3" strokeLinejoin="round" /><path d="M50 30v50" stroke="#8a6b47" strokeWidth="3" /><circle cx="33" cy="48" r="7" fill="#f2cc8f" /><path d="M60 44h16M60 52h16M60 60h12" stroke="#c8b89a" strokeWidth="3" strokeLinecap="round" /></g>) },
  musica: { label: 'Música', draw: () => (<g><path d="M38 70V30l34-8v40" fill="none" stroke="#3d405b" strokeWidth="5" strokeLinejoin="round" /><ellipse cx="30" cy="70" rx="10" ry="8" fill="#3d405b" /><ellipse cx="64" cy="62" rx="10" ry="8" fill="#3d405b" /><path d="M38 40l34-8" stroke="#3d405b" strokeWidth="5" /></g>) },
  parque: { label: 'Parque', draw: () => (<g><path d="M20 80V30h12v50M20 40h30" stroke="#5f6b74" strokeWidth="4" fill="none" /><path d="M32 40 60 80" stroke="#e07a5f" strokeWidth="6" strokeLinecap="round" /><circle cx="72" cy="40" r="14" fill="#81b29a" /><path d="M72 54v26" stroke="#7a5532" strokeWidth="5" /></g>) },
  casa: { label: 'Ir para casa', draw: () => (<g><path d="M20 48 50 22l30 26" fill="none" stroke="#a8462f" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" /><path d="M28 44v36h44V44" fill="#f1e2c6" stroke="#8a6b47" strokeWidth="3" /><rect x="44" y="58" width="12" height="22" rx="2" fill="#7a5532" /></g>) },
  descanso: { label: 'Descanso', draw: () => (<g><path d="M16 66h68v10H16z" fill="#b9d2cf" stroke="#3f6b67" strokeWidth="3" /><rect x="20" y="54" width="24" height="12" rx="6" fill="#fff" stroke="#3f6b67" strokeWidth="3" /><path d="M58 28h12l-12 14h12M72 18h8l-8 9h8" fill="none" stroke="#6a5a98" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></g>) },
  bolhas: { label: 'Bolhas de sabão', draw: () => (<g><circle cx="38" cy="44" r="18" fill="#e2f3fb" stroke="#6aa7c9" strokeWidth="3" /><circle cx="66" cy="58" r="12" fill="#eef8fd" stroke="#6aa7c9" strokeWidth="3" /><circle cx="64" cy="26" r="7" fill="#eef8fd" stroke="#6aa7c9" strokeWidth="2.5" /><path d="M24 80 40 64" stroke="#e07a5f" strokeWidth="5" strokeLinecap="round" /></g>) },
  fichas: { label: 'Quadro de fichas', draw: () => (<g><rect x="14" y="30" width="72" height="40" rx="8" fill="#c8915f" stroke="#7a4e2c" strokeWidth="3" />{[30, 50, 70].map((x, i) => <circle key={x} cx={x} cy="50" r="9" fill={i < 2 ? '#ffd166' : '#7a4e2c'} stroke="#7a4e2c" strokeWidth="2" />)}</g>) },
};

export function Picto({ k }: { k: PictoKey }) {
  return <svg viewBox="0 0 100 100" aria-hidden="true">{PICTOS[k].draw()}</svg>;
}
