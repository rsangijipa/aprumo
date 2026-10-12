// src/rhythm/scoring/judgment.ts
// Positive reinforcement, accessible timing evaluation, combo calculation, and feedback tracking.

import { InstrumentId } from '../../audio/synth';
import { audioScheduler } from '../../audio/scheduler';
import { latencyManager } from '../../audio/latency';

export type JudgementType = 'perfect' | 'good' | 'gentle';

export interface RhythmAttempt {
  patternId: string;
  expectedBeat: number;
  actualTime: number;
  deltaMs: number;
  judgement: JudgementType;
  instrumentId: InstrumentId;
  comboAfter: number;
}

export interface TimingConfig {
  perfectWindowMs: number;
  goodWindowMs: number;
  isAccessible: boolean;
  judgmentFree: boolean; // Sandbox / gentle encouragement mode
}

export class RhythmJudge {
  private config: TimingConfig = {
    perfectWindowMs: 90,
    goodWindowMs: 180,
    isAccessible: false,
    judgmentFree: false,
  };

  private currentCombo = 0;
  private maxCombo = 0;
  private totalNotesPlayed = 0;
  private perfectCount = 0;
  private goodCount = 0;
  private attemptsHistory: RhythmAttempt[] = [];

  constructor() {
    this.loadSettings();
  }

  public get combo(): number {
    return this.currentCombo;
  }

  public get stats() {
    return {
      currentCombo: this.currentCombo,
      maxCombo: this.maxCombo,
      totalNotesPlayed: this.totalNotesPlayed,
      perfectCount: this.perfectCount,
      goodCount: this.goodCount,
      comboLevel: this.getComboMilestone(this.currentCombo),
    };
  }

  public setAccessibleMode(enabled: boolean): void {
    this.config.isAccessible = enabled;
    if (enabled) {
      this.config.perfectWindowMs = 160;
      this.config.goodWindowMs = 300;
    } else {
      this.config.perfectWindowMs = 90;
      this.config.goodWindowMs = 180;
    }
    this.saveSettings();
  }

  public setJudgmentFreeMode(enabled: boolean): void {
    this.config.judgmentFree = enabled;
    this.saveSettings();
  }

  public isAccessible(): boolean {
    return this.config.isAccessible;
  }

  public isJudgmentFree(): boolean {
    return this.config.judgmentFree;
  }

  public resetCombo(): void {
    this.currentCombo = 0;
    audioScheduler.setCombo(0);
  }

  public resetSession(): void {
    this.currentCombo = 0;
    this.maxCombo = 0;
    this.totalNotesPlayed = 0;
    this.perfectCount = 0;
    this.goodCount = 0;
    this.attemptsHistory = [];
    audioScheduler.setCombo(0);
  }

  /**
   * Evaluates a player tap against an expected beat event.
   */
  public evaluateTap(
    expectedAudioTime: number,
    rawTapAudioTime: number,
    expectedBeat: number,
    instrumentId: InstrumentId,
    patternId = 'freestyle'
  ): RhythmAttempt {
    this.totalNotesPlayed++;

    // Apply measured calibration offset
    const compensatedTime = latencyManager.getCompensatedTime(rawTapAudioTime);
    const deltaMs = (compensatedTime - expectedAudioTime) * 1000;
    const absDelta = Math.abs(deltaMs);

    let judgement: JudgementType = 'gentle';

    if (this.config.judgmentFree) {
      // In sandbox / judgment free mode, every tap is celebrated!
      judgement = 'perfect';
      this.currentCombo++;
    } else if (absDelta <= this.config.perfectWindowMs) {
      judgement = 'perfect';
      this.perfectCount++;
      this.currentCombo++;
    } else if (absDelta <= this.config.goodWindowMs) {
      judgement = 'good';
      this.goodCount++;
      this.currentCombo++;
    } else {
      // Out of timing window: NEVER a punitive "MISS".
      // Gentle ripple feedback: softly decay combo without buzzers or audio cutouts!
      judgement = 'gentle';
      this.currentCombo = Math.max(0, this.currentCombo - 2); // gradual layer reduction
    }

    if (this.currentCombo > this.maxCombo) {
      this.maxCombo = this.currentCombo;
    }

    // Sync combo with audioScheduler to additively bring in dynamic stems (shaker, bass, crowd, lights)
    audioScheduler.setCombo(this.currentCombo);

    const attempt: RhythmAttempt = {
      patternId,
      expectedBeat,
      actualTime: compensatedTime,
      deltaMs,
      judgement,
      instrumentId,
      comboAfter: this.currentCombo,
    };

    this.attemptsHistory.push(attempt);
    return attempt;
  }

  /**
   * Helper to describe the active musical layer unlocked by the current combo.
   */
  public getComboMilestone(c: number): string {
    if (c >= 16) return '✨ Luzes de Palco & Estrelas!';
    if (c >= 12) return '🎉 Plateia Batendo Palmas!';
    if (c >= 8)  return '🎸 Linha de Baixo Conectada!';
    if (c >= 4)  return '🪇 Chocalho no Balanço!';
    return '🎵 Ritmo Inicial';
  }

  private loadSettings(): void {
    try {
      const storedAcc = localStorage.getItem('banda_accessible_timing');
      if (storedAcc !== null) {
        this.setAccessibleMode(storedAcc === 'true');
      }
      const storedFree = localStorage.getItem('banda_judgment_free');
      if (storedFree !== null) {
        this.setJudgmentFreeMode(storedFree === 'true');
      }
    } catch {}
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('banda_accessible_timing', String(this.config.isAccessible));
      localStorage.setItem('banda_judgment_free', String(this.config.judgmentFree));
    } catch {}
  }
}

export const rhythmJudge = new RhythmJudge();
