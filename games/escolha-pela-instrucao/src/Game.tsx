import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { playTones, speak, useGameClient, useMotion, useTrialRunner } from '@aprumo/game-sdk';
import { StimulusArt } from '@aprumo/stimuli';
import { planListenerTrials } from './logic';
import { manifest } from './manifest';
import './game.css';

/** Timbre próprio: "sininho" de palco. */
const BELL = [{ freq: 784, dur: 0.35, type: 'sine' as const }, { freq: 1175, dur: 0.45, type: 'sine' as const, delay: 0.12 }];

export default function EscolhaPelaInstrucao() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const trials = useMemo(() => (config ? planListenerTrials(config) : []), [config]);
  const [speaking, setSpeaking] = useState(false);
  const [gate, setGate] = useState(false);
  const [tilt, setTilt] = useState<number | null>(null);
  const repeats = useRef(0);
  const instruction = useRef('');
  const sound = config?.adaptation.sound ?? 'low';

  const run = useTrialRunner({
    client, config, trials, paused, gate,
    latencyMaxMs: manifest.clinical.latencyMaxMs,
    feedbackMs: motion === 'static' ? 700 : 1300,
    detail: (): Record<string, unknown> => ({ instructionRepeats: repeats.current, instruction: instruction.current }),
  });

  const say = useCallback(
    async (text: string) => {
      setSpeaking(true);
      // Sem som configurado, a instrução é dada pelo adulto; o jogo só aguarda um instante.
      if (sound === 'off') await new Promise((r) => setTimeout(r, 1200));
      else await speak(text, sound);
      setSpeaking(false);
    },
    [sound],
  );

  // Cada tentativa começa com a instrução; a latência conta a partir do fim da fala.
  const lastIndex = useRef(-1);
  useEffect(() => {
    const t = run.trial;
    if (!t || run.stage !== 'awaiting' || paused || lastIndex.current === t.index) return;
    lastIndex.current = t.index;
    repeats.current = 0;
    instruction.current = t.instruction;
    setGate(false);
    const timer = window.setTimeout(() => void say(t.instruction).then(() => setGate(true)), 450);
    return () => window.clearTimeout(timer);
  }, [run.trial, run.stage, paused, say]);

  useEffect(() => {
    if (config) client.emit('SESSION_STARTED', { configVersion: manifest.version });
  }, [config, client]);

  useEffect(() => {
    if (run.stage === 'feedback' && config?.adaptation.feedback !== 'none') playTones(BELL, sound);
  }, [run.stage, config, sound]);

  if (!config) return <div className="epi" aria-busy="true" />;
  const trial = run.trial;

  const onPick = (pos: number) => {
    if (!gate && run.stage === 'awaiting') return; // ainda falando
    const r = run.select(pos);
    if (r === 'incorrect') {
      setTilt(pos);
      window.setTimeout(() => setTilt(null), 560);
    }
  };

  return (
    <div className="epi" data-palette={config.adaptation.palette} data-motion={motion} style={{ ['--epi-scale' as string]: config.adaptation.touchScale }}>
      <button
        className="epi-speaker"
        data-speaking={speaking}
        aria-label={trial ? `Ouvir de novo: ${trial.instruction}` : 'Ouvir instrução'}
        onClick={() => {
          if (!trial || speaking) return;
          repeats.current += 1;
          void say(trial.instruction);
        }}
      >
        <svg viewBox="0 0 64 48" aria-hidden="true">
          <path d="M6 18h10l14-12v36L16 30H6z" fill="#5a3a12" />
          <path className="wave" d="M38 16c4 4 4 12 0 16" fill="none" stroke="#5a3a12" strokeWidth="4" strokeLinecap="round" />
          <path className="wave wave--2" d="M46 9c8 8 8 22 0 30" fill="none" stroke="#5a3a12" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </button>

      <div className="epi-stage">
        <div className="epi-beams" aria-hidden="true">
          {trial?.options.map((o, pos) => {
            const isTarget = pos === trial.positionOfTarget;
            return <div key={o.stimulusId} className="epi-beam" data-on={run.hint && isTarget} data-dim={run.hint && !isTarget} />;
          })}
        </div>
        <div className="epi-shelf" role="group" aria-label={trial?.instruction ?? 'Estante'}>
          {trial?.options.map((o, pos) => {
            const isTarget = pos === trial.positionOfTarget;
            const state =
              run.stage === 'feedback' && isTarget ? 'hop'
              : tilt === pos ? 'tilt'
              : run.hint && !isTarget ? 'dim'
              : 'idle';
            return (
              <button key={`${trial.index}-${o.stimulusId}`} className="epi-niche" data-state={state} aria-label={o.label} onClick={() => onPick(pos)}>
                <span className="epi-lantern" aria-hidden="true" />
                <span className="epi-item"><StimulusArt art={o.art} label={o.label} /></span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="epi-caption" aria-live="polite">{trial && run.stage !== 'done' ? trial.instruction : ''}</p>
      <div className="epi-progress" aria-hidden="true">
        {trials.map((t, k) => <i key={t.index} data-done={k < run.completed} />)}
      </div>

      {(paused || ended) && run.stage !== 'done' && (
        <div className="epi-overlay" role="status"><div>
          <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="rgb(255 255 255 / .12)" /><rect x="33" y="28" width="11" height="44" rx="4" fill="#fff" /><rect x="56" y="28" width="11" height="44" rx="4" fill="#fff" /></svg>
          <span>Pausa</span>
        </div></div>
      )}
      {run.stage === 'done' && (
        <div className="epi-overlay" role="status"><div>
          <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#f2b84b" /><path d="m30 52 13 13 27-29" fill="none" stroke="#2c2540" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span>Acabou!</span>
        </div></div>
      )}
    </div>
  );
}
