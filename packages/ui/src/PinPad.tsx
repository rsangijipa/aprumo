import { useState } from 'react';

export interface PinPadProps {
  title?: string;
  expectedPin?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PinPad({
  title = 'PIN do Adulto',
  expectedPin = '1234',
  onSuccess,
  onCancel,
}: PinPadProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === expectedPin.length) {
      if (next === expectedPin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => setPin(''), 500);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--ap-card-bg, #fff)',
          color: 'var(--ap-text, #1c2b22)',
          borderRadius: 'var(--ap-radius-lg, 16px)',
          padding: '1.75rem',
          width: '100%',
          maxWidth: '320px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{title}</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--ap-muted, #5f7065)', margin: '0.25rem 0 0' }}>
            Digite o PIN para retomar o controle
          </p>
        </div>

        {/* Indicadores de PIN */}
        <div style={{ display: 'flex', gap: '0.75rem', margin: '0.5rem 0' }}>
          {Array.from({ length: expectedPin.length }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor:
                  i < pin.length
                    ? error
                      ? 'var(--ap-danger, #d32f2f)'
                      : 'var(--ap-sage-700, #2f543e)'
                    : 'var(--ap-sage-200, #e0e8e3)',
                transition: 'background-color 0.15s ease',
              }}
            />
          ))}
        </div>

        {error && (
          <span style={{ fontSize: '0.8rem', color: 'var(--ap-danger, #d32f2f)', fontWeight: 600 }}>
            PIN incorreto. Padrão: {expectedPin}
          </span>
        )}

        {/* Teclado numérico */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.65rem',
            width: '100%',
          }}
        >
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              style={{
                height: '52px',
                borderRadius: '12px',
                border: '1px solid var(--ap-border, #d1ddd6)',
                backgroundColor: 'var(--ap-bg, #f4f7f5)',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'inherit',
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={onCancel}
            style={{
              height: '52px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--ap-muted, #5f7065)',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            style={{
              height: '52px',
              borderRadius: '12px',
              border: '1px solid var(--ap-border, #d1ddd6)',
              backgroundColor: 'var(--ap-bg, #f4f7f5)',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'inherit',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            style={{
              height: '52px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--ap-muted, #5f7065)',
              cursor: 'pointer',
            }}
            aria-label="Apagar dígito"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
