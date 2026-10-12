import React, { useState } from 'react';
import { Wifi, Battery, Volume2, VolumeX, Maximize2, Minimize2, Sun, Moon, Map } from 'lucide-react';
import { useNarrativeStore } from '../narrative/engine/narrativeStore';
import { HomeScreen } from './apps/launcher/HomeScreen';
import { PulseApp } from './apps/pulse/PulseApp';
import { LoopApp } from './apps/loop/LoopApp';
import { PlayHubApp } from './apps/playhub/PlayHubApp';
import { VaultApp } from './apps/vault/VaultApp';
import { MailboxApp } from './apps/mailbox/MailboxApp';
import { FeedApp } from './apps/feed/FeedApp';
import { SettingsApp } from './apps/settings/SettingsApp';

export const DeviceShell: React.FC = () => {
  const { 
    activeApp, 
    closeApp, 
    notifications, 
    openApp, 
    markNotificationRead,
    settings,
    updateSettings,
    setModal
  } = useNarrativeStore();

  const [isFullWindow, setIsFullWindow] = useState(false);
  const latestUnreadNotif = notifications.find((n) => !n.read);

  // Renderizador do app em foco
  const renderApp = () => {
    switch (activeApp) {
      case 'pulse':
        return <PulseApp />;
      case 'loop':
        return <LoopApp />;
      case 'playhub':
        return <PlayHubApp />;
      case 'vault':
        return <VaultApp />;
      case 'mailbox':
        return <MailboxApp />;
      case 'feed':
        return <FeedApp />;
      case 'settings':
        return <SettingsApp />;
      case 'launcher':
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 transition-all select-none">
      {/* Barra de Controles Externa (Desktop Toolbar) */}
      <aside 
        aria-label="Controles do Simulador"
        className="w-full max-w-[420px] mb-3 px-3 py-1.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-sm hidden sm:flex items-center justify-between text-xs text-[var(--text-secondary)]"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--text-primary)]">Nexo OS</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--primitive-color-azul-glow)] text-[var(--primitive-color-azul-400)] font-semibold">
            Simulador
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setModal('all_episodes')}
            title="Mapa dos 12 Episódios"
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-subtle)] transition-colors flex items-center gap-1 text-[11px] font-medium"
          >
            <Map size={14} />
            <span>Capítulos</span>
          </button>

          <button
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            title="Alternar Tema Claro/Escuro"
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-subtle)] transition-colors"
          >
            {settings.theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button
            onClick={() => updateSettings({ audioEnabled: !settings.audioEnabled })}
            title={settings.audioEnabled ? 'Desativar Sons' : 'Ativar Sons'}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-subtle)] transition-colors"
          >
            {settings.audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          <button
            onClick={() => setIsFullWindow(!isFullWindow)}
            title={isFullWindow ? 'Modo Smartphone' : 'Modo Expandido'}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-subtle)] transition-colors"
          >
            {isFullWindow ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </aside>

      {/* Moldura do Dispositivo Fictício Nexo */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col overflow-hidden bg-[var(--bg-device-frame)] ${
          isFullWindow
            ? 'max-w-4xl h-[92vh] sm:rounded-3xl border border-[var(--bg-device-border)] shadow-2xl'
            : 'max-w-[400px] h-[100dvh] sm:h-[840px] sm:rounded-[44px] sm:border-[8px] sm:border-[var(--bg-device-border)] sm:shadow-[0_24px_60px_rgba(0,0,0,0.45)]'
        }`}
      >
        {/* Status Bar Superior */}
        <div className="h-10 px-5 pt-1.5 flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] shrink-0 z-20">
          <span className="text-[11px] tracking-tight">14:20</span>

          {/* Ilha Dinâmica / Notificação de Alerta */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1.5 z-30">
            {latestUnreadNotif ? (
              <button
                onClick={() => {
                  markNotificationRead(latestUnreadNotif.id);
                  openApp(latestUnreadNotif.app);
                }}
                className="h-7 px-3 rounded-full bg-[var(--primitive-color-grafite)] border border-[var(--border-subtle)] shadow-lg flex items-center gap-2 text-[10px] text-white hover:scale-105 active:scale-95 transition-all max-w-[240px] truncate"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--primitive-color-coral-500)] animate-pulse shrink-0" />
                <span className="truncate font-semibold">{latestUnreadNotif.title}:</span>
                <span className="truncate text-slate-300">{latestUnreadNotif.body}</span>
              </button>
            ) : (
              <div className="w-20 h-4 rounded-full bg-[var(--primitive-color-pureblack)]" />
            )}
          </div>

          <div className="flex items-center gap-1.5 opacity-80 text-[11px]">
            <Wifi size={13} />
            <span className="text-[10px]">5G</span>
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">88%</span>
              <Battery size={13} />
            </div>
          </div>
        </div>

        {/* Viewport do Aplicativo Ativo */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {renderApp()}
        </div>

        {/* Barra de Gestos Inferior (Home Pill) */}
        <div className="h-6 flex items-center justify-center shrink-0 z-20">
          <button
            onClick={closeApp}
            title="Voltar à tela inicial (Home)"
            aria-label="Botão de início"
            className="w-28 h-1 rounded-full bg-[var(--text-muted)] hover:bg-[var(--text-primary)] transition-all opacity-40 hover:opacity-100 cursor-pointer active:scale-95"
          />
        </div>
      </div>
    </div>
  );
};
