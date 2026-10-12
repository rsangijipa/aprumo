import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, GameManifest, PROTOCOL_VERSION, type SessionConfig, type TargetConfig } from '@aprumo/protocol';
import {
  ACTION_IDS, INITIAL_CHAR, OBJECTS, OBJECT_IDS, ZONES, ZONE_GEOMETRY, extendChain, helpToRecord, missionsForTarget,
  nextPhase, planMissions, react, resolveAction, resolveMotion, resolveSettings, satisfiesRequest, settle, stepFall,
  summarize, triggerNeed, validateCatalog, zoneAt,
} from './logic';
import { manifest } from './manifest';

const cfg = (params: Record<string, unknown> = {}, over: Partial<SessionConfig> = {}): SessionConfig => ({
  protocolVersion: PROTOCOL_VERSION, runId: 'r1', appId: 'lanche-do-urso', appVersion: '1.0.0', childDisplayName: 'Bia',
  clinical: { model: 'DENVER', targets: [], trialsPerTarget: 4, interleave: false, seed: 3 },
  adaptation: DEFAULT_ADAPTATION, params, ...over,
}) as SessionConfig;
const target = (id: string, scoring: 'auto' | 'therapist' = 'auto'): TargetConfig => ({
  targetId: id, name: id, phase: 'acquisition', repertoire: 'play', fieldSize: 1,
  stimulus: { stimulusId: id, label: id, art: 'lanche-do-urso' }, distractors: [],
  promptHierarchy: [
    { code: 'IND', label: 'Independente', intrusiveness: 0 },
    { code: 'GES', label: 'Gestual', intrusiveness: 0.3 },
    { code: 'FP', label: 'Física total', intrusiveness: 1 },
  ],
  scoring,
});

describe('manifesto e catálogo', () => {
  it('manifesto válido, somente Denver, brincar simbólico 18–60 meses', () => {
    expect(GameManifest.safeParse(manifest).success).toBe(true);
    expect(manifest.appId).toBe('lanche-do-urso');
    expect(manifest.clinical.repertoires).toContain('play');
    expect(manifest.clinical.models).toEqual({ ABA: 'not-indicated', DENVER: 'joint-routine' });
    expect(manifest.clinical.playLevel).toBe('symbolic');
    expect(manifest.clinical.ageRangeMonths).toEqual([18, 60]);
  });
  it('catálogo de compatibilidades é consistente', () => {
    expect(validateCatalog()).toEqual([]);
    expect(validateCatalog([...OBJECTS, OBJECTS[0]!])).not.toEqual([]);
    expect(validateCatalog([{ id: 'bloco', label: 'x', kind: 'neutral', compat: {}, pretend: { zone: 'boca', action: 'comer', as: 'xx' as never } }])).not.toEqual([]);
  });
});

describe('combinações objeto–zona', () => {
  it('toda combinação tem reação definida ou "ué?" neutro, com e sem faz de conta', () => {
    for (const o of OBJECT_IDS) for (const z of ZONES) for (const p of [false, true]) {
      const r = resolveAction(o, z, p);
      expect([...ACTION_IDS, 'ue']).toContain(r.reaction);
      expect(r.conventional).toBe(r.reaction !== 'ue');
      expect(r.action === null).toBe(r.reaction === 'ue');
    }
  });
  it('ações convencionais esperadas', () => {
    expect(resolveAction('colher', 'boca', false).reaction).toBe('comer');
    expect(resolveAction('acai', 'boca', false).reaction).toBe('comer');
    expect(resolveAction('copo', 'boca', false).reaction).toBe('beber');
    expect(resolveAction('guardanapo', 'rosto', false).reaction).toBe('limpar');
    expect(resolveAction('cobertor', 'corpo', false).reaction).toBe('cobrir');
    expect(resolveAction('escova', 'cabeca', false).reaction).toBe('pentear');
    expect(resolveAction('esponja', 'corpo', false).reaction).toBe('banho');
  });
  it('ação não convencional (colher na cabeça) gera "ué?" sem punição', () => {
    expect(resolveAction('colher', 'cabeca', false)).toEqual({ reaction: 'ue', action: null, conventional: false, substitution: false });
    const m = triggerNeed(INITIAL_CHAR, 'fome');
    const t = react(m, 'ue');
    expect(t.active).toBe('ue');
    expect(t.after.need).toBe('fome');
    expect(t.satisfied).toBeNull();
  });
  it('substituição simbólica bloqueada sem a variação do adulto', () => {
    for (const z of ZONES) expect(resolveAction('bloco', z, false).reaction).toBe('ue');
    const on = resolveAction('bloco', 'boca', true);
    expect(on).toEqual({ reaction: 'comer', action: 'comer', conventional: true, substitution: true });
    expect(resolveAction('bloco', 'corpo', true).reaction).toBe('ue');
  });
  it('substituição não pode ser ligada por parâmetro', () => {
    const s = resolveSettings(cfg({ pretend: true, substitution: true }));
    expect(Object.keys(s)).not.toContain('pretend');
  });
});

describe('zonas e snap', () => {
  it('centros das zonas caem na própria zona; fora do personagem não há zona', () => {
    for (const z of ZONES) expect(zoneAt(ZONE_GEOMETRY[z])).toBe(z);
    expect(zoneAt({ x: 10, y: 390 })).toBeNull();
  });
  it('raio de snap: boca 80, corpo 100', () => {
    expect(ZONE_GEOMETRY.boca.r).toBe(80);
    expect(ZONE_GEOMETRY.corpo.r).toBe(100);
    expect(zoneAt({ x: 200 + 95, y: 282 })).toBe('corpo');
  });
});

describe('máquina de estados do personagem', () => {
  it('fome → comendo → satisfeito', () => {
    const t = react(triggerNeed(INITIAL_CHAR, 'fome'), 'comer');
    expect(t.active).toBe('comendo');
    expect(t.satisfied).toBe('fome');
    expect(t.after).toEqual({ state: 'satisfeito', need: null, covered: false });
  });
  it('ação que não atende mantém a necessidade', () => {
    const t = react(triggerNeed(INITIAL_CHAR, 'sede'), 'comer');
    expect(t.after.state).toBe('sede');
    expect(t.satisfied).toBeNull();
  });
  it('sono + cobertor → dormindo coberto; limpar com esponja atende "sujo"', () => {
    const t = react(triggerNeed(INITIAL_CHAR, 'sono'), 'cobrir');
    expect(t.after).toEqual({ state: 'dormindo', need: null, covered: true });
    expect(react(triggerNeed(INITIAL_CHAR, 'sujo'), 'banho').satisfied).toBe('sujo');
  });
  it('personagem não pede sozinho: repouso nunca cria necessidade', () => {
    expect(settle(INITIAL_CHAR)).toEqual(INITIAL_CHAR);
    expect(settle({ state: 'comendo', need: null, covered: false }).state).toBe('neutro');
    expect(settle({ state: 'ue', need: 'fome', covered: false }).state).toBe('fome');
  });
});

describe('sequências e fases', () => {
  it('sequência de 3 ações diferentes; repetir não alonga; pausa de 20 s reinicia', () => {
    let c = extendChain([], 'comer', 0);
    c = extendChain(c, 'comer', 1000);
    c = extendChain(c, 'beber', 2000);
    c = extendChain(c, 'limpar', 3000);
    expect(c.map((s) => s.action)).toEqual(['comer', 'beber', 'limpar']);
    expect(extendChain(c, 'cobrir', 3000 + 20001)).toHaveLength(1);
  });
  it('tema (lanche) → elaboração por outra ação ou variação', () => {
    expect(nextPhase('tema', { action: 'comer' })).toBe('tema');
    expect(nextPhase('tema', { action: 'beber' })).toBe('elaboracao');
    expect(nextPhase('tema', { variation: true })).toBe('elaboracao');
    expect(nextPhase('fechamento', { action: 'beber' })).toBe('fechamento');
  });
});

describe('física mínima', () => {
  it('a gota cai, quica e repousa no chão', () => {
    let b = { y: 0, vy: 0, resting: false };
    for (let i = 0; i < 400 && !b.resting; i++) b = stepFall(b, 16, 100);
    expect(b.resting).toBe(true);
    expect(b.y).toBe(100);
  });
});

describe('registro, parâmetros e plano', () => {
  it('ajuda → resposta e nível de dica', () => {
    expect(helpToRecord('independent')).toEqual({ response: 'correct', promptLevel: 'IND', promptSource: 'none' });
    expect(helpToRecord('helped', target('t').promptHierarchy)).toEqual({ response: 'correct', promptLevel: 'GES', promptSource: 'therapist' });
    expect(helpToRecord('none').response).toBe('no_response');
  });
  it('parâmetros: padrão livre, filtros e personagem predefinido', () => {
    const d = resolveSettings(cfg());
    expect(d.mode).toBe('free');
    expect(d.items).toHaveLength(OBJECT_IDS.length);
    expect(d.voice).toBe(true);
    const s = resolveSettings(cfg({ mode: 'mission', items: ['banana', 'xx'], character: 'avo', place: 'cama', voice: false, sensory: 'rich' }));
    expect(s).toMatchObject({ mode: 'mission', items: ['banana'], character: 'avo', place: 'cama', voice: false, sensory: 'rich' });
  });
  it('movimento: mínimo é estático; preferência do sistema reduz', () => {
    expect(resolveMotion({ sensory: 'minimal', motion: 'normal' }, 'full', false)).toBe('static');
    expect(resolveMotion({ sensory: 'normal', motion: null }, 'full', true)).toBe('reduced');
    expect(resolveMotion({ sensory: 'normal', motion: null }, 'full', false)).toBe('normal');
  });
  it('plano da missão segue a rotina e respeita alvos', () => {
    const p = planMissions(cfg({ mode: 'mission' }), resolveSettings(cfg({ mode: 'mission' })));
    expect(p.map((t) => t.request)).toEqual(['comer', 'beber', 'limpar', 'cobrir']);
    const c = cfg({ mode: 'mission', targets: { a: { missions: ['beber'] } } }, {
      clinical: { model: 'DENVER', targets: [target('a'), target('dar-banho-pentear')], trialsPerTarget: 2, interleave: true, seed: 1 },
    });
    const q = planMissions(c, resolveSettings(c));
    expect(q.map((t) => `${t.target.targetId}:${t.request}`)).toEqual(['a:beber', 'dar-banho-pentear:banho', 'a:beber', 'dar-banho-pentear:pentear']);
    expect(missionsForTarget(target('zz'), c, ['comer'])).toEqual(['comer']);
  });
  it('pedido de limpeza aceita limpar ou banho', () => {
    expect(satisfiesRequest('limpar', 'banho')).toBe(true);
    expect(satisfiesRequest('comer', 'beber')).toBe(false);
    expect(satisfiesRequest('comer', null)).toBe(false);
  });
  it('resumo: diversidade, sequência média, substituições e proporção no brinquedo real', () => {
    const s = summarize([
      { action: 'comer', substitution: false, location: 'tela', sequenceLength: 1, conventional: true },
      { action: 'beber', substitution: false, location: 'brinquedo-real', sequenceLength: 2, conventional: true },
      { action: 'comer', substitution: true, location: 'tela', sequenceLength: 3, conventional: true },
      { action: null, substitution: false, location: 'tela', sequenceLength: 0, conventional: false },
    ]);
    expect(s).toEqual({ episodes: 4, diversity: 2, meanSequence: 2, substitutions: 1, realToyRatio: 0.25 });
    expect(summarize([]).realToyRatio).toBe(0);
  });
});
