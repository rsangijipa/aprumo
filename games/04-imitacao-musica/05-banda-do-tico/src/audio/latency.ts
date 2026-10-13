// src/audio/latency.ts
// Interactive latency measurement and compensation calibration.

import { transport } from './transport';
import { soundSynth } from './synth';

export interface CalibrationResult {
  averageOffsetMs: number;
  tapDeltas: number[];
  consistencyScore: number;
}

export class LatencyManager {
  private _offsetMs = 0;
  private readonly STORAGE_KEY = 'banda_do_tico_latency_offset_ms';

  // State during an 8-beat calibration run
  private isCalibrating = false;
  private calibrationTaps: number[] = [];
  private expectedBeatTimes: number[] = [];
  private calibrationCallbacks: ((step: number, total: number) => void)[] = [];

  constructor() {
    this.loadOffset();
  }

  public get offsetMs(): number {
    return this._offsetMs;
  }

  public set offsetMs(val: number) {
    this._offsetMs = Math.max(-250, Math.min(250, Math.round(val)));
    this.saveOffset();
  }

  /**
   * Applies compensation: converts raw tap performance time to compensated musical audio time.
   */
  public getCompensatedTime(rawAudioTime: number): number {
    return rawAudioTime - this._offsetMs / 1000;
  }

  private loadOffset(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored !== null) {
        this._offsetMs = parseInt(stored, 10) || 0;
      }
    } catch {
      this._offsetMs = 0;
    }
  }

  private saveOffset(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, this._offsetMs.toString());
    } catch {
      /* ignore storage failure */
    }
  }

  public startCalibration(onProgress: (step: number, total: number) => void): void {
    this.isCalibrating = true;
    this.calibrationTaps = [];
    this.expectedBeatTimes = [];
    this.calibrationCallbacks = [onProgress];

    // Ensure transport is running at 100 BPM for standard calibration
    transport.bpm = 100;
    transport.seek(0);
    transport.start();

    // Schedule 8 target beats
    const startBeat = Math.ceil(transport.currentBeat) + 2; // give 2 beats count-in
    for (let i = 0; i < 8; i++) {
      const targetBeat = startBeat + i;
      this.expectedBeatTimes.push(transport.beatToAudioTime(targetBeat));
    }
  }

  /**
   * Called whenever user taps during the calibration modal.
   */
  public recordCalibrationTap(tapAudioTime: number): CalibrationResult | null {
    if (!this.isCalibrating) return null;

    soundSynth.playInstrument('bloco', { time: tapAudioTime });
    
    // Find closest target beat
    let closestIndex = -1;
    let minDiff = Infinity;

    for (let i = 0; i < this.expectedBeatTimes.length; i++) {
      const diff = Math.abs(tapAudioTime - this.expectedBeatTimes[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    if (closestIndex !== -1 && minDiff < 0.4) {
      const deltaMs = (tapAudioTime - this.expectedBeatTimes[closestIndex]) * 1000;
      this.calibrationTaps.push(deltaMs);

      this.calibrationCallbacks.forEach((cb) => cb(this.calibrationTaps.length, 8));

      if (this.calibrationTaps.length >= 8) {
        return this.finishCalibration();
      }
    }

    return null;
  }

  public finishCalibration(): CalibrationResult {
    this.isCalibrating = false;
    if (this.calibrationTaps.length === 0) {
      return { averageOffsetMs: 0, tapDeltas: [], consistencyScore: 100 };
    }

    // Discard any extreme outlier, compute mean
    const sorted = [...this.calibrationTaps].sort((a, b) => a - b);
    const trimmed = sorted.slice(1, -1);
    const usable = trimmed.length > 0 ? trimmed : sorted;
    const avg = usable.reduce((acc, v) => acc + v, 0) / usable.length;

    this.offsetMs = Math.round(avg);

    // Consistency score (standard deviation)
    const variance = usable.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / usable.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(10, Math.min(100, Math.round(100 - stdDev * 1.5)));

    return {
      averageOffsetMs: this._offsetMs,
      tapDeltas: this.calibrationTaps,
      consistencyScore,
    };
  }

  public cancelCalibration(): void {
    this.isCalibrating = false;
    this.calibrationTaps = [];
  }
}

export const latencyManager = new LatencyManager();
