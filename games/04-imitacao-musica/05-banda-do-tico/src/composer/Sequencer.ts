// src/composer/Sequencer.ts
// Interactive step sequencer for "Crie Seu Beat" mode (8 or 16 steps, solo/mute, presets, save/export).

import { transport } from '../audio/transport';
import { soundSynth, InstrumentId } from '../audio/synth';
import { storageManager, SavedBeat } from '../save/storage';
import { INSTRUMENTS } from '../data/instruments';

export interface SequencerTrack {
  instrumentId: InstrumentId;
  name: string;
  color: string;
  steps: boolean[];
  muted: boolean;
  solo: boolean;
}

export class BeatSequencer {
  public stepCount: 8 | 16 = 16;
  public tracks: SequencerTrack[] = [];
  public isRunning = false;
  private currentStepIndex = 0;
  private lastScheduledStep = -1;
  private activeStepListeners: ((step: number) => void)[] = [];

  constructor() {
    this.initDefaultTracks();
  }

  public initDefaultTracks(): void {
    // Pick the most distinct percussion & melodic instruments for the sequencer
    const chosenIds: InstrumentId[] = [
      'bumbo',
      'caixa',
      'tambor',
      'pandeiro',
      'chocalho',
      'palmas',
      'triangulo',
      'agogo',
      'xilofone',
      'prato',
    ];

    this.tracks = chosenIds.map((id) => {
      const def = INSTRUMENTS.find((inst) => inst.id === id)!;
      return {
        instrumentId: id,
        name: def.name,
        color: def.color,
        steps: new Array(this.stepCount).fill(false),
        muted: false,
        solo: false,
      };
    });

    // Seed with a fun default groove: Samba-Funk introductory pattern
    this.loadPreset('Samba Pop');
  }

  public setStepCount(count: 8 | 16): void {
    this.stepCount = count;
    this.tracks.forEach((track) => {
      const newSteps = new Array(count).fill(false);
      for (let i = 0; i < Math.min(track.steps.length, count); i++) {
        newSteps[i] = track.steps[i];
      }
      track.steps = newSteps;
    });
  }

  public toggleStep(trackIndex: number, stepIndex: number): boolean {
    if (this.tracks[trackIndex] && stepIndex < this.stepCount) {
      const val = !this.tracks[trackIndex].steps[stepIndex];
      this.tracks[trackIndex].steps[stepIndex] = val;
      if (val) {
        // Immediate preview sound when clicking step
        soundSynth.playInstrument(this.tracks[trackIndex].instrumentId, { velocity: 0.9 });
      }
      return val;
    }
    return false;
  }

  public toggleMute(trackIndex: number): void {
    if (this.tracks[trackIndex]) {
      this.tracks[trackIndex].muted = !this.tracks[trackIndex].muted;
    }
  }

  public toggleSolo(trackIndex: number): void {
    if (this.tracks[trackIndex]) {
      const current = this.tracks[trackIndex].solo;
      this.tracks[trackIndex].solo = !current;
    }
  }

  public clearAll(): void {
    this.tracks.forEach((t) => {
      t.steps.fill(false);
      t.muted = false;
      t.solo = false;
    });
  }

  public onStepChange(cb: (step: number) => void): () => void {
    this.activeStepListeners.push(cb);
    return () => {
      this.activeStepListeners = this.activeStepListeners.filter((c) => c !== cb);
    };
  }

  public start(): void {
    this.isRunning = true;
    transport.start();
    this.lastScheduledStep = -1;
  }

  public stop(): void {
    this.isRunning = false;
    transport.pause();
    this.currentStepIndex = 0;
    this.activeStepListeners.forEach((cb) => cb(0));
  }

  public toggle(): void {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Called per frame or audio tick. Schedules upcoming sequencer steps.
   */
  public update(lookaheadAudioTime: number): void {
    if (!this.isRunning) return;

    // Steps occur on 16th notes (4 steps per quarter beat)
    const currentFractionalBeat = transport.currentBeat;
    const rawStep = Math.floor(currentFractionalBeat * (this.stepCount / 4));
    const stepInPattern = ((rawStep % this.stepCount) + this.stepCount) % this.stepCount;

    if (rawStep !== this.lastScheduledStep) {
      this.lastScheduledStep = rawStep;
      this.currentStepIndex = stepInPattern;
      this.activeStepListeners.forEach((cb) => cb(stepInPattern));

      // Any solo active?
      const hasSolo = this.tracks.some((t) => t.solo);

      this.tracks.forEach((track) => {
        if (track.muted) return;
        if (hasSolo && !track.solo) return;

        if (track.steps[stepInPattern]) {
          soundSynth.playInstrument(track.instrumentId, {
            time: lookaheadAudioTime,
            velocity: stepInPattern % 4 === 0 ? 1.0 : 0.8,
            noteIndex: stepInPattern % 6,
          });
        }
      });
    }
  }

  public saveToStorage(name = 'Meu Beat Incrível'): SavedBeat {
    const beat: SavedBeat = {
      id: 'beat_' + Date.now(),
      name,
      date: new Date().toLocaleDateString('pt-BR'),
      bpm: transport.bpm,
      stepsCount: this.stepCount,
      tracks: this.tracks.map((t) => ({
        instrumentId: t.instrumentId,
        steps: [...t.steps],
        muted: t.muted,
        solo: t.solo,
      })),
    };
    storageManager.saveBeat(beat);
    return beat;
  }

  public loadFromStorage(saved: SavedBeat): void {
    this.stepCount = saved.stepsCount;
    transport.bpm = saved.bpm;
    this.tracks.forEach((track) => {
      const match = saved.tracks.find((st) => st.instrumentId === track.instrumentId);
      if (match) {
        track.steps = [...match.steps];
        track.muted = match.muted;
        track.solo = match.solo;
      } else {
        track.steps = new Array(this.stepCount).fill(false);
      }
    });
  }

  public loadPreset(name: 'Samba Pop' | 'Baião Astral' | 'Funk Alegria' | 'Banda Rock'): void {
    this.clearAll();
    const findTrack = (id: InstrumentId) => this.tracks.find((t) => t.instrumentId === id);

    const bumbo = findTrack('bumbo');
    const caixa = findTrack('caixa');
    const pandeiro = findTrack('pandeiro');
    const chocalho = findTrack('chocalho');
    const agogo = findTrack('agogo');
    const xilofone = findTrack('xilofone');
    const prato = findTrack('prato');

    if (name === 'Samba Pop') {
      if (bumbo) [0, 4, 8, 12].forEach((i) => (bumbo.steps[i] = true));
      if (caixa) [4, 12].forEach((i) => (caixa.steps[i] = true));
      if (pandeiro) [2, 6, 10, 14].forEach((i) => (pandeiro.steps[i] = true));
      if (chocalho) [0, 2, 4, 6, 8, 10, 12, 14].forEach((i) => (chocalho.steps[i] = true));
      if (agogo) [0, 3, 6, 10, 12].forEach((i) => (agogo.steps[i] = true));
      if (prato) [0, 14].forEach((i) => (prato.steps[i] = true));
    } else if (name === 'Baião Astral') {
      if (bumbo) [0, 3, 8, 11].forEach((i) => (bumbo.steps[i] = true));
      if (caixa) [4, 12].forEach((i) => (caixa.steps[i] = true));
      if (chocalho) [0, 2, 4, 6, 8, 10, 12, 14].forEach((i) => (chocalho.steps[i] = true));
      if (xilofone) [0, 6, 8, 14].forEach((i) => (xilofone.steps[i] = true));
    } else if (name === 'Funk Alegria') {
      if (bumbo) [0, 6, 8, 14].forEach((i) => (bumbo.steps[i] = true));
      if (caixa) [3, 4, 11, 12].forEach((i) => (caixa.steps[i] = true));
      if (prato) [0].forEach((i) => (prato.steps[i] = true));
    } else if (name === 'Banda Rock') {
      if (bumbo) [0, 6, 8].forEach((i) => (bumbo.steps[i] = true));
      if (caixa) [4, 12].forEach((i) => (caixa.steps[i] = true));
      if (prato) [0, 8].forEach((i) => (prato.steps[i] = true));
      if (chocalho) [0, 2, 4, 6, 8, 10, 12, 14].forEach((i) => (chocalho.steps[i] = true));
    }
  }
}

export const beatSequencer = new BeatSequencer();
