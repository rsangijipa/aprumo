import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  easeOutBack,
  capturePointer,
  installAudioUnlock,
  integrate,
  playCue,
  playTones,
  seededRandom,
  speak,
  stepSpring,
  useAnnounce,
  useFrameLoop,
  useGameClient,
  useMotion,
  wobble,
  type Spring,
  type WorldBounds,
} from '@aprumo/game-sdk';
import type { PromptSource } from '@aprumo/protocol';
import {
  burst,
  HOLD_MIN_MS,
  holdScale,
  NOTE_NAMES,
  noteFor,
  noteIndexFor,
  PALETTES,
  PENTATONIC_FREQS,
  planPhases,
  shouldTriggerMilestone,
  spawnBubble,
  stepBubbles,
  stepParticles,
  TRAIL_STROKE_PX,
  type Bubble,
  type Palette,
  type Particle,
  type PhaseKind,
} from './logic';
import { manifest } from './manifest';
import './game.css';

const TARGET_ID = 'toque-sensorial';
const MILESTONE = [
  { freq: 523.25, dur: 0.12, type: 'triangle' as const },
  { freq: 659.25, dur: 0.14, type: 'triangle' as const, delay: 0.08 },
  { freq: 783.99, dur: 0.22, type: 'triangle' as const, delay: 0.16 },
];
const BUBBLE_COLORS = ['rosa', 'amarela', 'verde', 'azul', 'lilás'];

interface Flower { x: number; y: number; colorIdx: number; born: number; petals: number; size: number }
interface Balloon { x: number; y: number; vx: number; vy: number; scale: number; colorIdx: number; flying: boolean; seed: number; born: number }
interface TrailPoint { x: number; y: number; life: number }
/** Instantâneo de uma bolha para render (a posição viva é aplicada direto no DOM a cada quadro). */
interface BubbleView { id: string; r: number; x: number; y: number; colorIdx: number; noteIdx: number }

const PHASE_ICON: Record<PhaseKind, string> = { surface: '🌷', bubbles: '🫧', hold: '🎈', trail: '✨', switch: '☀️' };

export default function CausaEEfeito() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const phases = useMemo(() => (config ? planPhases(config) : []), [config]);
  const palette = (config?.adaptation.palette ?? 'calm') as Palette;
  const sound = config?.adaptation.sound ?? 'low';
  const scale = config?.adaptation.touchScale ?? 1;

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [inPhase, setInPhase] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState(false);
  const [sunOn, setSunOn] = useState(false);
  const [bubbleViews, setBubbleViews] = useState<BubbleView[]>([]);
  const [trialSeq, setTrialSeq] = useState(0);
  const [live, announce] = useAnnounce();

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bounds = useRef<WorldBounds>({ left: 0, top: 0, right: 400, bottom: 600 });
  const rnd = useRef(seededRandom(1));
  const bubbles = useRef<Bubble[]>([]);
  const bubbleEls = useRef(new Map<string, HTMLButtonElement>());
  const particles = useRef<Particle[]>([]);
  const flowers = useRef<Flower[]>([]);
  const balloons = useRef<Balloon[]>([]);
  const trail = useRef<TrailPoint[]>([]);
  const hold = useRef<{ start: number; balloon: Balloon; spring: Spring } | null>(null);
  const drag = useRef<{ x: number; y: number; len: number; nextChime: number } | null>(null);
  const kbCursor = useRef({ x: 0, y: 0 });
  const clock = useRef(0);
  const bubbleSeq = useRef(0);

  // Contadores clínicos em refs (callbacks de ponteiro não podem ler estado desatualizado).
  const phaseRef = useRef(0);
  const inPhaseRef = useRef(0);
  const trialIdx = useRef(0);
  const t0 = useRef(0);
  const responded = useRef(false);
  const prompt = useRef<{ level: string; source: PromptSource }>({ level: 'IND', source: 'none' });
  const offTarget = useRef(0);
  const blocked = useRef(true);
  const startedRun = useRef<string | null>(null);
  const timers = useRef<number[]>([]);

  const phase = phases[phaseIdx];
  const kind: PhaseKind = phase?.kind ?? 'surface';
  const colors = PALETTES[palette];

  useEffect(() => installAudioUnlock(), []);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  function draw(t: number) {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { right: w, bottom: h } = bounds.current;
    ctx.clearRect(0, 0, w, h);
    // Flores plantadas (persistem: o jardim cresce com as ações da criança).
    for (const f of flowers.current) {
      const k = motion === 'static' ? 1 : Math.min(1, easeOutBack(Math.min(1, (t - f.born) / 0.7)));
      const sway = motion === 'full' ? wobble(t * 0.6, f.x) * 0.06 : 0;
      drawFlower(ctx, f, Math.max(0, k), sway, colors.hues, colors.ink);
    }
    // Rastro de luz.
    for (const p of trail.current) {
      const a = Math.min(1, p.life / 0.9);
      ctx.beginPath();
      ctx.fillStyle = withAlpha(colors.glow, a * 0.9);
      ctx.arc(p.x, p.y, 10 * a + 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Balões.
    for (const bl of balloons.current) drawBalloon(ctx, bl, colors.hues, colors.ink);
    if (hold.current) drawBalloon(ctx, hold.current.balloon, colors.hues, colors.ink);
    // Partículas.
    for (const p of particles.current) {
      const a = Math.max(0, Math.min(1, p.life / (p.maxLife * 0.6)));
      const c = colors.hues[p.colorIdx % colors.hues.length]!;
      if (p.kind === 'ring') {
        const k = 1 - p.life / p.maxLife;
        ctx.beginPath();
        ctx.strokeStyle = withAlpha(c, (1 - k) * 0.9);
        ctx.lineWidth = 4;
        ctx.arc(p.x, p.y, p.size * (0.6 + k * 1.6), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.kind === 'star') {
        drawStar(ctx, p.x, p.y, p.size, (t * p.spin) % (Math.PI * 2), withAlpha(c, a));
      } else {
        ctx.beginPath();
        ctx.fillStyle = withAlpha(c, a);
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function celebrate() {
    const { right: w, bottom: h } = bounds.current;
    for (let i = 0; i < 4; i++) particles.current.push(...burst(w * (0.2 + i * 0.2), h * 0.35, i, rnd.current, motion, 1.1));
    if (config?.adaptation.feedback !== 'none') playCue('reinforce', sound);
  }

  /* ------------------------------------------------------------ ciclo da tentativa */

  const beginTrial = useCallback(() => {
    if (!config) return;
    t0.current = performance.now();
    responded.current = false;
    prompt.current = { level: 'IND', source: 'none' };
    offTarget.current = 0;
    blocked.current = false;
    setHint(false);
    setTrialSeq((n) => n + 1);
    client.trialStarted({ targetId: TARGET_ID, trialIndex: trialIdx.current, presented: [TARGET_ID] });
    client.stimulusPresented({ targetId: TARGET_ID, trialIndex: trialIdx.current, presented: [TARGET_ID], positionOfTarget: 0, modality: 'visual_auditory', instructionId: phases[phaseRef.current]?.id });
  }, [client, config, phases]);

  const startPhase = useCallback(
    (idx: number) => {
      const p = phases[idx];
      if (!p || !config) return;
      phaseRef.current = idx;
      inPhaseRef.current = 0;
      setPhaseIdx(idx);
      setInPhase(0);
      setSunOn(false);
      blocked.current = true;
      setBanner(p.title);
      announce(`Fase ${idx + 1}: ${p.title}. ${p.instruction}`);
      client.levelStarted({ levelId: p.id, levelIndex: idx, fieldSize: 1, trialsPlanned: p.actions, difficulty: p.kind });
      void speak(p.instruction, sound);
      later(() => {
        setBanner(null);
        beginTrial();
      }, motion === 'static' ? 900 : 1900);
    },
    [phases, config, client, sound, motion, beginTrial, announce],
  );

  // Início da sessão (protegido contra o duplo efeito do StrictMode).
  useEffect(() => {
    if (!config || startedRun.current === config.runId) return;
    startedRun.current = config.runId;
    rnd.current = seededRandom(config.clinical.seed);
    client.gameStarted(manifest.version);
    startPhase(0);
  }, [config, client, startPhase]);

  /** Uma ação intencional da criança: vira tentativa correta (jogo sem erro). */
  const recordAction = useCallback(
    (stimulusId: string, detail: Record<string, unknown>, inputMode: 'tap' | 'drag' | 'keyboard' = 'tap') => {
      if (!config || blocked.current || paused || done) return false;
      const p = phases[phaseRef.current]!;
      const latency = Math.max(0, Math.round(performance.now() - t0.current));
      if (!responded.current) {
        responded.current = true;
        client.responseStarted({ targetId: TARGET_ID, trialIndex: trialIdx.current, latencyMs: latency, position: 0, inputMode });
      }
      client.responseRecorded({
        targetId: TARGET_ID,
        stimulusId,
        trialIndex: trialIdx.current,
        presented: [TARGET_ID],
        positionOfTarget: 0,
        selected: stimulusId,
        selectedPosition: 0,
        response: 'correct',
        latencyMs: latency,
        promptLevel: prompt.current.level,
        promptSource: prompt.current.source,
        detail: { phase: p.kind, offTargetTouches: offTarget.current, ...detail },
      });
      trialIdx.current += 1;
      inPhaseRef.current += 1;
      setInPhase(inPhaseRef.current);
      setHint(false);

      if (shouldTriggerMilestone(trialIdx.current, 5) && config.adaptation.feedback !== 'none') {
        playTones(MILESTONE, sound);
        client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: TARGET_ID });
      }

      if (inPhaseRef.current >= p.actions) {
        blocked.current = true;
        client.levelCompleted({ levelId: p.id, levelIndex: phaseRef.current, trialsCompleted: p.actions, correct: p.actions, outcome: 'advanced' });
        client.reinforcerPresented({ kind: 'animation', contingentOn: p.id, intensity: config.adaptation.feedback === 'festive' ? 'festive' : 'subtle' });
        celebrate();
        const next = phaseRef.current + 1;
        if (next >= phases.length) {
          later(() => {
            setDone(true);
            announce('Jardim completo! Você fez tudo brilhar.');
            if (config.adaptation.feedback !== 'none') playCue('complete', sound);
            client.gameCompleted(trialIdx.current);
          }, 900);
        } else {
          later(() => startPhase(next), 1100);
        }
      } else {
        beginTrial();
      }
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, paused, done, phases, client, sound, beginTrial, startPhase, announce],
  );

  // Dica embutida: pulso suave no alvo depois de N ms sem ação.
  useEffect(() => {
    if (!config || done || paused || banner || trialSeq === 0) return;
    const after = config.adaptation.builtInPromptAfterMs;
    if (after == null) return;
    const id = window.setTimeout(() => {
      setHint(true);
      if (prompt.current.source === 'none') {
        const level = config.clinical.targets[0]?.promptHierarchy[1]?.code ?? 'GES';
        prompt.current = { level, source: 'built_in' };
        client.promptPresented({ targetId: TARGET_ID, trialIndex: trialIdx.current, level, source: 'built_in', latencyMs: after });
      }
    }, after);
    return () => window.clearTimeout(id);
  }, [config, done, paused, banner, trialSeq, client]);

  // Dica do profissional (comando SET_PROMPT).
  useEffect(
    () =>
      client.onCommand((c) => {
        if (c.kind !== 'SET_PROMPT') return;
        prompt.current = { level: c.level, source: c.level === 'IND' ? 'none' : 'therapist' };
        if (c.level !== 'IND') {
          setHint(true);
          client.promptPresented({ targetId: TARGET_ID, trialIndex: trialIdx.current, level: c.level, source: 'therapist', latencyMs: Math.max(0, Math.round(performance.now() - t0.current)) });
        }
      }),
    [client],
  );

  // Pausa clínica: registra e não deixa a pausa contaminar a latência.
  const pausedAt = useRef<number | null>(null);
  useEffect(() => {
    if (!config) return;
    if (paused) {
      pausedAt.current = performance.now();
      client.paused();
    } else if (pausedAt.current != null) {
      t0.current += performance.now() - pausedAt.current;
      pausedAt.current = null;
      client.resumed();
    }
  }, [paused, client, config]);

  /* ------------------------------------------------------------ palco e física */

  const syncBubbleIds = () => setBubbleViews(bubbles.current.map(({ id, r, x, y, colorIdx, noteIdx }) => ({ id, r, x, y, colorIdx, noteIdx })));

  const fillBubbles = useCallback(
    (initial: boolean) => {
      const want = Math.min(7, Math.max(4, (config?.adaptation.maxChoices ?? 3) + 2));
      while (bubbles.current.length < want) {
        bubbles.current.push(spawnBubble(`bolha-${bubbleSeq.current++}`, rnd.current, bounds.current, scale, !initial || motion !== 'static'));
      }
      if (motion === 'static') {
        // Sem movimento: bolhas distribuídas numa grade fixa e legível.
        const { left, right, top, bottom } = bounds.current;
        const n = bubbles.current.length;
        const cols = Math.ceil(Math.sqrt(n * 1.5));
        const rows = Math.ceil(n / cols);
        bubbles.current.forEach((b, i) => {
          b.x = left + ((i % cols) + 0.5) * ((right - left) / cols);
          b.y = top + 60 + (Math.floor(i / cols) + 0.5) * ((bottom - top - 120) / rows);
          b.vx = b.vy = 0;
        });
      }
      syncBubbleIds();
    },
    [config, scale, motion],
  );

  useEffect(() => {
    if (kind !== 'bubbles') {
      bubbles.current = [];
      syncBubbleIds();
      return;
    }
    fillBubbles(true);
  }, [kind, fillBubbles]);

  // Tamanho do canvas acompanha o palco (com densidade de pixels).
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const fit = () => {
      const r = stage.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      bounds.current = { left: 0, top: 0, right: r.width, bottom: r.height };
      kbCursor.current = { x: r.width / 2, y: r.height / 2 };
    };
    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(stage);
    return () => ro?.disconnect();
  }, [config]);

  const speedFor = motion === 'full' ? 1 : motion === 'reduced' ? 0.55 : 0;

  useFrameLoop((dt) => {
    clock.current += dt;
    const t = clock.current;
    const b = bounds.current;
    if (kind === 'bubbles' && speedFor > 0) stepBubbles(bubbles.current, dt, t, b, speedFor);
    for (const bb of bubbles.current) {
      const el = bubbleEls.current.get(bb.id);
      if (el) el.style.transform = `translate(${bb.x - bb.r}px, ${bb.y - bb.r}px)`;
    }
    particles.current = stepParticles(particles.current, dt, motion === 'full' ? 260 : 140);
    // Balões: o que está sendo enchido segue a mola; os soltos sobem com empuxo e balanço.
    if (hold.current) {
      const target = holdScale(performance.now() - hold.current.start);
      if (motion === 'static') hold.current.balloon.scale = target;
      else hold.current.balloon.scale = stepSpring(hold.current.spring, target, dt, 180, 14).value;
    }
    balloons.current = balloons.current.filter((bl) => {
      if (!bl.flying) {
        bl.scale = Math.max(0, bl.scale - dt * 1.8);
        return bl.scale > 0.05;
      }
      if (motion === 'static') {
        bl.scale -= dt * 0.8;
        return bl.scale > 0.05;
      }
      integrate(bl, dt, wobble(t, bl.seed) * 40, -160 * speedFor, 0.6);
      if (bl.y < -80) {
        particles.current.push(...burst(bl.x, 20, bl.colorIdx, rnd.current, motion, 0.6));
        return false;
      }
      return true;
    });
    trail.current = trail.current.filter((p) => (p.life -= dt) > 0);
    draw(t);
  }, !!config && !paused);


  /* ------------------------------------------------------------ efeitos */

  const note = (x: number, dur = 0.22) => playTones([{ freq: noteFor(x, bounds.current.right), dur, type: 'sine', attack: 0.01, decay: 0.08, sustain: 0.5, release: 0.3 }], sound);
  const ripple = (x: number, y: number) => {
    particles.current.push({ x, y, vx: 0, vy: 0, life: 0.45, maxLife: 0.45, size: 14, colorIdx: 3, kind: 'ring', spin: 0 });
    playCue('tap', sound);
  };

  const localPoint = (e: PointerEvent) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const plantFlower = (x: number, y: number, input: 'tap' | 'keyboard') => {
    const colorIdx = Math.floor(rnd.current() * 5);
    if (!recordAction('flor', { x: Math.round(x), y: Math.round(y), note: NOTE_NAMES[noteIndexFor(x, bounds.current.right)] }, input)) return;
    const k = Math.max(0.8, Math.min(1.6, Math.min(bounds.current.right, bounds.current.bottom) / 420));
    flowers.current.push({ x, y, colorIdx, born: clock.current, petals: 5 + Math.floor(rnd.current() * 3), size: (34 + rnd.current() * 18) * k });
    if (flowers.current.length > 36) flowers.current.shift();
    particles.current.push(...burst(x, y, colorIdx, rnd.current, motion, 0.7));
    note(x);
  };

  const popBubble = (id: string, input: 'tap' | 'keyboard') => {
    const idx = bubbles.current.findIndex((b) => b.id === id);
    const b = bubbles.current[idx];
    if (!b || !recordAction(`bolha-${BUBBLE_COLORS[b.colorIdx]}`, { note: NOTE_NAMES[b.noteIdx], radius: Math.round(b.r) }, input)) return;
    bubbles.current.splice(idx, 1);
    syncBubbleIds();
    particles.current.push(...burst(b.x, b.y, b.colorIdx, rnd.current, motion));
    playTones([{ freq: PENTATONIC_FREQS[b.noteIdx]!, dur: 0.18, type: 'sine', attack: 0.005, decay: 0.06, sustain: 0.4, release: 0.25 }], sound);
    playCue('tap', sound);
    later(() => fillBubbles(false), motion === 'static' ? 300 : 900);
  };

  const startHold = (x: number, y: number) => {
    if (blocked.current || paused || hold.current) return;
    const colorIdx = Math.floor(rnd.current() * 5);
    hold.current = {
      start: performance.now(),
      spring: { value: 0.2, velocity: 0 },
      balloon: { x, y, vx: 0, vy: 0, scale: 0.2, colorIdx, flying: false, seed: rnd.current() * 50, born: clock.current },
    };
    playTones([{ freq: 330, slideTo: 660, dur: 1.2, type: 'sine', attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.2, gain: 0.5 }], sound);
  };
  const endHold = (input: 'tap' | 'keyboard') => {
    const h = hold.current;
    if (!h) return;
    hold.current = null;
    const ms = Math.round(performance.now() - h.start);
    if (ms >= HOLD_MIN_MS && recordAction('balao', { holdMs: ms }, input)) {
      h.balloon.flying = true;
      h.balloon.vy = -40;
      balloons.current.push(h.balloon);
      playTones([{ freq: 523.25, slideTo: 1046.5, dur: 0.35, type: 'triangle', attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.3 }], sound);
    } else {
      // Pouco tempo: o balão murcha (sem som de erro, sem pontuação).
      balloons.current.push(h.balloon);
    }
  };

  const extendTrail = (x: number, y: number, input: 'drag' | 'keyboard') => {
    const d = drag.current;
    if (!d) return;
    const seg = Math.hypot(x - d.x, y - d.y);
    d.len += seg;
    const steps = Math.max(1, Math.ceil(seg / 8));
    for (let i = 1; i <= steps; i++) trail.current.push({ x: d.x + ((x - d.x) * i) / steps, y: d.y + ((y - d.y) * i) / steps, life: motion === 'static' ? 2.5 : 1.1 });
    if (trail.current.length > 500) trail.current.splice(0, trail.current.length - 500);
    d.x = x;
    d.y = y;
    if (d.len >= d.nextChime) {
      d.nextChime += 60;
      note(x, 0.14);
      if (motion !== 'static') particles.current.push(...burst(x, y, Math.floor(rnd.current() * 5), rnd.current, motion, 0.25));
    }
    if (input === 'keyboard' && d.len >= TRAIL_STROKE_PX) finishTrail('keyboard');
  };
  const finishTrail = (input: 'drag' | 'keyboard') => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.len < TRAIL_STROKE_PX) return;
    if (recordAction('rastro', { lengthPx: Math.round(d.len) }, input)) particles.current.push(...burst(d.x, d.y, 1, rnd.current, motion, 0.8));
  };

  const wakeSun = (input: 'tap' | 'keyboard') => {
    if (sunOn) return;
    if (!recordAction('sol', {}, input)) return;
    setSunOn(true);
    const { right: w } = bounds.current;
    particles.current.push(...burst(w / 2, 120, 1, rnd.current, motion, 1.3));
    playTones([261.63, 329.63, 392, 523.25].map((freq, i) => ({ freq, dur: 0.3, delay: i * 0.09, type: 'triangle' as const, attack: 0.03, decay: 0.1, sustain: 0.5, release: 0.4 })), sound);
    later(() => setSunOn(false), motion === 'static' ? 1200 : 1800);
  };

  /* ------------------------------------------------------------ entrada */

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!config || paused || done) return;
    const { x, y } = localPoint(e);
    if (blocked.current) return;
    if (kind === 'surface') plantFlower(x, y, 'tap');
    else if (kind === 'hold') {
      capturePointer(e.currentTarget, e.pointerId);
      startHold(x, y);
    } else if (kind === 'trail') {
      capturePointer(e.currentTarget, e.pointerId);
      drag.current = { x, y, len: 0, nextChime: 30 };
      trail.current.push({ x, y, life: 1.1 });
    } else {
      offTarget.current += 1;
      ripple(x, y);
    }
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (kind === 'trail' && drag.current) {
      const { x, y } = localPoint(e);
      extendTrail(x, y, 'drag');
    }
  };
  const onPointerUp = () => {
    if (kind === 'hold') endHold('tap');
    if (kind === 'trail') finishTrail('drag');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || !config || paused || done) return;
    const c = kbCursor.current;
    const { right: w, bottom: h } = bounds.current;
    const act = e.key === ' ' || e.key === 'Enter';
    if (kind === 'surface' && act) {
      e.preventDefault();
      plantFlower(w * (0.15 + rnd.current() * 0.7), h * (0.35 + rnd.current() * 0.45), 'keyboard');
    } else if (kind === 'hold' && act) {
      e.preventDefault();
      if (!e.repeat) startHold(w / 2, h * 0.6);
    } else if (kind === 'trail' && e.key.startsWith('Arrow')) {
      e.preventDefault();
      if (!drag.current) drag.current = { x: c.x, y: c.y, len: 0, nextChime: 30 };
      const step = 28;
      c.x = Math.min(w - 10, Math.max(10, c.x + (e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0)));
      c.y = Math.min(h - 10, Math.max(10, c.y + (e.key === 'ArrowDown' ? step : e.key === 'ArrowUp' ? -step : 0)));
      extendTrail(c.x, c.y, 'keyboard');
    }
  };
  const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    if (kind === 'hold' && (e.key === ' ' || e.key === 'Enter')) endHold('keyboard');
  };

  if (!config || !phase) return <div className="cee" aria-busy="true" />;

  const stageLabel: Record<PhaseKind, string> = {
    surface: 'Jardim: toque ou aperte Espaço para plantar uma flor',
    bubbles: 'Céu de bolhas: toque nas bolhas para estourar',
    hold: 'Segure o dedo ou a tecla Espaço para encher o balão e solte para ele voar',
    trail: 'Arraste o dedo ou use as setas para desenhar um rastro de estrelas',
    switch: 'Céu da noite: toque no botão do sol',
  };

  return (
    <div
      className="cee"
      data-palette={palette}
      data-motion={motion}
      data-phase={kind}
      data-sun={sunOn}
      style={{ ['--cee-scale' as string]: scale }}
    >
      <Landscape night={kind === 'switch' && !sunOn} />

      <div ref={stageRef} className="cee-stage">
        <canvas ref={canvasRef} className="cee-canvas" aria-hidden="true" />
        <div
          className="cee-surface"
          role="button"
          tabIndex={0}
          aria-label={stageLabel[kind]}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        />
        {kind !== 'bubbles' && kind !== 'switch' && hint && (
          <span className="cee-hand" data-kind={kind} aria-hidden="true">
            <HandIcon />
          </span>
        )}

        {bubbleViews.map((b, i) => {
          const id = b.id;
          return (
            <button
              key={id}
              ref={(el) => {
                if (el) bubbleEls.current.set(id, el);
                else bubbleEls.current.delete(id);
              }}
              type="button"
              className="cee-bubble"
              data-color={b.colorIdx}
              data-hint={hint && i === 0}
              style={{ width: b.r * 2, height: b.r * 2, transform: `translate(${b.x - b.r}px, ${b.y - b.r}px)` }}
              onPointerDown={(e) => {
                e.stopPropagation();
                popBubble(id, 'tap');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  popBubble(id, 'keyboard');
                }
              }}
              aria-label={`Bolha ${BUBBLE_COLORS[b.colorIdx]}, nota ${NOTE_NAMES[b.noteIdx]}`}
            >
              <span className="cee-bubble__shine" aria-hidden="true" />
            </button>
          );
        })}

        {kind === 'switch' && (
          <button
            type="button"
            className="cee-sun-btn"
            data-on={sunOn}
            data-hint={hint && !sunOn}
            onPointerDown={(e) => {
              e.stopPropagation();
              wakeSun('tap');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                wakeSun('keyboard');
              }
            }}
            aria-pressed={sunOn}
            aria-label={sunOn ? 'O sol está aceso' : 'Acender o sol'}
          >
            <SunIcon on={sunOn} />
          </button>
        )}
      </div>

      <header className="cee-hud">
        <ol className="cee-phases" aria-label="Fases do jardim">
          {phases.map((p, i) => (
            <li key={p.id} data-state={i < phaseIdx || done ? 'done' : i === phaseIdx ? 'now' : 'next'} aria-label={`Fase ${i + 1}: ${p.title}${i < phaseIdx ? ', concluída' : i === phaseIdx ? ', atual' : ''}`}>
              <span aria-hidden="true">{PHASE_ICON[p.kind]}</span>
            </li>
          ))}
        </ol>
        <div className="cee-title">{phase.title}</div>
        <div className="cee-meter" role="progressbar" aria-label="Ações nesta fase" aria-valuemin={0} aria-valuemax={phase.actions} aria-valuenow={inPhase}>
          {Array.from({ length: phase.actions }, (_, i) => (
            <i key={i} data-on={i < inPhase} />
          ))}
        </div>
      </header>

      <p className="cee-sr" aria-live="polite">{live}</p>

      {banner && (
        <div className="cee-banner" aria-hidden="true">
          <span className="cee-banner__icon">{PHASE_ICON[kind]}</span>
          <strong>Fase {phaseIdx + 1}</strong>
          <span>{banner}</span>
        </div>
      )}

      {(paused || ended) && !done && (
        <div className="cee-overlay" role="status">
          <div className="cee-overlay__badge">
            <PauseIcon />
            <span>Pausa</span>
          </div>
        </div>
      )}
      {done && (
        <div className="cee-overlay cee-overlay--done" role="status">
          <div className="cee-overlay__badge">
            <SunIcon on />
            <span>Jardim completo!</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ desenho (canvas) */

function withAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, fill: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function drawFlower(ctx: CanvasRenderingContext2D, f: Flower, k: number, sway: number, hues: string[], ink: string) {
  const s = f.size * k;
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(sway);
  // Caule e folha.
  ctx.strokeStyle = withAlpha('#4f8a4a', 0.9);
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(4, s * 0.9, 0, s * 1.6);
  ctx.stroke();
  ctx.fillStyle = '#6aa857';
  ctx.beginPath();
  ctx.ellipse(6, s * 1.05, s * 0.32, s * 0.13, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Pétalas.
  const c = hues[f.colorIdx % hues.length]!;
  for (let i = 0; i < f.petals; i++) {
    ctx.save();
    ctx.rotate((i / f.petals) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.5, s * 0.3, s * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = withAlpha(ink, 0.25);
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = '#f6c945';
  ctx.fill();
  ctx.strokeStyle = withAlpha(ink, 0.3);
  ctx.stroke();
  ctx.restore();
}

function drawBalloon(ctx: CanvasRenderingContext2D, b: Balloon, hues: string[], ink: string) {
  const s = 60 * b.scale;
  if (s < 2) return;
  const c = hues[b.colorIdx % hues.length]!;
  ctx.save();
  ctx.translate(b.x, b.y);
  // Fio.
  ctx.strokeStyle = withAlpha(ink, 0.5);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.95);
  ctx.bezierCurveTo(-8, s * 1.3, 8, s * 1.6, 0, s * 2);
  ctx.stroke();
  // Corpo.
  const g = ctx.createRadialGradient(-s * 0.3, -s * 0.35, s * 0.1, 0, 0, s);
  g.addColorStop(0, withAlpha('#ffffff', 0.85));
  g.addColorStop(0.25, c);
  g.addColorStop(1, c);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.8, s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = withAlpha(ink, 0.35);
  ctx.lineWidth = 2;
  ctx.stroke();
  // Nó.
  ctx.beginPath();
  ctx.moveTo(-5, s + 6);
  ctx.lineTo(5, s + 6);
  ctx.lineTo(0, s - 1);
  ctx.closePath();
  ctx.fillStyle = c;
  ctx.fill();
  ctx.restore();
}

/* ------------------------------------------------------------ ilustrações (SVG) */

function Landscape({ night }: { night: boolean }) {
  return (
    <svg className="cee-land" viewBox="0 0 800 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true" data-night={night}>
      <defs>
        <linearGradient id="cee-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--cee-sky-top)" />
          <stop offset="1" stopColor="var(--cee-sky-bottom)" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#cee-sky)" />
      <g className="cee-land__stars">
        {[[90, 80], [210, 140], [330, 60], [520, 110], [640, 70], [730, 160], [450, 180]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill="#fff" />
        ))}
      </g>
      <g className="cee-land__clouds" fill="var(--cee-cloud)">
        <ellipse cx="150" cy="120" rx="70" ry="22" />
        <ellipse cx="190" cy="108" rx="40" ry="20" />
        <ellipse cx="620" cy="90" rx="80" ry="24" />
        <ellipse cx="660" cy="78" rx="44" ry="20" />
      </g>
      <path d="M0 470 C 160 400 300 430 420 470 S 680 420 800 450 V600 H0Z" fill="var(--cee-hill-back)" />
      <path d="M0 520 C 180 470 330 500 470 530 S 700 490 800 510 V600 H0Z" fill="var(--cee-hill-front)" />
      <g fill="var(--cee-grass)">
        {Array.from({ length: 26 }, (_, i) => (
          <path key={i} d={`M${i * 32 + 8} 600 q 4 -26 10 -34 q -1 18 4 34z`} />
        ))}
      </g>
    </svg>
  );
}

function SunIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className="cee-sun" data-on={on}>
      <g className="cee-sun__rays" stroke="var(--cee-sun-ray)" strokeWidth="8" strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={i} x1={60 + Math.cos(a) * 40} y1={60 + Math.sin(a) * 40} x2={60 + Math.cos(a) * 54} y2={60 + Math.sin(a) * 54} />;
        })}
      </g>
      <circle cx="60" cy="60" r="32" fill="var(--cee-sun)" stroke="var(--cee-sun-ray)" strokeWidth="4" />
      <path d="M46 66 q14 12 28 0" fill="none" stroke="var(--cee-ink)" strokeWidth="4" strokeLinecap="round" />
      {on ? (
        <g fill="var(--cee-ink)">
          <circle cx="48" cy="54" r="4" />
          <circle cx="72" cy="54" r="4" />
        </g>
      ) : (
        <g stroke="var(--cee-ink)" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M43 55 q5 4 10 0" />
          <path d="M67 55 q5 4 10 0" />
        </g>
      )}
    </svg>
  );
}

function HandIcon() {
  return (
    <svg viewBox="0 0 64 64">
      <path d="M24 34V14a4 4 0 0 1 8 0v16-4a4 4 0 0 1 8 0v4-2a4 4 0 0 1 8 0v4-1a4 4 0 0 1 8 0v13c0 10-7 18-17 18h-3c-7 0-12-4-16-10l-7-11a4 4 0 0 1 6-5z" fill="#fff" stroke="var(--cee-ink)" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="var(--cee-sky-bottom)" />
      <rect x="21" y="18" width="8" height="28" rx="3" fill="var(--cee-ink)" />
      <rect x="35" y="18" width="8" height="28" rx="3" fill="var(--cee-ink)" />
    </svg>
  );
}
