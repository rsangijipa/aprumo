// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_ADAPTATION, MESSAGE_CHANNEL, PROTOCOL_VERSION, validateEvent, type SessionConfig } from '@aprumo/protocol';
import { createGameClient } from './client';
import { attachGameHost } from './host';

const config: SessionConfig = {
  protocolVersion: PROTOCOL_VERSION, runId: 'run-1', appId: 'match-lab', appVersion: '1', childDisplayName: 'Teo',
  clinical: { model: 'ABA', targets: [], trialsPerTarget: 1, interleave: false, seed: 1 },
  adaptation: DEFAULT_ADAPTATION, params: {},
};

/** Alvo falso: captura postMessage e permite entregar mensagens do "hospedeiro". */
function setup() {
  const posted: any[] = [];
  const target = { postMessage: (m: unknown) => posted.push(m) } as unknown as Window;
  const client = createGameClient({ appId: 'match-lab', appVersion: '1', target });
  client.connect();
  window.dispatchEvent(new MessageEvent('message', {
    data: { channel: MESSAGE_CHANNEL, msg: { kind: 'SESSION_CONFIG', config } },
    origin: window.location.origin, source: target as unknown as MessageEventSource,
  }));
  const events = () => posted.filter((p) => p.msg.kind === 'EVENT').map((p) => p.msg.event);
  return { client, events };
}

describe('atalhos do runtime no GameClient', () => {
  it('emitem envelopes válidos com o tipo canônico e sequência monotônica', () => {
    const { client, events } = setup();
    client.gameStarted('v1');
    client.levelStarted({ levelId: 'n1', levelIndex: 0, fieldSize: 3 });
    client.trialStarted({ targetId: 't', trialIndex: 0, presented: ['a', 'b'] });
    client.stimulusPresented({ targetId: 't', trialIndex: 0, presented: ['a', 'b'], positionOfTarget: 0 });
    client.promptPresented({ targetId: 't', trialIndex: 0, level: 'GES', source: 'built_in', latencyMs: 3000 });
    client.responseStarted({ targetId: 't', trialIndex: 0, latencyMs: 800, position: 0, inputMode: 'tap' });
    client.responseRecorded({
      targetId: 't', stimulusId: 'a', trialIndex: 0, presented: ['a', 'b'], positionOfTarget: 0, selected: 'a',
      selectedPosition: 0, response: 'correct', latencyMs: 900, promptLevel: 'GES', promptSource: 'built_in', attempts: 1,
    });
    client.reinforcerPresented({ kind: 'visual', contingentOn: 't' });
    client.levelCompleted({ levelId: 'n1', levelIndex: 0, trialsCompleted: 1, correct: 1 });
    client.gameCompleted(1);
    client.paused();
    client.resumed();
    client.exited('adult_exit');
    const evs = events();
    expect(evs.map((e) => e.type)).toEqual([
      'SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'PROMPT_USED', 'RESPONSE_STARTED',
      'TRIAL_COMPLETED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_COMPLETED', 'SESSION_PAUSED',
      'SESSION_RESUMED', 'APP_CLOSED',
    ]);
    expect(evs.map((e) => e.sequence)).toEqual(evs.map((_, i) => i));
    for (const e of evs) expect(validateEvent(e)).toMatchObject({ ok: true });
    expect(evs[6].payload.detail).toEqual({});
    expect(evs[10].payload).toEqual({ reason: null });
    client.disconnect();
  });
});

describe('hospedeiro com os novos eventos', () => {
  it('persiste eventos válidos do ciclo e põe inválidos em quarentena (com ACK)', async () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const persisted: string[] = [];
    const quarantined: string[] = [];
    const host = attachGameHost({
      frame, expectedOrigin: window.location.origin, config,
      persist: async (e) => { persisted.push(e.type); },
      quarantine: (_raw, reason) => quarantined.push(reason),
    });
    const send = vi.spyOn(frame.contentWindow!, 'postMessage').mockImplementation(() => {});
    const deliver = (event: unknown) =>
      window.dispatchEvent(new MessageEvent('message', {
        data: { channel: MESSAGE_CHANNEL, msg: { kind: 'EVENT', event } },
        origin: window.location.origin, source: frame.contentWindow,
      }));
    const base = { runId: 'run-1', protocolVersion: PROTOCOL_VERSION, appId: 'match-lab', occurredAt: new Date().toISOString() };
    deliver({ ...base, eventId: 'evt-000001', sequence: 0, type: 'RESPONSE_STARTED', payload: { targetId: 't', trialIndex: 0, latencyMs: 500 } });
    deliver({ ...base, eventId: 'evt-000002', sequence: 1, type: 'LEVEL_COMPLETED', payload: { levelId: 'n1', levelIndex: 0, trialsCompleted: -1, correct: 0 } });
    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2));
    expect(persisted).toEqual(['RESPONSE_STARTED']);
    expect(quarantined).toHaveLength(1);
    expect(quarantined[0]).toMatch(/LEVEL_COMPLETED/);
    host.dispose();
  });
});
