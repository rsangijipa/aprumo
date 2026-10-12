import React, { useEffect } from 'react';
import { useNarrativeStore } from './narrative/engine/narrativeStore';
import { DeviceShell } from './phone/DeviceShell';
import { PensarAntesModal } from './ui/modals/PensarAntesModal';
import { ContextDrawer } from './ui/modals/ContextDrawer';
import { ProfileModal } from './ui/modals/ProfileModal';
import { EpisodeSummaryModal } from './ui/modals/EpisodeSummaryModal';
import { DetetiveDigitalModal } from './ui/modals/DetetiveDigitalModal';
import { AllEpisodesModal } from './ui/modals/AllEpisodesModal';

export const App: React.FC = () => {
  const { activeModal, setModal, closeApp, settings } = useNarrativeStore();

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

  return (
    <div className="w-full min-h-screen bg-[var(--bg-app-ambient)] text-[var(--text-primary)] font-sans antialiased flex flex-col justify-center">
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
