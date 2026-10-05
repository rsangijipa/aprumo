import { useState } from 'react';
import { Button, IconPrinter } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';

export function TokenBoardStudio() {
  const [capacity, setCapacity] = useState<3 | 5 | 8 | 10>(5);
  const [earned, setEarned] = useState(2);
  type TokenTheme = 'estrela' | 'dinossauro' | 'coracao' | 'foguete' | 'heroi' | 'carro';
  const [theme, setTheme] = useState<TokenTheme>('estrela');
  const [reward, setReward] = useState('Brinquedo Especial');
  const [customReward, setCustomReward] = useState('');

  const icons: Record<TokenTheme, { emoji: string; label: string }> = {
    estrela: { emoji: '⭐', label: 'Estrela' },
    dinossauro: { emoji: '🦖', label: 'Dinossauro' },
    coracao: { emoji: '❤️', label: 'Coração' },
    foguete: { emoji: '🚀', label: 'Foguete' },
    heroi: { emoji: '🦸', label: 'Super-Herói' },
    carro: { emoji: '🏎️', label: 'Carro de Corrida' },
  };

  const addToken = () => {
    if (earned < capacity) {
      const next = earned + 1;
      setEarned(next);
      playTones([
        { freq: 440 + next * 45, dur: 0.12, type: 'sine' },
      ], 'normal');

      if (next === capacity) {
        setTimeout(() => {
          playTones([
            { freq: 523.25, dur: 0.15, type: 'sine' },
            { freq: 659.25, dur: 0.15, delay: 0.12, type: 'sine' },
            { freq: 783.99, dur: 0.18, delay: 0.24, type: 'sine' },
            { freq: 1046.5, dur: 0.4, delay: 0.36, type: 'sine' },
          ], 'normal');
          void speak(`Parabéns! Você conquistou todas as fichas! Hora de receber seu prêmio: ${reward}!`, 'normal');
        }, 150);
      }
    }
  };

  const removeToken = () => {
    if (earned > 0) setEarned(earned - 1);
  };

  const presetRewards = [
    'Brinquedo Especial',
    'Tablet por 10 min',
    'Massinha de Modelar',
    'Ir ao Parquinho',
    'Cama Elástica',
    'Soprar Bolhas',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', width: '100%' }}>
      {/* Top Configuration Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          width: '100%',
        }}
      >
        {/* Capacity Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, color: 'var(--ap-text-muted)' }}>
            FICHAS:
          </span>
          {([3, 5, 8, 10] as const).map((c) => (
            <button
              key={c}
              type="button"
              className="rs-tab-pill"
              aria-pressed={capacity === c}
              onClick={() => {
                setCapacity(c);
                setEarned(0);
              }}
            >
              {c} Fichas
            </button>
          ))}
        </div>

        {/* Theme Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, color: 'var(--ap-text-muted)' }}>
            TEMA:
          </span>
          {Object.entries(icons).map(([k, v]) => (
            <button
              key={k}
              type="button"
              className="rs-tab-pill"
              aria-pressed={theme === k}
              onClick={() => setTheme(k as TokenTheme)}
            >
              {v.emoji} {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Token Board Canvas */}
      <div
        style={{
          background: 'var(--ap-surface-sunken, #f8fafc)',
          border: '3px solid var(--ap-border-strong, #cbd5e1)',
          borderRadius: '28px',
          padding: '2rem',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
          alignItems: 'center',
          boxShadow: 'var(--ap-shadow-md)',
        }}
      >
        {/* Target Reinforcer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--ap-surface, #ffffff)',
            padding: '0.75rem 1.5rem',
            borderRadius: '16px',
            border: '2px solid var(--ap-primary, #0d9488)',
            boxShadow: 'var(--ap-shadow-sm)',
            maxWidth: '100%',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 900, color: 'var(--ap-text-muted)', letterSpacing: '0.05em' }}>
            ESTOU TRABALHANDO POR:
          </span>
          <strong style={{ fontSize: '1.25rem', color: 'var(--ap-primary, #0d9488)' }}>
            🎁 {reward}
          </strong>
        </div>

        {/* Tokens Grid */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '1rem 0',
          }}
          role="region"
          aria-label="Fichas conquistadas"
        >
          {Array.from({ length: capacity }).map((_, i) => {
            const has = i < earned;
            return (
              <button
                key={i}
                type="button"
                onClick={has ? removeToken : addToken}
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  border: has ? '3px solid var(--ap-primary, #0d9488)' : '3px dashed var(--ap-border-strong, #cbd5e1)',
                  background: has ? 'var(--ap-surface, #ffffff)' : 'rgba(255,255,255,0.4)',
                  fontSize: '34px',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  transform: has ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: has ? '0 4px 12px rgba(13, 148, 136, 0.25)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                aria-label={`Ficha ${i + 1} de ${capacity}: ${has ? 'Conquistada' : 'Pendente'}`}
              >
                {has ? icons[theme].emoji : ''}
              </button>
            );
          })}
        </div>

        {/* Goal Reached Celebration Banner */}
        {earned === capacity && (
          <div
            style={{
              background: 'var(--ap-success-soft, #f0fdf4)',
              border: '2px solid var(--ap-success, #22c55e)',
              color: 'var(--ap-success, #16a34a)',
              padding: '1rem 2rem',
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '1.15rem',
              textAlign: 'center',
              animation: 'ap-pulse 1.5s infinite',
            }}
          >
            🎉 Meta atingida! Todas as {capacity} fichas foram conquistadas! Hora do reforço: {reward}!
          </div>
        )}
      </div>

      {/* Reward Editor & Quick Choices */}
      <div
        style={{
          width: '100%',
          background: 'var(--ap-surface)',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          border: '1px solid var(--ap-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, color: 'var(--ap-text-muted)', textTransform: 'uppercase' }}>
          Definir Reforçador Alvo:
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {presetRewards.map((p) => (
            <button
              key={p}
              type="button"
              className="rs-tab-pill"
              aria-pressed={reward === p}
              onClick={() => setReward(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="ap-input"
            placeholder="Ou digite um reforçador personalizado..."
            value={customReward}
            onChange={(e) => setCustomReward(e.target.value)}
          />
          <Button
            variant="default"
            onClick={() => {
              if (customReward.trim()) {
                setReward(customReward.trim());
                setCustomReward('');
              }
            }}
          >
            Definir
          </Button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="primary" size="lg" onClick={addToken} disabled={earned >= capacity}>
          + Adicionar Ficha ({earned}/{capacity})
        </Button>
        <Button variant="ghost" onClick={removeToken} disabled={earned <= 0}>
          - Remover Ficha
        </Button>
        <Button variant="ghost" onClick={() => setEarned(0)}>
          Zerar Fichas
        </Button>
        <Button variant="default" onClick={() => window.print()} icon={<IconPrinter />}>
          Imprimir Quadro de Fichas (Velcro)
        </Button>
      </div>
    </div>
  );
}
