import React from 'react';
import { ArrowLeft, Moon, Sun, Eye, Volume2, Type, Sparkles, RotateCcw } from 'lucide-react';
import { useNarrativeStore } from '../../../narrative/engine/narrativeStore';

export const SettingsApp: React.FC = () => {
  const { closeApp, settings, updateSettings, resetProgress } = useNarrativeStore();

  const handleReset = () => {
    if (window.confirm('Tem certeza de que deseja reiniciar o progresso da história? Todas as escolhas voltarão ao início.')) {
      resetProgress();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-nexo-screen)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="px-4 py-3 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={closeApp}
            aria-label="Voltar"
            className="p-1.5 -ml-1.5 rounded-full hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-[var(--text-primary)]">Ajustes & Acessibilidade</h1>
            <span className="text-[10px] text-[var(--text-muted)]">Personalização do Nexo OS</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Aparência */}
        <section className="p-4 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3.5 shadow-sm">
          <h2 className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
            Aparência & Visual
          </h2>

          {/* Modo Escuro / Claro */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {settings.theme === 'dark' ? <Moon size={18} className="text-[var(--primitive-color-lilas-400)]" /> : <Sun size={18} className="text-amber-500" />}
              <div>
                <span className="text-xs font-semibold block text-[var(--text-primary)]">Tema Escuro</span>
                <span className="text-[11px] text-[var(--text-muted)]">Alternar entre paleta diurna e noturna</span>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                settings.theme === 'dark'
                  ? 'bg-[var(--primitive-color-azul-500)] text-white'
                  : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              {settings.theme === 'dark' ? 'Ativado' : 'Desativado'}
            </button>
          </div>

          {/* Alto Contraste */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <Eye size={18} className="text-[var(--primitive-color-turquesa-400)]" />
              <div>
                <span className="text-xs font-semibold block text-[var(--text-primary)]">Modo Alto Contraste</span>
                <span className="text-[11px] text-[var(--text-muted)]">Destaque máximo de bordas e textos</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => updateSettings({ highContrast: e.target.checked })}
              className="w-4 h-4 accent-[var(--primitive-color-turquesa-500)] rounded"
            />
          </div>
        </section>

        {/* Tipografia & Acessibilidade */}
        <section className="p-4 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3.5 shadow-sm">
          <h2 className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
            Acessibilidade de Leitura
          </h2>

          {/* Fonte Dyslexia */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Type size={18} className="text-[var(--primitive-color-azul-400)]" />
              <div>
                <span className="text-xs font-semibold block text-[var(--text-primary)]">Fonte Amigável para Dislexia</span>
                <span className="text-[11px] text-[var(--text-muted)]">Espaçamento e traçado com alta legibilidade</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.dyslexicFont}
              onChange={(e) => updateSettings({ dyslexicFont: e.target.checked })}
              className="w-4 h-4 accent-[var(--primitive-color-azul-500)] rounded"
            />
          </div>

          {/* Tamanho da Fonte */}
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
            <span className="text-xs font-semibold block text-[var(--text-primary)]">Tamanho do Texto</span>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateSettings({ fontSize: size })}
                  className={`py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                    settings.fontSize === size
                      ? 'bg-[var(--primitive-color-azul-500)] text-white'
                      : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  {size === 'normal' ? 'Padrão' : size === 'large' ? 'Grande' : 'Muito Grande'}
                </button>
              ))}
            </div>
          </div>

          {/* Leitura em Voz Alta (TTS) */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <Volume2 size={18} className="text-[var(--primitive-color-turquesa-400)]" />
              <div>
                <span className="text-xs font-semibold block text-[var(--text-primary)]">Leitura em Voz Alta Automática</span>
                <span className="text-[11px] text-[var(--text-muted)]">Narração em voz alta das mensagens recebidas</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.speechEnabled}
              onChange={(e) => updateSettings({ speechEnabled: e.target.checked })}
              className="w-4 h-4 accent-[var(--primitive-color-turquesa-500)] rounded"
            />
          </div>

          {/* Movimento Reduzido */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-[var(--primitive-color-coral-400)]" />
              <div>
                <span className="text-xs font-semibold block text-[var(--text-primary)]">Reduzir Animações</span>
                <span className="text-[11px] text-[var(--text-muted)]">Transições instantâneas e sem solavancos</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
              className="w-4 h-4 accent-[var(--primitive-color-coral-500)] rounded"
            />
          </div>
        </section>

        {/* Áudio & Ritmo */}
        <section className="p-4 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3.5 shadow-sm">
          <h2 className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
            Áudio & Ritmo
          </h2>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Efeitos Sonoros Sutis</span>
            <input
              type="checkbox"
              checked={settings.audioEnabled}
              onChange={(e) => updateSettings({ audioEnabled: e.target.checked })}
              className="w-4 h-4 accent-[var(--primitive-color-azul-500)] rounded"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Volume do Som</span>
              <span className="text-[var(--text-muted)]">{Math.round(settings.audioVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.audioVolume}
              onChange={(e) => updateSettings({ audioVolume: parseFloat(e.target.value) })}
              className="w-full accent-[var(--primitive-color-azul-500)]"
            />
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
            <span className="text-xs font-semibold block text-[var(--text-primary)]">Velocidade de Digitação Simulada</span>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'fast', 'instant'] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => updateSettings({ typingSpeed: speed })}
                  className={`py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                    settings.typingSpeed === speed
                      ? 'bg-[var(--primitive-color-azul-500)] text-white'
                      : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  {speed === 'normal' ? 'Normal' : speed === 'fast' ? 'Rápida' : 'Instantânea'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gerenciamento de Dados */}
        <section className="p-4 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3 shadow-sm">
          <h2 className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
            Privacidade & Armazenamento Local
          </h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Seus dados são 100% locais no navegador. Nenhuma informação pessoal ou conversa é enviada para servidores externos.
          </p>

          <button
            onClick={handleReset}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--primitive-color-coral-glow)] hover:bg-[var(--primitive-color-coral-500)]/30 border border-[var(--primitive-color-coral-500)]/40 text-xs font-semibold text-[var(--primitive-color-coral-400)] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            Reiniciar Todo o Progresso da História
          </button>
        </section>
      </main>
    </div>
  );
};
