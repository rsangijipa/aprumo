import { create } from 'zustand';
import { EPISODES } from '../content/episodes';
import type { Choice, Indicators } from '../types';
import { sound } from '../../audio/audioEngine';

export interface GameSettings {
  theme: 'dark' | 'light';
  highContrast: boolean;
  dyslexicFont: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  reducedMotion: boolean;
  audioEnabled: boolean;
  audioVolume: number;
  speechEnabled: boolean;
  typingSpeed: 'normal' | 'fast' | 'instant';
}

export interface NexoNotification {
  id: string;
  app: 'pulse' | 'loop' | 'playhub' | 'vault' | 'mailbox' | 'feed';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export type AppId = 'launcher' | 'pulse' | 'loop' | 'playhub' | 'vault' | 'mailbox' | 'feed' | 'settings';
export type ModalType = 
  | null 
  | 'pensar_antes' 
  | 'context_drawer' 
  | 'profile' 
  | 'episode_summary' 
  | 'minigame_url' 
  | 'minigame_print' 
  | 'minigame_perms'
  | 'all_episodes';

interface NarrativeStoreState {
  // Navigation & Screen Stack
  activeApp: AppId;
  screenStack: AppId[];
  activeModal: ModalType;
  selectedProfileId: string | null;

  // Narrative Progress
  currentEpisodeId: string;
  currentNodeId: string;
  completedEpisodeIds: string[];
  currentPerspective: string; // 'player' or character id
  isTyping: boolean;

  // Indicators (Neutros)
  indicators: Indicators;

  // History & Facts
  knownFacts: string[];
  flags: Record<string, boolean | string>;
  blockedContacts: string[];
  reportedContacts: string[];

  // OS Simulation
  notifications: NexoNotification[];
  settings: GameSettings;

  // Actions
  openApp: (app: AppId) => void;
  closeApp: () => void;
  setModal: (modal: ModalType, profileId?: string) => void;
  startEpisode: (episodeId: string) => void;
  advanceToNode: (nodeId: string) => void;
  makeChoice: (choice: Choice) => void;
  switchPerspective: (characterId: string) => void;
  resetPerspective: () => void;
  blockContact: (contactId: string) => void;
  reportContact: (contactId: string) => void;
  markNotificationRead: (id: string) => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetProgress: () => void;
}

const STORAGE_KEY = 'vida_online_nexo_state_v1';

const DEFAULT_SETTINGS: GameSettings = {
  theme: 'dark',
  highContrast: false,
  dyslexicFont: false,
  fontSize: 'normal',
  reducedMotion: false,
  audioEnabled: true,
  audioVolume: 0.6,
  speechEnabled: false,
  typingSpeed: 'normal'
};

const DEFAULT_INDICATORS: Indicators = {
  privacidade: 50,
  clareza: 50,
  limites: 50,
  confianca: 50
};

// Carregar dados salvos do localStorage
const loadPersistedState = (): Partial<NarrativeStoreState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Erro ao carregar save local:', err);
  }
  return {};
};

const saveToLocalStorage = (state: Partial<NarrativeStoreState>) => {
  try {
    const toSave = {
      currentEpisodeId: state.currentEpisodeId,
      currentNodeId: state.currentNodeId,
      completedEpisodeIds: state.completedEpisodeIds,
      indicators: state.indicators,
      knownFacts: state.knownFacts,
      flags: state.flags,
      blockedContacts: state.blockedContacts,
      reportedContacts: state.reportedContacts,
      settings: state.settings
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.warn('Erro ao salvar localmente:', err);
  }
};

export const useNarrativeStore = create<NarrativeStoreState>((set, get) => {
  const persisted = loadPersistedState();

  return {
    activeApp: 'pulse',
    screenStack: ['launcher', 'pulse'],
    activeModal: null,
    selectedProfileId: null,

    currentEpisodeId: persisted.currentEpisodeId || 'ep1',
    currentNodeId: persisted.currentNodeId || 'ep1_start',
    completedEpisodeIds: persisted.completedEpisodeIds || [],
    currentPerspective: 'player',
    isTyping: false,

    indicators: persisted.indicators || DEFAULT_INDICATORS,
    knownFacts: persisted.knownFacts || ['Você começou a usar seu novo dispositivo Nexo OS.'],
    flags: persisted.flags || {},
    blockedContacts: persisted.blockedContacts || [],
    reportedContacts: persisted.reportedContacts || [],

    notifications: [
      {
        id: 'notif_welcome',
        app: 'pulse',
        title: 'Novo Grupo',
        body: 'Rafa adicionou você ao grupo Turma 9B.',
        timestamp: '14:20',
        read: false
      }
    ],

    settings: persisted.settings ? { ...DEFAULT_SETTINGS, ...persisted.settings } : DEFAULT_SETTINGS,

    openApp: (app: AppId) => {
      sound.playTap();
      set((state) => ({
        activeApp: app,
        screenStack: state.screenStack.includes(app) 
          ? [...state.screenStack.filter((a) => a !== app), app]
          : [...state.screenStack, app]
      }));
    },

    closeApp: () => {
      sound.playTap();
      set((state) => {
        if (state.screenStack.length <= 1) {
          return { activeApp: 'launcher', screenStack: ['launcher'] };
        }
        const nextStack = state.screenStack.slice(0, -1);
        return {
          screenStack: nextStack,
          activeApp: nextStack[nextStack.length - 1]
        };
      });
    },

    setModal: (modal: ModalType, profileId?: string) => {
      if (modal) sound.playTap();
      set({ activeModal: modal, selectedProfileId: profileId || null });
    },

    startEpisode: (episodeId: string) => {
      const episode = EPISODES.find((e) => e.id === episodeId);
      if (!episode) return;
      sound.playNotification();

      set({
        currentEpisodeId: episode.id,
        currentNodeId: episode.startingNodeId,
        activeApp: episode.targetApp,
        currentPerspective: 'player',
        activeModal: null
      });

      // Salva progresso
      saveToLocalStorage(get());
    },

    advanceToNode: (nodeId: string) => {
      set({ currentNodeId: nodeId });
      saveToLocalStorage(get());
    },

    makeChoice: (choice: Choice) => {
      sound.playMessageSent();
      const state = get();
      const currentEp = EPISODES.find((e) => e.id === state.currentEpisodeId);
      const targetNode = currentEp?.nodes[choice.targetNodeId];

      // Atualizar indicadores neutros (com clamp 0-100)
      const newIndicators = { ...state.indicators };
      if (choice.effects?.indicatorChanges) {
        (Object.keys(choice.effects.indicatorChanges) as (keyof Indicators)[]).forEach((key) => {
          const delta = choice.effects?.indicatorChanges?.[key] || 0;
          newIndicators[key] = Math.max(0, Math.min(100, newIndicators[key] + delta));
        });
      }

      // Adicionar novos fatos conhecidos
      const newFacts = choice.effects?.addFacts 
        ? [...state.knownFacts, ...choice.effects.addFacts]
        : state.knownFacts;

      // Atualizar flags de história
      const newFlags = choice.effects?.setFlags
        ? { ...state.flags, ...choice.effects.setFlags }
        : state.flags;

      // Notificação disparada
      const newNotifications = [...state.notifications];
      if (choice.effects?.triggerNotification) {
        newNotifications.unshift({
          id: 'notif_' + Date.now(),
          app: choice.effects.triggerNotification.app as NexoNotification['app'],
          title: choice.effects.triggerNotification.title,
          body: choice.effects.triggerNotification.body,
          timestamp: 'Agora',
          read: false
        });
        sound.playNotification();
      }

      // Checa se o nó final de sumário foi alcançado
      let newCompleted = state.completedEpisodeIds;
      if (choice.targetNodeId.includes('summary')) {
        sound.playChapterComplete();
        if (!newCompleted.includes(state.currentEpisodeId)) {
          newCompleted = [...newCompleted, state.currentEpisodeId];
        }
        set({
          activeModal: 'episode_summary',
          completedEpisodeIds: newCompleted,
          indicators: newIndicators,
          knownFacts: newFacts,
          flags: newFlags,
          notifications: newNotifications
        });
        saveToLocalStorage(get());
        return;
      }

      // Simular indicador de digitação se o próximo nó tem mensagens de contatos
      const nextNodeHasContact = targetNode?.messages.some((m) => m.senderType === 'contact');
      if (nextNodeHasContact && state.settings.typingSpeed !== 'instant') {
        set({ isTyping: true });
        const delay = state.settings.typingSpeed === 'fast' ? 700 : 1300;
        setTimeout(() => {
          sound.playMessageReceived();
          set({
            isTyping: false,
            currentNodeId: choice.targetNodeId,
            indicators: newIndicators,
            knownFacts: newFacts,
            flags: newFlags,
            notifications: newNotifications
          });
          saveToLocalStorage(get());
        }, delay);
      } else {
        if (nextNodeHasContact) sound.playMessageReceived();
        set({
          currentNodeId: choice.targetNodeId,
          indicators: newIndicators,
          knownFacts: newFacts,
          flags: newFlags,
          notifications: newNotifications
        });
        saveToLocalStorage(get());
      }
    },

    switchPerspective: (characterId: string) => {
      sound.playMystery();
      set({ currentPerspective: characterId });
    },

    resetPerspective: () => {
      sound.playTap();
      set({ currentPerspective: 'player' });
    },

    blockContact: (contactId: string) => {
      sound.playMystery();
      set((state) => {
        const nextBlocked = state.blockedContacts.includes(contactId)
          ? state.blockedContacts
          : [...state.blockedContacts, contactId];
        const nextFacts = [...state.knownFacts, `Você bloqueou o contato @${contactId}.`];
        return { blockedContacts: nextBlocked, knownFacts: nextFacts };
      });
      saveToLocalStorage(get());
    },

    reportContact: (contactId: string) => {
      sound.playMystery();
      set((state) => {
        const nextReported = state.reportedContacts.includes(contactId)
          ? state.reportedContacts
          : [...state.reportedContacts, contactId];
        const nextFacts = [...state.knownFacts, `Você reportou o perfil @${contactId} para a moderação Nexo.`];
        return { reportedContacts: nextReported, knownFacts: nextFacts };
      });
      saveToLocalStorage(get());
    },

    markNotificationRead: (id: string) => {
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      }));
    },

    updateSettings: (newSettings: Partial<GameSettings>) => {
      set((state) => {
        const merged = { ...state.settings, ...newSettings };
        if (newSettings.audioEnabled !== undefined) {
          sound.setEnabled(newSettings.audioEnabled);
        }
        if (newSettings.audioVolume !== undefined) {
          sound.setVolume(newSettings.audioVolume);
        }
        saveToLocalStorage({ ...state, settings: merged });
        return { settings: merged };
      });
    },

    resetProgress: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({
        currentEpisodeId: 'ep1',
        currentNodeId: 'ep1_start',
        completedEpisodeIds: [],
        currentPerspective: 'player',
        indicators: DEFAULT_INDICATORS,
        knownFacts: ['Você começou a usar seu novo dispositivo Nexo OS.'],
        flags: {},
        blockedContacts: [],
        reportedContacts: [],
        activeModal: null,
        activeApp: 'pulse'
      });
      sound.playNotification();
    }
  };
});
