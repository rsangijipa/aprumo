import { CompletedStats } from '../types';

export interface UserPreferences {
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  tapToMoveEnabled: boolean;
  unlockedMaps: string[];
  history: CompletedStats[];
}

const STORAGE_KEY = 'mutirao_do_parque_save_v1';

const DEFAULT_PREFERENCES: UserPreferences = {
  musicVolume: 0.35,
  sfxVolume: 0.5,
  isMuted: false,
  tapToMoveEnabled: false,
  unlockedMaps: ['map_praca_pequena', 'map_parque_do_lago', 'map_parque_linear', 'map_jardim_cultural', 'map_parque_da_colina'],
  history: []
};

export class StorageSystem {
  public static loadPreferences(): UserPreferences {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return DEFAULT_PREFERENCES;
  }

  public static savePreferences(prefs: UserPreferences): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      }
    } catch (e) {
      console.warn('Could not write to localStorage', e);
    }
  }

  public static recordCompletedMatch(stats: CompletedStats): void {
    const prefs = this.loadPreferences();
    prefs.history.unshift(stats);
    // Keep last 30 matches
    if (prefs.history.length > 30) {
      prefs.history.pop();
    }
    this.savePreferences(prefs);
  }
}
