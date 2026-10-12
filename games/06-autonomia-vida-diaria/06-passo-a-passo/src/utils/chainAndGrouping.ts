import type { TaskAnalysisStep, ChainMode } from '../types/routine';

/**
 * Groups adjacent mastered steps that have `groupWithNext: true`.
 * Fades visual prompt support for mastered skills while preserving task sequence.
 */
export function groupMasteredSteps(steps: TaskAnalysisStep[]): TaskAnalysisStep[] {
  if (steps.length <= 1) return [...steps];

  const result: TaskAnalysisStep[] = [];
  let i = 0;

  while (i < steps.length) {
    const current = steps[i];

    if (current.isMastered && current.groupWithNext && i + 1 < steps.length && steps[i + 1].isMastered) {
      // Merge current with subsequent mastered step(s)
      const next = steps[i + 1];
      const merged: TaskAnalysisStep = {
        stepId: `${current.stepId}+${next.stepId}`,
        order: result.length + 1,
        title: `${current.title} e ${next.title}`,
        shortInstruction: `${current.shortInstruction} Depois, ${next.shortInstruction.toLowerCase()}`,
        detailDescription: `${current.detailDescription} Em seguida, ${next.detailDescription.toLowerCase()}`,
        iconEmoji: `${current.iconEmoji} ${next.iconEmoji}`,
        color: current.color,
        isMastered: true,
      };
      result.push(merged);
      i += 2;
    } else {
      result.push({
        ...current,
        order: result.length + 1,
      });
      i += 1;
    }
  }

  return result;
}

/**
 * Determines which step is the active target for the learner based on chain mode and k.
 */
export function getActiveStepTarget(
  totalSteps: number,
  mode: ChainMode,
  k: number
): {
  targetIndices: number[]; // 0-indexed steps that the learner must perform
  autoCompletedIndices: number[]; // 0-indexed steps pre-completed by caregiver
} {
  const safeK = Math.max(1, Math.min(totalSteps, k));

  if (mode === 'tarefa_total') {
    return {
      targetIndices: Array.from({ length: totalSteps }, (_, idx) => idx),
      autoCompletedIndices: [],
    };
  }

  if (mode === 'reverso') {
    // Backward chaining: N - k already completed, child does the last k steps
    const autoCount = totalSteps - safeK;
    const autoIndices = Array.from({ length: autoCount }, (_, idx) => idx);
    const targetIndices = Array.from({ length: safeK }, (_, idx) => autoCount + idx);
    return {
      targetIndices,
      autoCompletedIndices: autoIndices,
    };
  }

  // mode === 'direto'
  // Forward chaining: Child does the first k steps, rest are supported by caregiver
  const targetIndices = Array.from({ length: safeK }, (_, idx) => idx);
  const autoIndices = Array.from({ length: totalSteps - safeK }, (_, idx) => safeK + idx);
  return {
    targetIndices,
    autoCompletedIndices: autoIndices,
  };
}
