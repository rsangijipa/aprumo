export type TurnHolder = 'ADULTO' | 'CRIANCA' | 'LIVRE';

export type BlockShape = 'retangular' | 'quadrado' | 'copo' | 'cilindro';

export type BlockSetType = 'madeira' | 'copos';

export type TowerVariation =
  | 'padrao'
  | 'alternada'
  | 'ponte'
  | 'trem'
  | 'bamba'
  | 'animal';

export type StabilityAssist = 0 | 1 | 2 | 3;

export interface TowerBlock {
  id: string;
  owner: 'adulto' | 'crianca';
  shape: BlockShape;
  color: string;
  width: number;
  height: number;
  x: number;
  y: number;
  angle: number;
  placedInTower: boolean;
  matterBodyId?: number;
}

export type EpisodeType =
  | 'troca-turno'
  | 'pedido-bloco'
  | 'imitacao'
  | 'contagem'
  | 'derrubada';

export type PromptLevel = 'independente' | 'parcial' | 'total';

export interface TeachingEpisode {
  episodeId: string;
  timestamp: number;
  type: EpisodeType;
  promptLevel: PromptLevel;
  details: string;
}

export interface TowerSessionMetrics {
  blocksPlacedChild: number;
  blocksPlacedAdult: number;
  turnSwitches: number;
  maxHeight: number;
  stabilityAssistLevel: StabilityAssist;
  imitatedVariationsCount: number;
}
