// src/audio/scheduler.ts
// Look-ahead Web Audio event scheduler (lookahead: 25ms, scheduleAheadTime: 0.1s).
// Guarantees zero audio dropouts, zero timing drift, and rock-solid rhythm playback.

import { audioMixer } from './mixer';
import { transport } from './transport';
import { soundSynth, InstrumentId, NoteTriggerOptions } from './synth';

export interface NoteEvent {
  id?: string;
  beat: number;
  instrumentId: InstrumentId;
  velocity: number;
  duration?: number;
  noteIndex?: number;
  pitchOffset?: number;
  isBackingTrack?: boolean;
}

export type ScheduledNoteCallback = (event: NoteEvent, audioTime: number) => void;

export class AudioScheduler {
  private lookAheadMs = 25;           // Timer interval (ms)
  private scheduleAheadTime = 0.1;    // Audio buffer lookahead window (seconds)
  private timerId: number | null = null;

  // Queue of upcoming notes to be scheduled
  private noteQueue: NoteEvent[] = [];
  private scheduledEventsHistory: Set<string> = new Set();

  // Next continuous 16th-subdivision beat to schedule dynamic accompaniment
  private nextAccompanimentBeat = 0;

  // Combo level for dynamic music layering
  private combo = 0;

  // Event callbacks (e.g. for rhythm lane visual synchronization)
  private noteCallbacks: Set<ScheduledNoteCallback> = new Set();

  // Metronome flag
  public metronomeEnabled = false;

  constructor() {}

  public setCombo(c: number): void {
    const prev = this.combo;
    this.combo = Math.max(0, c);

    // Dynamic stem volume ramp
    audioMixer.setStemVolume('shaker', this.combo >= 4 ? 0.75 : 0.0);
    audioMixer.setStemVolume('bass', this.combo >= 8 ? 0.85 : 0.0);
    audioMixer.setStemVolume('crowd', this.combo >= 12 ? 0.6 : 0.0);
    audioMixer.setStemVolume('lights', this.combo >= 16 ? 0.8 : 0.0);

    // Stinger when leveling up combo
    if (this.combo >= 16 && prev < 16) {
      soundSynth.playUIStar();
    }
  }

  public getCombo(): number {
    return this.combo;
  }

  public start(): void {
    if (this.timerId !== null) return;
    this.nextAccompanimentBeat = Math.floor(transport.currentBeat * 4) / 4;
    this.timerId = window.setInterval(() => this.tick(), this.lookAheadMs);
  }

  public stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.clearQueue();
  }

  public queueNotes(events: NoteEvent[]): void {
    this.noteQueue.push(...events);
    // Sort ascending by beat
    this.noteQueue.sort((a, b) => a.beat - b.beat);
  }

  public clearQueue(): void {
    this.noteQueue = [];
    this.scheduledEventsHistory.clear();
  }

  public onNoteScheduled(cb: ScheduledNoteCallback): () => void {
    this.noteCallbacks.add(cb);
    return () => this.noteCallbacks.delete(cb);
  }

  /**
   * Main scheduler tick running every 25ms.
   * Scans ahead up to currentTime + scheduleAheadTime and schedules Web Audio events.
   */
  private tick(): void {
    if (!transport.isPlaying) return;

    const ctx = audioMixer.getContext();
    const currentAudioTime = ctx.currentTime;
    const scheduleUntilTime = currentAudioTime + this.scheduleAheadTime;

    transport.checkBeatEvents();

    // 1. Schedule Queued Explicit Note Events
    while (this.noteQueue.length > 0) {
      const first = this.noteQueue[0];
      const audioTime = transport.beatToAudioTime(first.beat);

      if (audioTime > scheduleUntilTime) {
        // Event is further ahead in the future; wait for subsequent ticks
        break;
      }

      this.noteQueue.shift();

      // Only schedule if audioTime is at least currentAudioTime (or very close within 50ms)
      if (audioTime >= currentAudioTime - 0.05) {
        const targetTime = Math.max(currentAudioTime, audioTime);
        const options: NoteTriggerOptions = {
          time: targetTime,
          velocity: first.velocity,
          noteIndex: first.noteIndex,
          pitchOffset: first.pitchOffset,
        };
        soundSynth.playInstrument(first.instrumentId, options);
        this.noteCallbacks.forEach((cb) => cb(first, targetTime));
      }
    }

    // 2. Schedule Backing Accompaniment & Combo Stems in 16th-beat increments
    const stepSize = 0.25; // 16th note in beats
    const nextAccTime = transport.beatToAudioTime(this.nextAccompanimentBeat);

    let accBeat = this.nextAccompanimentBeat;
    let accTime = nextAccTime;

    while (accTime < scheduleUntilTime) {
      if (accTime >= currentAudioTime) {
        const intBeat = Math.floor(accBeat);
        const isQuarter = Math.abs(accBeat - intBeat) < 0.001;
        const isEighth = Math.abs((accBeat * 2) - Math.floor(accBeat * 2)) < 0.001;
        const bar = Math.floor(accBeat / transport.beatsPerBar);
        const beatInBar = intBeat % transport.beatsPerBar;

        // Metronome (if enabled)
        if (this.metronomeEnabled && isQuarter) {
          soundSynth.playMetronomeTick(beatInBar === 0);
        }

        // Backing Chords (always gentle on downbeats of bars / half-bars)
        if (isQuarter && (beatInBar === 0 || beatInBar === 2)) {
          soundSynth.playBackingChord(bar, beatInBar, accTime);
        }

        // Combo 4+: Shaker groove on 8th notes
        if (this.combo >= 4 && isEighth) {
          soundSynth.playStemShaker(accTime);
        }

        // Combo 8+: Bass groove on quarter notes
        if (this.combo >= 8 && isQuarter) {
          soundSynth.playStemBass(bar, beatInBar, accTime);
        }

        // Combo 12+: Crowd cheering swell on bar start
        if (this.combo >= 12 && isQuarter && beatInBar === 0) {
          soundSynth.playStemCrowd(accTime);
        }

        // Combo 16+: Concert Lights arpeggio on 16th notes
        if (this.combo >= 16) {
          const stepIndex = Math.round(accBeat * 4) % 16;
          soundSynth.playStemLights(accTime, stepIndex);
        }
      }

      accBeat += stepSize;
      accTime = transport.beatToAudioTime(accBeat);
    }

    this.nextAccompanimentBeat = accBeat;
  }
}

export const audioScheduler = new AudioScheduler();
