import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { installAudioUnlock, playCue, playTones, seededRandom, speak, useAnnounce, useFrameLoop, useGameClient, useMotion, type GameClient } from '@aprumo/game-sdk';
import type { SessionConfig } from '@aprumo/protocol';
import { Battery, Bip, Drop, ShapeCard, type BipMood } from './Art';
import {
  CORSI_LAYOUT,
  correctTrayFor,
  evaluateGoNoGo,
  evaluateSequence,
  fallTimeMs,
  initialCorsi,
  makeSequence,
  nextGravity,
  planCircuit,
  STATION_TITLE,
  stepCorsi,
  TRAYS,
  type CorsiState,
  type ExecutiveChallengeType,
  type GoNoGoTrial,
  type RuleShiftTrial,
} from './logic';
import { manifest } from './manifest';
import './game.css';

const PAD_FREQS = [392, 440, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880];
const since = (t: number) => Math.max(0, Math.round(performance.now() - t));

interface StationProps {
  client: GameClient;
  config: SessionConfig;
  motion: 'full' | 'reduced' | 'static';
  paused: boolean;
  trialIdx: { current: number };
  setMood: (m: BipMood) => void;
  announce: (t: string) => void;
  onDone: (s: { trials: number; correct: number; summary: string }) => void;
}

export default function CircuitoExecutivo() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const plan = useMemo(() => (config ? planCircuit(config) : null), [config]);
  const sound = config?.adaptation.sound ?? 'low';

  const [stationIdx, setStationIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const [mood, setMood] = useState<BipMood>('idle');
  const [summaries, setSummaries] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [live, announce] = useAnnounce();
  const trialIdx = useRef(0);
  const startedRun = useRef<string | null>(null);

  useEffect(() => installAudioUnlock(), []);

  const station = plan?.stations[stationIdx];

  const intro = useCallback(
    (st: ExecutiveChallengeType) => {
      const text =
        st === 'gonogo'
          ? 'Ajude o Bip a pegar energia! Toque nas baterias. Não toque nas gotas de água!'
          : st === 'ruleshift'
            ? 'Vamos separar as cartas. Primeiro, pelo jogo da COR.'
            : 'Observe as luzes que o Bip acende. Depois, toque nelas na mesma ordem.';
      announce(`${STATION_TITLE[st]}. ${text}`);
      void speak(text, sound);
    },
    [announce, sound],
  );

  useEffect(() => {
    if (!config || !plan || startedRun.current === config.runId) return;
    startedRun.current = config.runId;
    client.gameStarted(manifest.version);
    const st = plan.stations[0]!;
    client.levelStarted({ levelId: `circuito-${st}`, levelIndex: 0, fieldSize: st === 'workingmemory' ? 9 : 2, trialsPlanned: st === 'gonogo' ? plan.gonogo.length : st === 'ruleshift' ? plan.ruleshift.length : 14, difficulty: st });
    intro(st);
  }, [config, plan, client, intro]);

  const pausedAt = useRef<number | null>(null);
  useEffect(() => {
    if (!config) return;
    if (paused) {
      pausedAt.current = performance.now();
      client.paused();
    } else if (pausedAt.current != null) {
      pausedAt.current = null;
      client.resumed();
    }
  }, [paused, client, config]);

  const onStationDone = (s: { trials: number; correct: number; summary: string }) => {
    if (!plan || !station) return;
    client.levelCompleted({ levelId: `circuito-${station}`, levelIndex: stationIdx, trialsCompleted: s.trials, correct: s.correct, outcome: 'completed' });
    client.reinforcerPresented({ kind: 'animation', contingentOn: `circuito-${station}`, intensity: config?.adaptation.feedback === 'festive' ? 'festive' : 'subtle' });
    if (config?.adaptation.feedback !== 'none') playCue('reinforce', sound);
    setSummaries((x) => [...x, `${STATION_TITLE[station]}: ${s.summary}`]);
    setMood('happy');
    setReady(false);
    const next = stationIdx + 1;
    if (next >= plan.stations.length) {
      setDone(true);
      announce('Circuito completo!');
      if (config?.adaptation.feedback !== 'none') playCue('complete', sound);
      client.gameCompleted(trialIdx.current);
      return;
    }
    const st = plan.stations[next]!;
    setStationIdx(next);
    client.levelStarted({ levelId: `circuito-${st}`, levelIndex: next, fieldSize: st === 'workingmemory' ? 9 : 2, trialsPlanned: st === 'ruleshift' ? plan.ruleshift.length : 14, difficulty: st });
    intro(st);
  };

  if (!config || !plan || !station) return <main className="circ-root" aria-busy="true" />;

  const props: StationProps = { client, config, motion, paused: paused || ended, trialIdx, setMood, announce, onDone: onStationDone };

  return (
    <main className="circ-root" data-palette={config.adaptation.palette} data-motion={motion} style={{ ['--circ-scale' as string]: config.adaptation.touchScale }}>
      <header className="circ-header">
        <div className="circ-bip">
          <Bip mood={mood} />
        </div>
        <ol className="circ-map" aria-label="Estações do circuito">
          {plan.stations.map((s, i) => (
            <li key={s} data-state={i < stationIdx || done ? 'done' : i === stationIdx ? 'now' : 'next'}>
              <span className="circ-map__node" aria-hidden="true">
                {i + 1}
              </span>
              <span className="circ-map__label">{STATION_TITLE[s]}</span>
            </li>
          ))}
        </ol>
      </header>

      <section className="circ-arena" aria-label={STATION_TITLE[station]}>
        {!ready && !done ? (
          <div className="circ-ready">
            <h1>{STATION_TITLE[station]}</h1>
            <StationHelp st={station} />
            <button type="button" className="circ-go" onClick={() => setReady(true)} autoFocus>
              Começar
            </button>
          </div>
        ) : done ? (
          <div className="circ-ready">
            <h1>Circuito completo!</h1>
            <ul className="circ-summary">
              {summaries.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ) : station === 'gonogo' ? (
          <GoNoGoStation key="gn" {...props} trials={plan.gonogo} />
        ) : station === 'ruleshift' ? (
          <RuleShiftStation key="rs" {...props} trials={plan.ruleshift} />
        ) : (
          <CorsiStation key="cs" {...props} start={plan.corsiStart} seed={plan.seed} />
        )}
      </section>

      <p className="circ-sr" aria-live="polite">{live}</p>

      {(paused || ended) && !done && (
        <div className="circ-overlay" role="status">
          <div className="circ-overlay__card">Pausa</div>
        </div>
      )}
    </main>
  );
}

function StationHelp({ st }: { st: ExecutiveChallengeType }) {
  if (st === 'gonogo')
    return (
      <div className="circ-help">
        <span className="circ-help__item">
          <span className="circ-help__art"><Battery /></span> Toque!
        </span>
        <span className="circ-help__item">
          <span className="circ-help__art"><Drop /></span> Não toque!
        </span>
      </div>
    );
  if (st === 'ruleshift')
    return (
      <div className="circ-help">
        {TRAYS.map((t) => (
          <span key={t.color} className="circ-help__art circ-help__art--card">
            <ShapeCard color={t.color} shape={t.shape} />
          </span>
        ))}
      </div>
    );
  return <p className="circ-help__text">Olhe as luzes acenderem e repita a ordem.</p>;
}

/* ------------------------------------------------------------ 1. Go / No-Go com gravidade */

function GoNoGoStation({ client, config, motion, paused, trialIdx, setMood, announce, onDone, trials }: StationProps & { trials: GoNoGoTrial[] }) {
  const sound = config.adaptation.sound;
  const [i, setI] = useState(0);
  const [falling, setFalling] = useState(false);
  const [flash, setFlash] = useState<'hit' | 'fa' | null>(null);
  const [energy, setEnergy] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLButtonElement>(null);
  const body = useRef({ y: -60, vy: 0 });
  const gravity = useRef(motion === 'full' ? 520 : 380);
  const t0 = useRef(0);
  const resolved = useRef(false);
  const stats = useRef({ trials: 0, correct: 0, hits: 0, misses: 0, fa: 0, ci: 0, rts: [] as number[] });
  const targetId = `circuito-gonogo`;
  const trial = trials[i];

  const spawn = useCallback(() => {
    if (!trial) return;
    body.current = { y: -60, vy: 0 };
    resolved.current = false;
    t0.current = performance.now();
    setFalling(true);
    setMood('think');
    client.trialStarted({ targetId, trialIndex: trialIdx.current, presented: [trial.type] });
    client.stimulusPresented({ targetId, trialIndex: trialIdx.current, presented: [trial.type], positionOfTarget: trial.lane, modality: 'visual' });
  }, [trial, client, trialIdx, setMood, targetId]);

  useEffect(() => {
    if (paused || !trial) return;
    const id = window.setTimeout(spawn, i === 0 ? 700 : 650);
    return () => window.clearTimeout(id);
  }, [i, paused, spawn, trial]);

  const resolve = (didTap: boolean) => {
    if (!trial || resolved.current) return;
    resolved.current = true;
    const ev = evaluateGoNoGo(trial.type, didTap);
    const rt = didTap ? since(t0.current) : null;
    const s = stats.current;
    s.trials += 1;
    if (ev.isCorrect) s.correct += 1;
    if (ev.outcome === 'hit') {
      s.hits += 1;
      s.rts.push(rt!);
    }
    if (ev.outcome === 'miss') s.misses += 1;
    if (ev.outcome === 'false_alarm') s.fa += 1;
    if (ev.outcome === 'correct_inhibition') s.ci += 1;
    const height = (boardRef.current?.clientHeight ?? 400) - 90;
    client.responseRecorded({
      targetId,
      stimulusId: trial.type,
      trialIndex: trialIdx.current,
      presented: [trial.type],
      positionOfTarget: trial.lane,
      selected: didTap ? 'tap' : 'withhold',
      selectedPosition: didTap ? trial.lane : null,
      response: ev.isCorrect ? 'correct' : 'incorrect',
      latencyMs: rt,
      promptLevel: 'IND',
      promptSource: 'none',
      detail: { outcome: ev.outcome, type: trial.type, gravity: gravity.current, windowMs: fallTimeMs(height, gravity.current), lane: trial.lane },
    });
    trialIdx.current += 1;
    gravity.current = nextGravity(gravity.current, ev.isCorrect);
    if (ev.outcome === 'hit') {
      setFlash('hit');
      setEnergy((e) => e + 1);
      playTones([{ freq: 880, dur: 0.06, type: 'triangle' }, { freq: 1318.5, dur: 0.1, delay: 0.06, type: 'triangle' }], sound);
      setMood('happy');
    } else if (ev.outcome === 'false_alarm') {
      setFlash('fa');
      playCue('retry', sound);
      setMood('oops');
      announce('Ops! Era água. Deixe a gota passar.');
    } else if (ev.outcome === 'correct_inhibition') {
      setMood('happy');
    } else setMood('idle');
    setFalling(false);
    window.setTimeout(() => setFlash(null), 350);
    if (i + 1 >= trials.length) {
      const avg = s.rts.length ? Math.round(s.rts.reduce((a, b) => a + b, 0) / s.rts.length) : 0;
      window.setTimeout(() => onDone({ trials: s.trials, correct: s.correct, summary: `${s.hits} baterias, ${s.ci} gotas evitadas, ${s.fa} toques na água${avg ? `, ${avg} ms em média` : ''}` }), 600);
    } else setI(i + 1);
  };

  // Teclado/acionador: Espaço ou Enter "pega" o item que está caindo (sem precisar de foco).
  const resolveRef = useRef(resolve);
  useEffect(() => {
    resolveRef.current = resolve;
  });
  useEffect(() => {
    if (!falling) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      resolveRef.current(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [falling]);

  useFrameLoop((dt) => {
    const el = itemRef.current;
    const board = boardRef.current;
    if (!el || !board || !falling) return;
    const b = body.current;
    const floor = board.clientHeight - 90;
    if (motion === 'static') {
      // Sem movimento: o item aparece parado no meio pelo mesmo tempo da queda.
      if (b.y < 0) b.y = floor * 0.45;
      if (performance.now() - t0.current > fallTimeMs(floor + 60, gravity.current)) resolve(false);
    } else {
      b.vy += gravity.current * dt;
      b.y += b.vy * dt;
      if (b.y >= floor) resolve(false);
    }
    el.style.transform = `translate(-50%, ${b.y}px) rotate(${Math.sin(b.y / 40) * 6}deg)`;
  }, falling && !paused);

  return (
    <div className="circ-gn" ref={boardRef} data-flash={flash}>
      <div className="circ-gn__lanes" aria-hidden="true">
        {Array.from({ length: 5 }, (_, k) => (
          <span key={k} />
        ))}
      </div>
      {falling && trial && (
        <button
          ref={itemRef}
          type="button"
          className="circ-gn__item"
          data-type={trial.type}
          style={{ left: `${10 + trial.lane * 20}%` }}
          onPointerDown={() => resolve(true)}
          aria-label={trial.type === 'go' ? 'Bateria: toque para pegar' : 'Gota de água: não toque'}
        >
          {trial.type === 'go' ? <Battery /> : <Drop />}
        </button>
      )}
      <div className="circ-gn__floor" aria-hidden="true">
        <div className="circ-energy" role="progressbar" aria-label="Energia do Bip" aria-valuemin={0} aria-valuemax={trials.filter((t) => t.type === 'go').length} aria-valuenow={energy}>
          <span style={{ width: `${(energy / Math.max(1, trials.filter((t) => t.type === 'go').length)) * 100}%` }} />
        </div>
      </div>
      <p className="circ-gn__count">
        {Math.min(i + 1, trials.length)}/{trials.length}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ 2. Troca de regra (DCCS) */

function RuleShiftStation({ client, config, paused, trialIdx, setMood, announce, onDone, trials }: StationProps & { trials: RuleShiftTrial[] }) {
  const sound = config.adaptation.sound;
  const [i, setI] = useState(0);
  const [moving, setMoving] = useState<0 | 1 | null>(null);
  const [ruleBanner, setRuleBanner] = useState<string | null>('cor');
  const t0 = useRef(0);
  const stats = useRef({ trials: 0, correct: 0, byPhase: {} as Record<string, { n: number; ok: number }>, persev: 0 });
  const trial = trials[i];
  const targetId = 'circuito-regras';

  // Mudou de fase: anuncia a regra (sem feedback de certo/errado, como no DCCS clássico).
  const phase = trial?.phase;
  useEffect(() => {
    if (!phase) return;
    const text = phase === 'color' ? 'Jogo da COR: laranja aqui, azul ali.' : phase === 'shape' ? 'Agora mudou! Jogo da FORMA: engrenagem aqui, raio ali.' : 'Jogo misto: carta com moldura preta é pela FORMA; sem moldura, pela COR.';
    setRuleBanner(phase === 'color' ? 'COR' : phase === 'shape' ? 'FORMA' : 'MISTO');
    announce(text);
    void speak(text, sound);
    if (phase !== 'color') playTones([{ freq: 440, dur: 0.1, type: 'sine' }, { freq: 880, dur: 0.2, delay: 0.1, type: 'sine' }], sound);
    const id = window.setTimeout(() => setRuleBanner(null), 2400);
    return () => window.clearTimeout(id);
  }, [phase, sound, announce]);

  useEffect(() => {
    if (!trial || paused || ruleBanner) return;
    t0.current = performance.now();
    setMood('think');
    const presented = ['laranja-engrenagem', 'azul-raio'];
    client.trialStarted({ targetId, trialIndex: trialIdx.current, presented });
    client.stimulusPresented({ targetId, trialIndex: trialIdx.current, presented, positionOfTarget: trial.correctTray, modality: 'visual_auditory', instructionId: trial.activeRule });
  }, [i, trial, paused, ruleBanner, client, trialIdx, setMood]);

  const choose = (tray: 0 | 1) => {
    if (!trial || paused || moving != null || ruleBanner) return;
    const ok = tray === trial.correctTray;
    // Perseveração: na fase da forma, escolher pela regra antiga (cor).
    const persev = trial.activeRule === 'shape' && !ok && tray === correctTrayFor(trial.card, 'color');
    const s = stats.current;
    s.trials += 1;
    if (ok) s.correct += 1;
    if (persev) s.persev += 1;
    const ph = (s.byPhase[trial.phase] ??= { n: 0, ok: 0 });
    ph.n += 1;
    if (ok) ph.ok += 1;
    client.responseRecorded({
      targetId,
      stimulusId: `${trial.card.color}-${trial.card.shape}`,
      trialIndex: trialIdx.current,
      presented: ['laranja-engrenagem', 'azul-raio'],
      positionOfTarget: trial.correctTray,
      selected: tray === 0 ? 'laranja-engrenagem' : 'azul-raio',
      selectedPosition: tray,
      response: ok ? 'correct' : 'incorrect',
      latencyMs: since(t0.current),
      promptLevel: 'IND',
      promptSource: 'none',
      detail: { phase: trial.phase, rule: trial.activeRule, border: trial.card.border, perseverative: persev },
    });
    trialIdx.current += 1;
    // Retorno neutro (mesmo som para certo e errado): mede a flexibilidade sem ensinar no meio do teste.
    playTones([{ freq: 660, dur: 0.06, type: 'triangle', gain: 0.6 }], sound);
    setMoving(tray);
    window.setTimeout(() => {
      setMoving(null);
      if (i + 1 >= trials.length) {
        const parts = Object.entries(s.byPhase).map(([k, v]) => `${k === 'color' ? 'cor' : k === 'shape' ? 'forma' : 'misto'} ${v.ok}/${v.n}`);
        onDone({ trials: s.trials, correct: s.correct, summary: `${parts.join(', ')}${s.persev ? `, ${s.persev} perseverações` : ''}` });
      } else setI(i + 1);
    }, 520);
  };

  if (!trial) return null;
  return (
    <div className="circ-rs">
      <div className="circ-rs__rule" data-rule={trial.activeRule}>
        {ruleBanner ? `Jogo da ${ruleBanner}` : trial.phase === 'mixed' ? (trial.card.border ? 'Moldura: FORMA' : 'Sem moldura: COR') : trial.activeRule === 'color' ? 'Jogo da COR' : 'Jogo da FORMA'}
      </div>
      <div className="circ-rs__deck">
        {!ruleBanner && (
          <span key={trial.id} className="circ-rs__card" data-to={moving ?? 'none'} aria-label={`Carta ${trial.card.color} com ${trial.card.shape}${trial.card.border ? ', com moldura' : ''}`} role="img">
            <ShapeCard {...trial.card} />
          </span>
        )}
      </div>
      <div className="circ-rs__trays">
        {TRAYS.map((t, k) => (
          <button key={t.color} type="button" className="circ-rs__tray" onClick={() => choose(k as 0 | 1)} disabled={!!ruleBanner} aria-label={`Bandeja ${k + 1}: ${t.color} com ${t.shape}`}>
            <span className="circ-rs__target">
              <ShapeCard color={t.color} shape={t.shape} />
            </span>
          </button>
        ))}
      </div>
      <p className="circ-gn__count">
        {i + 1}/{trials.length}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ 3. Corsi */

function CorsiStation({ client, config, paused, trialIdx, setMood, announce, onDone, start, seed }: StationProps & { start: number; seed: number }) {
  const sound = config.adaptation.sound;
  const rnd = useRef(seededRandom(seed + 77));
  const [state, setState] = useState<CorsiState>(() => initialCorsi(start));
  const [seq, setSeq] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [demo, setDemo] = useState(true);
  const [input, setInput] = useState<number[]>([]);
  const [mark, setMark] = useState<'ok' | 'no' | null>(null);
  const t0 = useRef(0);
  const firstTap = useRef(false);
  const correctCount = useRef(0);
  const timers = useRef<number[]>([]);
  const targetId = 'circuito-memoria';
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const runTrial = useCallback(
    (span: number) => {
      const s = makeSequence(span, rnd.current);
      setSeq(s);
      setInput([]);
      setDemo(true);
      setMark(null);
      setMood('think');
      const presented = s.map((n) => `luz-${n + 1}`);
      client.trialStarted({ targetId, trialIndex: trialIdx.current, presented });
      client.stimulusPresented({ targetId, trialIndex: trialIdx.current, presented, positionOfTarget: s[0]!, modality: 'visual_auditory' });
      announce(`Observe ${span} luzes.`);
      s.forEach((n, k) => {
        timers.current.push(window.setTimeout(() => {
          setLit(n);
          playTones([{ freq: PAD_FREQS[n]!, dur: 0.25, type: 'sine', attack: 0.02, decay: 0.08, sustain: 0.5, release: 0.15 }], sound);
        }, 700 + k * 800));
        timers.current.push(window.setTimeout(() => setLit(null), 700 + k * 800 + 500));
      });
      timers.current.push(
        window.setTimeout(() => {
          setDemo(false);
          t0.current = performance.now();
          firstTap.current = false;
          announce('Sua vez! Toque as luzes na mesma ordem.');
        }, 700 + s.length * 800),
      );
    },
    [client, trialIdx, sound, setMood, announce],
  );

  const span = state.span;
  const finished = state.done;
  useEffect(() => {
    if (paused || finished) return;
    runTrial(span);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.trials, paused]);

  const tap = (n: number) => {
    if (demo || paused || mark) return;
    if (!firstTap.current) {
      firstTap.current = true;
      client.responseStarted({ targetId, trialIndex: trialIdx.current, latencyMs: since(t0.current), position: n, inputMode: 'tap' });
    }
    playTones([{ freq: PAD_FREQS[n]!, dur: 0.18, type: 'sine' }], sound);
    setLit(n);
    window.setTimeout(() => setLit((l) => (l === n ? null : l)), 220);
    const next = [...input, n];
    setInput(next);
    const ev = evaluateSequence(seq, next);
    if (ev.isCorrect && !ev.isComplete) return;
    const ok = ev.isCorrect && ev.isComplete;
    client.responseRecorded({
      targetId,
      stimulusId: `span-${seq.length}`,
      trialIndex: trialIdx.current,
      presented: seq.map((x) => `luz-${x + 1}`),
      positionOfTarget: seq[0]!,
      selected: next.map((x) => `luz-${x + 1}`).join('>'),
      selectedPosition: next[0]!,
      response: ok ? 'correct' : 'incorrect',
      latencyMs: since(t0.current),
      promptLevel: 'IND',
      promptSource: 'none',
      detail: { span: seq.length, sequence: seq, input: next, errorAt: ok ? null : next.length - 1 },
    });
    trialIdx.current += 1;
    setMark(ok ? 'ok' : 'no');
    setMood(ok ? 'happy' : 'oops');
    if (ok) {
      correctCount.current += 1;
      playCue('correct', sound);
    } else playCue('retry', sound);
    const ns = stepCorsi(state, ok);
    window.setTimeout(() => {
      if (ns.done) onDone({ trials: ns.trials, correct: correctCount.current, summary: `maior sequência ${ns.bestSpan || '—'}` });
      else setState(ns);
    }, 1100);
  };

  return (
    <div className="circ-cs" data-mark={mark}>
      <p className="circ-cs__status">{demo ? `Observe… (${span} luzes)` : mark === 'ok' ? 'Isso!' : mark === 'no' ? 'Ops! Vamos de novo.' : `Sua vez: ${input.length}/${seq.length}`}</p>
      <div className="circ-cs__board">
        <svg className="circ-cs__wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {CORSI_LAYOUT.slice(1).map(([x, y], k) => (
            <path key={k} d={`M${CORSI_LAYOUT[k]![0]} ${CORSI_LAYOUT[k]![1]} H${x} V${y}`} stroke="var(--circ-wire)" strokeWidth="0.8" fill="none" />
          ))}
        </svg>
        {CORSI_LAYOUT.map(([x, y], n) => (
          <button key={n} type="button" className="circ-cs__led" data-lit={lit === n} disabled={demo} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => tap(n)} aria-label={`Luz ${n + 1}`}>
            <span />
          </button>
        ))}
      </div>
    </div>
  );
}

export { CircuitoExecutivo as Game };
