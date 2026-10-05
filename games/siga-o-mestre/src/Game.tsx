import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameClient, speak, playTones } from '@aprumo/game-sdk';
import {
  generateMasterTrial,
  evaluateTap,
  evaluateTimeout,
  ACTIONS,
  type MasterActionId,
  type MasterTrial,
} from './logic';
import { manifest } from './manifest';
import './game.css';

export function Game() {
  const { client, config, paused } = useGameClient(manifest.appId, manifest.version);
  const sound = config?.adaptation.sound ?? 'low';

  const [level, setLevel] = useState(1);
  const [trialIndex, setTrialIndex] = useState(0);
  const [currentTrial, setCurrentTrial] = useState<MasterTrial>(() => generateMasterTrial(0, 1));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState<'announcing' | 'active' | 'feedback' | 'finished'>('announcing');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [timeRemainingMs, setTimeRemainingMs] = useState(3000);
  const [inhibitionScore, setInhibitionScore] = useState(0);
  const [listenerScore, setListenerScore] = useState(0);
  const [hasPromptGlow, setHasPromptGlow] = useState(false);

  const trialStartTimeRef = useRef(0);

  const totalTrials = config?.clinical.trialsPerTarget ?? 8;

  // Initialize session
  useEffect(() => {
    client.emit('SESSION_STARTED', { configVersion: manifest.version });
    void speak('Bem-vindo ao Siga o Mestre! Preste atenção se o mestre mandar.', 'normal');
  }, [client]);

  // Start trial announcement
  const startTrialAnnouncement = useCallback(
    (trial: MasterTrial) => {
      setStatus('announcing');
      setFeedback(null);
      setCurrentStepIndex(0);
      setHasPromptGlow(false);

      client.emit('TRIAL_STARTED', {
        trialIndex: trial.trialIndex,
        targetId: trial.targets.join('-'),
        presented: trial.displayedOptions,
      });

      void speak(trial.verbalCommand, 'normal');

      // Allow voice to play, then enter active evaluation window
      const speechDelayMs = trial.level === 2 && trial.kind === 'valid' ? 2400 : 1600;
      window.setTimeout(() => {
        setStatus('active');
        trialStartTimeRef.current = Date.now();
        const duration = trial.kind === 'trick' ? 3000 : 6000;
        setTimeRemainingMs(duration);
      }, speechDelayMs);
    },
    [client]
  );

  // Load new trial on index or level change
  useEffect(() => {
    if (trialIndex < totalTrials) {
      const trial = generateMasterTrial(trialIndex, level);
      setCurrentTrial(trial);
      startTrialAnnouncement(trial);
    } else {
      setStatus('finished');
      client.emit('SESSION_COMPLETED', { trialsCompleted: totalTrials });
      void speak('Parabéns! Você completou todo o treinamento do Mestre!', 'normal');
    }
  }, [trialIndex, level, totalTrials, client, startTrialAnnouncement]);

  // Timeout handler (success for trick, no-response for valid)
  const handleTimeoutTrigger = useCallback(() => {
    if (status !== 'active') return;

    const evalResult = evaluateTimeout(currentTrial);
    const latencyMs = Date.now() - trialStartTimeRef.current;

    if (evalResult.success) {
      // SUCESSO DE INIBIÇÃO!
      setInhibitionScore((s: number) => s + 1);
      setFeedback({ type: 'success', text: 'Estátua perfeita! O mestre não mandou!' });
      void speak('Muito bem! Você não caiu na pegadinha!', 'normal');

      playTones([
        { freq: 523.25, dur: 0.12, type: 'sine' },
        { freq: 659.25, dur: 0.14, delay: 0.1, type: 'sine' },
        { freq: 783.99, dur: 0.25, delay: 0.2, type: 'sine' },
      ], sound);

      client.emit('TRIAL_COMPLETED', {
        trialIndex,
        targetId: currentTrial.targets.join('-'),
        stimulusId: 'inhibition-wait',
        presented: currentTrial.displayedOptions,
        positionOfTarget: 0,
        selected: null,
        selectedPosition: null,
        response: 'correct',
        latencyMs,
        promptLevel: 'N0',
        promptSource: 'none',
        detail: { kind: currentTrial.kind, level, inhibitionPassed: true },
      });

      client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: 'inibicao_sucesso' });
    } else {
      // Tempo esgotou em instrução válida
      setFeedback({ type: 'error', text: 'Tempo esgotado! Quando o mestre mandar, tem que fazer!' });
      void speak('O tempo acabou! Preste atenção.', 'normal');

      client.emit('TRIAL_COMPLETED', {
        trialIndex,
        targetId: currentTrial.targets.join('-'),
        stimulusId: 'timeout',
        presented: currentTrial.displayedOptions,
        positionOfTarget: 0,
        selected: null,
        selectedPosition: null,
        response: 'no_response',
        latencyMs,
        promptLevel: 'N0',
        promptSource: 'none',
        detail: { kind: currentTrial.kind, level, timeout: true },
      });
    }

    setStatus('feedback');
    window.setTimeout(() => {
      setTrialIndex((t: number) => t + 1);
    }, 2200);
  }, [status, currentTrial, trialIndex, level, client, sound]);

  // Timer loop for active response / inhibition window
  useEffect(() => {
    if (status !== 'active' || paused) return;

    const interval = window.setInterval(() => {
      setTimeRemainingMs((prev: number) => {
        const nextTime = prev - 100;
        if (nextTime <= 0) {
          window.clearInterval(interval);
          // Handle timeout
          handleTimeoutTrigger();
          return 0;
        }
        return nextTime;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [status, paused, handleTimeoutTrigger]);

  // Tap handler
  const handleCardTap = useCallback(
    (actionId: MasterActionId) => {
      if (status !== 'active' || paused) return;

      const evalResult = evaluateTap(currentTrial, actionId, currentStepIndex);
      const latencyMs = Date.now() - trialStartTimeRef.current;

      if (evalResult.outcome === 'inhibition_failed') {
        // Clicou na pegadinha!
        setStatus('feedback');
        setFeedback({ type: 'error', text: 'Opa! O mestre não mandou!' });
        void speak('Opa! O mestre não mandou fazer isso!', 'normal');

        playTones([{ freq: 220, dur: 0.25, type: 'sawtooth' }], sound);

        client.emit('TRIAL_COMPLETED', {
          trialIndex,
          targetId: currentTrial.targets.join('-'),
          stimulusId: actionId,
          presented: currentTrial.displayedOptions,
          positionOfTarget: 0,
          selected: actionId,
          selectedPosition: currentTrial.displayedOptions.indexOf(actionId),
          response: 'incorrect',
          latencyMs,
          promptLevel: 'N0',
          promptSource: 'none',
          detail: { kind: 'trick', impulsiveTap: true, tappedAction: actionId },
        });

        window.setTimeout(() => {
          setTrialIndex((t: number) => t + 1);
        }, 2200);
        return;
      }

      if (evalResult.outcome === 'wrong_action') {
        // Ação errada em comando válido
        setFeedback({ type: 'error', text: evalResult.message });
        void speak('Ação diferente do mestre!', 'normal');
        playTones([{ freq: 260, dur: 0.2, type: 'sawtooth' }], sound);

        setHasPromptGlow(true);
        client.emit('PROMPT_USED', {
          targetId: currentTrial.targets.join('-'),
          trialIndex,
          level: 'HIGHLIGHT_TARGET',
          source: 'built_in',
          latencyMs,
        });
        return;
      }

      if (evalResult.outcome === 'valid_partial') {
        // Primeiro passo de um comando encadeado
        setCurrentStepIndex(evalResult.nextStepIndex);
        playTones([{ freq: 587.33, dur: 0.15, type: 'sine' }], sound);
        void speak('Isso! E agora o próximo!', 'normal');
        return;
      }

      if (evalResult.outcome === 'valid_complete') {
        // Concluiu todos os passos com sucesso!
        setStatus('feedback');
        setFeedback({ type: 'success', text: 'Muito bem! Você seguiu o mestre!' });
        setListenerScore((s: number) => s + 1);
        void speak('Muito bem! Você seguiu o mestre certinho!', 'normal');

        playTones([
          { freq: 523.25, dur: 0.12, type: 'sine' },
          { freq: 659.25, dur: 0.12, delay: 0.1, type: 'sine' },
          { freq: 783.99, dur: 0.25, delay: 0.2, type: 'sine' },
        ], sound);

        client.emit('TRIAL_COMPLETED', {
          trialIndex,
          targetId: currentTrial.targets.join('-'),
          stimulusId: actionId,
          presented: currentTrial.displayedOptions,
          positionOfTarget: 0,
          selected: actionId,
          selectedPosition: currentTrial.displayedOptions.indexOf(actionId),
          response: 'correct',
          latencyMs,
          promptLevel: hasPromptGlow ? 'N1' : 'N0',
          promptSource: hasPromptGlow ? 'built_in' : 'none',
          detail: { kind: 'valid', level, stepCount: currentTrial.targets.length },
        });

        client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: 'comando_acerto' });

        // Advance level after 4 successes
        if (trialIndex >= 3 && level === 1) {
          setLevel(2);
        }

        window.setTimeout(() => {
          setTrialIndex((t: number) => t + 1);
        }, 2000);
      }
    },
    [
      status,
      paused,
      currentTrial,
      currentStepIndex,
      client,
      trialIndex,
      level,
      hasPromptGlow,
      sound,
    ]
  );

  const maxDuration = currentTrial.kind === 'trick' ? 3000 : 6000;
  const progressPercent = Math.max(0, Math.min(100, (timeRemainingMs / maxDuration) * 100));

  return (
    <div className="som-root" aria-label="Jogo Siga o Mestre">
      {/* Header */}
      <header className="som-header">
        <div className="som-badge">
          <span>Ouvinte:</span>
          <strong>{listenerScore}</strong>
        </div>
        <div className="som-badge">
          <span>Inibições / Estátua:</span>
          <strong>{inhibitionScore}</strong>
        </div>
        <div className="som-badge">
          <span>Rodada:</span>
          <strong>{Math.min(trialIndex + 1, totalTrials)} / {totalTrials}</strong>
        </div>
      </header>

      {/* Master Section */}
      <section className="som-master-section">
        <div
          className={`som-speech-bubble ${currentTrial.kind === 'trick' ? 'trick' : ''}`}
          role="status"
          aria-live="polite"
        >
          {currentTrial.verbalCommand}
        </div>
        <div
          className={`som-master-avatar ${status === 'announcing' ? 'speaking' : ''}`}
          aria-label="O Mestre Leo"
        >
          👑
        </div>
      </section>

      {/* Inhibition Timer */}
      {status === 'active' && (
        <div className="som-timer-container">
          <span className="som-timer-label">
            {currentTrial.kind === 'trick' ? '🤫 Segure a estátua! Não mexa!' : '⚡ Faça a ação!'}
          </span>
          <div className="som-timer-track" role="progressbar" aria-valuenow={progressPercent}>
            <div
              className={`som-timer-bar ${currentTrial.kind === 'trick' ? 'trick-mode' : ''}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Grid of Action Cards */}
      <main className="som-grid" aria-label="Opções de Ação">
        {currentTrial.displayedOptions.map((actId) => {
          const meta = ACTIONS[actId];
          const isTarget = currentTrial.targets[currentStepIndex] === actId;
          const isPrompted = hasPromptGlow && isTarget && currentTrial.kind === 'valid';

          return (
            <button
              key={actId}
              type="button"
              className={`som-card ${isPrompted ? 'pulse-prompt' : ''}`}
              onClick={() => handleCardTap(actId)}
              disabled={status !== 'active'}
              aria-label={meta.label}
            >
              <span className="som-emoji">{meta.emoji}</span>
              <span className="som-label">{meta.label}</span>
            </button>
          );
        })}
      </main>

      {/* Feedback Pop-up */}
      {feedback && (
        <div className={`som-feedback ${feedback.type}`} role="alert">
          {feedback.text}
        </div>
      )}
    </div>
  );
}
