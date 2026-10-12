import React, { useEffect, useRef } from 'react';
import './style.css';
import { createBandGame } from './game/BandGame';
import { audioMixer } from './audio/mixer';

export function Game() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const unlock = () => {
      audioMixer.init();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    const game = createBandGame(containerRef.current);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      game.destroy(true);
    };
  }, []);

  return React.createElement('div', {
    id: 'game-canvas-container',
    ref: containerRef,
    style: { width: '100%', height: '100%', position: 'relative', overflow: 'hidden' },
  });
}
export { manifest } from './manifest';
