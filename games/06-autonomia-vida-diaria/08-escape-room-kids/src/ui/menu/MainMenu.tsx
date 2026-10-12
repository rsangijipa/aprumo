// ==========================================================================
// ESCAPE ROOM KIDS — MAIN MENU & ROOM SELECTOR
// Age Profile Picker (6+, 9+, 12-15), 3 Thematic Room Cards, Claymorphic Design
// ==========================================================================

import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { ROOMS_DATA } from '../../game/roomsData';
import { AgeProfile } from '../../game/types';
import { Play, Star, Settings, ShieldCheck, Sparkles, BookOpen, Compass, Flower2 } from 'lucide-react';

interface MainMenuProps {
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onOpenSettings }) => {
  const {
    ageProfile,
    setAgeProfile,
    startGame,
    completedRooms,
    solvedPuzzles,
  } = useGameStore();

  const profiles: { id: AgeProfile; label: string; desc: string }[] = [
    { id: '6+', label: '6+ Anos', desc: 'Cores, formas e sequências simples' },
    { id: '9+', label: '9+ Anos', desc: 'Códigos, rotação, pesos e símbolos' },
    { id: 'teens', label: '12–15 Anos', desc: 'Circuitos, lógica e inferência' },
  ];

  const getRoomIcon = (id: string) => {
    if (id === 'workshop') return <Compass size={32} color="#F59E0B" />;
    if (id === 'library') return <BookOpen size={32} color="#38BDF8" />;
    return <Flower2 size={32} color="#10B981" />;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #1e1b2e 0%, #2e1065 50%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 16px',
        position: 'relative',
        zIndex: 30,
      }}
    >
      {/* Top Header */}
      <header
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              color: '#FDE047',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={16} />
            <span>Ambiente Seguro • Sem Sustos • Educativo</span>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="clay-btn clay-btn-glass"
          style={{ width: '44px', height: '44px', minWidth: '44px', minHeight: '44px', padding: 0 }}
          aria-label="Configurações"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Title & Hero Banner */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
            fontWeight: 800,
            color: '#FFFFFF',
            textShadow: '0 4px 16px rgba(236, 72, 153, 0.5)',
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
          }}
        >
          Escape Room Kids
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            color: '#DDD6FE',
            marginTop: '8px',
            maxWidth: '560px',
            lineHeight: 1.4,
          }}
        >
          Explore salas misteriosas em 3D, descubra como seus mecanismos funcionam e abra o caminho da saída!
        </p>
      </div>

      {/* Age Profile Selector Tabs */}
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          marginBottom: '36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '0.9rem', color: '#CBD5E1', fontWeight: 600 }}>
          Selecione a faixa etária para calibrar os enigmas:
        </span>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            width: '100%',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {profiles.map((p) => {
            const isSelected = ageProfile === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setAgeProfile(p.id)}
                className={`clay-btn ${isSelected ? 'clay-btn-primary' : 'clay-btn-glass'}`}
                style={{
                  flex: '1 1 200px',
                  maxWidth: '220px',
                  flexDirection: 'column',
                  padding: '12px',
                  borderRadius: '18px',
                  textAlign: 'center',
                  transform: isSelected ? 'translateY(-3px)' : 'none',
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{p.label}</span>
                <span style={{ fontSize: '0.75rem', opacity: isSelected ? 0.95 : 0.7, marginTop: '2px' }}>
                  {p.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Thematic Room Cards Grid */}
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}
      >
        {ROOMS_DATA.map((room) => {
          const isCompleted = completedRooms.includes(room.id);
          const solvedCount = (solvedPuzzles[room.id] || []).length;

          return (
            <div
              key={room.id}
              className="clay-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                borderRadius: '24px',
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.95)',
                transition: 'transform 200ms ease, box-shadow 200ms ease',
              }}
            >
              <div>
                {/* Header Icon + Stars */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getRoomIcon(room.id)}
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        size={20}
                        fill={isCompleted ? '#F59E0B' : '#E2E8F0'}
                        color={isCompleted ? '#D97706' : '#CBD5E1'}
                      />
                    ))}
                  </div>
                </div>

                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.4rem',
                    color: '#0F172A',
                    marginBottom: '4px',
                  }}
                >
                  {room.name}
                </h2>

                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: room.accentColor,
                    marginBottom: '10px',
                  }}
                >
                  {room.themeName}
                </div>

                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.4, marginBottom: '16px' }}>
                  {room.introStory.substring(0, 110)}...
                </p>

                {/* Progress tag */}
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '20px',
                  }}
                >
                  <Sparkles size={14} color="#F59E0B" />
                  <span>
                    {isCompleted
                      ? 'Sala Concluída com Sucesso!'
                      : `${solvedCount} de ${room.puzzles.length} enigmas resolvidos`}
                  </span>
                </div>
              </div>

              {/* Play button */}
              <button
                onClick={() => startGame(room.id)}
                className="clay-btn clay-btn-accent"
                style={{ width: '100%', fontSize: '1.05rem' }}
              >
                <Play size={18} fill="#0F172A" />
                <span>{isCompleted ? 'Jogar Novamente' : 'Entrar na Sala'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
