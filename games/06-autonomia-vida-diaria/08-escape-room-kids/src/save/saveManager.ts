// ==========================================================================
// ESCAPE ROOM KIDS — SAVE & PROGRESSION MANAGER (IndexedDB & LocalStorage)
// ==========================================================================

export interface GameSaveData {
  ageProfile: '6+' | '9+' | 'teens';
  activeRoomId: string;
  completedRooms: string[];
  solvedPuzzles: Record<string, string[]>;
  stars: Record<string, number>;
  inventoryItemIds: string[];
  settings: {
    pointAndClickOnly: boolean;
    reducedMotion: boolean;
    visualAudio: boolean;
    highContrast: boolean;
    soundVolume: number;
    isMuted: boolean;
  };
  lastSavedAt: number;
}

const DB_NAME = 'EscapeRoomKidsDB';
const DB_VERSION = 1;
const STORE_NAME = 'saveData';
const SAVE_KEY = 'current_profile';

const DEFAULT_SAVE: GameSaveData = {
  ageProfile: '9+',
  activeRoomId: 'workshop',
  completedRooms: [],
  solvedPuzzles: {
    workshop: [],
    library: [],
    greenhouse: [],
  },
  stars: {
    workshop: 0,
    library: 0,
    greenhouse: 0,
  },
  inventoryItemIds: [],
  settings: {
    pointAndClickOnly: false,
    reducedMotion: false,
    visualAudio: true,
    highContrast: false,
    soundVolume: 0.7,
    isMuted: false,
  },
  lastSavedAt: Date.now(),
};

class SaveManager {
  private db: IDBDatabase | null = null;
  private isReady: Promise<void>;

  constructor() {
    this.isReady = this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => {
        console.warn('Error opening IndexedDB, falling back to LocalStorage', request.error);
        resolve();
      };
    });
  }

  public async save(data: GameSaveData): Promise<void> {
    await this.isReady;
    data.lastSavedAt = Date.now();

    // 1. Try IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(data, SAVE_KEY);
      } catch (e) {
        console.warn('IndexedDB save failed, falling back', e);
      }
    }

    // 2. LocalStorage backup
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('escape_room_kids_save', JSON.stringify(data));
      } catch (e) {
        console.warn('LocalStorage save failed', e);
      }
    }
  }

  public async load(): Promise<GameSaveData> {
    await this.isReady;

    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(SAVE_KEY);

        const idbData = await new Promise<GameSaveData | null>((resolve) => {
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        });

        if (idbData) {
          return { ...DEFAULT_SAVE, ...idbData };
        }
      } catch (e) {
        console.warn('IndexedDB read failed, falling back', e);
      }
    }

    // Fallback to LocalStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem('escape_room_kids_save');
        if (raw) {
          return { ...DEFAULT_SAVE, ...JSON.parse(raw) };
        }
      } catch (e) {
        console.warn('Failed to parse LocalStorage save', e);
      }
    }

    return { ...DEFAULT_SAVE };
  }

  public async resetProgress(): Promise<GameSaveData> {
    const fresh = { ...DEFAULT_SAVE, lastSavedAt: Date.now() };
    await this.save(fresh);
    return fresh;
  }
}

export const saveManager = new SaveManager();
