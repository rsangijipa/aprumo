export type ChainType = 'reverso' | 'direto' | 'tarefa_total';

export type PromptLevel = 'NONE' | 'VIS' | 'GEST' | 'POS' | 'ROTATION';

export interface Point {
  x: number;
  y: number;
}

export interface PuzzlePieceDef {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  pathD: string;
  viewBox: string;
  width: number;
  height: number;
  targetX: number;
  targetY: number;
  targetAngle: number; // in degrees (usually 0)
  pegPosition: Point; // relative to piece center
  category?: string;
  description?: string;
}

export interface PlacedPieceState {
  pieceId: string;
  isPlaced: boolean;
  placedBy: 'child' | 'chain_auto' | 'prompt';
  currentX: number;
  currentY: number;
  currentAngle: number;
  attempts: number;
  rotationsUsed: number;
}

export interface PuzzleTheme {
  id: string;
  name: string;
  description: string;
  level: number;
  boardWidth: number;
  boardHeight: number;
  backgroundSvg?: string;
  pieces: PuzzlePieceDef[];
}

export interface LevelConfig {
  level: number;
  title: string;
  pieceCountDesc: string;
  captureRadiusPx: number;
  angleToleranceDeg: number;
  allowRotation: boolean;
  defaultThemeId: string;
}

export interface AbaTrial {
  trialId: string;
  timestamp: number;
  chainType: ChainType;
  chainStep: number;
  k: number;
  pieceId: string;
  targetCavityId: string;
  success: boolean;
  snapDistancePx: number;
  angleErrorDeg: number;
  attemptsBeforeSnap: number;
  rotationsUsed: number;
  promptUsed: PromptLevel;
  timeToFitMs: number;
  isErrorTrial: boolean; // true if dropped over an incorrect cavity
}

export interface PhysicalBridgeAssessment {
  childName: string;
  assessorName: string;
  date: string;
  pincerGraspObserved: 'independente' | 'com_ajuda' | 'nao_observado';
  pegUseObserved: 'apenas_pino' | 'borda_e_pino' | 'apenas_borda';
  spatialOrientationObserved: 'espontanea' | 'tentativa_erro' | 'precisa_dica';
  frustrationTolerance: 'alta' | 'moderada' | 'baixa';
  notes: string;
}
