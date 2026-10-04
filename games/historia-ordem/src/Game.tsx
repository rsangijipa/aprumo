import { useEffect, useMemo, useRef, useState } from 'react';
import { playTones, useGameClient, useMotion } from '@aprumo/game-sdk';
import { planStoryTrials, type StoryStep } from './logic';
import { manifest } from './manifest';
import './game.css';

const TAP = [{ freq: 1100, dur: 0.03, type: 'sine' as const }];
const SUCCESS = [
  { freq: 440, dur: 0.12, type: 'triangle' as const },
  { freq: 554.37, dur: 0.12, type: 'triangle' as const, delay: 0.1 },
  { freq: 659.25, dur: 0.22, type: 'triangle' as const, delay: 0.2 },
];
const RETRY = [{ freq: 240, dur: 0.16, type: 'sawtooth' as const }];

export default function HistoriaEmOrdem() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const trials = useMemo(() => (config ? planStoryTrials(config) : []), [config]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedSteps, setSelectedSteps] = useState<StoryStep[]>([]);
  const [done, setDone] = useState(false);
  const trialStartRef = useRef<number>(Date.now());
  const busyRef = useRef(false);

  const sound = config?.adaptation.sound ?? 'low';
  const currentTrial = trials[currentIdx];

  useEffect(() => {
    if (config && currentTrial) {
      client.emit('SESSION_STARTED', { configVersion: manifest.version });
      client.emit('TRIAL_STARTED', { trialIndex: 0, targetId: currentTrial.story.id, presented: currentTrial.shuffledSteps.map((s) => s.id) });
      trialStartRef.current = Date.now();
    }
  }, [config, client, currentTrial]);

  if (!config || !currentTrial) return <div className="heo" aria-busy="true" />;
  const scale = config.adaptation.touchScale;

  const onSelectCard = (step: StoryStep) => {
    if (busyRef.current || selectedSteps.some((s) => s.id === step.id)) return;

    playTones(TAP, sound);
    const updated = [...selectedSteps, step];
    setSelectedSteps(updated);

    if (updated.length === 3) {
      busyRef.current = true;
      const latencyMs = Date.now() - trialStartRef.current;
      const isCorrect =
        updated[0]!.stepNumber === 1 &&
        updated[1]!.stepNumber === 2 &&
        updated[2]!.stepNumber === 3;

      if (isCorrect) {
        playTones(SUCCESS, sound);
        client.emit('TRIAL_COMPLETED', {
          trialIndex: currentIdx,
          targetId: currentTrial.story.id,
          stimulusId: currentTrial.story.id,
          presented: currentTrial.shuffledSteps.map((s) => s.id),
          positionOfTarget: 0,
          selected: updated[0]!.id,
          selectedPosition: 0,
          response: 'correct',
          latencyMs,
          promptLevel: 'IND',
          promptSource: 'none',
          detail: {},
        });

        window.setTimeout(() => {
          if (currentIdx + 1 < trials.length) {
            const nextTrial = trials[currentIdx + 1]!;
            setCurrentIdx((c) => c + 1);
            setSelectedSteps([]);
            busyRef.current = false;
            trialStartRef.current = Date.now();
            client.emit('TRIAL_STARTED', { trialIndex: currentIdx + 1, targetId: nextTrial.story.id, presented: nextTrial.shuffledSteps.map((s) => s.id) });
          } else {
            setDone(true);
            client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: 'historia-completa' });
            client.emit('SESSION_COMPLETED', {
              trialsCompleted: trials.length,
            });
          }
        }, motion === 'static' ? 400 : 1000);
      } else {
        playTones(RETRY, sound);
        client.emit('TRIAL_COMPLETED', {
          trialIndex: currentIdx,
          targetId: currentTrial.story.id,
          stimulusId: currentTrial.story.id,
          presented: currentTrial.shuffledSteps.map((s) => s.id),
          positionOfTarget: 0,
          selected: updated[0]!.id,
          selectedPosition: 0,
          response: 'incorrect',
          latencyMs,
          promptLevel: 'IND',
          promptSource: 'none',
          detail: {},
        });

        window.setTimeout(() => {
          setSelectedSteps([]);
          busyRef.current = false;
        }, motion === 'static' ? 300 : 800);
      }
    }
  };

  return (
    <div className="heo" data-palette={config.adaptation.palette} data-motion={motion} style={{ ['--heo-scale' as string]: scale }}>
      <div className="heo-title">{currentTrial.story.title}</div>

      {/* Slots de montagem cronológica */}
      <div className="heo-timeline" role="group" aria-label="Linha do tempo da história">
        {[1, 2, 3].map((num, i) => {
          const placed = selectedSteps[i];
          return (
            <div key={num} className="heo-slot">
              <span className="heo-slot__number">{num}º</span>
              {placed ? (
                <>
                  <span className="heo-card-icon">{placed.icon}</span>
                  <span className="heo-card-label">{placed.label}</span>
                </>
              ) : (
                <span style={{ color: '#9baea8', fontSize: '0.9rem' }}>Toque abaixo</span>
              )}
            </div>
          );
        })}
      </div>

      {selectedSteps.length > 0 && selectedSteps.length < 3 && (
        <button className="heo-reset-btn" onClick={() => setSelectedSteps([])}>
          ↺ Recomeçar ordem
        </button>
      )}

      {/* Cartões disponíveis */}
      <div className="heo-cards-pool" role="group" aria-label="Cartões para ordenar">
        {currentTrial.shuffledSteps.map((step) => {
          const isPlaced = selectedSteps.some((s) => s.id === step.id);
          return (
            <button
              key={step.id}
              className="heo-card-btn"
              data-selected={isPlaced}
              onClick={() => onSelectCard(step)}
              aria-label={step.label}
            >
              <span className="heo-card-icon" aria-hidden="true">{step.icon}</span>
              <span className="heo-card-label">{step.label}</span>
            </button>
          );
        })}
      </div>

      {(paused || ended) && !done && (
        <div className="heo-overlay" role="status">
          <div className="heo-overlay__badge">
            <span>Pausa</span>
          </div>
        </div>
      )}

      {done && (
        <div className="heo-overlay" role="status">
          <div className="heo-overlay__badge">
            <span>História completa! Você organizou tudo certinho!</span>
          </div>
        </div>
      )}
    </div>
  );
}
