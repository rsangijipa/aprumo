import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { installAudioUnlock, playCue, playTones, seededRandom, speak, useGameClient, useMotion } from '@aprumo/game-sdk';
import {
  OUTCOMES, REST_POSE, buildTimeline, outcomeToRecord, planTrials, resolveMotion, resolveSettings, samplePose,
  type Outcome,
} from './logic';
import { Model, rippleAt } from './Model';
import { manifest } from './manifest';
import './game.css';

const LEVEL_ID = 'imitacao-motora';
/** Batida macia (palma/tambor/bloco): grave, curta, sem ataque agudo. */
const SOFT_BEAT = [{ freq: 196, dur: 0.07, type: 'sine' as const, attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.12, gain: 0.6 }];

type Stage = 'demo' | 'await' | 'feedback' | 'done';

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

export default function EspelhoMagico() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const sdkMotion = useMotion(config);
  const sysReduced = useSystemReducedMotion();
  const settings = useMemo(() => (config ? resolveSettings(config) : null), [config]);
  const motion = settings ? resolveMotion(settings, sdkMotion, sysReduced) : 'static';
  const plan = useMemo(
    () => (config && settings ? planTrials(config, settings, seededRandom(config.clinical.seed)) : []),
    [config, settings],
  );
  const sound = config?.adaptation.sound ?? 'low';

  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('demo');
  const [demoNonce, setDemoNonce] = useState(0);
  const [pose, setPose] = useState(REST_POSE);
  const [beat, setBeat] = useState(0);
  const [happy, setHappy] = useState(false);

  const startedRef = useRef(false);
  const trialSentRef = useRef(-1);
  const presentedAtRef = useRef(0);
  const replaysRef = useRef(0);
  const correctRef = useRef(0);
  const pausedRef = useRef(paused);
  const stageRef = useRef<Stage>('demo');
  const timerRef = useRef<number | null>(null);
  pausedRef.current = paused || ended;
  stageRef.current = stage;

  const trial = plan[index];

  useEffect(() => installAudioUnlock(), []);
  useEffect(() => () => { if (timerRef.current != null) window.clearTimeout(timerRef.current); }, []);

  // Início da sessão (protegido contra o duplo efeito do StrictMode).
  useEffect(() => {
    if (!config || !plan.length || startedRef.current) return;
    startedRef.current = true;
    client.gameStarted(manifest.version);
    client.levelStarted({ levelId: LEVEL_ID, levelIndex: 0, fieldSize: 1, trialsPlanned: plan.length, difficulty: motion });
  }, [config, plan, client, motion]);

  // Apresentação de cada tentativa.
  useEffect(() => {
    if (!config || !trial || !settings || stage === 'done' || trialSentRef.current === index) return;
    trialSentRef.current = index;
    const ids = [trial.action.id];
    client.trialStarted({ targetId: trial.target.targetId, trialIndex: trial.trialIndex, presented: ids });
    client.stimulusPresented({
      targetId: trial.target.targetId, trialIndex: trial.trialIndex, presented: ids, positionOfTarget: null,
      modality: settings.voice ? 'visual_auditory' : 'visual', instructionId: 'faz-assim',
    });
    presentedAtRef.current = performance.now();
    replaysRef.current = 0;
  }, [config, trial, settings, stage, index, client]);

  // Demonstração animada do modelo (rAF; pausa congela o tempo).
  useEffect(() => {
    // Reinicia só com nova tentativa, "De novo" ou mudança de movimento (o estágio é lido por ref).
    if (!trial || !settings || stageRef.current === 'done' || stageRef.current === 'feedback') return;
    const segs = buildTimeline(trial.action, motion, settings.demoCycles);
    if (settings.voice) void speak('Faz assim!', sound);
    let elapsed = 0;
    let last: number | null = null;
    const beaten = new Set<number>();
    let raf = 0;
    const tick = (ts: number) => {
      if (stageRef.current === 'feedback' || stageRef.current === 'done') return;
      if (last != null && !pausedRef.current) elapsed += ts - last;
      last = ts;
      const s = samplePose(segs, elapsed);
      setPose(s.pose);
      if (s.phase === 'hold' && segs[s.index]!.beat && !beaten.has(s.index)) {
        beaten.add(s.index);
        if (settings.sensory !== 'minimal') playTones(SOFT_BEAT, sound);
        setBeat((b) => b + 1);
      }
      if (s.done) { setStage((st) => (st === 'demo' ? 'await' : st)); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trial, demoNonce, motion, settings, sound]);

  if (!config || !settings) return <div className="em" aria-busy="true" />;

  const busy = paused || ended || stage === 'feedback' || stage === 'done';

  const replay = () => {
    if (busy) return;
    replaysRef.current += 1;
    setStage('demo');
    setDemoNonce((n) => n + 1);
  };

  const record = (outcome: Outcome) => {
    if (busy || !trial) return;
    const rec = outcomeToRecord(outcome, trial.target.promptHierarchy);
    const lat = Math.max(0, Math.round(performance.now() - presentedAtRef.current));
    const base = { targetId: trial.target.targetId, trialIndex: trial.trialIndex };
    if (rec.promptSource === 'therapist') client.promptPresented({ ...base, level: rec.promptLevel, source: 'therapist', latencyMs: lat });
    client.responseRecorded({
      ...base,
      stimulusId: trial.action.id,
      presented: [trial.action.id],
      positionOfTarget: null,
      selected: null,
      selectedPosition: null,
      response: rec.response,
      latencyMs: null,
      promptLevel: rec.promptLevel,
      promptSource: rec.promptSource,
      detail: {
        action: trial.action.id,
        category: trial.action.category,
        outcome,
        replays: replaysRef.current,
        demoCycles: trial.action.singleCycle ? 1 : settings.demoCycles,
        motion,
        sensory: settings.sensory,
        inputMode: 'therapist',
        recordLatencyMs: lat,
      },
    });
    const performed = rec.response === 'correct';
    if (performed) {
      correctRef.current += 1;
      setHappy(true);
      if (settings.sensory !== 'minimal') playCue('correct', sound);
      client.reinforcerPresented({ kind: 'animation', contingentOn: trial.target.targetId, intensity: 'subtle' });
    }
    setStage('feedback');
    timerRef.current = window.setTimeout(() => {
      setHappy(false);
      setPose(REST_POSE);
      if (index + 1 >= plan.length) {
        client.levelCompleted({ levelId: LEVEL_ID, levelIndex: 0, trialsCompleted: plan.length, correct: correctRef.current, outcome: 'completed' });
        client.gameCompleted(plan.length);
        if (settings.sensory !== 'minimal') playCue('complete', sound);
        setHappy(true);
        setStage('done');
      } else {
        setIndex((i) => i + 1);
        setStage('demo');
      }
    }, performed ? (motion === 'static' ? 900 : 1400) : 700);
  };

  const action = trial?.action;
  const style = { '--em-scale': String(config.adaptation.touchScale) } as CSSProperties;

  return (
    <div
      className="em"
      style={style}
      data-palette={config.adaptation.palette}
      data-motion={motion}
      data-sensory={settings.sensory}
      data-stage={stage}
    >
      <header className="em-top">
        <span className="em-progress" aria-live="polite">
          {stage === 'done' ? 'Concluído' : `Ação ${Math.min(index + 1, plan.length)} de ${plan.length}`}
        </span>
        <ol className="em-dots" aria-hidden="true">
          {plan.map((t, i) => (
            <li key={t.trialIndex} data-state={i < index || stage === 'done' ? 'past' : i === index ? 'now' : 'next'} />
          ))}
        </ol>
      </header>

      <main className="em-stage">
        <div className="em-mirror">
          <div className="em-glass">
            <Model
              pose={stage === 'done' ? REST_POSE : pose}
              action={stage === 'done' ? undefined : action}
              happy={happy}
              ripple={settings.sensory !== 'minimal' && motion !== 'static' && action ? { key: beat, at: rippleAt(action, pose) } : null}
              sparkle={settings.sensory === 'rich' && happy}
            />
          </div>
        </div>
        {stage === 'done' ? (
          <p className="em-done" role="status">Terminamos! Obrigado por imitar comigo.</p>
        ) : (
          <div className="em-caption">
            <span className="em-caption__label">{action?.label}</span>
            <button type="button" className="em-again" onClick={replay} disabled={busy}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.1-5" /><path d="M5 4v4h4" /></svg>
              De novo
            </button>
          </div>
        )}
      </main>

      {stage !== 'done' && (
        <section className="em-adult" aria-label="Registro do adulto">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h2 className="em-adult__title" style={{ margin: 0 }}>Para o adulto: como a criança imitou?</h2>
            <img
              src="/assets/avatar_imitation_child.svg"
              alt="Guia postural de imitação"
              title="Guia postural de imitação motora"
              style={{ width: '26px', height: '39px', objectFit: 'contain', opacity: 0.9 }}
            />
          </div>
          <div className="em-adult__grid">
            {OUTCOMES.map((o) => (
              <button key={o.id} type="button" className="em-out" data-outcome={o.id} onClick={() => record(o.id)} disabled={busy}>
                <span className="em-out__label">{o.label}</span>
                <span className="em-out__hint">{o.hint}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {(paused || ended) && (
        <div className="em-overlay" role="status">
          <span className="em-overlay__badge">{ended ? 'Sessão encerrada' : 'Pausa'}</span>
        </div>
      )}
    </div>
  );
}
