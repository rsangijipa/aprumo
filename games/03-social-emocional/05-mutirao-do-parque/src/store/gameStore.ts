import { create } from 'zustand';
import { MapDef, CharacterDef, GameMode, MatchDuration, CompletedStats } from '../types';
import mapsData from '../data/maps.json';
import charactersData from '../data/characters.json';
import { WorldState } from '../simulation/WorldState';
import { StorageSystem, UserPreferences } from '../save/StorageSystem';
import { soundEngine } from '../audio/SoundEngine';

export type ScreenState =
  | 'menu'
  | 'briefing'
  | 'character_select'
  | 'planning'
  | 'game'
  | 'results'
  | 'settings';

interface GameStoreState {
  currentScreen: ScreenState;
  selectedMap: MapDef;
  selectedChar1: CharacterDef;
  selectedChar2: CharacterDef;
  gameMode: GameMode;
  matchDuration: MatchDuration;
  plannedTaskIds: string[];
  worldState: WorldState | null;
  userPreferences: UserPreferences;
  isQuickCommsOpen: boolean;
  selectedPingIcon: string;
  lastResults: CompletedStats | null;

  // Actions
  setScreen: (screen: ScreenState) => void;
  selectMap: (map: MapDef) => void;
  setGameMode: (mode: GameMode) => void;
  setMatchDuration: (duration: MatchDuration) => void;
  selectChar1: (char: CharacterDef) => void;
  selectChar2: (char: CharacterDef) => void;
  togglePlannedTask: (taskId: string) => void;
  initWorld: () => void;
  updateWorldState: (updater: (world: WorldState) => void) => void;
  openQuickComms: (open: boolean) => void;
  sendComm: (playerId: string, message: string) => void;
  saveUserPreferences: (prefs: Partial<UserPreferences>) => void;
  finishMatchWithStats: (stats: CompletedStats) => void;
  continuePlayingWithoutTime: () => void;
  resetToMenu: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => {
  const initialPrefs = StorageSystem.loadPreferences();
  soundEngine.setVolumes(initialPrefs.musicVolume, initialPrefs.sfxVolume);
  soundEngine.setMuted(initialPrefs.isMuted);

  return {
    currentScreen: 'menu',
    selectedMap: mapsData[0] as MapDef,
    selectedChar1: charactersData[0] as CharacterDef, // Luan
    selectedChar2: charactersData[3] as CharacterDef, // Maya (wheelchair athlete/gardener)
    gameMode: initialPrefs.tapToMoveEnabled ? 'tap_to_move' : 'solo',
    matchDuration: 'curta',
    plannedTaskIds: [],
    worldState: null,
    userPreferences: initialPrefs,
    isQuickCommsOpen: false,
    selectedPingIcon: 'Pin',
    lastResults: null,

    setScreen: (screen) => set({ currentScreen: screen }),

    selectMap: (map) => set({ selectedMap: map, plannedTaskIds: [] }),

    setGameMode: (mode) => set({ gameMode: mode }),

    setMatchDuration: (duration) => set({ matchDuration: duration }),

    selectChar1: (char) => set({ selectedChar1: char }),

    selectChar2: (char) => set({ selectedChar2: char }),

    togglePlannedTask: (taskId) => {
      const current = get().plannedTaskIds;
      if (current.includes(taskId)) {
        set({ plannedTaskIds: current.filter(id => id !== taskId) });
      } else {
        set({ plannedTaskIds: [...current, taskId] });
      }
    },

    initWorld: () => {
      const { selectedMap, selectedChar1, selectedChar2, gameMode, matchDuration } = get();
      const world = new WorldState(
        selectedMap,
        selectedChar1.id,
        selectedChar2.id,
        gameMode,
        matchDuration
      );
      set({ worldState: world, currentScreen: 'game' });
      soundEngine.startMusic();
    },

    updateWorldState: (updater) => {
      const world = get().worldState;
      if (world) {
        updater(world);
        set({ worldState: world });
      }
    },

    openQuickComms: (open) => set({ isQuickCommsOpen: open }),

    sendComm: (playerId, message) => {
      const world = get().worldState;
      if (world) {
        const player = world.players.find(p => p.id === playerId);
        if (player) {
          player.currentSpeechBubble = message;
          player.speechBubbleTimer = 4.0;
          soundEngine.playCommPing();
        }
      }
    },

    saveUserPreferences: (prefs) => {
      const updated = { ...get().userPreferences, ...prefs };
      StorageSystem.savePreferences(updated);
      soundEngine.setVolumes(updated.musicVolume, updated.sfxVolume);
      soundEngine.setMuted(updated.isMuted);
      set({ userPreferences: updated });
    },

    finishMatchWithStats: (stats) => {
      StorageSystem.recordCompletedMatch(stats);
      set({ lastResults: stats, currentScreen: 'results' });
      soundEngine.playTaskComplete();
    },

    continuePlayingWithoutTime: () => {
      const world = get().worldState;
      if (world) {
        world.continueWithoutTime();
        set({ currentScreen: 'game' });
      }
    },

    resetToMenu: () => {
      set({
        currentScreen: 'menu',
        worldState: null,
        lastResults: null,
        plannedTaskIds: []
      });
    }
  };
});
