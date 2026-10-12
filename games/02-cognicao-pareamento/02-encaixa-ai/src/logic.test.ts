import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, EventPayloads, GameManifest } from '@aprumo/protocol';
import { seededRandom } from '@aprumo/game-sdk';
import { initChain } from './chain';
import { pathBBox } from './geometry';
import {
  LEVELS, angleDiff, angleError, buildPuzzle, buildTrialPayload, evaluateDrop, extentOf, initialAngles, logDrop, newStepLog,
  pieceCount, resolveMotion, resolveSettings, snapAngle, stepResponse, trayLayout, type OpenSlot,
} from './logic';
import { manifest } from './manifest';
import { ALL_SHAPES, FARM } from './shapes';

const settingsFor = (params: Record<string, unknown> = {}, adaptation = DEFAULT_ADAPTATION) => resolveSettings({ adaptation, params });

describe('manifesto e acervo', () => {
  it('manifesto válido, só ABA, pontuação automática', () => {
    expect(GameManifest.safeParse(manifest).success).toBe(true);
    expect(manifest.appId).toBe('encaixa-ai');
    expect(manifest.clinical.models.DENVER).toBe('not-indicated');
    expect(manifest.clinical.autoScoring).toEqual(['matching']);
  });
  it('todas as peças têm path legível, ids únicos e extensão ~100', () => {
    expect(new Set(ALL_SHAPES.map((s) => s.id)).size).toBe(ALL_SHAPES.length);
    for (const s of [...ALL_SHAPES, ...FARM]) {
      const b = pathBBox(s.d);
      expect(Math.max(b.w, b.h)).toBeGreaterThan(70);
      expect(Math.max(b.w, b.h)).toBeLessThan(110);
    }
  });
});

describe('parâmetros', () => {
  it('padrões: nível 1, reverso, critério 3/2, tolerância 20°, raio do nível', () => {
    expect(settingsFor()).toMatchObject({
      level: 1, chainType: 'backward', startK: 1, rules: { criterion: 3, regressAfter: 2 }, angleTolerance: 20, captureRadius: 70, traySide: 'left', promptKind: 'VIS',
    });
  });
  it('aceita aliases, mão dominante e limita valores', () => {
    expect(settingsFor({ chainType: 'direto' }).chainType).toBe('forward');
    expect(settingsFor({ hand: 'right' }).traySide).toBe('right');
    expect(settingsFor({ traySide: 'left', hand: 'right' }).traySide).toBe('left');
    expect(settingsFor({ level: 99 }).level).toBe(6);
    expect(settingsFor({ level: 4 }).captureRadius).toBe(40);
    expect(settingsFor({ level: 4, captureRadiusPx: 500 }).captureRadius).toBe(150);
  });
  it('sensorial pelo feedback; mínimo é estático; sistema reduz', () => {
    expect(settingsFor({}, { ...DEFAULT_ADAPTATION, feedback: 'none' }).sensory).toBe('minimal');
    expect(resolveMotion({ sensory: 'minimal', motion: 'normal' }, 'full', false)).toBe('static');
    expect(resolveMotion({ sensory: 'normal', motion: null }, 'full', true)).toBe('reduced');
    expect(resolveMotion({ sensory: 'rich', motion: 'normal' }, 'reduced', false)).toBe('normal');
  });
});

describe('níveis (tabela 4.3)', () => {
  it('raios 70/55/45/40/35/30 e rotação a partir do 4', () => {
    expect(LEVELS.map((l) => l.captureRadius)).toEqual([70, 55, 45, 40, 35, 30]);
    expect(LEVELS.map((l) => l.rotation)).toEqual([false, false, false, true, true, true]);
  });
  it('contagem de peças dentro da faixa', () => {
    expect(pieceCount({ level: 1, pieces: null })).toBe(2);
    expect(pieceCount({ level: 1, pieces: 1 })).toBe(1);
    expect(pieceCount({ level: 2, pieces: 8 })).toBe(3);
    expect(pieceCount({ level: 5, pieces: null })).toBe(6);
    expect(pieceCount({ level: 6, pieces: 11 })).toBe(12);
  });
  it.each([1, 2, 3, 4, 5, 6])('nível %i gera quebra-cabeça coerente dentro do palco', (level) => {
    const pz = buildPuzzle(settingsFor({ level }), seededRandom(level));
    expect(pz.slots).toHaveLength(pz.pieces.length);
    expect(pz.rotation).toBe(level >= 4);
    expect(pz.cavities).toBe(level !== 6);
    for (const s of pz.slots) {
      expect(s.x).toBeGreaterThan(pz.board.x);
      expect(s.x).toBeLessThan(pz.board.x + pz.board.w);
      expect(s.y).toBeGreaterThan(pz.board.y);
      expect(s.y).toBeLessThan(pz.board.y + pz.board.h);
    }
    // Cavidades afastadas o bastante para o raio de captura não ficar ambíguo.
    const r = LEVELS[level - 1]!.captureRadius;
    for (let i = 0; i < pz.slots.length; i++) for (let j = i + 1; j < pz.slots.length; j++) {
      expect(Math.hypot(pz.slots[i]!.x - pz.slots[j]!.x, pz.slots[i]!.y - pz.slots[j]!.y)).toBeGreaterThan(r * 2);
    }
  });
  it('mesma semente, mesmo quebra-cabeça; bandeja à direita espelha o layout', () => {
    const a = buildPuzzle(settingsFor({ level: 3 }), seededRandom(5));
    const b = buildPuzzle(settingsFor({ level: 3 }), seededRandom(5));
    expect(a).toEqual(b);
    const right = buildPuzzle(settingsFor({ level: 3, traySide: 'right' }), seededRandom(5));
    expect(right.tray.x).toBeGreaterThan(right.board.x);
  });
});

describe('cálculo angular', () => {
  it('diferença normalizada min(|a−b|, 360−|a−b|)', () => {
    expect(angleDiff(10, 350)).toBe(20);
    expect(angleDiff(350, 10)).toBe(20);
    expect(angleDiff(0, 180)).toBe(180);
    expect(angleDiff(-90, 270)).toBe(0);
    expect(angleDiff(725, 0)).toBe(5);
  });
  it('erro angular respeita a simetria da peça', () => {
    expect(angleError(90, 360)).toBe(90);
    expect(angleError(90, 90)).toBe(0);
    expect(angleError(100, 90)).toBe(10);
    expect(angleError(123, 0)).toBe(0);
    expect(angleError(-15, 360)).toBe(15);
    expect(angleError(130, 120)).toBe(10);
  });
  it('assentamento gira só até o múltiplo de simetria mais próximo', () => {
    expect(snapAngle(355, 360)).toBe(360);
    expect(snapAngle(95, 90)).toBe(90);
    expect(snapAngle(33, 0)).toBe(33);
  });
  it('ângulos iniciais: sem rotação tudo 0°, com rotação ao menos uma girada', () => {
    expect(Object.values(initialAngles(['a', 'b'], false, seededRandom(1)))).toEqual([0, 0]);
    expect(initialAngles(['a'], true, () => 0).a).toBe(90);
  });
});

describe('encaixe', () => {
  const open: OpenSlot[] = [{ index: 0, pieceId: 'a', x: 100, y: 100 }, { index: 1, pieceId: 'b', x: 400, y: 100 }];
  it('dentro do raio + ângulo na tolerância → assenta', () => {
    expect(evaluateDrop({ pieceId: 'a', x: 130, y: 120, angle: 15, symmetry: 360 }, open, 45, 20)).toEqual({ kind: 'snap', slotIndex: 0, distance: 36, angleError: 15 });
  });
  it('fora do raio → vazio (nunca registrado como erro)', () => {
    const r = evaluateDrop({ pieceId: 'a', x: 250, y: 100, angle: 0, symmetry: 360 }, open, 45, 20);
    expect(r).toEqual({ kind: 'empty' });
    const log = logDrop(newStepLog(), r, 500, 'drag');
    expect(log.attempts).toBe(0);
    expect(log.emptyDrops).toBe(1);
    expect(stepResponse(log, true)).toBe('correct');
  });
  it('cavidade errada dentro do raio → incorreta', () => {
    const r = evaluateDrop({ pieceId: 'a', x: 390, y: 110, angle: 0, symmetry: 360 }, open, 45, 20);
    expect(r.kind).toBe('wrong_slot');
    const log = logDrop(newStepLog(), r, 800, 'drag');
    expect(log).toMatchObject({ attempts: 1, wrongAttempts: 1, firstSlot: 1, latencyMs: 800 });
    expect(stepResponse(log, true)).toBe('incorrect');
  });
  it('cavidade certa, ângulo fora → não assenta e não é erro de forma', () => {
    const r = evaluateDrop({ pieceId: 'a', x: 100, y: 100, angle: 90, symmetry: 360 }, open, 45, 20);
    expect(r).toMatchObject({ kind: 'angle_miss', angleError: 90 });
    const log = logDrop(newStepLog(), r, 300, 'tap');
    expect(stepResponse(log, true)).toBe('correct');
    expect(log.angleMisses).toBe(1);
  });
  it('o raio de captura muda o resultado (tolerância por nível)', () => {
    const drop = { pieceId: 'a', x: 160, y: 100, angle: 0, symmetry: 360 };
    expect(evaluateDrop(drop, open, 70, 20).kind).toBe('snap');
    expect(evaluateDrop(drop, open, 30, 20).kind).toBe('empty');
  });
  it('bandeja: alvo mínimo respeitado mesmo com muitas peças', () => {
    const pz = buildPuzzle(settingsFor({ level: 6, pieces: 12 }), seededRandom(2));
    const ids = pz.pieces.map((p) => p.id);
    const lay = trayLayout(pz.pieces, ids, pz.scale, pz.tray, 120);
    for (const p of pz.pieces) expect(extentOf(p, pz.scale) * lay[p.id]!.s).toBeGreaterThanOrEqual(119.9);
    for (const id of ids) {
      expect(lay[id]!.x).toBeGreaterThan(pz.tray.x);
      expect(lay[id]!.x).toBeLessThan(pz.tray.x + pz.tray.w);
    }
  });
});

describe('telemetria do passo', () => {
  it('TRIAL_COMPLETED válido com gameSpecific da especificação em detail', () => {
    let log = newStepLog();
    log = logDrop(log, { kind: 'wrong_slot', slotIndex: 2, distance: 20, angleError: 0 }, 1200, 'drag');
    log = { ...log, rotations: 2 };
    log = logDrop(log, { kind: 'snap', slotIndex: 3, distance: 12, angleError: 6 }, 2500, 'drag');
    const p = buildTrialPayload({
      targetId: 't1', trialIndex: 0, presented: ['d'], pieceId: 'd', slotPieceIds: ['a', 'b', 'c', 'd'], log, placed: true, assemblyMs: 2600,
      chain: initChain('backward', 4, 1), chainStep: 3, level: 3, round: 0, theme: 'bichos',
      settings: { captureRadius: 45, angleTolerance: 20, sensory: 'normal' }, motion: 'reduced',
    });
    expect(EventPayloads.TRIAL_COMPLETED.safeParse(p).success).toBe(true);
    expect(p).toMatchObject({ response: 'incorrect', positionOfTarget: 3, selected: 'c', selectedPosition: 2, latencyMs: 1200, attempts: 2 });
    expect(p.detail).toMatchObject({ chainType: 'backward', chainStep: 3, k: 1, pieceId: 'd', snapDistancePx: 12, angleErrorDeg: 6, attemptsBeforeSnap: 2, rotationsUsed: 2 });
  });
  it('sem resposta: latência nula, sem seleção', () => {
    const p = buildTrialPayload({
      targetId: 't1', trialIndex: 4, presented: ['a', 'b'], pieceId: 'a', slotPieceIds: ['a', 'b'], log: newStepLog(), placed: false, assemblyMs: 45000,
      chain: initChain('total', 2), chainStep: 0, level: 1, round: 1, theme: 'formas',
      settings: { captureRadius: 70, angleTolerance: 20, sensory: 'minimal' }, motion: 'static',
    });
    expect(EventPayloads.TRIAL_COMPLETED.safeParse(p).success).toBe(true);
    expect(p).toMatchObject({ response: 'no_response', latencyMs: null, selected: null, selectedPosition: null });
    expect(p.detail).toMatchObject({ attemptsBeforeSnap: null, snapDistancePx: null });
  });
});
