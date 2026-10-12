import React, { useEffect, useRef } from 'react';
import { useGameClient } from '@aprumo/game-sdk';
import { manifest } from './manifest';

export { manifest };

export function Game() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const mixerRef = useRef<any>(null);

  useEffect(() => {
    client.gameStarted(manifest.version);
  }, [client]);

  // Adjust audio levels based on clinical config
  useEffect(() => {
    if (!mixerRef.current) return;
    const soundPref = config?.adaptation?.sound;
    if (soundPref === 'off') {
      mixerRef.current.setMasterVolume(0);
    } else if (soundPref === 'low') {
      mixerRef.current.setMasterVolume(0.35);
    } else {
      mixerRef.current.setMasterVolume(0.85);
    }
  }, [config]);

  // Listen to in-game telemetry events
  useEffect(() => {
    const handleStarted = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const mode = detail.mode || 'brinca_som';
      client.levelStarted({
        levelId: mode,
        levelIndex: 0,
        trialsPlanned: 4,
      });
      client.trialStarted({
        targetId: mode,
        trialIndex: 0,
        presented: [mode],
      });
      client.stimulusPresented({
        targetId: mode,
        trialIndex: 0,
        presented: [mode],
        positionOfTarget: 0,
        modality: 'auditory',
      });
    };

    const handleHit = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const instId = detail.instrumentId || 'tambor';
      const isCorrect = detail.judgement !== 'miss';
      client.responseRecorded({
        targetId: instId,
        stimulusId: instId,
        trialIndex: 0,
        presented: [instId],
        positionOfTarget: 0,
        selected: instId,
        selectedPosition: 0,
        response: isCorrect ? 'correct' : 'incorrect',
        latencyMs: detail.latencyMs || 80,
        promptLevel: 'none',
        promptSource: 'none',
        detail: {
          combo: detail.combo || 0,
          judgement: detail.judgement || 'good',
        },
      });
    };

    const handleRoundComplete = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const notes = detail.notesCount || 4;
      client.reinforcerPresented({
        kind: 'visual',
        reinforcerId: 'confetti',
        contingentOn: detail.mode || 'round',
        intensity: 'festive',
      });
      client.levelCompleted({
        levelId: detail.mode || 'banda',
        levelIndex: 0,
        trialsCompleted: notes,
        correct: notes,
        outcome: 'completed',
      });
    };

    window.addEventListener('banda:started', handleStarted);
    window.addEventListener('banda:hit', handleHit);
    window.addEventListener('banda:round-complete', handleRoundComplete);

    return () => {
      window.removeEventListener('banda:started', handleStarted);
      window.removeEventListener('banda:hit', handleHit);
      window.removeEventListener('banda:round-complete', handleRoundComplete);
    };
  }, [client]);

  useEffect(() => {
    if (!containerRef.current) return;
    let cleanup: (() => void) | undefined;
    const modGame = './' + 'game/BandGame';
    const modMixer = './' + 'audio/mixer';

    Promise.all([import(modGame), import(modMixer)]).then(([gameMod, mixerMod]) => {
      if (!containerRef.current) return;
      mixerRef.current = mixerMod.audioMixer;

      // Apply initial sound config
      const soundPref = config?.adaptation?.sound;
      if (soundPref === 'off') {
        mixerMod.audioMixer.setMasterVolume(0);
      } else if (soundPref === 'low') {
        mixerMod.audioMixer.setMasterVolume(0.35);
      }

      const unlock = () => {
        mixerMod.audioMixer.init();
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('pointerdown', unlock);
      window.addEventListener('keydown', unlock);

      const game = gameMod.createBandGame(containerRef.current);
      cleanup = () => {
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        game.destroy(true);
      };
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  if (ended) {
    return React.createElement(
      'div',
      {
        style: {
          display: 'grid',
          placeItems: 'center',
          minHeight: '100vh',
          background: '#1B263B',
          color: '#FFF8E8',
          fontFamily: 'Fredoka, sans-serif',
        },
      },
      React.createElement('h2', null, 'Concerto Concluído!'),
      React.createElement('p', null, 'A Banda do Tico agradece o show espetacular!')
    );
  }

  return React.createElement(
    'div',
    {
      id: 'game-canvas-container',
      ref: containerRef,
      style: { width: '100%', height: '100%', position: 'relative', overflow: 'hidden' },
    },
    paused
      ? React.createElement(
          'div',
          {
            style: {
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 9999,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontFamily: 'system-ui',
            },
          },
          React.createElement('h2', null, 'Atividade pausada pelo mediador')
        )
      : null
  );
}
