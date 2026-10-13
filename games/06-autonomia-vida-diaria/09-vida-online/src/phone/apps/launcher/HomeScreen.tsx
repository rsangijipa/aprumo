import React from 'react';
import { Shield, Eye, Flame, HeartHandshake, Play, Map } from 'lucide-react';
import { useNarrativeStore, type AppId } from '../../../narrative/engine/narrativeStore';
import { EPISODES } from '../../../narrative/content/episodes';
import { 
  PulseIcon, 
  LoopIcon, 
  PlayHubIcon, 
  VaultIcon, 
  MailboxIcon, 
  FeedIcon, 
  SettingsIcon,
  DetectiveIcon 
} from '../../../assets/svg/AppIcons';

export const HomeScreen: React.FC = () => {
  const { 
    openApp, 
    setModal, 
    currentEpisodeId, 
    indicators, 
    notifications 
  } = useNarrativeStore();

  const currentEp = EPISODES.find((e) => e.id === currentEpisodeId) ?? EPISODES[0]!;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const APPS = [
    { id: 'pulse', name: 'Pulse', icon: PulseIcon, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'loop', name: 'Loop', icon: LoopIcon },
    { id: 'playhub', name: 'PlayHub', icon: PlayHubIcon },
    { id: 'vault', name: 'Vault', icon: VaultIcon },
    { id: 'mailbox', name: 'Mailbox', icon: MailboxIcon },
    { id: 'feed', name: 'Feed', icon: FeedIcon },
    { id: 'settings', name: 'Ajustes', icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-nexo-screen)] text-[var(--text-primary)] justify-between p-4 sm:p-6 overflow-y-auto">
      {/* Topo: Relógio e Data Nexo */}
      <div className="space-y-4">
        <div className="pt-2">
          <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold block">
            Segunda-feira • Semana de Convivência
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            14:20
          </h1>
        </div>

        {/* Card do Capítulo em Andamento (Hero Widget) */}
        <div className="p-4 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-md space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--primitive-color-azul-glow)] text-[var(--primitive-color-azul-400)] border border-[var(--primitive-color-azul-500)]/30">
              Capítulo {currentEp.number} de 12
            </span>
            <button
              onClick={() => setModal('all_episodes')}
              className="text-xs text-[var(--primitive-color-azul-400)] hover:underline flex items-center gap-1 font-semibold"
            >
              <Map size={13} /> Ver Mapa
            </button>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">{currentEp.title}</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2 leading-relaxed">
              {currentEp.subtitle}
            </p>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">
              App principal: <strong className="text-[var(--text-primary)] capitalize">{currentEp.targetApp}</strong>
            </span>
            <button
              onClick={() => openApp(currentEp.targetApp)}
              className="py-1.5 px-3.5 rounded-xl bg-[var(--primitive-color-azul-500)] hover:bg-[var(--primitive-color-azul-600)] text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all active:scale-95"
            >
              <Play size={12} fill="white" />
              <span>Entrar no Chat</span>
            </button>
          </div>
        </div>

        {/* Widget dos 4 Indicadores da Cidadania Digital */}
        <button
          onClick={() => setModal('context_drawer')}
          className="w-full text-left p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] transition-colors shadow-sm block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Indicadores Nexo
            </span>
            <span className="text-[11px] text-[var(--primitive-color-turquesa-400)] font-medium">
              Ver Detalhes →
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              <Shield size={14} className="mx-auto text-[var(--primitive-color-turquesa-400)] mb-0.5" />
              <span className="block text-[10px] text-[var(--text-muted)]">Privacidade</span>
              <span className="font-bold text-xs text-[var(--text-primary)]">{indicators.privacidade}%</span>
            </div>

            <div className="p-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              <Eye size={14} className="mx-auto text-[var(--primitive-color-azul-400)] mb-0.5" />
              <span className="block text-[10px] text-[var(--text-muted)]">Clareza</span>
              <span className="font-bold text-xs text-[var(--text-primary)]">{indicators.clareza}%</span>
            </div>

            <div className="p-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              <Flame size={14} className="mx-auto text-[var(--primitive-color-coral-400)] mb-0.5" />
              <span className="block text-[10px] text-[var(--text-muted)]">Limites</span>
              <span className="font-bold text-xs text-[var(--text-primary)]">{indicators.limites}%</span>
            </div>

            <div className="p-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              <HeartHandshake size={14} className="mx-auto text-[var(--primitive-color-lilas-400)] mb-0.5" />
              <span className="block text-[10px] text-[var(--text-muted)]">Confiança</span>
              <span className="font-bold text-xs text-[var(--text-primary)]">{indicators.confianca}%</span>
            </div>
          </div>
        </button>

        {/* Grade de Aplicativos Principais */}
        <div className="pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-3">
            Aplicativos do Nexo
          </span>
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
            {APPS.map((app) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => openApp(app.id as AppId)}
                  className="flex flex-col items-center gap-1.5 group focus:outline-none"
                >
                  <div className="relative p-1 rounded-2xl group-hover:scale-105 group-active:scale-95 transition-all shadow-sm">
                    <Icon size={48} />
                    {app.badge && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--primitive-color-coral-500)] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-[var(--bg-nexo-screen)] shadow">
                        {app.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate max-w-full">
                    {app.name}
                  </span>
                </button>
              );
            })}

            {/* Atalho Especial: Laboratório Detetive Digital */}
            <button
              onClick={() => setModal('minigame_url')}
              className="flex flex-col items-center gap-1.5 group focus:outline-none"
            >
              <div className="relative p-1 rounded-2xl group-hover:scale-105 group-active:scale-95 transition-all shadow-sm">
                <DetectiveIcon size={48} />
              </div>
              <span className="text-[11px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate max-w-full">
                Detetive
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Dock Inferior */}
      <footer className="mt-6 pt-3 px-4 py-2.5 rounded-3xl bg-[var(--bg-surface-glass)] border border-[var(--border-subtle)] backdrop-blur-lg flex items-center justify-around shadow-lg">
        <button
          onClick={() => openApp('pulse')}
          title="Pulse Mensagens"
          className="p-2 rounded-2xl hover:bg-[var(--bg-surface-subtle)] active:scale-90 transition-transform"
        >
          <PulseIcon size={34} />
        </button>

        <button
          onClick={() => openApp('vault')}
          title="Nexo Vault"
          className="p-2 rounded-2xl hover:bg-[var(--bg-surface-subtle)] active:scale-90 transition-transform"
        >
          <VaultIcon size={34} />
        </button>

        <button
          onClick={() => openApp('loop')}
          title="Loop Fórum"
          className="p-2 rounded-2xl hover:bg-[var(--bg-surface-subtle)] active:scale-90 transition-transform"
        >
          <LoopIcon size={34} />
        </button>

        <button
          onClick={() => openApp('settings')}
          title="Ajustes Nexo"
          className="p-2 rounded-2xl hover:bg-[var(--bg-surface-subtle)] active:scale-90 transition-transform"
        >
          <SettingsIcon size={34} />
        </button>
      </footer>
    </div>
  );
};
