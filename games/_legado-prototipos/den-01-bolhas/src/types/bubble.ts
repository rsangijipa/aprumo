export type RoutinePhase = 'abertura' | 'tema' | 'elaboracao' | 'fechamento';

export type VariationType = 'normal' | 'gigantes' | 'chuva' | 'lentas' | 'peixe';

export type InitiativeModality =
  | 'olhar'
  | 'gesto'
  | 'apontar'
  | 'vocalizacao'
  | 'palavra';

export type PromptLevel = 'independente' | 'parcial' | 'total';

export interface Bubble {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  colorHue: number;
  isSpecial?: 'peixe' | 'estrela' | 'gigante' | 'normal';
  wobblePhase: number;
  wobbleSpeed: number;
  createdAt: number;
  opacity: number;
}

export interface PopParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export interface TeachingEpisode {
  episodeId: string;
  timestamp: number;
  routinePhase: RoutinePhase;
  variation: VariationType;
  latencyMs: number;
  modality: InitiativeModality;
  promptLevel: PromptLevel;
  bubblesPoppedCount: number;
}

export interface JointActivityRoutine {
  routineId: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  episodes: TeachingEpisode[];
  totalBubblesSpawned: number;
  totalBubblesPopped: number;
  physicalReminderShown: boolean;
}
