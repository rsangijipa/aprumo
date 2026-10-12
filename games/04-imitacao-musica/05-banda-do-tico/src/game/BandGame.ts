// src/game/BandGame.ts
// Phaser Game configuration and bootstrap for Banda do Tico.

import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MainMenuScene from './scenes/MainMenuScene';
import PlayScene from './scenes/PlayScene';

export function createBandGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: 1024,
    height: 600,
    backgroundColor: '#1B263B',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      keyboard: true,
      touch: true,
    },
    scene: [BootScene, MainMenuScene, PlayScene],
  };

  return new Phaser.Game(config);
}
