import React from 'react';
import type { BoardState, TokenTheme } from '../types/tokens';
import { TokenSlot } from './TokenSlot';
import { Sparkles, PlusCircle, Trophy, RefreshCw } from 'lucide-react';

interface TokenBoardProps {
  state: BoardState;
  themes: TokenTheme[];
  onAwardToken: (source: 'jogo' | 'clinic', description: string) => void;
  onChangeReinforcer: () => void;
  onSelectTheme: (themeId: string) => void;
}

export const TokenBoard: React.FC<TokenBoardProps> = ({
  state,
  themes,
  onAwardToken,
  onChangeReinforcer,
  onSelectTheme,
}) => {
  const activeTheme = themes.find((t) => t.id === state.activeTokenThemeId) || themes[0];
  const reinforcer = state.selectedReinforcer;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        maxWidth: '820px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '32px',
        padding: '32px 28px',
        boxShadow: '0 16px 40px rgba(30, 37, 43, 0.08)',
        border: '3px solid var(--tinta-15)',
        position: 'relative',
      }}
      id="token-board-container"
    >
      {/* Top Header Card: "Estou juntando para..." */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--fundo)',
          borderRadius: '20px',
          padding: '16px 20px',
          border: '2px solid var(--tinta-15)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              border: `2px solid ${reinforcer?.color || 'var(--buriti)'}`,
            }}
          >
            {reinforcer ? reinforcer.iconEmoji : '🎯'}
          </div>

          <div>
            <div
              style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: 'var(--tinta-60)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Estou juntando para:
            </div>
            <div
              style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--tinta)',
              }}
            >
              {reinforcer ? reinforcer.name : 'Escolha um objetivo'}
            </div>
          </div>
        </div>

        <button
          onClick={onChangeReinforcer}
          style={{
            padding: '8px 16px',
            borderRadius: '12px',
            border: '1.5px solid var(--tinta-15)',
            backgroundColor: '#FFFFFF',
            fontFamily: 'var(--font-hud)',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: 'var(--tinta)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={14} /> Trocar Reforçador
        </button>
      </div>

      {/* Grid of Token Slots */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          padding: '24px 12px',
          width: '100%',
          minHeight: '140px',
        }}
      >
        {Array.from({ length: state.targetSlots }).map((_, idx) => (
          <TokenSlot
            key={`slot-${idx}`}
            index={idx}
            isFilled={idx < state.currentTokens}
            theme={activeTheme}
            isNewestFilled={idx === state.currentTokens - 1}
          />
        ))}
      </div>

      {/* Board Completion Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Trophy size={18} color="var(--buriti)" />
        <span
          style={{
            fontFamily: 'var(--font-hud)',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: 'var(--vitoria-regia)',
          }}
        >
          {state.currentTokens} de {state.targetSlots} fichas conquistadas
        </span>
      </div>

      {/* Bottom Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          borderTop: '1.5px solid var(--tinta-15)',
          paddingTop: '18px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Token Theme Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
            Estilo da Ficha:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {themes.map((th) => (
              <button
                key={th.id}
                onClick={() => onSelectTheme(th.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: state.activeTokenThemeId === th.id ? `2px solid ${th.color}` : '1.5px solid var(--tinta-15)',
                  backgroundColor: state.activeTokenThemeId === th.id ? `${th.color}15` : '#FFFFFF',
                  fontFamily: 'var(--font-hud)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  color: 'var(--tinta)',
                  cursor: 'pointer',
                }}
              >
                {th.name}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Award Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onAwardToken('jogo', 'Acerto em atividade de jogo ABA')}
            disabled={state.isCompleted}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: state.isCompleted ? 'var(--tinta-15)' : 'var(--vitoria-regia)',
              color: state.isCompleted ? 'var(--tinta-60)' : '#FFFFFF',
              fontFamily: 'var(--font-hud)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: state.isCompleted ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: state.isCompleted ? 'none' : '0 4px 12px rgba(45, 106, 79, 0.3)',
            }}
            id="btn-award-token"
          >
            <PlusCircle size={18} />
            <span>Entregar Ficha (+1)</span>
          </button>

          <button
            onClick={() => onAwardToken('clinic', 'Reforço do aplicador em atividade de mesa')}
            disabled={state.isCompleted}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1.5px solid var(--buriti)',
              backgroundColor: '#FFFFFF',
              color: 'var(--buriti)',
              fontFamily: 'var(--font-hud)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: state.isCompleted ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            id="btn-award-clinic"
          >
            <Sparkles size={16} />
            <span>Aplicador (Mesa)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
