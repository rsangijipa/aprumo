/**
 * Timer visual circular: a área colorida diminui conforme o tempo passa (sem números piscando).
 * Com movimento estático, atualiza a cada segundo sem transição.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { arcDash, formatClock, remainingFraction, remainingSeconds, shouldWarn } from './logic';

export function useNow(active: boolean, stepMs = 250): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), stepMs);
    return () => window.clearInterval(id);
  }, [active, stepMs]);
  return now;
}

export function CircularTimer({
  durationSec,
  startedAt,
  motion = 'reduced',
  showClock = true,
  onEnd,
  children,
}: {
  durationSec: number;
  /** ms (Date.now()) do início; null = parado e cheio. */
  startedAt: number | null;
  motion?: 'full' | 'reduced' | 'static';
  showClock?: boolean;
  onEnd?: () => void;
  children?: ReactNode;
}) {
  const now = useNow(startedAt !== null, motion === 'static' ? 1000 : 250);
  const elapsed = startedAt === null ? 0 : now - startedAt;
  const durMs = durationSec * 1000;
  const frac = remainingFraction(elapsed, durMs);
  const left = remainingSeconds(elapsed, durMs);
  const warn = shouldWarn(left, durationSec);
  const { dasharray, dashoffset } = arcDash(44, frac);
  const ended = startedAt !== null && left === 0;
  const endedRef = useRef(false);
  useEffect(() => {
    if (ended && !endedRef.current) {
      endedRef.current = true;
      onEnd?.();
    }
    if (!ended) endedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ended]);

  return (
    <div className="av-timer" data-motion={motion} data-warn={warn} data-ended={ended} role="timer" aria-label={`Tempo restante: ${formatClock(left)}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="44" className="av-timer__track" />
        <circle
          cx="50" cy="50" r="44" className="av-timer__arc"
          strokeDasharray={dasharray} strokeDashoffset={dashoffset} transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="av-timer__inner">{children}</div>
      {showClock && <span className="av-timer__clock">{ended ? 'Tempo!' : formatClock(left)}</span>}
    </div>
  );
}
