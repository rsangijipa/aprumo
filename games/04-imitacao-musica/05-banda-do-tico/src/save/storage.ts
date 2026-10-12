// src/save/storage.ts
// Local persistent storage for player beats, performance stats, and preferences.

import { InstrumentId } from '../audio/synth';

export interface SavedBeat {
  id: string;
  name: string;
  date: string;
  bpm: number;
  stepsCount: 8 | 16;
  tracks: {
    instrumentId: InstrumentId;
    steps: boolean[];
    muted: boolean;
    solo: boolean;
  }[];
}

export interface PlayerSettings {
  masterVolume: number;
  instrumentsVolume: number;
  musicVolume: number;
  latencyOffsetMs: number;
  accessibleTiming: boolean;
  judgmentFree: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  visualMode: 'pulse' | 'track' | 'pictogram';
}

const SETTINGS_KEY = 'banda_do_tico_settings';
const BEATS_KEY = 'banda_do_tico_saved_beats';

export class StorageManager {
  public getSettings(): PlayerSettings {
    const defaults: PlayerSettings = {
      masterVolume: 0.9,
      instrumentsVolume: 0.95,
      musicVolume: 0.8,
      latencyOffsetMs: 0,
      accessibleTiming: false,
      judgmentFree: false,
      reducedMotion: false,
      highContrast: false,
      visualMode: 'pulse',
    };

    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...defaults, ...JSON.parse(stored) };
      }
    } catch {}
    return defaults;
  }

  public saveSettings(settings: Partial<PlayerSettings>): void {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch {}
  }

  public getSavedBeats(): SavedBeat[] {
    try {
      const stored = localStorage.getItem(BEATS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [];
  }

  public saveBeat(beat: SavedBeat): void {
    try {
      const list = this.getSavedBeats().filter((b) => b.id !== beat.id);
      list.unshift(beat);
      localStorage.setItem(BEATS_KEY, JSON.stringify(list));
    } catch {}
  }

  public deleteBeat(id: string): void {
    try {
      const list = this.getSavedBeats().filter((b) => b.id !== id);
      localStorage.setItem(BEATS_KEY, JSON.stringify(list));
    } catch {}
  }
}

export const storageManager = new StorageManager();
