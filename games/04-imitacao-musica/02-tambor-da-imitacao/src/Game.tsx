import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameClient, speak, playTones } from '@aprumo/game-sdk';
import {
  evaluateInputSequence,
  getPatternForLevel,
  getPercussionParams,
  checkProgression,
  type DrumZone,
  type TamborPhase,
} from './logic';
import { manifest } from './manifest';
import './game.css';

export function Game() {
  const { client, config, paused } = useGameClient(manifest.appId, manifest.version);
  const sound = config?.adaptation.sound ?? 'low';

  const [phase, setPhase] = useState<TamborPhase>('reciprocity');
  const [level, setLevel] = useState(1);
  const [trialIndex, setTrialIndex] = useState(0);
  const [reciprocalTurns, setReciprocalTurns] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);

  // Imitation state
  const [expectedPattern, setExpectedPattern] = useState<DrumZone[]>(['center']);
  const [childInput, setChildInput] = useState<DrumZone[]>([]);
  const [status, setStatus] = useState<
    'idle' | 'demonstrating' | 'awaiting_child' | 'success' | 'retry' | 'finished'
  >('idle');
  const [modelActivePad, setModelActivePad] = useState<DrumZone | null>(null);
  const [ticoMessage, setTicoMessage] = useState('Toca no tambor para tocarmos juntos!');
  const [hasPromptGlow, setHasPromptGlow] = useState(false);

  const trialStartTimeRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio percussive tone generation
  const playDrumSound = useCallback(
    (zone: DrumZone) => {
      if (!sound) return;

      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          void ctx.resume();
        }

        const params = getPercussionParams(zone);
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = zone === 'center' ? 'lowpass' : 'bandpass';
        filter.frequency.setValueAtTime(params.filterFreq, ctx.currentTime);

        osc.type = params.type;
        osc.frequency.setValueAtTime(params.baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(params.endFreq, ctx.currentTime + params.dur);

        gainNode.gain.setValueAtTime(0.7, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + params.dur);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + params.dur);
      } catch {
        // Fallback tone
        playTones(
          [{ freq: zone === 'center' ? 140 : 440, dur: 0.15, type: 'sine' }],
          sound
        );
      }
    },
    [sound]
  );

  // Setup trial demonstration for Phase 2
  const startDemonstration = useCallback(
    (pattern: DrumZone[]) => {
      setStatus('demonstrating');
      setChildInput([]);
      setTicoMessage('Olha o Tico! Presta atenção no ritmo!');
      void speak('Olha o Tico tocando!', 'normal');

      // Schedule playing beats
      pattern.forEach((zone, idx) => {
        window.setTimeout(() => {
          setModelActivePad(zone);
          playDrumSound(zone);

          window.setTimeout(() => {
            setModelActivePad(null);
          }, 350);
        }, 1000 + idx * 750);
      });

      const totalDemoDuration = 1000 + pattern.length * 750 + 400;
      window.setTimeout(() => {
        setStatus('awaiting_child');
        trialStartTimeRef.current = Date.now();
        setTicoMessage('Sua vez! Faz igual!');
        void speak('Sua vez! Faz igual!', 'normal');
      }, totalDemoDuration);
    },
    [playDrumSound]
  );

  // Initialize trial
  useEffect(() => {
    if (phase === 'imitation' && status === 'idle') {
      const pattern = getPatternForLevel(level, trialIndex);
      setExpectedPattern(pattern);
      client.emit('TRIAL_STARTED', {
        trialIndex,
        targetId: pattern.join('-'),
        presented: ['center', 'rim'],
      });
      startDemonstration(pattern);
    }
  }, [phase, level, trialIndex, status, client, startDemonstration]);

  // Initial welcome message
  useEffect(() => {
    void speak('Bem-vindo ao Tambor da Imitação! Toca para começarmos.', 'normal');
    client.emit('SESSION_STARTED', { configVersion: manifest.version });
  }, [client]);

  // Handle Drum Hit by Child
  const handleChildHit = useCallback(
    (zone: DrumZone) => {
      if (paused) return;

      playDrumSound(zone);

      // Phase 1: Denver Reciprocal Turn-taking
      if (phase === 'reciprocity') {
        setReciprocalTurns((t: number) => {
          const nextTurns = t + 1;
          setTicoMessage('Tico adorou! Minha vez de tocar!');

          // Tico copies child after short latency
          window.setTimeout(() => {
            setModelActivePad(zone);
            playDrumSound(zone);
            void speak('Eu também!', 'normal');

            window.setTimeout(() => {
              setModelActivePad(null);
              const progress = checkProgression('reciprocity', nextTurns, 0);
              if (progress.canAdvancePhase) {
                setTicoMessage('Muito legal! Agora vamos jogar: Faz Igual!');
              } else {
                setTicoMessage('Sua vez de tocar outra vez!');
              }
            }, 500);
          }, 600);

          return nextTurns;
        });
        return;
      }

      // Phase 2: Discrete Trial Imitation
      if (phase === 'imitation') {
        if (status !== 'awaiting_child') return;

        const updatedInput = [...childInput, zone];
        setChildInput(updatedInput);

        const evaluation = evaluateInputSequence(expectedPattern, updatedInput);

        if (evaluation.isError) {
          // Erro na imitação
          setStatus('retry');
          setTicoMessage('Quase lá! Vamos ver o Tico de novo.');
          void speak('Quase! Vamos tentar de novo.', 'normal');

          const latencyMs = Date.now() - trialStartTimeRef.current;
          client.emit('TRIAL_COMPLETED', {
            trialIndex,
            targetId: expectedPattern.join('-'),
            stimulusId: zone,
            presented: ['center', 'rim'],
            positionOfTarget: 0,
            selected: zone,
            selectedPosition: 0,
            response: 'incorrect',
            latencyMs,
            promptLevel: 'N0',
            promptSource: 'none',
            detail: { phase, level, trialIndex },
          });

          // Re-demonstrate with prompt after 1.5s
          window.setTimeout(() => {
            setHasPromptGlow(true);
            client.emit('PROMPT_USED', {
              targetId: expectedPattern.join('-'),
              trialIndex,
              level: 'MODEL_REPEAT',
              source: 'built_in',
              latencyMs: 1500,
            });
            startDemonstration(expectedPattern);
          }, 1500);
          return;
        }

        if (evaluation.isComplete) {
          // Sucesso na imitação completa!
          setStatus('success');
          setHasPromptGlow(false);
          setTicoMessage('Sensacional! Você fez igualzinho!');
          void speak('Muito bem! Você fez igualzinho!', 'normal');

          playTones([
            { freq: 523.25, dur: 0.12, type: 'triangle' },
            { freq: 659.25, dur: 0.12, delay: 0.1, type: 'triangle' },
            { freq: 783.99, dur: 0.25, delay: 0.2, type: 'triangle' },
          ], sound);

          const latencyMs = Date.now() - trialStartTimeRef.current;
          client.emit('TRIAL_COMPLETED', {
            trialIndex,
            targetId: expectedPattern.join('-'),
            stimulusId: zone,
            presented: ['center', 'rim'],
            positionOfTarget: 0,
            selected: zone,
            selectedPosition: 0,
            response: 'correct',
            latencyMs,
            promptLevel: hasPromptGlow ? 'N1' : 'N0',
            promptSource: hasPromptGlow ? 'built_in' : 'none',
            detail: { phase, level, trialIndex, mastered: masteredCount + 1 },
          });

          client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: 'imitacao_acerto' });

          setMasteredCount((m: number) => {
            const nextMastered = m + 1;
            const progress = checkProgression('imitation', reciprocalTurns, nextMastered);

            if (progress.hasFinished) {
              setStatus('finished');
              setTicoMessage('Incrível! Você dominou o Tambor da Imitação!');
              client.emit('SESSION_COMPLETED', { trialsCompleted: nextMastered });
              return nextMastered;
            }

            // Advance to next trial after celebration
            window.setTimeout(() => {
              const nextTrial = trialIndex + 1;
              setTrialIndex(nextTrial);
              // Gradually raise level every 3 successes
              if (nextTrial % 3 === 0 && level < 3) {
                setLevel((l: number) => l + 1);
              }
              setStatus('idle');
            }, 1800);

            return nextMastered;
          });
        }
      }
    },
    [
      paused,
      phase,
      status,
      childInput,
      expectedPattern,
      playDrumSound,
      client,
      trialIndex,
      level,
      reciprocalTurns,
      hasPromptGlow,
      masteredCount,
      sound,
      startDemonstration,
    ]
  );

  const switchToImitation = useCallback(() => {
    setPhase('imitation');
    setLevel(1);
    setTrialIndex(0);
    setStatus('idle');
    setTicoMessage('Modo Faz Igual: Preste atenção no ritmo do Tico!');
    void speak('Agora preste atenção no ritmo do Tico!', 'normal');
  }, []);

  return (
    <div className="ti-root" aria-label="Jogo Tambor da Imitação">
      {/* Header */}
      <header className="ti-header">
        <div className="ti-badge">
          <span>Modo:</span>
          <strong>{phase === 'reciprocity' ? 'Reciprocidade' : 'Faz Igual!'}</strong>
        </div>
        <div className="ti-badge">
          <span>{phase === 'reciprocity' ? 'Turnos:' : 'Ações Dominadas:'}</span>
          <strong>{phase === 'reciprocity' ? reciprocalTurns : `${masteredCount} / 8`}</strong>
        </div>
      </header>

      {/* Mascot & Instructions */}
      <section className="ti-mascot-section">
        <div className="ti-speech-bubble" role="status" aria-live="polite">
          {ticoMessage}
        </div>
        <div
          className={`ti-mascot-avatar ${modelActivePad ? 'drumming' : ''}`}
          aria-label="Tico o Macaquinho Baterista"
        >
          🥁
        </div>
      </section>

      {/* Imitation Sequence Dots */}
      {phase === 'imitation' && (
        <div className="ti-sequence-tracker" aria-label="Sequência de batidas">
          {expectedPattern.map((zone, idx) => {
            const hasHit = idx < childInput.length;
            const isMatch = hasHit && childInput[idx] === zone;
            const isErr = hasHit && childInput[idx] !== zone;
            const isCurrent = idx === childInput.length && status === 'awaiting_child';

            return (
              <div
                key={idx}
                className={`ti-seq-dot ${
                  isMatch ? 'matched' : isErr ? 'error' : isCurrent ? 'active' : 'pending'
                }`}
                title={`Batida ${idx + 1}: ${zone === 'center' ? 'Centro' : 'Borda'}`}
              >
                {zone === 'center' ? '🟣' : '🟡'}
              </div>
            );
          })}
        </div>
      )}

      {/* Concentric Drum Stage */}
      <main className="ti-drum-stage" aria-label="Tambor Interativo">
        {/* Outer Rim */}
        <button
          type="button"
          className={`ti-rim-pad ${modelActivePad === 'rim' ? 'model-hit' : ''}`}
          onClick={() => handleChildHit('rim')}
          aria-label="Tocar borda do tambor (som agudo)"
        >
          Borda
        </button>

        {/* Center Drumhead */}
        <button
          type="button"
          className={`ti-center-pad ${modelActivePad === 'center' ? 'model-hit' : ''} ${
            hasPromptGlow ? 'pulse-prompt' : ''
          }`}
          onClick={() => handleChildHit('center')}
          aria-label="Tocar centro do tambor (som grave)"
        >
          <span>🥁</span>
          Centro
        </button>
      </main>

      {/* Footer Controls */}
      <footer className="ti-footer">
        {phase === 'reciprocity' ? (
          <button
            type="button"
            className="ti-btn ti-btn-primary"
            onClick={switchToImitation}
          >
            Começar "Faz Igual!" →
          </button>
        ) : (
          <button
            type="button"
            className="ti-btn"
            onClick={() => {
              setPhase('reciprocity');
              setTicoMessage('Modo livre! Toca no tambor que o Tico imita você!');
            }}
          >
            ← Voltar para Modo Livre
          </button>
        )}
      </footer>
    </div>
  );
}
