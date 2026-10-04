import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

export const HOLD_MS = 1200;

/**
 * Pressão prolongada compartilhada (ChildShell, PlayShell, ChildSpace): dedo, mouse ou teclado
 * (segurar Enter/Espaço). Só dispara depois de `ms` contínuos; soltar antes cancela.
 * Devolve `holding` para desenhar o anel de progresso e `bind` para espalhar no botão.
 */
export function useHoldPress(onComplete: () => void, ms = HOLD_MS) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | null>(null);
  const done = useRef(onComplete);
  done.current = onComplete;

  const cancel = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  }, []);

  const start = useCallback(() => {
    if (timer.current) return;
    setHolding(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setHolding(false);
      done.current();
    }, ms);
  }, [ms]);

  useEffect(() => cancel, [cancel]);

  const bind = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      start();
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onBlur: cancel,
    onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (!e.repeat) start();
    },
    onKeyUp: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      cancel();
    },
    // Clique simples (ou leitor de tela) nunca sai direto: só a pressão prolongada.
    onClick: (e: { preventDefault: () => void }) => e.preventDefault(),
  };

  return { holding, bind, ms };
}

/**
 * Anel de progresso da pressão prolongada (SVG, sem CSS externo). Com movimento reduzido o anel
 * aparece completo e estático: o retorno é a mudança de estado, não a animação.
 */
export function HoldRing({ holding, ms = HOLD_MS, size = 44, color = 'currentColor', className }: { holding: boolean; ms?: number; size?: number; color?: string; className?: string }) {
  if (!holding) return null;
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={className ? { pointerEvents: 'none', transform: 'rotate(-90deg)' } : { position: 'absolute', inset: 0, margin: 'auto', pointerEvents: 'none', transform: 'rotate(-90deg)' }}>
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeOpacity={0.2} strokeWidth="4" />
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={reduce ? 0 : c}>
        {!reduce && <animate attributeName="stroke-dashoffset" from={c} to="0" dur={`${ms}ms`} fill="freeze" />}
      </circle>
    </svg>
  );
}
