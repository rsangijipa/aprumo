// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import type { GameClient } from './client';
import { useTrialRunner, type SelectionTrial } from './trialRunner';

const stim = (id: string) => ({ stimulusId: id, label: id, art: id });
const target = {
  targetId: 't', name: 'bola', phase: 'acquisition' as const, repertoire: 'matching' as const, fieldSize: 2,
  stimulus: stim('bola'), distractors: [stim('copo')], scoring: 'auto' as const,
  promptHierarchy: [{ code: 'IND', label: 'Ind', intrusiveness: 0 }, { code: 'GES', label: 'Ges', intrusiveness: 0.25 }],
};
const config: SessionConfig = {
  protocolVersion: PROTOCOL_VERSION, runId: 'r', appId: 'x', appVersion: '1', childDisplayName: 'Teo',
  clinical: { model: 'ABA', targets: [target], trialsPerTarget: 2, interleave: false, seed: 1 },
  adaptation: { ...DEFAULT_ADAPTATION, builtInPromptAfterMs: 3000 }, params: {},
};
const trials: SelectionTrial[] = [
  { index: 0, target, options: [stim('bola'), stim('copo')], positionOfTarget: 0 },
  { index: 1, target, options: [stim('copo'), stim('bola')], positionOfTarget: 1 },
];

function fakeClient() {
  const events: Array<{ type: string; payload: any }> = [];
  const client = {
    emit: (type: string, payload: unknown) => { events.push({ type, payload }); return String(events.length); },
    onConfig: () => () => {}, onCommand: () => () => {}, pendingCount: () => 0,
    connect: () => {}, disconnect: () => {}, dispose: () => {},
  } as unknown as GameClient;
  return { client, events };
}

describe('useTrialRunner', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('resposta correta direta avança para a próxima tentativa e encerra ao final', () => {
    const { client, events } = fakeClient();
    const { result } = renderHook(() => useTrialRunner({ client, config, trials, paused: false, latencyMaxMs: 8000, feedbackMs: 1000 }));
    act(() => { result.current.select(0); });
    expect(result.current.stage).toBe('feedback');
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.trial?.index).toBe(1);
    act(() => { result.current.select(1); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.stage).toBe('done');
    const done = events.filter((e) => e.type === 'TRIAL_COMPLETED');
    expect(done.map((e) => [e.payload.response, e.payload.promptLevel, e.payload.selectedPosition])).toEqual([['correct', 'IND', 0], ['correct', 'IND', 1]]);
    expect(events.at(-1)?.type).toBe('SESSION_COMPLETED');
  });

  it('dica embutida marca a tentativa como com dica (não independente)', () => {
    const { client, events } = fakeClient();
    const { result } = renderHook(() => useTrialRunner({ client, config, trials, paused: false, latencyMaxMs: 8000 }));
    act(() => { vi.advanceTimersByTime(3100); });
    expect(result.current.hint).toBe(true);
    act(() => { result.current.select(0); });
    const t = events.find((e) => e.type === 'TRIAL_COMPLETED')!;
    expect([t.payload.promptLevel, t.payload.promptSource]).toEqual(['GES', 'built_in']);
  });

  it('sem resposta no tempo-limite, depois correção sem nova pontuação', () => {
    const { client, events } = fakeClient();
    const { result } = renderHook(() => useTrialRunner({ client, config, trials, paused: false, latencyMaxMs: 8000, feedbackMs: 500 }));
    act(() => { vi.advanceTimersByTime(8000); });
    expect(result.current.stage).toBe('correction');
    act(() => { result.current.select(0); });
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current.trial?.index).toBe(1);
    expect(events.filter((e) => e.type === 'TRIAL_COMPLETED').map((e) => e.payload.response)).toEqual(['no_response']);
  });
});
