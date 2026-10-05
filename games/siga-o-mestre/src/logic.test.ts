import { describe, it, expect } from 'vitest';
import {
  generateMasterTrial,
  evaluateTap,
  evaluateTimeout,
  type MasterTrial,
} from './logic';

describe('siga-o-mestre logic', () => {
  it('generates valid and trick trials appropriately', () => {
    const trial0 = generateMasterTrial(0, 1);
    expect(trial0.kind).toBe('valid');
    expect(trial0.verbalCommand).toContain('O mestre mandou');

    const trialTrick = generateMasterTrial(2, 1);
    expect(trialTrick.kind).toBe('trick');
    expect(trialTrick.verbalCommand).not.toContain('O mestre mandou');
  });

  it('generates 2-step targets on level 2 for valid commands', () => {
    const trialL2 = generateMasterTrial(0, 2);
    expect(trialL2.targets.length).toBe(2);
    expect(trialL2.verbalCommand).toContain('e depois');
  });

  it('evaluates trick command tap as inhibition failure', () => {
    const trickTrial = generateMasterTrial(2, 1);
    const result = evaluateTap(trickTrial, 'palma', 0);
    expect(result.outcome).toBe('inhibition_failed');
  });

  it('evaluates trick command timeout as successful inhibition', () => {
    const trickTrial = generateMasterTrial(2, 1);
    const result = evaluateTimeout(trickTrial);
    expect(result.success).toBe(true);
    expect(result.response).toBe('correct');
  });

  it('evaluates valid command taps and step sequences', () => {
    const validTrial: MasterTrial = {
      trialIndex: 0,
      kind: 'valid',
      level: 2,
      targets: ['palma', 'pular'],
      verbalCommand: 'O mestre mandou bater palmas e depois pular!',
      displayedOptions: ['palma', 'pular', 'rodar', 'acenar'],
      inhibitionWindowMs: 3000,
    };

    // Wrong action
    const wrong = evaluateTap(validTrial, 'rodar', 0);
    expect(wrong.outcome).toBe('wrong_action');

    // First correct step
    const step1 = evaluateTap(validTrial, 'palma', 0);
    expect(step1.outcome).toBe('valid_partial');
    if (step1.outcome === 'valid_partial') {
      expect(step1.nextStepIndex).toBe(1);
    }

    // Second correct step
    const step2 = evaluateTap(validTrial, 'pular', 1);
    expect(step2.outcome).toBe('valid_complete');
  });
});
