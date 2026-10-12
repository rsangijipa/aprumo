export type TokenPhase = 'pareamento' | 'inicial' | 'intermediaria' | 'avancada' | 'adolescente';

export type TokenSource = 'jogo' | 'clinic' | 'autorregistro';

export interface TokenEvent {
  eventId: string;
  idempotencyKey: string;
  boardId: string;
  source: TokenSource;
  behaviorId: string;
  behaviorDescription: string;
  count: number;
  timestamp: number;
  confirmedBy?: string;
  isCostOfResponse?: boolean;
  justification?: string;
}

export interface ReinforcerOption {
  id: string;
  name: string;
  category: 'brinquedo' | 'video' | 'pausa' | 'jogo' | 'musica' | 'comidinha';
  durationSeconds: number;
  iconEmoji: string;
  color: string;
  description: string;
}

export interface TokenTheme {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  svgPath: string;
  description: string;
}

export interface TeenGoal {
  id: string;
  title: string;
  description: string;
  points: number;
  selfReported: boolean;
  therapistConfirmed?: boolean;
  category: 'tarefa' | 'social' | 'autonomia' | 'comunicacao';
}

export interface PriceMenuItem {
  id: string;
  title: string;
  cost: number;
  icon: string;
  category: 'privilegio' | 'atividade' | 'item';
  description: string;
}

export interface BoardState {
  boardId: string;
  phase: TokenPhase;
  targetSlots: number; // N
  currentTokens: number; // 0 to N
  selectedReinforcer: ReinforcerOption | null;
  activeTokenThemeId: string;
  pairingSuccessCount: number;
  responseCostEnabled: boolean;
  responseCostJustification?: string;
  isCompleted: boolean;
  timerActive: boolean;
  timerSecondsRemaining: number;
  timerTotalDuration: number;
}
