import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameClient, speak, playTones } from '@aprumo/game-sdk';
import {
  computeDanceDuration,
  computeFreezeDuration,
  evaluateFreezePerformance,
  getDanceBeatTone,
  type FreezePhase,
} from './logic';
import { manifest } from './manifest';
import './game.css';

export function Game() {
  const { client, config, paused } = useGameClient(manifest.appId, manifest.version);
  const sound = config?.adaptation.sound ?? 'low';

  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<FreezePhase>('countdown');
  const [countdownNum, setCountdownNum] = useState(3);
  const [danceTaps, setDanceTaps] = useState(0);
  const [impulsiveTaps, setImpulsiveTaps] = useState(0);
  const [perfectFreezes, setPerfectFreezes] = useState(0);
  const [warningText, setWarningText] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Prepare-se para a dança!');

  const freezeStartTimeRef = useRef(0);
  const musicStepRef = useRef(0);
  const musicIntervalRef = useRef<number | null>(null);
  const phaseTimeoutRef = useRef<number | null>(null);

  const totalRounds = config?.clinical.trialsPerTarget ?? 5;

  // Initialize session
  useEffect(() => {
    client.emit('SESSION_STARTED', { configVersion: manifest.version });
    void speak('Bem-vindo à Dança do Congelar! Quando a música parar, vire uma estátua!', 'normal');
  }, [client]);

  // Clean timers helper
  const clearTimers = useCallback(() => {
    if (musicIntervalRef.current) {
      window.clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
    if (phaseTimeoutRef.current) {
      window.clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
  }, []);

  // Music loop during dance phase
  const startMusicLoop = useCallback(() => {
    musicIntervalRef.current = window.setInterval(() => {
      if (paused) return;
      const beat = getDanceBeatTone(musicStepRef.current);
      musicStepRef.current += 1;
      playTones([beat], sound);
    }, 280);
  }, [paused, sound]);

  // Freeze period ends -> Evaluate trial (declared before triggerFreeze)
  const handleFreezeEnd = useCallback(
    (currentRound: number, freezeDuration: number) => {
      setPhase('evaluated');
      clearTimers();

      setImpulsiveTaps((taps: number) => {
        const evaluation = evaluateFreezePerformance(taps, freezeDuration);
        setStatusMessage(evaluation.message);
        void speak(evaluation.message, 'normal');

        if (taps === 0) {
          setPerfectFreezes((prev: number) => prev + 1);
        }

        if (evaluation.passed) {
          playTones([
            { freq: 523.25, dur: 0.12, type: 'sine' },
            { freq: 659.25, dur: 0.12, delay: 0.1, type: 'sine' },
            { freq: 783.99, dur: 0.25, delay: 0.2, type: 'sine' },
          ], sound);
          client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: 'congelar_acerto' });
        }

        const latencyMs = Date.now() - freezeStartTimeRef.current;
        client.emit('TRIAL_COMPLETED', {
          trialIndex: currentRound - 1,
          targetId: 'congelamento-estatua',
          stimulusId: 'audio-cut',
          presented: ['danca-livre', 'estatua-gelo'],
          positionOfTarget: 1,
          selected: taps === 0 ? 'estatua-gelo' : 'toque-impulsivo',
          selectedPosition: taps === 0 ? 1 : 0,
          response: evaluation.passed ? 'correct' : 'incorrect',
          latencyMs,
          promptLevel: 'N0',
          promptSource: 'none',
          detail: {
            round: currentRound,
            impulsiveTaps: taps,
            freezeDuration,
            rating: evaluation.rating,
          },
        });

        // Next round or complete
        if (currentRound >= totalRounds) {
          window.setTimeout(() => {
            setPhase('finished');
            client.emit('SESSION_COMPLETED', { trialsCompleted: totalRounds });
            void speak('Sensacional! Você é um mestre da dança do congelar!', 'normal');
          }, 2400);
        } else {
          window.setTimeout(() => {
            setRound((r: number) => r + 1);
            setPhase('countdown');
            setCountdownNum(3);
          }, 2500);
        }

        return taps;
      });
    },
    [clearTimers, client, sound, totalRounds]
  );

  // Transition to Freezing phase
  const triggerFreeze = useCallback(
    (currentRound: number) => {
      clearTimers();
      setPhase('freezing');
      setImpulsiveTaps(0);
      freezeStartTimeRef.current = Date.now();
      setStatusMessage('CONGELOU! FIQUE ESTÁTUA! 🧊');

      // Crisp ice chime
      playTones(
        [
          { freq: 1174.66, dur: 0.1, type: 'sine' },
          { freq: 1760.0, dur: 0.25, delay: 0.08, type: 'sine' },
        ],
        sound
      );

      void speak('Congelou! Estátua!', 'normal');

      const freezeDuration = computeFreezeDuration(currentRound - 1);

      phaseTimeoutRef.current = window.setTimeout(() => {
        // Freeze period finished!
        handleFreezeEnd(currentRound, freezeDuration);
      }, freezeDuration);
    },
    [clearTimers, sound, handleFreezeEnd]
  );

  // Countdown flow
  useEffect(() => {
    if (phase !== 'countdown' || paused) return;

    if (countdownNum > 0) {
      const timer = window.setTimeout(() => {
        setCountdownNum((n: number) => n - 1);
        playTones([{ freq: 440 + (3 - countdownNum) * 100, dur: 0.08, type: 'sine' }], sound);
      }, 800);
      return () => window.clearTimeout(timer);
    }

    // Countdown finished -> Start dancing!
    setPhase('dancing');
    setStatusMessage('DANCE! Mexa no ritmo da música! 🎵');
    client.emit('TRIAL_STARTED', {
      trialIndex: round - 1,
      targetId: 'congelamento-estatua',
      presented: ['danca-livre', 'estatua-gelo'],
    });

    startMusicLoop();

    const danceDuration = computeDanceDuration(round - 1);
    phaseTimeoutRef.current = window.setTimeout(() => {
      triggerFreeze(round);
    }, danceDuration);

    return () => {
      clearTimers();
    };
  }, [phase, countdownNum, paused, round, client, startMusicLoop, triggerFreeze, clearTimers, sound]);

  // Stage / Dance Floor Tap Handler
  const handleStageTap = useCallback(() => {
    if (paused) return;

    if (phase === 'dancing') {
      setDanceTaps((prev: number) => prev + 1);
      playTones([{ freq: 300 + Math.random() * 200, dur: 0.08, type: 'triangle' }], sound);
      return;
    }

    if (phase === 'freezing') {
      // Impulsive tap during freeze!
      setImpulsiveTaps((prev: number) => prev + 1);
      setWarningText('Opa! Não mexa! Fique estátua! 🧊');
      playTones([{ freq: 200, dur: 0.15, type: 'sawtooth' }], sound);

      window.setTimeout(() => {
        setWarningText(null);
      }, 1200);
    }
  }, [phase, paused, sound]);

  return (
    <div
      className={`ddc-root ${phase === 'freezing' ? 'frozen' : ''}`}
      aria-label="Jogo Dança do Congelar"
    >
      {/* Frost Overlay */}
      {phase === 'freezing' && <div className="ddc-frost-overlay" aria-hidden="true" />}

      {/* Header */}
      <header className="ddc-header">
        <div className="ddc-badge">
          <span>Passos:</span>
          <strong>{danceTaps} 💃</strong>
        </div>
        <div className="ddc-badge">
          <span>Estátuas:</span>
          <strong>{perfectFreezes} ⭐</strong>
        </div>
        <div className="ddc-badge">
          <span>Rodada:</span>
          <strong>{round} / {totalRounds}</strong>
        </div>
      </header>

      {/* Status Banner */}
      <div className={`ddc-status-banner ${phase}`} role="status" aria-live="polite">
        {phase === 'countdown' ? `Preparar... ${countdownNum}` : statusMessage}
      </div>

      {/* Center Interactive Stage */}
      <main className="ddc-stage-wrapper">
        <button
          type="button"
          className={`ddc-stage ${phase === 'freezing' ? 'frozen' : ''}`}
          onClick={handleStageTap}
          aria-label={phase === 'freezing' ? 'Palco congelado, não toque' : 'Toque no palco para dançar'}
        >
          <div
            className={`ddc-dancer-mascot ${phase === 'dancing' ? 'dancing' : ''} ${
              phase === 'freezing' ? 'frozen' : ''
            }`}
          >
            {phase === 'freezing' ? '🧊' : '🕺'}
          </div>

          <span className="ddc-tap-prompt">
            {phase === 'dancing' && 'Toque no ritmo! 💃'}
            {phase === 'freezing' && (impulsiveTaps > 0 ? `Toques: ${impulsiveTaps}` : 'ESTÁTUA! 🤫')}
            {phase === 'countdown' && 'Atenção...'}
            {phase === 'evaluated' && 'Muito bem!'}
            {phase === 'finished' && 'Fim de jogo! 🎉'}
          </span>
        </button>
      </main>

      {/* Impulsive Tap Warning */}
      {warningText && (
        <div className="ddc-impulsive-warning" role="alert">
          {warningText}
        </div>
      )}

      {/* Footer info / actions */}
      <footer className="ddc-footer">
        {phase === 'finished' && (
          <button
            type="button"
            className="ddc-btn"
            onClick={() => {
              setRound(1);
              setPerfectFreezes(0);
              setPhase('countdown');
              setCountdownNum(3);
            }}
          >
            Jogar Novamente 🔄
          </button>
        )}
      </footer>
    </div>
  );
}
