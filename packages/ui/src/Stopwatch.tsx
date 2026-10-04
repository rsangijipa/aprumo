import { useEffect, useState } from 'react';
import { IconClock } from './icons';

export interface StopwatchProps {
  startedAt: number;
  active?: boolean;
}

export function Stopwatch({ startedAt, active = true }: StopwatchProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 100);
    return () => window.clearInterval(interval);
  }, [startedAt, active]);

  const sec = (elapsedMs / 1000).toFixed(1);

  return (
    <span
      className="ap-stopwatch"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.8rem',
        color: 'var(--ap-muted, #5f7065)',
        fontWeight: 500,
      }}
    >
      <IconClock style={{ width: 14, height: 14, color: 'var(--ap-sage-600, #3e6d52)' }} />
      <span>{sec}s desde a apresentação</span>
    </span>
  );
}
