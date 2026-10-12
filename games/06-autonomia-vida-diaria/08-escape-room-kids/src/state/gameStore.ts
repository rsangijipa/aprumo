// ==========================================================================
// ESCAPE ROOM KIDS — CENTRAL GAME STORE (Zustand)
// Manages State Machine, Inventory, Layered Hints, Puzzles & Audio Integration
// ==========================================================================

import { create } from 'zustand';
import { AgeProfile, CameraMode, InventoryItem, PuzzleDefinition, RoomDefinition } from '../game/types';
import { ROOMS_DATA, ALL_ITEMS } from '../game/roomsData';
import { soundManager } from '../audio/soundManager';
import { saveManager } from '../save/saveManager';
import confetti from 'canvas-confetti';

export type GameMode = 'BOOT' | 'MENU' | 'PLAYING' | 'ROOM_SOLVED' | 'SUMMARY';

export interface GameSettings {
  pointAndClickOnly: boolean;
  reducedMotion: boolean;
  visualAudio: boolean;
  highContrast: boolean;
  soundVolume: number;
  isMuted: boolean;
}

export interface GameState {
  // Navigation & Mode
  gameMode: GameMode;
  ageProfile: AgeProfile;
  activeRoomId: 'workshop' | 'library' | 'greenhouse';
  completedRooms: string[];
  
  // Camera
  cameraMode: CameraMode;
  cameraTarget: [number, number, number];
  
  // Inventory (Max 6 slots)
  inventory: InventoryItem[];
  selectedItemId: string | null;
  inspectingItem: InventoryItem | null;
  
  // Puzzle & Modals
  activePuzzle: PuzzleDefinition | null;
  hintModalOpen: boolean;
  hintLevel: number;
  highlightedHotspotId: string | null;
  solvedPuzzles: Record<string, string[]>; // roomId -> puzzleIds[]
  
  // Interactive Room States (for animations & mechanics)
  roomStates: {
    workshop: {
      chestOpen: boolean;
      gearsPlaced: boolean[];
      laserActive: boolean;
      mirrorsAligned: boolean;
      doorOpen: boolean;
    };
    library: {
      booksOrdered: boolean;
      globeAligned: boolean;
      bellsPlayed: boolean;
      cipherUsed: boolean;
      doorOpen: boolean;
    };
    greenhouse: {
      scaleBalanced: boolean;
      pipesConnected: boolean;
      sunlightFiltered: boolean;
      gateOpen: boolean;
    };
  };

  // Feedback Toast / Subtitles
  toastMessage: string | null;
  
  // Accessibility & Audio Settings
  settings: GameSettings;

  // Actions
  initGame: () => Promise<void>;
  startGame: (roomId?: 'workshop' | 'library' | 'greenhouse') => void;
  returnToMenu: () => void;
  setAgeProfile: (profile: AgeProfile) => void;
  setCameraMode: (mode: CameraMode) => void;
  setCameraFocus: (target: [number, number, number]) => void;
  
  // Inventory Actions
  selectItem: (id: string | null) => void;
  collectItem: (item: InventoryItem) => void;
  inspectItem: (item: InventoryItem | null) => void;
  closeInspection: () => void;
  combineItems: (id1: string, id2: string) => boolean;
  
  // Puzzle & Hint Actions
  openPuzzle: (puzzle: PuzzleDefinition) => void;
  closePuzzle: () => void;
  solvePuzzle: (puzzleId: string) => void;
  openHintModal: () => void;
  closeHintModal: () => void;
  requestNextHint: () => void;
  
  // Room Completion
  unlockRoomExit: () => void;
  nextRoom: () => void;
  
  // Settings & Accessibility
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  showToast: (msg: string) => void;
  resetAllProgress: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  gameMode: 'MENU',
  ageProfile: '9+',
  activeRoomId: 'workshop',
  completedRooms: [],
  
  cameraMode: 'orbit',
  cameraTarget: [0, 1.2, 0],
  
  inventory: [],
  selectedItemId: null,
  inspectingItem: null,
  
  activePuzzle: null,
  hintModalOpen: false,
  hintLevel: 1,
  highlightedHotspotId: null,
  solvedPuzzles: {
    workshop: [],
    library: [],
    greenhouse: [],
  },

  roomStates: {
    workshop: {
      chestOpen: false,
      gearsPlaced: [false, false, false],
      laserActive: false,
      mirrorsAligned: false,
      doorOpen: false,
    },
    library: {
      booksOrdered: false,
      globeAligned: false,
      bellsPlayed: false,
      cipherUsed: false,
      doorOpen: false,
    },
    greenhouse: {
      scaleBalanced: false,
      pipesConnected: false,
      sunlightFiltered: false,
      gateOpen: false,
    }
  },

  toastMessage: null,

  settings: {
    pointAndClickOnly: false,
    reducedMotion: false,
    visualAudio: true,
    highContrast: false,
    soundVolume: 0.7,
    isMuted: false,
  },

  // Initialize from storage
  initGame: async () => {
    const saved = await saveManager.load();
    soundManager.setMuted(saved.settings.isMuted);
    soundManager.setVolume(saved.settings.soundVolume);

    // Reconstruct inventory from saved IDs
    const loadedInventory: InventoryItem[] = [];
    saved.inventoryItemIds.forEach(id => {
      if (ALL_ITEMS[id]) loadedInventory.push(ALL_ITEMS[id]);
    });

    set({
      ageProfile: saved.ageProfile,
      activeRoomId: saved.activeRoomId as 'workshop' | 'library' | 'greenhouse',
      completedRooms: saved.completedRooms,
      solvedPuzzles: saved.solvedPuzzles,
      inventory: loadedInventory,
      settings: saved.settings,
    });
  },

  startGame: (roomId) => {
    const targetRoom = roomId || get().activeRoomId;
    soundManager.playClick();
    soundManager.startAmbientTone(targetRoom);

    // Initial items per room (e.g., workbench key blank in workshop)
    let initialInventory = [...get().inventory];
    if (targetRoom === 'workshop' && !initialInventory.some(i => i.id === 'key_blank' || i.id === 'master_key')) {
      initialInventory.push(ALL_ITEMS.key_blank);
    }
    if (targetRoom === 'greenhouse' && !initialInventory.some(i => i.id === 'lunar_pollen' || i.id === 'floral_key')) {
      initialInventory.push(ALL_ITEMS.lunar_pollen);
    }

    set({
      gameMode: 'PLAYING',
      activeRoomId: targetRoom,
      cameraTarget: [0, 1.2, 0],
      inventory: initialInventory,
      hintLevel: 1,
      highlightedHotspotId: null,
      activePuzzle: null,
      toastMessage: `Entrando na ${ROOMS_DATA.find(r => r.id === targetRoom)?.name}...`,
    });

    setTimeout(() => set({ toastMessage: null }), 3000);
  },

  returnToMenu: () => {
    soundManager.playClick();
    soundManager.stopAmbientTone();
    set({ gameMode: 'MENU', activePuzzle: null, hintModalOpen: false });
  },

  setAgeProfile: (profile) => {
    soundManager.playClick();
    set({ ageProfile: profile });
    const state = get();
    saveManager.save({
      ageProfile: profile,
      activeRoomId: state.activeRoomId,
      completedRooms: state.completedRooms,
      solvedPuzzles: state.solvedPuzzles,
      stars: { workshop: 3, library: 3, greenhouse: 3 },
      inventoryItemIds: state.inventory.map(i => i.id),
      settings: state.settings,
      lastSavedAt: Date.now()
    });
  },

  setCameraMode: (mode) => {
    soundManager.playClick();
    set({ cameraMode: mode });
  },

  setCameraFocus: (target) => {
    set({ cameraTarget: target });
  },

  selectItem: (id) => {
    soundManager.playClick(520);
    set(state => ({
      selectedItemId: state.selectedItemId === id ? null : id
    }));
  },

  collectItem: (item) => {
    const { inventory } = get();
    if (inventory.some(i => i.id === item.id)) return;
    if (inventory.length >= 6) {
      get().showToast('Inventário cheio! Inspecione e use itens.');
      return;
    }

    soundManager.playChime(880);
    const updated = [...inventory, item];
    set({
      inventory: updated,
      toastMessage: `Você encontrou: ${item.name}!`,
    });

    setTimeout(() => {
      if (get().toastMessage?.includes(item.name)) {
        set({ toastMessage: null });
      }
    }, 3500);

    const state = get();
    saveManager.save({
      ageProfile: state.ageProfile,
      activeRoomId: state.activeRoomId,
      completedRooms: state.completedRooms,
      solvedPuzzles: state.solvedPuzzles,
      stars: { workshop: 3, library: 3, greenhouse: 3 },
      inventoryItemIds: updated.map(i => i.id),
      settings: state.settings,
      lastSavedAt: Date.now()
    });
  },

  inspectItem: (item) => {
    soundManager.playWoodSlide();
    set({ inspectingItem: item });
  },

  closeInspection: () => {
    soundManager.playClick();
    set({ inspectingItem: null });
  },

  combineItems: (id1, id2) => {
    const item1 = ALL_ITEMS[id1];
    const item2 = ALL_ITEMS[id2];
    if (!item1 || !item2) return false;

    if (item1.combinableWith?.includes(id2) && item1.combinationResult) {
      const resultItem = ALL_ITEMS[item1.combinationResult];
      if (resultItem) {
        soundManager.playPuzzleSolved();
        const currentInv = get().inventory.filter(i => i.id !== id1 && i.id !== id2);
        const newInv = [...currentInv, resultItem];

        set({
          inventory: newInv,
          selectedItemId: resultItem.id,
          inspectingItem: resultItem,
          toastMessage: item1.combinationMessage || `Itens combinados: ${resultItem.name}!`,
        });

        const state = get();
        saveManager.save({
          ageProfile: state.ageProfile,
          activeRoomId: state.activeRoomId,
          completedRooms: state.completedRooms,
          solvedPuzzles: state.solvedPuzzles,
          stars: { workshop: 3, library: 3, greenhouse: 3 },
          inventoryItemIds: newInv.map(i => i.id),
          settings: state.settings,
          lastSavedAt: Date.now()
        });
        return true;
      }
    }
    return false;
  },

  openPuzzle: (puzzle) => {
    soundManager.playWoodSlide();
    set({ activePuzzle: puzzle });
  },

  closePuzzle: () => {
    soundManager.playClick();
    set({ activePuzzle: null });
  },

  solvePuzzle: (puzzleId) => {
    soundManager.playPuzzleSolved();
    const { activeRoomId, solvedPuzzles, roomStates, activePuzzle } = get();
    const currentSolved = solvedPuzzles[activeRoomId] || [];

    if (!currentSolved.includes(puzzleId)) {
      const updatedSolved = {
        ...solvedPuzzles,
        [activeRoomId]: [...currentSolved, puzzleId]
      };

      // Check if reward item exists
      const targetPuzzle = activePuzzle || ROOMS_DATA.flatMap(r => r.puzzles).find(p => p.id === puzzleId);
      if (targetPuzzle?.rewardItem) {
        get().collectItem(targetPuzzle.rewardItem);
      }

      // Update room state
      const updatedRoomStates = { ...roomStates };
      if (puzzleId === 'ws_symbol_lock') updatedRoomStates.workshop.chestOpen = true;
      if (puzzleId === 'ws_gear_train') {
        updatedRoomStates.workshop.gearsPlaced = [true, true, true];
        updatedRoomStates.workshop.laserActive = true;
      }
      if (puzzleId === 'ws_light_beam') updatedRoomStates.workshop.mirrorsAligned = true;
      if (puzzleId === 'lib_book_order') updatedRoomStates.library.booksOrdered = true;
      if (puzzleId === 'lib_constellation') updatedRoomStates.library.globeAligned = true;
      if (puzzleId === 'lib_sound_sequence') updatedRoomStates.library.bellsPlayed = true;
      if (puzzleId === 'bot_seed_balance') updatedRoomStates.greenhouse.scaleBalanced = true;
      if (puzzleId === 'bot_water_circuit') updatedRoomStates.greenhouse.pipesConnected = true;
      if (puzzleId === 'bot_color_mixing') updatedRoomStates.greenhouse.sunlightFiltered = true;

      set({
        solvedPuzzles: updatedSolved,
        roomStates: updatedRoomStates,
        toastMessage: `Enigma resolvido: ${activePuzzle?.title || 'Parabéns!'}!`,
        highlightedHotspotId: null,
      });

      setTimeout(() => set({ toastMessage: null }), 3500);

      // Save progress
      const state = get();
      saveManager.save({
        ageProfile: state.ageProfile,
        activeRoomId: state.activeRoomId,
        completedRooms: state.completedRooms,
        solvedPuzzles: updatedSolved,
        stars: { workshop: 3, library: 3, greenhouse: 3 },
        inventoryItemIds: state.inventory.map(i => i.id),
        settings: state.settings,
        lastSavedAt: Date.now()
      });
    }

    // Check if exit should open
    const roomPuzzlesCount = ROOMS_DATA.find(r => r.id === activeRoomId)?.puzzles.length || 4;
    const solvedCount = (solvedPuzzles[activeRoomId] || []).length + 1;

    if (solvedCount >= roomPuzzlesCount - 1) {
      // Final puzzle unlocked
      get().showToast('Todos os mecanismos foram ativados! Use a chave na Saída!');
    }
  },

  openHintModal: () => {
    soundManager.playHintSparkle();
    set({ hintModalOpen: true });
  },

  closeHintModal: () => {
    soundManager.playClick();
    set({ hintModalOpen: false });
  },

  requestNextHint: () => {
    soundManager.playHintSparkle();
    const current = get().hintLevel;
    const next = Math.min(4, current + 1);

    // Highlight target hotspot if level 3 or 4
    const { activeRoomId, solvedPuzzles } = get();
    const room = ROOMS_DATA.find(r => r.id === activeRoomId);
    const solved = solvedPuzzles[activeRoomId] || [];
    const unsolvedPuzzle = room?.puzzles.find(p => !solved.includes(p.id));

    set({
      hintLevel: next,
      highlightedHotspotId: next >= 3 && unsolvedPuzzle ? unsolvedPuzzle.hints.hotspotId : null
    });
  },

  unlockRoomExit: () => {
    soundManager.playVictoryFanfare();
    const { activeRoomId, completedRooms, roomStates } = get();
    
    // Confetti celebration for wow factor
    if (typeof document !== 'undefined') {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    const updatedCompleted = completedRooms.includes(activeRoomId)
      ? completedRooms
      : [...completedRooms, activeRoomId];

    const updatedStates = { ...roomStates };
    if (activeRoomId === 'workshop') updatedStates.workshop.doorOpen = true;
    if (activeRoomId === 'library') updatedStates.library.doorOpen = true;
    if (activeRoomId === 'greenhouse') updatedStates.greenhouse.gateOpen = true;

    set({
      gameMode: 'ROOM_SOLVED',
      completedRooms: updatedCompleted,
      roomStates: updatedStates,
      toastMessage: 'Fantástico! Você resolveu o mistério da sala!',
    });

    const state = get();
    saveManager.save({
      ageProfile: state.ageProfile,
      activeRoomId: state.activeRoomId,
      completedRooms: updatedCompleted,
      solvedPuzzles: state.solvedPuzzles,
      stars: { workshop: 3, library: 3, greenhouse: 3 },
      inventoryItemIds: state.inventory.map(i => i.id),
      settings: state.settings,
      lastSavedAt: Date.now()
    });
  },

  nextRoom: () => {
    soundManager.playClick();
    const rooms: ('workshop' | 'library' | 'greenhouse')[] = ['workshop', 'library', 'greenhouse'];
    const currentIndex = rooms.indexOf(get().activeRoomId);
    const nextRoomId = rooms[(currentIndex + 1) % rooms.length];
    get().startGame(nextRoomId);
  },

  updateSettings: (newSettings) => {
    soundManager.playClick();
    const updated = { ...get().settings, ...newSettings };
    soundManager.setMuted(updated.isMuted);
    soundManager.setVolume(updated.soundVolume);
    set({ settings: updated });

    const state = get();
    saveManager.save({
      ageProfile: state.ageProfile,
      activeRoomId: state.activeRoomId,
      completedRooms: state.completedRooms,
      solvedPuzzles: state.solvedPuzzles,
      stars: { workshop: 3, library: 3, greenhouse: 3 },
      inventoryItemIds: state.inventory.map(i => i.id),
      settings: updated,
      lastSavedAt: Date.now()
    });
  },

  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) {
        set({ toastMessage: null });
      }
    }, 3500);
  },

  resetAllProgress: async () => {
    soundManager.playClick();
    const fresh = await saveManager.resetProgress();
    set({
      completedRooms: fresh.completedRooms,
      solvedPuzzles: fresh.solvedPuzzles,
      inventory: [],
      selectedItemId: null,
      inspectingItem: null,
      activePuzzle: null,
      hintLevel: 1,
      highlightedHotspotId: null,
      toastMessage: 'Progresso reiniciado com sucesso!',
    });
    setTimeout(() => set({ toastMessage: null }), 3000);
  }
}));
