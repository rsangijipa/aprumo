import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { capturePointer, installAudioUnlock, ladderOutcome, playCue, playTones, seededRandom, speak, useAnnounce, useGameClient, useMotion, type LadderState } from '@aprumo/game-sdk';
import type { PromptSource } from '@aprumo/protocol';
import { SceneArt } from './Scenes';
import {
  checkOrder,
  createStoryLadder,
  LEVEL_STEPS,
  nextMissingStep,
  nextStory,
  sessionLength,
  shuffleSteps,
  startLevelFrom,
  stepStoryLadder,
  type StorySequence,
  type StoryStep,
} from './logic';
import { manifest } from './manifest';
import './game.css';

const SNAP = [{ freq: 660, dur: 0.05, type: 'triangle' as const, attack: 0.005, decay: 0.04, sustain: 0.3, release: 0.08, gain: 0.6 }];
const ORDINAL = ['1º', '2º', '3º', '4º', '5º'];
const since = (t: number) => Math.max(0, Math.round(performance.now() - t));

type Stage = 'intro' | 'play' | 'checking' | 'replay' | 'done';

interface TrialState {
  story: StorySequence;
  pool: StoryStep[];
  slots: (StoryStep | null)[];
  locked: boolean[];
}

interface Drag {
  step: StoryStep;
  pointerId: number;
  startX: number;
  startY: number;
  offX: number;
  offY: number;
  lastX: number;
  tilt: number;
  moved: boolean;
  from: 'pool' | number;
}

export default function HistoriaEmOrdem() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const sound = config?.adaptation.sound ?? 'low';
  const feedback = config?.adaptation.feedback ?? 'subtle';

  const [trial, setTrial] = useState<TrialState | null>(null);
  const [stage, setStage] = useState<Stage>('intro');
  const [level, setLevel] = useState(0);
  const [count, setCount] = useState(0);
  const [hintStep, setHintStep] = useState<number | null>(null);
  const [bounce, setBounce] = useState<string[]>([]);
  const [replayAt, setReplayAt] = useState(-1);
  const [dragging, setDragging] = useState<string | null>(null);
  const [overSlot, setOverSlot] = useState<number | null>(null);
  const [live, announce] = useAnnounce();

  const rnd = useRef(seededRandom(1));
  const ladder = useRef<LadderState>(createStoryLadder(0));
  const used = useRef(new Set<string>());
  const [total, setTotal] = useState(5);
  const totalRef = useRef(5);
  const trialIdx = useRef(0);
  const t0 = useRef(0);
  const responded = useRef(false);
  const scored = useRef(false);
  const prompt = useRef<{ level: string; source: PromptSource }>({ level: 'IND', source: 'none' });
  const startedRun = useRef<string | null>(null);
  const timers = useRef<number[]>([]);
  const slotEls = useRef<(HTMLElement | null)[]>([]);
  const ghost = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const trialRef = useRef<TrialState | null>(null);
  useEffect(() => {
    trialRef.current = trial;
  });

  const targetId = config?.clinical.targets[0]?.targetId ?? 'sequencia-temporal';

  useEffect(() => installAudioUnlock(), []);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const startTrial = useCallback(() => {
    const lv = ladder.current.level;
    const s = nextStory(lv, used.current, rnd.current);
    used.current.add(s.id);
    const pool = shuffleSteps(s.steps, rnd.current);
    const t: TrialState = { story: s, pool, slots: s.steps.map(() => null), locked: s.steps.map(() => false) };
    setTrial(t);
    setLevel(lv);
    setStage('intro');
    setHintStep(null);
    slotEls.current = [];
    scored.current = false;
    responded.current = false;
    prompt.current = { level: 'IND', source: 'none' };
    announce(`${s.title}. Coloque as ${s.steps.length} cenas em ordem.`);
    void speak(s.title, sound);
    later(() => {
      setStage('play');
      t0.current = performance.now();
      const presented = pool.map((p) => p.id);
      client.trialStarted({ targetId, trialIndex: trialIdx.current, presented });
      client.stimulusPresented({ targetId, trialIndex: trialIdx.current, presented, positionOfTarget: pool.findIndex((p) => p.stepNumber === 1), modality: 'visual', instructionId: s.id });
    }, motion === 'static' ? 500 : 1100);
  }, [client, sound, motion, targetId, announce]);

  useEffect(() => {
    if (!config || startedRun.current === config.runId) return;
    startedRun.current = config.runId;
    rnd.current = seededRandom(config.clinical.seed + 3);
    ladder.current = createStoryLadder(startLevelFrom(config.params));
    totalRef.current = sessionLength(config);
    setTotal(totalRef.current);
    client.gameStarted(manifest.version);
    client.levelStarted({ levelId: `historia-${LEVEL_STEPS[ladder.current.level]}-etapas`, levelIndex: ladder.current.level, fieldSize: LEVEL_STEPS[ladder.current.level], trialsPlanned: totalRef.current, difficulty: 'adaptativo' });
    startTrial();
  }, [config, client, startTrial]);

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

  /* ------------------------------------------------------------ dica numérica */

  const giveHint = useCallback(
    (source: Exclude<PromptSource, 'none'>, lvl: string) => {
      const t = trialRef.current;
      if (!t) return;
      const step = nextMissingStep(t.slots);
      setHintStep(step);
      if (prompt.current.source === 'none' || source === 'therapist') prompt.current = { level: lvl, source };
      client.promptPresented({ targetId, trialIndex: trialIdx.current, level: lvl, source, latencyMs: since(t0.current) });
      announce(`Dica: procure a cena ${ORDINAL[step - 1]}.`);
    },
    [client, targetId, announce],
  );

  useEffect(() => {
    if (!config || stage !== 'play' || paused || hintStep != null || scored.current) return;
    const after = config.adaptation.builtInPromptAfterMs;
    if (after == null) return;
    const id = window.setTimeout(() => giveHint('built_in', config.clinical.targets[0]?.promptHierarchy[1]?.code ?? 'NUMBER_HINT'), after);
    return () => window.clearTimeout(id);
  }, [config, stage, paused, hintStep, trial, giveHint]);

  useEffect(
    () =>
      client.onCommand((c) => {
        if (c.kind !== 'SET_PROMPT') return;
        if (c.level === 'IND') prompt.current = { level: 'IND', source: 'none' };
        else giveHint('therapist', c.level);
      }),
    [client, giveHint],
  );

  /* ------------------------------------------------------------ avaliação */

  const finishTrial = useCallback(
    (t: TrialState) => {
      setStage('replay');
      if (feedback !== 'none') playCue('reinforce', sound);
      client.reinforcerPresented({ kind: 'animation', contingentOn: targetId, intensity: feedback === 'festive' ? 'festive' : 'subtle' });
      // Replay: a história "acontece" cena a cena, narrada.
      const step = motion === 'static' ? 900 : 1300;
      t.story.steps.forEach((s, i) => {
        later(() => {
          setReplayAt(i);
          playTones([{ freq: 392 + i * 66, dur: 0.12, type: 'triangle', attack: 0.02, decay: 0.06, sustain: 0.5, release: 0.2 }], sound);
          void speak(s.label, sound);
        }, i * step);
      });
      later(() => {
        setReplayAt(-1);
        const n = count + 1;
        setCount(n);
        if (n >= totalRef.current) {
          setStage('done');
          client.levelCompleted({ levelId: `historia-${LEVEL_STEPS[ladder.current.level]}-etapas`, levelIndex: ladder.current.level, trialsCompleted: n, correct: ladder.current.history.filter((h) => h !== 'error').length, outcome: 'completed' });
          if (feedback !== 'none') playCue('complete', sound);
          announce('Você organizou todas as histórias!');
          client.gameCompleted(trialIdx.current);
        } else startTrial();
      }, t.story.steps.length * step + 600);
    },
    [client, feedback, sound, motion, count, startTrial, targetId, announce],
  );

  const evaluate = useCallback(
    (t: TrialState) => {
      const placed = t.slots as StoryStep[];
      const res = checkOrder(placed);
      if (!scored.current) {
        scored.current = true;
        const prompted = prompt.current.source !== 'none';
        client.responseRecorded({
          targetId,
          stimulusId: t.story.id,
          trialIndex: trialIdx.current,
          presented: t.pool.map((p) => p.id),
          positionOfTarget: t.pool.findIndex((p) => p.stepNumber === 1),
          selected: placed[0]!.id,
          selectedPosition: t.pool.findIndex((p) => p.id === placed[0]!.id),
          response: res.correct ? 'correct' : 'incorrect',
          latencyMs: since(t0.current),
          promptLevel: prompt.current.level,
          promptSource: prompt.current.source,
          detail: { story: t.story.id, steps: t.story.steps.length, order: placed.map((p) => p.stepNumber), correctPrefix: res.correctPrefix, slotsCorrect: res.slots.filter(Boolean).length },
        });
        trialIdx.current += 1;
        const before = ladder.current.level;
        ladder.current = stepStoryLadder(ladder.current, ladderOutcome(res.correct ? 'correct' : 'incorrect', prompted));
        if (ladder.current.level !== before) {
          client.levelCompleted({ levelId: `historia-${LEVEL_STEPS[before]}-etapas`, levelIndex: before, trialsCompleted: trialIdx.current, correct: ladder.current.history.filter((h) => h !== 'error').length, outcome: ladder.current.moved === 'up' ? 'advanced' : 'repeated' });
          client.levelStarted({ levelId: `historia-${LEVEL_STEPS[ladder.current.level]}-etapas`, levelIndex: ladder.current.level, fieldSize: LEVEL_STEPS[ladder.current.level], trialsPlanned: totalRef.current, difficulty: ladder.current.moved === 'up' ? 'subiu' : 'desceu' });
        }
        if (res.correct) client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: targetId });
      }
      if (res.correct) {
        announce('Certinho! Veja a história.');
        finishTrial(t);
        return;
      }
      // Correção: cartas certas travam; as outras voltam com um quique.
      playCue('retry', sound);
      const wrong = placed.filter((_, i) => !res.slots[i]).map((p) => p.id);
      setBounce(wrong);
      const ok = res.slots.filter(Boolean).length;
      announce(ok === 0 ? 'Vamos tentar de novo! As cenas voltaram.' : `Quase! ${ok} ${ok === 1 ? 'cena está' : 'cenas estão'} no lugar. As outras voltaram.`);
      later(() => {
        setBounce([]);
        setTrial((cur) => (cur ? { ...cur, slots: cur.slots.map((s, i) => (res.slots[i] ? s : null)), locked: res.slots.map((ok, i) => ok || cur.locked[i]!) } : cur));
        setStage('play');
      }, motion === 'static' ? 300 : 700);
    },
    [client, targetId, sound, motion, finishTrial, announce],
  );

  const place = useCallback(
    (step: StoryStep, slotIdx: number | null, input: 'tap' | 'drag' | 'keyboard') => {
      const t = trialRef.current;
      if (!t || stage !== 'play' || paused) return;
      const target = slotIdx ?? t.slots.findIndex((s) => s == null);
      if (target < 0 || t.locked[target]) return;
      if (!responded.current) {
        responded.current = true;
        client.responseStarted({ targetId, trialIndex: trialIdx.current, latencyMs: since(t0.current), position: t.pool.findIndex((p) => p.id === step.id), inputMode: input });
      }
      const slots = t.slots.map((s) => (s?.id === step.id ? null : s));
      // Se o slot estava ocupado (troca por arraste), a carta que estava lá volta sozinha ao monte.
      slots[target] = step;
      playTones(SNAP, sound);
      setHintStep(null);
      const next = { ...t, slots };
      setTrial(next);
      announce(`${step.label} na posição ${ORDINAL[target]}.`);
      if (slots.every(Boolean)) {
        setStage('checking');
        later(() => evaluate(next), 380);
      }
    },
    [stage, paused, client, targetId, sound, evaluate, announce],
  );

  const unplace = (slotIdx: number) => {
    const t = trialRef.current;
    if (!t || stage !== 'play' || paused || t.locked[slotIdx] || !t.slots[slotIdx]) return;
    playCue('tap', sound);
    setTrial({ ...t, slots: t.slots.map((s, i) => (i === slotIdx ? null : s)) });
  };

  /* ------------------------------------------------------------ arrastar */

  const slotAt = (x: number, y: number): number | null => {
    for (let i = 0; i < slotEls.current.length; i++) {
      const r = slotEls.current[i]?.getBoundingClientRect();
      if (r && x >= r.left - 12 && x <= r.right + 12 && y >= r.top - 12 && y <= r.bottom + 12) return i;
    }
    return null;
  };

  const onCardDown = (e: PointerEvent<HTMLButtonElement>, step: StoryStep, from: 'pool' | number) => {
    if (stage !== 'play' || paused || e.button > 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    capturePointer(e.currentTarget, e.pointerId);
    drag.current = { step, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, offX: e.clientX - r.left, offY: e.clientY - r.top, lastX: e.clientX, tilt: 0, moved: false, from };
    if (ghost.current) {
      ghost.current.style.width = `${r.width}px`;
      ghost.current.style.height = `${r.height}px`;
    }
  };
  const onCardMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 8) return;
    if (!d.moved) {
      d.moved = true;
      setDragging(d.step.id);
    }
    // Inclinação proporcional à velocidade horizontal, suavizada (sensação de peso).
    const vx = e.clientX - d.lastX;
    d.lastX = e.clientX;
    d.tilt = d.tilt * 0.75 + Math.max(-14, Math.min(14, vx * 0.9)) * 0.25;
    const root = ghost.current?.parentElement?.getBoundingClientRect();
    if (ghost.current && root) {
      ghost.current.style.transform = `translate(${e.clientX - root.left - d.offX}px, ${e.clientY - root.top - d.offY}px) rotate(${motion === 'static' ? 0 : d.tilt}deg) scale(1.06)`;
    }
    setOverSlot(slotAt(e.clientX, e.clientY));
  };
  const onCardUp = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    setDragging(null);
    setOverSlot(null);
    if (!d.moved) {
      if (d.from === 'pool') place(d.step, null, 'tap');
      else unplace(d.from);
      return;
    }
    const s = slotAt(e.clientX, e.clientY);
    if (s != null) place(d.step, s, 'drag');
    else if (d.from !== 'pool') unplace(d.from);
  };

  if (!config || !trial) return <div className="heo" aria-busy="true" />;
  const placedIds = new Set(trial.slots.filter(Boolean).map((s) => s!.id));
  const dragStep = dragging ? trial.story.steps.find((s) => s.id === dragging) : null;
  const steps = trial.story.steps.length;

  return (
    <div
      className="heo"
      data-palette={config.adaptation.palette}
      data-motion={motion}
      data-stage={stage}
      style={{ ['--heo-scale' as string]: config.adaptation.touchScale, ['--heo-n' as string]: steps }}
    >
      <header className="heo-head">
        <div className="heo-level" aria-label={`Histórias de ${steps} cenas`}>
          {LEVEL_STEPS.map((n, i) => (
            <span key={n} data-on={i === level}>
              {n}
            </span>
          ))}
        </div>
        <h1 className="heo-title">{trial.story.title}</h1>
        <div className="heo-count" aria-label={`História ${Math.min(count + 1, total)} de ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <i key={i} data-on={i < count} />
          ))}
        </div>
      </header>

      <ol className="heo-timeline" aria-label="Linha do tempo da história">
        {trial.slots.map((s, i) => (
          <li
            key={i}
            ref={(el) => {
              slotEls.current[i] = el;
            }}
            className="heo-slot"
            data-over={overSlot === i}
            data-locked={trial.locked[i]}
            data-hint={hintStep === i + 1 && !s}
            data-replay={replayAt === i}
          >
            <span className="heo-slot__num" aria-hidden="true">
              {ORDINAL[i]}
            </span>
            {i < steps - 1 && <span className="heo-slot__arrow" aria-hidden="true" />}
            {s ? (
              <button
                type="button"
                className="heo-card heo-card--placed"
                data-bounce={bounce.includes(s.id)}
                data-ghosted={dragging === s.id}
                disabled={trial.locked[i] || stage !== 'play'}
                onPointerDown={(e) => onCardDown(e, s, i)}
                onPointerMove={onCardMove}
                onPointerUp={onCardUp}
                onPointerCancel={onCardUp}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Backspace' || e.key === 'Delete') {
                    e.preventDefault();
                    unplace(i);
                  }
                }}
                aria-label={`${ORDINAL[i]}: ${s.label}${trial.locked[i] ? ', no lugar certo' : '. Toque para tirar'}`}
              >
                <SceneArt scene={s.scene} label={s.label} />
                <span className="heo-card__label">{s.label}</span>
              </button>
            ) : (
              <span className="heo-slot__empty">{hintStep === i + 1 ? 'Esta vem agora' : ''}</span>
            )}
          </li>
        ))}
      </ol>

      <div className="heo-pool" role="group" aria-label="Cenas para ordenar. Toque para colocar na próxima posição ou arraste.">
        {trial.pool.map((step, i) => {
          const placed = placedIds.has(step.id);
          return (
            <div key={step.id} className="heo-pool__spot" style={{ ['--heo-i' as string]: i }}>
              {!placed && (
                <button
                  type="button"
                  className="heo-card"
                  data-hint={hintStep === step.stepNumber}
                  data-ghosted={dragging === step.id}
                  disabled={stage !== 'play'}
                  onPointerDown={(e) => onCardDown(e, step, 'pool')}
                  onPointerMove={onCardMove}
                  onPointerUp={onCardUp}
                  onPointerCancel={onCardUp}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      place(step, null, 'keyboard');
                    }
                  }}
                  aria-label={`Cena: ${step.label}`}
                >
                  <SceneArt scene={step.scene} label={step.label} />
                  <span className="heo-card__label">{step.label}</span>
                  {hintStep === step.stepNumber && <span className="heo-card__badge">{ORDINAL[step.stepNumber - 1]}</span>}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div ref={ghost} className="heo-ghost" data-on={!!dragStep} aria-hidden="true">
        {dragStep && (
          <div className="heo-card heo-card--ghost">
            <SceneArt scene={dragStep.scene} label={dragStep.label} />
            <span className="heo-card__label">{dragStep.label}</span>
          </div>
        )}
      </div>

      <p className="heo-sr" aria-live="polite">{live}</p>

      {(paused || ended) && stage !== 'done' && (
        <div className="heo-overlay" role="status">
          <div className="heo-overlay__badge">Pausa</div>
        </div>
      )}
      {stage === 'done' && (
        <div className="heo-overlay heo-overlay--done" role="status">
          <div className="heo-overlay__badge">
            <span className="heo-book" aria-hidden="true">
              <svg viewBox="0 0 80 60">
                <path d="M40 10C30 4 14 4 4 8v44c10-4 26-4 36 2 10-6 26-6 36-2V8C66 4 50 4 40 10z" fill="#fff" stroke="#3b3340" strokeWidth="3" strokeLinejoin="round" />
                <path d="M40 10v44" stroke="#3b3340" strokeWidth="3" />
                <path d="M12 18h20M12 26h20M12 34h16M48 18h20M48 26h20M48 34h16" stroke="#c9b6d9" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            Você contou todas as histórias!
          </div>
        </div>
      )}
    </div>
  );
}
