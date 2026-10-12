import React from 'react';
import { useGameStore } from './store/gameStore';
import { MainMenu } from './ui/MainMenu';
import { BriefingModal } from './ui/BriefingModal';
import { CharacterSelect } from './ui/CharacterSelect';
import { PlanningOverlay } from './ui/PlanningOverlay';
import { GameCanvas } from './game/GameCanvas';
import { GameHUD } from './ui/GameHUD';
import { Results } from './ui/Results';

export const App: React.FC = () => {
  const currentScreen = useGameStore(s => s.currentScreen);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#283033] font-['Plus_Jakarta_Sans',sans-serif]">
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
