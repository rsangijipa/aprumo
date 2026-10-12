/**
 * Laço de animação com `dt` (requestAnimationFrame), para física e partículas.
 * - Para sozinho quando `active` é false (pausa clínica, fim de sessão, movimento estático).
 * - `dt` limitado a 1/30 s: aba em segundo plano ou travadas não "teletransportam" objetos.
 * - O callback mais recente é sempre usado (sem reiniciar o laço a cada render).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export const MAX_FRAME_DT = 1 / 30;
const NBSP = String.fromCharCode(160);

export function useFrameLoop(cb: (dt: number, t: number) => void, active: boolean): void {
  const ref = useRef(cb);
  useEffect(() => {
    ref.current = cb;
  });
  useEffect(() => {
    if (!active || typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') return;
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    const tick = (now: number) => {
      const dt = Math.min(MAX_FRAME_DT, Math.max(0, (now - last) / 1000));
      last = now;
      elapsed += dt;
      ref.current(dt, elapsed);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [active]);
}

/**
 * Texto para uma região `aria-live` do jogo (leitores de tela).
 * Repetir a mesma frase força a releitura (alterna um espaço invisível no fim).
 */
export function useAnnounce(): [string, (text: string) => void] {
  const [msg, setMsg] = useState('');
  const announce = useCallback((text: string) => {
    setMsg((prev) => (prev === text ? text + NBSP : text));
  }, []);
  return [msg, announce];
}

/** Captura o ponteiro sem quebrar se o id não existir mais (toque cancelado, eventos sintéticos). */
export function capturePointer(el: Element, id: number): void {
  try {
    el.setPointerCapture(id);
  } catch {
    /* ponteiro já liberado */
  }
}
