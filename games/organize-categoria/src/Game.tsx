import { useEffect, useMemo, useState } from 'react';
import { playTones, useGameClient, useMotion, useTrialRunner } from '@aprumo/game-sdk';
import { StimulusArt } from '@aprumo/stimuli';
import { planCategoryTrials } from './logic';
import { manifest } from './manifest';
import './game.css';

const CHIME = [
  { freq: 587.33, dur: 0.12, type: 'triangle' as const },
  { freq: 880, dur: 0.24, type: 'triangle' as const, delay: 0.1 },
];
const TAP = [{ freq: 1100, dur: 0.03, type: 'sine' as const }];
const BUMP = [{ freq: 220, dur: 0.15, type: 'sawtooth' as const }];

export default function OrganizePorCategoria() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const trials = useMemo(() => (config ? planCategoryTrials(config) : []), [config]);
  const run = useTrialRunner({
    client,
    config,
    trials,
    paused,
    latencyMaxMs: manifest.clinical.latencyMaxMs,
    feedbackMs: motion === 'static' ? 600 : 1100,
  });

  const [wrong, setWrong] = useState<number | null>(null);
  const sound = config?.adaptation.sound ?? 'low';
  const feedback = config?.adaptation.feedback ?? 'subtle';

  useEffect(() => {
    if (config) client.emit('SESSION_STARTED', { configVersion: manifest.version });
  }, [config, client]);

  useEffect(() => {
    if (run.stage !== 'feedback') return;
    if (feedback !== 'none') playTones(CHIME, sound);
  }, [run.stage, feedback, sound]);

  if (!config) return <div className="opc" aria-busy="true" />;
  const scale = config.adaptation.touchScale;
  const trial = run.trial;

  const onSelectBox = (pos: number) => {
    playTones(TAP, sound);
    const r = run.select(pos);
    if (r === 'incorrect') {
      playTones(BUMP, sound);
      setWrong(pos);
      window.setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <div className="opc" data-palette={config.adaptation.palette} data-motion={motion} style={{ ['--opc-scale' as string]: scale }}>
      {trial && <div className="opc-instruction">{trial.instruction}</div>}

      {/* Item em destaque */}
      <div className="opc-tray">
        {trial && (
          <div className="opc-card" role="img" aria-label={`Item: ${trial.item.label}`}>
            <StimulusArt art={trial.item.art} label={trial.item.label} />
          </div>
        )}
      </div>

      {/* Caixas de categorias */}
      <div className="opc-boxes" role="group" aria-label="Caixas de categorias">
        {trial?.boxes.map((box, pos) => {
          const isTarget = pos === trial.positionOfTarget;
          const state =
            run.stage === 'feedback' && run.lastSelected === pos
              ? 'matched'
              : run.stage === 'feedback'
                ? 'faded'
                : wrong === pos
                  ? 'wrong'
                  : 'idle';

          return (
            <button
              key={`${trial.index}-${box.id}`}
              className="opc-box-btn"
              data-state={state}
              data-hint={run.hint && isTarget && run.stage !== 'feedback'}
              onClick={() => onSelectBox(pos)}
              aria-label={`Caixa de ${box.label}`}
            >
              <span className="opc-box-icon" aria-hidden="true">{box.icon}</span>
              <span className="opc-box-label">{box.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pinos de progresso */}
      <div
        className="opc-pins"
        aria-label={`${run.completed} de ${run.total}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={run.total}
        aria-valuenow={run.completed}
      >
        {trials.map((t, k) => (
          <span
            key={t.index}
            className="opc-pin"
            data-done={k < run.completed}
            data-current={k === run.completed}
          />
        ))}
      </div>

      {(paused || ended) && run.stage !== 'done' && (
        <div className="opc-overlay" role="status">
          <div className="opc-overlay__badge">
            <span>Pausa</span>
          </div>
        </div>
      )}

      {run.stage === 'done' && (
        <div className="opc-overlay" role="status">
          <div className="opc-overlay__badge">
            <span>Parabéns! Você organizou tudo!</span>
          </div>
        </div>
      )}
    </div>
  );
}
