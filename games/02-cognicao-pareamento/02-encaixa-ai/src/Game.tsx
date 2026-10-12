import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import type { InputMode } from '@aprumo/protocol';
import { installAudioUnlock, playCue, playTones, seededRandom, shuffle, speak, useGameClient, useMotion, type Tone } from '@aprumo/game-sdk';
import { Board, Defs, Hand, Pin, PieceBody, RotateHint, Sparkles } from './Art';
import { autoCompleteSteps, chainStepIndex, childSteps, classifyRun, initChain, preplacedSteps, updateChain, type ChainState } from './chain';
import {
  DEFAULT_TARGET, HOLD_MS, ROTATE_STEP, STAGE, angleError, buildPuzzle, buildTrialPayload, evaluateDrop, extentOf, initialAngles,
  logDrop, newStepLog, offerNear, resolveMotion, resolveSettings, snapAngle, stepResponse, trayLayout, type PromptKind, type StepLog,
} from './logic';
import { manifest } from './manifest';
import './game.css';

type Status = 'tray' | 'drag' | 'held' | 'placed' | 'hidden';
interface PieceView { x: number; y: number; angle: number; status: Status; home: { x: number; y: number; s: number } }
type Phase = 'intro' | 'play' | 'autofill' | 'celebrate' | 'done';
interface Hints { vis: string | null; gest: string | null; pos: string | null; rot: string | null }
const NO_HINTS: Hints = { vis: null, gest: null, pos: null, rot: null };
const CELEBRATE_MS = { minimal: 1200, normal: 2200, rich: 3000 } as const;

const WOOD: Tone[] = [
  { freq: 520, dur: 0.03, type: 'triangle', attack: 0.002, decay: 0.04, sustain: 0.15, release: 0.07, gain: 0.9 },
  { freq: 230, dur: 0.04, type: 'sine', attack: 0.002, decay: 0.05, sustain: 0.2, release: 0.09, gain: 0.7 },
];
const BIRD: Tone[] = [0, 0.14, 0.3].map((delay) => ({ freq: 1700, slideTo: 2500, dur: 0.07, delay, type: 'sine' as const, attack: 0.01, decay: 0.04, sustain: 0.4, release: 0.06, gain: 0.35 }));

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

const angleOf = (a: { x: number; y: number }, b: { x: number; y: number }) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
const wrap180 = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

export default function EncaixaAi() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const sdkMotion = useMotion(config);
  const sysReduced = useSystemReducedMotion();
  const settings = useMemo(() => (config ? resolveSettings(config) : null), [config]);
  const motion = settings ? resolveMotion(settings, sdkMotion, sysReduced) : 'static';
  const puzzle = useMemo(() => (config && settings ? buildPuzzle(settings, seededRandom(config.clinical.seed)) : null), [config, settings]);
  const target = config?.clinical.targets[0] ?? DEFAULT_TARGET;
  const sound = config?.adaptation.sound ?? 'low';
  const touch = config?.adaptation.touchScale ?? 1;
  const uid = `ea${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const [chain, setChain] = useState<ChainState | null>(null);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [pieces, setPieces] = useState<Record<string, PieceView>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [hints, setHints] = useState<Hints>(NO_HINTS);
  const [placedCount, setPlacedCount] = useState(0);
  const [correction, setCorrection] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [pxPerUnit, setPxPerUnit] = useState(1);

  const svgRef = useRef<SVGSVGElement>(null);
  const piecesRef = useRef(pieces);
  const chainRef = useRef(chain);
  const correctionRef = useRef(correction);
  const phaseRef = useRef(phase);
  const placedRef = useRef(0);
  const log = useRef<StepLog>(newStepLog());
  const t0 = useRef(0);
  const pausedAt = useRef<number | null>(null);
  const stepKey = useRef('');
  const stepTrial = useRef(0);
  const nextTrial = useRef(0);
  const totalTrials = useRef(0);
  const presented = useRef<string[]>([]);
  const trayOrder = useRef<string[]>([]);
  const records = useRef<{ response: 'correct' | 'incorrect' | 'no_response'; promptLevel: string }[]>([]);
  const responseStarted = useRef(false);
  const holdTimers = useRef(new Map<string, number>());
  const flowTimers = useRef<number[]>([]);
  const started = useRef(false);
  const lastTouched = useRef<string | null>(null);
  const drag = useRef<{ id: string; pointerId: number; dx: number; dy: number; sx: number; sy: number; moved: boolean; rotated: boolean } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ id: string; start: number; base: number; moved: boolean } | null>(null);
  const slotEls = useRef<(SVGGElement | null)[]>([]);
  const pieceEls = useRef(new Map<string, SVGGElement | null>());

  useLayoutEffect(() => {
    piecesRef.current = pieces;
    chainRef.current = chain;
    correctionRef.current = correction;
    phaseRef.current = phase;
  });

  useEffect(() => installAudioUnlock(), []);
  useEffect(() => () => {
    flowTimers.current.forEach((t) => window.clearTimeout(t));
    holdTimers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  // Escala real (px CSS por unidade do palco), para garantir alvo mínimo de 48 px × touchScale.
  useLayoutEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0) setPxPerUnit(Math.min(r.width / STAGE.w, r.height / STAGE.h) || 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [puzzle]);
  const minUnits = (48 * touch) / Math.max(0.2, pxPerUnit);
  const minUnitsRef = useRef(minUnits);
  minUnitsRef.current = minUnits;

  const later = useCallback((fn: () => void, ms: number) => {
    flowTimers.current.push(window.setTimeout(fn, ms));
  }, []);

  /* ------------------------------------------------------------ rodadas */

  const levelId = (s: ChainState) => `nivel-${settings?.level ?? 1}-${s.type}-k${s.k}`;

  const startRound = useCallback((s: ChainState, r: number) => {
    if (!config || !puzzle || !settings) return;
    const rnd = seededRandom(config.clinical.seed + (r + 1) * 7919);
    const ids = childSteps(s).map((i) => puzzle.pieces[i]!.id);
    const pre = new Set(preplacedSteps(s).map((i) => puzzle.pieces[i]!.id));
    const auto = new Set(autoCompleteSteps(s).map((i) => puzzle.pieces[i]!.id));
    const order = shuffle(ids, rnd);
    const layout = trayLayout(puzzle.pieces, order, puzzle.scale, puzzle.tray, minUnitsRef.current);
    const angles = initialAngles(ids, puzzle.rotation, rnd);
    const next: Record<string, PieceView> = {};
    puzzle.pieces.forEach((p, i) => {
      const slot = puzzle.slots[i]!;
      if (pre.has(p.id)) next[p.id] = { ...slot, angle: 0, status: 'placed', home: { ...slot, s: 1 } };
      else if (auto.has(p.id)) {
        const off = { x: settings.traySide === 'left' ? STAGE.w + 140 : -140, y: slot.y };
        next[p.id] = { ...off, angle: 0, status: 'hidden', home: { ...off, s: 1 } };
      } else {
        const h = layout[p.id]!;
        next[p.id] = { x: h.x, y: h.y, angle: angles[p.id] ?? 0, status: 'tray', home: h };
      }
    });
    holdTimers.current.forEach((t) => window.clearTimeout(t));
    holdTimers.current.clear();
    trayOrder.current = order;
    records.current = [];
    placedRef.current = 0;
    setPieces(next);
    setSelected(null);
    setHints(NO_HINTS);
    setPlacedCount(0);
    setCorrection(false);
    setRound(r);
    setPhase('intro');
    client.levelStarted({ levelId: levelId(s), levelIndex: r, fieldSize: Math.min(12, puzzle.pieces.length), trialsPlanned: ids.length, difficulty: `${s.type}-k${s.k}` });
    setAnnounce(ids.length === 1 ? 'Falta uma peça. Vamos encaixar!' : `Vamos encaixar ${ids.length} peças!`);
    void speak('Vamos encaixar!', sound);
    later(() => setPhase('play'), motion === 'static' ? 250 : 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, puzzle, settings, client, sound, motion, later]);

  useEffect(() => {
    if (!config || !puzzle || !settings || started.current) return;
    started.current = true;
    client.gameStarted(manifest.version);
    const s = initChain(settings.chainType, puzzle.pieces.length, settings.startK);
    setChain(s);
    startRound(s, 0);
  }, [config, puzzle, settings, client, startRound]);

  /* ------------------------------------------------------------ passo (tentativa) */

  const childIds = useMemo(() => (chain && puzzle ? childSteps(chain).map((i) => puzzle.pieces[i]!.id) : []), [chain, puzzle]);
  const remaining = useCallback(() => trayOrder.current.filter((id) => piecesRef.current[id]?.status !== 'placed'), []);
  /** Peça sugerida para dicas: a próxima da cadeia ainda não encaixada. */
  const suggested = useCallback(() => {
    const ps = piecesRef.current;
    return childIds.find((id) => ps[id]?.status !== 'placed') ?? null;
  }, [childIds]);
  const indexOf = useCallback((id: string) => puzzle?.pieces.findIndex((p) => p.id === id) ?? -1, [puzzle]);

  const elapsed = () => performance.now() - t0.current;

  const emitTrial = useCallback((pieceId: string, placed: boolean) => {
    const s = chainRef.current;
    if (!puzzle || !settings || !s) return;
    const payload = buildTrialPayload({
      targetId: target.targetId, trialIndex: stepTrial.current, presented: presented.current, pieceId,
      slotPieceIds: puzzle.pieces.map((p) => p.id), log: log.current, placed, assemblyMs: elapsed(),
      chain: s, chainStep: chainStepIndex(s, placedRef.current), level: settings.level, round, theme: puzzle.theme, settings, motion,
    });
    client.responseRecorded(payload);
    records.current.push({ response: stepResponse(log.current, placed), promptLevel: log.current.promptLevel });
    totalTrials.current++;
  }, [puzzle, settings, target.targetId, round, motion, client]);

  const needsRot = useCallback((id: string) => {
    const p = puzzle?.pieces[indexOf(id)];
    const v = piecesRef.current[id];
    return !!(p && v && puzzle?.rotation && angleError(v.angle, p.symmetry) > (settings?.angleTolerance ?? 20));
  }, [puzzle, settings, indexOf]);

  const applyPrompt = useCallback((kind: PromptKind, source: 'built_in' | 'therapist') => {
    const id = suggested();
    if (!id || !puzzle || !settings) return;
    if (log.current.promptSource === 'none' || source === 'therapist') log.current = { ...log.current, promptLevel: kind, promptSource: source };
    log.current = { ...log.current, hints: [...log.current.hints, kind] };
    client.promptPresented({ targetId: target.targetId, trialIndex: stepTrial.current, level: kind, source, latencyMs: Math.max(0, Math.round(elapsed())) });
    setHints((h) => ({ ...h, vis: kind === 'VIS' ? id : h.vis, gest: kind === 'GEST' ? id : h.gest, pos: kind === 'POS' ? id : h.pos, rot: needsRot(id) ? id : h.rot }));
    if (kind === 'POS') {
      const i = indexOf(id);
      const near = offerNear(puzzle.slots[i]!, settings.traySide, settings.captureRadius + extentOf(puzzle.pieces[i]!, puzzle.scale) * 0.8, puzzle.board);
      setPieces((ps) => ({ ...ps, [id]: { ...ps[id]!, home: { ...near, s: 1 } } }));
    }
    setAnnounce('Olha a dica.');
  }, [suggested, puzzle, settings, client, target.targetId, needsRot, indexOf]);

  // Início de cada passo + dica embutida + tempo-limite (sem resposta).
  useEffect(() => {
    if (phase !== 'play' || paused || ended || !chain || !config || !settings || placedCount >= childIds.length) return;
    const key = `${round}:${placedCount}`;
    if (stepKey.current !== key) {
      stepKey.current = key;
      log.current = newStepLog();
      t0.current = performance.now();
      responseStarted.current = false;
      presented.current = remaining();
      stepTrial.current = nextTrial.current++;
      client.trialStarted({ targetId: target.targetId, trialIndex: stepTrial.current, presented: presented.current });
      client.stimulusPresented({ targetId: target.targetId, trialIndex: stepTrial.current, presented: presented.current, positionOfTarget: null, modality: 'visual', instructionId: 'encaixa' });
    }
    if (correction) return;
    const timers: number[] = [];
    const builtIn = config.adaptation.builtInPromptAfterMs;
    if (builtIn != null && builtIn < manifest.clinical.latencyMaxMs && log.current.promptSource === 'none') {
      timers.push(window.setTimeout(() => applyPrompt(settings.promptKind, 'built_in'), builtIn));
    }
    timers.push(window.setTimeout(() => {
      const id = suggested();
      if (!id) return;
      emitTrial(id, false);
      setCorrection(true);
      setHints({ vis: id, gest: id, pos: null, rot: needsRot(id) ? id : null });
      setAnnounce('Vamos encaixar juntos. Olha onde ela vai.');
    }, manifest.clinical.latencyMaxMs));
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused, ended, round, placedCount, correction, chain]);

  // Pausa: a duração não contamina a latência.
  useEffect(() => {
    if (!config || !started.current) return;
    if (paused) {
      pausedAt.current = performance.now();
      client.paused(null);
    } else if (pausedAt.current != null) {
      t0.current += performance.now() - pausedAt.current;
      pausedAt.current = null;
      client.resumed();
    }
  }, [paused, client, config]);

  // Dicas do profissional.
  useEffect(() => client.onCommand((c) => {
    if (c.kind !== 'SET_PROMPT' || phaseRef.current !== 'play' || c.level === 'IND') return;
    if (c.level === 'VIS' || c.level === 'GEST' || c.level === 'POS') applyPrompt(c.level, 'therapist');
    else {
      log.current = { ...log.current, promptLevel: c.level, promptSource: 'therapist', hints: [...log.current.hints, c.level] };
      client.promptPresented({ targetId: target.targetId, trialIndex: stepTrial.current, level: c.level, source: 'therapist', latencyMs: Math.max(0, Math.round(elapsed())) });
    }
  }), [client, applyPrompt, target.targetId]);

  /* ------------------------------------------------------------ fim da rodada */

  const endRound = useCallback(() => {
    const s = chainRef.current;
    if (!s || !settings) return;
    const { state, change } = updateChain(s, classifyRun(records.current), settings.rules);
    client.levelCompleted({
      levelId: levelId(s), levelIndex: round, trialsCompleted: records.current.length,
      correct: records.current.filter((r) => r.response === 'correct').length,
      outcome: change === 'advanced' ? 'advanced' : change === 'regressed' ? 'repeated' : 'completed',
    });
    setChain(state);
    if (ended) return;
    if (round + 1 < settings.rounds) startRound(state, round + 1);
    else {
      setPhase('done');
      client.gameCompleted(totalTrials.current);
      setAnnounce('Terminamos! Até a próxima.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, client, round, ended, startRound]);

  const celebrate = useCallback(() => {
    if (!settings || !puzzle) return;
    setPhase('celebrate');
    setSelected(null);
    setHints(NO_HINTS);
    client.reinforcerPresented({ kind: 'animation', reinforcerId: `ea-${puzzle.theme}`, contingentOn: target.targetId, intensity: settings.sensory === 'rich' ? 'festive' : 'subtle' });
    if (settings.sensory === 'minimal') playCue('correct', sound);
    else if (puzzle.theme === 'bichos' || puzzle.theme === 'fazenda' || puzzle.theme === 'recorte') playTones(BIRD, sound);
    else playCue('complete', sound);
    setAnnounce('Pronto! O quebra-cabeça ficou completo!');
    later(endRound, CELEBRATE_MS[settings.sensory]);
  }, [settings, puzzle, client, target.targetId, sound, later, endRound]);

  const finishChildPart = useCallback(() => {
    const s = chainRef.current;
    if (!s || !puzzle) return;
    const autos = autoCompleteSteps(s).map((i) => puzzle.pieces[i]!.id);
    if (!autos.length) { later(celebrate, motion === 'static' ? 100 : 320); return; }
    setPhase('autofill');
    const gap = motion === 'static' ? 0 : 380;
    autos.forEach((id, j) => later(() => {
      const slot = puzzle.slots[indexOf(id)]!;
      setPieces((ps) => ({ ...ps, [id]: { ...ps[id]!, ...slot, status: 'placed' } }));
      playTones(WOOD, sound);
    }, 200 + j * gap));
    later(celebrate, 200 + autos.length * gap + 400);
  }, [puzzle, motion, later, celebrate, indexOf, sound]);

  /* ------------------------------------------------------------ interação */

  const canAct = !!puzzle && !paused && !ended && phase === 'play';

  const markResponseStart = (position: number | null, mode: InputMode) => {
    if (responseStarted.current || phaseRef.current !== 'play') return;
    responseStarted.current = true;
    client.responseStarted({ targetId: target.targetId, trialIndex: stepTrial.current, latencyMs: Math.max(0, Math.round(elapsed())), position, inputMode: mode });
  };

  const clearHold = (id: string) => {
    const t = holdTimers.current.get(id);
    if (t != null) window.clearTimeout(t);
    holdTimers.current.delete(id);
  };
  /** Fica onde foi solta por 1 s e desliza de volta para a bandeja. */
  const holdThenReturn = (id: string, x: number, y: number) => {
    setPieces((ps) => ({ ...ps, [id]: { ...ps[id]!, x, y, status: 'held' } }));
    clearHold(id);
    holdTimers.current.set(id, window.setTimeout(() => {
      holdTimers.current.delete(id);
      setPieces((ps) => (ps[id]?.status === 'held' ? { ...ps, [id]: { ...ps[id]!, status: 'tray' } } : ps));
    }, HOLD_MS));
  };

  const place = (id: string) => {
    if (!puzzle) return;
    const i = indexOf(id);
    const slot = puzzle.slots[i]!;
    clearHold(id);
    setPieces((ps) => ({ ...ps, [id]: { ...ps[id]!, ...slot, angle: snapAngle(ps[id]!.angle, puzzle.pieces[i]!.symmetry), status: 'placed' } }));
    playTones(WOOD, sound);
    if (!correctionRef.current) emitTrial(id, true);
    placedRef.current += 1;
    setSelected(null);
    setHints(NO_HINTS);
    setCorrection(false);
    setPlacedCount(placedRef.current);
    setAnnounce(`Encaixou: ${puzzle.pieces[i]!.label}.`);
    if (placedRef.current >= childIds.length) finishChildPart();
  };

  const drop = (id: string, x: number, y: number, mode: InputMode) => {
    if (!puzzle || !settings) return;
    const ps = piecesRef.current;
    const def = puzzle.pieces[indexOf(id)]!;
    const open = puzzle.slots
      .map((s, index) => ({ index, pieceId: puzzle.pieces[index]!.id, x: s.x, y: s.y }))
      .filter((s) => ps[s.pieceId]?.status !== 'placed');
    const r = evaluateDrop({ pieceId: id, x, y, angle: ps[id]!.angle, symmetry: def.symmetry }, open, settings.captureRadius, settings.angleTolerance);
    log.current = logDrop(log.current, r, elapsed(), mode);
    if (r.kind === 'snap') { place(id); return; }
    holdThenReturn(id, x, y);
    if (r.kind === 'wrong_slot') {
      // Correção calma: a cavidade certa desta peça brilha. Sem X, sem som de erro.
      log.current = { ...log.current, hints: [...log.current.hints, 'VIS-correcao'] };
      setHints((h) => ({ ...h, vis: id }));
      setAnnounce('Esse lugar é de outra peça. Olha onde ela cabe.');
    } else if (r.kind === 'angle_miss') {
      setHints((h) => ({ ...h, rot: id }));
      setAnnounce('Quase! Vamos girar a peça.');
    }
  };

  const toStage = (e: { clientX: number; clientY: number }) => {
    const m = svgRef.current?.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const select = (id: string | null, focusSlot = false) => {
    setSelected(id);
    if (id) {
      playCue('tap', sound);
      setAnnounce(`${puzzle?.pieces[indexOf(id)]?.label ?? 'Peça'} escolhida. Toque no lugar dela.`);
      if (focusSlot) window.setTimeout(() => slotEls.current.find((el) => el && el.dataset.open === 'true')?.focus(), 0);
    }
  };

  const rotate = (id: string | null) => {
    if (!id || !puzzle?.rotation || !canAct) return;
    const v = piecesRef.current[id];
    if (!v || v.status === 'placed' || v.status === 'hidden') return;
    markResponseStart(trayOrder.current.indexOf(id), 'tap');
    log.current = { ...log.current, rotations: log.current.rotations + 1 };
    setPieces((ps) => ({ ...ps, [id]: { ...ps[id]!, angle: ps[id]!.angle + ROTATE_STEP } }));
    playCue('tap', sound);
  };

  const beginGesture = (id: string) => {
    const [a, b] = [...pointers.current.values()];
    if (!a || !b || !puzzle?.rotation) return;
    gesture.current = { id, start: angleOf(a, b), base: piecesRef.current[id]?.angle ?? 0, moved: false };
  };

  const onPiecePointerDown = (e: RPointerEvent<SVGGElement>, id: string) => {
    const v = piecesRef.current[id];
    if (!canAct || !v || v.status === 'placed' || v.status === 'hidden') return;
    e.stopPropagation();
    svgRef.current?.setPointerCapture?.(e.pointerId);
    const p = toStage(e);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size >= 2) { beginGesture(drag.current?.id ?? id); return; }
    clearHold(id);
    lastTouched.current = id;
    markResponseStart(trayOrder.current.indexOf(id), 'drag');
    const cx = v.status === 'tray' ? v.home.x : v.x, cy = v.status === 'tray' ? v.home.y : v.y;
    drag.current = { id, pointerId: e.pointerId, dx: cx - p.x, dy: cy - p.y, sx: e.clientX, sy: e.clientY, moved: false, rotated: false };
  };

  const onStagePointerDown = (e: RPointerEvent<SVGSVGElement>) => {
    if (!canAct) return;
    pointers.current.set(e.pointerId, toStage(e));
    const id = drag.current?.id ?? selected;
    if (pointers.current.size >= 2 && id) {
      svgRef.current?.setPointerCapture?.(e.pointerId);
      beginGesture(id);
    }
  };

  const onStagePointerMove = (e: RPointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = toStage(e);
    pointers.current.set(e.pointerId, p);
    const g = gesture.current;
    if (g && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const delta = wrap180(angleOf(a!, b!) - g.start);
      if (Math.abs(delta) > 8) g.moved = true;
      setPieces((ps) => ({ ...ps, [g.id]: { ...ps[g.id]!, angle: g.base + delta } }));
      if (drag.current?.id === g.id) drag.current.rotated = true;
      return;
    }
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 8) { d.moved = true; setSelected(null); }
    if (d.moved) setPieces((ps) => ({ ...ps, [d.id]: { ...ps[d.id]!, x: p.x + d.dx, y: p.y + d.dy, status: 'drag' } }));
  };

  const onStagePointerUp = (e: RPointerEvent<SVGSVGElement>) => {
    const had = pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (g && pointers.current.size < 2) {
      if (g.moved) log.current = { ...log.current, rotations: log.current.rotations + 1 };
      gesture.current = null;
      const d0 = drag.current;
      const rest = d0 ? pointers.current.get(d0.pointerId) : undefined;
      if (d0 && rest) {
        const v = piecesRef.current[d0.id]!;
        const cx = v.status === 'tray' ? v.home.x : v.x, cy = v.status === 'tray' ? v.home.y : v.y;
        d0.dx = cx - rest.x; d0.dy = cy - rest.y;
        return;
      }
    }
    const d = drag.current;
    if (!had || !d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    const v = piecesRef.current[d.id];
    if (!v) return;
    if (e.type === 'pointercancel' || !canAct) {
      if (d.moved) holdThenReturn(d.id, v.x, v.y);
      return;
    }
    if (!d.moved) {
      if (!d.rotated) select(selected === d.id ? null : d.id);
      return;
    }
    drop(d.id, v.x, v.y, 'drag');
  };

  const activateSlot = (index: number, mode: InputMode) => {
    if (!canAct || !selected || !puzzle) return;
    const slot = puzzle.slots[index]!;
    markResponseStart(index, mode);
    drop(selected, slot.x, slot.y, mode);
    setSelected(null);
  };

  const onPieceKey = (e: KeyboardEvent<SVGGElement>, id: string) => {
    if (!canAct) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      markResponseStart(trayOrder.current.indexOf(id), 'keyboard');
      select(selected === id ? null : id, selected !== id);
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      rotate(id);
    } else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const ids = remaining().filter((x) => piecesRef.current[x]?.status !== 'hidden');
      const k = ids.indexOf(id) + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1);
      pieceEls.current.get(ids[(k + ids.length) % ids.length]!)?.focus();
    }
  };

  const onSlotKey = (e: KeyboardEvent<SVGGElement>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const id = selected;
      activateSlot(index, 'keyboard');
      if (id) window.setTimeout(() => pieceEls.current.get(remaining()[0] ?? '')?.focus(), 0);
    } else if (e.key === 'Escape') {
      const id = selected;
      setSelected(null);
      if (id) pieceEls.current.get(id)?.focus();
    } else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const open = slotEls.current.map((el, i) => (el?.dataset.open === 'true' ? i : -1)).filter((i) => i >= 0);
      const k = open.indexOf(index) + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1);
      slotEls.current[open[(k + open.length) % open.length]!]?.focus();
    }
  };

  /* ------------------------------------------------------------ render */

  if (!config || !settings || !puzzle) return <div className="ea" aria-busy="true" />;

  const rotTarget = selected ?? (lastTouched.current && piecesRef.current[lastTouched.current]?.status !== 'placed' ? lastTouched.current : null);
  const order = puzzle.pieces
    .map((p) => p.id)
    .sort((a, b) => {
      const rank = (id: string) => (pieces[id]?.status === 'placed' ? 0 : id === selected ? 2 : pieces[id]?.status === 'drag' ? 3 : 1);
      return rank(a) - rank(b);
    });
  const gestId = hints.gest;
  const gestFrom = gestId ? pieces[gestId] : undefined;
  const gestTo = gestId ? puzzle.slots[indexOf(gestId)] : undefined;
  const vars = { '--ea-touch': touch, '--ea-rot-size': `${64 * touch}px` } as CSSProperties;

  return (
    <div
      className="ea"
      data-sensory={settings.sensory}
      data-palette={config.adaptation.palette}
      data-motion={motion}
      data-phase={phase}
      data-tray={settings.traySide}
      style={vars}
    >
      <svg
        ref={svgRef}
        className="ea-stage"
        viewBox={`0 0 ${STAGE.w} ${STAGE.h}`}
        role="application"
        aria-label="Quebra-cabeça de encaixe. Arraste a peça até o lugar dela, ou toque na peça e depois no lugar."
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={onStagePointerUp}
        onPointerCancel={onStagePointerUp}
      >
        <Defs uid={uid} />
        <Board board={puzzle.board} tray={puzzle.tray} theme={puzzle.theme} sensory={settings.sensory} frame={puzzle.frame} uid={uid} />

        {puzzle.pieces.map((p, i) => {
          const slot = puzzle.slots[i]!;
          const isOpen = pieces[p.id]?.status !== 'placed';
          const ext = extentOf(p, puzzle.scale);
          const focusable = isOpen && !!selected && canAct;
          return (
            <g
              key={`slot-${p.id}`}
              ref={(el) => { slotEls.current[i] = el; }}
              className="ea-slot"
              data-open={isOpen}
              data-glow={hints.vis === p.id && isOpen}
              data-target={!!selected && isOpen}
              transform={`translate(${slot.x} ${slot.y})`}
              tabIndex={focusable ? 0 : -1}
              role="button"
              aria-label={`Lugar ${i + 1}${puzzle.cavities ? `, formato de ${p.label}` : ''}`}
              aria-disabled={!focusable}
              onClick={() => isOpen && activateSlot(i, 'tap')}
              onKeyDown={(e) => onSlotKey(e, i)}
            >
              <rect className="ea-slot__hit" x={-ext / 2} y={-ext / 2} width={ext} height={ext} rx="16" />
              {puzzle.cavities && (
                <g transform={`scale(${puzzle.scale}) translate(${-p.cx} ${-p.cy})`}>
                  <path className="ea-cavity__glow" d={p.d} />
                  <path className="ea-cavity" d={p.d} filter={`url(#${uid}-inset)`} />
                </g>
              )}
              {!puzzle.cavities && <rect className="ea-cavity__glow ea-cavity__glow--tile" x={(-p.w * puzzle.scale) / 2} y={(-p.h * puzzle.scale) / 2} width={p.w * puzzle.scale} height={p.h * puzzle.scale} rx="8" />}
            </g>
          );
        })}

        {gestId && gestFrom && gestTo && (
          <g
            className="ea-ghost"
            style={{ '--fx': `${gestFrom.home.x}px`, '--fy': `${gestFrom.home.y}px`, '--tx': `${gestTo.x}px`, '--ty': `${gestTo.y}px` } as CSSProperties}
          >
            <line className="ea-ghost__path" x1={gestFrom.home.x} y1={gestFrom.home.y} x2={gestTo.x} y2={gestTo.y} />
            <g className="ea-ghost__mover">
              <g opacity="0.45"><PieceBody piece={puzzle.pieces[indexOf(gestId)]!} scale={puzzle.scale} uid={uid} /></g>
              <Hand />
            </g>
          </g>
        )}

        {order.map((id) => {
          const p = puzzle.pieces[indexOf(id)]!;
          const v = pieces[id];
          if (!v) return null;
          const inTray = v.status === 'tray';
          const x = inTray ? v.home.x : v.x, y = inTray ? v.home.y : v.y;
          const s = inTray ? v.home.s : 1;
          const ext = extentOf(p, puzzle.scale);
          const interactive = canAct && v.status !== 'placed' && v.status !== 'hidden';
          const showRot = hints.rot === id && interactive && needsRot(id);
          return (
            <g
              key={id}
              ref={(el) => { pieceEls.current.set(id, el); }}
              className="ea-piece"
              data-status={v.status}
              data-selected={selected === id}
              data-anim={p.anim}
              style={{ transform: `translate(${x}px, ${y}px) rotate(${v.angle}deg) scale(${s})` }}
              tabIndex={interactive ? 0 : -1}
              role="button"
              aria-label={`Peça ${p.label}${v.status === 'placed' ? ', encaixada' : ''}`}
              aria-pressed={selected === id}
              aria-disabled={!interactive}
              onPointerDown={(e) => onPiecePointerDown(e, id)}
              onKeyDown={(e) => onPieceKey(e, id)}
            >
              <circle className="ea-piece__hit" r={Math.max(ext / 2, minUnits / 2 / s)} />
              <g className="ea-anim">
                <PieceBody piece={p} scale={puzzle.scale} uid={uid} />
                <Pin r={Math.max(8, Math.min(14, ext * 0.09))} />
              </g>
              <circle className="ea-piece__ring" r={ext / 2 + 10} />
              {showRot && <RotateHint r={ext / 2 + 18} />}
            </g>
          );
        })}

        {phase === 'celebrate' && settings.sensory === 'rich' && motion !== 'static' && <Sparkles board={puzzle.board} />}
      </svg>

      {puzzle.rotation && (
        <button
          type="button"
          className="ea-rotate"
          onClick={() => rotate(rotTarget)}
          disabled={!canAct || !rotTarget}
          aria-label="Girar a peça escolhida"
        >
          <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M36,18A14,14 0 1 0 38,30" /><path className="ea-rotate__head" d="M30,10L40,18L28,22Z" /></svg>
        </button>
      )}

      <div className="ea-steps" role="progressbar" aria-label={`Quebra-cabeça ${Math.min(round + 1, settings.rounds)} de ${settings.rounds}`} aria-valuemin={0} aria-valuemax={settings.rounds} aria-valuenow={phase === 'done' ? settings.rounds : round}>
        {Array.from({ length: settings.rounds }, (_, k) => <span key={k} data-done={k < round || phase === 'done'} data-current={k === round && phase !== 'done'} />)}
      </div>

      {phase === 'celebrate' && settings.sensory === 'minimal' && <div className="ea-badge" aria-hidden="true">Pronto!</div>}
      <p className="ea-sr" aria-live="polite">{announce}</p>

      {(paused || ended) && phase !== 'done' && (
        <div className="ea-overlay" role="status"><div className="ea-overlay__card">Pausa</div></div>
      )}
      {phase === 'done' && (
        <div className="ea-overlay" role="status"><div className="ea-overlay__card">Montamos tudo! Até a próxima.</div></div>
      )}
    </div>
  );
}
