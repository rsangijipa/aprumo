import React, { useEffect } from 'react';
import { useGameClient } from '@aprumo/game-sdk';
import { manifest } from './manifest';
import { sound } from './audio/audioEngine';
import { useNarrativeStore } from './narrative/engine/narrativeStore';
import { DeviceShell } from './phone/DeviceShell';
import { PensarAntesModal } from './ui/modals/PensarAntesModal';
import { ContextDrawer } from './ui/modals/ContextDrawer';
import { ProfileModal } from './ui/modals/ProfileModal';
import { EpisodeSummaryModal } from './ui/modals/EpisodeSummaryModal';
import { DetetiveDigitalModal } from './ui/modals/DetetiveDigitalModal';
import { AllEpisodesModal } from './ui/modals/AllEpisodesModal';

export const App: React.FC = () => {
  const { client, config, paused: hostPaused, ended } = useGameClient(manifest.appId, manifest.version);
  const { activeModal, setModal, closeApp, settings, currentEpisodeId, indicators } = useNarrativeStore();

  useEffect(() => {
    client.gameStarted(manifest.version);
  }, [client]);

  // Adjust audio from clinical config
  useEffect(() => {
    const soundPref = config?.adaptation?.sound;
    if (soundPref === 'off') {
      sound.setEnabled(false);
      sound.setVolume(0);
    } else if (soundPref === 'low') {
      sound.setEnabled(true);
      sound.setVolume(0.3);
    } else {
      sound.setEnabled(true);
      sound.setVolume(0.7);
    }
  }, [config]);

  // Telemetry for narrative episodes
  useEffect(() => {
    client.levelStarted({
      levelId: currentEpisodeId,
      levelIndex: 0,
      trialsPlanned: 3,
    });
    client.trialStarted({
      targetId: currentEpisodeId,
      trialIndex: 0,
      presented: [currentEpisodeId],
    });
    client.stimulusPresented({
      targetId: currentEpisodeId,
      trialIndex: 0,
      presented: [currentEpisodeId],
      positionOfTarget: 0,
      modality: 'visual',
    });
  }, [currentEpisodeId, client]);

  // Telemetry when episode finishes
  useEffect(() => {
    if (activeModal === 'episode_summary') {
      client.responseRecorded({
        targetId: currentEpisodeId,
        stimulusId: currentEpisodeId,
        trialIndex: 0,
        presented: [currentEpisodeId],
        positionOfTarget: 0,
        selected: currentEpisodeId,
        selectedPosition: 0,
        response: 'correct',
        latencyMs: 8000,
        promptLevel: 'none',
        promptSource: 'none',
        detail: {
          privacidade: indicators.privacidade,
          clareza: indicators.clareza,
          limites: indicators.limites,
          confianca: indicators.confianca,
        },
      });
      client.reinforcerPresented({
        kind: 'visual',
        reinforcerId: 'episodio-concluido',
        contingentOn: 'navegacao-segura',
        intensity: 'festive',
      });
      client.levelCompleted({
        levelId: currentEpisodeId,
        levelIndex: 0,
        trialsCompleted: 3,
        correct: 3,
        outcome: 'completed',
      });
    }
  }, [activeModal, currentEpisodeId, indicators, client]);

  // Sincronizar configurações de acessibilidade nos atributos de dados raiz
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme);
    root.setAttribute('data-high-contrast', String(settings.highContrast));
    root.setAttribute('data-dyslexia', String(settings.dyslexicFont));
    root.setAttribute('data-reduced-motion', String(settings.reducedMotion));
    root.setAttribute('data-font-size', settings.fontSize);
  }, [settings]);

  // Navegação global por teclado (Acessibilidade)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          setModal(null);
        } else {
          closeApp();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, setModal, closeApp]);

  if (ended) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#0F172A', color: '#F8FAFC', fontFamily: 'system-ui' }}>
        <h2>Vida Online Concluído!</h2>
        <p>A jornada de segurança digital e reflexão foi concluída com sucesso!</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[var(--bg-app-ambient)] text-[var(--text-primary)] font-sans antialiased flex flex-col justify-center relative">
      {hostPaused && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'system-ui' }}>
          <h2>Atividade pausada pelo mediador</h2>
        </div>
      )}

      {/* Moldura do Dispositivo Fictício Nexo */}
      <DeviceShell />

      {/* Camada de Modais e Ferramentas Reflexivas */}
      {activeModal === 'pensar_antes' && <PensarAntesModal />}
      {activeModal === 'context_drawer' && <ContextDrawer />}
      {activeModal === 'profile' && <ProfileModal />}
      {activeModal === 'episode_summary' && <EpisodeSummaryModal />}
      {activeModal === 'all_episodes' && <AllEpisodesModal />}
      {(activeModal === 'minigame_url' || activeModal === 'minigame_print' || activeModal === 'minigame_perms') && (
        <DetetiveDigitalModal />
      )}
    </div>
  );
};

export default App;
