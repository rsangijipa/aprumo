import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { parPerfeitoMachine } from '../engine-aba/machine';

describe('Par Perfeito XState Machine', () => {
  it('follows the full successful trial cycle: idle -> presentingSD -> awaitingResponse -> reinforcing -> iti -> idle', () => {
    const actor = createActor(parPerfeitoMachine).start();

    // 1. Initial state is idle
    expect(actor.getSnapshot().value).toBe('idle');

    // 2. Start trial -> presentingSD
    actor.send({ type: 'START_TRIAL' });
    expect(actor.getSnapshot().value).toBe('presentingSD');
    expect(actor.getSnapshot().context.currentTrial).not.toBeNull();
    expect(actor.getSnapshot().context.trialNumber).toBe(1);

    // 3. SD finishes -> awaitingResponse
    actor.send({ type: 'SD_FINISHED', durationMs: 800 });
    expect(actor.getSnapshot().value).toBe('awaitingResponse');

    // 4. Drop on correct -> reinforcing
    actor.send({
      type: 'DROP_ON_CORRECT',
      dragPathLength: 250,
      dropDistancePx: 12,
      mode: 'drag'
    });
    expect(actor.getSnapshot().value).toBe('reinforcing');
    expect(actor.getSnapshot().context.trialsHistory.length).toBe(1);
    expect(actor.getSnapshot().context.trialsHistory[0].result).toBe('independent_correct');

    // 5. Reinforcing done -> iti
    actor.send({ type: 'REINFORCING_DONE' });
    expect(actor.getSnapshot().value).toBe('iti');

    // 6. ITI done -> idle (since maxTrials = 10 and we are at trial 1)
    actor.send({ type: 'ITI_DONE' });
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('handles incorrect drop and error correction workflow', () => {
    const actor = createActor(parPerfeitoMachine).start();

    actor.send({ type: 'START_TRIAL' });
    actor.send({ type: 'SD_FINISHED', durationMs: 800 });

    // Drop on wrong
    actor.send({
      type: 'DROP_ON_WRONG',
      slotIndex: 1,
      dragPathLength: 180,
      dropDistancePx: 15,
      mode: 'drag'
    });

    expect(actor.getSnapshot().value).toBe('errorCorrection');
    expect(actor.getSnapshot().context.isErrorCorrectionPending).toBe(true);
    expect(actor.getSnapshot().context.trialsHistory[0].result).toBe('incorrect');

    actor.send({ type: 'ERROR_CORRECTION_DONE' });
    expect(actor.getSnapshot().value).toBe('iti');
  });

  it('handles prompt due transition: awaitingResponse -> prompting -> awaitingResponse', () => {
    const actor = createActor(parPerfeitoMachine).start();

    actor.send({ type: 'START_TRIAL' });
    actor.send({ type: 'SD_FINISHED', durationMs: 800 });

    actor.send({ type: 'PROMPT_DUE' });
    expect(actor.getSnapshot().value).toBe('prompting');

    actor.send({ type: 'PROMPT_COMPLETED' });
    expect(actor.getSnapshot().value).toBe('awaitingResponse');
  });

  it('transitions to sessionEnd after completing all 10 trials in a session', () => {
    const actor = createActor(parPerfeitoMachine).start();

    for (let t = 1; t <= 10; t++) {
      actor.send({ type: 'START_TRIAL' });
      actor.send({ type: 'SD_FINISHED', durationMs: 500 });
      actor.send({
        type: 'DROP_ON_CORRECT',
        dragPathLength: 120,
        dropDistancePx: 8,
        mode: 'drag'
      });
      actor.send({ type: 'REINFORCING_DONE' });
      actor.send({ type: 'ITI_DONE' });
    }

    expect(actor.getSnapshot().value).toBe('sessionEnd');
    expect(actor.getSnapshot().context.trialsHistory.length).toBe(10);
  });
});
