import { counterbalancedPositions, seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig, StimulusRef } from '@aprumo/protocol';

export interface RecipeStep {
  stepIndex: number;
  item: StimulusRef;
  instruction: string;
}

export const RECIPE_STEPS: RecipeStep[] = [
  { stepIndex: 0, item: { stimulusId: 'maca', label: 'Maçã', art: 'maca' }, instruction: 'Coloque a maçã na tigela' },
  { stepIndex: 1, item: { stimulusId: 'banana', label: 'Banana', art: 'banana' }, instruction: 'Coloque a banana na tigela' },
  { stepIndex: 2, item: { stimulusId: 'uva', label: 'Uva', art: 'uva' }, instruction: 'Coloque a uva na tigela' },
  { stepIndex: 3, item: { stimulusId: 'colher', label: 'Colher', art: 'colher' }, instruction: 'Misture tudo com a colher!' },
];

export const CHEF_DISTRACTORS: StimulusRef[] = [
  { stimulusId: 'sapato', label: 'Sapato', art: 'sapato' },
  { stimulusId: 'carro', label: 'Carro', art: 'carro' },
  { stimulusId: 'bola', label: 'Bola', art: 'bola' },
  { stimulusId: 'livro', label: 'Livro', art: 'livro' },
];

export interface PlannedChefTrial {
  stepIndex: number;
  instruction: string;
  targetItem: StimulusRef;
  options: StimulusRef[];
  positionOfTarget: number;
}

export function planChefTrials(config: SessionConfig): PlannedChefTrial[] {
  const rnd = seededRandom(config.clinical.seed);
  const numChoices = Math.max(2, Math.min(config.adaptation.maxChoices, 4));
  const positions = counterbalancedPositions(RECIPE_STEPS.length, numChoices, rnd);

  return RECIPE_STEPS.map((step, i) => {
    const pos = positions[i] ?? 0;
    const availableDistractors = CHEF_DISTRACTORS.filter((d) => d.stimulusId !== step.item.stimulusId);
    const chosenDistractors = shuffle(availableDistractors, rnd).slice(0, numChoices - 1);

    const options = [...chosenDistractors];
    options.splice(pos, 0, step.item);

    return {
      stepIndex: step.stepIndex,
      instruction: step.instruction,
      targetItem: step.item,
      options,
      positionOfTarget: pos,
    };
  });
}
