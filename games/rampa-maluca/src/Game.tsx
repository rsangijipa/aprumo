import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import { installAudioUnlock, playCue, playTones, speak, useGameClient, useMotion, type Tone } from '@aprumo/game-sdk';
import type { TargetConfig, TrialResponse } from '@aprumo/protocol';
import { Garage, Gate, Scenery, Target, TrackShape, TunnelFront, Vehicle, VehicleIcon, sway } from './Art';
import {
  ANGLE_STEPS, COMM_OUTCOMES, VARIATIONS, VARIATION_LABELS, actionComment, episodeDetail, outcomeToRecord, resolveMotion,
  resolveSettings, targetFor, touchPx, trackFor, vehicleById, type CommOutcome, type OutcomeRecord, type Variation, type VehicleId, type Weight,
} from './logic';
import {
  DT, VIEW_W, WORLD_H, bodyPose, buildTrack, cameraTarget, createSim, lerp, pinsDown, raceWinner, release, simSettled, simulateToRest, step,
  type Sim,
} from './physics';
import { manifest } from './manifest';
import './game.css';

const LEVEL_ID = 'rotina-rampa';
const REST_MS = 20000;
const LANE_LIFT = -64;
const GARAGE = { x: 92, y: 500 };

/* Sons suaves autorais (sem buzina alta). */
const SND = {
  motor: (dur: number): Tone[] => [{ freq: 82, slideTo: 165, dur, type: 'triangle', attack: 0.25, decay: 0.2, sustain: 0.5, release: 0.45, gain: 0.22 }],
  pin: (k: number): Tone[] => [{ freq: 300 + k * 24, dur: 0.035, type: 'sine', attack: 0.002, decay: 0.04, sustain: 0.15, release: 0.08, gain: 0.45 }],
  bump: [{ freq: 150, slideTo: 92, dur: 0.07, type: 'sine', attack: 0.005, decay: 0.06, sustain: 0.3, release: 0.12, gain: 0.55 }] as Tone[],
  bibi: [
    { freq: 523.25, dur: 0.07, type: 'sine', attack: 0.01, decay: 0.04, sustain: 0.5, release: 0.06, gain: 0.3 },
    { freq: 523.25, dur: 0.07, delay: 0.16, type: 'sine', attack: 0.01, decay: 0.04, sustain: 0.5, release: 0.06, gain: 0.3 },
  ] as Tone[],
};

type Phase = 'opening' | 'routine' | 'closing' | 'done';
type Stage = 'garage' | 'locked' | 'running' | 'settled';
type Countdown = 'idle' | 'ready' | 'aim' | 'pause' | 'overdue';

interface Episode {
  index: number;
  target: TargetConfig;
  started: boolean;
  aimAt: number | null;
  readyAt: number | null;
  countdownRuns: number;
  placedBy: 'child' | 'adult';
  placeMode: 'drag' | 'tap' | 'adult';
  spontaneousRequest: boolean;
  lookedAtAdult: boolean;
  commented: boolean;
  imitatedSound: boolean;
  childTaps: number;
  outcome: CommOutcome | null;
  record: OutcomeRecord | null;
  latencyMs: number | null;
  signalBeforePause: boolean;
  released: boolean;
  result: { targetHit: boolean; pinsDown: number; pinsTotal: number; winner: 'child' | 'adult' | 'tie' | null } | null;
  snap: { angle: number; variation: Variation; weight: Weight; race: boolean; trackId: string } | null;
}

function useSystemReducedMotion() {
  const [v, setV] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const h = () => setV(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return v;
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

export default function RampaMaluca() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const sdkMotion = useMotion(config);
  const sysReduced = useSystemReducedMotion();
  const settings = useMemo(() => (config ? resolveSettings(config) : null), [config]);
  const motion = settings ? resolveMotion(settings, sdkMotion, sysReduced) : 'static';
  const sound = config?.adaptation.sound ?? 'low';
  const scale = config?.adaptation.touchScale ?? 1;
  const sensory = settings?.sensory ?? 'normal';
  const fx = sensory !== 'minimal';

  const [, force] = useReducer((x: number) => x + 1, 0);
  const [phase, setPhase] = useState<Phase>('opening');
  const [stage, setStage] = useState<Stage>('garage');
  const [countdown, setCountdown] = useState<Countdown>('idle');
  const [vehicle, setVehicle] = useState<VehicleId | null>(null);
  const [choiceBy, setChoiceBy] = useState<'child' | 'adult'>('child');
  const [angle, setAngle] = useState(28);
  const [variation, setVariation] = useState<Variation>('nenhuma');
  const [weight, setWeight] = useState<Weight>('leve');
  const [race, setRace] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [resting, setResting] = useState(false);
  const [stripOpen, setStripOpen] = useState(true);
  const [drag, setDrag] = useState<{ x: number; y: number; moved: number } | null>(null);
  const [comment, setComment] = useState('');

  const ep = useRef<Episode | null>(null);
  const sim = useRef<Sim | null>(null);
  const cam = useRef(0);
  const started = useRef(false);
  const cdToken = useRef(0);
  const lastActivity = useRef(performance.now());
  const promptOverride = useRef<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 1000, h: 600 });
  const completedRef = useRef(0);
  const correctRef = useRef(0);
  const live = useRef({ stage, countdown, paused, ended, phase });
  useEffect(() => { live.current = { stage, countdown, paused, ended, phase }; });

  // Valores iniciais vindos da configuração.
  useEffect(() => {
    if (!settings) return;
    setAngle(settings.angleDeg);
    setVariation(settings.variation);
    setWeight(settings.weight);
    setStripOpen(!settings.stripCollapsed);
  }, [settings]);

  const adultVehicle: VehicleId | null = settings && vehicle ? (settings.vehicles.find((v) => v !== vehicle) ?? null) : null;
  const trackSpec = useMemo(() => trackFor(variation, angle, settings?.customTracks ?? []), [variation, angle, settings]);
  const track = useMemo(() => buildTrack(trackSpec), [trackSpec]);
  const laneVehicles = useMemo<VehicleId[]>(
    () => (vehicle ? (race && adultVehicle ? [vehicle, adultVehicle] : [vehicle]) : []),
    [vehicle, race, adultVehicle],
  );

  // Simulação nova sempre que pista/veículos/peso mudam fora de uma descida.
  useEffect(() => {
    if (live.current.stage === 'running') return;
    sim.current = laneVehicles.length ? createSim(track, laneVehicles, weight) : null;
    cam.current = 0;
    force();
  }, [track, laneVehicles, weight]);

  useEffect(() => installAudioUnlock(), []);

  // Largura visível do mundo acompanha o formato da tela (mais pista em telas largas).
  useLayoutEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setBox((b) => (b.w === r.width && b.h === r.height ? b : { w: r.width, h: r.height }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [config]);
  const viewW = Math.max(VIEW_W, Math.round((WORLD_H * box.w) / box.h));

  // Início da sessão (protegido contra o duplo efeito do StrictMode).
  useEffect(() => {
    if (!config || !settings || started.current) return;
    started.current = true;
    client.gameStarted(manifest.version);
    client.levelStarted({ levelId: LEVEL_ID, levelIndex: 0, fieldSize: 2, trialsPlanned: settings.launches, difficulty: motion });
    if (settings.voice) {
      const [a, b] = settings.vehicles.map((v) => vehicleById(v).label.toLowerCase());
      void speak(`Qual você quer? ${a} ou ${b}?`, sound);
    }
  }, [config, settings, client, motion, sound]);

  const touch = () => { lastActivity.current = performance.now(); };
  const say = useCallback((t: string) => { if (settings?.voice) void speak(t, sound); }, [settings, sound]);

  /* ------------------------------------------------------------ episódios */

  const newEpisode = useCallback((placedBy: Episode['placedBy'], placeMode: Episode['placeMode']): Episode => ({
    index: completedRef.current, target: config ? targetFor(config, completedRef.current) : (undefined as never), started: false, aimAt: null, readyAt: null,
    countdownRuns: 0, placedBy, placeMode, spontaneousRequest: false, lookedAtAdult: false, commented: false, imitatedSound: false,
    childTaps: 0, outcome: null, record: null, latencyMs: null, signalBeforePause: false, released: false, result: null, snap: null,
  }), [config]);

  const openTrial = useCallback((e: Episode) => {
    if (e.started || !settings) return;
    e.started = true;
    const presented = laneVehicles.slice();
    client.trialStarted({ targetId: e.target.targetId, trialIndex: e.index, presented });
    client.stimulusPresented({
      targetId: e.target.targetId, trialIndex: e.index, presented, positionOfTarget: null,
      modality: settings.voice ? 'visual_auditory' : 'visual', instructionId: 'preparar-apontar',
    });
  }, [client, settings, laneVehicles]);

  /** Emite o TeachingEpisode (TRIAL_COMPLETED) do episódio pendente. */
  const finalize = useCallback(() => {
    const e = ep.current;
    if (!e || !e.started || !settings || !vehicle) { ep.current = null; return; }
    ep.current = null;
    const rec = e.record ?? outcomeToRecord('none');
    const snap = e.snap ?? { angle, variation, weight, race, trackId: track.spec.id };
    const promptLevel = promptOverride.current && rec.promptSource === 'none' ? promptOverride.current : rec.promptLevel;
    const promptSource = promptOverride.current && rec.promptSource === 'none' ? 'therapist' : rec.promptSource;
    client.responseRecorded({
      targetId: e.target.targetId,
      stimulusId: vehicle,
      trialIndex: e.index,
      presented: snap.race && adultVehicle ? [vehicle, adultVehicle] : [vehicle],
      positionOfTarget: null,
      selected: null,
      selectedPosition: null,
      response: e.released ? rec.response : 'no_response',
      latencyMs: e.released ? e.latencyMs : null,
      promptLevel,
      promptSource,
      detail: {
        ...episodeDetail({
          vehicle, adultVehicle: snap.race ? adultVehicle : null, rampAngleDeg: snap.angle, variation: snap.variation, trackId: snap.trackId,
          raceMode: snap.race, weight: snap.weight, targetHit: e.result?.targetHit ?? false, pinsDown: e.result?.pinsDown ?? 0,
          pinsTotal: e.result?.pinsTotal ?? 0, raceWinner: e.result?.winner ?? null, outcome: e.outcome ?? 'none', form: rec.form,
          released: e.released, spontaneousRequest: e.spontaneousRequest, lookedAtAdult: e.lookedAtAdult, commented: e.commented,
          imitatedSound: e.imitatedSound, signalBeforePause: e.signalBeforePause, countdownPauseMs: settings.pauseMs,
          placedBy: e.placedBy, placeMode: e.placeMode, choiceBy,
          defaults: { angleDeg: settings.angleDeg, weight: settings.weight, variation: settings.variation },
          sensory, motion, recordLatencyMs: e.latencyMs,
        }),
        childTaps: e.childTaps,
        countdownRuns: e.countdownRuns,
      },
    });
    promptOverride.current = null;
    completedRef.current += 1;
    setCompleted(completedRef.current);
  }, [client, settings, vehicle, adultVehicle, angle, variation, weight, race, track, choiceBy, sensory, motion]);

  /* ------------------------------------------------------------ ações da rotina */

  const choose = (v: VehicleId, by: 'child' | 'adult') => {
    if (phase !== 'opening' || paused || ended) return;
    touch();
    setVehicle(v);
    setChoiceBy(by);
    setPhase('routine');
    setStage('garage');
    if (fx) playCue('tap', sound);
    say(`${vehicleById(v).label}!`);
  };

  const place = (by: Episode['placedBy'], mode: Episode['placeMode']) => {
    if (stage !== 'garage' || phase !== 'routine' || paused || ended) return;
    touch();
    ep.current = newEpisode(by, mode);
    sim.current = createSim(track, laneVehicles, weight);
    cam.current = 0;
    setStage('locked');
    setCountdown('idle');
    if (fx) playTones(SND.bibi, sound);
  };

  const stopCountdown = () => { cdToken.current += 1; };

  const startCountdown = async () => {
    const e = ep.current;
    if (!e || stage !== 'locked' || paused || ended || !settings) return;
    if (countdown === 'ready' || countdown === 'aim') return;
    touch();
    openTrial(e);
    e.countdownRuns += 1;
    const token = ++cdToken.current;
    const alive = () => token === cdToken.current && !live.current.paused && !live.current.ended && live.current.stage === 'locked';
    e.readyAt = performance.now();
    setCountdown('ready');
    await Promise.all([settings.voice ? speak('Preparar…', sound, 0.8) : Promise.resolve(), wait(motion === 'static' ? 700 : 1000)]);
    if (!alive()) return;
    e.aimAt = performance.now();
    setCountdown('aim');
    await Promise.all([settings.voice ? speak('apontar…', sound, 0.8) : Promise.resolve(), wait(800)]);
    if (!alive()) return;
    // Pausa expectante: nada solta sozinho; após a pausa configurada, só um aviso ao adulto.
    setCountdown('pause');
    await wait(settings.pauseMs);
    if (!alive()) return;
    setCountdown('overdue');
  };

  const runRelease = (outcome: CommOutcome, remote?: TrialResponse) => {
    const e = ep.current;
    const s = sim.current;
    if (!e || !s || stage !== 'locked' || paused || ended || !settings) return;
    if (outcome !== 'remote' && countdown === 'idle') return;
    if (e.released) return;
    touch();
    openTrial(e);
    const now = performance.now();
    const from = e.aimAt ?? e.readyAt ?? now;
    e.outcome = outcome;
    e.record = outcomeToRecord(outcome, remote);
    e.latencyMs = Math.max(0, Math.round(now - from));
    e.signalBeforePause = countdown === 'ready' || countdown === 'aim';
    e.released = true;
    e.snap = { angle, variation, weight, race, trackId: track.spec.id };
    if (e.record.response === 'correct') correctRef.current += 1;
    if (e.record.promptSource === 'therapist') {
      client.promptPresented({ targetId: e.target.targetId, trialIndex: e.index, level: e.record.promptLevel, source: 'therapist', latencyMs: e.latencyMs });
    }
    stopCountdown();
    setCountdown('idle');
    // Reforço natural: a rotina continua (o veículo desce).
    client.reinforcerPresented({ kind: 'access', reinforcerId: 'descida', contingentOn: e.target.targetId, intensity: sensory === 'rich' ? 'festive' : 'subtle' });
    release(s);
    say('Já!');
    if (motion === 'static') {
      simulateToRest(s, track);
      settle();
      return;
    }
    if (fx) playTones(SND.motor(1.6), sound);
    setStage('running');
  };

  const settle = () => {
    const e = ep.current;
    const s = sim.current;
    if (!s) return;
    const lane = s.lanes[0]!;
    const res = { targetHit: lane.body.targetHit, pinsDown: pinsDown(lane), pinsTotal: lane.pins.length, winner: s.lanes.length > 1 ? raceWinner(s) : null };
    if (e) e.result = res;
    const c = actionComment(res.targetHit, res.pinsDown);
    setComment(c);
    say(c);
    if (res.targetHit && config?.adaptation.feedback !== 'none' && fx) playCue('correct', sound);
    setStage('settled');
    touch();
  };

  const again = () => {
    if (stage !== 'settled' || paused || ended) return;
    finalize();
    setComment('');
    sim.current = createSim(track, laneVehicles, weight);
    cam.current = 0;
    setStage('garage');
    touch();
  };

  /** Variação do adulto: se a descida já terminou, fecha o episódio e volta à garagem antes. */
  const elaborate = (apply: () => void) => {
    if (!canElaborateNow()) return;
    if (stage === 'settled') again();
    apply();
    touch();
  };
  const canElaborateNow = () =>
    phase === 'routine' && (stage === 'garage' || stage === 'settled' || (stage === 'locked' && countdown === 'idle')) && !paused && !ended;

  const closeSession = (outcome: 'completed' | 'stopped') => {
    stopCountdown();
    finalize();
    client.levelCompleted({ levelId: LEVEL_ID, levelIndex: 0, trialsCompleted: completedRef.current, correct: correctRef.current, outcome });
    client.gameCompleted(completedRef.current);
  };

  const park = () => {
    if (phase !== 'routine' || stage === 'running' || paused || ended) return;
    touch();
    stopCountdown();
    finalize();
    setCountdown('idle');
    setPhase('closing');
    say('Acabou! Estaciona.');
    window.setTimeout(() => {
      setPhase('done');
      if (fx) playCue('complete', sound);
    }, motion === 'static' ? 300 : 1800);
  };

  const closed = useRef(false);
  useEffect(() => {
    if (phase !== 'done' || closed.current) return;
    closed.current = true;
    closeSession('completed');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Encerramento pelo hospedeiro.
  useEffect(() => {
    if (!ended || closed.current || !config) return;
    closed.current = true;
    closeSession('stopped');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ended]);

  // Pausa do hospedeiro: congela a física e cancela a contagem.
  const wasPaused = useRef(false);
  useEffect(() => {
    if (!config) return;
    if (paused && !wasPaused.current) {
      wasPaused.current = true;
      stopCountdown();
      if (live.current.stage === 'locked') setCountdown('idle');
      client.paused(null);
    } else if (!paused && wasPaused.current) {
      wasPaused.current = false;
      client.resumed();
      touch();
    }
  }, [paused, client, config]);

  // Comandos do clinic em tempo real.
  const runReleaseRef = useRef(runRelease);
  runReleaseRef.current = runRelease;
  useEffect(() => client.onCommand((c) => {
    if (c.kind === 'SET_PROMPT') promptOverride.current = c.level === 'IND' ? null : c.level;
    if (c.kind === 'SCORE_TRIAL' && live.current.stage === 'locked') runReleaseRef.current('remote', c.response);
  }), [client]);

  // Repouso após 20 s sem atividade (nada é solto; episódio aberto fica aguardando).
  useEffect(() => {
    if (!config) return;
    const id = window.setInterval(() => {
      const l = live.current;
      if (resting || l.paused || l.ended || l.phase === 'done' || l.stage === 'running') return;
      if (l.countdown === 'ready' || l.countdown === 'aim') return;
      if (performance.now() - lastActivity.current < REST_MS) return;
      stopCountdown();
      if (l.stage === 'locked') setCountdown('idle');
      if (l.stage === 'settled') { finalize(); setComment(''); setStage('garage'); }
      setResting(true);
    }, 1000);
    return () => window.clearInterval(id);
  }, [config, resting, finalize]);

  // Laço de animação da descida.
  useEffect(() => {
    if (stage !== 'running' || paused || ended) return;
    const s = sim.current;
    if (!s) return;
    let raf = 0;
    let last: number | null = null;
    let acc = 0;
    const loop = (ts: number) => {
      if (last != null) acc += Math.min(0.1, (ts - last) / 1000);
      last = ts;
      while (acc >= DT) { step(s, track); acc -= DT; }
      for (const ev of s.events.splice(0)) {
        if (!fx) continue;
        if (ev.kind === 'pin') playTones(SND.pin(ev.index), sound);
        else if (ev.kind === 'bump' || ev.kind === 'wall') playTones(SND.bump, sound);
      }
      const lead = Math.max(...s.lanes.map((l) => bodyPose(track, l.body).x));
      cam.current = lerp(cam.current, cameraTarget(track, viewW, lead), 0.1);
      force();
      if (simSettled(s)) { settle(); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, paused, ended, track]);

  /* ------------------------------------------------------------ arrastar ao topo */

  const toWorld = (ev: RPointerEvent) => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return { x: 0, y: 0 };
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  const lockSpot = sim.current?.lanes[0] ? bodyPose(track, sim.current.lanes[0].body) : { x: track.start.x, y: track.start.y };
  const onDown = (ev: RPointerEvent<SVGGElement>) => {
    if (stage !== 'garage' || phase !== 'routine' || paused || ended) return;
    (ev.currentTarget as Element).setPointerCapture?.(ev.pointerId);
    const p = toWorld(ev);
    setDrag({ x: p.x, y: p.y, moved: 0 });
    touch();
  };
  const onMove = (ev: RPointerEvent<SVGGElement>) => {
    if (!drag) return;
    const p = toWorld(ev);
    setDrag((d) => (d ? { x: p.x, y: p.y, moved: d.moved + Math.hypot(p.x - d.x, p.y - d.y) } : d));
  };
  const onUp = () => {
    if (!drag) return;
    const d = drag;
    setDrag(null);
    if (d.moved < 12) place('child', 'tap');
    else if (Math.hypot(d.x - lockSpot.x, d.y - lockSpot.y) < 160) place('child', 'drag');
  };
  const tapLocked = () => {
    const e = ep.current;
    if (stage !== 'locked' || !e || paused || ended) return;
    e.childTaps += 1;
    touch();
    if (fx) playTones(SND.bibi, sound);
  };

  /* ------------------------------------------------------------ render */

  if (!config || !settings) return <div className="rm" aria-busy="true" />;

  const s = sim.current;
  const showVehicles = phase === 'routine' || phase === 'closing';
  const swayAmp = motion === 'normal' && stage === 'running' && s ? 4 * Math.sin(s.t * 5) : 0;
  const camX = motion !== 'static' ? cam.current : stage === 'settled' && s ? cameraTarget(track, viewW, bodyPose(track, s.lanes[0]!.body).x) : 0;
  const viewBox = `${Math.round(camX)} 0 ${viewW} ${WORLD_H}`;
  const hit = touchPx(scale, 64);
  // Alvo de toque mínimo em px convertido para unidades do mundo (viewBox com "meet").
  const ppu = Math.min(box.w / viewW, box.h / WORLD_H) || 0.7;
  const hitW = Math.max(120, hit / ppu);
  const hitH = Math.max(96, hit / ppu);
  const canElaborate = canElaborateNow();
  const counting = stage === 'locked' && countdown !== 'idle';
  const e = ep.current;
  const vars = { '--rm-scale': scale, '--rm-hit': `${hit}px` } as CSSProperties;
  const lanes = s?.lanes ?? [];
  const extraVariations = settings.customTracks.map((t) => ({ id: `custom:${t.id}` as Variation, label: t.label }));
  const angleLabel = ANGLE_STEPS.find((a) => a.deg === angle)?.label ?? `${angle}°`;

  const renderLane = (k: number) => {
    const lane = lanes[k];
    if (!lane) return null;
    const lift = k === 1 ? LANE_LIFT : 0;
    const pose = bodyPose(track, lane.body);
    const bridge = track.segs.find((g) => g.kind === 'bridge' && pose.x > g.x0 && pose.x < g.x1);
    const dy = bridge ? sway(pose.x, bridge.x0, bridge.x1, swayAmp) : 0;
    const parking = phase === 'closing';
    const hidden = k === 0 && stage === 'garage' && phase === 'routine';
    const vid = lane.body.vehicle;
    return (
      <g key={k} className="rm-lane" data-lane={k === 0 ? 'child' : 'adult'}>
        <TrackShape track={track} swayAmp={swayAmp} lift={lift} />
        <Target track={track} lane={lane} lift={lift} />
        <Gate track={track} at={lane.body.half * 2 + 8} open={!lane.body.locked} waiting={k === 0 && counting} lift={lift} />
        {!hidden && (
          <g
            className="rm-body"
            data-parking={parking}
            style={{ transform: parking ? `translate(${GARAGE.x}px, ${GARAGE.y - 8}px)` : `translate(${pose.x}px, ${pose.y + dy + lift}px) rotate(${pose.deg}deg)` }}
            onClick={k === 0 ? tapLocked : undefined}
            role={k === 0 && stage === 'locked' ? 'button' : undefined}
            tabIndex={k === 0 && stage === 'locked' ? 0 : undefined}
            aria-label={k === 0 && stage === 'locked' ? `${vehicleById(vid).label} na trava (bi-bi)` : undefined}
          >
            <rect x={-Math.max(lane.body.half, hitW / 2)} y={-hitH + 10} width={Math.max(lane.body.half * 2, hitW)} height={hitH} fill="transparent" />
            <Vehicle id={vid} spin={lane.body.spin} faces={settings.faces} tone={k === 1 ? 'adult' : 'child'} />
          </g>
        )}
        <TunnelFront track={track} lift={lift} />
      </g>
    );
  };

  const statusText =
    phase === 'opening' ? 'Escolha um veículo'
    : stage === 'garage' ? 'Leve o veículo lá para cima'
    : countdown === 'ready' ? 'Preparar…'
    : countdown === 'aim' ? 'Apontar…'
    : countdown === 'pause' || countdown === 'overdue' ? '…'
    : stage === 'running' ? 'Desceu!'
    : stage === 'settled' ? comment
    : '';

  return (
    <div
      className="rm"
      data-sensory={sensory}
      data-motion={motion}
      data-palette={config.adaptation.palette}
      data-countdown={countdown}
      style={vars}
      onPointerDown={touch}
    >
      <div className="rm-scene" ref={sceneRef}>
        <svg ref={svgRef} className="rm-svg" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Rampa com veículo">
          <Scenery track={track} span={Math.max(track.width, viewW)} decor={fx} rich={sensory === 'rich'} />
          {fx && <Garage x={GARAGE.x} y={GARAGE.y} />}
          {showVehicles && (
            <>
              {renderLane(1)}
              {renderLane(0)}
            </>
          )}
          {phase === 'routine' && stage === 'garage' && vehicle && (
            <g
              className="rm-garage-veh"
              data-dragging={drag != null}
              style={{ transform: `translate(${drag ? drag.x : GARAGE.x}px, ${drag ? drag.y + 20 : GARAGE.y - 6}px)` }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={() => setDrag(null)}
              role="button"
              tabIndex={0}
              aria-label={`Levar o ${vehicleById(vehicle).label.toLowerCase()} para o topo da rampa`}
              onKeyDown={(k) => { if (k.key === 'Enter' || k.key === ' ') place('child', 'tap'); }}
            >
              <rect x={-hitW / 2} y={-hitH + 16} width={hitW} height={hitH} rx={12} className="rm-garage-veh__hit" />
              <Vehicle id={vehicle} faces={settings.faces} />
            </g>
          )}
          {phase === 'routine' && stage === 'garage' && fx && (
            <g transform={`translate(${lockSpot.x} ${lockSpot.y - 70})`} aria-hidden="true">
              <g className="rm-hint-top"><path d="M0 0 l-12 -16 h8 v-18 h8 v18 h8z" fill="var(--rm-hint)" /></g>
            </g>
          )}
          {sensory === 'rich' && motion !== 'static' && stage === 'settled' && e?.result?.targetHit && (
            <g className="rm-burst" transform={`translate(${track.segs[track.segs.length - 1]!.x0 + 80} ${track.ground - 90})`} aria-hidden="true">
              {Array.from({ length: 7 }, (_, k) => <circle key={k} r={5} style={{ '--k': k } as CSSProperties} fill={`var(--rm-burst-${k % 3})`} />)}
            </g>
          )}
        </svg>

        {phase === 'opening' && (
          <div className="rm-choice" role="group" aria-label="Escolha o veículo">
            {settings.vehicles.map((v) => (
              <button key={v} type="button" className="rm-card" onClick={() => choose(v, 'child')} aria-label={vehicleById(v).label}>
                <VehicleIcon id={v} faces={settings.faces} />
                <span>{vehicleById(v).label}</span>
              </button>
            ))}
          </div>
        )}

        <p className="rm-status" aria-live="polite">{statusText}</p>
      </div>

      {phase !== 'done' && (
        <section className="rm-adult" data-open={stripOpen} aria-label="Controles do adulto">
          <header className="rm-adult__head">
            <button type="button" className="rm-btn rm-btn--ghost" aria-expanded={stripOpen} onClick={() => setStripOpen((o) => !o)}>
              {stripOpen ? 'Adulto ▾' : 'Adulto ▸'}
            </button>
            <span className="rm-adult__meta">
              Largada {Math.min(completed + (e?.started ? 1 : 0), Math.max(settings.launches, completed + 1))} de {settings.launches} · {angleLabel} ({angle}°)
              {race ? ' · corrida' : ''}
            </span>
            <button type="button" className="rm-btn rm-btn--end" onClick={park} disabled={phase !== 'routine' || stage === 'running'}>
              {completed >= settings.launches ? 'Estacionar' : 'Encerrar'}
            </button>
          </header>

          {stripOpen && (
            <div className="rm-adult__body">
              {phase === 'opening' && (
                <div className="rm-row">
                  {settings.vehicles.map((v) => (
                    <button key={v} type="button" className="rm-btn" onClick={() => choose(v, 'adult')}>Dar {vehicleById(v).label.toLowerCase()}</button>
                  ))}
                </div>
              )}

              {phase === 'routine' && stage === 'garage' && (
                <div className="rm-row">
                  <button type="button" className="rm-btn rm-btn--main" onClick={() => place('adult', 'adult')} disabled={paused || ended}>Pôr no topo</button>
                  <span className="rm-tip">Ou a criança arrasta/toca o veículo da garagem.</span>
                </div>
              )}

              {phase === 'routine' && stage === 'locked' && (
                <>
                  <div className="rm-row">
                    {!counting ? (
                      <button type="button" className="rm-btn rm-btn--main" onClick={() => void startCountdown()} disabled={paused || ended}>
                        Contagem: “Preparar… apontar…”
                      </button>
                    ) : (
                      <span className="rm-tip" data-overdue={countdown === 'overdue'}>
                        {countdown === 'overdue' ? 'Pausa longa: modele “já!” e registre.' : 'Pausa expectante — aguarde o sinal da criança.'}
                      </span>
                    )}
                    {countdown === 'overdue' && <button type="button" className="rm-btn" onClick={() => void startCountdown()}>Repetir contagem</button>}
                  </div>
                  <div className="rm-row">
                    <Toggle on={!!e?.spontaneousRequest} onClick={() => { if (e) { e.spontaneousRequest = !e.spontaneousRequest; touch(); force(); } }}>Pediu antes da contagem</Toggle>
                    <Toggle on={!!e?.lookedAtAdult} onClick={() => { if (e) { e.lookedAtAdult = !e.lookedAtAdult; touch(); force(); } }}>Olhou para o adulto</Toggle>
                  </div>
                  <div className="rm-grid" role="group" aria-label="Liberar e registrar o sinal da criança">
                    {COMM_OUTCOMES.map((o) => (
                      <button key={o.id} type="button" className="rm-out" data-outcome={o.id} disabled={!counting || paused || ended} onClick={() => runRelease(o.id)}>
                        <span className="rm-out__label">{o.label}</span>
                        <span className="rm-out__hint">{o.hint}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {phase === 'routine' && stage === 'settled' && (
                <div className="rm-row">
                  <button type="button" className="rm-btn rm-btn--main" onClick={again} disabled={paused || ended}>De novo</button>
                  <Toggle on={!!e?.commented} onClick={() => { if (e) { e.commented = !e.commented; touch(); force(); } }}>Comentou (“caiu!”, “bateu!”)</Toggle>
                  <Toggle on={!!e?.imitatedSound} onClick={() => { if (e) { e.imitatedSound = !e.imitatedSound; touch(); force(); } }}>Imitou “vrum” / “bi-bi”</Toggle>
                  {e?.result?.winner && <span className="rm-tip">Corrida: {e.result.winner === 'child' ? 'criança na frente' : e.result.winner === 'adult' ? 'adulto na frente' : 'empate'}</span>}
                </div>
              )}

              {phase === 'routine' && (
                <fieldset className="rm-elab" disabled={!canElaborate}>
                  <legend>Elaboração (o adulto introduz e nomeia)</legend>
                  <div className="rm-row" role="group" aria-label="Inclinação">
                    {ANGLE_STEPS.map((a) => (
                      <Toggle key={a.id} on={angle === a.deg} onClick={() => elaborate(() => setAngle(a.deg))}>{a.label} {a.deg}°</Toggle>
                    ))}
                  </div>
                  <div className="rm-row" role="group" aria-label="Variação">
                    {[...VARIATIONS.map((v) => ({ id: v as Variation, label: VARIATION_LABELS[v] })), ...extraVariations].map((v) => (
                      <Toggle key={v.id} on={variation === v.id} onClick={() => elaborate(() => setVariation(v.id))}>{v.label}</Toggle>
                    ))}
                  </div>
                  <div className="rm-row">
                    <Toggle on={weight === 'leve'} onClick={() => elaborate(() => setWeight('leve'))}>Leve</Toggle>
                    <Toggle on={weight === 'pesado'} onClick={() => elaborate(() => setWeight('pesado'))}>Pesado</Toggle>
                    <Toggle on={race} onClick={() => elaborate(() => setRace((r) => !r))} disabled={!adultVehicle}>Corrida adulto × criança</Toggle>
                  </div>
                </fieldset>
              )}
            </div>
          )}
        </section>
      )}

      {(paused || ended) && (
        <div className="rm-overlay" role="status"><span className="rm-overlay__card">{ended ? 'Sessão encerrada' : 'Pausa'}</span></div>
      )}
      {resting && !paused && !ended && (
        <div className="rm-overlay" role="status">
          <div className="rm-overlay__card">
            <p>Descansando…</p>
            <button type="button" className="rm-btn rm-btn--main" onClick={() => { setResting(false); touch(); }}>Voltar</button>
          </div>
        </div>
      )}
      {phase === 'done' && !ended && (
        <div className="rm-overlay" role="status"><span className="rm-overlay__card">Acabou! Os carrinhos estacionaram.</span></div>
      )}
    </div>
  );
}

function Toggle({ on, onClick, children, disabled }: { on: boolean; onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button type="button" className="rm-toggle" aria-pressed={on} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
