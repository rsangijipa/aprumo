import { useEffect, useRef, useState } from 'react';
import { playTones, speak, useGameClient } from '@aprumo/game-sdk';
import {
  type WorldTheme,
  type WorldObject,
  WORLD_ENVIRONMENTS,
  checkMissionProgress,
} from './logic';
import { manifest } from './manifest';
import './game.css';

const SOUNDS = {
  click: [{ freq: 440, dur: 0.06, type: 'triangle' as const }],
  bell: [
    { freq: 659.25, dur: 0.1, type: 'sine' as const },
    { freq: 880, dur: 0.25, delay: 0.08, type: 'sine' as const },
  ],
  chime: [
    { freq: 523.25, dur: 0.12, type: 'sine' as const },
    { freq: 659.25, dur: 0.14, delay: 0.08, type: 'sine' as const },
    { freq: 783.99, dur: 0.25, delay: 0.16, type: 'sine' as const },
  ],
  chew: [
    { freq: 330, dur: 0.08, type: 'triangle' as const },
    { freq: 392, dur: 0.1, delay: 0.08, type: 'triangle' as const },
  ],
  heartbeat: [
    { freq: 110, dur: 0.15, type: 'sine' as const },
    { freq: 110, dur: 0.15, delay: 0.2, type: 'sine' as const },
  ],
};

export default function MiniMundos() {
  const { client, config } = useGameClient(manifest.appId, manifest.version);
  const [activeTheme, setActiveTheme] = useState<WorldTheme>('casa');
  const [mode, setMode] = useState<'livre' | 'missao'>('missao');
  const [interactionHistory, setInteractionHistory] = useState<string[]>([]);
  const [lastActionText, setLastActionText] = useState<string | null>(null);
  const [isMissionComplete, setIsMissionComplete] = useState(false);

  const bubbleTimerRef = useRef<number | null>(null);
  const currentWorld = WORLD_ENVIRONMENTS[activeTheme];

  useEffect(() => {
    if (config) {
      client.gameStarted(manifest.version);
    }
  }, [config, client]);

  useEffect(() => {
    setInteractionHistory([]);
    setLastActionText(null);
    setIsMissionComplete(false);
  }, [activeTheme, mode]);

  useEffect(() => {
    return () => {
      if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
    };
  }, []);

  const handleObjectClick = (obj: WorldObject) => {
    playTones(SOUNDS[obj.soundType], 'normal');
    setLastActionText(obj.actionText);

    if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = window.setTimeout(() => {
      setLastActionText(null);
    }, 2800);

    const nextHistory = [...interactionHistory, obj.id];
    setInteractionHistory(nextHistory);

    if (mode === 'missao') {
      const progress = checkMissionProgress(currentWorld.mission, nextHistory);
      if (progress.isCompleted && !isMissionComplete) {
        setIsMissionComplete(true);
        playTones(SOUNDS.chime, 'normal');
        client.reinforcerPresented({ kind: 'animation', contingentOn: currentWorld.mission.id, intensity: 'festive' });
        void speak(currentWorld.mission.successMessage, 'normal');
        client.gameCompleted(1);
      }
    }
  };

  const handleHearMission = () => {
    void speak(currentWorld.mission.instruction, 'normal');
  };

  return (
    <main className="mini-root">
      {/* Header com Ambientes e Modo */}
      <header className="mini-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>🌍</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--ap-sage-900)' }}>
              MiniMundos · {currentWorld.name}
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--ap-text-muted)' }}>
              Brincar Simbólico & Funcional
            </span>
          </div>
        </div>

        {/* Seletor de Ambientes */}
        <div className="mini-world-tabs">
          {(Object.keys(WORLD_ENVIRONMENTS) as WorldTheme[]).map((thm) => {
            const w = WORLD_ENVIRONMENTS[thm];
            return (
              <button
                key={thm}
                type="button"
                className="rs-tab-pill"
                aria-pressed={activeTheme === thm}
                onClick={() => setActiveTheme(thm)}
              >
                {w.icon} {w.name}
              </button>
            );
          })}
        </div>

        {/* Seletor de Modo Livre vs Missão */}
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <button
            type="button"
            className="rs-tab-pill"
            aria-pressed={mode === 'missao'}
            onClick={() => setMode('missao')}
          >
            🎯 Missão
          </button>
          <button
            type="button"
            className="rs-tab-pill"
            aria-pressed={mode === 'livre'}
            onClick={() => setMode('livre')}
          >
            🧸 Modo Livre
          </button>
        </div>
      </header>

      {/* Barra de Missão (se ativa) */}
      {mode === 'missao' && (
        <div className="mini-mission-bar">
          <div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--ap-primary)' }}>
              {isMissionComplete ? '🎉 Missão Concluída!' : `🎯 ${currentWorld.mission.title}:`}
            </strong>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: 'var(--ap-text)' }}>
              {isMissionComplete ? currentWorld.mission.successMessage : currentWorld.mission.instruction}
            </p>
          </div>

          <button
            type="button"
            onClick={handleHearMission}
            style={{
              background: 'var(--ap-surface, #fff)',
              border: '1px solid var(--ap-border)',
              borderRadius: '10px',
              padding: '0.4rem 0.8rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              flexShrink: 0,
            }}
          >
            🔊 Ouvir Missão
          </button>
        </div>
      )}

      {/* Canvas Lúdico com os Objetos Interativos */}
      <div className="mini-canvas">
        {currentWorld.objects.map((obj) => {
          const isTarget = mode === 'missao' && currentWorld.mission.targetObjectIds.includes(obj.id);
          return (
            <button
              key={obj.id}
              type="button"
              className={`mini-object-btn ${isTarget && !isMissionComplete ? 'target-hint' : ''}`}
              onClick={() => handleObjectClick(obj)}
              aria-label={obj.name}
            >
              <span style={{ fontSize: '3.5rem' }}>{obj.icon}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ap-text)' }}>
                {obj.name}
              </span>
            </button>
          );
        })}

        {/* Bolha de Ação Recente */}
        {lastActionText && (
          <div className="mini-action-bubble">
            <span>✨</span>
            <span>{lastActionText}</span>
          </div>
        )}
      </div>
    </main>
  );
}

export { MiniMundos as Game };
