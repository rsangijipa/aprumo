import { describe, expect, it } from 'vitest';
import { EventPayloads } from '@aprumo/protocol';
import {
  arcDash, backStep, completeStep, firstThen, formatClock, initialRoutine, isFinished, progress, remainingFraction,
  remainingSeconds, resolveVariant, shouldWarn, startStep, stepStatus,
} from './logic';

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('progressão da rotina', () => {
  it('status e primeiro → depois', () => {
    expect([0, 1, 2].map((k) => stepStatus(k, 1))).toEqual(['done', 'current', 'next']);
    expect(firstThen(items, 1)).toEqual({ first: { id: 'b' }, then: { id: 'c' } });
    expect(firstThen(items, 2).then).toBeUndefined();
  });

  it('começar → concluir com autoStart mede latência e emite payloads válidos', () => {
    let s = initialRoutine();
    const r1 = startStep(s, items, 'sch', 1000);
    expect(r1.events[0]?.payload).toEqual({ scheduleId: 'sch', itemId: 'a', transitionLatencyMs: null });
    s = r1.state;
    expect(startStep(s, items, 'sch', 1100).events).toEqual([]); // já iniciada
    const r2 = completeStep(s, items, 'sch', 5000, true);
    expect(r2.events.map((e) => e.type)).toEqual(['SCHEDULE_ITEM_COMPLETED', 'SCHEDULE_ITEM_STARTED']);
    expect(r2.events[1]?.payload).toEqual({ scheduleId: 'sch', itemId: 'b', transitionLatencyMs: 0 });
    for (const e of [...r1.events, ...r2.events]) expect(EventPayloads[e.type].safeParse(e.payload).success).toBe(true);
    expect(r2.state.current).toBe(1);
  });

  it('sem autoStart, a latência é o tempo até tocar em "Começar"', () => {
    let s = startStep(initialRoutine(), items, 'sch', 0).state;
    s = completeStep(s, items, 'sch', 2000).state;
    expect(s.startedAt).toBeNull();
    const r = startStep(s, items, 'sch', 3500);
    expect(r.events[0]?.payload).toMatchObject({ transitionLatencyMs: 1500 });
  });

  it('termina, não passa do fim e volta etapa', () => {
    let s = initialRoutine();
    for (let k = 0; k < 3; k++) s = completeStep(s, items, 'sch', k).state;
    expect(isFinished(s, 3)).toBe(true);
    expect(progress(s, 3)).toBe(1);
    expect(completeStep(s, items, 'sch', 9).events).toEqual([]);
    expect(backStep(s).current).toBe(2);
    expect(backStep(initialRoutine()).current).toBe(0);
  });

  it('variante sóbria a partir de 10 anos', () => {
    expect(resolveVariant({ ageYears: 12 })).toBe('sober');
    expect(resolveVariant({ ageYears: 6 })).toBe('playful');
  });
});

describe('timer circular', () => {
  it('fração e segundos restantes', () => {
    expect(remainingFraction(0, 60_000)).toBe(1);
    expect(remainingFraction(30_000, 60_000)).toBe(0.5);
    expect(remainingFraction(90_000, 60_000)).toBe(0);
    expect(remainingFraction(-5, 60_000)).toBe(1);
    expect(remainingFraction(10, 0)).toBe(0);
    expect(remainingSeconds(59_001, 60_000)).toBe(1);
    expect(remainingSeconds(60_000, 60_000)).toBe(0);
    expect(remainingSeconds(-100, 60_000)).toBe(60);
  });
  it('relógio e arco', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(125)).toBe('2:05');
    const c = 2 * Math.PI * 44;
    expect(arcDash(44, 1)).toEqual({ dasharray: c, dashoffset: 0 });
    expect(arcDash(44, 0.25).dashoffset).toBeCloseTo(c * 0.75);
    expect(arcDash(44, 2).dashoffset).toBe(0);
  });
  it('aviso nos últimos 25% (máx. 60 s)', () => {
    expect(shouldWarn(15, 60)).toBe(true);
    expect(shouldWarn(16, 60)).toBe(false);
    expect(shouldWarn(60, 600)).toBe(true);
    expect(shouldWarn(61, 600)).toBe(false);
    expect(shouldWarn(0, 60)).toBe(false);
  });
});
