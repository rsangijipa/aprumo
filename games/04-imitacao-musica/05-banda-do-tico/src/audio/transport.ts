// src/audio/transport.ts
// Precision musical clock driven strictly by Web Audio AudioContext.currentTime.

import { audioMixer } from './mixer';

export type BeatListener = (beat: number, bar: number, beatInBar: number) => void;

export class Transport {
  private _bpm = 100;
  private _beatsPerBar = 4;
  private _isPlaying = false;

  private startAudioTime = 0;
  private pausedBeat = 0;

  private beatListeners: Set<BeatListener> = new Set();
  private lastFiredBeat = -1;

  constructor() {}

  public get bpm(): number {
    return this._bpm;
  }

  public set bpm(value: number) {
    const clamped = Math.max(50, Math.min(180, Math.round(value)));
    if (this._bpm !== clamped) {
      if (this._isPlaying) {
        // Adjust startAudioTime so currentBeat remains continuous
        const currentB = this.currentBeat;
        this._bpm = clamped;
        const ctx = audioMixer.getContext();
        this.startAudioTime = ctx.currentTime - (currentB * 60) / this._bpm;
      } else {
        this._bpm = clamped;
      }
    }
  }

  public get beatsPerBar(): number {
    return this._beatsPerBar;
  }

  public set beatsPerBar(val: number) {
    this._beatsPerBar = Math.max(1, Math.min(16, val));
  }

  public get isPlaying(): boolean {
    return this._isPlaying;
  }

  public get secondsPerBeat(): number {
    return 60 / this._bpm;
  }

  /**
   * Current fractional beat computed accurately from AudioContext.currentTime
   */
  public get currentBeat(): number {
    if (!this._isPlaying) {
      return this.pausedBeat;
    }
    const ctx = audioMixer.getContext();
    const elapsedSeconds = ctx.currentTime - this.startAudioTime;
    return Math.max(0, (elapsedSeconds / 60) * this._bpm);
  }

  /**
   * Current integer bar
   */
  public get currentBar(): number {
    return Math.floor(this.currentBeat / this._beatsPerBar);
  }

  /**
   * Current beat within the bar (0 to beatsPerBar - 1)
   */
  public get currentBeatInBar(): number {
    return Math.floor(this.currentBeat) % this._beatsPerBar;
  }

  public start(): void {
    if (this._isPlaying) return;
    const ctx = audioMixer.getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    this.startAudioTime = ctx.currentTime - (this.pausedBeat * 60) / this._bpm;
    this._isPlaying = true;
    this.lastFiredBeat = Math.floor(this.pausedBeat) - 1;
  }

  public pause(): void {
    if (!this._isPlaying) return;
    this.pausedBeat = this.currentBeat;
    this._isPlaying = false;
  }

  public toggle(): void {
    if (this._isPlaying) {
      this.pause();
    } else {
      this.start();
    }
  }

  public seek(beat: number): void {
    const clamped = Math.max(0, beat);
    this.pausedBeat = clamped;
    this.lastFiredBeat = Math.floor(clamped) - 1;
    if (this._isPlaying) {
      const ctx = audioMixer.getContext();
      this.startAudioTime = ctx.currentTime - (clamped * 60) / this._bpm;
    }
  }

  /**
   * Converts a given beat number to the precise AudioContext.currentTime when it will occur.
   */
  public beatToAudioTime(beat: number): number {
    return this.startAudioTime + (beat * 60) / this._bpm;
  }

  /**
   * Converts a given AudioContext.currentTime into fractional musical beats.
   */
  public audioTimeToBeat(time: number): number {
    return ((time - this.startAudioTime) / 60) * this._bpm;
  }

  /**
   * Subscribe to integer beat events for UI synchronization.
   */
  public onBeat(listener: BeatListener): () => void {
    this.beatListeners.add(listener);
    return () => this.beatListeners.delete(listener);
  }

  /**
   * Called by update/scheduler loop to dispatch beat notifications to UI.
   */
  public checkBeatEvents(): void {
    if (!this._isPlaying) return;
    const intBeat = Math.floor(this.currentBeat);
    if (intBeat > this.lastFiredBeat) {
      this.lastFiredBeat = intBeat;
      const bar = Math.floor(intBeat / this._beatsPerBar);
      const beatInBar = intBeat % this._beatsPerBar;
      this.beatListeners.forEach((l) => l(intBeat, bar, beatInBar));
    }
  }
}

export const transport = new Transport();
