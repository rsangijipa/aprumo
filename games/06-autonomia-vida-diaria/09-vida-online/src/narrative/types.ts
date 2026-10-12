import { z } from 'zod';

/* --------------------------------------------------------------------------
   INDICATORS (4 Neutral Indicators: privacidade, clareza, limites, confiança)
   -------------------------------------------------------------------------- */
export interface Indicators {
  privacidade: number; // 0 - 100
  clareza: number;     // 0 - 100
  limites: number;     // 0 - 100
  confianca: number;   // 0 - 100
}

export type IndicatorKey = keyof Indicators;

/* --------------------------------------------------------------------------
   CHARACTERS
   -------------------------------------------------------------------------- */
export interface Character {
  id: string;
  name: string;
  handle: string;
  role: 'friend' | 'classmate' | 'family' | 'teacher' | 'stranger' | 'moderator' | 'player';
  avatarId: string;
  status: string;
  bio: string;
  verified?: boolean;
  typingDelayMs?: number;
  styleDescription: string;
}

/* --------------------------------------------------------------------------
   MESSAGES & MEDIA
   -------------------------------------------------------------------------- */
export type MessageSenderType = 'player' | 'contact' | 'system' | 'narrator';

export interface MessageAttachment {
  type: 'image' | 'link' | 'audio_fake' | 'poll' | 'file';
  url?: string;
  title?: string;
  subtitle?: string;
  thumbnail?: string;
  data?: Record<string, any>;
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  senderType: MessageSenderType;
  text: string;
  timestamp: string;
  attachment?: MessageAttachment;
  isDeleted?: boolean;
  perspectiveOwnerId?: string; // used for dual-perspective scenes
}

/* --------------------------------------------------------------------------
   CHOICES & CONSEQUENCES
   -------------------------------------------------------------------------- */
export interface ChoiceEffect {
  indicatorChanges?: Partial<Indicators>;
  setFlags?: Record<string, boolean | string>;
  addFacts?: string[];
  unlockApp?: string;
  triggerNotification?: {
    app: string;
    title: string;
    body: string;
  };
}

export interface Choice {
  id: string;
  label: string;
  description?: string;
  type?: 'quick' | 'investigate' | 'block' | 'report' | 'boundary' | 'adult_help';
  targetNodeId: string;
  effects?: ChoiceEffect;
  requiresFlag?: string;
}

/* --------------------------------------------------------------------------
   STORY NODE & EPISODE
   -------------------------------------------------------------------------- */
export interface StoryNode {
  id: string;
  title?: string;
  contextNote?: string;
  messages: Message[];
  choices: Choice[];
  autoAdvanceAfterMs?: number;
  autoAdvanceTargetNodeId?: string;
  interactiveMinigame?: 'url_inspect' | 'print_crop' | 'permission_audit' | 'password_builder';
  perspectiveSwitch?: {
    characterId: string;
    characterName: string;
    reason: string;
  };
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  theme: string;
  targetApp: 'pulse' | 'loop' | 'playhub' | 'vault' | 'mailbox' | 'feed';
  description: string;
  startingNodeId: string;
  chatPartnerId: string;
  nodes: Record<string, StoryNode>;
  summary: {
    takeaway: string;
    keyThemes: string[];
    alternativeReflections: string[];
  };
}

/* --------------------------------------------------------------------------
   ZOD SCHEMAS (Validation)
   -------------------------------------------------------------------------- */
export const MessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  senderType: z.enum(['player', 'contact', 'system', 'narrator']),
  text: z.string(),
  timestamp: z.string(),
});

export const ChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  targetNodeId: z.string(),
});

export const StoryNodeSchema = z.object({
  id: z.string(),
  messages: z.array(MessageSchema),
  choices: z.array(ChoiceSchema),
});
