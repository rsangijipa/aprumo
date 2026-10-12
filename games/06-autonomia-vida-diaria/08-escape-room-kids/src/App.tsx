// ==========================================================================
// ESCAPE ROOM KIDS — ROOT APPLICATION COMPONENT
// State Machine router, 3D Canvas integration, and Accessible DOM Modals
// ==========================================================================

import React, { useEffect, useState } from 'react';
import { useGameClient } from '@aprumo/game-sdk';
import { manifest } from './manifest';
import { soundManager } from './audio/soundManager';
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
  const { client, config, paused: hostPaused, ended } = useGameClient(manifest.appId, manifest.version);
  const { gameMode, activeRoomId, initGame } = useGameStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    initGame();
    client.gameStarted(manifest.version);
  }, [initGame, client]);

  // Adjust sound based on clinical config
  useEffect(() => {
    const soundPref = config?.adaptation?.sound;
    if (soundPref === 'off') {
      soundManager.setMuted(true);
      soundManager.setVolume(0);
    } else if (soundPref === 'low') {
      soundManager.setMuted(false);
      soundManager.setVolume(0.35);
    } else {
      soundManager.setMuted(false);
      soundManager.setVolume(0.85);
    }
  }, [config]);

  // Telemetry on room state
  useEffect(() => {
    if (gameMode === 'PLAYING') {
      client.levelStarted({
        levelId: activeRoomId,
        levelIndex: 0,
        trialsPlanned: 4,
      });
      client.trialStarted({
        targetId: activeRoomId,
        trialIndex: 0,
        presented: [activeRoomId],
      });
      client.stimulusPresented({
        targetId: activeRoomId,
        trialIndex: 0,
        presented: [activeRoomId],
        positionOfTarget: 0,
        modality: 'visual',
      });
    } else if (gameMode === 'ROOM_SOLVED') {
      client.responseRecorded({
        targetId: activeRoomId,
        stimulusId: activeRoomId,
        trialIndex: 0,
        presented: [activeRoomId],
        positionOfTarget: 0,
        selected: activeRoomId,
        selectedPosition: 0,
        response: 'correct',
        latencyMs: 5000,
        promptLevel: 'none',
        promptSource: 'none',
        detail: { roomId: activeRoomId },
      });
      client.reinforcerPresented({
        kind: 'visual',
        reinforcerId: 'room-escape-success',
        contingentOn: 'quarto-resolvido',
        intensity: 'festive',
      });
      client.levelCompleted({
        levelId: activeRoomId,
        levelIndex: 0,
        trialsCompleted: 4,
        correct: 4,
        outcome: 'completed',
      });
    }
  }, [gameMode, activeRoomId, client]);

  if (ended) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#12121e', color: '#fff', fontFamily: 'system-ui' }}>
        <h2>Escape Room Kids Concluído!</h2>
        <p>Todos os enigmas foram desvendados e o quarto foi completado com êxito!</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {hostPaused && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'system-ui' }}>
          <h2>Atividade pausada pelo mediador</h2>
        </div>
      )}

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
