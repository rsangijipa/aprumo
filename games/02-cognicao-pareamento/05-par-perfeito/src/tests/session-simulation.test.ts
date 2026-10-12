import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { parPerfeitoMachine } from '../engine-aba/machine';

describe('E2E Session Simulation: 10 Trials with 3 Errors', () => {
  it('simulates a 10-trial session with 3 errors and verifies error correction and consistent final report', () => {
    const actor = createActor(parPerfeitoMachine).start();

    // Trials plan: 10 trials total. Errors on trials 3, 6, and 8.
    const errorTrials = [3, 6, 8];
    let simulatedTrialCount = 0;

    while (simulatedTrialCount < 10) {
      simulatedTrialCount++;
      const isError = errorTrials.includes(simulatedTrialCount);

      // 1. Start trial
      actor.send({ type: 'START_TRIAL' });
      expect(actor.getSnapshot().value).toBe('presentingSD');

      // 2. SD finishes
      actor.send({ type: 'SD_FINISHED', durationMs: 650 });
      expect(actor.getSnapshot().value).toBe('awaitingResponse');

      if (isError) {
        // Child drops on wrong card
        actor.send({
          type: 'DROP_ON_WRONG',
          slotIndex: 1,
          dragPathLength: 220,
          dropDistancePx: 30,
          mode: 'drag'
        });

        // Verifies error correction state is entered
        expect(actor.getSnapshot().value).toBe('errorCorrection');
        expect(actor.getSnapshot().context.isErrorCorrectionPending).toBe(true);

        // Neutral screen completes
        actor.send({ type: 'ERROR_CORRECTION_DONE' });
        expect(actor.getSnapshot().value).toBe('iti');
      } else {
        // Child drops on correct card
        actor.send({
          type: 'DROP_ON_CORRECT',
          dragPathLength: 180,
          dropDistancePx: 10,
          mode: 'drag'
        });

        // Verifies reinforcing state is entered
        expect(actor.getSnapshot().value).toBe('reinforcing');
        expect(actor.getSnapshot().context.isErrorCorrectionPending).toBe(false);

        actor.send({ type: 'REINFORCING_DONE' });
        expect(actor.getSnapshot().value).toBe('iti');
      }

      // ITI finishes
      actor.send({ type: 'ITI_DONE' });
    }

    // After 10 trials, the session must transition to sessionEnd
    expect(actor.getSnapshot().value).toBe('sessionEnd');

    const history = actor.getSnapshot().context.trialsHistory;
    expect(history.length).toBe(10);

    // Verify exactly 3 incorrect and 7 correct (independent or prompted)
    const incorrectTrials = history.filter(t => t.result === 'incorrect');
    const correctTrials = history.filter(t => t.result === 'independent_correct' || t.result === 'prompted_correct');

    expect(incorrectTrials.length).toBe(3);
    expect(correctTrials.length).toBe(7);

    // Verify all trials have gameSpecific telemetry and valid latency
    for (const trial of history) {
      expect(trial.latencyMs).toBeGreaterThan(0);
      expect(trial.gameSpecific.dragPathLength).toBeGreaterThan(0);
      expect(trial.gameSpecific.mode).toBe('drag');
      expect(['foto', 'ilustracao', 'picto']).toContain(trial.gameSpecific.stimulusLayer);
    }
  });
});
