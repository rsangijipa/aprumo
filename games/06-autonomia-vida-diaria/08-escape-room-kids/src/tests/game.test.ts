// ==========================================================================
// ESCAPE ROOM KIDS — UNIT & INTEGRATION TESTS
// Tests State Machine, Inventory Management, Puzzle Resolutions, Combinations, and Room Progress
// ==========================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../state/gameStore';
import { ALL_ITEMS, ROOMS_DATA } from '../game/roomsData';

describe('Escape Room Kids — Game Logic Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGameStore.setState({
      gameMode: 'MENU',
      ageProfile: '9+',
      activeRoomId: 'workshop',
      completedRooms: [],
      inventory: [],
      selectedItemId: null,
      inspectingItem: null,
      activePuzzle: null,
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
        },
      },
    });
  });

  it('initializes with 3 thematic rooms and at least 4 puzzles each', () => {
    expect(ROOMS_DATA.length).toBe(3);
    ROOMS_DATA.forEach((room) => {
      expect(room.puzzles.length).toBeGreaterThanOrEqual(4);
      expect(room.hotspots.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('allows starting a room and transitions state machine to PLAYING', () => {
    const { startGame } = useGameStore.getState();
    startGame('workshop');

    const state = useGameStore.getState();
    expect(state.gameMode).toBe('PLAYING');
    expect(state.activeRoomId).toBe('workshop');
    expect(state.inventory.some((i) => i.id === 'key_blank')).toBe(true);
  });

  it('manages 6-slot inventory correctly and prevents overflow', () => {
    const { collectItem } = useGameStore.getState();

    // Collect 6 items
    collectItem(ALL_ITEMS.gear_brass);
    collectItem(ALL_ITEMS.key_blank);
    collectItem(ALL_ITEMS.spring_clockwork);
    collectItem(ALL_ITEMS.astrolabe_dial);
    collectItem(ALL_ITEMS.magnifier);
    collectItem(ALL_ITEMS.scroll_fragment);

    expect(useGameStore.getState().inventory.length).toBe(6);

    // 7th item should not overflow
    collectItem(ALL_ITEMS.crystal_lens);
    expect(useGameStore.getState().inventory.length).toBe(6);
  });

  it('successfully combines compatible items in 3D inventory', () => {
    const { collectItem, combineItems } = useGameStore.getState();

    collectItem(ALL_ITEMS.key_blank);
    collectItem(ALL_ITEMS.spring_clockwork);

    const success = combineItems('key_blank', 'spring_clockwork');
    expect(success).toBe(true);

    const inventory = useGameStore.getState().inventory;
    expect(inventory.some((i) => i.id === 'master_key')).toBe(true);
    expect(inventory.some((i) => i.id === 'key_blank')).toBe(false);
    expect(inventory.some((i) => i.id === 'spring_clockwork')).toBe(false);
  });

  it('solves puzzles deterministically and updates room state', () => {
    const { startGame, solvePuzzle } = useGameStore.getState();
    startGame('workshop');

    // Solve chest symbol lock
    solvePuzzle('ws_symbol_lock');

    const state = useGameStore.getState();
    expect(state.solvedPuzzles.workshop).toContain('ws_symbol_lock');
    expect(state.roomStates.workshop.chestOpen).toBe(true);
    expect(state.inventory.some((i) => i.id === 'gear_brass')).toBe(true);
  });

  it('unlocks exit door, triggers celebration and transitions to ROOM_SOLVED', () => {
    const { startGame, unlockRoomExit } = useGameStore.getState();
    startGame('workshop');

    unlockRoomExit();

    const state = useGameStore.getState();
    expect(state.gameMode).toBe('ROOM_SOLVED');
    expect(state.completedRooms).toContain('workshop');
    expect(state.roomStates.workshop.doorOpen).toBe(true);
  });

  it('progresses layered hints smoothly up to level 4 and highlights target hotspot', () => {
    const { startGame, requestNextHint } = useGameStore.getState();
    startGame('workshop');

    expect(useGameStore.getState().hintLevel).toBe(1);

    requestNextHint();
    expect(useGameStore.getState().hintLevel).toBe(2);

    requestNextHint();
    expect(useGameStore.getState().hintLevel).toBe(3);
    // At level 3, the target hotspot for the unsolved puzzle is highlighted
    expect(useGameStore.getState().highlightedHotspotId).toBe('ws_chest');

    requestNextHint();
    expect(useGameStore.getState().hintLevel).toBe(4);
  });
});
