import type { ChainType, PuzzlePieceDef, PlacedPieceState } from '../types/puzzle';

export interface ChainState {
  chainType: ChainType;
  totalPieces: number;
  k: number; // number of pieces targeted for the child (1 to totalPieces)
  consecutiveIndependentSuccesses: number;
  consecutiveFailures: number;
  successThreshold: number; // default 3
  failureThreshold: number; // default 2
}

/**
 * Initializes a new ChainState.
 */
export function createChainState(
  totalPieces: number,
  chainType: ChainType = 'reverso',
  initialK: number = 1,
  successThreshold: number = 3,
  failureThreshold: number = 2
): ChainState {
  const safeK = chainType === 'tarefa_total' 
    ? totalPieces 
    : Math.max(1, Math.min(totalPieces, initialK));

  return {
    chainType,
    totalPieces,
    k: safeK,
    consecutiveIndependentSuccesses: 0,
    consecutiveFailures: 0,
    successThreshold,
    failureThreshold,
  };
}

/**
 * Given the current chain state and the puzzle's pieces,
 * calculates which pieces should already be placed on the board
 * and which pieces should remain in the tray for the child.
 */
export function setupChainedPieces(
  pieces: PuzzlePieceDef[],
  chainState: ChainState
): {
  boardPieces: PlacedPieceState[];
  trayPieceIds: string[];
} {
  const total = pieces.length;
  const k = Math.min(total, Math.max(1, chainState.k));

  if (chainState.chainType === 'tarefa_total') {
    // Child must place all pieces
    return {
      boardPieces: [],
      trayPieceIds: pieces.map((p) => p.id),
    };
  }

  if (chainState.chainType === 'reverso') {
    // Backward chaining: N - k pieces are already placed.
    // Child places the LAST k pieces.
    const autoPlacedCount = total - k;
    const autoPlacedPieces = pieces.slice(0, autoPlacedCount);
    const childPieces = pieces.slice(autoPlacedCount);

    const boardPieces: PlacedPieceState[] = autoPlacedPieces.map((p) => ({
      pieceId: p.id,
      isPlaced: true,
      placedBy: 'chain_auto',
      currentX: p.targetX,
      currentY: p.targetY,
      currentAngle: p.targetAngle,
      attempts: 0,
      rotationsUsed: 0,
    }));

    return {
      boardPieces,
      trayPieceIds: childPieces.map((p) => p.id),
    };
  }

  // chainType === 'direto'
  // Forward chaining: Child places the FIRST k pieces.
  // The rest (pieces.slice(k)) are empty initially; when child completes k, rest will be auto-placed.
  const childPieces = pieces.slice(0, k);

  return {
    boardPieces: [],
    trayPieceIds: childPieces.map((p) => p.id),
  };
}

export interface ChainProgressionResult {
  nextState: ChainState;
  kChanged: boolean;
  action: 'advance' | 'regress' | 'maintain';
}

/**
 * Evaluates completion of a puzzle trial session.
 * Advances k after 3 consecutive independent successes (or configured threshold).
 */
export function evaluateChainCompletion(
  currentState: ChainState,
  wasIndependent: boolean
): ChainProgressionResult {
  if (currentState.chainType === 'tarefa_total') {
    return {
      nextState: {
        ...currentState,
        consecutiveFailures: 0,
      },
      kChanged: false,
      action: 'maintain',
    };
  }

  if (!wasIndependent) {
    // Success with prompts resets the independent success streak
    return {
      nextState: {
        ...currentState,
        consecutiveIndependentSuccesses: 0,
        consecutiveFailures: 0,
      },
      kChanged: false,
      action: 'maintain',
    };
  }

  const newSuccessCount = currentState.consecutiveIndependentSuccesses + 1;
  if (newSuccessCount >= currentState.successThreshold) {
    const nextK = Math.min(currentState.totalPieces, currentState.k + 1);
    const kChanged = nextK !== currentState.k;
    return {
      nextState: {
        ...currentState,
        k: nextK,
        consecutiveIndependentSuccesses: 0,
        consecutiveFailures: 0,
      },
      kChanged,
      action: kChanged ? 'advance' : 'maintain',
    };
  }

  return {
    nextState: {
      ...currentState,
      consecutiveIndependentSuccesses: newSuccessCount,
      consecutiveFailures: 0,
    },
    kChanged: false,
    action: 'maintain',
  };
}

/**
 * Evaluates failure on a puzzle trial session.
 * Regresses k after 2 consecutive failures at the same k (or configured threshold).
 */
export function evaluateChainFailure(currentState: ChainState): ChainProgressionResult {
  if (currentState.chainType === 'tarefa_total') {
    return {
      nextState: {
        ...currentState,
        consecutiveIndependentSuccesses: 0,
      },
      kChanged: false,
      action: 'maintain',
    };
  }

  const newFailureCount = currentState.consecutiveFailures + 1;
  if (newFailureCount >= currentState.failureThreshold) {
    const nextK = Math.max(1, currentState.k - 1);
    const kChanged = nextK !== currentState.k;
    return {
      nextState: {
        ...currentState,
        k: nextK,
        consecutiveFailures: 0,
        consecutiveIndependentSuccesses: 0,
      },
      kChanged,
      action: kChanged ? 'regress' : 'maintain',
    };
  }

  return {
    nextState: {
      ...currentState,
      consecutiveFailures: newFailureCount,
      consecutiveIndependentSuccesses: 0,
    },
    kChanged: false,
    action: 'maintain',
  };
}
