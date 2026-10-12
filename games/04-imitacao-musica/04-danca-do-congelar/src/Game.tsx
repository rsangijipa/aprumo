import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { installAudioUnlock, playCue, playTones, speak, stepSpring, useAnnounce, useFrameLoop, useGameClient, useMotion, type Spring } from '@aprumo/game-sdk';
import type { PromptSource } from '@aprumo/protocol';
import {
  BASS,
  classifyTaps,
  DANCE_LEVELS,
  DANCE_PENTATONIC_FREQS,
  evaluateFreezePerformance,
  evaluateGoWindow,
  MELODY,
  planRounds,
  startLevelFrom,
  stepMs,
  type FreezeEvaluation,
  type PlannedRound,
} from './logic';
import { manifest } from './manifest';
import './game.css';

type Stage = 'intro' | 'countdown' | 'dancing' | 'window' | 'evaluated' | 'finished';

/** Poses do dançarino (ângulos em graus): braço esq., braço dir., perna esq., perna dir., inclinação. */
const POSES: [number, number, number, number, number][] = [
  [-150, 150, -10, 10, 0],
  [-60, 160, -25, 5, -8],
  [-160, 60, -5, 25, 8],
  [40, -40, -20, 20, 0],
  [-120, 30, 0, 35, 6],
  [-30, 120, -35, 0, -6],
];
const PARTS = ['armL', 'armR', 'legL', 'legR', 'tilt'] as const;

export function Game() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const sound = config?.adaptation.sound ?? 'low';
  const feedback = config?.adaptation.feedback ?? 'subtle';
  const totalRounds = Math.max(3, Math.min(16, config?.clinical.trialsPerTarget ?? 6));
  const plan = useMemo(() => (config ? planRounds(Math.max(4, totalRounds), config.clinical.seed, startLevelFrom(config.params)) : []), [config, totalRounds]);

  const [stage, setStage] = useState<Stage>('intro');
  const [roundIdx, setRoundIdx] = useState(0);
  const [count, setCount] = useState(3);
  const [cracks, setCracks] = useState(0);
  const [result, setResult] = useState<FreezeEvaluation | null>(null);
  const [perfect, setPerfect] = useState(0);
  const [moves, setMoves] = useState(0);
  const [distractor, setDistractor] = useState<number | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [live, announce] = useAnnounce();

  const timers = useRef<number[]>([]);
  const music = useRef<number | null>(null);
  const step = useRef(0);
  const cueAt = useRef(0);
  const taps = useRef<number[]>([]);
  const danceTaps = useRef(0);
  const prompt = useRef<{ level: string; source: PromptSource }>({ level: 'IND', source: 'none' });
  const startedRun = useRef<string | null>(null);
  const levelRef = useRef(-1);
  const levelStats = useRef({ trials: 0, correct: 0 });
  const poseIdx = useRef(0);
  const springs = useRef<Record<(typeof PARTS)[number], Spring>>({ armL: { value: -150, velocity: 0 }, armR: { value: 150, velocity: 0 }, legL: { value: -10, velocity: 0 }, legR: { value: 10, velocity: 0 }, tilt: { value: 0, velocity: 0 } });
  const bob = useRef<Spring>({ value: 0, velocity: 0 });
  const partEls = useRef<Record<string, SVGGElement | null>>({});
  const [noteIds, setNoteIds] = useState<number[]>([]);
  const noteSeq = useRef(0);

  const round: PlannedRound | undefined = plan[roundIdx];
  const level = DANCE_LEVELS[round?.level ?? 0]!;
  const targetId = config?.clinical.targets[0]?.targetId ?? 'congelamento-estatua';

  useEffect(() => installAudioUnlock(), []);
  const clearAll = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    if (music.current != null) window.clearInterval(music.current);
    music.current = null;
  }, []);
  useEffect(() => clearAll, [clearAll]);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  /* ------------------------------------------------------------ música */

  const startMusic = useCallback(
    (bpm: number) => {
      if (music.current != null) window.clearInterval(music.current);
      music.current = window.setInterval(() => {
        const s = step.current++;
        const m = MELODY[s % MELODY.length]!;
        const tones = [];
        if (m >= 0) tones.push({ freq: DANCE_PENTATONIC_FREQS[m]!, dur: 0.13, type: 'triangle' as const, attack: 0.01, decay: 0.06, sustain: 0.45, release: 0.12, gain: 0.55 });
        if (s % 2 === 0) tones.push({ freq: BASS[(s / 2) % BASS.length]!, dur: 0.18, type: 'sine' as const, attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.1, gain: 0.8 });
        playTones(tones, sound);
        // Balanço no tempo (o corpo "pula" no baixo).
        if (s % 2 === 0) bob.current.velocity -= motion === 'full' ? 60 : 25;
      }, stepMs(bpm));
    },
    [sound, motion],
  );
  const stopMusic = () => {
    if (music.current != null) window.clearInterval(music.current);
    music.current = null;
  };

  /* ------------------------------------------------------------ rodada */

  const beginDance = useCallback(
    (idx: number) => {
      const r = plan[idx];
      if (!r) return;
      const L = DANCE_LEVELS[r.level]!;
      if (r.level !== levelRef.current) {
        if (levelRef.current >= 0) {
          client.levelCompleted({ levelId: DANCE_LEVELS[levelRef.current]!.id, levelIndex: levelRef.current, trialsCompleted: levelStats.current.trials, correct: levelStats.current.correct, outcome: 'advanced' });
        }
        levelRef.current = r.level;
        levelStats.current = { trials: 0, correct: 0 };
        client.levelStarted({ levelId: L.id, levelIndex: r.level, fieldSize: 1, trialsPlanned: plan.filter((p) => p.level === r.level).length, difficulty: L.id });
        setBanner(`Fase ${r.level + 1}: ${L.title}`);
        later(() => setBanner(null), 1800);
        if (L.goTrials) void speak('Agora preste atenção: floco de gelo é para congelar. Folha verde é para continuar dançando!', sound);
      }
      setRoundIdx(idx);
      setResult(null);
      setCracks(0);
      setDistractor(null);
      danceTaps.current = 0;
      setStage('dancing');
      announce('Dance! Toque no palco no ritmo.');
      startMusic(L.bpm);
      later(() => openWindow(r), r.danceMs);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plan, client, sound, startMusic, announce],
  );

  const openWindow = (r: PlannedRound) => {
    stopMusic();
    setStage('window');
    cueAt.current = performance.now();
    taps.current = [];
    prompt.current = { level: 'IND', source: 'none' };
    const presented = r.cue === 'freeze' ? ['floco-congela'] : ['folha-continua'];
    client.trialStarted({ targetId, trialIndex: r.index, presented });
    client.stimulusPresented({ targetId, trialIndex: r.index, presented, positionOfTarget: 0, modality: 'visual_auditory', instructionId: r.cue });
    if (r.cue === 'freeze') {
      playTones([{ freq: 1174.66, dur: 0.1, type: 'sine' }, { freq: 1760, dur: 0.3, delay: 0.08, type: 'sine', attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.4 }], sound);
      void speak('Congela!', sound);
      announce('Congela! Fique parado, não toque.');
    } else {
      playTones([{ freq: 523.25, dur: 0.1, type: 'triangle' }, { freq: 659.25, dur: 0.15, delay: 0.1, type: 'triangle' }], sound);
      void speak('Folha! Continue dançando!', sound);
      announce('Folha verde: continue dançando!');
      startMusic(DANCE_LEVELS[r.level]!.bpm);
    }
    r.distractorAt.forEach((at, k) => {
      later(() => setDistractor(k), at);
      later(() => setDistractor(null), at + 1800);
    });
    later(() => closeWindow(r), r.windowMs);
  };

  const closeWindow = (r: PlannedRound) => {
    stopMusic();
    const rel = taps.current;
    const { impulsive, firstImpulsiveMs } = classifyTaps(rel);
    const ev = r.cue === 'freeze' ? evaluateFreezePerformance(impulsive, r.windowMs) : evaluateGoWindow(rel.length);
    setResult(ev);
    setStage('evaluated');
    levelStats.current.trials += 1;
    if (ev.passed) levelStats.current.correct += 1;
    client.responseRecorded({
      targetId,
      stimulusId: r.cue === 'freeze' ? 'floco-congela' : 'folha-continua',
      trialIndex: r.index,
      presented: [r.cue === 'freeze' ? 'floco-congela' : 'folha-continua'],
      positionOfTarget: 0,
      selected: r.cue === 'freeze' ? (impulsive === 0 ? 'estatua' : 'toque') : rel.length > 0 ? 'danca' : 'parado',
      selectedPosition: 0,
      response: ev.passed ? 'correct' : 'incorrect',
      latencyMs: r.cue === 'freeze' ? firstImpulsiveMs : rel.length ? Math.round(rel[0]!) : null,
      promptLevel: prompt.current.level,
      promptSource: prompt.current.source,
      detail: { level: r.level, cue: r.cue, windowMs: r.windowMs, impulsiveTaps: impulsive, tapsInGrace: rel.length - impulsive, danceTaps: danceTaps.current, rating: ev.rating, distractors: r.distractorAt.length },
    });
    announce(ev.message);
    void speak(ev.message, sound);
    if (ev.passed) {
      if (r.cue === 'freeze') setPerfect((p) => p + 1);
      client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: targetId });
      client.reinforcerPresented({ kind: 'animation', contingentOn: targetId, intensity: feedback === 'festive' ? 'festive' : 'subtle' });
      if (feedback !== 'none') playCue('reinforce', sound);
    } else playCue('retry', sound);
    const next = r.index + 1;
    if (next >= plan.length) {
      later(() => {
        setStage('finished');
        client.levelCompleted({ levelId: DANCE_LEVELS[levelRef.current]!.id, levelIndex: levelRef.current, trialsCompleted: levelStats.current.trials, correct: levelStats.current.correct, outcome: 'completed' });
        if (feedback !== 'none') playCue('complete', sound);
        client.gameCompleted(plan.length);
      }, 2200);
    } else later(() => beginDance(next), 2400);
  };

  const startCountdown = useCallback(() => {
    setStage('countdown');
    setCount(3);
    [1, 2, 3].forEach((k) =>
      later(() => {
        setCount(3 - k);
        playTones([{ freq: 440 + k * 110, dur: 0.08, type: 'sine' }], sound);
        if (k === 3) beginDance(roundIdx);
      }, k * 750),
    );
  }, [sound, beginDance, roundIdx]);

  useEffect(() => {
    if (!config || startedRun.current === config.runId) return;
    startedRun.current = config.runId;
    client.gameStarted(manifest.version);
    void speak('Dance quando a música tocar. Quando ela parar, vire uma estátua!', sound);
    later(startCountdown, 1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, client]);

  // Pausa: para tudo; ao voltar, a rodada recomeça da dança (a janela interrompida não é pontuada).
  const pausedAt = useRef<number | null>(null);
  useEffect(() => {
    if (!config) return;
    if (paused) {
      pausedAt.current = performance.now();
      clearAll();
      client.paused();
    } else if (pausedAt.current != null) {
      pausedAt.current = null;
      client.resumed();
      if (stage !== 'finished') later(() => beginDance(roundIdx), 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  useEffect(
    () =>
      client.onCommand((c) => {
        if (c.kind !== 'SET_PROMPT' || !round) return;
        prompt.current = c.level === 'IND' ? { level: 'IND', source: 'none' } : { level: c.level, source: 'therapist' };
        if (c.level !== 'IND') client.promptPresented({ targetId, trialIndex: round.index, level: c.level, source: 'therapist', latencyMs: Math.max(0, Math.round(performance.now() - cueAt.current)) });
      }),
    [client, round, targetId],
  );

  /* ------------------------------------------------------------ toque no palco */

  const tap = () => {
    if (!config || paused || !round) return;
    if (stage === 'dancing' || (stage === 'window' && round.cue === 'go')) {
      if (stage === 'window') taps.current.push(performance.now() - cueAt.current);
      danceTaps.current += 1;
      setMoves((m) => m + 1);
      // Próxima pose: as molas levam cada membro até lá (com "overshoot" natural).
      poseIdx.current = (poseIdx.current + 1 + Math.floor(Math.random() * 2)) % POSES.length;
      bob.current.velocity -= 90;
      const id = noteSeq.current++;
      setNoteIds((n) => [...n.slice(-6), id]);
      playTones([{ freq: DANCE_PENTATONIC_FREQS[Math.floor(Math.random() * DANCE_PENTATONIC_FREQS.length)]! * 2, dur: 0.06, type: 'sine', gain: 0.5 }], sound);
      return;
    }
    if (stage === 'window' && round.cue === 'freeze') {
      const rel = performance.now() - cueAt.current;
      taps.current.push(rel);
      const { impulsive } = classifyTaps(taps.current);
      if (impulsive > 0) {
        setCracks(Math.min(5, impulsive));
        playTones([{ freq: 1800 + impulsive * 120, dur: 0.04, type: 'square', gain: 0.18 }], sound);
        // Dica embutida (uma vez por tentativa): lembrete verbal de ficar estátua.
        if (impulsive === 1 && config.adaptation.builtInPromptAfterMs != null && prompt.current.source === 'none') {
          prompt.current = { level: config.clinical.targets[0]?.promptHierarchy[1]?.code ?? 'STATUE_PROMPT', source: 'built_in' };
          client.promptPresented({ targetId, trialIndex: round.index, level: prompt.current.level, source: 'built_in', latencyMs: Math.round(rel) });
          void speak('Estátua! Bem paradinho.', sound);
        }
      }
    }
  };

  /* ------------------------------------------------------------ animação do dançarino */

  const frozen = stage === 'window' && round?.cue === 'freeze';
  useFrameLoop((dt) => {
    const pose = POSES[poseIdx.current]!;
    const k = motion === 'static' ? 2000 : 220;
    const c = motion === 'static' ? 90 : 12;
    if (!frozen) {
      PARTS.forEach((p, i) => stepSpring(springs.current[p], pose[i]!, dt, k, c));
      stepSpring(bob.current, 0, dt, 300, 14);
    }
    const s = springs.current;
    const set = (id: string, tf: string) => partEls.current[id]?.setAttribute('transform', tf);
    set('armL', `rotate(${-s.armL.value} 82 96)`);
    set('armR', `rotate(${-s.armR.value} 118 96)`);
    set('legL', `rotate(${-s.legL.value} 90 150)`);
    set('legR', `rotate(${-s.legR.value} 110 150)`);
    set('body', `translate(0 ${Math.max(-18, Math.min(10, bob.current.value * 0.15))}) rotate(${s.tilt.value} 100 150)`);
  }, !!config && !paused && stage !== 'finished');

  if (!config || !round) return <div className="ddc-root" aria-busy="true" />;

  const stageLabel = frozen ? 'Palco congelado: não toque' : stage === 'window' ? 'Folha verde: continue tocando para dançar' : 'Palco: toque para dançar';

  return (
    <div className="ddc-root" data-palette={config.adaptation.palette} data-motion={motion} data-stage={stage} data-frozen={frozen} data-cue={stage === 'window' ? round.cue : 'none'} style={{ ['--ddc-scale' as string]: config.adaptation.touchScale }}>
      <header className="ddc-header">
        <div className="ddc-badge" aria-label={`Fase ${round.level + 1}: ${level.title}`}>
          {DANCE_LEVELS.map((l, i) => (
            <i key={l.id} data-on={i <= round.level} />
          ))}
          <span>{level.title}</span>
        </div>
        <div className="ddc-badge" aria-label={`Estátuas perfeitas: ${perfect}`}>
          <SnowIcon /> <strong>{perfect}</strong>
        </div>
        <div className="ddc-badge" role="progressbar" aria-label="Rodada" aria-valuemin={1} aria-valuemax={plan.length} aria-valuenow={roundIdx + 1}>
          {roundIdx + 1}/{plan.length}
        </div>
      </header>

      <div className="ddc-status-banner" data-stage={stage}>
        {stage === 'intro' && 'Prepare-se!'}
        {stage === 'countdown' && (count > 0 ? count : 'Já!')}
        {stage === 'dancing' && 'Dance!'}
        {stage === 'window' && (round.cue === 'freeze' ? 'CONGELA!' : 'Continue dançando!')}
        {stage === 'evaluated' && result?.message}
        {stage === 'finished' && 'Fim da dança!'}
      </div>

      <button
        type="button"
        className="ddc-stage"
        onPointerDown={tap}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!e.repeat) tap();
          }
        }}
        aria-label={stageLabel}
      >
        <svg className="ddc-floor" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={i * 50} y="0" width="50" height="80" fill={i % 2 ? 'var(--ddc-tile-a)' : 'var(--ddc-tile-b)'} />
          ))}
        </svg>
        <span className="ddc-spot" aria-hidden="true" />
        <svg className="ddc-dancer" viewBox="0 0 200 240" aria-hidden="true">
          <g ref={(el) => void (partEls.current.body = el)}>
            <g ref={(el) => void (partEls.current.legL = el)}>
              <path d="M90 150v54" stroke="var(--ddc-pants)" strokeWidth="16" strokeLinecap="round" />
              <ellipse cx="88" cy="210" rx="14" ry="7" fill="var(--ddc-ink)" />
            </g>
            <g ref={(el) => void (partEls.current.legR = el)}>
              <path d="M110 150v54" stroke="var(--ddc-pants)" strokeWidth="16" strokeLinecap="round" />
              <ellipse cx="112" cy="210" rx="14" ry="7" fill="var(--ddc-ink)" />
            </g>
            <path d="M74 96c0-12 12-18 26-18s26 6 26 18v54H74z" fill="var(--ddc-shirt)" stroke="var(--ddc-ink)" strokeWidth="3" strokeLinejoin="round" />
            <g ref={(el) => void (partEls.current.armL = el)}>
              <path d="M82 96v44" stroke="var(--ddc-shirt)" strokeWidth="13" strokeLinecap="round" />
              <circle cx="82" cy="142" r="8" fill="var(--ddc-skin)" stroke="var(--ddc-ink)" strokeWidth="2.5" />
            </g>
            <g ref={(el) => void (partEls.current.armR = el)}>
              <path d="M118 96v44" stroke="var(--ddc-shirt)" strokeWidth="13" strokeLinecap="round" />
              <circle cx="118" cy="142" r="8" fill="var(--ddc-skin)" stroke="var(--ddc-ink)" strokeWidth="2.5" />
            </g>
            <circle cx="100" cy="56" r="26" fill="var(--ddc-skin)" stroke="var(--ddc-ink)" strokeWidth="3" />
            <path d="M74 52c0-18 12-26 26-26s26 8 26 26c-8-8-18-10-26-10s-18 2-26 10z" fill="var(--ddc-hair)" />
            {frozen ? (
              <g stroke="var(--ddc-ink)" strokeWidth="3" fill="none" strokeLinecap="round">
                <path d="M88 58h6M106 58h6" />
                <path d="M93 70h14" />
              </g>
            ) : (
              <g>
                <circle cx="91" cy="58" r="3.4" fill="var(--ddc-ink)" />
                <circle cx="109" cy="58" r="3.4" fill="var(--ddc-ink)" />
                <path d="M90 68q10 9 20 0" fill="none" stroke="var(--ddc-ink)" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}
          </g>
          {frozen && (
            <g className="ddc-ice">
              <rect x="44" y="14" width="112" height="210" rx="22" fill="var(--ddc-ice)" stroke="#bfe6ff" strokeWidth="4" />
              <path d="M62 30l14 30M136 40l-10 26M58 180l18-20" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
              {Array.from({ length: cracks }, (_, i) => (
                <path key={i} d={CRACKS[i]} stroke="#2f6fb0" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ))}
            </g>
          )}
        </svg>
        {noteIds.map((id, i) => (
          <span key={id} className="ddc-note" style={{ ['--i' as string]: i, left: `${30 + ((id * 37) % 40)}%` }} aria-hidden="true">
            ♪
          </span>
        ))}
        {stage === 'window' && (
          <span className="ddc-cue" aria-hidden="true">
            {round.cue === 'freeze' ? <SnowIcon big /> : <LeafIcon />}
          </span>
        )}
        {distractor != null && (
          <span className="ddc-distractor" data-k={distractor} aria-hidden="true">
            {distractor === 0 ? <Butterfly /> : <Balloon />}
          </span>
        )}
      </button>

      <p className="ddc-sr" aria-live="assertive">{live}</p>

      {banner && (
        <div className="ddc-level-banner" aria-hidden="true">
          {banner}
        </div>
      )}
      {(paused || ended) && stage !== 'finished' && (
        <div className="ddc-overlay" role="status">
          <div className="ddc-overlay__card">Pausa</div>
        </div>
      )}
      {stage === 'finished' && (
        <div className="ddc-overlay" role="status">
          <div className="ddc-overlay__card">
            <SnowIcon big />
            <strong>Mestre da estátua!</strong>
            <span>
              {perfect} estátuas perfeitas · {moves} passos de dança
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const CRACKS = ['M100 40l-8 22 12 10-6 18', 'M70 120l20 6 6 18 16 4', 'M130 90l-14 10 4 16-10 12', 'M84 190l14-16 18 4', 'M60 70l18 8 2 16'];

function SnowIcon({ big = false }: { big?: boolean }) {
  const s = big ? 96 : 20;
  return (
    <svg viewBox="0 0 48 48" width={s} height={s} aria-hidden="true">
      <g stroke="#2f6fb0" strokeWidth="4" strokeLinecap="round">
        {[0, 60, 120].map((a) => (
          <g key={a} transform={`rotate(${a} 24 24)`}>
            <path d="M24 4v40M18 9l6 6 6-6M18 39l6-6 6 6" fill="none" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 64 64" width="96" height="96" aria-hidden="true">
      <path d="M10 54C10 24 30 8 56 8c0 28-16 46-46 46z" fill="#5cb85c" stroke="#2e6b2e" strokeWidth="4" strokeLinejoin="round" />
      <path d="M12 52 46 18" stroke="#2e6b2e" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Butterfly() {
  return (
    <svg viewBox="0 0 64 48" width="80" height="60">
      <path d="M32 24C22 4 4 6 6 18s20 10 26 6zM32 24c10-20 28-18 26-6s-20 10-26 6z" fill="#f28d4e" stroke="#33302d" strokeWidth="2.5" />
      <path d="M32 26c-8 12-20 14-20 6s12-8 20-6zM32 26c8 12 20 14 20 6s-12-8-20-6z" fill="#ffd84d" stroke="#33302d" strokeWidth="2.5" />
      <path d="M32 14v22" stroke="#33302d" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Balloon() {
  return (
    <svg viewBox="0 0 40 70" width="54" height="94">
      <ellipse cx="20" cy="22" rx="16" ry="20" fill="#e5483c" stroke="#33302d" strokeWidth="2.5" />
      <ellipse cx="14" cy="14" rx="4" ry="6" fill="#fff" opacity=".6" />
      <path d="M20 42c-4 8 4 14 0 26" stroke="#33302d" strokeWidth="2" fill="none" />
    </svg>
  );
}

export default Game;
