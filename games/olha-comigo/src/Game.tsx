import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { installAudioUnlock, playCue, speak, useGameClient, useMotion, useTrialRunner } from '@aprumo/game-sdk';
import { Guide, SceneObject } from './Art';
import {
  CUE_LABELS, CUE_LEVELS, cueHasPoint, cueHasVerbal, gazeToward, GUIDE_ANCHOR, nextCue, NEUTRAL_POSE, objectSizePx,
  planTrials, resolveMotion, resolveSettings, sceneLayout, type CueOutcome, type CueType,
} from './logic';
import { manifest } from './manifest';
import './game.css';

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

/** Fase do guia na tentativa: olha para a criança → dá a pista → (reorienta após erro). */
type Phase = 'hello' | 'cue' | 'reorient';
const NEUTRAL_MS = { static: 250, reduced: 650, normal: 900 } as const;

export default function OlhaComigo() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const sdkMotion = useMotion(config);
  const sysReduced = useSystemReducedMotion();
  const settings = useMemo(() => (config ? resolveSettings(config) : null), [config]);
  const motion = settings ? resolveMotion(settings, sdkMotion, sysReduced) : 'static';
  const trials = useMemo(() => (config && settings ? planTrials(config, settings) : []), [config, settings]);
  const sound = config?.adaptation.sound ?? 'low';
  const feedback = config?.adaptation.feedback ?? 'subtle';
  const scale = config?.adaptation.touchScale ?? 1;

  // Pista da tentativa corrente (decidida no início de cada tentativa, com esvanecimento).
  const [cue, setCue] = useState<{ index: number; level: CueType; phase: Phase } | null>(null);
  const [readyFor, setReadyFor] = useState(-1);
  const history = useRef<CueOutcome[]>([]);
  const currentLevel = useRef<CueType | null>(null);
  const scored = useRef(-1);
  const therapistPrompt = useRef(false);
  const hintRef = useRef(false);
  const cueRef = useRef(cue);
  cueRef.current = cue;

  const run = useTrialRunner({
    client, config, trials, paused,
    latencyMaxMs: manifest.clinical.latencyMaxMs,
    feedbackMs: motion === 'static' ? 900 : 1500,
    // Latência conta a partir da pista (não do "olá" inicial do guia).
    gate: trials[readyFor] != null && readyFor === cue?.index && cue.phase === 'cue',
    onTrialStart: () => { therapistPrompt.current = false; },
    detail: () => {
      const c = cueRef.current;
      const t = trials[c?.index ?? -1];
      const slot = t ? sceneLayout(t.fieldSize)[t.positionOfTarget] : undefined;
      return {
        cueType: c?.level ?? null,
        cueAdaptive: settings?.cueFixed == null,
        highlightShown: hintRef.current,
        fieldSize: t?.fieldSize ?? null,
        gazeSide: slot ? gazeToward(slot).side : null,
        sensory: settings?.sensory ?? null,
        motion,
      };
    },
  });
  const trial = run.trial;
  hintRef.current = run.hint;

  const sceneRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 360, h: 560 });
  const [announce, setAnnounce] = useState('');
  const [sparkle, setSparkle] = useState(false);

  useEffect(() => installAudioUnlock(), []);

  useEffect(() => {
    if (!config || !trials.length) return;
    client.emit('SESSION_STARTED', { configVersion: manifest.version });
    client.levelStarted({ levelId: `campo-${trials[0]!.fieldSize}`, levelIndex: 0, fieldSize: trials[0]!.fieldSize, trialsPlanned: trials.length });
  }, [config, client, trials]);

  useEffect(() => client.onCommand((c) => { if (c.kind === 'SET_PROMPT' && c.level !== 'IND') therapistPrompt.current = true; }), [client]);

  useLayoutEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setBox((b) => (b.w === r.width && b.h === r.height ? b : { w: r.width, h: r.height }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [config]);

  // Nova tentativa: escolhe o nível de pista, o guia olha para a criança e então dá a pista.
  const idx = trial?.index ?? -1;
  useEffect(() => {
    if (!trial || !settings || run.stage !== 'awaiting') return;
    if (cueRef.current?.index !== trial.index) {
      const level = settings.cueFixed ?? (currentLevel.current == null ? settings.cueStart : nextCue(currentLevel.current, history.current));
      currentLevel.current = level;
      setCue({ index: trial.index, level, phase: 'hello' });
      return;
    }
    if (paused || cueRef.current.phase !== 'hello') return;
    const t = window.setTimeout(() => {
      const level = cueRef.current!.level;
      setCue({ index: trial.index, level, phase: 'cue' });
      setReadyFor(trial.index);
      if (cueHasVerbal(level)) void speak('Olha!', sound);
      setAnnounce(cueHasVerbal(level) ? 'Olha!' : 'Para onde o Nino está olhando?');
    }, NEUTRAL_MS[motion]);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, run.stage, cue?.phase, paused, settings]);

  // Registro do resultado (uma vez por tentativa) para o esvanecimento + retorno calmo.
  useEffect(() => {
    if (!trial || run.stage === 'awaiting' || run.stage === 'done' || scored.current === trial.index) return;
    scored.current = trial.index;
    const level = cueRef.current?.level ?? 'gaze_point_verbal';
    const response = run.lastOutcome ?? 'no_response';
    history.current.push({ cue: level, response, prompted: hintRef.current || therapistPrompt.current });
    if (run.stage === 'correction') {
      // Reorientação: o guia volta a olhar para a criança e repete a pista com todo o apoio.
      playCue('retry', sound);
      setAnnounce('Vamos olhar juntos de novo.');
      setCue({ index: trial.index, level, phase: 'reorient' });
      const t = window.setTimeout(() => {
        setCue({ index: trial.index, level: 'gaze_point_verbal', phase: 'cue' });
        void speak('Olha!', sound);
      }, NEUTRAL_MS[motion]);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.stage, idx]);

  // Reforço ao acertar (também após a correção).
  useEffect(() => {
    if (run.stage !== 'feedback') return;
    if (feedback !== 'none') playCue('correct', sound);
    setAnnounce('Isso! Olhamos juntos!');
    if (settings?.sensory === 'rich' && motion !== 'static') setSparkle(true);
    const t = window.setTimeout(() => setSparkle(false), 1300);
    return () => window.clearTimeout(t);
  }, [run.stage, feedback, sound, motion, settings?.sensory]);

  useEffect(() => {
    if (run.stage !== 'done' || !trials.length) return;
    const correct = history.current.filter((h) => h.response === 'correct').length;
    client.levelCompleted({ levelId: `campo-${trials[0]!.fieldSize}`, levelIndex: 0, trialsCompleted: trials.length, correct, outcome: 'completed' });
    playCue('complete', sound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.stage]);

  if (!config || !settings) return <div className="oc" aria-busy="true" />;

  const slots = trial ? sceneLayout(trial.fieldSize) : [];
  const activeCue = cue && trial && cue.index === trial.index ? cue : null;
  const showing = activeCue?.phase === 'cue' || run.stage === 'feedback';
  const targetSlot = trial ? slots[trial.positionOfTarget] : undefined;
  const pose = showing && targetSlot ? gazeToward(targetSlot, GUIDE_ANCHOR, box.h / Math.max(1, box.w)) : NEUTRAL_POSE;
  const level = activeCue?.level ?? CUE_LEVELS[2];
  const pointing = showing && cueHasPoint(level);
  const verbal = activeCue?.phase === 'cue' && cueHasVerbal(level);
  const objSize = trial ? objectSizePx(Math.min(box.w, box.h), scale, trial.fieldSize) : 96;
  const canAct = !paused && !ended && (run.stage === 'awaiting' || run.stage === 'correction') && activeCue?.phase === 'cue';

  const choose = (pos: number) => {
    if (!canAct) return;
    playCue('tap', sound);
    run.select(pos);
  };

  const vars = { '--oc-scale': scale, '--oc-obj': `${objSize}px` } as CSSProperties;

  return (
    <div
      className="oc"
      data-sensory={settings.sensory}
      data-palette={config.adaptation.palette}
      data-motion={motion}
      data-phase={activeCue?.phase ?? 'hello'}
      style={vars}
    >
      <div className="oc-scene" ref={sceneRef}>
        {settings.sensory !== 'minimal' && (
          <div className="oc-deco" aria-hidden="true">
            <span className="oc-deco__sun" />
            <span className="oc-deco__hill oc-deco__hill--a" />
            <span className="oc-deco__hill oc-deco__hill--b" />
            {settings.sensory === 'rich' && <><span className="oc-deco__cloud oc-deco__cloud--a" /><span className="oc-deco__cloud oc-deco__cloud--b" /></>}
          </div>
        )}

        <div className="oc-objects" role="group" aria-label="Toque no objeto que o Nino está olhando">
          {trial?.options.map((o, pos) => {
            const s = slots[pos]!;
            const isTarget = pos === trial.positionOfTarget;
            const state =
              run.stage === 'feedback' && isTarget ? 'found'
              : run.stage === 'feedback' ? 'rest'
              : run.lastSelected === pos && run.stage === 'correction' ? 'settle'
              : 'idle';
            return (
              <button
                key={`${trial.index}-${o.stimulusId}`}
                type="button"
                className="oc-obj"
                data-state={state}
                data-hint={run.hint && isTarget && run.stage !== 'feedback'}
                aria-label={o.label}
                aria-disabled={!canAct}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                onPointerDown={() => canAct && run.markResponseStart(pos, 'tap')}
                onClick={() => choose(pos)}
              >
                <span className="oc-obj__glow" aria-hidden="true" />
                <SceneObject id={o.art} />
                {sparkle && isTarget && (
                  <span className="oc-sparkle" aria-hidden="true">
                    {Array.from({ length: 6 }, (_, k) => <i key={k} style={{ '--k': k } as CSSProperties} />)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="oc-guide" style={{ left: `${GUIDE_ANCHOR.x}%`, top: `${GUIDE_ANCHOR.y}%` }}>
          {verbal && <div className="oc-bubble" data-side={pose.side} aria-hidden="true">Olha!</div>}
          <Guide pose={pose} pointing={pointing} smiling={run.stage === 'feedback'} side={pose.side} />
        </div>
      </div>

      <div className="oc-steps" role="progressbar" aria-label={`${run.completed} de ${run.total}`} aria-valuemin={0} aria-valuemax={run.total} aria-valuenow={run.completed}>
        {trials.map((t, k) => <span key={t.index} data-done={k < run.completed} data-current={k === run.completed} />)}
      </div>

      <p className="oc-sr" aria-live="polite">{announce}</p>
      <p className="oc-sr">{activeCue ? `Pista: ${CUE_LABELS[activeCue.level]}` : ''}</p>

      {((paused || ended) && run.stage !== 'done') && (
        <div className="oc-overlay" role="status"><div className="oc-overlay__card">Pausa</div></div>
      )}
      {run.stage === 'done' && (
        <div className="oc-overlay" role="status"><div className="oc-overlay__card">Olhamos juntos! Até a próxima.</div></div>
      )}
    </div>
  );
}
