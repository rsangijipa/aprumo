import { useEffect, useMemo, useRef, useState } from 'react';
import { playTones, useGameClient, useMotion } from '@aprumo/game-sdk';
import { StimulusArt } from '@aprumo/stimuli';
import { planChefTrials } from './logic';
import { manifest } from './manifest';
import './game.css';

const PLOP = [
  { freq: 440, dur: 0.08, type: 'sine' as const },
  { freq: 659.25, dur: 0.14, type: 'triangle' as const, delay: 0.06 },
];
const STIR = [
  { freq: 523.25, dur: 0.1, type: 'triangle' as const },
  { freq: 659.25, dur: 0.1, type: 'triangle' as const, delay: 0.08 },
  { freq: 783.99, dur: 0.15, type: 'triangle' as const, delay: 0.16 },
  { freq: 1046.5, dur: 0.25, type: 'triangle' as const, delay: 0.24 },
];
const BUMP = [{ freq: 220, dur: 0.12, type: 'sawtooth' as const }];

export default function PequenoChef() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const trials = useMemo(() => (config ? planChefTrials(config) : []), [config]);

  const [stepIdx, setStepIdx] = useState(0);
  const [bowlItems, setBowlItems] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const trialStartRef = useRef<number>(Date.now());
  const busyRef = useRef(false);

  const sound = config?.adaptation.sound ?? 'low';
  const currentTrial = trials[stepIdx];

  useEffect(() => {
    if (config && currentTrial) {
      client.emit('SESSION_STARTED', { configVersion: manifest.version });
      client.emit('TRIAL_STARTED', { trialIndex: 0, targetId: currentTrial.targetItem.stimulusId, presented: currentTrial.options.map((o) => o.stimulusId) });
      trialStartRef.current = Date.now();
    }
  }, [config, client, currentTrial]);

  if (!config || !currentTrial) return <div className="chef" aria-busy="true" />;
  const scale = config.adaptation.touchScale;

  const onSelectItem = (pos: number) => {
    if (busyRef.current) return;
    const selected = currentTrial.options[pos]!;
    const isTarget = pos === currentTrial.positionOfTarget;
    const latencyMs = Date.now() - trialStartRef.current;

    if (isTarget) {
      busyRef.current = true;
      if (selected.art === 'colher') {
        playTones(STIR, sound);
      } else {
        playTones(PLOP, sound);
      }

      const newBowl = selected.art !== 'colher' ? [...bowlItems, selected.art] : bowlItems;
      setBowlItems(newBowl);

      client.emit('TRIAL_COMPLETED', {
        trialIndex: stepIdx,
        targetId: currentTrial.targetItem.stimulusId,
        stimulusId: selected.stimulusId,
        presented: currentTrial.options.map((o) => o.stimulusId),
        positionOfTarget: currentTrial.positionOfTarget,
        selected: selected.stimulusId,
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
          client.emit('TRIAL_STARTED', { trialIndex: stepIdx + 1, targetId: nextTrial.targetItem.stimulusId, presented: nextTrial.options.map((o) => o.stimulusId) });
        } else {
          setDone(true);
          client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: 'receita-completa' });
          client.emit('SESSION_COMPLETED', {
            trialsCompleted: trials.length,
          });
        }
      }, motion === 'static' ? 400 : 900);
    } else {
      playTones(BUMP, sound);
      client.emit('TRIAL_COMPLETED', {
        trialIndex: stepIdx,
        targetId: currentTrial.targetItem.stimulusId,
        stimulusId: selected.stimulusId,
        presented: currentTrial.options.map((o) => o.stimulusId),
        positionOfTarget: currentTrial.positionOfTarget,
        selected: selected.stimulusId,
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
    <div className="chef" data-palette={config.adaptation.palette} data-motion={motion} style={{ ['--chef-scale' as string]: scale }}>
      <div className="chef-instruction">{currentTrial.instruction}</div>

      {/* Tigela central de preparo */}
      <div className="chef-bowl-container">
        <div className="chef-bowl-rim" />
        <div className="chef-bowl">
          <div className="chef-ingredients-in-bowl">
            {bowlItems.map((art, idx) => (
              <div key={`${art}-${idx}`} className="chef-mini-art">
                <StimulusArt art={art} size={36} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Opções na bancada */}
      <div className="chef-options" role="group" aria-label="Ingredientes disponíveis">
        {currentTrial.options.map((opt, pos) => (
          <button
            key={`${currentTrial.stepIndex}-${opt.stimulusId}`}
            className="chef-card-btn"
            onClick={() => onSelectItem(pos)}
            aria-label={opt.label}
          >
            <div className="chef-card-art">
              <StimulusArt art={opt.art} label={opt.label} />
            </div>
            <span className="chef-card-label">{opt.label}</span>
          </button>
        ))}
      </div>

      {(paused || ended) && !done && (
        <div className="chef-overlay" role="status">
          <div className="chef-overlay__badge">
            <span>Pausa</span>
          </div>
        </div>
      )}

      {done && (
        <div className="chef-overlay" role="status">
          <div className="chef-overlay__badge">
            <span>Hummm! A receita ficou deliciosa! Parabéns, Chefinho!</span>
          </div>
        </div>
      )}
    </div>
  );
}
