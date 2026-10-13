// ==========================================================================
// ESCAPE ROOM KIDS — ROOM SOLVED CELEBRATION MODAL
// Friendly reward screen showing mystery resolved, stars, and next room access
// ==========================================================================

import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { ROOMS_DATA } from '../../game/roomsData';
import { Trophy, Star, ArrowRight, Home } from 'lucide-react';

export const RoomSolvedModal: React.FC = () => {
  const {
    gameMode,
    activeRoomId,
    nextRoom,
    returnToMenu,
  } = useGameStore();

  if (gameMode !== 'ROOM_SOLVED') return null;

  const currentRoom = ROOMS_DATA.find((r) => r.id === activeRoomId) ?? ROOMS_DATA[0]!;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        animation: 'popIn 250ms ease-out',
      }}
    >
      <div
        className="clay-card"
        style={{
          width: '100%',
          maxWidth: '540px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '32px 24px',
          position: 'relative',
        }}
      >
        {/* Trophy / Star Badge */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
            boxShadow: 'var(--clay-btn-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            animation: 'pulseGlow 2s infinite',
          }}
        >
          <Trophy size={42} color="#0F172A" />
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2rem',
            color: '#0F172A',
            marginBottom: '6px',
          }}
        >
          Mistério Resolvido!
        </h1>

        <div
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            marginBottom: '14px',
          }}
        >
          {currentRoom.name}
        </div>

        {/* 3 Stars Animation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          {[1, 2, 3].map((s) => (
            <Star key={s} size={36} fill="#F59E0B" color="#D97706" />
          ))}
        </div>

        {/* Story Resolution */}
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.5,
            color: '#334155',
            background: '#FFFBEB',
            border: '2px solid #FDE68A',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          {currentRoom.solvedStory}
        </p>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '14px', width: '100%' }}>
          <button
            onClick={returnToMenu}
            className="clay-btn clay-btn-glass"
            style={{ flex: 1 }}
          >
            <Home size={18} />
            <span>Menu de Salas</span>
          </button>

          <button
            onClick={nextRoom}
            className="clay-btn clay-btn-accent"
            style={{ flex: 1.2 }}
          >
            <span>Próxima Sala</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
