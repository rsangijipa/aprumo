import { seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig } from '@aprumo/protocol';

export interface StoryStep {
  id: string;
  stepNumber: number; // 1, 2, 3
  label: string;
  icon: string;
  art?: string;
}

export interface StorySequence {
  id: string;
  title: string;
  steps: StoryStep[];
}

export const STORIES: StorySequence[] = [
  {
    id: 'plantar-flor',
    title: 'Como a plantinha cresce?',
    steps: [
      { id: 'pf-1', stepNumber: 1, label: '1. Plantar a semente', icon: '🌱' },
      { id: 'pf-2', stepNumber: 2, label: '2. Regar com água', icon: '💧' },
      { id: 'pf-3', stepNumber: 3, label: '3. A flor nasceu!', icon: '🌸', art: 'flor' },
    ],
  },
  {
    id: 'rotina-manha',
    title: 'O que fazemos de manhã?',
    steps: [
      { id: 'rm-1', stepNumber: 1, label: '1. Acordar na cama', icon: '🛏️' },
      { id: 'rm-2', stepNumber: 2, label: '2. Escovar os dentes', icon: '🪥', art: 'escova' },
      { id: 'rm-3', stepNumber: 3, label: '3. Vestir a roupa', icon: '👕', art: 'camisa' },
    ],
  },
  {
    id: 'comer-fruta',
    title: 'Hora de comer a fruta!',
    steps: [
      { id: 'cf-1', stepNumber: 1, label: '1. Pegar a banana', icon: '🍌', art: 'banana' },
      { id: 'cf-2', stepNumber: 2, label: '2. Descascar', icon: '👐' },
      { id: 'cf-3', stepNumber: 3, label: '3. Comer o lanche', icon: '😋' },
    ],
  },
];

export interface PlannedStoryTrial {
  index: number;
  story: StorySequence;
  shuffledSteps: StoryStep[];
}

export function planStoryTrials(config: SessionConfig): PlannedStoryTrial[] {
  const rnd = seededRandom(config.clinical.seed);
  return STORIES.map((story, index) => {
    return {
      index,
      story,
      shuffledSteps: shuffle([...story.steps], rnd),
    };
  });
}
