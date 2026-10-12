import React from 'react';
import type { TokenTheme } from '../types/tokens';

interface TokenSlotProps {
  index: number;
  isFilled: boolean;
  theme: TokenTheme;
  isNewestFilled?: boolean;
}

export const TokenSlot: React.FC<TokenSlotProps> = ({
  index,
  isFilled,
  theme,
  isNewestFilled = false,
}) => {
  return (
    <div
      style={{
        width: '92px',
        height: '92px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: isFilled ? 'transparent' : 'rgba(148, 163, 184, 0.08)',
        border: isFilled ? 'none' : '3px dashed var(--neutro)',
        boxShadow: isFilled ? 'none' : 'inset 0 2px 6px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
      }}
      title={isFilled ? `Ficha ${index + 1} conquistada!` : `Espaço ${index + 1} livre`}
      id={`token-slot-${index}`}
    >
      {/* Slot number watermark when empty */}
      {!isFilled && (
        <span
          style={{
            fontFamily: 'var(--font-hud)',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: 'var(--neutro)',
            opacity: 0.5,
          }}
        >
          {index + 1}
        </span>
      )}

      {/* Filled Token (Buriti Star or Selected Theme) */}
      {isFilled && (
        <div
          style={{
            width: '84px',
            height: '84px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: isNewestFilled ? 'tokenLandingBounce 0.55s cubic-bezier(0.18, 0.89, 0.32, 1.28)' : 'none',
            filter: 'drop-shadow(0 6px 12px rgba(244, 162, 97, 0.45)) drop-shadow(0 2px 4px rgba(0,0,0,0.18))',
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <linearGradient id={`grad-token-${index}`} x1="20%" y1="15%" x2="80%" y2="85%">
                <stop offset="0%" stopColor="#FFF3E0" />
                <stop offset="40%" stopColor={theme.color} />
                <stop offset="100%" stopColor={theme.accentColor} />
              </linearGradient>

              {/* Paper cutout texture */}
              <filter id={`paper-cutout-${index}`} x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="0.6" />
                <feDropShadow dx="0" dy="-2" stdDeviation="1.8" floodColor="#000000" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Token Shape */}
            <path
              d={theme.svgPath}
              fill={`url(#grad-token-${index})`}
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter={`url(#paper-cutout-${index})`}
            />

            {/* Inner fiber texture / highlight */}
            <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeDasharray="3,3" />
          </svg>
        </div>
      )}
    </div>
  );
};
