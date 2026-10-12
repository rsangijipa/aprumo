import React, { useEffect } from 'react';
import { useGameClient } from '@aprumo/game-sdk';
import { manifest } from './manifest';
import { useGameStore } from './store/gameStore';
import { soundEngine } from './audio/SoundEngine';
import { MainMenu } from './ui/MainMenu';
import { BriefingModal } from './ui/BriefingModal';
import { CharacterSelect } from './ui/CharacterSelect';
import { PlanningOverlay } from './ui/PlanningOverlay';
import { GameCanvas } from './game/GameCanvas';
import { GameHUD } from './ui/GameHUD';
import { Results } from './ui/Results';

export const App: React.FC = () => {
  const currentScreen = useGameStore(s => s.currentScreen);
  const selectedMap = useGameStore(s => s.selectedMap);
  const lastResults = useGameStore(s => s.lastResults);

  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);

  useEffect(() => {
    if (config?.adaptation?.sound) {
      if (config.adaptation.sound === 'off') {
        soundEngine.setMuted(true);
      } else if (config.adaptation.sound === 'low') {
        soundEngine.setMuted(false);
        soundEngine.setVolumes(0.2, 0.3);
      } else {
        soundEngine.setMuted(false);
        soundEngine.setVolumes(0.6, 0.7);
      }
    }
  }, [config]);

  useEffect(() => {
    client.gameStarted(manifest.version);
  }, [client]);

  useEffect(() => {
    if (currentScreen === 'game') {
      const taskIds = selectedMap.taskSpots.map(t => t.taskId);
      client.levelStarted({
        levelId: selectedMap.id,
        levelIndex: 0,
        trialsPlanned: taskIds.length,
      });
      client.trialStarted({
        targetId: selectedMap.id,
        trialIndex: 0,
        presented: taskIds,
      });
      client.stimulusPresented({
        targetId: selectedMap.id,
        trialIndex: 0,
        presented: taskIds,
        positionOfTarget: 0,
        modality: 'visual_auditory',
      });
    } else if (currentScreen === 'results' && lastResults) {
      const taskIds = selectedMap.taskSpots.map(t => t.taskId);
      client.levelCompleted({
        levelId: selectedMap.id,
        levelIndex: 0,
        trialsCompleted: taskIds.length,
        correct: lastResults.tasksCompleted,
        outcome: lastResults.isCompleteVictory ? 'completed' : 'repeated',
      });
      client.responseRecorded({
        targetId: selectedMap.id,
        stimulusId: selectedMap.id,
        trialIndex: 0,
        presented: taskIds,
        positionOfTarget: 0,
        selected: selectedMap.id,
        selectedPosition: 0,
        response: lastResults.isCompleteVictory ? 'correct' : 'incorrect',
        latencyMs: Math.round(lastResults.timeSpentSeconds * 1000),
        promptLevel: 'none',
        promptSource: 'none',
        detail: {
          tasksCompleted: lastResults.tasksCompleted,
          essentialTasksCompleted: lastResults.essentialTasksCompleted,
          helpsGiven: lastResults.helpsGiven,
          eventsHandled: lastResults.eventsHandled,
        },
      });
    }
  }, [client, currentScreen, selectedMap, lastResults]);

  if (ended) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#283033', color: '#fff', fontFamily: 'system-ui' }}>
        <h2>Mutirão do Parque Concluído!</h2>
        <p>A equipe finalizou os cuidados com o parque.</p>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#283033] font-['Plus_Jakarta_Sans',sans-serif]">
      {paused && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'system-ui' }}>
          <h2>Atividade pausada pelo mediador</h2>
        </div>
      )}
      {/* Active screen rendering */}
      {currentScreen === 'menu' && <MainMenu />}
      {currentScreen === 'briefing' && <BriefingModal />}
      {currentScreen === 'character_select' && <CharacterSelect />}
      {currentScreen === 'planning' && <PlanningOverlay />}

      {/* Main Game Screen */}
      {(currentScreen === 'game' || currentScreen === 'results') && (
        <>
          <GameCanvas />
          <GameHUD />
          {currentScreen === 'results' && <Results />}
        </>
      )}
    </div>
  );
};

export default App;

