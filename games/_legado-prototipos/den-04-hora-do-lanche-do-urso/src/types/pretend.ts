export type CharacterType = 'urso' | 'boneca' | 'cachorro' | 'avo';

export type ScenePlace = 'cozinha' | 'quarto' | 'banheiro';

export type CharacterState =
  | 'neutro'
  | 'fome'
  | 'comendo'
  | 'satisfeito'
  | 'sede'
  | 'bebendo'
  | 'sujo'
  | 'limpando'
  | 'sono'
  | 'dormindo'
  | 'surpresa'
  | 'ue';

export type ActionZone = 'boca' | 'rosto' | 'corpo' | 'cabeca';

export type ItemCategory = 'comida' | 'bebida' | 'higiene' | 'cuidado' | 'simbolico';

export interface PretendItem {
  id: string;
  name: string;
  category: ItemCategory;
  iconEmoji: string;
  compatibleZones: ActionZone[];
  soundType: 'munch' | 'drink' | 'wipe' | 'sleep' | 'surprise' | 'giggle';
  speechText: string;
}

export type ActionLocation = 'tela' | 'brinquedo-real';
export type PromptLevel = 'independente' | 'parcial' | 'total';

export interface TeachingEpisode {
  episodeId: string;
  timestamp: number;
  character: CharacterType;
  action: string;
  item: string;
  zone: ActionZone;
  isSubstitution: boolean;
  location: ActionLocation;
  promptLevel: PromptLevel;
  sequenceLength: number;
}

export interface PretendSessionMetrics {
  totalActions: number;
  realToyActionsCount: number;
  screenActionsCount: number;
  substitutionsCount: number;
  maxSequenceLength: number;
}
