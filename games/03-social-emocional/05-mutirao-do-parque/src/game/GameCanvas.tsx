import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ParkScene } from './ParkScene';
import { useGameStore } from '../store/gameStore';

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const selectedMap = useGameStore(s => s.selectedMap);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: selectedMap.gridWidth * 32,
      height: selectedMap.gridHeight * 32,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [ParkScene]
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [selectedMap]);

  return (
    <div
      ref={containerRef}
      id="phaser-container"
      className="w-full h-full flex items-center justify-center overflow-hidden bg-[#283033]"
      style={{ touchAction: 'none' }}
    />
  );
};
