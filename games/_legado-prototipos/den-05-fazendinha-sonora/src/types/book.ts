export type AnimalId =
  | 'vaca'
  | 'cavalo'
  | 'galinha'
  | 'pato'
  | 'cachorro'
  | 'gato'
  | 'porco'
  | 'arara'
  | 'capivara'
  | 'sapo';

export interface FlapData {
  id: string;
  coverLabel: string;
  coverColor: string;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  animalId: AnimalId;
  animalName: string;
  onomatopoeia: string;
  animalEmoji: string;
  isOpen: boolean;
  isShaking: boolean;
}

export interface BookPage {
  pageNumber: number;
  title: string;
  scenery: 'fazenda' | 'pasto' | 'lagoa' | 'selva' | 'curral';
  promptText: string;
  flaps: FlapData[];
}

export interface BookConfig {
  id: string;
  title: string;
  theme: 'fazenda' | 'rio' | 'familia';
  pages: BookPage[];
}

export type ResponseType =
  | 'apontar-pedir'
  | 'apontar-mostrar'
  | 'seguir-apontar'
  | 'onomatopeia'
  | 'palavra';

export type PromptLevel = 'independente' | 'parcial' | 'total';

export interface TeachingEpisode {
  episodeId: string;
  timestamp: number;
  page: number;
  animal: AnimalId;
  responseType: ResponseType;
  echoOfAdult: boolean;
  promptLevel: PromptLevel;
}

export interface BookSessionMetrics {
  flapsRevealed: number;
  onomatopoeiasImitated: number;
  pointingToShowCount: number;
  pointingToMandCount: number;
  followingPointerCount: number;
}
