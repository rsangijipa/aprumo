// ==========================================================================
// ESCAPE ROOM KIDS — LAYERED HINT SYSTEM MODAL
// 4 Progressive Levels: Ambient -> Textual -> 3D Highlight -> Direct Guidance
// ==========================================================================

import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { ROOMS_DATA } from '../../game/roomsData';
import { Lightbulb, X, ChevronRight, Sparkles, MapPin } from 'lucide-react';

export const HintModal: React.FC = () => {
  const {
    hintModalOpen,
    closeHintModal,
    hintLevel,
    requestNextHint,
    activeRoomId,
    solvedPuzzles,
  } = useGameStore();

  if (!hintModalOpen) return null;

  const currentRoom = ROOMS_DATA.find((r) => r.id === activeRoomId) || ROOMS_DATA[0];
  const roomSolved = solvedPuzzles[activeRoomId] || [];
  // Find current unsolved puzzle
  const currentPuzzle = currentRoom.puzzles.find((p) => !roomSolved.includes(p.id)) || currentRoom.puzzles[0];
  const hints = currentPuzzle.hints;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dicas"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
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
        aria-label="Fechar modal de dicas"
        onClick={closeHintModal}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lightbulb size={24} color="#D97706" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#0F172A' }}>
                Sistema de Dicas Gentis
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Enigma atual: {currentPuzzle.title}
              </span>
            </div>
          </div>
          <button
            onClick={closeHintModal}
            className="clay-btn clay-btn-glass"
            style={{ width: '38px', height: '38px', minWidth: '38px', minHeight: '38px', padding: 0 }}
            aria-label="Fechar Dicas"
          >
            <X size={18} />
          </button>
        </div>

        {/* Level Progression Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          {[1, 2, 3, 4].map((lvl) => (
            <div
              key={lvl}
              style={{
                flex: 1,
                height: '8px',
                borderRadius: '4px',
                backgroundColor: lvl <= hintLevel ? '#F59E0B' : '#E2E8F0',
                transition: 'background-color 200ms ease',
              }}
            />
          ))}
        </div>

        {/* Layered Clue Boxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Level 1: Ambient Nudge */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '2px solid #E2E8F0',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Nível 1 • Observação no Ambiente
            </div>
            <p style={{ marginTop: '4px', color: '#1E293B', fontSize: '0.95rem' }}>
              {hints.ambient}
            </p>
          </div>

          {/* Level 2: Textual Clue */}
          {hintLevel >= 2 && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#FEF3C7',
                border: '2px solid #FDE68A',
                animation: 'slideUp 200ms ease-out',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>
                Nível 2 • Pista Textual Direcionada
              </div>
              <p style={{ marginTop: '4px', color: '#92400E', fontSize: '0.95rem' }}>
                {hints.textual}
              </p>
            </div>
          )}

          {/* Level 3: 3D Region Highlight */}
          {hintLevel >= 3 && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#EEF2FF',
                border: '2px solid #C7D2FE',
                animation: 'slideUp 200ms ease-out',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <MapPin size={20} color="#4F46E5" />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase' }}>
                  Nível 3 • Local em Destaque no Diorama
                </div>
                <p style={{ marginTop: '2px', color: '#312E81', fontSize: '0.9rem' }}>
                  O objeto necessário está brilhando em dourado na sala 3D!
                </p>
              </div>
            </div>
          )}

          {/* Level 4: Explicit First Step */}
          {hintLevel >= 4 && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#ECFDF5',
                border: '2px solid #A7F3D0',
                animation: 'slideUp 200ms ease-out',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                Nível 4 • Solução do Primeiro Passo
              </div>
              <p style={{ marginTop: '4px', color: '#065F46', fontSize: '0.95rem', fontWeight: 600 }}>
                {hints.directStep}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            Dica {hintLevel} de 4 (sem nenhuma penalidade)
          </span>

          {hintLevel < 4 ? (
            <button
              onClick={requestNextHint}
              className="clay-btn clay-btn-accent"
              style={{ padding: '8px 18px', fontSize: '0.95rem' }}
            >
              <Sparkles size={16} />
              <span>Próxima Dica</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={closeHintModal}
              className="clay-btn clay-btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.95rem' }}
            >
              Entendi!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
