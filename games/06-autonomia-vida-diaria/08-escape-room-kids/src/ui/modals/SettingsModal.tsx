// ==========================================================================
// ESCAPE ROOM KIDS — SETTINGS & ACCESSIBILITY MODAL
// Audio controls, camera modes, motion reduction, high contrast, safe resets
// ==========================================================================

import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { X, Volume2, VolumeX, Eye, RotateCcw, Home, Compass } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    cameraMode,
    setCameraMode,
    returnToMenu,
    startGame,
    activeRoomId,
    resetAllProgress,
  } = useGameStore();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Configurações e Acessibilidade"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
        animation: 'popIn 180ms ease-out',
      }}
    >
      <button
        type="button"
        aria-label="Fechar configurações"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
        }}
      />
      <div
        className="clay-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid var(--color-border)',
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#0F172A' }}>
            Configurações e Acessibilidade
          </h2>
          <button
            onClick={onClose}
            className="clay-btn clay-btn-glass"
            style={{ width: '38px', height: '38px', minWidth: '38px', minHeight: '38px', padding: 0 }}
            aria-label="Fechar Configurações"
          >
            <X size={18} />
          </button>
        </div>

        {/* Options list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. Audio Section */}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              Áudio e Efeitos
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => updateSettings({ isMuted: !settings.isMuted })}
                className={`clay-btn ${settings.isMuted ? 'clay-btn-glass' : 'clay-btn-accent'}`}
                style={{ padding: '8px 16px', fontSize: '0.95rem' }}
              >
                {settings.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                <span>{settings.isMuted ? 'Mudo' : 'Ativo'}</span>
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                style={{ flex: 1, accentColor: '#F59E0B' }}
                aria-label="Volume de Som"
              />
            </div>
          </div>

          {/* 2. Camera Controls */}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              Modo de Câmera
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setCameraMode('orbit')}
                className={`clay-btn ${cameraMode === 'orbit' ? 'clay-btn-primary' : 'clay-btn-glass'}`}
                style={{ flex: 1, fontSize: '0.9rem', padding: '10px' }}
              >
                <Compass size={18} />
                <span>Point & Click (Órbita)</span>
              </button>
              <button
                onClick={() => setCameraMode('firstPerson')}
                className={`clay-btn ${cameraMode === 'firstPerson' ? 'clay-btn-primary' : 'clay-btn-glass'}`}
                style={{ flex: 1, fontSize: '0.9rem', padding: '10px' }}
              >
                <Eye size={18} />
                <span>Exploração (1ª Pessoa)</span>
              </button>
            </div>
          </div>

          {/* 3. Accessibility Toggles */}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              Acessibilidade
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.95rem', color: '#1E293B' }}>Reduzir Movimento da Câmera</span>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: '#EC4899' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.95rem', color: '#1E293B' }}>Legendas Visuais para Sons</span>
                <input
                  type="checkbox"
                  checked={settings.visualAudio}
                  onChange={(e) => updateSettings({ visualAudio: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: '#EC4899' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.95rem', color: '#1E293B' }}>Alto Contraste nos Textos</span>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: '#EC4899' }}
                />
              </label>
            </div>
          </div>

          {/* 4. Navigation & Restart */}
          <div style={{ borderTop: '2px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  startGame(activeRoomId);
                  onClose();
                }}
                className="clay-btn clay-btn-glass"
                style={{ flex: 1, fontSize: '0.9rem' }}
              >
                <RotateCcw size={16} />
                <span>Reiniciar Sala</span>
              </button>

              <button
                onClick={() => {
                  returnToMenu();
                  onClose();
                }}
                className="clay-btn clay-btn-secondary"
                style={{ flex: 1, fontSize: '0.9rem' }}
              >
                <Home size={16} />
                <span>Menu Principal</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja reiniciar todo o progresso do jogo?')) {
                  resetAllProgress();
                  onClose();
                }
              }}
              className="clay-btn clay-btn-glass"
              style={{ color: '#EF4444', fontSize: '0.85rem', padding: '6px' }}
            >
              Apagar Progresso Salvo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
