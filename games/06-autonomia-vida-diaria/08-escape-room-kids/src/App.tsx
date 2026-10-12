// ==========================================================================
// ESCAPE ROOM KIDS — ROOT APPLICATION COMPONENT
// State Machine router, 3D Canvas integration, and Accessible DOM Modals
// ==========================================================================

import React, { useEffect, useState } from 'react';
import { useGameStore } from './state/gameStore';
import { MainMenu } from './ui/menu/MainMenu';
import { GameScene } from './game/scene/GameScene';
import { GameHUD } from './ui/hud/GameHUD';
import { PuzzleModal } from './ui/modals/PuzzleModal';
import { ItemInspectModal } from './ui/modals/ItemInspectModal';
import { HintModal } from './ui/modals/HintModal';
import { RoomSolvedModal } from './ui/modals/RoomSolvedModal';
import { SettingsModal } from './ui/modals/SettingsModal';

export const App: React.FC = () => {
  const { gameMode, initGame } = useGameStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    initGame();
  }, [initGame]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 1. Main Menu State */}
      {gameMode === 'MENU' && (
        <MainMenu onOpenSettings={() => setSettingsOpen(true)} />
      )}

      {/* 2. 3D Game Playing / Exploration State */}
      {(gameMode === 'PLAYING' || gameMode === 'ROOM_SOLVED') && (
        <>
          {/* WebGL 3D Diorama Canvas */}
          <GameScene />

          {/* Accessible DOM HUD Overlay */}
          <GameHUD onOpenSettings={() => setSettingsOpen(true)} />
        </>
      )}

      {/* --- Global Modals --- */}
      <PuzzleModal />
      <ItemInspectModal />
      <HintModal />
      <RoomSolvedModal />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default App;
