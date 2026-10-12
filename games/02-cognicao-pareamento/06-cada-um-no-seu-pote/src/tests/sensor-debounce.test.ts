import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { cadaUmNoSeuPoteMachine } from '../engine-aba/machine';
import { generateBinsForRule, generateItemsForRule } from '../rules/rules';

describe('Sensor Debounce & Discrete Trial State Machine for ABA-02', () => {
  it('registers correct drop in bin and records latency and telemetry', () => {
    const actor = createActor(cadaUmNoSeuPoteMachine).start();

    // 1. Start trial
    actor.send({ type: 'START_TRIAL' });
    expect(actor.getSnapshot().value).toBe('presentingSD');

    actor.send({ type: 'SD_FINISHED' });
    expect(actor.getSnapshot().value).toBe('sorting');

    const bins = generateBinsForRule('cor');
    const redBin = bins.find(b => b.attributeValue === 'vermelho')!;
    const redItem = generateItemsForRule('cor', 4).find(i => i.attributeValue === 'vermelho')!;

    // 2. Drop item into matching red bin
    actor.send({
      type: 'ITEM_DROPPED_IN_BIN',
      item: redItem,
      bin: redBin,
      throwVelocity: 14.5
    });

    expect(actor.getSnapshot().value).toBe('reinforcing');
    expect(actor.getSnapshot().context.history.length).toBe(1);
    expect(actor.getSnapshot().context.history[0].result).toBe('independent_correct');
    expect(actor.getSnapshot().context.history[0].gameSpecific.throwVelocity).toBe(14.5);
  });

  it('handles incorrect drop with neutral return to tray and records error', () => {
    const actor = createActor(cadaUmNoSeuPoteMachine).start();

    actor.send({ type: 'START_TRIAL' });
    actor.send({ type: 'SD_FINISHED' });

    const bins = generateBinsForRule('cor');
    const blueBin = bins.find(b => b.attributeValue === 'azul')!;
    const redItem = generateItemsForRule('cor', 4).find(i => i.attributeValue === 'vermelho')!;

    actor.send({
      type: 'ITEM_DROPPED_IN_BIN',
      item: redItem,
      bin: blueBin,
      throwVelocity: 8.0
    });

    expect(actor.getSnapshot().value).toBe('errorReturn');
    expect(actor.getSnapshot().context.history.length).toBe(1);
    expect(actor.getSnapshot().context.history[0].result).toBe('incorrect');
  });

  it('marks ruleSwitchProbe: true on first trial following rule switch', () => {
    const actor = createActor(cadaUmNoSeuPoteMachine).start();

    // Switch rule to forma
    actor.send({ type: 'SWITCH_RULE', newRule: 'forma' });
    expect(actor.getSnapshot().context.rule).toBe('forma');
    expect(actor.getSnapshot().context.isFirstTrialAfterSwitch).toBe(true);

    actor.send({ type: 'START_TRIAL' });
    actor.send({ type: 'SD_FINISHED' });

    const bins = actor.getSnapshot().context.bins;
    const item = actor.getSnapshot().context.currentItem!;

    actor.send({
      type: 'ITEM_DROPPED_IN_BIN',
      item,
      bin: bins[0],
      throwVelocity: 10
    });

    expect(actor.getSnapshot().context.history[0].gameSpecific.ruleSwitchProbe).toBe(true);
  });
});
