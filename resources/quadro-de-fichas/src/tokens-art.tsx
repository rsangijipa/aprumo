/**
 * Fichas temáticas: fichas ligadas ao interesse da criança tendem a funcionar melhor do que
 * fichas genéricas. Cada tema tem a sua própria arte.
 */
import type { ReactElement } from 'react';
import { BOARD_THEMES, isBoardTheme, type BoardTheme, type LegacyTheme, type Variant } from './logic';
import { ThemeTokenArt } from './themes-art';

/** Temas aceitos: os 8 temas do quadro + os 6 temas da v1 (casos já configurados). */
export type TokenTheme = BoardTheme | LegacyTheme;
const THEME_LABEL: Record<BoardTheme, string> = {
  planetas: 'Planetas', dinossauros: 'Dinossauros', trens: 'Trens', carros: 'Carros',
  animais: 'Animais', flores: 'Flores', formas: 'Formas', puzzle: 'Quebra-cabeça',
};
export const TOKEN_THEMES: Array<{ id: BoardTheme; label: string }> = BOARD_THEMES.map((id) => ({ id, label: THEME_LABEL[id] }));
export const LEGACY_TOKEN_THEMES: Array<{ id: LegacyTheme; label: string }> = [
  { id: 'estrela', label: 'Estrela' },
  { id: 'trem', label: 'Trem' },
  { id: 'dinossauro', label: 'Dinossauro' },
  { id: 'coracao', label: 'Coração' },
  { id: 'folha', label: 'Folha' },
  { id: 'bola', label: 'Bola' },
];

const LEGACY_TO_BOARD: Record<LegacyTheme, BoardTheme> = {
  estrela: 'formas', trem: 'trens', dinossauro: 'dinossauros', coracao: 'formas', folha: 'flores', bola: 'formas',
};

const ART: Record<LegacyTheme, () => ReactElement> = {
  estrela: () => (
    <g>
      <circle cx="50" cy="50" r="46" fill="#ffd166" stroke="#c9952a" strokeWidth="4" />
      <path d="M50 18l9.4 19 21 3-15.2 14.8 3.6 20.9L50 65.8 31.2 75.7l3.6-20.9L19.6 40l21-3z" fill="#fff4cf" stroke="#c9952a" strokeWidth="3" strokeLinejoin="round" />
    </g>
  ),
  trem: () => (
    <g>
      <circle cx="50" cy="50" r="46" fill="#7fb3d5" stroke="#3f6f8f" strokeWidth="4" />
      <rect x="22" y="38" width="40" height="24" rx="4" fill="#e76f51" stroke="#9c3d26" strokeWidth="2.5" />
      <rect x="58" y="30" width="18" height="32" rx="3" fill="#e76f51" stroke="#9c3d26" strokeWidth="2.5" />
      <rect x="61" y="35" width="12" height="10" rx="2" fill="#dff1fb" />
      <rect x="26" y="26" width="8" height="12" rx="2" fill="#3d405b" />
      <circle cx="32" cy="66" r="6" fill="#3d405b" /><circle cx="52" cy="66" r="6" fill="#3d405b" /><circle cx="68" cy="66" r="6" fill="#3d405b" />
    </g>
  ),
  dinossauro: () => (
    <g>
      <circle cx="50" cy="50" r="46" fill="#a7d3a6" stroke="#4f8a4e" strokeWidth="4" />
      <path d="M22 66c0-14 10-22 24-22h10c4-10 10-16 16-16 5 0 8 4 8 8 0 5-4 8-9 8h-3v14c0 8-6 12-14 12H30" fill="#4f9a5a" stroke="#2f6b3a" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M34 44l4-8 4 8M46 42l4-8 4 8" fill="#f2cc8f" stroke="#2f6b3a" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="73" cy="35" r="2.5" fill="#1e3d24" />
      <path d="M32 70v8M52 70v8" stroke="#2f6b3a" strokeWidth="5" strokeLinecap="round" />
    </g>
  ),
  coracao: () => (
    <g>
      <circle cx="50" cy="50" r="46" fill="#f6bdc0" stroke="#c0606a" strokeWidth="4" />
      <path d="M50 76S24 60 24 41a13 13 0 0 1 26-4 13 13 0 0 1 26 4c0 19-26 35-26 35z" fill="#e5596b" stroke="#a43348" strokeWidth="3" strokeLinejoin="round" />
    </g>
  ),
  folha: () => (
    <g>
      <circle cx="50" cy="50" r="46" fill="#dfe9c6" stroke="#7d9a4a" strokeWidth="4" />
      <path d="M26 72C26 42 46 24 76 24c0 30-18 50-50 48z" fill="#8bb85a" stroke="#4f7a2a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 70 66 34" stroke="#4f7a2a" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  bola: () => (
    <g>
      <circle cx="50" cy="50" r="46" fill="#f4ead6" stroke="#b9a37a" strokeWidth="4" />
      <circle cx="50" cy="50" r="27" fill="#e8574a" stroke="#a8362c" strokeWidth="3" />
      <path d="M24 46c16 6 36 6 52 0" fill="none" stroke="#fff" strokeWidth="6" />
      <path d="M24 56c16 6 36 6 52 0" fill="none" stroke="#2f6fb0" strokeWidth="6" />
    </g>
  ),
};

export function TokenArt({ theme, variant = 'playful', index = 0 }: { theme: TokenTheme; variant?: Variant; index?: number }) {
  if (isBoardTheme(theme)) return <ThemeTokenArt theme={theme} variant={variant} index={index} />;
  const draw = ART[theme as LegacyTheme];
  // Sóbria (≥10 anos) ou tema desconhecido: equivalente entre os 8 temas.
  if (variant === 'sober' || !draw) return <ThemeTokenArt theme={LEGACY_TO_BOARD[theme as LegacyTheme] ?? 'formas'} variant={variant} index={index} />;
  return <svg viewBox="0 0 100 100" aria-hidden="true">{draw()}</svg>;
}

/** Ícone do reforçador de troca por categoria (o nome do item vai como texto acessível). */
export function RewardIcon({ category }: { category: string }) {
  const c: Record<string, ReactElement> = {
    atividade: (<g><circle cx="38" cy="42" r="18" fill="#cfe8f7" stroke="#6aa7c9" strokeWidth="3" /><circle cx="64" cy="58" r="12" fill="#e2f3fb" stroke="#6aa7c9" strokeWidth="3" /><circle cx="62" cy="28" r="7" fill="#eef8fd" stroke="#6aa7c9" strokeWidth="2.5" /><path d="M30 34a10 10 0 0 1 8-6" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></g>),
    tangível: (<g><rect x="22" y="40" width="56" height="38" rx="6" fill="#f2cc8f" stroke="#b9822a" strokeWidth="3" /><path d="M18 40h64l-6-14H24z" fill="#e07a5f" stroke="#a8462f" strokeWidth="3" strokeLinejoin="round" /><circle cx="50" cy="58" r="8" fill="#81b29a" /></g>),
    social: (<g><path d="M20 58c8-14 18-18 28-14l10 6-6 8-8-4" fill="#f6c9a8" stroke="#b07d55" strokeWidth="3" strokeLinejoin="round" /><path d="M80 58c-8-14-18-18-28-14" fill="none" stroke="#b07d55" strokeWidth="3" /><path d="M50 30s-8-6-8-11a4.5 4.5 0 0 1 8-2.5 4.5 4.5 0 0 1 8 2.5c0 5-8 11-8 11z" fill="#e5596b" /></g>),
    digital: (<g><rect x="20" y="24" width="60" height="50" rx="8" fill="#3d405b" /><rect x="26" y="30" width="48" height="38" rx="3" fill="#cfe8f7" /><path d="M54 38v18a5 5 0 1 1-3-4.6V42l12-3v13a5 5 0 1 1-3-4.6V36z" fill="#3d405b" /></g>),
    comestível: (<g><circle cx="50" cy="52" r="26" fill="#d9a66b" stroke="#9b6a35" strokeWidth="3" /><circle cx="42" cy="46" r="3.5" fill="#5b3a1a" /><circle cx="58" cy="50" r="3.5" fill="#5b3a1a" /><circle cx="48" cy="60" r="3.5" fill="#5b3a1a" /></g>),
  };
  return <svg viewBox="0 0 100 100" aria-hidden="true">{c[category] ?? c.tangível}</svg>;
}
