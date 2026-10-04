import { useEffect, useState } from 'react';
import { IconUndo } from './icons';

export interface UndoBarProps {
  label: string;
  durationMs?: number;
  onUndo: () => void;
  onExpire?: () => void;
}

export function UndoBar({
  label,
  durationMs = 5000,
  onUndo,
  onExpire,
}: UndoBarProps) {
  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, durationMs - elapsed);
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(interval);
        onExpire?.();
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [durationMs, onExpire]);

  const pct = (remaining / durationMs) * 100;
  const seconds = Math.ceil(remaining / 1000);

  return (
    <div
      className="ap-undo-bar"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 900,
        backgroundColor: 'var(--ap-sage-950, #142018)',
        color: '#fff',
        borderRadius: 'var(--ap-radius-md, 10px)',
        padding: '0.65rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        minWidth: '280px',
        maxWidth: '92vw',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          width: `${pct}%`,
          backgroundColor: 'var(--ap-terra-500, #c46849)',
          transition: 'width 100ms linear',
        }}
      />
      <span style={{ fontSize: '0.85rem', fontWeight: 500, flex: 1 }}>{label}</span>
      <button
        type="button"
        onClick={onUndo}
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: '#fff',
          borderRadius: '6px',
          padding: '0.35rem 0.65rem',
          fontSize: '0.82rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          cursor: 'pointer',
        }}
        aria-label="Desfazer tentativa registrada"
      >
        <IconUndo style={{ width: 14, height: 14 }} />
        <span>Desfazer ({seconds}s)</span>
      </button>
    </div>
  );
}
