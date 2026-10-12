// ==========================================================================
// ESCAPE ROOM KIDS — CORE TYPES & DATA INTERFACES
// ==========================================================================

export type AgeProfile = '6+' | '9+' | 'teens';

export type CameraMode = 'orbit' | 'firstPerson';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  modelType: 'gear' | 'key' | 'prism' | 'spring' | 'book' | 'magnifier' | 'scroll' | 'seed' | 'flask' | 'dial' | 'flowerKey';
  color: string;
  inspectText: string;
  combinableWith?: string[];
  combinationResult?: string;
  combinationMessage?: string;
}

export interface Hotspot {
  id: string;
  name: string;
  position: [number, number, number];
  cameraFocus: [number, number, number];
  requiresItem?: string;
  puzzleId?: string;
  hintText: string;
  isExitDoor?: boolean;
}

export interface PuzzleHint {
  ambient: string;     // Level 1: Ambient nudge
  textual: string;     // Level 2: Short clear clue
  hotspotId: string;   // Level 3: Highlights 3D hotspot in scene
  directStep: string;  // Level 4: Explicit first/next move
}

export interface PuzzleDefinition {
  id: string;
  title: string;
  type: 
    | 'symbolLock' 
    | 'gearTrain' 
    | 'lightBeam' 
    | 'bookOrder' 
    | 'constellation' 
    | 'soundSequence' 
    | 'weightBalance' 
    | 'waterCircuit' 
    | 'colorMixing'
    | 'combinationKey';
  description: string;
  hints: PuzzleHint;
  rewardItem?: InventoryItem;
}

export interface RoomDefinition {
  id: 'workshop' | 'library' | 'greenhouse';
  name: string;
  themeName: string;
  ambientFreqBase: number;
  floorColor: string;
  wallColor: string;
  accentColor: string;
  introStory: string;
  solvedStory: string;
  hotspots: Hotspot[];
  puzzles: PuzzleDefinition[];
}
