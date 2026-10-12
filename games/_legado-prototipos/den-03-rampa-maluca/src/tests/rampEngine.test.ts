import { describe, it, expect, beforeEach } from 'vitest';
import { RampPhysicsEngine } from '../utils/rampPhysics';
import { RampTrackConfigSchema, DEFAULT_TRACKS } from '../schemas/trackSchema';

describe('DEN-03: Rampa Maluca - ESDM Ramp & Countdown Anticipation Engine', () => {
  let engine: RampPhysicsEngine;

  beforeEach(() => {
    engine = new RampPhysicsEngine();
    engine.buildTrack(DEFAULT_TRACKS[0], 800, 600);
  });

  it('INVIOLABLE RULE: gate remains firmly locked until explicit adult release action', () => {
    expect(engine.isGateOpen).toBe(false);
    expect(engine.gateBody).not.toBeNull();

    // Spawning a vehicle behind gate
    engine.spawnVehicle('v1', 'carro', 'crianca', '#ef4444');

    // Simulate physics updates: gate must stay closed
    for (let i = 0; i < 20; i++) {
      engine.update(0.016);
    }
    expect(engine.isGateOpen).toBe(false);

    // Only adult openGate() releases it
    const opened = engine.openGate();
    expect(opened).toBe(true);
    expect(engine.isGateOpen).toBe(true);
  });

  it('validates clinical track presets against Zod schema and rejects invalid angles', () => {
    // Valid preset
    const validResult = RampTrackConfigSchema.safeParse(DEFAULT_TRACKS[0]);
    expect(validResult.success).toBe(true);

    // Invalid angle (> 40 degrees)
    const invalidTrack = {
      id: 'bad-track',
      name: 'Rampa Perigosa',
      rampAngleDeg: 65, // Exceeds 40 deg
      hasBridge: false,
      hasTunnel: false,
      targetType: 'pinos',
      pinCount: 3,
    };
    const invalidResult = RampTrackConfigSchema.safeParse(invalidTrack);
    expect(invalidResult.success).toBe(false);
  });

  it('creates target pins matching track pinCount', () => {
    expect(engine.pinBodies.length).toBe(DEFAULT_TRACKS[0].pinCount);
  });

  it('supports race mode by spawning adult and child vehicles simultaneously', () => {
    engine.spawnVehicle('v-child', 'carro', 'crianca', '#ef4444', 0);
    engine.spawnVehicle('v-adult', 'caminhao', 'adulto', '#3b82f6', 50);

    expect(engine.vehicles.length).toBe(2);
    expect(engine.vehicles.some((v) => v.owner === 'crianca')).toBe(true);
    expect(engine.vehicles.some((v) => v.owner === 'adulto')).toBe(true);
  });
});
