import { describe, expect, it } from 'vitest';
import { seededRandom } from '@aprumo/game-sdk';
import { SCENES } from './Scenes';
import {
  checkOrder,
  createStoryLadder,
  LEVEL_STEPS,
  nextMissingStep,
  nextStory,
  sessionLength,
  shuffleSteps,
  startLevelFrom,
  stepStoryLadder,
  STORIES,
  storiesForLevel,
} from './logic';

describe('História em Ordem', () => {
  it('tem 3 histórias por nível (3, 4 e 5 cenas), todas ilustradas', () => {
    LEVEL_STEPS.forEach((_, lv) => expect(storiesForLevel(lv)).toHaveLength(3));
    for (const s of STORIES) for (const st of s.steps) expect(SCENES[st.scene]).toBeTypeOf('function');
  });

  it('embaralha sem nunca entregar a ordem já correta', () => {
    const rnd = seededRandom(5);
    for (const s of STORIES) for (let k = 0; k < 20; k++) expect(checkOrder(shuffleSteps(s.steps, rnd)).correct).toBe(false);
  });

  it('confere a ordem, o prefixo correto e a próxima etapa que falta', () => {
    const [a, b, c] = STORIES[0]!.steps;
    expect(checkOrder([a!, b!, c!])).toEqual({ correct: true, slots: [true, true, true], correctPrefix: 3 });
    expect(checkOrder([a!, c!, b!])).toMatchObject({ correct: false, correctPrefix: 1, slots: [true, false, false] });
    expect(nextMissingStep([a!, null, null])).toBe(2);
    expect(nextMissingStep([null, b!, null])).toBe(1);
  });

  it('não repete história enquanto houver inéditas no nível', () => {
    const used = new Set<string>();
    const rnd = seededRandom(2);
    for (let i = 0; i < 3; i++) used.add(nextStory(1, used, rnd).id);
    expect(used.size).toBe(3);
    expect(storiesForLevel(1).map((s) => s.id)).toEqual(expect.arrayContaining([...used]));
  });

  it('escada: sobe com 2 acertos independentes, desce com 2 erros', () => {
    let l = createStoryLadder(0);
    l = stepStoryLadder(stepStoryLadder(l, 'independent'), 'independent');
    expect(l.level).toBe(1);
    l = stepStoryLadder(stepStoryLadder(l, 'error'), 'error');
    expect(l.level).toBe(0);
  });

  it('parâmetros: tamanho da sessão e nível inicial', () => {
    expect(sessionLength({ clinical: { trialsPerTarget: 4 } } as never)).toBe(6);
    expect(sessionLength({ clinical: { trialsPerTarget: 50 } } as never)).toBe(10);
    expect(startLevelFrom({ startSteps: 5 })).toBe(2);
    expect(startLevelFrom({ startSteps: 9 })).toBe(0);
  });
});
