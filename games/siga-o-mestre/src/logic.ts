export type MasterActionId = 'palma' | 'pular' | 'rodar' | 'acenar';

export interface MasterActionMeta {
  id: MasterActionId;
  label: string;
  emoji: string;
  verbPhrase: string; // e.g. "bater palmas"
}

export const ACTIONS: Record<MasterActionId, MasterActionMeta> = {
  palma: {
    id: 'palma',
    label: 'Bater Palmas',
    emoji: '👏',
    verbPhrase: 'bater palmas',
  },
  pular: {
    id: 'pular',
    label: 'Pular',
    emoji: '🦘',
    verbPhrase: 'pular bem alto',
  },
  rodar: {
    id: 'rodar',
    label: 'Girar',
    emoji: '🔄',
    verbPhrase: 'dar uma volta',
  },
  acenar: {
    id: 'acenar',
    label: 'Acenar',
    emoji: '👋',
    verbPhrase: 'dar um tchauzinho',
  },
};

export const ALL_ACTION_IDS: MasterActionId[] = ['palma', 'pular', 'rodar', 'acenar'];

export type CommandKind = 'valid' | 'trick';

export interface MasterTrial {
  trialIndex: number;
  kind: CommandKind;
  level: number;
  targets: MasterActionId[];
  verbalCommand: string;
  displayedOptions: MasterActionId[];
  inhibitionWindowMs: number;
}

/** Generates deterministic trial based on roundIndex and level */
export function generateMasterTrial(roundIndex: number, level: number): MasterTrial {
  // ~35% of trials are trick/inhibition trials, distributed predictably
  const isTrick = roundIndex % 3 === 2;
  const kind: CommandKind = isTrick ? 'trick' : 'valid';

  const action1 = ALL_ACTION_IDS[roundIndex % ALL_ACTION_IDS.length] ?? 'palma';
  const action2 = ALL_ACTION_IDS[(roundIndex + 1) % ALL_ACTION_IDS.length] ?? 'pular';

  const isLevel2 = level >= 2;
  const targets: MasterActionId[] = isLevel2 && !isTrick ? [action1, action2] : [action1];

  let verbalCommand: string;
  const target0 = targets[0] ?? 'palma';
  const target1 = targets[1] ?? 'pular';

  if (kind === 'valid') {
    if (targets.length === 2) {
      verbalCommand = `O mestre mandou ${ACTIONS[target0].verbPhrase} e depois ${ACTIONS[target1].verbPhrase}!`;
    } else {
      verbalCommand = `O mestre mandou ${ACTIONS[target0].verbPhrase}!`;
    }
  } else {
    // Trick command: direct imperative WITHOUT "O mestre mandou"
    verbalCommand = `Rápido, ${ACTIONS[target0].verbPhrase}!`;
  }

  return {
    trialIndex: roundIndex,
    kind,
    level,
    targets,
    verbalCommand,
    displayedOptions: ALL_ACTION_IDS,
    inhibitionWindowMs: 3000,
  };
}

export type TapResult =
  | { outcome: 'inhibition_failed'; message: string }
  | { outcome: 'valid_partial'; nextStepIndex: number; message: string }
  | { outcome: 'valid_complete'; message: string }
  | { outcome: 'wrong_action'; message: string };

/** Evaluates the tap response on an action card */
export function evaluateTap(
  trial: MasterTrial,
  tappedId: MasterActionId,
  currentStepIndex: number
): TapResult {
  // If it was a trick command, ANY tap is a failure of inhibition!
  if (trial.kind === 'trick') {
    return {
      outcome: 'inhibition_failed',
      message: 'Pegadinha! O mestre não mandou! Você tinha que ficar parado!',
    };
  }

  const expectedAction = trial.targets[currentStepIndex] ?? trial.targets[0] ?? 'palma';
  if (tappedId !== expectedAction) {
    return {
      outcome: 'wrong_action',
      message: `Ação errada! O mestre mandou ${ACTIONS[expectedAction].verbPhrase}.`,
    };
  }

  // Action was correct for current step
  const nextStepIndex = currentStepIndex + 1;
  if (nextStepIndex >= trial.targets.length) {
    return {
      outcome: 'valid_complete',
      message: 'Muito bem! Você seguiu o mestre direitinho!',
    };
  }

  const nextAction = trial.targets[nextStepIndex] ?? 'palma';
  return {
    outcome: 'valid_partial',
    nextStepIndex,
    message: `Muito bem! Agora ${ACTIONS[nextAction].verbPhrase}!`,
  };
}

/** Evaluates the outcome when the 3-second timer expires without any taps */
export function evaluateTimeout(
  trial: MasterTrial
): { success: boolean; response: 'correct' | 'no_response'; message: string } {
  if (trial.kind === 'trick') {
    // Child successfully inhibited response!
    return {
      success: true,
      response: 'correct',
      message: 'Excelente! O mestre não mandou e você segurou a vontade como uma estátua!',
    };
  }

  // Child did not respond to a valid instruction
  return {
    success: false,
    response: 'no_response',
    message: 'O tempo acabou! Quando o mestre mandar, tem que fazer!',
  };
}
