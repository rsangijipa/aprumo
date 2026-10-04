import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import {
  associatesOf, categoryOf, DEFAULT_ASSOCIATIONS, fitGrid, parseToken, planTrials, presetForAge, resolveMotion,
  resolveSettings, snapFieldSize, summarizeAttempts, type PlannedTrial,
} from './logic';

const stim = (id: string) => ({ stimulusId: id, label: id, art: id });
const target = (targetId: string, art: string, distractors: string[], fieldSize = 3) => ({
  targetId, name: art, phase: 'acquisition' as const, repertoire: 'matching' as const, fieldSize,
  stimulus: stim(art), distractors: distractors.map(stim),
  promptHierarchy: [{ code: 'IND', label: 'Ind', intrusiveness: 0 }], scoring: 'auto' as const,
});
const config = (over: Partial<SessionConfig['clinical']> = {}, maxChoices = 3, params: Record<string, unknown> = {}): SessionConfig => ({
  protocolVersion: PROTOCOL_VERSION,
  runId: 'run-1',
  appId: 'encontre-o-igual',
  appVersion: '2.0.0',
  childDisplayName: 'Teo',
  clinical: {
    model: 'ABA',
    trialsPerTarget: 9,
    interleave: true,
    seed: 11,
    targets: [target('a', 'bola', ['copo', 'livro', 'carro']), target('b', 'copo', ['bola', 'flor'])],
    ...over,
  },
  adaptation: { ...DEFAULT_ADAPTATION, maxChoices },
  params,
});

/** Invariantes de toda tentativa, em qualquer dimensão. */
function expectSound(t: PlannedTrial) {
  expect(t.options).toHaveLength(t.fieldSize);
  expect(t.options[t.positionOfTarget]!.stimulusId).toBe(t.target.stimulus.stimulusId);
  expect(new Set(t.options.map((o) => o.stimulusId)).size).toBe(t.options.length);
  expect(new Set(t.options.map((o) => o.art)).size).toBe(t.options.length);
}

describe('Match Lab · idênticos (compatível com Encontre o Igual)', () => {
  it('o correto está na posição declarada e o campo respeita maxChoices', () => {
    const trials = planTrials(config({}, 2, { fillFromLibrary: false }));
    expect(trials).toHaveLength(18);
    for (const t of trials) {
      expect(t.fieldSize).toBe(2);
      expect(t.model.stimulusId).toBe(t.target.stimulus.stimulusId);
      expectSound(t);
    }
  });

  it('sem completar pelo acervo, o campo cabe no banco configurado', () => {
    const trials = planTrials(config({ targets: [target('a', 'bola', ['copo', 'livro', 'carro'], 6), target('b', 'copo', ['bola', 'flor'], 6)] }, 6, { fillFromLibrary: false }));
    expect(trials.filter((t) => t.target.targetId === 'b').every((t) => t.fieldSize === 3)).toBe(true);
    expect(trials.filter((t) => t.target.targetId === 'a').every((t) => t.fieldSize === 4)).toBe(true);
  });

  it('reprodutível pela semente', () => {
    const key = (c: SessionConfig) => planTrials(c).map((t) => t.options.map((o) => o.stimulusId).join());
    expect(key(config())).toEqual(key(config()));
    expect(key(config({ seed: 12 }))).not.toEqual(key(config()));
  });
});

describe('Match Lab · tamanhos de campo', () => {
  it('snapFieldSize usa só 1, 2, 3, 4, 6, 8, 12', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 30].map(snapFieldSize)).toEqual([1, 1, 2, 3, 4, 4, 6, 6, 8, 8, 12, 12]);
  });

  it.each([2, 3, 4, 6, 8, 12])('campo de %i completa com o acervo, sem alvo duplicado', (n) => {
    const trials = planTrials(config({}, 3, { fieldSize: n }));
    for (const t of trials) {
      expect(t.fieldSize).toBe(n);
      expectSound(t);
      expect(t.options.filter((o) => o.art === t.target.stimulus.art)).toHaveLength(1);
    }
  });

  it('fieldSize por alvo em params.targets tem prioridade', () => {
    const trials = planTrials(config({}, 3, { fieldSize: 4, targets: { b: { fieldSize: 8 } } }));
    expect(new Set(trials.filter((t) => t.target.targetId === 'a').map((t) => t.fieldSize))).toEqual(new Set([4]));
    expect(new Set(trials.filter((t) => t.target.targetId === 'b').map((t) => t.fieldSize))).toEqual(new Set([8]));
  });

  it.each([
    [288, 300], [288, 420], [343, 360], [700, 520], [980, 420],
  ])('grade cabe em %i×%i px para todos os campos (320px de tela inclusive)', (w, h) => {
    for (const n of [1, 2, 3, 4, 6, 8, 12]) {
      const g = fitGrid(n, w, h);
      expect(g.cols * g.rows).toBe(n);
      expect(g.cols).toBeLessThanOrEqual(6);
      expect(g.fits).toBe(true);
      expect(g.item).toBeGreaterThanOrEqual(48);
      expect(g.cols * g.item + (g.cols - 1) * g.gap).toBeLessThanOrEqual(w);
      expect(g.rows * g.item + (g.rows - 1) * g.gap).toBeLessThanOrEqual(h);
    }
  });

  it('retrato estreito empilha; paisagem espalha; touchScale aumenta o mínimo', () => {
    expect(fitGrid(12, 288, 420).cols).toBe(3);
    expect(fitGrid(12, 980, 420).cols).toBe(6);
    expect(fitGrid(4, 288, 420).cols).toBe(2);
    expect(fitGrid(12, 288, 300, 2).item).toBe(96);
  });
});

describe('Match Lab · equilíbrio de posição', () => {
  it.each([3, 4, 6])('campo %i: contagem por posição difere no máximo 1 e nunca 3× seguidas', (n) => {
    const trials = planTrials(config({ trialsPerTarget: 12, interleave: false }, 3, { fieldSize: n }));
    for (const id of ['a', 'b']) {
      const pos = trials.filter((t) => t.target.targetId === id).map((t) => t.positionOfTarget);
      const counts = [...Array(n).keys()].map((p) => pos.filter((x) => x === p).length);
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
      for (let k = 2; k < pos.length; k++) expect(pos[k] === pos[k - 1] && pos[k] === pos[k - 2]).toBe(false);
    }
  });

  it('distratores mudam de posição entre tentativas', () => {
    const trials = planTrials(config({ interleave: false }, 3, { fieldSize: 4 })).filter((t) => t.target.targetId === 'a');
    expect(new Set(trials.map((t) => t.options.map((o) => o.stimulusId).join())).size).toBeGreaterThan(trials.length / 2);
  });
});

describe('Match Lab · dimensões', () => {
  it('cor: correto com a cor do modelo e outra forma; distratores sempre de outra cor', () => {
    const trials = planTrials(config({}, 3, { dimension: 'color', fieldSize: 8 }));
    for (const t of trials) {
      expectSound(t);
      expect(t.dimension).toBe('color');
      const m = parseToken(t.model.art)!;
      const c = parseToken(t.target.stimulus.art)!;
      expect(c.color).toBe(m.color);
      expect(c.shape).not.toBe(m.shape);
      t.options.forEach((o, i) => i !== t.positionOfTarget && expect(parseToken(o.art)!.color).not.toBe(m.color));
      // Há um competidor com a forma do modelo (exige atenção à cor, não à forma).
      expect(t.options.some((o, i) => i !== t.positionOfTarget && parseToken(o.art)!.shape === m.shape)).toBe(true);
    }
  });

  it('forma: correto com a forma do modelo e outra cor; distratores de outra forma; modelo fixo pelo alvo', () => {
    const cfg = config({ targets: [target('s', 'lab:estrela:azul', [], 4)] }, 4, { dimension: 'shape' });
    const trials = planTrials(cfg);
    for (const t of trials) {
      expectSound(t);
      expect(t.model.art).toBe('lab:estrela:azul');
      expect(parseToken(t.target.stimulus.art)!.shape).toBe('estrela');
      expect(parseToken(t.target.stimulus.art)!.color).not.toBe('azul');
      t.options.forEach((o, i) => i !== t.positionOfTarget && expect(parseToken(o.art)!.shape).not.toBe('estrela'));
      expect(t.target.targetId).toBe('s');
    }
  });

  it('categoria: modelo é outro membro da categoria; nenhum distrator da mesma categoria', () => {
    const cfg = config({ targets: [target('f', 'banana', ['maca', 'uva', 'carro', 'gato'])] }, 6, { dimension: 'category', fieldSize: 6 });
    for (const t of planTrials(cfg)) {
      expectSound(t);
      expect(t.model.art).not.toBe('banana');
      expect(categoryOf(t.model.art)).toBe('alimentos');
      t.options.forEach((o, i) => i !== t.positionOfTarget && expect(categoryOf(o.art)).not.toBe('alimentos'));
    }
  });

  it('função: modelo é o associado; nenhum distrator associado ao modelo', () => {
    const cfg = config({ targets: [target('e', 'escova', ['colher', 'bola'])] }, 3, { dimension: 'function', fieldSize: 12 });
    for (const t of planTrials(cfg)) {
      expectSound(t);
      expect(t.model.art).toBe('copo');
      const blocked = associatesOf('copo', DEFAULT_ASSOCIATIONS);
      t.options.forEach((o, i) => i !== t.positionOfTarget && expect(blocked).not.toContain(o.art));
    }
  });

  it('função: associações do profissional substituem as padrão', () => {
    const cfg = config({ targets: [target('x', 'flor', [])] }, 3, { dimension: 'function', associations: { flor: 'casa' } });
    expect(planTrials(cfg).every((t) => t.model.art === 'casa' && !t.dimensionFallback)).toBe(true);
  });

  it('dimensão inviável cai para idênticos e marca o fallback', () => {
    const cfg = config({ targets: [target('x', 'flor', ['bola'])] }, 3, { dimension: 'category' });
    for (const t of planTrials(cfg)) {
      expect(t.dimension).toBe('identical');
      expect(t.dimensionFallback).toBe(true);
      expect(t.model.art).toBe('flor');
    }
  });

  it('dimensão por alvo', () => {
    const cfg = config({}, 3, { targets: { a: { dimension: 'function' } } });
    const trials = planTrials(cfg);
    expect(trials.filter((t) => t.target.targetId === 'a').every((t) => t.dimension === 'function' && t.model.art === 'cachorro')).toBe(true);
    expect(trials.filter((t) => t.target.targetId === 'b').every((t) => t.dimension === 'identical')).toBe(true);
  });
});

describe('Match Lab · configuração e tentativas de resposta', () => {
  it('preset por idade e padrões de modo, sensorial e movimento', () => {
    expect([30, 71, 72, 119, 120].map(presetForAge)).toEqual(['soft-clay', 'soft-clay', 'cozy-cartoon', 'cozy-cartoon', 'lab-clean']);
    const s = resolveSettings(config({}, 3, { ageYears: 11, responseMode: 'drag' }));
    expect([s.preset, s.responseMode, s.sensory]).toEqual(['lab-clean', 'drag', 'normal']);
    expect(resolveSettings(config({}, 3, { responseMode: 'voar', preset: 'x' })).responseMode).toBe('tap');
    expect(resolveMotion(s, 'full', false)).toBe('normal');
    expect(resolveMotion(s, 'full', true)).toBe('reduced');
    expect(resolveMotion({ ...s, sensory: 'minimal' }, 'full', false)).toBe('static');
  });

  it('autocorreção e número de tentativas antes de confirmar', () => {
    expect(summarizeAttempts([], 2, 2)).toEqual({ attempts: 1, selfCorrected: false });
    expect(summarizeAttempts([2, 2], 2, 2)).toEqual({ attempts: 1, selfCorrected: false });
    expect(summarizeAttempts([0, 1], 2, 2)).toEqual({ attempts: 3, selfCorrected: true });
    expect(summarizeAttempts([2, 0], 0, 2)).toEqual({ attempts: 2, selfCorrected: false });
  });
});

describe('Match Lab · manifesto', () => {
  it('é válido e mantém o appId estável', async () => {
    const { GameManifest } = await import('@aprumo/protocol');
    const { manifest } = await import('./manifest');
    expect(GameManifest.safeParse(manifest).success).toBe(true);
    expect(manifest.appId).toBe('encontre-o-igual');
    expect(manifest.name).toBe('Match Lab');
  });
});
