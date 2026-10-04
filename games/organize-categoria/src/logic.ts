import { counterbalancedPositions, seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig, StimulusRef, TargetConfig } from '@aprumo/protocol';
import { STIMULUS_ART } from '@aprumo/stimuli';

export interface CategoryBox {
  id: string;
  label: string;
  icon: string;
}

export const KNOWN_CATEGORIES: Record<string, CategoryBox> = {
  alimentos: { id: 'alimentos', label: 'Comidas', icon: '🍎' },
  animais: { id: 'animais', label: 'Bichinhos', icon: '🐶' },
  veículos: { id: 'veículos', label: 'Veículos', icon: '🚗' },
  roupas: { id: 'roupas', label: 'Roupas', icon: '👕' },
  brinquedos: { id: 'brinquedos', label: 'Brinquedos', icon: '⚽' },
  casa: { id: 'casa', label: 'Casa', icon: '🏠' },
};

export interface PlannedCategoryTrial {
  index: number;
  target: TargetConfig;
  item: StimulusRef;
  correctCategory: CategoryBox;
  boxes: CategoryBox[];
  options: StimulusRef[];
  positionOfTarget: number;
  instruction: string;
}

export function getCategoryForItem(artKey: string): CategoryBox {
  const meta = STIMULUS_ART[artKey];
  const catKey = meta?.category ?? 'casa';
  return KNOWN_CATEGORIES[catKey] ?? { id: catKey, label: catKey, icon: '📦' };
}

export function planCategoryTrials(config: SessionConfig): PlannedCategoryTrial[] {
  const rnd = seededRandom(config.clinical.seed);
  const { trialsPerTarget } = config.clinical;

  const trials: PlannedCategoryTrial[] = [];
  let globalIndex = 0;

  for (const target of config.clinical.targets) {
    const item = target.stimulus;
    const correctCat = getCategoryForItem(item.art);

    // Selecionar outras categorias como distratores
    const otherCats = Object.values(KNOWN_CATEGORIES).filter((c) => c.id !== correctCat.id);
    const numChoices = Math.max(2, Math.min(config.adaptation.maxChoices, otherCats.length + 1, target.fieldSize || 3));
    const positions = counterbalancedPositions(trialsPerTarget, numChoices, rnd);

    for (let i = 0; i < trialsPerTarget; i++) {
      const pos = positions[i] ?? 0;
      const distractorCats = shuffle(otherCats, rnd).slice(0, numChoices - 1);
      const boxes = [...distractorCats];
      boxes.splice(pos, 0, correctCat);

      trials.push({
        index: globalIndex++,
        target,
        item,
        correctCategory: correctCat,
        boxes,
        options: boxes.map((b) => ({ stimulusId: b.id, label: b.label, art: b.id })),
        positionOfTarget: pos,
        instruction: `Onde guardamos ${STIMULUS_ART[item.art]?.article === 'a' ? 'a' : 'o'} ${item.label}?`,
      });
    }
  }

  return trials;
}
