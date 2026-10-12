// src/tests/sequencer.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { BeatSequencer } from '../composer/Sequencer';

describe('BeatSequencer', () => {
  let seq: BeatSequencer;

  beforeEach(() => {
    seq = new BeatSequencer();
  });

  it('initializes default tracks with correct step count', () => {
    expect(seq.tracks.length).toBeGreaterThanOrEqual(8);
    expect(seq.stepCount).toBe(16);
    expect(seq.tracks[0].steps.length).toBe(16);
  });

  it('toggles steps on and off', () => {
    seq.clearAll();
    const turnedOn = seq.toggleStep(0, 4);
    expect(turnedOn).toBe(true);
    expect(seq.tracks[0].steps[4]).toBe(true);

    const turnedOff = seq.toggleStep(0, 4);
    expect(turnedOff).toBe(false);
    expect(seq.tracks[0].steps[4]).toBe(false);
  });

  it('changes step count between 8 and 16', () => {
    seq.setStepCount(8);
    expect(seq.stepCount).toBe(8);
    expect(seq.tracks[0].steps.length).toBe(8);

    seq.setStepCount(16);
    expect(seq.stepCount).toBe(16);
    expect(seq.tracks[0].steps.length).toBe(16);
  });

  it('loads presets properly', () => {
    seq.loadPreset('Samba Pop');
    const hasAnyActive = seq.tracks.some((t) => t.steps.some((s) => s === true));
    expect(hasAnyActive).toBe(true);
  });
});
