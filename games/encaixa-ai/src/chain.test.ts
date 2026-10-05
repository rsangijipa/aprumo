import { describe, expect, it } from 'vitest';
import { autoCompleteSteps, chainStepIndex, childSteps, classifyRun, initChain, preplacedSteps, updateChain, type ChainState } from './chain';

const run = (s: ChainState, outcomes: Parameters<typeof updateChain>[1][]) => {
  const changes: string[] = [];
  for (const o of outcomes) { const r = updateChain(s, o); s = r.state; changes.push(r.change); }
  return { s, changes };
};

describe('chain — tipos de encadeamento', () => {
  it('reverso: N−k peças já encaixadas, a criança faz as k últimas', () => {
    const s = initChain('backward', 4, 1);
    expect(preplacedSteps(s)).toEqual([0, 1, 2]);
    expect(childSteps(s)).toEqual([3]);
    expect(autoCompleteSteps(s)).toEqual([]);
    expect(chainStepIndex(s, 0)).toBe(3);
  });
  it('direto: a criança faz as k primeiras e o app completa', () => {
    const s = initChain('forward', 4, 2);
    expect(childSteps(s)).toEqual([0, 1]);
    expect(autoCompleteSteps(s)).toEqual([2, 3]);
    expect(preplacedSteps(s)).toEqual([]);
    expect(chainStepIndex(s, 1)).toBe(1);
  });
  it('tarefa total: k = N sempre', () => {
    const s = initChain('total', 5, 1);
    expect(s.k).toBe(5);
    expect(childSteps(s)).toEqual([0, 1, 2, 3, 4]);
  });
  it('k inicial é limitado a 1..N', () => {
    expect(initChain('backward', 3, 9).k).toBe(3);
    expect(initChain('backward', 3, 0).k).toBe(1);
  });
});

describe('chain — critério de avanço e regressão', () => {
  it('avança k só após 3 conclusões independentes seguidas no mesmo k', () => {
    const { s, changes } = run(initChain('backward', 4, 1), ['independent', 'independent', 'independent']);
    expect(changes).toEqual(['held', 'held', 'advanced']);
    expect(s.k).toBe(2);
    expect(s.independentStreak).toBe(0);
  });
  it('dica ou falha zera a sequência independente', () => {
    expect(run(initChain('backward', 4, 1), ['independent', 'independent', 'prompted', 'independent']).s.k).toBe(1);
    expect(run(initChain('backward', 4, 1), ['independent', 'independent', 'failed', 'independent', 'independent']).s.k).toBe(1);
  });
  it('regride após 2 falhas seguidas no mesmo k (nunca abaixo de 1)', () => {
    const { s, changes } = run(initChain('backward', 4, 3), ['failed', 'failed']);
    expect(changes).toEqual(['held', 'regressed']);
    expect(s.k).toBe(2);
    expect(run(initChain('backward', 4, 1), ['failed', 'failed']).s.k).toBe(1);
  });
  it('falhas não consecutivas não regridem', () => {
    expect(run(initChain('forward', 4, 3), ['failed', 'independent', 'failed']).s.k).toBe(3);
    expect(run(initChain('forward', 4, 3), ['failed', 'prompted', 'failed']).s.k).toBe(3);
  });
  it('critério configurável e domínio no k máximo', () => {
    const r = updateChain(initChain('backward', 2, 1), 'independent', { criterion: 1, regressAfter: 2 });
    expect(r.change).toBe('advanced');
    expect(updateChain(r.state, 'independent', { criterion: 1, regressAfter: 2 }).change).toBe('mastered');
    expect(run(initChain('total', 3), ['independent', 'independent', 'independent']).changes[2]).toBe('mastered');
  });
  it('classifica a rodada: erro/sem resposta = falha; dica sem erro = com ajuda', () => {
    expect(classifyRun([{ response: 'correct', promptLevel: 'IND' }])).toBe('independent');
    expect(classifyRun([{ response: 'correct', promptLevel: 'VIS' }])).toBe('prompted');
    expect(classifyRun([{ response: 'correct', promptLevel: 'IND' }, { response: 'incorrect', promptLevel: 'IND' }])).toBe('failed');
    expect(classifyRun([{ response: 'no_response', promptLevel: 'IND' }])).toBe('failed');
    expect(classifyRun([])).toBe('failed');
  });
});
