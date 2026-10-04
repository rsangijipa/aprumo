import { useEffect, useMemo, useRef, useState } from 'react';
import { playTones, useGameClient, useMotion } from '@aprumo/game-sdk';
import { ADL_MISSIONS, planMissionTrials } from './logic';
import { manifest } from './manifest';
import './game.css';

const TAP = [{ freq: 1100, dur: 0.03, type: 'sine' as const }];
const STEP_SUCCESS = [
  { freq: 523.25, dur: 0.12, type: 'triangle' as const },
  { freq: 659.25, dur: 0.18, type: 'triangle' as const, delay: 0.1 },
];
const BUMP = [{ freq: 220, dur: 0.12, type: 'sawtooth' as const }];

export default function MissaoIndependencia() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const trials = useMemo(() => (config ? planMissionTrials(config, 0) : []), [config]);

  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);
  const trialStartRef = useRef<number>(Date.now());
  const busyRef = useRef(false);

  const sound = config?.adaptation.sound ?? 'low';
  const mission = ADL_MISSIONS[0]!;
  const currentTrial = trials[stepIdx];

  useEffect(() => {
    if (config && currentTrial) {
      client.emit('SESSION_STARTED', { configVersion: manifest.version });
      client.emit('TRIAL_STARTED', { trialIndex: 0, targetId: currentTrial.targetStep.id, presented: currentTrial.options.map((o) => o.id) });
      trialStartRef.current = Date.now();
    }
  }, [config, client, currentTrial]);

  if (!config || !currentTrial) return <div className="adl" aria-busy="true" />;
  const scale = config.adaptation.touchScale;

  const onSelectAction = (pos: number) => {
    if (busyRef.current) return;
    const selected = currentTrial.options[pos]!;
    const isTarget = pos === currentTrial.positionOfTarget;
    const latencyMs = Date.now() - trialStartRef.current;

    playTones(TAP, sound);

    if (isTarget) {
      busyRef.current = true;
      playTones(STEP_SUCCESS, sound);

      client.emit('TRIAL_COMPLETED', {
        trialIndex: stepIdx,
        targetId: currentTrial.targetStep.id,
        stimulusId: selected.id,
        presented: currentTrial.options.map((o) => o.id),
        positionOfTarget: currentTrial.positionOfTarget,
        selected: selected.id,
        selectedPosition: pos,
        response: 'correct',
        latencyMs,
        promptLevel: 'IND',
        promptSource: 'none',
        detail: {},
      });

      window.setTimeout(() => {
        if (stepIdx + 1 < trials.length) {
          const nextTrial = trials[stepIdx + 1]!;
          setStepIdx((s) => s + 1);
          busyRef.current = false;
          trialStartRef.current = Date.now();
          client.emit('TRIAL_STARTED', { trialIndex: stepIdx + 1, targetId: nextTrial.targetStep.id, presented: nextTrial.options.map((o) => o.id) });
        } else {
          setDone(true);
          client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: 'missao-completa' });
          client.emit('SESSION_COMPLETED', {
            trialsCompleted: trials.length,
          });
        }
      }, motion === 'static' ? 400 : 800);
    } else {
      playTones(BUMP, sound);
      client.emit('TRIAL_COMPLETED', {
        trialIndex: stepIdx,
        targetId: currentTrial.targetStep.id,
        stimulusId: selected.id,
        presented: currentTrial.options.map((o) => o.id),
        positionOfTarget: currentTrial.positionOfTarget,
        selected: selected.id,
        selectedPosition: pos,
        response: 'incorrect',
        latencyMs,
        promptLevel: 'IND',
        promptSource: 'none',
        detail: {},
      });
    }
  };

  return (
    <div className="adl" data-palette={config.adaptation.palette} data-motion={motion} style={{ ['--adl-scale' as string]: scale }}>
      <div className="adl-header">
        <div className="adl-title">{mission.title}</div>
        <div className="adl-instruction">Qual é a próxima ação?</div>
      </div>

      {/* Lista de passos / checklist */}
      <div className="adl-checklist" role="region" aria-label="Progresso da rotina">
        {mission.steps.map((st, i) => {
          const status = i < stepIdx ? 'done' : i === stepIdx ? 'current' : 'upcoming';
          return (
            <div key={st.id} className="adl-check-item" data-status={status}>
              <span>{status === 'done' ? '✓' : `${i + 1}.`}</span>
              <span>{st.label}</span>
            </div>
          );
        })}
      </div>

      {/* Opções de ação */}
      <div className="adl-options" role="group" aria-label="Ações para escolher">
        {currentTrial.options.map((opt, pos) => (
          <button
            key={`${currentTrial.stepNum}-${opt.id}`}
            className="adl-card-btn"
            onClick={() => onSelectAction(pos)}
            aria-label={opt.label}
          >
            <span className="adl-card-icon" aria-hidden="true">{opt.icon}</span>
            <span className="adl-card-label">{opt.label}</span>
          </button>
        ))}
      </div>

      {(paused || ended) && !done && (
        <div className="adl-overlay" role="status">
          <div className="adl-overlay__badge">
            <span>Pausa</span>
          </div>
        </div>
      )}

      {done && (
        <div className="adl-overlay" role="status">
          <div className="adl-overlay__badge">
            <span>Missão cumprida com sucesso! Você é muito independente!</span>
          </div>
        </div>
      )}
    </div>
  );
}
