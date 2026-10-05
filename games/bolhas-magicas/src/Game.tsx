import React, { useCallback, useEffect, useRef, useState } from 'react';
import { playTones, speak, useGameClient } from '@aprumo/game-sdk';
import {
  type Bubble,
  createBubbleBatch,
  updateBubblePositions,
  popBubble,
  shouldEnterPause,
  resolveMandPromptLevel,
  type GameState,
} from './logic';
import { manifest } from './manifest';
import './game.css';

export function Game() {
  const { client, config, paused } = useGameClient(manifest.appId, manifest.version);

  const [gameState, setGameState] = useState<GameState>('blowing');
  const [bubbles, setBubbles] = useState<Bubble[]>(() => createBubbleBatch(6, 400, 600, 1));
  const [round, setRound] = useState(1);
  const [totalPopped, setTotalPopped] = useState(0);
  const [spontaneousCount, setSpontaneousCount] = useState(0);

  const pauseStartRef = useRef<number>(0);
  const playfieldRef = useRef<HTMLDivElement>(null);
  const sound = config?.adaptation.sound ?? 'low';

  const totalRounds = config?.clinical.trialsPerTarget ?? 6;

  // Initialize session
  useEffect(() => {
    if (config) {
      client.emit('SESSION_STARTED', { configVersion: manifest.version });
      client.emit('TRIAL_STARTED', { trialIndex: 0, targetId: 'pedido-mais', presented: ['pedido-mais'] });
      setGameState('active_play');
    }
  }, [config, client]);

  // Animation frame loop for floating bubbles
  useEffect(() => {
    if (gameState !== 'active_play' || paused) return;

    const interval = window.setInterval(() => {
      setBubbles((prev) => {
        const width = playfieldRef.current?.clientWidth ?? 400;
        const height = playfieldRef.current?.clientHeight ?? 600;
        return updateBubblePositions(prev, width, height);
      });
    }, 35);

    return () => window.clearInterval(interval);
  }, [gameState, paused]);

  // Handle popping a bubble
  const handlePop = useCallback(
    (bubbleId: string) => {
      if (gameState !== 'active_play') return;

      const randomPitch = 500 + Math.floor(Math.random() * 300);
      playTones([{ freq: randomPitch, dur: 0.08, type: 'sine' }], sound);

      setBubbles((prev: Bubble[]) => {
        const { updated, poppedBubble } = popBubble(prev, bubbleId);
        if (poppedBubble) {
          setTotalPopped((p: number) => p + 1);
        }

        if (shouldEnterPause(updated)) {
          // Enter Behavioral Pause!
          pauseStartRef.current = Date.now();
          setGameState('behavioral_pause');
          void speak('Acabaram as bolhas! O que você quer?', 'normal');
        }

        return updated;
      });
    },
    [gameState, sound]
  );

  // Handle Mand communication ("MAIS")
  const handleMand = useCallback(() => {
    if (gameState !== 'behavioral_pause') return;

    const latencyMs = Math.max(0, Date.now() - pauseStartRef.current);
    const promptLevel = resolveMandPromptLevel(latencyMs);

    const isSpontaneous = promptLevel === 'N0';
    if (isSpontaneous) {
      setSpontaneousCount((c: number) => c + 1);
    }

    playTones([
      { freq: 523.25, dur: 0.12, type: 'sine' },
      { freq: 659.25, dur: 0.14, delay: 0.1, type: 'sine' },
      { freq: 783.99, dur: 0.25, delay: 0.2, type: 'sine' },
    ], sound);

    client.emit('TRIAL_COMPLETED', {
      trialIndex: round - 1,
      targetId: 'pedido-mais',
      stimulusId: 'botao-mais',
      presented: ['botao-mais'],
      positionOfTarget: 0,
      selected: 'botao-mais',
      selectedPosition: 0,
      response: 'correct',
      latencyMs,
      promptLevel,
      promptSource: isSpontaneous ? 'none' : 'built_in',
      detail: { round, totalPopped },
    });

    client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: 'pedido-comunicado' });

    void speak('Muito bem! Mais bolhas!', 'normal');

    if (round >= totalRounds) {
      setGameState('finished');
      client.emit('SESSION_COMPLETED', { trialsCompleted: round });
      return;
    }

    setGameState('blowing');
    const nextRound = round + 1;
    setRound(nextRound);

    window.setTimeout(() => {
      const width = playfieldRef.current?.clientWidth ?? 400;
      const height = playfieldRef.current?.clientHeight ?? 600;
      setBubbles(createBubbleBatch(5 + (nextRound % 3), width, height, nextRound * 13));
      setGameState('active_play');
      client.emit('TRIAL_STARTED', { trialIndex: nextRound - 1, targetId: 'pedido-mais', presented: ['pedido-mais'] });
    }, 900);
  }, [gameState, round, totalRounds, totalPopped, client, sound]);

  if (!config) return <div className="bm-root" aria-busy="true" />;

  return (
    <div className="bm-root" ref={playfieldRef}>
      {/* Header Info */}
      <header className="bm-header">
        <div className="bm-badge">
          <span>🫧 Bolhas Estouradas:</span>
          <strong>{totalPopped}</strong>
        </div>
        <div className="bm-badge">
          <span>Rodada:</span>
          <strong>{round} / {totalRounds}</strong>
        </div>
      </header>

      {/* Floating Bubbles Playfield */}
      <main className="bm-playfield" aria-label="Área de bolhas">
        {bubbles.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`bm-bubble ${b.popped ? 'popped' : ''}`}
            style={{
              left: `${b.x}px`,
              top: `${b.y}px`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              backgroundColor: b.color,
            }}
            onClick={() => handlePop(b.id)}
            aria-label="Estourar bolha de sabão"
          >
            <span className="bm-bubble-shine" />
          </button>
        ))}
      </main>

      {/* Behavioral Pause Overlay (MAND State) */}
      {gameState === 'behavioral_pause' && (
        <section className="bm-pause-overlay" aria-label="Momento de pedir mais bolhas">
          <div className="bm-wand-character">
            <span style={{ fontSize: '4.5rem' }} role="img" aria-label="Varinha mágica aguardando">
              🪄
            </span>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bm-text)', margin: '0.5rem 0 0' }}>
              As bolhas acabaram! O que você quer?
            </p>
          </div>

          <button
            type="button"
            className="bm-mand-btn pulse"
            onClick={handleMand}
            aria-label="Pedir MAIS bolhas"
          >
            <span style={{ fontSize: '2rem' }}>🤲</span>
            <span>QUERO MAIS!</span>
          </button>
        </section>
      )}

      {/* Game Completed Banner */}
      {gameState === 'finished' && (
        <section className="bm-pause-overlay" role="status">
          <div style={{ textAlign: 'center', background: '#ffffff', padding: '2rem 3rem', borderRadius: '24px', boxShadow: '0 12px 36px rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '4rem' }}>🎉</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--bm-text)', margin: '0.5rem 0' }}>
              Parabéns!
            </h2>
            <p style={{ color: '#64748b', margin: '0 0 1rem' }}>
              Você estourou {totalPopped} bolhas e fez {spontaneousCount} pedidos espontâneos!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

export default Game;
