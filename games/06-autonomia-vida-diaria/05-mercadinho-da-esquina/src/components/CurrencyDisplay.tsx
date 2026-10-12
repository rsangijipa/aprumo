import React from 'react';
import type { CurrencyItem } from '../types/money';

interface CurrencyDisplayProps {
  item: CurrencyItem;
  count?: number;
  isSelected?: boolean;
  onClick?: () => void;
  scale?: number;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  item,
  count,
  isSelected = false,
  onClick,
  scale = 1,
}) => {
  if (item.type === 'moeda') {
    return (
      <div
        onClick={onClick}
        style={{
          width: item.width * scale,
          height: item.height * scale,
          borderRadius: '50%',
          backgroundColor: item.color,
          border: `3px solid ${item.accentColor}`,
          boxShadow: isSelected
            ? '0 0 12px rgba(244, 162, 97, 0.8), 0 4px 8px rgba(0,0,0,0.2)'
            : '0 4px 8px rgba(0,0,0,0.18)',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClick ? 'pointer' : 'default',
          transform: isSelected ? 'scale(1.08)' : 'scale(1)',
          transition: 'all 0.18s ease',
          userSelect: 'none',
          position: 'relative',
        }}
        title={`Moeda de ${item.label}`}
      >
        <span
          style={{
            fontFamily: 'var(--font-teen)',
            fontWeight: 800,
            fontSize: `${0.85 * scale}rem`,
            color: '#FFFFFF',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {item.label}
        </span>

        {/* Small "treino" stamp watermark */}
        <span
          style={{
            fontSize: `${0.45 * scale}rem`,
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          treino
        </span>

        {count !== undefined && count > 1 && (
          <div
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              backgroundColor: 'var(--tinta)',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: 20,
              height: 20,
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {count}
          </div>
        )}
      </div>
    );
  }

  // Cédula de Treino
  return (
    <div
      onClick={onClick}
      style={{
        width: item.width * scale,
        height: item.height * scale,
        borderRadius: '8px',
        backgroundColor: item.color,
        border: `2px solid ${item.accentColor}`,
        boxShadow: isSelected
          ? '0 0 14px rgba(244, 162, 97, 0.8), 0 4px 10px rgba(0,0,0,0.2)'
          : '0 4px 8px rgba(0,0,0,0.15)',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 8px',
        cursor: onClick ? 'pointer' : 'default',
        transform: isSelected ? 'scale(1.06)' : 'scale(1)',
        transition: 'all 0.18s ease',
        userSelect: 'none',
        position: 'relative',
        background: `linear-gradient(135deg, ${item.color}, ${item.accentColor})`,
      }}
      title={`Cédula de ${item.label}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-teen)',
            fontWeight: 800,
            fontSize: `${0.95 * scale}rem`,
            color: '#FFFFFF',
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
          }}
        >
          {item.label}
        </span>

        <span
          style={{
            fontSize: `${0.5 * scale}rem`,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.4)',
            padding: '1px 3px',
            borderRadius: '4px',
            textTransform: 'uppercase',
          }}
        >
          treino
        </span>
      </div>

      <div
        style={{
          fontSize: `${0.55 * scale}rem`,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.85)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}
      >
        sem valor comercial
      </div>

      {count !== undefined && count > 1 && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: 'var(--tinta)',
            color: '#FFFFFF',
            borderRadius: '50%',
            width: 22,
            height: 22,
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {count}
        </div>
      )}
    </div>
  );
};
