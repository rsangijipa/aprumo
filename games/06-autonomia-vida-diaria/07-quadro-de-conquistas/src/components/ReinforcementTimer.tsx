import React, { useEffect } from 'react';
import type { ReinforcerOption } from '../types/tokens';
import { sound } from '../utils/sound';
import { ArrowRight, AlertTriangle } from 'lucide-react';

interface ReinforcementTimerProps {
  reinforcer: ReinforcerOption;
  secondsRemaining: number;
  totalDuration: number;
  onFinish: () => void;
  onTick: () => void;
}

export const ReinforcementTimer: React.FC<ReinforcementTimerProps> = ({
  reinforcer,
  secondsRemaining,
  totalDuration,
  onFinish,
  onTick,
}) => {
  const isNearEnd = secondsRemaining <= 30;
  const progressRatio = totalDuration > 0 ? secondsRemaining / totalDuration : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      onTick();
    }, 1000);

    return () => clearInterval(interval);
  }, [onTick]);

  // Trigger gentle warning sound when reaching exactly 30 seconds
  useEffect(() => {
    if (secondsRemaining === 30) {
      sound.playTransitionWarning();
    }
  }, [secondsRemaining]);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        padding: '36px 32px',
        backgroundColor: '#FFFFFF',
        borderRadius: '32px',
        maxWidth: '540px',
        width: '100%',
        boxShadow: '0 20px 45px rgba(30, 37, 43, 0.15)',
        border: `4px solid ${isNearEnd ? 'var(--acai)' : 'var(--igarape)'}`,
        animation: 'scaleUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
        transition: 'border-color 0.4s ease',
      }}
      id="reinforcement-timer"
    >
      {/* Target Reinforcer Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '42px', marginBottom: '8px' }}>{reinforcer.iconEmoji}</div>
        <h2
          style={{
            fontFamily: 'var(--font-hud)',
            fontSize: '1.7rem',
            fontWeight: 800,
            color: 'var(--tinta)',
            margin: '0 0 4px 0',
          }}
        >
          Hora do Reforço: {reinforcer.name}!
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-corpo)',
            fontSize: '0.95rem',
            color: 'var(--tinta-60)',
            margin: 0,
          }}
        >
          Aproveite seu prêmio com calma. O círculo vai se esvaziando suavemente.
        </p>
      </div>

      {/* Circular Progress Gauge */}
      <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="var(--tinta-15)"
            strokeWidth="16"
          />

          {/* Draining progress bar */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={isNearEnd ? 'var(--acai)' : 'var(--igarape)'}
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease',
            }}
          />
        </svg>

        {/* Center content */}
        <div
          style={{
            position: 'absolute',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              fontFamily: 'var(--font-hud)',
              color: isNearEnd ? 'var(--acai)' : 'var(--igarape)',
              lineHeight: 1,
            }}
          >
            {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)', marginTop: '4px' }}>
            restantes
          </span>
        </div>
      </div>

      {/* Predictable 30s Transition Alert Banner */}
      {isNearEnd && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(88, 24, 69, 0.1)',
            color: 'var(--acai)',
            padding: '12px 20px',
            borderRadius: '16px',
            border: '2px solid var(--acai)',
            animation: 'pulse 1.2s infinite alternate',
            width: '100%',
            justifyContent: 'center',
          }}
          id="transition-alert-30s"
        >
          <AlertTriangle size={20} />
          <span style={{ fontFamily: 'var(--font-hud)', fontWeight: 800, fontSize: '0.95rem' }}>
            Falta pouquinho! Quase na hora de voltar.
          </span>
        </div>
      )}

      {/* Transition to next board action */}
      <button
        onClick={onFinish}
        style={{
          width: '100%',
          height: '56px',
          borderRadius: '16px',
          border: 'none',
          backgroundColor: 'var(--vitoria-regia)',
          color: '#FFFFFF',
          fontFamily: 'var(--font-hud)',
          fontWeight: 700,
          fontSize: '1.05rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 6px 16px rgba(45, 106, 79, 0.35)',
        }}
        id="btn-return-task"
      >
        <span>Voltar à Tarefa & Próximo Quadro</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};
