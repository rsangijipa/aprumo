export type Model = 'ABA' | 'DENVER';
export type Response = 'correct' | 'incorrect' | 'no_response';
export type Channel = 'table' | 'digital' | 'natural' | 'home';
export type Setting = 'clinic' | 'home' | 'school' | 'community' | 'telehealth';
export type Phase =
  | 'baseline'
  | 'acquisition'
  | 'maintenance'
  | 'generalization'
  | 'mastered'
  | 'review'
  | 'suspended';

/** Uma tentativa ou oportunidade, de qualquer canal. Equivale a uma linha de fact_trials. */
export interface TrialFact {
  targetId: string;
  sessionId: string;
  /** ISO date-time do início da sessão. */
  sessionAt: string;
  phase: Phase;
  response: Response;
  /** 0 = independente; 1 = dica mais intrusiva da hierarquia. */
  promptIntrusiveness: number;
  promptCode: string;
  latencyMs: number | null;
  channel: Channel;
  setting: Setting;
  implementerId: string;
  /** Tarefas de seleção: posição do alvo e posição tocada. */
  positionOfTarget?: number | null;
  selectedPosition?: number | null;
  fieldSize?: number | null;
  /** Sonda de manutenção/generalização (sem ensino). */
  probe?: boolean;
}

/** Equivale a fact_target_session. */
export interface TargetSessionSummary {
  targetId: string;
  sessionId: string;
  sessionAt: string;
  phase: Phase;
  opportunities: number;
  correctIndependent: number;
  correctPrompted: number;
  incorrect: number;
  noResponse: number;
  /** null quando não houve oportunidades: nunca exibir 0% sem amostra. */
  pctIndependent: number | null;
  pctPrompted: number | null;
  meanPromptLevel: number | null;
  medianLatencyMs: number | null;
  channel: Channel;
  setting: Setting;
  implementerId: string;
  probe: boolean;
}

export interface MasteryCriteria {
  id: string;
  version: number;
  minIndependentPct: number;
  sessionsRequired: number;
  consecutive: boolean;
  minOpportunitiesPerSession: number;
  minImplementers: number;
  minSettings: number;
  maintenanceProbeWeeks: number[];
  maintenanceMinPct: number;
}

/** Padrão sugerido da especificação: ponto de partida, não regra científica. */
export const DEFAULT_MASTERY: MasteryCriteria = {
  id: 'default-90-2x10',
  version: 1,
  minIndependentPct: 90,
  sessionsRequired: 2,
  consecutive: true,
  minOpportunitiesPerSession: 10,
  minImplementers: 1,
  minSettings: 1,
  maintenanceProbeWeeks: [1, 2, 4],
  maintenanceMinPct: 80,
};
