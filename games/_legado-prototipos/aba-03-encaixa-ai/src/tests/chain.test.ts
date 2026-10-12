import { describe, it, expect } from 'vitest';
import {
  createChainState,
  setupChainedPieces,
  evaluateChainCompletion,
  evaluateChainFailure,
} from '../utils/chain';
import type { PuzzlePieceDef } from '../types/puzzle';

const mockPieces: PuzzlePieceDef[] = [
  {
    id: 'p1',
    name: 'Peça 1',
    color: '#E63946',
    accentColor: '#FFCCD5',
    pathD: 'M 0 0',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    targetX: 100,
    targetY: 100,
    targetAngle: 0,
    pegPosition: { x: 50, y: 50 },
  },
  {
    id: 'p2',
    name: 'Peça 2',
    color: '#457B9D',
    accentColor: '#A8DADC',
    pathD: 'M 0 0',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    targetX: 250,
    targetY: 100,
    targetAngle: 0,
    pegPosition: { x: 50, y: 50 },
  },
  {
    id: 'p3',
    name: 'Peça 3',
    color: '#2A9D8F',
    accentColor: '#E9C46A',
    pathD: 'M 0 0',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    targetX: 400,
    targetY: 100,
    targetAngle: 0,
    pegPosition: { x: 50, y: 50 },
  },
  {
    id: 'p4',
    name: 'Peça 4',
    color: '#F4A261',
    accentColor: '#E76F51',
    pathD: 'M 0 0',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    targetX: 550,
    targetY: 100,
    targetAngle: 0,
    pegPosition: { x: 50, y: 50 },
  },
];

describe('ABA-03: Chain Engine (chain.ts)', () => {
  it('initializes backward chaining with k=1 (N-k already placed)', () => {
    const state = createChainState(4, 'reverso', 1);
    expect(state.k).toBe(1);
    expect(state.chainType).toBe('reverso');

    const setup = setupChainedPieces(mockPieces, state);
    // Total is 4, k is 1. N - k = 3 pieces already placed on board
    expect(setup.boardPieces.length).toBe(3);
    expect(setup.boardPieces.map((p) => p.pieceId)).toEqual(['p1', 'p2', 'p3']);
    // Remaining 1 piece in tray for child
    expect(setup.trayPieceIds).toEqual(['p4']);
  });

  it('advances k after 3 consecutive independent completions in backward chaining', () => {
    let state = createChainState(4, 'reverso', 1);

    // Completion 1
    let result = evaluateChainCompletion(state, true);
    expect(result.nextState.k).toBe(1);
    expect(result.nextState.consecutiveIndependentSuccesses).toBe(1);
    expect(result.kChanged).toBe(false);

    // Completion 2
    result = evaluateChainCompletion(result.nextState, true);
    expect(result.nextState.k).toBe(1);
    expect(result.nextState.consecutiveIndependentSuccesses).toBe(2);
    expect(result.kChanged).toBe(false);

    // Completion 3 -> Should advance k to 2
    result = evaluateChainCompletion(result.nextState, true);
    expect(result.nextState.k).toBe(2);
    expect(result.nextState.consecutiveIndependentSuccesses).toBe(0);
    expect(result.kChanged).toBe(true);
    expect(result.action).toBe('advance');

    // In k=2, N - k = 2 pieces already placed, 2 in tray for child
    const setup = setupChainedPieces(mockPieces, result.nextState);
    expect(setup.boardPieces.length).toBe(2);
    expect(setup.boardPieces.map((p) => p.pieceId)).toEqual(['p1', 'p2']);
    expect(setup.trayPieceIds).toEqual(['p3', 'p4']);
  });

  it('resets independent streak if completion was guided by prompt', () => {
    let state = createChainState(4, 'reverso', 1);
    state = evaluateChainCompletion(state, true).nextState;
    state = evaluateChainCompletion(state, true).nextState;
    expect(state.consecutiveIndependentSuccesses).toBe(2);

    // Guided trial (wasIndependent: false)
    const result = evaluateChainCompletion(state, false);
    expect(result.nextState.k).toBe(1);
    expect(result.nextState.consecutiveIndependentSuccesses).toBe(0);
  });

  it('regresses k after 2 consecutive failures at the same k', () => {
    let state = createChainState(4, 'reverso', 3);
    expect(state.k).toBe(3);

    // Failure 1
    let result = evaluateChainFailure(state);
    expect(result.nextState.k).toBe(3);
    expect(result.nextState.consecutiveFailures).toBe(1);
    expect(result.kChanged).toBe(false);

    // Failure 2 -> Should regress k to 2
    result = evaluateChainFailure(result.nextState);
    expect(result.nextState.k).toBe(2);
    expect(result.nextState.consecutiveFailures).toBe(0);
    expect(result.kChanged).toBe(true);
    expect(result.action).toBe('regress');
  });

  it('does not regress k below 1', () => {
    let state = createChainState(4, 'reverso', 1);
    state = evaluateChainFailure(state).nextState;
    state = evaluateChainFailure(state).nextState;
    expect(state.k).toBe(1);
  });

  it('handles forward chaining (child starts first k pieces)', () => {
    const state = createChainState(4, 'direto', 2);
    const setup = setupChainedPieces(mockPieces, state);
    // Board starts empty, child receives first 2 pieces
    expect(setup.boardPieces.length).toBe(0);
    expect(setup.trayPieceIds).toEqual(['p1', 'p2']);
  });

  it('handles total task (all pieces in tray)', () => {
    const state = createChainState(4, 'tarefa_total', 1);
    expect(state.k).toBe(4);
    const setup = setupChainedPieces(mockPieces, state);
    expect(setup.boardPieces.length).toBe(0);
    expect(setup.trayPieceIds.length).toBe(4);
  });
});
