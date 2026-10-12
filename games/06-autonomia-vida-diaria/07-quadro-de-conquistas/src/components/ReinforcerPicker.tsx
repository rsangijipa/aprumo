import React from 'react';
import type { ReinforcerOption } from '../types/tokens';
import { Sparkles, Clock } from 'lucide-react';

interface ReinforcerPickerProps {
  options: ReinforcerOption[];
  onSelect: (reinforcer: ReinforcerOption) => void;
}

export const ReinforcerPicker: React.FC<ReinforcerPickerProps> = ({ options, onSelect }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '24px',
        maxWidth: '720px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '28px',
        boxShadow: '0 16px 36px rgba(30, 37, 43, 0.1)',
        border: '3px solid var(--tinta-15)',
        animation: 'scaleUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      }}
      id="reinforcer-picker"
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--buriti)',
            fontFamily: 'var(--font-hud)',
            fontWeight: 800,
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          <Sparkles size={18} />
          Escolha o seu prêmio
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-hud)',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--tinta)',
            margin: '4px 0 0 0',
          }}
        >
          Pelo que você quer trabalhar hoje?
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-corpo)',
            fontSize: '0.95rem',
            color: 'var(--tinta-60)',
            margin: '4px 0 0 0',
          }}
        >
          Toque no cartão para escolher o que você vai ganhar ao juntar todas as fichas!
        </p>
      </div>

      {/* Grid of 2 to 4 options */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          width: '100%',
          marginTop: '8px',
        }}
      >
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '24px 16px',
              borderRadius: '22px',
              backgroundColor: '#FFFFFF',
              border: `3px solid ${option.color}`,
              cursor: 'pointer',
              boxShadow: '0 8px 18px rgba(0,0,0,0.06)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              touchAction: 'manipulation',
              minHeight: '160px',
            }}
            onPointerDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
            onPointerUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            className="reinforcer-card"
          >
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: `${option.color}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '38px',
              }}
            >
              {option.iconEmoji}
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-hud)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--tinta)',
                  margin: '0 0 4px 0',
                }}
              >
                {option.name}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-corpo)',
                  fontSize: '0.82rem',
                  color: 'var(--tinta-60)',
                  margin: 0,
                  lineHeight: '1.3',
                }}
              >
                {option.description}
              </p>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--fundo)',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--tinta-60)',
                fontFamily: 'var(--font-hud)',
              }}
            >
              <Clock size={13} />
              {Math.round(option.durationSeconds / 60)} minutos
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
