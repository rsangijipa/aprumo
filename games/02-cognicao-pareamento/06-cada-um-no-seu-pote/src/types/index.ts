export type ClassificationRule = 'cor' | 'forma' | 'tamanho' | 'categoria' | 'funcao';
export type SensoryProfile = 'padrao' | 'baixo'; // 'baixo' desliga arremesso e quique
export type GameMode = 'tentativa_discreta' | 'tarefa_independente';
export type PromptType = 'none' | 'VIS' | 'GEST' | 'AUD';
export type MaterialType = 'plastico' | 'pelucia' | 'madeira' | 'papel';

export interface SortItem {
  id: string;
  name: string;
  rule: ClassificationRule;
  attributeValue: string; // e.g., 'vermelho', 'quadrado', 'grande', 'animais'
  color: string;
  shape?: 'circulo' | 'quadrado' | 'triangulo' | 'estrela';
  size?: 'grande' | 'pequeno';
  category?: 'animais' | 'alimentos' | 'roupas' | 'veiculos';
  material: MaterialType;
  svgIcon: string;
}

export interface BinDefinition {
  id: string;
  binIndex: number;
  label: string;
  attributeValue: string;
  samplePattern: string; // 'liso' | 'listrado' | 'pontilhado' | 'xadrez' para daltonismo
  color: string;
  iconSvg?: string;
}

export interface AbaTrialSort {
  trialNumber: number;
  timestamp: string;
  itemId: string;
  itemName: string;
  binIndex: number;
  expectedBinIndex: number;
  result: 'independent_correct' | 'prompted_correct' | 'incorrect' | 'timeout';
  latencyMs: number;
  gameSpecific: {
    rule: ClassificationRule;
    attributeValue: string;
    binIndex: number;
    throwVelocity: number;
    ruleSwitchProbe: boolean;
    mode: GameMode;
  };
}

export interface IndependentTaskStats {
  itemsTotal: number;
  itemsCorrect: number;
  errorsCount: number;
  durationMs: number;
  offTaskPauses: number; // pausas >= 10s sem interação
  adultPrompts: number;
  isComplete: boolean;
}
