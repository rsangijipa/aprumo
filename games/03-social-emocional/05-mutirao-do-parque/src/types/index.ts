export type CharacterTalent =
  | 'agil'
  | 'organizado'
  | 'forte'
  | 'cuidadoso'
  | 'observador'
  | 'pratico'
  | 'criativo'
  | 'conciliador';

export interface CharacterDef {
  id: string;
  name: string;
  pronoun: string;
  talent: CharacterTalent;
  talentName: string;
  talentDescription: string;
  specialActionName: string;
  specialDescription: string;
  specialCooldown: number; // in seconds
  appearance: {
    color: string;
    secondaryColor: string;
    hairColor: string;
    skinTone: string;
    hasWheelchair?: boolean;
    accessory: 'boné' | 'faixa' | 'óculos' | 'chapéu' | 'laço' | 'fones' | 'boina' | 'lenço';
  };
}

export type TaskCategory = 'plantio' | 'pintura' | 'reparo' | 'iluminacao' | 'organizacao' | 'agua' | 'palco';

export interface TaskRequirement {
  itemId?: string;
  toolId?: string;
  amount?: number;
}

export interface TaskDef {
  id: string;
  name: string;
  category: TaskCategory;
  zone: string;
  description: string;
  steps: string[];
  requiredItems: string[];
  requiredTool?: string;
  baseDuration: number; // base duration in seconds
  icon: string;
  isEssential: boolean; // essential goals vs bonus goals
  visualStateKey: string;
}

export interface DynamicEventDef {
  id: string;
  name: string;
  description: string;
  warningDuration: number; // warning countdown before triggering (5-8s)
  duration: number; // duration of active event in seconds
  type: 'weather' | 'item' | 'blockade' | 'delivery' | 'visitor' | 'nature' | 'boost';
  icon: string;
  effectDescription: string;
  requiresTeamCoordination: boolean;
}

export interface MapZoneDef {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface MapDef {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  difficulty: 'iniciante' | 'equilibrado' | 'desafiador';
  zones: MapZoneDef[];
  gridWidth: number;
  gridHeight: number;
  itemSpawners: {
    id: string;
    itemId: string;
    x: number;
    y: number;
    label: string;
  }[];
  taskSpots: {
    taskId: string;
    x: number;
    y: number;
  }[];
  decorations: {
    type: 'tree' | 'bench' | 'flowerbed' | 'lamp' | 'pond' | 'path' | 'stage' | 'ramp' | 'fence';
    x: number;
    y: number;
    width?: number;
    height?: number;
  }[];
  unlockedByDefault: boolean;
}

export interface ItemDef {
  id: string;
  name: string;
  category: 'muda' | 'ferramenta' | 'tinta' | 'material' | 'especial';
  icon: string;
  color: string;
  consumable?: boolean;
}

export interface InventorySlot {
  item: ItemDef | null;
  usesLeft?: number;
}

export type MatchDuration = 'curta' | 'padrao' | 'longa' | 'livre';

export type GameMode = 'solo' | 'local_2p' | 'tap_to_move';

export interface PingData {
  id: string;
  x: number;
  y: number;
  senderName: string;
  senderColor: string;
  icon: string;
  timestamp: number;
  expiresAt: number;
}

export interface ActiveTaskState {
  taskId: string;
  progress: number; // 0 to 100
  currentStepIndex: number;
  assignedPlayerIds: string[];
  isCompleted: boolean;
  activeContributorsCount: number;
}

export interface CompletedStats {
  tasksCompleted: number;
  essentialTasksCompleted: number;
  totalEssentialTasks: number;
  helpsGiven: number;
  eventsHandled: number;
  timeSpentSeconds: number;
  isCompleteVictory: boolean;
  parkName: string;
}
