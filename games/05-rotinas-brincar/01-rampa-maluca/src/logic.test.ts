import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, GameManifest, PROTOCOL_VERSION, type SessionConfig } from '@aprumo/protocol';
import {
  ANGLE_MAX, ANGLE_MIN, COMM_OUTCOMES, DEFAULT_TARGET, VARIATIONS, VEHICLE_IDS, builtinTrack, episodeDetail, outcomeToRecord,
  parseTrack, resolveMotion, resolveSettings, routinePhase, targetFor, touchPx, trackFor, type EpisodeFacts,
} from './logic';
import {
  DT, MAX_SPEED, buildTrack, bodyPose, cameraTarget, createSim, pinsDown, pointAt, raceWinner, release, simSettled, simulateToRest, step,
} from './physics';
import { manifest } from './manifest';

const cfg = (params: Record<string, unknown> = {}, over: Partial<SessionConfig> = {}): SessionConfig => ({
  protocolVersion: PROTOCOL_VERSION, runId: 'r1', appId: 'rampa-maluca', appVersion: '1.0.0', childDisplayName: 'Bia',
  clinical: { model: 'DENVER', targets: [], trialsPerTarget: 5, interleave: false, seed: 11 },
  adaptation: DEFAULT_ADAPTATION, params, ...over,
}) as SessionConfig;

describe('manifesto', () => {
  it('é válido, Denver, pontuado pelo adulto e exige adulto', () => {
    expect(GameManifest.safeParse(manifest).success).toBe(true);
    expect(manifest.appId).toBe('rampa-maluca');
    expect(manifest.clinical.models.DENVER).toBe('joint-routine');
    expect(manifest.clinical.autoScoring).toEqual([]);
    expect(manifest.clinical.requiresAdult).toBe(true);
    expect(manifest.clinical.ageRangeMonths).toEqual([18, 60]);
  });
});

describe('configurações', () => {
  it('padrões: pausa de 3 s, inclinação média, duas opções distintas de veículo', () => {
    const s = resolveSettings(cfg());
    expect(s.pauseMs).toBe(3000);
    expect(s.angleDeg).toBe(28);
    expect(s.weight).toBe('leve');
    expect(s.variation).toBe('nenhuma');
    expect(s.faces).toBe(false);
    expect(s.vehicles[0]).not.toBe(s.vehicles[1]);
    expect(VEHICLE_IDS).toContain(s.vehicles[0]);
    expect(s.launches).toBe(5);
  });
  it('limita inclinação a 15°–40° e pausa a 1–10 s; aceita veículos pedidos', () => {
    const s = resolveSettings(cfg({ angleDeg: 80, pauseMs: 50, vehicles: ['bolinha', 'onibus'], faces: true, sensory: 'rich' }));
    expect(s.angleDeg).toBe(ANGLE_MAX);
    expect(s.pauseMs).toBe(1000);
    expect(s.vehicles).toEqual(['bolinha', 'onibus']);
    expect(s.faces).toBe(true);
    expect(resolveSettings(cfg({ angleDeg: 1 })).angleDeg).toBe(ANGLE_MIN);
  });
  it('movimento: mínimo é estático e a preferência do sistema reduz', () => {
    expect(resolveMotion({ sensory: 'minimal', motion: 'normal' }, 'full', false)).toBe('static');
    expect(resolveMotion({ sensory: 'normal', motion: null }, 'full', true)).toBe('reduced');
    expect(resolveMotion({ sensory: 'rich', motion: null }, 'full', false)).toBe('normal');
    expect(resolveMotion({ sensory: 'normal', motion: 'static' }, 'full', false)).toBe('static');
  });
  it('alvos de toque nunca abaixo de 48px', () => {
    expect(touchPx(1, 20)).toBe(48);
    expect(touchPx(2)).toBe(128);
  });
  it('rodízio de alvos e alvo padrão pontuado pelo adulto', () => {
    expect(targetFor(cfg(), 3)).toBe(DEFAULT_TARGET);
    expect(DEFAULT_TARGET.scoring).toBe('therapist');
    const t2 = { ...DEFAULT_TARGET, targetId: 'b' };
    const c = cfg({}, { clinical: { model: 'DENVER', targets: [DEFAULT_TARGET, t2], trialsPerTarget: 5, interleave: false, seed: 1 } });
    expect(targetFor(c, 1).targetId).toBe('b');
    expect(targetFor(c, 2).targetId).toBe(DEFAULT_TARGET.targetId);
  });
});

describe('pista por JSON (TrackBuilder)', () => {
  const json = JSON.stringify({
    id: 'espiral-1', label: 'Pista do supervisor', target: 'pins', pins: 4,
    segments: [{ kind: 'ramp', length: 300, angleDeg: 30 }, { kind: 'flat', length: 120 }, { kind: 'ramp', length: 150, angleDeg: 10 }, { kind: 'tunnel', length: 200 }, { kind: 'bridge', length: 200 }],
  });
  it('valida string JSON e vira variação jogável sem alterar código', () => {
    const r = parseTrack(json);
    expect(r.ok).toBe(true);
    const s = resolveSettings(cfg({ tracks: [json], variation: 'custom:espiral-1' }));
    expect(s.customTracks).toHaveLength(1);
    expect(s.variation).toBe('custom:espiral-1');
    const track = buildTrack(trackFor(s.variation, 40, s.customTracks));
    expect(track.spec.segments[0]!.angleDeg).toBe(40);
    const sim = createSim(track, ['carro'], 'pesado');
    release(sim);
    simulateToRest(sim, track);
    expect(simSettled(sim)).toBe(true);
    expect(sim.lanes[0]!.body.s + sim.lanes[0]!.body.half).toBeLessThanOrEqual(track.wallS + 1e-6);
  });
  it('rejeita pistas inválidas com mensagens', () => {
    expect(parseTrack('{oops').ok).toBe(false);
    const flatFirst = parseTrack({ id: 'x', segments: [{ kind: 'flat', length: 200 }] });
    expect(flatFirst.ok).toBe(false);
    const steep = parseTrack({ id: 'x', segments: [{ kind: 'ramp', length: 300, angleDeg: 70 }] });
    expect(steep.ok).toBe(false);
    const tooTall = parseTrack({ id: 'x', segments: [{ kind: 'ramp', length: 700, angleDeg: 40 }] });
    expect(tooTall.ok).toBe(false);
    const s = resolveSettings(cfg({ tracks: [{ id: 'BAD ID', segments: [] }] }));
    expect(s.customTracks).toHaveLength(0);
    expect(s.trackErrors.length).toBeGreaterThan(0);
  });
  it('geometria contínua e ângulo da rampa respeitado', () => {
    const t = buildTrack(builtinTrack('ponte', 30));
    for (let k = 1; k < t.segs.length; k++) {
      expect(t.segs[k]!.x0).toBeCloseTo(t.segs[k - 1]!.x1);
      expect(t.segs[k]!.y0).toBeCloseTo(t.segs[k - 1]!.y1);
    }
    expect((t.segs[0]!.angle * 180) / Math.PI).toBeCloseTo(30);
    expect(pointAt(t, 0)).toEqual(t.start);
    expect(t.width).toBeGreaterThan(1000);
    expect(cameraTarget(t, 1000, 0)).toBe(0);
    expect(cameraTarget(t, 1000, 1e6)).toBe(t.width - 1000);
    expect(cameraTarget(t, 4000, 1e6)).toBe(0);
  });
});

describe('trava e física', () => {
  it('trava bloqueada sem adulto: nenhum passo solta o veículo', () => {
    const t = buildTrack(builtinTrack('nenhuma', ANGLE_MAX));
    const sim = createSim(t, ['bolinha', 'onibus'], 'pesado');
    const s0 = sim.lanes.map((l) => l.body.s);
    for (let k = 0; k < 60 * 30; k++) step(sim, t);
    expect(sim.lanes.map((l) => l.body.s)).toEqual(s0);
    expect(sim.lanes.every((l) => l.body.locked && l.body.v === 0)).toBe(true);
    expect(simSettled(sim)).toBe(false);
  });

  it('largada padrão desce e bate no alvo', () => {
    const t = buildTrack(builtinTrack('nenhuma', 28));
    const sim = createSim(t, ['carro'], 'leve');
    release(sim);
    simulateToRest(sim, t);
    expect(sim.lanes[0]!.body.targetHit).toBe(true);
    expect(sim.events.some((e) => e.kind === 'bump')).toBe(true);
  });

  it('sem tunneling: em inclinação máxima e veículo pesado, nunca atravessa pinos, alvo ou parede', () => {
    for (const variation of VARIATIONS) {
      for (const vehicle of VEHICLE_IDS) {
        for (const weight of ['leve', 'pesado'] as const) {
          const t = buildTrack(builtinTrack(variation, ANGLE_MAX));
          const sim = createSim(t, [vehicle], weight);
          release(sim);
          const lane = sim.lanes[0]!;
          for (let k = 0; k < 60 * 14 && !simSettled(sim); k++) {
            step(sim, t);
            const b = lane.body;
            const front = b.s + b.half;
            expect(Math.abs(b.v)).toBeLessThanOrEqual(MAX_SPEED);
            expect(front).toBeLessThanOrEqual(t.wallS + 1e-6);
            if (t.bumperS != null) expect(front).toBeLessThanOrEqual(t.bumperS + 1e-6);
            for (const p of lane.pins) if (!p.falling && !p.down) expect(front).toBeLessThanOrEqual(p.s + 1e-6);
          }
          expect(simSettled(sim)).toBe(true);
        }
      }
    }
  });

  it('pinos caem com o impacto (efeito dominó)', () => {
    const t = buildTrack(builtinTrack('pinos', 35));
    const sim = createSim(t, ['caminhao'], 'pesado');
    release(sim);
    simulateToRest(sim, t);
    expect(pinsDown(sim.lanes[0]!)).toBeGreaterThanOrEqual(3);
    expect(sim.lanes[0]!.body.targetHit).toBe(true);
  });

  it('corrida: o "já" libera os dois juntos e há vencedor', () => {
    const t = buildTrack(builtinTrack('nenhuma', 30));
    const sim = createSim(t, ['bolinha', 'onibus'], 'leve');
    expect(raceWinner(sim)).toBe('tie');
    release(sim);
    expect(sim.lanes.every((l) => !l.body.locked && l.body.releasedAt === sim.lanes[0]!.body.releasedAt)).toBe(true);
    simulateToRest(sim, t);
    expect(['child', 'adult', 'tie']).toContain(raceWinner(sim));
  });

  it('pose segue a rampa e o passo é determinístico', () => {
    const t = buildTrack(builtinTrack('nenhuma', 30));
    const a = createSim(t, ['carro'], 'leve');
    const b = createSim(t, ['carro'], 'leve');
    release(a); release(b);
    for (let k = 0; k < 40; k++) { step(a, t, DT); step(b, t, DT); }
    expect(a.lanes[0]!.body.s).toBe(b.lanes[0]!.body.s);
    expect(bodyPose(t, a.lanes[0]!.body).deg).toBeCloseTo(30, 0);
  });
});

describe('registro do adulto e telemetria', () => {
  it('mapeia o sinal da criança em resposta e dica', () => {
    expect(outcomeToRecord('vocal')).toMatchObject({ response: 'correct', promptLevel: 'IND', promptSource: 'none', form: 'vocal' });
    expect(outcomeToRecord('gesture').response).toBe('correct');
    expect(outcomeToRecord('modeled')).toMatchObject({ response: 'correct', promptLevel: 'MOD', promptSource: 'therapist' });
    expect(outcomeToRecord('none')).toMatchObject({ response: 'no_response', promptSource: 'therapist' });
    expect(outcomeToRecord('remote', 'incorrect').response).toBe('incorrect');
    expect(new Set(COMM_OUTCOMES.map((o) => o.id)).size).toBe(COMM_OUTCOMES.length);
  });

  const facts: EpisodeFacts = {
    vehicle: 'carro', adultVehicle: null, rampAngleDeg: 28, variation: 'nenhuma', trackId: 'nenhuma', raceMode: false, weight: 'leve',
    targetHit: true, pinsDown: 0, pinsTotal: 0, raceWinner: null, outcome: 'vocal', form: 'vocal', released: true,
    spontaneousRequest: true, lookedAtAdult: true, commented: false, imitatedSound: false, signalBeforePause: false, countdownPauseMs: 3000,
    placedBy: 'child', placeMode: 'drag', choiceBy: 'child', defaults: { angleDeg: 28, weight: 'leve', variation: 'nenhuma' },
    sensory: 'normal', motion: 'normal', recordLatencyMs: 1200,
  };
  it('detail traz o gameSpecific do spec e a fase da rotina', () => {
    const d = episodeDetail(facts);
    expect(d.gameSpecific).toEqual({ vehicle: 'carro', rampAngleDeg: 28, variation: 'nenhuma', raceMode: false, targetHit: true });
    expect(d.episodeKind).toBe('TeachingEpisode');
    expect(d.routinePhase).toBe('theme');
    expect(d.vocalJa).toBe(true);
    expect(routinePhase({ ...facts, raceMode: true })).toBe('elaboration');
    expect(routinePhase({ ...facts, rampAngleDeg: 38 })).toBe('elaboration');
  });
});
