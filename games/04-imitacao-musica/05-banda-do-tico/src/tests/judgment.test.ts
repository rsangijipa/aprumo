// src/tests/judgment.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { RhythmJudge } from '../rhythm/scoring/judgment';

describe('RhythmJudge Timing Windows & Positive Reinforcement', () => {
  let judge: RhythmJudge;

  beforeEach(() => {
    judge = new RhythmJudge();
    judge.resetSession();
    judge.setAccessibleMode(false);
    judge.setJudgmentFreeMode(false);
  });

  it('awards "perfect" for hits within ±90ms in standard mode', () => {
    const expectedTime = 10.0;
    const tapTime = 10.04; // +40ms

    const res = judge.evaluateTap(expectedTime, tapTime, 4, 'tambor');
    expect(res.judgement).toBe('perfect');
    expect(judge.combo).toBe(1);
  });

  it('awards "good" for hits between 90ms and 180ms', () => {
    const expectedTime = 10.0;
    const tapTime = 10.12; // +120ms

    const res = judge.evaluateTap(expectedTime, tapTime, 4, 'pandeiro');
    expect(res.judgement).toBe('good');
    expect(judge.combo).toBe(1);
  });

  it('awards "gentle" without punitive miss outside window', () => {
    const expectedTime = 10.0;
    const tapTime = 10.25; // +250ms (outside 180ms)

    const res = judge.evaluateTap(expectedTime, tapTime, 4, 'bloco');
    expect(res.judgement).toBe('gentle');
    // Combo softens without hard cut or negative buzzer
    expect(judge.combo).toBe(0);
  });

  it('widens timing window in accessible mode (±160ms, ±300ms)', () => {
    judge.setAccessibleMode(true);
    const expectedTime = 10.0;
    const tapTime = 10.14; // +140ms (would be "good" normally, now "perfect")

    const res = judge.evaluateTap(expectedTime, tapTime, 4, 'caixa');
    expect(res.judgement).toBe('perfect');
  });

  it('awards "perfect" to every hit in judgmentFree sandbox mode', () => {
    judge.setJudgmentFreeMode(true);
    const expectedTime = 10.0;
    const tapTime = 10.8; // way off beat

    const res = judge.evaluateTap(expectedTime, tapTime, 4, 'prato');
    expect(res.judgement).toBe('perfect');
    expect(judge.combo).toBe(1);
  });

  it('reports progressive combo milestones', () => {
    expect(judge.getComboMilestone(0)).toContain('Ritmo Inicial');
    expect(judge.getComboMilestone(4)).toContain('Chocalho');
    expect(judge.getComboMilestone(8)).toContain('Baixo');
    expect(judge.getComboMilestone(12)).toContain('Plateia');
    expect(judge.getComboMilestone(16)).toContain('Luzes de Palco');
  });
});
