import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  installAudioUnlock,
  playCue,
  playTones,
  seededRandom,
  shuffle,
  speak,
  stepSpring,
  useAnnounce,
  useFrameLoop,
  useGameClient,
  useMotion,
  type WorldBounds,
} from '@aprumo/game-sdk';
import type { PromptSource } from '@aprumo/protocol';
import {
  blowBubbles,
  bubblesPerRound,
  MAND_LEVELS,
  mandLevelFrom,
  nextMandLevel,
  promptSchedule,
  REINFORCERS,
  sentenceReady,
  splitGiant,
  startMandLevel,
  stepBubbles,
  type Bubble,
  type MandPromptLevel,
  type ReinforcerId,
} from './logic';
import { manifest } from './manifest';
import './game.css';

type Stage = 'intro' | 'blowing' | 'play' | 'mand' | 'reward' | 'done';
interface Drop { x: number; y: number; vx: number; vy: number; life: number; hue: number; r: number }
interface BubbleView { id: string; r: number; x: number; y: number; hue: number; kind: Bubble['kind'] }

const since = (t: number) => Math.max(0, Math.round(performance.now() - t));
const POP = (freq: number) => [{ freq, slideTo: freq * 1.6, dur: 0.07, type: 'sine' as const, attack: 0.003, decay: 0.04, sustain: 0.2, release: 0.06, gain: 0.7 }];
const CARD_LABEL: Record<string, string> = { mais: 'MAIS', quero: 'QUERO', bolhinhas: 'BOLHINHAS', bolhona: 'BOLHONA' };

export function Game() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const sound = config?.adaptation.sound ?? 'low';
  const feedback = config?.adaptation.feedback ?? 'subtle';
  const scale = config?.adaptation.touchScale ?? 1;
  const rounds = useMemo(() => Math.max(3, Math.min(12, config?.clinical.trialsPerTarget ?? 6)), [config]);

  const [stage, setStage] = useState<Stage>('intro');
  const [round, setRound] = useState(0);
  const [levelIdx, setLevelIdx] = useState(0);
  const [views, setViews] = useState<BubbleView[]>([]);
  const [popped, setPopped] = useState(0);
  const [spontaneous, setSpontaneous] = useState(0);
  const [cards, setCards] = useState<string[]>([]);
  const [strip, setStrip] = useState<string[]>([]);
  const [promptVis, setPromptVis] = useState<'none' | 'pulse' | 'model'>('none');
  const [banner, setBanner] = useState<string | null>(null);
  const [live, announce] = useAnnounce();

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bounds = useRef<WorldBounds>({ left: 0, top: 0, right: 400, bottom: 600 });
  const bubbles = useRef<Bubble[]>([]);
  const els = useRef(new Map<string, HTMLButtonElement>());
  const drops = useRef<Drop[]>([]);
  const queue = useRef<Bubble[]>([]);
  const emitTimer = useRef(0);
  const clock = useRef(0);
  const rnd = useRef(seededRandom(1));
  const seq = useRef(0);
  const timers = useRef<number[]>([]);
  const promptTimers = useRef<number[]>([]);
  const startedRun = useRef<string | null>(null);

  // Clínico.
  const trialIdx = useRef(0);
  const t0 = useRef(0);
  const delivered = useRef<MandPromptLevel[]>([]);
  const prompt = useRef<{ level: string; source: PromptSource }>({ level: 'N0', source: 'none' });
  const scored = useRef(false);
  const streak = useRef(0);
  const levelRef = useRef(0);
  const levelTrials = useRef(0);
  const levelSpont = useRef(0);
  const roundPops = useRef(0);
  const selfPopped = useRef(0);

  const targetId = config?.clinical.targets[0]?.targetId ?? 'pedido-mais';
  const level = MAND_LEVELS[levelIdx]!;
  const speedFor = motion === 'full' ? 1 : motion === 'reduced' ? 0.6 : 0;

  useEffect(() => installAudioUnlock(), []);
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      promptTimers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const sync = () => setViews(bubbles.current.map(({ id, r, x, y, hue, kind }) => ({ id, r, x, y, hue, kind })));
  const wandPos = () => ({ x: bounds.current.left + 70, y: bounds.current.bottom - 110 });

  /* ------------------------------------------------------------ sopro */

  const blow = useCallback(
    (kind: ReinforcerId, r: number) => {
      setStage('blowing');
      roundPops.current = 0;
      selfPopped.current = 0;
      const n = bubblesPerRound(r, config?.adaptation.maxChoices ?? 3, kind);
      queue.current = blowBubbles(`b${seq.current++}`, n, wandPos(), rnd.current, kind === 'bolhona' ? 'giant' : 'normal', scale);
      emitTimer.current = 0;
      playTones([{ freq: 220, slideTo: 440, dur: 0.6, type: 'sine', attack: 0.15, decay: 0.2, sustain: 0.5, release: 0.3, gain: 0.35 }], sound);
      if (motion === 'static') {
        // Sem movimento: as bolhas aparecem já distribuídas, paradas.
        const { left, right, top } = bounds.current;
        queue.current.forEach((b, i) => {
          b.x = left + ((i % 4) + 0.5) * ((right - left) / 4);
          b.y = top + 130 + Math.floor(i / 4) * (b.r * 2.4);
          b.vx = b.vy = 0;
          b.life = 9999;
        });
        bubbles.current = queue.current;
        queue.current = [];
        sync();
        setStage('play');
      }
    },
    [config, scale, sound, motion],
  );

  useEffect(() => {
    if (!config || startedRun.current === config.runId) return;
    startedRun.current = config.runId;
    rnd.current = seededRandom(config.clinical.seed + 5);
    levelRef.current = startMandLevel(config.params);
    setLevelIdx(levelRef.current);
    client.gameStarted(manifest.version);
    const lv = MAND_LEVELS[levelRef.current]!;
    client.levelStarted({ levelId: lv.id, levelIndex: levelRef.current, fieldSize: lv.phase === 'single' ? 1 : lv.phase === 'choice' ? 2 : 3, trialsPlanned: rounds, difficulty: lv.phase });
    void speak('Olha a varinha mágica!', sound);
    later(() => blow('bolhinhas', 0), 900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, client]);

  /* ------------------------------------------------------------ pausa de mando */

  const clearPrompts = () => {
    promptTimers.current.forEach((t) => window.clearTimeout(t));
    promptTimers.current = [];
  };

  const openMand = useCallback(() => {
    if (!config) return;
    const lv = MAND_LEVELS[levelRef.current]!;
    const opts = lv.phase === 'single' ? ['mais'] : lv.phase === 'choice' ? shuffle(['bolhinhas', 'bolhona'], rnd.current) : ['quero', ...shuffle(['bolhinhas', 'bolhona'], rnd.current)];
    setCards(opts);
    setStrip([]);
    setPromptVis('none');
    setStage('mand');
    delivered.current = [];
    prompt.current = { level: 'N0', source: 'none' };
    scored.current = false;
    t0.current = performance.now();
    client.trialStarted({ targetId, trialIndex: trialIdx.current, presented: opts });
    client.stimulusPresented({ targetId, trialIndex: trialIdx.current, presented: opts, positionOfTarget: lv.phase === 'single' ? 0 : null, modality: 'visual_auditory', instructionId: lv.id });
    announce(`${lv.cue} ${lv.phase === 'single' ? 'Toque em MAIS para pedir.' : lv.phase === 'choice' ? 'Escolha: bolhinhas ou bolhona.' : 'Toque em QUERO e depois no que você quer.'}`);
    void speak(lv.cue, sound);

    // Dicas em hierarquia crescente (gesto → modelo verbal → demonstração).
    clearPrompts();
    const iid = targetId;
    const tIdx = trialIdx.current;
    for (const step of promptSchedule(config.adaptation.builtInPromptAfterMs)) {
      promptTimers.current.push(
        window.setTimeout(() => {
          if (scored.current && prompt.current.source !== 'none') return;
          delivered.current.push(step.level);
          if (prompt.current.source !== 'therapist') prompt.current = { level: step.level, source: 'built_in' };
          client.promptPresented({ targetId: iid, trialIndex: tIdx, level: step.level, source: 'built_in', latencyMs: step.atMs });
          if (step.code === 'PULSE_MORE') setPromptVis('pulse');
          if (step.code === 'VOICE_PROMPT') void speak(lv.phase === 'single' ? 'Fala: mais!' : lv.phase === 'choice' ? 'Bolhinhas ou bolhona?' : 'Quero... bolhas!', sound);
          if (step.code === 'MODEL_TAP') setPromptVis('model');
        }, step.atMs),
      );
    }
    // Sem resposta no tempo máximo: registra e a pausa continua aberta (o adulto pode ajudar).
    promptTimers.current.push(
      window.setTimeout(() => {
        if (scored.current) return;
        scored.current = true;
        client.responseRecorded({
          targetId: iid, stimulusId: opts[0]!, trialIndex: tIdx, presented: opts, positionOfTarget: lv.phase === 'single' ? 0 : null,
          selected: null, selectedPosition: null, response: 'no_response', latencyMs: null,
          promptLevel: prompt.current.level, promptSource: prompt.current.source, detail: { phase: lv.phase, round: tIdx },
        });
        streak.current = 0;
        levelTrials.current += 1;
      }, manifest.clinical.latencyMaxMs),
    );
  }, [config, client, targetId, sound, announce]);

  // Comando do profissional: dica registrada e visual de pulso.
  useEffect(
    () =>
      client.onCommand((c) => {
        if (c.kind !== 'SET_PROMPT' || stage !== 'mand') return;
        if (c.level === 'IND' || c.level === 'N0') {
          prompt.current = { level: 'N0', source: 'none' };
          return;
        }
        prompt.current = { level: c.level, source: 'therapist' };
        setPromptVis('pulse');
        client.promptPresented({ targetId, trialIndex: trialIdx.current, level: c.level, source: 'therapist', latencyMs: since(t0.current) });
      }),
    [client, stage, targetId],
  );

  // Pausa clínica.
  const pausedAt = useRef<number | null>(null);
  useEffect(() => {
    if (!config) return;
    if (paused) {
      pausedAt.current = performance.now();
      clearPrompts();
      client.paused();
    } else if (pausedAt.current != null) {
      t0.current += performance.now() - pausedAt.current;
      pausedAt.current = null;
      client.resumed();
    }
  }, [paused, client, config]);

  const mand = (choice: string, position: number, input: 'tap' | 'keyboard') => {
    if (!config || stage !== 'mand' || paused) return;
    const lv = MAND_LEVELS[levelRef.current]!;
    let reinforcer: ReinforcerId = 'bolhinhas';
    if (lv.phase === 'sentence') {
      // Tira de frase: o 1º espaço é sempre do QUERO, o 2º do que a criança quer (sem ordem errada).
      const next = choice === 'quero' ? ['quero', strip[1] ?? ''] : [strip[0] ?? '', choice];
      setStrip(next);
      playCue('tap', sound);
      const ready = sentenceReady(next);
      if (!ready) {
        if (choice !== 'quero') announce('Agora toque em QUERO.');
        return;
      }
      reinforcer = ready;
    } else if (lv.phase === 'choice') reinforcer = choice as ReinforcerId;
    clearPrompts();
    setPromptVis('none');
    const latency = since(t0.current);
    const level = prompt.current.source === 'therapist' ? prompt.current.level : mandLevelFrom(delivered.current);
    if (!scored.current) {
      scored.current = true;
      client.responseStarted({ targetId, trialIndex: trialIdx.current, latencyMs: latency, position, inputMode: input });
      client.responseRecorded({
        targetId,
        stimulusId: lv.phase === 'single' ? 'mais' : reinforcer,
        trialIndex: trialIdx.current,
        presented: cards,
        positionOfTarget: lv.phase === 'single' ? 0 : null,
        selected: lv.phase === 'single' ? 'mais' : reinforcer,
        selectedPosition: position,
        response: 'correct',
        latencyMs: latency,
        promptLevel: level,
        promptSource: level === 'N0' ? 'none' : prompt.current.source === 'none' ? 'built_in' : prompt.current.source,
        detail: { phase: lv.phase, round, popped: roundPops.current, selfPopped: selfPopped.current, reinforcer },
      });
      client.emit('REWARD_TRIGGERED', { kind: 'access', contingentOn: targetId });
      client.reinforcerPresented({ kind: 'access', reinforcerId: reinforcer, contingentOn: targetId, intensity: feedback === 'festive' ? 'festive' : 'subtle' });
      levelTrials.current += 1;
      if (level === 'N0') {
        streak.current += 1;
        levelSpont.current += 1;
        setSpontaneous((s) => s + 1);
      } else streak.current = 0;
    }
    trialIdx.current += 1;
    // Eco do pedido (modelo de linguagem) e entrega imediata do reforçador.
    const echo = lv.phase === 'single' ? 'Mais bolhas!' : lv.phase === 'choice' ? `${REINFORCERS[reinforcer].label}!` : `Quero ${REINFORCERS[reinforcer].spoken}!`;
    void speak(echo, sound);
    if (feedback !== 'none') playCue('correct', sound);
    announce(echo);
    setStage('reward');
    const nextRound = round + 1;
    setRound(nextRound);
    if (nextRound >= rounds) {
      later(() => {
        setStage('done');
        client.levelCompleted({ levelId: lv.id, levelIndex: levelRef.current, trialsCompleted: levelTrials.current, correct: levelSpont.current, outcome: 'completed' });
        if (feedback !== 'none') playCue('complete', sound);
        client.gameCompleted(trialIdx.current);
      }, 900);
      return;
    }
    // Subiu de fase?
    const nl = nextMandLevel(levelRef.current, streak.current);
    if (nl !== levelRef.current) {
      client.levelCompleted({ levelId: lv.id, levelIndex: levelRef.current, trialsCompleted: levelTrials.current, correct: levelSpont.current, outcome: 'advanced' });
      levelRef.current = nl;
      streak.current = 0;
      levelTrials.current = 0;
      levelSpont.current = 0;
      setLevelIdx(nl);
      const nlv = MAND_LEVELS[nl]!;
      client.levelStarted({ levelId: nlv.id, levelIndex: nl, fieldSize: nlv.phase === 'choice' ? 2 : 3, trialsPlanned: rounds - nextRound, difficulty: nlv.phase });
      later(() => setBanner(`Nova fase: ${nlv.title}`), 300);
      later(() => setBanner(null), 2000);
    }
    later(() => blow(reinforcer, nextRound), 700);
  };

  /* ------------------------------------------------------------ física e desenho */

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
      bounds.current = { left: 0, top: 70, right: r.width, bottom: r.height };
    };
    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(stage);
    return () => ro?.disconnect();
  }, [config]);

  const popAt = (b: Bubble, auto: boolean) => {
    const n = auto ? 6 : 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const sp = (auto ? 50 : 140) * (0.6 + rnd.current() * 0.8);
      drops.current.push({ x: b.x + Math.cos(a) * b.r * 0.8, y: b.y + Math.sin(a) * b.r * 0.8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.6, hue: b.hue, r: auto ? 2 : 3.5 });
    }
    playTones(POP(auto ? 520 : 600 + ((b.hue / 360) * 500)), sound);
  };

  const checkEmpty = () => {
    if (bubbles.current.length === 0 && queue.current.length === 0 && stage === 'play') openMand();
  };

  useFrameLoop((dt) => {
    clock.current += dt;
    // Sopro: as bolhas saem da varinha uma a uma.
    if (stage === 'blowing' && queue.current.length) {
      emitTimer.current -= dt;
      if (emitTimer.current <= 0) {
        emitTimer.current = 0.16;
        bubbles.current.push(queue.current.shift()!);
        sync();
        if (!queue.current.length) setStage('play');
      }
    }
    if (speedFor > 0) {
      const expired = stepBubbles(bubbles.current, dt, clock.current, bounds.current, speedFor);
      if (expired.length) {
        for (const b of expired) {
          popAt(b, true);
          selfPopped.current += 1;
        }
        bubbles.current = bubbles.current.filter((b) => !expired.includes(b));
        sync();
        checkEmpty();
      }
    }
    for (const b of bubbles.current) {
      stepSpring(b.squash, 1, dt, 300, 10);
      const el = els.current.get(b.id);
      const sq = motion === 'static' ? 1 : Math.max(0.75, Math.min(1.25, b.squash.value));
      if (el) el.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px) scale(${2 - sq}, ${sq})`;
    }
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { right: w, bottom: h } = bounds.current;
    ctx.clearRect(0, 0, w, h + 100);
    drops.current = drops.current.filter((d) => {
      d.life -= dt;
      if (d.life <= 0) return false;
      d.vy += 380 * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${d.hue}, 80%, 70%, ${Math.min(1, d.life / 0.4)})`;
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
  }, !!config && !paused && stage !== 'done');

  // Estático: sem física, o fim das bolhas só vem dos toques.
  useEffect(() => {
    if (stage === 'play') checkEmpty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const tapBubble = (id: string) => {
    if (paused || (stage !== 'play' && stage !== 'blowing')) return;
    const idx = bubbles.current.findIndex((b) => b.id === id);
    const b = bubbles.current[idx];
    if (!b) return;
    if (b.hp > 1) {
      // Bolhona: o primeiro toque só "amassa" (mola) — o segundo divide em bolhinhas.
      b.hp -= 1;
      b.squash.velocity -= 6;
      playTones([{ freq: 180, dur: 0.12, type: 'sine', attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.1, gain: 0.6 }], sound);
      return;
    }
    popAt(b, false);
    bubbles.current.splice(idx, 1);
    if (b.kind === 'giant') bubbles.current.push(...splitGiant(b, rnd.current, scale));
    roundPops.current += 1;
    setPopped((p) => p + 1);
    sync();
    checkEmpty();
  };

  if (!config) return <div className="bm-root" aria-busy="true" />;

  return (
    <div className="bm-root" data-palette={config.adaptation.palette} data-motion={motion} data-stage={stage} style={{ ['--bm-scale' as string]: scale }}>
      <svg className="bm-scene" viewBox="0 0 800 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path d="M0 520c120-40 260-30 400 0s280 30 400-10v90H0z" fill="var(--bm-ground)" />
        <circle cx="700" cy="90" r="46" fill="var(--bm-sun)" opacity=".8" />
      </svg>

      <header className="bm-header">
        <div className="bm-badge" aria-label={`Fase: ${level.title}`}>
          {MAND_LEVELS.map((l, i) => (
            <i key={l.id} data-on={i <= levelIdx} />
          ))}
          <span>{level.title}</span>
        </div>
        <div className="bm-badge" role="progressbar" aria-label="Rodadas" aria-valuemin={0} aria-valuemax={rounds} aria-valuenow={round}>
          <BubbleIcon />
          <strong>{popped}</strong>
          <span className="bm-badge__sep" />
          <span>
            {Math.min(round + 1, rounds)}/{rounds}
          </span>
        </div>
      </header>

      <main ref={stageRef} className="bm-playfield" aria-label="Céu de bolhas">
        <canvas ref={canvasRef} className="bm-canvas" aria-hidden="true" />
        {views.map((b) => (
          <button
            key={b.id}
            ref={(el) => {
              if (el) els.current.set(b.id, el);
              else els.current.delete(b.id);
            }}
            type="button"
            className="bm-bubble"
            data-kind={b.kind}
            style={{ width: b.r * 2, height: b.r * 2, ['--h' as string]: b.hue, transform: `translate(${b.x - b.r}px, ${b.y - b.r}px)` }}
            onPointerDown={() => tapBubble(b.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                tapBubble(b.id);
              }
            }}
            aria-label={b.kind === 'giant' ? 'Estourar a bolhona (dois toques)' : 'Estourar bolha'}
          >
            <span className="bm-bubble-shine" />
          </button>
        ))}
        <div className="bm-wand" data-blowing={stage === 'blowing'} aria-hidden="true">
          <Wand />
        </div>
      </main>

      {stage === 'mand' && (
        <section className="bm-pause-overlay" aria-label="Momento de pedir">
          <p className="bm-cue">{level.cue}</p>
          {level.phase === 'sentence' && (
            <div className="bm-strip" aria-label={`Seu pedido: ${strip.map((s) => CARD_LABEL[s]).join(' ') || 'vazio'}`}>
              {[0, 1].map((i) => (
                <span key={i} className="bm-strip__slot" data-filled={!!strip[i]} data-want={i === 0 ? 'quero' : 'coisa'}>
                  {strip[i] ? <MandCard id={strip[i]!} /> : <span className="bm-strip__ph">{i === 0 ? 'QUERO' : '...'}</span>}
                </span>
              ))}
            </div>
          )}
          <div className="bm-cards" data-n={cards.length}>
            {cards.map((c, i) => (
              <button
                key={c}
                type="button"
                className="bm-mand-btn"
                data-card={c}
                data-pulse={promptVis !== 'none' && (level.phase !== 'sentence' || (c === 'quero' ? !strip[0] : !!strip[0]))}
                data-used={strip.includes(c)}
                onClick={(e) => mand(c, i, e.detail === 0 ? 'keyboard' : 'tap')}
                aria-label={`Pedir: ${CARD_LABEL[c]}`}
              >
                <MandCard id={c} />
                {promptVis === 'model' && i === 0 && (
                  <span className="bm-model-hand" aria-hidden="true">
                    <svg viewBox="0 0 64 64">
                      <path d="M24 34V14a4 4 0 0 1 8 0v16-4a4 4 0 0 1 8 0v4-2a4 4 0 0 1 8 0v4-1a4 4 0 0 1 8 0v13c0 10-7 18-17 18h-3c-7 0-12-4-16-10l-7-11a4 4 0 0 1 6-5z" fill="#fff" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      <p className="bm-sr" aria-live="polite">{live}</p>

      {banner && (
        <div className="bm-banner" aria-hidden="true">
          {banner}
        </div>
      )}

      {(paused || ended) && stage !== 'done' && (
        <div className="bm-pause-overlay bm-pause-overlay--dim" role="status">
          <div className="bm-done-card">Pausa</div>
        </div>
      )}

      {stage === 'done' && (
        <section className="bm-pause-overlay" role="status">
          <div className="bm-done-card">
            <Wand />
            <h2>Que festa de bolhas!</h2>
            <p>
              {popped} bolhas estouradas · {spontaneous} pedidos sozinho
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ ilustrações */

function Wand() {
  return (
    <svg viewBox="0 0 120 160" width="100%" height="100%">
      <path d="M30 150 78 64" stroke="#a8743f" strokeWidth="9" strokeLinecap="round" />
      <path d="M30 150 78 64" stroke="#d9a066" strokeWidth="4" strokeLinecap="round" />
      <circle cx="88" cy="44" r="26" fill="rgb(200 230 255 / 0.35)" stroke="var(--bm-wand)" strokeWidth="8" />
      <circle cx="80" cy="36" r="5" fill="#fff" opacity=".8" />
    </svg>
  );
}

function BubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="rgb(184 224 245 / 0.6)" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="9" r="2" fill="#fff" />
    </svg>
  );
}

function MandCard({ id }: { id: string }) {
  return (
    <span className="bm-card">
      <svg viewBox="0 0 100 80" aria-hidden="true">
        {id === 'mais' && (
          // Sinal de "mais": as pontas dos dedos das duas mãos (fechadas em bico) se tocando.
          <g>
            <g stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" fill="#f2c6a0">
              <rect x="6" y="40" width="24" height="18" rx="6" />
              <path d="M28 34c12 0 20 6 20 15s-8 15-20 15z" />
              <rect x="70" y="40" width="24" height="18" rx="6" />
              <path d="M72 34c-12 0-20 6-20 15s8 15 20 15z" />
            </g>
            <path d="M50 26v-10M42 28l-5-8M58 28l5-8" stroke="#e08ac0" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
        {id === 'quero' && (
          // "Quero": mão aberta puxando para o peito.
          <g stroke="#1e293b" strokeWidth="3" strokeLinejoin="round">
            <circle cx="50" cy="26" r="14" fill="#f2c6a0" />
            <path d="M26 76c0-18 10-30 24-30s24 12 24 30z" fill="#5aa9e6" />
            <path d="M72 56c-8-6-14-2-18 2l-4 4 6 2 12-2" fill="#f2c6a0" />
          </g>
        )}
        {id === 'bolhinhas' &&
          [[30, 40, 12], [52, 28, 10], [70, 46, 14], [44, 58, 9], [62, 22, 7]].map(([cx, cy, r]) => (
            <circle key={cx} cx={cx} cy={cy} r={r} fill="rgb(184 224 245 / 0.7)" stroke="#5aa9e6" strokeWidth="3" />
          ))}
        {id === 'bolhona' && (
          <g>
            <circle cx="50" cy="40" r="32" fill="rgb(242 160 196 / 0.45)" stroke="#d85a8f" strokeWidth="4" />
            <circle cx="38" cy="28" r="7" fill="#fff" opacity=".85" />
          </g>
        )}
      </svg>
      <span>{CARD_LABEL[id]}</span>
    </span>
  );
}

export default Game;
