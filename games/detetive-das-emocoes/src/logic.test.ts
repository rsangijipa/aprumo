import { describe, it, expect } from 'vitest';
import {
  DETECTIVE_CASES,
  evaluateChoice,
  planDetectiveTrials,
} from './logic';

describe('Detetive das Emoções — logic', () => {
  it('contains structured clinical investigation cases', () => {
    expect(DETECTIVE_CASES.length).toBeGreaterThanOrEqual(4);
    for (const c of DETECTIVE_CASES) {
      expect(c.characterName).toBeTruthy();
      expect(c.scenarioTitle).toBeTruthy();
      expect(c.clues.length).toBe(3); // Face, Context, Speech
      expect(c.choices.length).toBe(4);
      expect(c.choices.filter((ch) => ch.isCorrect).length).toBe(1);
    }
  });

  it('correctly evaluates accurate answers', () => {
    const res = evaluateChoice('caso-apresentacao', 'ansioso');
    expect(res.isCorrect).toBe(true);
    expect(res.isPlausible).toBe(true);
    expect(res.explanation).toContain('Excelente dedução');
  });

  it('recognizes plausible/nuanced answers without severe penalization', () => {
    const res = evaluateChoice('caso-quadro-elogio', 'vergonha');
    expect(res.isCorrect).toBe(false);
    expect(res.isPlausible).toBe(true);
    expect(res.explanation).toContain('compreensível');
  });

  it('identifies implausible answers', () => {
    const res = evaluateChoice('caso-festa-surpresa', 'triste');
    expect(res.isCorrect).toBe(false);
    expect(res.isPlausible).toBe(false);
  });

  it('handles unknown cases gracefully', () => {
    const res = evaluateChoice('desconhecido', 'ansioso');
    expect(res.isCorrect).toBe(false);
  });

  it('plans trials according to config block limits', () => {
    const trials = planDetectiveTrials();
    expect(trials.length).toBeGreaterThan(0);
  });
});
