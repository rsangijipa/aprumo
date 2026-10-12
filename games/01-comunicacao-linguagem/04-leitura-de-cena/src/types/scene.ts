export type EmotionType =
  | 'alegria'
  | 'tristeza'
  | 'raiva'
  | 'medo'
  | 'surpresa'
  | 'frustracao'
  | 'ansiedade'
  | 'ironia'
  | 'calma';

export type SceneContext = 'escola' | 'casa' | 'rua' | 'celular' | 'jogos';

export type SocialCueType = 'rosto' | 'corpo' | 'fala' | 'objeto_ambiente';

export interface CueHotspot {
  cueId: string;
  type: SocialCueType;
  label: string;
  xPct: number; // percentage coordinates for responsive overlay
  yPct: number;
}

export interface ActionOption {
  id: string;
  text: string;
  iconEmoji: string;
  isAcceptable: boolean;
  explanation: string;
  rehearsalGuide: string; // Instructions for live role-play with therapist
}

export interface SocialScene {
  id: string;
  title: string;
  context: SceneContext;
  emotion: EmotionType;
  intensity: 1 | 2 | 3;
  targetAge: 'infantil' | 'adolescente';
  spokenText: string;
  subtitle: string;
  characterDescription: string;
  cues: CueHotspot[];
  whyReasonOptions: { id: string; text: string; isCorrect: boolean }[];
  actionOptions: ActionOption[];
}

export type SceneModule = 'E1' | 'E2' | 'E3' | 'E4' | 'E5';

export interface AbaSceneTrial {
  trialId: string;
  timestamp: number;
  module: SceneModule;
  sceneId: string;
  emotion: EmotionType;
  intensity: number;
  cuesSelected: string[];
  cuesExpected: string[];
  responseOptionId?: string;
  isAcceptable?: boolean;
  rehearsalResult?: 'sem-ajuda' | 'com-ajuda' | 'nao-executou';
  isSuccess: boolean;
}

export interface FeelingsThermometerState {
  level: 1 | 2 | 3 | 4 | 5;
  selectedEmotionWord: string;
  helpfulStrategy: string;
  timestamp: number;
}
