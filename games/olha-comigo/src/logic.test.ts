import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, GameManifest, type SessionConfig } from '@aprumo/protocol';
import {
  CUE_LEVELS, gazeToward, longestRun, minAngularSeparation, nextCue, objectSizePx, OBJECTS, planTrials,
  positionCounts, resolveMotion, resolveSettings, sceneLayout, type CueOutcome,
} from './logic';
import { manifest } from './manifest';

const cfg = (over: Partial<SessionConfig['clinical']> = {}, params: Record<string, unknown> = {}) => ({
  clinical: { model: 'ABA' as const, targets: [], trialsPerTarget: 12, interleave: false, seed: 42, ...over },
  adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 4 },
  params,
});

describe('manifesto', () => {
  it('é válido e cobre o repertório social de 24 a 84 meses', () => {
    expect(GameManifest.safeParse(manifest).success).toBe(true);
    expect(manifest.appId).toBe('olha-comigo');
    expect(manifest.clinical.repertoires).toEqual(['social']);
    expect(manifest.clinical.ageRangeMonths).toEqual([24, 84]);
  });
});

describe('cena e olhar', () => {
  it.each([2, 3, 4])('layout com %i objetos dentro da cena e acima do guia', (n) => {
    const slots = sceneLayout(n);
    expect(slots).toHaveLength(n);
    for (const s of slots) {
      expect(s.x).toBeGreaterThan(0);
      expect(s.x).toBeLessThan(100);
      expect(s.y).toBeLessThan(78);
    }
  });
  it('fora da faixa é limitado a 2–4', () => {
    expect(sceneLayout(1)).toHaveLength(2);
    expect(sceneLayout(9)).toHaveLength(4);
  });
  it('as direções do olhar são bem separadas (≥ 20°)', () => {
    for (const n of [2, 3, 4]) expect(minAngularSeparation(n)).toBeGreaterThanOrEqual(20);
  });
  it('o guia vira para o lado do objeto', () => {
    const [l, c, r] = sceneLayout(3);
    expect(gazeToward(l!).headTurn).toBeLessThan(0);
    expect(gazeToward(l!).side).toBe('left');
    expect(gazeToward(r!).eyeX).toBeGreaterThan(0);
    expect(gazeToward(c!).side).toBe('center');
  });
  it('alvos de toque nunca menores que 48px × touchScale', () => {
    for (const scale of [1, 1.5, 2]) for (const n of [2, 4]) for (const px of [200, 320, 900]) {
      expect(objectSizePx(px, scale, n)).toBeGreaterThanOrEqual(48 * scale);
    }
  });
});

describe('hierarquia de pistas (esvanecimento)', () => {
  const ok = (cue: CueOutcome['cue']): CueOutcome => ({ cue, response: 'correct', prompted: false });
  it('níveis do menos ao mais apoio', () => {
    expect(CUE_LEVELS).toEqual(['gaze', 'gaze_point', 'gaze_point_verbal']);
  });
  it('retira apoio após 2 acertos independentes seguidos', () => {
    expect(nextCue('gaze_point_verbal', [ok('gaze_point_verbal')])).toBe('gaze_point_verbal');
    expect(nextCue('gaze_point_verbal', [ok('gaze_point_verbal'), ok('gaze_point_verbal')])).toBe('gaze_point');
    expect(nextCue('gaze', [ok('gaze'), ok('gaze')])).toBe('gaze');
  });
  it('acerto com dica não conta para esvanecer', () => {
    expect(nextCue('gaze_point', [ok('gaze_point'), { cue: 'gaze_point', response: 'correct', prompted: true }])).toBe('gaze_point');
  });
  it('erro ou sem resposta devolve um nível de apoio', () => {
    expect(nextCue('gaze', [{ cue: 'gaze', response: 'incorrect', prompted: false }])).toBe('gaze_point');
    expect(nextCue('gaze_point_verbal', [{ cue: 'gaze_point_verbal', response: 'no_response', prompted: false }])).toBe('gaze_point_verbal');
  });
});

describe('plano de tentativas', () => {
  it('balanceia a posição do alvo e evita sequências longas', () => {
    for (const n of [2, 3, 4]) {
      const t = planTrials(cfg({ trialsPerTarget: 12 }, { fieldSize: n }));
      expect(t).toHaveLength(12);
      const c = positionCounts(t, n);
      expect(Math.max(...c) - Math.min(...c)).toBeLessThanOrEqual(1);
      expect(longestRun(t.map((x) => x.positionOfTarget))).toBeLessThanOrEqual(2);
    }
  });
  it('o alvo é o objeto na posição indicada e não há objetos repetidos', () => {
    for (const t of planTrials(cfg({}, { fieldSize: 4 }))) {
      expect(t.target.stimulus.stimulusId).toBe(t.options[t.positionOfTarget]!.stimulusId);
      expect(new Set(t.options.map((o) => o.stimulusId)).size).toBe(t.options.length);
      expect(t.target.repertoire).toBe('social');
      for (const o of t.options) expect(OBJECTS.some((x) => x.id === o.stimulusId)).toBe(true);
    }
  });
  it('é reprodutível pela semente e respeita maxChoices', () => {
    expect(planTrials(cfg())).toEqual(planTrials(cfg()));
    const c = cfg();
    c.adaptation.maxChoices = 2;
    expect(planTrials(c).every((t) => t.fieldSize === 2)).toBe(true);
  });
});

describe('adaptações', () => {
  it('sensorial deriva do feedback e parâmetros válidos prevalecem', () => {
    expect(resolveSettings({ params: {}, adaptation: { ...DEFAULT_ADAPTATION, feedback: 'none' } }).sensory).toBe('minimal');
    expect(resolveSettings({ params: { sensory: 'rich', cueLevel: 'gaze' }, adaptation: DEFAULT_ADAPTATION })).toMatchObject({ sensory: 'rich', cueFixed: 'gaze' });
    expect(resolveSettings({ params: { cueLevel: 'xx' }, adaptation: DEFAULT_ADAPTATION }).cueFixed).toBeNull();
  });
  it('movimento: mínimo é estático e prefers-reduced-motion rebaixa normal', () => {
    expect(resolveMotion({ sensory: 'minimal', motion: 'normal' }, 'full', false)).toBe('static');
    expect(resolveMotion({ sensory: 'normal', motion: null }, 'full', true)).toBe('reduced');
    expect(resolveMotion({ sensory: 'rich', motion: null }, 'full', false)).toBe('normal');
  });
});
