// src/main.ts
// Entry point for Banda do Tico web application.

import './style.css';
import { createBandGame } from './game/BandGame';
import { audioMixer } from './audio/mixer';
import { modalManager } from './ui/Modals';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-canvas-container');
  if (!container) {
    console.error('Game container not found');
    return;
  }

  // Ensure AudioContext is ready upon any user gesture
  const unlockAudio = () => {
    audioMixer.init();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // Initialize Phaser Game instance
  const game = createBandGame(container);

  // Expose for debugging if needed
  (window as unknown as { __BAND_GAME__: typeof game; __MODALS__: typeof modalManager }).__BAND_GAME__ = game;
  (window as unknown as { __BAND_GAME__: typeof game; __MODALS__: typeof modalManager }).__MODALS__ = modalManager;
});
