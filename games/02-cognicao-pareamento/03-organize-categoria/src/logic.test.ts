import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import { boxCap, flightPoint, getCategoryForItem, levelBoxes, planCategoryTrials } from './logic';

const stim = (id: string, label = id) => ({ stimulusId: id, label, art: id });

const config: SessionConfig = {
  protocolVersion: PROTOCOL_VERSION,
  runId: 'run-test',
  appId: 'organize-categoria',
  appVersion: '1.0.0',
  childDisplayName: 'Bia',
  clinical: {
    model: 'ABA',
    trialsPerTarget: 4,
    interleave: false,
    seed: 42,
    targets: [
      {
        targetId: 't1',
        name: 'maca',
        phase: 'acquisition',
        repertoire: 'matching',
        fieldSize: 3,
        stimulus: stim('maca', 'maçã'),
        distractors: [stim('carro'), stim('cachorro')],
        promptHierarchy: [{ code: 'IND', label: 'Ind', intrusiveness: 0 }],
        scoring: 'auto',
      },
    ],
  },
  adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 3 },
  params: {},
};

describe('Organize por Categoria', () => {
  it('identifica categoria do estímulo corretamente', () => {
    expect(getCategoryForItem('maca').id).toBe('alimentos');
    expect(getCategoryForItem('carro').id).toBe('veículos');
    expect(getCategoryForItem('cachorro').id).toBe('animais');
  });

  it('cada tentativa tem a caixa certa da categoria do item na posição planejada', () => {
    const trials = planCategoryTrials(config);
    expect(trials).toHaveLength(4);
    for (const t of trials) {
      expect(t.boxes[t.positionOfTarget]!.id).toBe(getCategoryForItem(t.item.art).id);
      expect(new Set(t.boxes.map((b) => b.id)).size).toBe(t.boxes.length);
      expect(t.target.targetId).toBe('t1');
    }
  });

  it('alterna o estímulo-alvo com distratores de outra categoria', () => {
    const items = planCategoryTrials(config).map((t) => t.item.art);
    expect(items[0]).toBe('maca');
    expect(items.some((a) => a !== 'maca')).toBe(true);
  });

  it('fases crescem de 2 caixas até o teto clínico', () => {
    const trials = planCategoryTrials({ ...config, clinical: { ...config.clinical, trialsPerTarget: 9 } });
    expect(trials.map((t) => t.boxes.length)).toEqual([2, 2, 2, 3, 3, 3, 3, 3, 3]);
    expect(levelBoxes(5, 4)).toBe(4);
    expect(boxCap({ adaptation: { ...DEFAULT_ADAPTATION, maxChoices: 8 } }, { fieldSize: 4 })).toBe(4);
  });

  it('respeita maxChoices da adaptação sensorial', () => {
    const trials = planCategoryTrials({
      ...config,
      adaptation: { ...config.adaptation, maxChoices: 2 },
    });
    for (const t of trials) expect(t.boxes).toHaveLength(2);
  });

  it('o voo termina dentro da caixa; o quique volta ao ponto de partida', () => {
    const f = { x0: 0, y0: 0, x1: 200, y1: 150, apex: 80, dur: 1, t: 0, spin: 90, bounce: false };
    expect(flightPoint(f, 1)).toMatchObject({ x: 200, y: 150 });
    expect(flightPoint(f, 0.5).y).toBeLessThan(75);
    const b = flightPoint({ ...f, bounce: true }, 1);
    expect(b.x).toBeCloseTo(0);
    expect(b.y).toBeCloseTo(0);
  });
});
