export type VehicleType = 'carro' | 'caminhao' | 'bolinha' | 'onibus';

export type RampVariation =
  | 'padrao'
  | 'ingreme'
  | 'ponte-igarape'
  | 'corrida'
  | 'tunel'
  | 'pinos';

export interface RampTrackConfig {
  id: string;
  name: string;
  rampAngleDeg: number; // 15 to 40
  hasBridge: boolean;
  hasTunnel: boolean;
  targetType: 'pinos' | 'garagem' | 'alvo';
  pinCount: number;
}

export type InitiativeModality = 'olhar' | 'gesto' | 'vocalizacao' | 'palavra-ja';
export type PromptLevel = 'independente' | 'parcial' | 'total';

export interface TeachingEpisode {
  episodeId: string;
  timestamp: number;
  vehicle: VehicleType;
  rampAngleDeg: number;
  variation: RampVariation;
  raceMode: boolean;
  targetHit: boolean;
  modality: InitiativeModality;
  promptLevel: PromptLevel;
}

export interface RampSessionMetrics {
  totalLaunches: number;
  targetsHit: number;
  vocalJaCount: number;
  gestureCount: number;
  raceWinsChild: number;
}
