import { describe, expect, it } from 'vitest';
import {
  EVENT_TYPES,
  PROTOCOL_VERSION,
  RUNTIME_CYCLE,
  RUNTIME_STEP_EVENT,
  runtimeOutcome,
  validateEvent,
  type EventType,
} from './index';

let seq = 0;
const env = (type: string, payload: unknown) => ({
  eventId: `evt-${String(++seq).padStart(6, '0')}`,
  sequence: seq,
  runId: 'run-1',
  protocolVersion: PROTOCOL_VERSION,
  appId: 'match-lab',
  type,
  occurredAt: new Date().toISOString(),
  payload,
});

const baseTrial = {
  targetId: 't1', stimulusId: 'bola', trialIndex: 0, presented: ['bola', 'copo'], positionOfTarget: 0,
  selected: 'bola', selectedPosition: 0, response: 'correct', latencyMs: 900, promptLevel: 'IND', promptSource: 'none',
};

describe('ciclo universal do runtime', () => {
  it('sequência canônica aponta para eventos existentes, na ordem do plano', () => {
    expect(RUNTIME_CYCLE.map((c) => c.step)).toEqual([
      'game_started', 'level_started', 'trial_started', 'stimulus_presented', 'prompt_presented',
      'response_started', 'response_recorded', 'reinforcer_presented', 'level_completed', 'game_completed',
    ]);
    for (const ev of Object.values(RUNTIME_STEP_EVENT)) expect(EVENT_TYPES).toContain(ev as EventType);
    expect(RUNTIME_STEP_EVENT.game_exited).toBe('APP_CLOSED');
    expect(RUNTIME_STEP_EVENT.game_paused).toBe('SESSION_PAUSED');
  });

  it.each([
    ['LEVEL_STARTED', { levelId: 'n1', levelIndex: 0, fieldSize: 12, trialsPlanned: 10 }],
    ['LEVEL_COMPLETED', { levelId: 'n1', levelIndex: 0, trialsCompleted: 10, correct: 8, outcome: 'advanced' }],
    ['STIMULUS_PRESENTED', { targetId: 't1', trialIndex: 0, presented: ['a', 'b'], positionOfTarget: 1, modality: 'visual' }],
    ['RESPONSE_STARTED', { targetId: 't1', trialIndex: 0, latencyMs: 450, position: 1, inputMode: 'drag' }],
    ['REINFORCER_PRESENTED', { kind: 'animation', contingentOn: 't1', intensity: 'subtle' }],
  ])('aceita %s', (type, payload) => {
    const r = validateEvent(env(type, payload));
    expect(r.ok).toBe(true);
  });

  it('rejeita payload inválido dos novos eventos (vai para a quarentena)', () => {
    expect(validateEvent(env('RESPONSE_STARTED', { targetId: 't1', trialIndex: 0, latencyMs: -1 })).ok).toBe(false);
    expect(validateEvent(env('LEVEL_STARTED', { levelId: '', levelIndex: 0 })).ok).toBe(false);
    expect(validateEvent(env('REINFORCER_PRESENTED', { kind: 'confetti', contingentOn: null })).ok).toBe(false);
  });

  it('não deixa passar campos de identificação pessoal (são descartados)', () => {
    const r = validateEvent(env('LEVEL_STARTED', { levelId: 'n1', levelIndex: 0, fullName: 'Fulano', cpf: '000' }));
    expect(r.ok && r.event.payload).toEqual({ levelId: 'n1', levelIndex: 0 });
  });
});

describe('compatibilidade de TRIAL_COMPLETED', () => {
  it('payload legado continua válido e recebe detail {}', () => {
    const r = validateEvent(env('TRIAL_COMPLETED', baseTrial));
    expect(r.ok && r.event.payload).toMatchObject({ ...baseTrial, detail: {} });
  });

  it('aceita selfCorrected/attempts opcionais e deriva o desfecho self_corrected', () => {
    const r = validateEvent(env('TRIAL_COMPLETED', { ...baseTrial, selfCorrected: true, attempts: 2 }));
    expect(r.ok).toBe(true);
    if (r.ok && r.event.type === 'TRIAL_COMPLETED') {
      expect(runtimeOutcome(r.event.payload as never)).toBe('self_corrected');
    }
    expect(runtimeOutcome({ response: 'incorrect' })).toBe('incorrect');
    expect(validateEvent(env('TRIAL_COMPLETED', { ...baseTrial, attempts: 0 })).ok).toBe(false);
  });

  it('eventos legados seguem válidos', () => {
    expect(validateEvent(env('REWARD_TRIGGERED', { kind: 'visual', contingentOn: 't1' })).ok).toBe(true);
    expect(validateEvent(env('SESSION_COMPLETED', { trialsCompleted: 3 })).ok).toBe(true);
  });
});
