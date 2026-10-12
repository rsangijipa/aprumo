import { describe, expect, it } from 'vitest';
import { bounceInBounds, collideCircles, easeOutBack, integrate, stepSpring, springAtRest, wobble } from './physics';
import { createLadder, ladderOutcome, phaseForTrial, stepLadder } from './levels';

describe('física 2D', () => {
  it('integra gravidade e arrasto de forma estável', () => {
    const b = { x: 0, y: 0, vx: 10, vy: 0, r: 5 };
    for (let i = 0; i < 30; i++) integrate(b, 1 / 30, 0, 100, 0.5);
    expect(b.y).toBeGreaterThan(30);
    expect(b.vx).toBeLessThan(10);
  });

  it('quica no chão com restituição e reporta o impacto', () => {
    const b = { x: 50, y: 98, vx: 0, vy: 200, r: 5 };
    const r = bounceInBounds(b, { left: 0, top: 0, right: 100, bottom: 100 }, 0.5);
    expect(r).toEqual({ hit: true, floor: true });
    expect(b.vy).toBe(-100);
    expect(b.y).toBe(95);
  });

  it('separa círculos sobrepostos e troca momento', () => {
    const a = { x: 0, y: 0, vx: 10, vy: 0, r: 10 };
    const b = { x: 15, y: 0, vx: -10, vy: 0, r: 10 };
    expect(collideCircles(a, b, 1)).toBe(true);
    expect(b.x - a.x).toBeCloseTo(20);
    expect(a.vx).toBeCloseTo(-10);
    expect(b.vx).toBeCloseTo(10);
  });

  it('mola converge para o alvo', () => {
    const s = { value: 0, velocity: 0 };
    for (let i = 0; i < 240; i++) stepSpring(s, 1, 1 / 60);
    expect(springAtRest(s, 1, 0.01)).toBe(true);
  });

  it('easing e ruído ficam nas faixas esperadas', () => {
    expect(easeOutBack(0)).toBeCloseTo(0);
    expect(easeOutBack(1)).toBeCloseTo(1);
    for (let t = 0; t < 20; t += 0.37) expect(Math.abs(wobble(t, 3))).toBeLessThanOrEqual(1);
  });
});

describe('escada de fases', () => {
  it('sobe após 2 acertos independentes e respeita o teto', () => {
    let s = createLadder(1);
    s = stepLadder(s, 'independent');
    expect(s.level).toBe(0);
    s = stepLadder(s, 'independent');
    expect(s).toMatchObject({ level: 1, moved: 'up' });
    s = stepLadder(stepLadder(s, 'independent'), 'independent');
    expect(s.level).toBe(1);
  });

  it('acerto com dica mantém o nível; 2 erros descem', () => {
    let s = createLadder(3, 2);
    s = stepLadder(s, 'independent');
    s = stepLadder(s, 'prompted');
    expect(s).toMatchObject({ level: 2, streak: 0 });
    s = stepLadder(stepLadder(s, 'error'), 'error');
    expect(s).toMatchObject({ level: 1, moved: 'down' });
  });

  it('converte respostas e calcula fases fixas', () => {
    expect(ladderOutcome('correct', false)).toBe('independent');
    expect(ladderOutcome('correct', true)).toBe('prompted');
    expect(ladderOutcome('no_response', false)).toBe('error');
    expect(phaseForTrial(0, 3, 4)).toBe(0);
    expect(phaseForTrial(7, 3, 4)).toBe(2);
    expect(phaseForTrial(99, 3, 4)).toBe(3);
  });
});
