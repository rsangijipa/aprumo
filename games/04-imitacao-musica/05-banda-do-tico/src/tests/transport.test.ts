// src/tests/transport.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Transport } from '../audio/transport';

describe('Transport Clock & Beat Math', () => {
  let transport: Transport;

  beforeEach(() => {
    transport = new Transport();
    transport.bpm = 100;
  });

  it('clamps BPM within safe musical limits (50 to 180)', () => {
    transport.bpm = 30;
    expect(transport.bpm).toBe(50);

    transport.bpm = 220;
    expect(transport.bpm).toBe(180);

    transport.bpm = 120;
    expect(transport.bpm).toBe(120);
  });

  it('calculates secondsPerBeat accurately', () => {
    transport.bpm = 120;
    expect(transport.secondsPerBeat).toBeCloseTo(0.5);

    transport.bpm = 60;
    expect(transport.secondsPerBeat).toBeCloseTo(1.0);
  });

  it('manages pause and seek positions', () => {
    transport.seek(8);
    expect(transport.currentBeat).toBe(8);
    expect(transport.currentBar).toBe(2); // 8 beats / 4 beatsPerBar = bar 2
    expect(transport.currentBeatInBar).toBe(0);

    transport.seek(5.5);
    expect(transport.currentBeat).toBe(5.5);
    expect(transport.currentBar).toBe(1); // 5 beats / 4 = bar 1
    expect(transport.currentBeatInBar).toBe(1);
  });
});
