import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import { planListenerTrials } from './logic';
import { applyTap, describeToy, hintFocus, initialProgress, joinSteps, levelFrom, minimalAttrs, missionDetail, planMission, scoreMission, type MissionTrial } from './logic';

const stim = (id: string, label = id) => ({ stimulusId: id, label, art: id });

const config: SessionConfig = {
  protocolVersion: PROTOCOL_VERSION, runId: 'r', appId: 'escolha-pela-instrucao', appVersion: '1.0.0', childDisplayName: 'Teo',
  clinical: {
    model: 'ABA', trialsPerTarget: 6, interleave: false, seed: 3,
    targets: [{
      targetId: 't', name: 'bola', phase: 'acquisition', repertoire: 'listener', fieldSize: 3,
      stimulus: stim('bola'), distractors: [stim('carro'), stim('uva'), stim('banana', 'banana')],
      promptHierarchy: [{ code: 'IND', label: 'Ind', intrusiveness: 0 }], scoring: 'auto',
    }],
  },
  adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 3 }, params: {},
};

describe('Escolha pela Instrução', () => {
  it('instrução com contração correta e alvo na posição planejada', () => {
    const trials = planListenerTrials(config);
    expect(trials[0]!.instruction).toBe('Toque na bola');
    for (const t of trials) expect(t.options[t.positionOfTarget]!.stimulusId).toBe('bola');
  });
  it('campo nunca abaixo de 2 nem acima de maxChoices', () => {
    for (const t of planListenerTrials({ ...config, adaptation: { ...config.adaptation, maxChoices: 1 } })) expect(t.options).toHaveLength(2);
  });
});


const lvl = (level: number) => ({ ...config, params: { level } });
const solve = (t: MissionTrial) => {
  let p = initialProgress(0);
  let now = 0;
  for (const s of t.steps) {
    now += 1000;
    p = applyTap(t, p, { type: 'item', index: s.item }, now).progress;
    if (s.kind === 'place') p = applyTap(t, p, { type: 'zone', relation: s.relation! }, (now += 500)).progress;
  }
  return p;
};

describe('Missão Instrução · níveis', () => {
  it('nível padrão é 1 e mantém o modo simples', () => {
    expect(levelFrom({}).level).toBe(1);
    expect(levelFrom({ level: 99 }).level).toBe(5);
    const [t] = planMission(config);
    expect(t!.instruction).toBe('Toque na bola');
    expect(t!.steps).toHaveLength(1);
    expect(t!.items[t!.positionOfTarget]!.id).toBe('bola');
  });

  it('nível 2: atributo obrigatório e descrição sem ambiguidade', () => {
    for (const t of planMission(lvl(2))) {
      expect(t.attributes.length).toBeGreaterThan(0);
      const toys = t.items.map((i) => i.toy!);
      const step = t.steps[0]!;
      expect(minimalAttrs(toys[step.item]!, toys).length).toBeGreaterThan(0);
      expect(t.instruction).toMatch(/^Toque n[ao] /);
    }
  });

  it('nível 3: uma etapa "coloque" com relação espacial', () => {
    const trials = planMission(lvl(3));
    for (const t of trials) {
      expect(t.steps).toHaveLength(1);
      expect(t.steps[0]!.kind).toBe('place');
      expect(t.instruction).toMatch(/^Coloque [ao] \w+ (dentro|em cima|embaixo|ao lado) da caixa$/);
    }
    expect(new Set(trials.map((t) => t.steps[0]!.relation)).size).toBe(4);
  });

  it('níveis 4 e 5: 2 e 3 etapas com itens distintos', () => {
    for (const [level, n] of [[4, 2], [5, 3]] as const) {
      for (const t of planMission(lvl(level))) {
        expect(t.steps).toHaveLength(n);
        expect(new Set(t.steps.map((s) => s.item)).size).toBe(n);
        expect(t.steps.some((s) => s.kind === 'place')).toBe(true);
        expect(t.instruction.split(/, depois | e por último /)).toHaveLength(n);
      }
    }
  });

  it('determinístico pela semente', () => {
    expect(planMission(lvl(5)).map((t) => t.instruction)).toEqual(planMission(lvl(5)).map((t) => t.instruction));
  });
});

describe('Missão Instrução · linguagem', () => {
  it('concordância de gênero em cor e tamanho', () => {
    expect(describeToy({ kind: 'bola', color: 'vermelho', size: 'pequeno' }, ['color', 'size'])).toBe('bola pequena vermelha');
    expect(describeToy({ kind: 'cubo', color: 'amarelo', size: 'grande' }, ['color'])).toBe('cubo amarelo');
  });
  it('junção das etapas', () => {
    expect(joinSteps(['Toque na bola', 'Coloque o cubo dentro da caixa', 'Toque no peixe'])).toBe(
      'Toque na bola, depois coloque o cubo dentro da caixa e por último toque no peixe',
    );
  });
});

describe('Missão Instrução · etapas e pontuação', () => {
  const t = planMission(lvl(5))[0]!;

  it('sequência certa: todas as etapas corretas, latência por etapa', () => {
    const p = solve(t);
    expect(p.done).toBe(true);
    expect(p.results.every((r) => r.correct)).toBe(true);
    expect(p.results[0]!.latencyMs).toBeGreaterThanOrEqual(1000);
    expect(scoreMission(t, p.results)).toMatchObject({ response: 'correct', selectedPosition: t.positionOfTarget });
  });

  it('item certo com relação errada é incorreto', () => {
    const place = planMission(lvl(3))[0]!;
    const s = place.steps[0]!;
    const wrong = (['dentro', 'em-cima', 'embaixo', 'ao-lado'] as const).find((r) => r !== s.relation)!;
    let p = applyTap(place, initialProgress(0), { type: 'item', index: s.item }, 100).progress;
    expect(hintFocus(place, p).zone).toBe(s.relation);
    p = applyTap(place, p, { type: 'zone', relation: wrong }, 900).progress;
    const score = scoreMission(place, p.results);
    expect(score.response).toBe('incorrect');
    expect(score.stepsCorrect).toEqual([false]);
    expect(missionDetail(place, p.results, 1)).toMatchObject({ steps: 1, relation: s.relation, instructionRepeats: 1, stepsCorrect: 0 });
  });

  it('lugar sem item escolhido é ignorado; item colocado não pode ser reusado', () => {
    const place = planMission(lvl(3))[0]!;
    const s = place.steps[0]!;
    expect(applyTap(place, initialProgress(0), { type: 'zone', relation: 'dentro' }, 10).accepted).toBe(false);
    const p = solve(place);
    expect(applyTap(place, p, { type: 'item', index: s.item }, 99).accepted).toBe(false);
  });

  it('modo sem erro (correção) só aceita o toque esperado', () => {
    const wrongItem = t.steps[0]!.item === 0 ? 1 : 0;
    expect(applyTap(t, initialProgress(0), { type: 'item', index: wrongItem }, 10, true).accepted).toBe(false);
    expect(applyTap(t, initialProgress(0), { type: 'item', index: t.steps[0]!.item }, 10, true).accepted).toBe(true);
  });
});
