import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, GameManifest, PROTOCOL_VERSION, type SessionConfig, type TargetConfig } from '@aprumo/protocol';
import { seededRandom } from '@aprumo/game-sdk';
import {
  ACTIONS, FOREARM, SHOULDER_L, SHOULDER_R, UPPER_ARM, actionById, buildTimeline, outcomeToRecord, planTrials,
  resolveMotion, resolveSettings, samplePose, selectSequence, solveArm, timelineDuration,
} from './logic';
import { manifest } from './manifest';

const target = (id: string, art = 'espelho-magico'): TargetConfig => ({
  targetId: id, name: id, phase: 'acquisition', repertoire: 'imitation', fieldSize: 1,
  stimulus: { stimulusId: id, label: id, art }, distractors: [],
  promptHierarchy: [
    { code: 'IND', label: 'Independente', intrusiveness: 0 },
    { code: 'GES', label: 'Gestual', intrusiveness: 0.25 },
    { code: 'PP', label: 'Física parcial', intrusiveness: 0.6 },
    { code: 'FP', label: 'Física total', intrusiveness: 1 },
  ],
  scoring: 'therapist',
});
const cfg = (over: Partial<SessionConfig> = {}, params: Record<string, unknown> = {}): SessionConfig => ({
  protocolVersion: PROTOCOL_VERSION, runId: 'r1', appId: 'espelho-magico', appVersion: '1.0.0', childDisplayName: 'Bia',
  clinical: { model: 'ABA', targets: [], trialsPerTarget: 6, interleave: false, seed: 7 },
  adaptation: DEFAULT_ADAPTATION, params, ...over,
}) as SessionConfig;

describe('Espelho Mágico — manifesto e catálogo', () => {
  it('manifesto é válido e pontuado pelo terapeuta', () => {
    expect(GameManifest.safeParse(manifest).success).toBe(true);
    expect(manifest.clinical.therapistScoring).toEqual(['imitation']);
    expect(manifest.clinical.ageRangeMonths).toEqual([24, 96]);
  });
  it('catálogo cobre motor grosso, fino e com objeto, com ids únicos', () => {
    expect(new Set(ACTIONS.map((a) => a.id)).size).toBe(ACTIONS.length);
    for (const c of ['gross', 'fine', 'object']) expect(ACTIONS.some((a) => a.category === c)).toBe(true);
  });
  it('todas as poses-chave são alcançáveis pelo braço do modelo', () => {
    const reach = UPPER_ARM + FOREARM;
    for (const a of ACTIONS) for (const k of a.cycle) {
      expect(Math.hypot(k.pose.lh.x - SHOULDER_L.x, k.pose.lh.y - SHOULDER_L.y)).toBeLessThanOrEqual(reach);
      expect(Math.hypot(k.pose.rh.x - SHOULDER_R.x, k.pose.rh.y - SHOULDER_R.y)).toBeLessThanOrEqual(reach);
    }
  });
  it('IK mantém o comprimento dos segmentos e o cotovelo para fora', () => {
    const { elbow, hand } = solveArm(SHOULDER_L, { x: 114, y: 160 });
    expect(Math.hypot(elbow.x - SHOULDER_L.x, elbow.y - SHOULDER_L.y)).toBeCloseTo(UPPER_ARM, 3);
    expect(Math.hypot(hand.x - elbow.x, hand.y - elbow.y)).toBeCloseTo(FOREARM, 3);
    expect(elbow.x).toBeLessThan(SHOULDER_L.x);
  });
  it('na palma as mãos se encontram', () => {
    const clap = actionById('bater-palmas')!.cycle.find((k) => k.beat)!.pose;
    expect(Math.abs(clap.rh.x - clap.lh.x)).toBeLessThan(22);
  });
});

describe('linha do tempo da demonstração', () => {
  const clap = actionById('bater-palmas')!;
  it('modo estático usa poses-chave sem interpolação', () => {
    const segs = buildTimeline(clap, 'static', 2);
    expect(segs.every((s) => s.tweenMs === 0)).toBe(true);
    expect(samplePose(segs, segs[0]!.holdMs + 10).pose).toEqual(segs[1]!.pose);
  });
  it('repete o ciclo N vezes e termina em repouso', () => {
    expect(buildTimeline(clap, 'normal', 3)).toHaveLength(1 + clap.cycle.length * 3 + 1);
    const segs = buildTimeline(clap, 'normal', 1);
    expect(samplePose(segs, timelineDuration(segs) + 1).done).toBe(true);
  });
  it('reduzido é mais lento que normal; empilhar não repete', () => {
    expect(timelineDuration(buildTimeline(clap, 'reduced', 2))).toBeGreaterThan(timelineDuration(buildTimeline(clap, 'normal', 2)));
    const stack = actionById('empilhar-bloco')!;
    expect(buildTimeline(stack, 'normal', 4)).toHaveLength(stack.cycle.length + 2);
  });
  it('interpola a mão no meio do movimento', () => {
    const segs = buildTimeline(clap, 'normal', 1);
    const s = samplePose(segs, segs[0]!.holdMs + segs[1]!.tweenMs / 2);
    expect(s.phase).toBe('tween');
    const [a, b] = [segs[0]!.pose.lh.x, segs[1]!.pose.lh.x];
    expect(s.pose.lh.x).toBeGreaterThan(Math.min(a, b));
    expect(s.pose.lh.x).toBeLessThan(Math.max(a, b));
  });
});

describe('registro do adulto → protocolo', () => {
  const h = target('t').promptHierarchy;
  it('mapeia os quatro botões', () => {
    expect(outcomeToRecord('independent', h)).toEqual({ response: 'correct', promptLevel: 'IND', promptSource: 'none' });
    expect(outcomeToRecord('partial', h)).toEqual({ response: 'correct', promptLevel: 'PP', promptSource: 'therapist' });
    expect(outcomeToRecord('full', h)).toEqual({ response: 'correct', promptLevel: 'FP', promptSource: 'therapist' });
    expect(outcomeToRecord('none', h).response).toBe('no_response');
  });
  it('usa códigos padrão quando a hierarquia é curta', () => {
    const short = [{ code: 'IND', label: 'I', intrusiveness: 0 }];
    expect(outcomeToRecord('partial', short).promptLevel).toBe('PP');
    expect(outcomeToRecord('full', short).promptLevel).toBe('FP');
  });
});

describe('parâmetros e sequência', () => {
  it('nunca repete a mesma ação em seguida', () => {
    const seq = selectSequence(['a', 'b', 'c'], 200, seededRandom(3));
    for (let i = 1; i < seq.length; i++) expect(seq[i]).not.toBe(seq[i - 1]);
    expect(selectSequence(['a'], 3, seededRandom(1))).toEqual(['a', 'a', 'a']);
  });
  it('plano sem alvos usa alvo de imitação padrão e filtra categorias', () => {
    const c = cfg({}, { categories: ['object'] });
    const plan = planTrials(c, resolveSettings(c), seededRandom(1));
    expect(plan).toHaveLength(6);
    expect(plan.every((t) => t.action.category === 'object' && t.target.targetId === 'imitacao-motora')).toBe(true);
    for (let i = 1; i < plan.length; i++) expect(plan[i]!.action.id).not.toBe(plan[i - 1]!.action.id);
  });
  it('alvo que cita uma ação usa essa ação; intercalado alterna alvos', () => {
    const c = cfg({ clinical: { model: 'ABA', targets: [target('palmas', 'bater-palmas'), target('livre')], trialsPerTarget: 3, interleave: true, seed: 1 } } as Partial<SessionConfig>);
    const plan = planTrials(c, resolveSettings(c), seededRandom(2));
    expect(plan.map((t) => t.target.targetId)).toEqual(['palmas', 'livre', 'palmas', 'livre', 'palmas', 'livre']);
    expect(plan.filter((t) => t.target.targetId === 'palmas').every((t) => t.action.id === 'bater-palmas')).toBe(true);
  });
  it('movimento: sensorial mínimo é estático; preferência do sistema reduz', () => {
    expect(resolveMotion({ sensory: 'minimal', motion: 'normal' }, 'full', false)).toBe('static');
    expect(resolveMotion({ sensory: 'normal', motion: null }, 'full', true)).toBe('reduced');
    expect(resolveMotion({ sensory: 'rich', motion: null }, 'full', false)).toBe('normal');
    expect(resolveSettings(cfg({}, { demoCycles: 9, actions: ['pular', 'x'] }))).toMatchObject({ demoCycles: 5, pool: ['pular'] });
  });
});
