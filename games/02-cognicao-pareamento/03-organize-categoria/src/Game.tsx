import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import {
  capturePointer,
  installAudioUnlock,
  playCue,
  playTones,
  speak,
  stepSpring,
  useAnnounce,
  useFrameLoop,
  useGameClient,
  useMotion,
  useTrialRunner,
  type Spring,
} from '@aprumo/game-sdk';
import { StimulusArt } from '@aprumo/stimuli';
import { Belt, BoxArt } from './Boxes';
import { flightPoint, planCategoryTrials, type Flight, type PlannedCategoryTrial } from './logic';
import { manifest } from './manifest';
import './game.css';

const THUD = [{ freq: 196, dur: 0.08, type: 'triangle' as const, attack: 0.005, decay: 0.06, sustain: 0.3, release: 0.1, gain: 0.7 }];
const WHOOSH = [{ freq: 520, slideTo: 880, dur: 0.25, type: 'sine' as const, attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.1, gain: 0.35 }];

export default function OrganizePorCategoria() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const trials = useMemo(() => (config ? planCategoryTrials(config) : []), [config]);
  const sound = config?.adaptation.sound ?? 'low';
  const feedback = config?.adaptation.feedback ?? 'subtle';

  /** Portão da tentativa: só abre quando o item termina de chegar pela esteira; fecha no reforço. */
  const [gateOpen, setGateOpen] = useState(false);
  const [goneFor, setGoneFor] = useState(-1);
  const current = useRef<PlannedCategoryTrial | undefined>(undefined);
  const [banner, setBanner] = useState<string | null>(null);
  const [gulp, setGulp] = useState<number | null>(null);
  const [stored, setStored] = useState<Record<string, string[]>>({});
  const [overBox, setOverBox] = useState<number | null>(null);
  const [live, announce] = useAnnounce();
  const lastLevel = useRef(-1);
  const levelCorrect = useRef(0);
  const levelTrials = useRef(0);

  const run = useTrialRunner({
    client,
    config,
    trials,
    paused,
    latencyMaxMs: manifest.clinical.latencyMaxMs,
    feedbackMs: motion === 'static' ? 700 : 1400,
    gate: gateOpen && !banner,
    detail: () => ({ level: current.current?.level ?? 0, boxes: current.current?.boxes.length ?? 0, item: current.current?.item.art }),
    onTrialStart: (t) => {
      void speak(t.instruction, sound);
      announce(`${t.instruction} Caixas: ${t.boxes.map((b) => b.label).join(', ')}.`);
    },
  });
  const trial = run.trial;
  const trialKey = trial ? trial.index : -1;
  const arrived = gateOpen;
  const gone = goneFor === trialKey;
  useEffect(() => {
    current.current = trial;
  });

  const itemRef = useRef<HTMLDivElement>(null);
  const boxEls = useRef<(HTMLButtonElement | null)[]>([]);
  const flight = useRef<{ f: Flight; onEnd: () => void } | null>(null);
  const dragState = useRef<{ id: number; sx: number; sy: number; x: number; y: number; moved: boolean } | null>(null);
  const spring = useRef<{ x: Spring; y: Spring } | null>(null);
  const [animating, setAnimating] = useState(false);
  const startedRun = useRef<string | null>(null);

  useEffect(() => installAudioUnlock(), []);

  useEffect(() => {
    if (!config || startedRun.current === config.runId) return;
    startedRun.current = config.runId;
    client.gameStarted(manifest.version);
  }, [config, client]);

  // Nova tentativa: o item chega pela esteira (com atrito) e só então a latência começa.
  useEffect(() => {
    if (trialKey < 0 || !trial) return;
    if (itemRef.current) itemRef.current.style.transform = '';
    // Mudou de fase: anuncia "Fase N".
    if (trial.level !== lastLevel.current) {
      if (lastLevel.current >= 0) {
        client.levelCompleted({ levelId: `caixas-${lastLevel.current + 2}`, levelIndex: lastLevel.current, trialsCompleted: levelTrials.current, correct: levelCorrect.current, outcome: 'advanced' });
      }
      lastLevel.current = trial.level;
      levelCorrect.current = 0;
      levelTrials.current = 0;
      client.levelStarted({ levelId: `caixas-${trial.boxes.length}`, levelIndex: trial.level, fieldSize: trial.boxes.length, trialsPlanned: trials.filter((t) => t.level === trial.level).length, difficulty: `${trial.boxes.length}-caixas` });
      setBanner(`Fase ${trial.level + 1}: ${trial.boxes.length} caixas`);
      const b = window.setTimeout(() => setBanner(null), motion === 'static' ? 700 : 1400);
      const a = window.setTimeout(() => setGateOpen(true), motion === 'static' ? 100 : 750);
      return () => {
        window.clearTimeout(a);
        window.clearTimeout(b);
      };
    }
    const id = window.setTimeout(() => setGateOpen(true), motion === 'static' ? 100 : 750);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialKey]);

  // Reforço em curso: fecha o portão antes de o motor avançar (a próxima tentativa espera a esteira).
  useEffect(() => {
    if (run.stage === 'feedback' || run.stage === 'done') setGateOpen(false);
  }, [run.stage]);

  // Fim da sessão: fecha a última fase.
  useEffect(() => {
    if (run.stage !== 'done' || lastLevel.current < 0) return;
    client.levelCompleted({ levelId: `caixas-${(trials[trials.length - 1]?.boxes.length ?? 2)}`, levelIndex: lastLevel.current, trialsCompleted: levelTrials.current, correct: levelCorrect.current, outcome: 'completed' });
    lastLevel.current = -1;
    if (feedback !== 'none') playCue('complete', sound);
    announce('Tudo guardado! Parabéns!');
  }, [run.stage, client, trials, feedback, sound, announce]);

  /* ------------------------------------------------------------ física do item */

  useFrameLoop((dt) => {
    const el = itemRef.current;
    if (!el) return;
    if (flight.current) {
      const fl = flight.current;
      fl.f.t += dt / fl.f.dur;
      const p = flightPoint(fl.f, fl.f.t);
      el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg) scale(${p.scale})`;
      if (fl.f.t >= 1) {
        flight.current = null;
        fl.onEnd();
      }
      return;
    }
    if (spring.current) {
      const s = spring.current;
      stepSpring(s.x, 0, dt, 220, 16);
      stepSpring(s.y, 0, dt, 220, 16);
      el.style.transform = `translate(${s.x.value}px, ${s.y.value}px) rotate(${s.x.velocity * 0.01}deg)`;
      if (Math.abs(s.x.value) < 0.5 && Math.abs(s.y.value) < 0.5 && Math.abs(s.x.velocity) < 5) {
        spring.current = null;
        el.style.transform = '';
        setAnimating(false);
      }
    }
  }, animating && !paused);

  const vectorTo = (pos: number) => {
    const box = boxEls.current[pos]?.getBoundingClientRect();
    const item = itemRef.current?.getBoundingClientRect();
    if (!box || !item) return { dx: 0, dy: 0 };
    const cur = dragState.current;
    return { dx: box.left + box.width / 2 - (item.left + item.width / 2) + (cur?.x ?? 0), dy: box.top + box.height * 0.45 - (item.top + item.height / 2) + (cur?.y ?? 0) };
  };

  const choose = (pos: number, input: 'tap' | 'drag' | 'keyboard') => {
    if (!trial || paused || flight.current) return;
    if (run.stage !== 'awaiting' && run.stage !== 'correction') return;
    if (run.stage === 'awaiting') run.markResponseStart(pos, input);
    const from = dragState.current ? { x: dragState.current.x, y: dragState.current.y } : { x: 0, y: 0 };
    const { dx, dy } = vectorTo(pos);
    dragState.current = null;
    playCue('tap', sound);
    const r = run.select(pos);
    if (r === 'ignored') {
      spring.current = { x: { value: from.x, velocity: 0 }, y: { value: from.y, velocity: 0 } };
      setAnimating(true);
      return;
    }
    if (r === 'correct') {
      levelTrials.current += 1;
      levelCorrect.current += 1;
    } else levelTrials.current += 1;
    const correctNow = pos === trial.positionOfTarget;
    playTones(WHOOSH, sound);
    if (motion === 'static') {
      if (correctNow) land(pos);
      else bounced(pos);
      return;
    }
    flight.current = {
      f: { x0: from.x, y0: from.y, x1: dx, y1: dy, apex: Math.max(60, Math.abs(dy) * 0.5 + 40), dur: correctNow ? 0.6 : 0.9, t: 0, spin: correctNow ? 220 : 120, bounce: !correctNow },
      onEnd: () => (correctNow ? land(pos) : bounced(pos)),
    };
    setAnimating(true);
  };

  function land(pos: number) {
    if (!trial) return;
    setAnimating(false);
    setGoneFor(trial.index);
    setGulp(pos);
    window.setTimeout(() => setGulp(null), 500);
    playTones(THUD, sound);
    if (feedback !== 'none') playCue('correct', sound);
    const cat = trial.boxes[pos]!.id;
    setStored((s) => ({ ...s, [cat]: [...(s[cat] ?? []), trial.item.art] }));
    announce(`Isso! ${trial.item.label} ${trial.correctCategory.place}.`);
  }
  function bounced(pos: number) {
    setAnimating(false);
    if (itemRef.current) itemRef.current.style.transform = '';
    playCue('retry', sound);
    announce(`Hmm, ${trial?.item.label} não fica ${trial?.boxes[pos]?.place ?? 'aí'}. Veja a caixa que brilha.`);
  }

  /* ------------------------------------------------------------ arrastar */

  const boxAt = (x: number, y: number) => {
    for (let i = 0; i < boxEls.current.length; i++) {
      const r = boxEls.current[i]?.getBoundingClientRect();
      if (r && x >= r.left && x <= r.right && y >= r.top - 20 && y <= r.bottom) return i;
    }
    return null;
  };
  const onItemDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!trial || paused || flight.current || (run.stage !== 'awaiting' && run.stage !== 'correction')) return;
    capturePointer(e.currentTarget, e.pointerId);
    spring.current = null;
    dragState.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: 0, y: 0, moved: false };
  };
  const onItemMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragState.current;
    if (!d || d.id !== e.pointerId) return;
    d.x = e.clientX - d.sx;
    d.y = e.clientY - d.sy;
    if (!d.moved && Math.hypot(d.x, d.y) > 6) {
      d.moved = true;
      if (run.stage === 'awaiting') run.markResponseStart(null, 'drag');
    }
    if (itemRef.current) itemRef.current.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${Math.max(-12, Math.min(12, d.x * 0.05))}deg) scale(1.08)`;
    setOverBox(boxAt(e.clientX, e.clientY));
  };
  const onItemUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragState.current;
    if (!d || d.id !== e.pointerId) return;
    setOverBox(null);
    const target = d.moved ? boxAt(e.clientX, e.clientY) : null;
    if (target != null) {
      choose(target, 'drag');
      return;
    }
    dragState.current = null;
    if (d.moved) {
      spring.current = { x: { value: d.x, velocity: 0 }, y: { value: d.y, velocity: 0 } };
      setAnimating(true);
    }
  };

  if (!config) return <div className="opc" aria-busy="true" />;

  return (
    <div
      className="opc"
      data-palette={config.adaptation.palette}
      data-motion={motion}
      data-arrived={arrived}
      style={{ ['--opc-scale' as string]: config.adaptation.touchScale, ['--opc-n' as string]: trial?.boxes.length ?? 2 }}
    >
      <header className="opc-head">
        {trial && <h1 className="opc-instruction">{trial.instruction}</h1>}
        <button type="button" className="opc-say" onClick={() => trial && void speak(trial.instruction, sound)} aria-label="Ouvir a pergunta de novo">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
            <path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a8.5 8.5 0 0 1 0 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="opc-stage">
        <div className="opc-belt" data-moving={!arrived && motion !== 'static'}>
          <Belt />
        </div>
        {trial && !gone && (
          <div
            key={trial.index}
            ref={itemRef}
            className="opc-item"
            role="img"
            aria-label={`Item: ${trial.item.label}`}
            data-hint={run.hint}
            onPointerDown={onItemDown}
            onPointerMove={onItemMove}
            onPointerUp={onItemUp}
            onPointerCancel={onItemUp}
          >
            <span className="opc-item__card">
              <StimulusArt art={trial.item.art} label={trial.item.label} />
            </span>
            <span className="opc-item__shadow" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="opc-boxes" role="group" aria-label="Caixas: onde guardar">
        {trial?.boxes.map((box, pos) => {
          const isTarget = pos === trial.positionOfTarget;
          const showHint = run.hint && isTarget && run.stage !== 'feedback';
          const items = stored[box.id] ?? [];
          return (
            <button
              key={`${trial.index}-${box.id}`}
              ref={(el) => {
                boxEls.current[pos] = el;
              }}
              type="button"
              className="opc-box"
              data-hint={showHint}
              data-over={overBox === pos}
              data-gulp={gulp === pos}
              data-faded={run.stage === 'feedback' && run.lastSelected !== pos}
              onClick={(e) => choose(pos, e.detail === 0 ? 'keyboard' : 'tap')}
              aria-label={`Guardar ${box.place}${items.length ? `, já tem ${items.length}` : ''}`}
            >
              <span className="opc-box__peek" aria-hidden="true">
                {items.slice(-3).map((a, k) => (
                  <span key={`${a}-${k}`} style={{ ['--k' as string]: k }}>
                    <StimulusArt art={a} />
                  </span>
                ))}
              </span>
              <span className="opc-box__art">
                <BoxArt art={box.art} />
              </span>
              <span className="opc-box__label">{box.label}</span>
            </button>
          );
        })}
      </div>

      <div className="opc-pins" aria-label={`${run.completed} de ${run.total}`} role="progressbar" aria-valuemin={0} aria-valuemax={run.total} aria-valuenow={run.completed}>
        {trials.map((t, k) => (
          <span key={t.index} className="opc-pin" data-done={k < run.completed} data-current={k === run.completed} data-level={t.level} />
        ))}
      </div>

      <p className="opc-sr" aria-live="polite">{live}</p>

      {banner && (
        <div className="opc-banner" aria-hidden="true">
          {banner}
        </div>
      )}
      {(paused || ended) && run.stage !== 'done' && (
        <div className="opc-overlay" role="status">
          <div className="opc-overlay__badge">Pausa</div>
        </div>
      )}
      {run.stage === 'done' && (
        <div className="opc-overlay opc-overlay--done" role="status">
          <div className="opc-overlay__badge">
            <span className="opc-done-boxes" aria-hidden="true">
              {Object.keys(stored)
                .slice(0, 4)
                .map((k) => (
                  <span key={k}>
                    <BoxArt art={trials.find((t) => t.correctCategory.id === k)?.correctCategory.art ?? 'bau'} />
                  </span>
                ))}
            </span>
            Tudo guardado no lugar certo!
          </div>
        </div>
      )}
    </div>
  );
}
