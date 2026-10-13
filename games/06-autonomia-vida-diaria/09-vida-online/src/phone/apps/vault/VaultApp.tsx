import React, { useState } from 'react';
import { ArrowLeft, Shield, Lock, Sliders, KeyRound } from 'lucide-react';
import { useNarrativeStore } from '../../../narrative/engine/narrativeStore';

export const VaultApp: React.FC = () => {
  const { closeApp, setModal, indicators } = useNarrativeStore();
  const [twoFactor, setTwoFactor] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(true);

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
            <h1 className="text-sm font-bold text-[var(--text-primary)]">Nexo Vault & Privacidade</h1>
            <span className="text-[10px] text-[var(--text-muted)]">Auditoria de Segurança Digital</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-[var(--primitive-color-turquesa-400)]">
          <Shield size={16} />
          <span>Ativo</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Painel Central de Saúde de Segurança */}
        <div className="p-4 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primitive-color-turquesa-glow)] text-[var(--primitive-color-turquesa-400)] mb-1">
            <Lock size={28} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Índice de Privacidade: {indicators.privacidade}%</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Seu dispositivo Nexo monitora tentativas de acesso indevido e permissões abusivas.
            </p>
          </div>
        </div>

        {/* Módulos de Ação Rápida */}
        <div className="space-y-2.5">
          <h3 className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
            Ferramentas do Vault
          </h3>

          <button
            onClick={() => setModal('minigame_perms')}
            className="w-full p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-left flex items-center justify-between transition-colors shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[var(--primitive-color-azul-glow)] text-[var(--primitive-color-azul-400)]">
                <Sliders size={18} />
              </div>
              <div>
                <span className="text-xs font-bold block text-[var(--text-primary)]">Auditor de Permissões de Apps</span>
                <span className="text-[11px] text-[var(--text-muted)]">Verificar quais apps acessam microfone e câmera</span>
              </div>
            </div>
            <span className="text-xs text-[var(--primitive-color-azul-400)] font-medium">Abrir →</span>
          </button>

          <button
            onClick={() => setModal('minigame_url')}
            className="w-full p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-left flex items-center justify-between transition-colors shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[var(--primitive-color-coral-glow)] text-[var(--primitive-color-coral-400)]">
                <KeyRound size={18} />
              </div>
              <div>
                <span className="text-xs font-bold block text-[var(--text-primary)]">Testador de Força de Senha</span>
                <span className="text-[11px] text-[var(--text-muted)]">Criar frases-passe resistentes a vazamentos</span>
              </div>
            </div>
            <span className="text-xs text-[var(--primitive-color-azul-400)] font-medium">Abrir →</span>
          </button>
        </div>

        {/* Toggles de Segurança do Nexo */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3.5 shadow-sm">
          <h3 className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
            Blindagem do Sistema
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold block text-[var(--text-primary)]">Autenticação em Duas Etapas (2FA)</span>
              <span className="text-[11px] text-[var(--text-muted)]">Exigir código extra para login em novos aparelhos</span>
            </div>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => setTwoFactor(e.target.checked)}
              className="w-4 h-4 accent-[var(--primitive-color-turquesa-500)] rounded"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
            <div>
              <span className="text-xs font-semibold block text-[var(--text-primary)]">Perfil Restrito a Contatos Salvos</span>
              <span className="text-[11px] text-[var(--text-muted)]">Desconhecidos não veem fotos nem status</span>
            </div>
            <input
              type="checkbox"
              checked={privateProfile}
              onChange={(e) => setPrivateProfile(e.target.checked)}
              className="w-4 h-4 accent-[var(--primitive-color-turquesa-500)] rounded"
            />
          </div>
        </div>
      </main>
    </div>
  );
};
