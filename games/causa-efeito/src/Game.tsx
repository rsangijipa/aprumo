import React, { useEffect, useRef, useState } from 'react';
import { playTones, useGameClient, useMotion } from '@aprumo/game-sdk';
import { type Bubble, createBubble, shouldTriggerMilestone } from './logic';
import { manifest } from './manifest';
import './game.css';

const MILESTONE_FANFARE = [
  { freq: 440, dur: 0.12, type: 'triangle' as const },
  { freq: 554.37, dur: 0.14, type: 'triangle' as const, delay: 0.08 },
  { freq: 659.25, dur: 0.22, type: 'triangle' as const, delay: 0.16 },
];

export default function CausaEEfeito() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppingId, setPoppingId] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const trialStartRef = useRef<number>(Date.now());
  const seedCounterRef = useRef(1);

  const sound = config?.adaptation.sound ?? 'low';

  useEffect(() => {
    if (config) {
      client.emit('SESSION_STARTED', { configVersion: manifest.version });
      client.emit('TRIAL_STARTED', { trialIndex: 0, targetId: 'toque-sensorial', presented: ['toque-sensorial'] });
      trialStartRef.current = Date.now();

      // Spawn initial bubbles
      const initial: Bubble[] = [
        createBubble('b-1', 120, 180, 1),
        createBubble('b-2', 260, 260, 2),
        createBubble('b-3', 180, 420, 3),
      ];
      setBubbles(initial);
    }
  }, [config, client]);

  if (!config) return <div className="cee" aria-busy="true" />;

  const handleInteraction = (x: number, y: number, bubbleId?: string) => {
    const latencyMs = Date.now() - trialStartRef.current;
    const targetBubble = bubbles.find((b) => b.id === bubbleId);
    const freq = targetBubble ? targetBubble.noteFreq : 440;

    playTones([{ freq, dur: 0.18, type: 'sine' }], sound);

    if (bubbleId) {
      setPoppingId(bubbleId);
      window.setTimeout(() => {
        setBubbles((prev) =>
          prev.map((b) => {
            if (b.id !== bubbleId) return b;
            seedCounterRef.current++;
            const newX = 80 + (Math.random() * 200);
            const newY = 120 + (Math.random() * 320);
            return createBubble(`b-${seedCounterRef.current}`, newX, newY, seedCounterRef.current);
          }),
        );
        setPoppingId(null);
      }, 300);
    }

    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    client.emit('TRIAL_COMPLETED', {
      trialIndex: nextCount - 1,
      targetId: 'toque-sensorial',
      stimulusId: bubbleId ?? 'superficie',
      presented: ['toque-sensorial'],
      positionOfTarget: 0,
      selected: bubbleId ?? 'superficie',
      selectedPosition: 0,
      response: 'correct',
      latencyMs,
      promptLevel: 'IND',
      promptSource: 'none',
      detail: { x, y },
    });

    if (shouldTriggerMilestone(nextCount, 5)) {
      playTones(MILESTONE_FANFARE, sound);
      client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: 'toques-completos' });
      const targetTrials = config?.clinical.trialsPerTarget ?? 10;
      if (nextCount >= targetTrials) {
        client.emit('SESSION_COMPLETED', { trialsCompleted: nextCount });
      }
    }

    trialStartRef.current = Date.now();
    client.emit('TRIAL_STARTED', { trialIndex: nextCount, targetId: 'toque-sensorial', presented: ['toque-sensorial'] });
  };

  const onContainerClick = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleInteraction(x, y);
  };

  return (
    <div className="cee" data-palette={config.adaptation.palette} data-motion={motion}>
      <button
        type="button"
        className="cee-surface"
        aria-label="Tocar na tela"
        onClick={onContainerClick}
      />
      <div className="cee-hint">Toque em qualquer lugar ou nas bolhinhas! ✨</div>

      {bubbles.map((b) => (
        <button
          key={b.id}
          type="button"
          className="cee-bubble"
          data-popping={poppingId === b.id}
          style={{
            left: `${b.x}px`,
            top: `${b.y}px`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            backgroundColor: b.color,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleInteraction(b.x, b.y, b.id);
          }}
          aria-label={b.label}
        >
          <span className="cee-star-icon" aria-hidden="true">★</span>
        </button>
      ))}

      <div className="cee-counter">
        <span>Toques felizes: {tapCount}</span>
      </div>

      {(paused || ended) && (
        <div className="cee-overlay" role="status">
          <div className="cee-overlay__badge">
            <span>Pausa</span>
          </div>
        </div>
      )}
    </div>
  );
}
