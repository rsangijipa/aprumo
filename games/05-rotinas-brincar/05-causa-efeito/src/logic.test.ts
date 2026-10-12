import { describe, expect, it } from 'vitest';
import { seededRandom } from '@aprumo/game-sdk';
import {
  burst,
  holdScale,
  noteFor,
  noteIndexFor,
  PENTATONIC_FREQS,
  planPhases,
  shouldTriggerMilestone,
  spawnBubble,
  stepBubbles,
  stepParticles,
} from './logic';

const cfg = (trialsPerTarget: number, params: Record<string, unknown> = {}) => ({
  clinical: { model: 'ABA' as const, targets: [], trialsPerTarget, interleave: false, seed: 7 },
  params,
});

describe('Causa e Efeito — Jardim de Luzes', () => {
  it('planeja 5 fases em ordem de complexidade da contingência', () => {
    const phases = planPhases(cfg(4));
    expect(phases.map((p) => p.kind)).toEqual(['surface', 'bubbles', 'hold', 'trail', 'switch']);
    expect(phases.every((p) => p.actions >= 3)).toBe(true);
  });

  it('permite limitar e adiantar fases pelos parâmetros', () => {
    const phases = planPhases(cfg(6, { startPhase: 2, phases: 2 }));
    expect(phases.map((p) => p.kind)).toEqual(['hold', 'trail']);
    expect(planPhases(cfg(6, { startPhase: 99, phases: -3 }))).toHaveLength(1);
  });

  it('mapeia a posição horizontal para a escala pentatônica (grave → agudo)', () => {
    expect(noteIndexFor(0, 800)).toBe(0);
    expect(noteIndexFor(799, 800)).toBe(PENTATONIC_FREQS.length - 1);
    expect(noteFor(10, 800)).toBeLessThan(noteFor(700, 800));
    expect(noteIndexFor(50, 0)).toBe(0);
  });

  it('bolhas sobem com empuxo, ficam dentro das paredes e reentram por baixo', () => {
    const rnd = seededRandom(3);
    const bounds = { left: 0, top: 0, right: 400, bottom: 600 };
    const bs = Array.from({ length: 6 }, (_, i) => spawnBubble(`b${i}`, rnd, bounds, 1, false));
    const y0 = bs.map((b) => b.y);
    for (let i = 0; i < 60; i++) stepBubbles(bs, 1 / 60, i / 60, bounds);
    expect(bs.filter((b, i) => b.y < y0[i]!).length).toBeGreaterThan(3);
    for (const b of bs) {
      expect(b.x - b.r).toBeGreaterThanOrEqual(-0.01);
      expect(b.x + b.r).toBeLessThanOrEqual(400.01);
    }
    for (let i = 0; i < 2000; i++) stepBubbles(bs, 1 / 30, i / 30, bounds);
    expect(bs.every((b) => b.y > -b.r * 2 && b.y < 700)).toBe(true);
  });

  it('respeita o tamanho mínimo de toque ao criar bolhas', () => {
    const b = spawnBubble('x', () => 0, { left: 0, top: 0, right: 300, bottom: 300 }, 1.5);
    expect(b.r * 2).toBeGreaterThanOrEqual(64 * 1.5);
  });

  it('partículas: movimento estático vira só um anel; as demais caem e somem', () => {
    const rnd = seededRandom(1);
    expect(burst(10, 10, 0, rnd, 'static')).toHaveLength(1);
    let ps = burst(100, 100, 2, rnd, 'full');
    expect(ps.length).toBeGreaterThan(15);
    for (let i = 0; i < 120; i++) ps = stepParticles(ps, 1 / 30);
    expect(ps).toHaveLength(0);
  });

  it('o balão cresce de forma monotônica até encher', () => {
    expect(holdScale(0)).toBeCloseTo(0.35);
    expect(holdScale(800)).toBeGreaterThan(holdScale(400));
    expect(holdScale(5000)).toBe(1);
  });

  it('detecta marcos de comemoração a cada intervalo definido', () => {
    expect(shouldTriggerMilestone(0, 5)).toBe(false);
    expect(shouldTriggerMilestone(5, 5)).toBe(true);
    expect(shouldTriggerMilestone(7, 5)).toBe(false);
  });
});
