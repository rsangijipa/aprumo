import { counterbalancedPositions, seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig } from '@aprumo/protocol';

export interface AdlStep {
  id: string;
  stepNum: number;
  label: string;
  icon: string;
  art?: string;
}

export interface AdlMission {
  id: string;
  title: string;
  steps: AdlStep[];
}

export const ADL_MISSIONS: AdlMission[] = [
  {
    id: 'lavar-maos',
    title: 'Missão: Lavar as Mãos!',
    steps: [
      { id: 'lm-1', stepNum: 1, label: 'Abrir a torneira', icon: '🚰' },
      { id: 'lm-2', stepNum: 2, label: 'Passar o sabonete', icon: '🧼' },
      { id: 'lm-3', stepNum: 3, label: 'Esfregar as mãos', icon: '🤲' },
      { id: 'lm-4', stepNum: 4, label: 'Secar na toalha', icon: '🧺' },
    ],
  },
  {
    id: 'calcar-tenis',
    title: 'Missão: Calçar o Tênis!',
    steps: [
      { id: 'ct-1', stepNum: 1, label: 'Colocar a meia', icon: '🧦' },
      { id: 'ct-2', stepNum: 2, label: 'Calçar o tênis', icon: '👟', art: 'sapato' },
      { id: 'ct-3', stepNum: 3, label: 'Apertar o velcro', icon: '✨' },
    ],
  },
  {
    id: 'escovar-dentes',
    title: 'Missão: Escovar os Dentes!',
    steps: [
      { id: 'ed-1', stepNum: 1, label: 'Passar a pasta', icon: '🧴' },
      { id: 'ed-2', stepNum: 2, label: 'Escovar os dentes', icon: '🪥', art: 'escova' },
      { id: 'ed-3', stepNum: 3, label: 'Enxaguar a boquinha', icon: '💧', art: 'copo' },
    ],
  },
];

export const ADL_DISTRACTORS: AdlStep[] = [
  { id: 'dist-1', stepNum: 99, label: 'Jogar bola', icon: '⚽' },
  { id: 'dist-2', stepNum: 99, label: 'Dormir na cama', icon: '🛏️' },
  { id: 'dist-3', stepNum: 99, label: 'Brincar de carrinho', icon: '🚗' },
];

export interface PlannedAdlTrial {
  stepNum: number;
  missionId: string;
  targetStep: AdlStep;
  options: AdlStep[];
  positionOfTarget: number;
}

export function planMissionTrials(config: SessionConfig, missionIndex = 0): PlannedAdlTrial[] {
  const rnd = seededRandom(config.clinical.seed);
  const mission = ADL_MISSIONS[missionIndex % ADL_MISSIONS.length]!;
  const numChoices = Math.max(2, Math.min(config.adaptation.maxChoices, 3));
  const positions = counterbalancedPositions(mission.steps.length, numChoices, rnd);

  return mission.steps.map((step, idx) => {
    const pos = positions[idx] ?? 0;
    const distractors = shuffle(ADL_DISTRACTORS, rnd).slice(0, numChoices - 1);
    const options = [...distractors];
    options.splice(pos, 0, step);

    return {
      stepNum: step.stepNum,
      missionId: mission.id,
      targetStep: step,
      options,
      positionOfTarget: pos,
    };
  });
}
