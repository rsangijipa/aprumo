import { TARGET_ITEMS } from '../assets/targets';
import type {
  ComparisonSlot,
  DistractorSimilarity,
  PromptType,
  StimulusLayer,
  TargetItem,
  TrialConfig
} from '../types';

export class BalancedPositionGenerator {
  private lastPosition: number | null = null;
  private secondLastPosition: number | null = null;
  private currentFieldSize: number = 3;
  private pool: number[] = [];

  constructor(fieldSize: number = 3) {
    this.setFieldSize(fieldSize);
  }

  public setFieldSize(fieldSize: number) {
    this.currentFieldSize = Math.max(1, fieldSize);
    this.pool = [];
    this.refillPool();
  }

  public getFieldSize(): number {
    return this.currentFieldSize;
  }

  private refillPool() {
    const items: number[] = [];
    for (let i = 0; i < this.currentFieldSize; i++) {
      items.push(i);
    }
    // Fisher-Yates shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = items[i]!;
      items[i] = items[j]!;
      items[j] = temp;
    }
    this.pool.push(...items);
  }

  /**
   * Generates the next target position.
   * Guarantees:
   * 1. Never more than 2 consecutive times in the same position.
   * 2. Balanced distribution within ±5% of uniform.
   */
  public nextPosition(): number {
    if (this.currentFieldSize === 1) {
      this.lastPosition = 0;
      this.secondLastPosition = 0;
      return 0;
    }

    if (this.pool.length === 0) {
      this.refillPool();
    }

    // Find candidate that doesn't violate > 2 consecutive times
    let chosenIndex = -1;
    for (let i = 0; i < this.pool.length; i++) {
      const candidate = this.pool[i];
      const wouldBeThreeConsecutive =
        this.lastPosition !== null &&
        this.secondLastPosition !== null &&
        candidate === this.lastPosition &&
        candidate === this.secondLastPosition;

      if (!wouldBeThreeConsecutive) {
        chosenIndex = i;
        break;
      }
    }

    // If all remaining items in current pool would cause 3 consecutive, refill next block and find match
    if (chosenIndex === -1) {
      this.refillPool();
      for (let i = 0; i < this.pool.length; i++) {
        const candidate = this.pool[i];
        const wouldBeThreeConsecutive =
          this.lastPosition !== null &&
          this.secondLastPosition !== null &&
          candidate === this.lastPosition &&
          candidate === this.secondLastPosition;

        if (!wouldBeThreeConsecutive) {
          chosenIndex = i;
          break;
        }
      }
    }

    const chosen = this.pool.splice(chosenIndex >= 0 ? chosenIndex : 0, 1)[0] ?? 0;
    this.secondLastPosition = this.lastPosition;
    this.lastPosition = chosen;

    return chosen;
  }

  public reset() {
    this.lastPosition = null;
    this.secondLastPosition = null;
    this.pool = [];
    this.refillPool();
  }
}

export class TrialGenerator {
  private recentTargetIds: string[] = [];
  private positionGenerators: Map<number, BalancedPositionGenerator> = new Map();

  constructor() {
    for (let k = 1; k <= 6; k++) {
      this.positionGenerators.set(k, new BalancedPositionGenerator(k));
    }
  }

  private getPositionGenerator(fieldSize: number): BalancedPositionGenerator {
    let gen = this.positionGenerators.get(fieldSize);
    if (!gen) {
      gen = new BalancedPositionGenerator(fieldSize);
      this.positionGenerators.set(fieldSize, gen);
    }
    return gen;
  }

  /**
   * Rotates target to prevent repeating same target in consecutive trials
   */
  private selectTarget(categoryFilter?: string): TargetItem {
    let available = TARGET_ITEMS;
    if (categoryFilter) {
      available = available.filter(t => t.category === categoryFilter);
    }

    const unplayed = available.filter(t => !this.recentTargetIds.includes(t.id));
    const pool = unplayed.length > 0 ? unplayed : available;
    const selected = pool[Math.floor(Math.random() * pool.length)] ?? TARGET_ITEMS[0]!;

    this.recentTargetIds.push(selected.id);
    if (this.recentTargetIds.length > 8) {
      this.recentTargetIds.shift();
    }

    return selected;
  }

  /**
   * Generates a complete Trial configuration per Level specifications (Table 4.3)
   */
  public generateTrial(options: {
    trialNumber: number;
    level: number;
    promptType?: PromptType;
    promptIntensity?: number;
    isColdProbe?: boolean;
    stimulusFadingStep?: number; // 1 = 30%, 2 = 60%, 3 = 100%
  }): TrialConfig {
    const {
      trialNumber,
      level,
      promptType = 'none',
      promptIntensity = 1.0,
      isColdProbe = false,
      stimulusFadingStep = 3
    } = options;

    let fieldSize = 3;
    let sampleLayer: StimulusLayer = 'foto';
    let comparisonLayer: StimulusLayer = 'foto';
    let distractorSimilarity: DistractorSimilarity = 'baixa';
    let isNonIdentical = false;

    // Mapping per Table 4.3
    switch (level) {
      case 1:
        // Level 1: Field 1 (errorless), identical, photo, 0 distractors
        fieldSize = 1;
        sampleLayer = 'foto';
        comparisonLayer = 'foto';
        distractorSimilarity = 'baixa';
        break;
      case 2:
        // Level 2: Field 2, identical, photo, very different distractors
        fieldSize = 2;
        sampleLayer = 'foto';
        comparisonLayer = 'foto';
        distractorSimilarity = 'baixa';
        break;
      case 3:
        // Level 3: Field 3, identical, photo & illustration, different distractors
        fieldSize = 3;
        sampleLayer = Math.random() > 0.5 ? 'foto' : 'ilustracao';
        comparisonLayer = sampleLayer;
        distractorSimilarity = 'media';
        break;
      case 4:
        // Level 4: Field 3–4, identical, similar distractors (same color)
        fieldSize = trialNumber % 2 === 0 ? 3 : 4;
        sampleLayer = 'ilustracao';
        comparisonLayer = 'ilustracao';
        distractorSimilarity = 'alta';
        break;
      case 5:
        // Level 5: Field 4–6, non-identical (same category), similar distractors
        fieldSize = 4 + (trialNumber % 3); // 4, 5, or 6
        sampleLayer = 'foto';
        comparisonLayer = 'ilustracao'; // non-identical representation!
        isNonIdentical = true;
        distractorSimilarity = 'alta';
        break;
      case 6:
      default:
        // Level 6: Field 6, real photographed object <-> pictogram, close category
        fieldSize = 6;
        sampleLayer = 'foto';
        comparisonLayer = 'picto';
        isNonIdentical = true;
        distractorSimilarity = 'alta';
        break;
    }

    const target = this.selectTarget();
    const posGen = this.getPositionGenerator(fieldSize);
    const targetSlotIndex = posGen.nextPosition();

    // Select distractors based on similarity criteria
    const distractors = this.selectDistractors(
      target,
      fieldSize - 1,
      distractorSimilarity,
      isNonIdentical
    );

    // Calculate opacity for stimulus fading (30% -> 60% -> 100%)
    const distractorOpacity =
      stimulusFadingStep === 1 ? 0.3 : stimulusFadingStep === 2 ? 0.6 : 1.0;

    // Assemble slots
    const comparisonSlots: ComparisonSlot[] = [];
    let distractorIdx = 0;

    for (let i = 0; i < fieldSize; i++) {
      if (i === targetSlotIndex) {
        comparisonSlots.push({
          slotIndex: i,
          target,
          isCorrect: true,
          opacity: 1.0,
          layer: comparisonLayer
        });
      } else {
        const distractor = distractors[distractorIdx++] ?? target;
        comparisonSlots.push({
          slotIndex: i,
          target: distractor,
          isCorrect: false,
          opacity: distractorOpacity,
          layer: comparisonLayer
        });
      }
    }

    return {
      trialNumber,
      level,
      target,
      sampleLayer,
      comparisonSlots,
      promptType: isColdProbe ? 'none' : promptType,
      promptIntensity,
      isColdProbe,
      timeoutMs: 8000,
      promptDelayMs: 3500,
      distractorSimilarity
    };
  }

  private selectDistractors(
    target: TargetItem,
    count: number,
    similarity: DistractorSimilarity,
    sameCategoryAllowed: boolean
  ): TargetItem[] {
    if (count <= 0) return [];

    let candidates: TargetItem[] = [];

    if (similarity === 'alta') {
      // Prioritize same color or same category
      candidates = TARGET_ITEMS.filter(
        t => t.id !== target.id && (t.dominantColor === target.dominantColor || (sameCategoryAllowed && t.category === target.category))
      );
    } else if (similarity === 'media') {
      // Same category or different color
      candidates = TARGET_ITEMS.filter(
        t => t.id !== target.id && t.category !== target.category
      );
    } else {
      // Baixa: totally different category and different color
      candidates = TARGET_ITEMS.filter(
        t => t.id !== target.id && t.category !== target.category && t.dominantColor !== target.dominantColor
      );
    }

    // Fallback if not enough candidates
    if (candidates.length < count) {
      candidates = TARGET_ITEMS.filter(t => t.id !== target.id);
    }

    // Shuffle and pick
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  public reset() {
    this.recentTargetIds = [];
    this.positionGenerators.forEach(g => g.reset());
  }
}
