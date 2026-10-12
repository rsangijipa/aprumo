export type StimulusLayer = 'foto' | 'ilustracao' | 'picto';
export type DistractorSimilarity = 'baixa' | 'media' | 'alta';
export type PromptType = 'none' | 'VIS' | 'GEST' | 'POS';
export type InteractionMode = 'drag' | 'tap';
export type LocutorId = 'locutor_1' | 'locutor_2' | 'locutor_3';

export type Category = 
  | 'alimentos' 
  | 'animais' 
  | 'brinquedos' 
  | 'roupas' 
  | 'utensilios' 
  | 'veiculos';

export interface TargetItem {
  id: string;
  name: string;
  category: Category;
  dominantColor: string;
  description: string;
  layers: {
    foto: string;       // Rich realistic SVG/data URL
    ilustracao: string; // Paper-cut SVG illustration (2-3 flat tones)
    picto: string;      // Minimalist 6px stroke SVG line art
  };
}

export interface ComparisonSlot {
  slotIndex: number;
  target: TargetItem;
  isCorrect: boolean;
  opacity: number; // Stimulus fading (30% -> 60% -> 100%)
  layer: StimulusLayer;
}

export interface TrialConfig {
  trialNumber: number;
  level: number;
  target: TargetItem;
  sampleLayer: StimulusLayer;
  comparisonSlots: ComparisonSlot[];
  promptType: PromptType;
  promptIntensity: number; // 1.0 down to 0.3 for fading
  isColdProbe: boolean;
  timeoutMs: number;
  promptDelayMs: number;
  distractorSimilarity: DistractorSimilarity;
}

export interface AbaTrial {
  trialNumber: number;
  timestamp: string;
  targetId: string;
  targetName: string;
  targetPosition: number; // 0-indexed slot
  fieldSize: number;
  level: number;
  promptLevel: PromptType;
  isColdProbe: boolean;
  result: 'independent_correct' | 'prompted_correct' | 'incorrect' | 'timeout';
  latencyMs: number; // Measured from the end of the SD audio to drop (±20 ms)
  gameSpecific: {
    dragPathLength: number; // in pixels
    dropDistancePx: number; // distance from card center at release
    mode: InteractionMode;
    stimulusLayer: StimulusLayer;
    distractorSimilarity: DistractorSimilarity;
  };
}

export interface SessionStats {
  totalTrials: number;
  correctCount: number;
  independentCount: number;
  promptedCount: number;
  incorrectCount: number;
  timeoutCount: number;
  coldProbeIndependentCount: number;
  coldProbeTotal: number;
  averageLatencyMs: number;
  outsideDropsCount: number;
  positionErrorMap: Record<number, number>;
  positionTotalMap: Record<number, number>;
  confusedDistractorsMap: Record<string, number>;
  masteredTargets: string[];
}

export interface PhysicalBridgeReport {
  generatedAt: string;
  studentName: string;
  masteredTargets: TargetItem[];
  instructions: string;
  criterionMet: boolean;
}
