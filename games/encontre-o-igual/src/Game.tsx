import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { playTones, useGameClient, useMotion, useTrialRunner } from '@aprumo/game-sdk';
import { StimulusArt } from '@aprumo/stimuli';
import { planTrials } from './logic';
import { manifest } from './manifest';
import './game.css';

/** Inclinação fixa por posição: parece um cartão real sobre a mesa, e é previsível. */
const TILT = [-3, 1.5, -1, 2.5];
/** Timbre próprio: "papel" (triângulo suave). */
const CHIME = [{ freq: 659, dur: 0.14, type: 'triangle' as const }, { freq: 880, dur: 0.22, type: 'triangle' as const, delay: 0.11 }];
const TAP = [{ freq: 1200, dur: 0.035, type: 'sine' as const }];

export default function EncontreOIgual() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const trials = useMemo(() => (config ? planTrials(config) : []), [config]);
  const run = useTrialRunner({ client, config, trials, paused, latencyMaxMs: manifest.clinical.latencyMaxMs, feedbackMs: motion === 'static' ? 700 : 1250 });
  const slotRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [fly, setFly] = useState<{ dx: number; dy: number } | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const [pompons, setPompons] = useState<number[]>([]);
  const sound = config?.adaptation.sound ?? 'low';
  const feedback = config?.adaptation.feedback ?? 'subtle';

  useEffect(() => {
    if (config) client.emit('SESSION_STARTED', { configVersion: manifest.version });
  }, [config, client]);

  // Calcula o voo do cartão correto até o encaixe da bandeja (FLIP).
  useLayoutEffect(() => {
    if (run.stage !== 'feedback' || run.lastSelected == null) return setFly(null);
    const card = cardRefs.current[run.lastSelected]?.getBoundingClientRect();
    const slot = slotRef.current?.getBoundingClientRect();
    if (card && slot) setFly({ dx: slot.left + slot.width / 2 - (card.left + card.width / 2), dy: slot.top + slot.height / 2 - (card.top + card.height / 2) });
  }, [run.stage, run.lastSelected]);

  useEffect(() => {
    if (run.stage !== 'feedback') return;
    if (feedback !== 'none') playTones(CHIME, sound);
    if (feedback === 'festive' && motion !== 'static') setPompons([0, 1, 2, 3, 4, 5]);
    const t = window.setTimeout(() => setPompons([]), 1200);
    return () => window.clearTimeout(t);
  }, [run.stage, feedback, sound, motion]);

  if (!config) return <div className="eoi" aria-busy="true" />;
  const scale = config.adaptation.touchScale;
  const trial = run.trial;

  const onPick = (pos: number) => {
    playTones(TAP, sound);
    const r = run.select(pos);
    if (r === 'incorrect') {
      setWrong(pos);
      window.setTimeout(() => setWrong(null), 560);
    }
  };

  return (
    <div className="eoi" data-palette={config.adaptation.palette} data-motion={motion} style={{ ['--eoi-scale' as string]: scale }}>
      {/* Bandeja: modelo + encaixe */}
      <div className="eoi-tray" data-glow={run.stage === 'feedback'}>
        {trial && (
          <div className="eoi-card eoi-card--model" role="img" aria-label={`Modelo: ${trial.target.stimulus.label}`}>
            <StimulusArt art={trial.target.stimulus.art} label={trial.target.stimulus.label} />
          </div>
        )}
        <div className="eoi-slot" ref={slotRef} aria-hidden="true" />
      </div>

      {/* Cartões sobre o feltro */}
      <div className="eoi-hand" role="group" aria-label="Escolha o cartão igual ao modelo">
        {trial?.options.map((o, pos) => {
          const isTarget = pos === trial.positionOfTarget;
          const state =
            run.stage === 'feedback' && run.lastSelected === pos ? 'matched'
            : run.stage === 'feedback' ? 'faded'
            : wrong === pos ? 'wrong'
            : 'idle';
          return (
            <button
              key={`${trial.index}-${o.stimulusId}`}
              ref={(el) => { cardRefs.current[pos] = el; }}
              data-state={state}
              data-hint={run.hint && isTarget && run.stage !== 'feedback'}
              aria-label={o.label}
              onClick={() => onPick(pos)}
              style={state === 'matched' && fly ? ({ ['--dx' as string]: `${fly.dx}px`, ['--dy' as string]: `${fly.dy}px` }) : undefined}
            >
              <div className="eoi-card" style={{ ['--eoi-tilt' as string]: `${TILT[pos] ?? 0}deg` }}>
                <StimulusArt art={o.art} label={o.label} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Progresso previsível: alfinetes */}
      <div className="eoi-pins" aria-label={`${run.completed} de ${run.total}`} role="progressbar" aria-valuemin={0} aria-valuemax={run.total} aria-valuenow={run.completed}>
        {trials.map((t, k) => <span key={t.index} className="eoi-pin" data-done={k < run.completed} data-current={k === run.completed} />)}
      </div>

      {pompons.map((k) => (
        <span key={k} className="eoi-pompom" style={{ left: `calc(50% + ${(k - 2.5) * 34}px)`, top: '22%', background: ['#ffe08a', '#f4ead6', '#f6b39b', '#bfe3c8'][k % 4], ['--px' as string]: `${(k - 2.5) * 22}px` }} />
      ))}

      {(paused || ended) && run.stage !== 'done' && (
        <div className="eoi-overlay" role="status">
          <div className="eoi-overlay__badge">
            <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="rgb(255 255 255 / .15)" /><rect x="33" y="28" width="11" height="44" rx="4" fill="#fff" /><rect x="56" y="28" width="11" height="44" rx="4" fill="#fff" /></svg>
            <span>Pausa</span>
          </div>
        </div>
      )}
      {run.stage === 'done' && (
        <div className="eoi-overlay" role="status">
          <div className="eoi-overlay__badge">
            <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#f4ead6" /><path d="m30 52 13 13 27-29" fill="none" stroke="#3c624b" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>Acabou!</span>
          </div>
        </div>
      )}
    </div>
  );
}
