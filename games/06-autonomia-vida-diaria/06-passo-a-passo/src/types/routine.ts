export type PromptLevel = 'IND' | 'VERBAL' | 'GEST' | 'MOD' | 'FP' | 'FT';

export type Setting = 'clinica' | 'casa' | 'escola';

export type SequenceVariant = 'ordenar_tudo' | 'passo_faltante' | 'passo_fora_ordem';

export type ChainMode = 'reverso' | 'direto' | 'tarefa_total';

export interface TaskAnalysisStep {
  stepId: string;
  order: number; // 1-indexed
  title: string;
  shortInstruction: string;
  detailDescription: string;
  iconEmoji: string;
  color: string;
  isMastered?: boolean;
  groupWithNext?: boolean;
}

export interface Routine {
  id: string;
  name: string;
  category: 'higiene' | 'vestuario' | 'alimentacao' | 'organizacao' | 'autonomia';
  targetAudience: 'infantil' | 'adolescente';
  description: string;
  chainMode: ChainMode;
  steps: TaskAnalysisStep[];
}

export interface AbaSequenceTrial {
  trialId: string;
  timestamp: number;
  routineId: string;
  variant: SequenceVariant;
  cardId: string;
  slotIndex: number;
  sequenceLength: number;
  isCorrect: boolean;
}

export interface TaskAnalysisRecord {
  recordId: string;
  timestamp: number;
  routineId: string;
  stepId: string;
  stepOrder: number;
  promptLevel: PromptLevel;
  durationMs: number;
  setting: Setting;
  recordedBy: string;
  selfReported?: boolean;
  therapistConfirmed?: boolean;
}
