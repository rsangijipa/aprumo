import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { playTones, useGameClient, useMotion, useTrialRunner } from '@aprumo/game-sdk';
import { fitGrid, planTrials, resolveMotion, resolveSettings, summarizeAttempts, type GridFit, type PlannedTrial } from './logic';
import { Stim } from './LabToken';
import { manifest } from './manifest';
import './game.css';

/** Inclinação fixa por posição: cartão real sobre a mesa, previsível (Laboratório zera via CSS). */
const TILT = [-2.5, 1.5, -1, 2, -1.5, 1, 2.5, -2, 1.2, -0.8, 1.8, -1.6];
const CHIME = [{ freq: 659, dur: 0.14, type: 'triangle' as const }, { freq: 880, dur: 0.22, type: 'triangle' as const, delay: 0.11 }];
const TAP = [{ freq: 1200, dur: 0.035, type: 'sine' as const }];
const LIFT = [{ freq: 740, dur: 0.05, type: 'sine' as const }];

type Method = 'tap' | 'drag' | 'pick-place' | 'keyboard';
interface Stats { t0: number; firstTouch: number | null; pickups: number[]; method: Method; committed: number }
const freshStats = (): Stats => ({ t0: performance.now(), firstTouch: null, pickups: [], method: 'tap', committed: -1 });

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

export default function MatchLab() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const sdkMotion = useMotion(config);
  const sysReduced = useSystemReducedMotion();
  const settings = useMemo(() => (config ? resolveSettings(config) : null), [config]);
  const motion = settings ? resolveMotion(settings, sdkMotion, sysReduced) : 'reduced';
  const trials = useMemo(() => (config && settings ? planTrials(config, settings) : []), [config, settings]);
  const mode = settings?.responseMode ?? 'tap';

  const stats = useRef<Stats>(freshStats());
  const trialRef = useRef<PlannedTrial | undefined>(undefined);
  const run = useTrialRunner({
    client, config, trials, paused,
    latencyMaxMs: manifest.clinical.latencyMaxMs,
    feedbackMs: motion === 'static' ? 700 : 1300,
    onTrialStart: () => { stats.current = freshStats(); },
    detail: () => {
      const t = trialRef.current;
      const s = stats.current;
      if (!t || !settings) return {};
      const a = s.committed >= 0 ? summarizeAttempts(s.pickups, s.committed, t.positionOfTarget) : { attempts: s.pickups.length, selfCorrected: false };
      return {
        dimension: t.dimension,
        fieldSize: t.fieldSize,
        dimensionFallback: t.dimensionFallback,
        modelId: t.model.stimulusId,
        presentedOrder: t.options.map((o) => o.stimulusId),
        responseMode: mode,
        inputMethod: s.committed >= 0 ? s.method : null,
        attempts: a.attempts,
        selfCorrected: a.selfCorrected,
        firstTouchLatencyMs: s.firstTouch == null ? null : Math.round(s.firstTouch),
        preset: settings.preset,
        sensory: settings.sensory,
      };
    },
  });
  const trial = run.trial;
  trialRef.current = trial;

  const handRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const slotBtnRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const ptr = useRef<{ id: number; pos: number; x0: number; y0: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [grid, setGrid] = useState<GridFit>({ cols: 3, rows: 1, item: 110, gap: 16, fits: true });
  const [fly, setFly] = useState<{ dx: number; dy: number; s: number } | null>(null);
  const [drag, setDrag] = useState<{ pos: number; dx: number; dy: number; over: boolean } | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [settle, setSettle] = useState<number | null>(null);
  const [sparks, setSparks] = useState(false);
  const [announce, setAnnounce] = useState('');
  const sound = config?.adaptation.sound ?? 'low';
  const feedback = config?.adaptation.feedback ?? 'subtle';
  const scale = config?.adaptation.touchScale ?? 1;
  const field = trial?.fieldSize ?? 0;

  useEffect(() => {
    if (config) client.emit('SESSION_STARTED', { configVersion: manifest.version });
  }, [config, client]);

  // Grade: mede a área livre e escolhe colunas que maximizam o cartão (nunca transborda em 320px).
  useLayoutEffect(() => {
    const el = handRef.current;
    if (!el || !field) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const next = fitGrid(field, r.width - 8, r.height - 8, scale);
      setGrid((g) => (g.cols === next.cols && g.item === next.item && g.gap === next.gap ? g : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [field, scale]);

  // Nova tentativa: limpa estados de interação.
  useEffect(() => { setPicked(null); setDrag(null); setSettle(null); }, [trial?.index]);

  // FLIP: voo do cartão correto até o encaixe, ajustando a escala ao tamanho do encaixe.
  useLayoutEffect(() => {
    if (run.stage !== 'feedback' || run.lastSelected == null) return setFly(null);
    const card = cardRefs.current[run.lastSelected]?.getBoundingClientRect();
    const slot = slotRef.current?.getBoundingClientRect();
    if (card && slot) setFly({ dx: slot.left + slot.width / 2 - (card.left + card.width / 2), dy: slot.top + slot.height / 2 - (card.top + card.height / 2), s: slot.width / card.width });
  }, [run.stage, run.lastSelected]);

  useEffect(() => {
    if (run.stage !== 'feedback') return;
    if (feedback !== 'none') playTones(CHIME, sound);
    if (settings?.sensory === 'rich' && motion !== 'static') setSparks(true);
    setAnnounce('Combinou!');
    const t = window.setTimeout(() => setSparks(false), 1300);
    return () => window.clearTimeout(t);
  }, [run.stage, feedback, sound, motion, settings?.sensory]);

  if (!config || !settings) return <div className="mlab" aria-busy="true" />;

  const canAct = !paused && !ended && (run.stage === 'awaiting' || run.stage === 'correction');
  const markTouch = () => {
    const s = stats.current;
    if (s.firstTouch == null) s.firstTouch = performance.now() - s.t0;
  };

  const commit = (pos: number, method: Method) => {
    if (!trial || !canAct) return;
    markTouch();
    if (run.stage === 'awaiting') { stats.current.method = method; stats.current.committed = pos; }
    playTones(TAP, sound);
    const r = run.select(pos);
    setPicked(null);
    if (r !== 'correct') setDrag(null);
    if (r === 'incorrect' || r === 'ignored') {
      // Reorientação calma: o cartão volta ao lugar, o modelo "chama o olhar" e a dica aparece.
      setSettle(pos);
      setAnnounce('Vamos olhar o modelo de novo.');
      window.setTimeout(() => setSettle((p) => (p === pos ? null : p)), 900);
    }
  };

  const pick = (pos: number, method: Method) => {
    if (!canAct) return;
    markTouch();
    stats.current.pickups.push(pos);
    stats.current.method = method;
    const next = picked === pos ? null : pos;
    setPicked(next);
    if (next != null) {
      playTones(LIFT, sound);
      setAnnounce(`${trial?.options[pos]?.label ?? 'Cartão'} na mão. Agora toque no espaço ao lado do modelo.`);
      if (method === 'keyboard') requestAnimationFrame(() => slotBtnRef.current?.focus());
    }
  };

  const onCardClick = (pos: number, keyboard: boolean) => {
    if (suppressClick.current) { suppressClick.current = false; return; }
    if (mode === 'tap') commit(pos, keyboard ? 'keyboard' : 'tap');
    else pick(pos, keyboard ? 'keyboard' : 'pick-place');
  };

  const overSlot = (x: number, y: number) => {
    const r = slotRef.current?.getBoundingClientRect();
    if (!r) return false;
    const m = r.width * 0.35;
    return x > r.left - m && x < r.right + m && y > r.top - m && y < r.bottom + m;
  };
  const onPointerDown = (e: PointerEvent<HTMLButtonElement>, pos: number) => {
    suppressClick.current = false;
    if (mode !== 'drag' || !canAct || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    ptr.current = { id: e.pointerId, pos, x0: e.clientX, y0: e.clientY, dragging: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const p = ptr.current;
    if (!p || p.id !== e.pointerId) return;
    const dx = e.clientX - p.x0, dy = e.clientY - p.y0;
    if (!p.dragging && Math.hypot(dx, dy) < 8) return;
    if (!p.dragging) {
      p.dragging = true;
      markTouch();
      stats.current.pickups.push(p.pos);
      setPicked(null);
    }
    setDrag({ pos: p.pos, dx, dy, over: overSlot(e.clientX, e.clientY) });
  };
  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    const p = ptr.current;
    if (!p || p.id !== e.pointerId) return;
    ptr.current = null;
    if (!p.dragging) return; // toque simples: o click cuida (pegar-e-colocar)
    suppressClick.current = true;
    if (overSlot(e.clientX, e.clientY)) commit(p.pos, 'drag');
    else setDrag(null);
  };
  const onPointerCancel = () => { ptr.current = null; setDrag(null); };

  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') { setPicked(null); return; }
    const i = cardRefs.current.findIndex((el) => el === document.activeElement);
    if (i < 0) return;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -grid.cols, ArrowDown: grid.cols }[e.key];
    if (step == null) return;
    e.preventDefault();
    const j = i + step;
    if (j >= 0 && j < field) cardRefs.current[j]?.focus();
  };

  const reorient = settle != null || run.stage === 'correction';
  const vars = {
    '--mlab-scale': scale,
    '--mlab-item': `${grid.item}px`,
    '--mlab-cols': grid.cols,
    '--mlab-gap': `${grid.gap}px`,
  } as CSSProperties;

  return (
    <div
      className="mlab"
      data-preset={settings.preset}
      data-sensory={settings.sensory}
      data-palette={config.adaptation.palette}
      data-motion={motion}
      data-mode={mode}
      style={vars}
    >
      <div className="mlab-scene" aria-hidden="true"><span /><span /></div>

      {/* Bandeja: modelo + encaixe */}
      <div className="mlab-tray" data-glow={run.stage === 'feedback'} data-reorient={reorient}>
        {trial && (
          <div className="mlab-card mlab-card--model" role="img" aria-label={`Modelo: ${trial.model.label}`}>
            <Stim art={trial.model.art} label={trial.model.label} />
          </div>
        )}
        <div className="mlab-slot" ref={slotRef} data-ready={picked != null || !!drag} data-over={!!drag?.over}>
          {mode === 'drag' ? (
            <button
              ref={slotBtnRef}
              className="mlab-slot__btn"
              aria-label={picked != null ? `Colocar ${trial?.options[picked]?.label ?? ''} ao lado do modelo` : 'Espaço ao lado do modelo'}
              aria-disabled={picked == null}
              onClick={(e) => picked != null && commit(picked, e.detail === 0 ? 'keyboard' : stats.current.method === 'keyboard' ? 'keyboard' : 'pick-place')}
            />
          ) : null}
          {sparks && (
            <div className="mlab-sparks" aria-hidden="true">
              {Array.from({ length: 8 }, (_, k) => <span key={k} style={{ '--k': k } as CSSProperties} />)}
            </div>
          )}
        </div>
      </div>

      {/* Campo de escolha */}
      <div className="mlab-hand" ref={handRef} data-scroll={!grid.fits}>
        <div
          className="mlab-grid"
          role="toolbar"
          aria-label={mode === 'drag' ? 'Leve ao modelo o cartão que combina' : 'Toque no cartão que combina com o modelo'}
          onKeyDown={onGridKey}
        >
          {trial?.options.map((o, pos) => {
            const isTarget = pos === trial.positionOfTarget;
            const dragging = drag?.pos === pos;
            const state =
              run.stage === 'feedback' && run.lastSelected === pos ? 'matched'
              : run.stage === 'feedback' ? 'faded'
              : dragging ? 'dragging'
              : settle === pos ? 'settle'
              : picked === pos ? 'lifted'
              : 'idle';
            const style =
              state === 'matched' && fly ? { '--dx': `${fly.dx}px`, '--dy': `${fly.dy}px`, '--fs': fly.s }
              : dragging ? { '--dx': `${drag.dx}px`, '--dy': `${drag.dy}px` }
              : undefined;
            return (
              <button
                key={`${trial.index}-${o.stimulusId}`}
                ref={(el) => { cardRefs.current[pos] = el; }}
                className="mlab-choice"
                data-state={state}
                data-hint={run.hint && isTarget && run.stage !== 'feedback'}
                aria-label={o.label}
                aria-pressed={mode === 'drag' ? picked === pos : undefined}
                onClick={(e) => onCardClick(pos, e.detail === 0)}
                onPointerDown={(e) => onPointerDown(e, pos)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                style={style as CSSProperties | undefined}
              >
                <div className="mlab-card" style={{ '--mlab-tilt': `${TILT[pos % TILT.length]}deg` } as CSSProperties}>
                  <Stim art={o.art} label={o.label} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progresso previsível */}
      <div className="mlab-pins" aria-label={`${run.completed} de ${run.total}`} role="progressbar" aria-valuemin={0} aria-valuemax={run.total} aria-valuenow={run.completed}>
        {trials.map((t, k) => <span key={t.index} className="mlab-pin" data-done={k < run.completed} data-current={k === run.completed} />)}
      </div>

      <p className="mlab-sr" aria-live="polite">{announce}</p>

      {(paused || ended) && run.stage !== 'done' && (
        <div className="mlab-overlay" role="status">
          <div className="mlab-overlay__badge">
            <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" className="mlab-badge-bg" /><rect x="34" y="29" width="11" height="42" rx="5" className="mlab-badge-ink" /><rect x="55" y="29" width="11" height="42" rx="5" className="mlab-badge-ink" /></svg>
            <span>Pausa</span>
          </div>
        </div>
      )}
      {run.stage === 'done' && (
        <div className="mlab-overlay" role="status">
          <div className="mlab-overlay__badge">
            <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" className="mlab-badge-bg" /><path d="m30 52 13 13 27-29" fill="none" className="mlab-badge-stroke" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>Acabou!</span>
          </div>
        </div>
      )}
    </div>
  );
}
