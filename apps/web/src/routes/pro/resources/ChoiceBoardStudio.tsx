import { useState } from 'react';
import { Button } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';
import { getDirectChoicePresets, type AACItem } from './aac';

export function ChoiceBoardStudio() {
  const [choiceCount, setChoiceCount] = useState<2 | 3 | 4>(2);
  const [category, setCategory] = useState<'brinquedos' | 'alimentos' | 'pausas'>('brinquedos');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = getDirectChoicePresets(category, choiceCount);

  const handleSelect = (item: AACItem) => {
    setSelectedId(item.id);
    playTones([
      { freq: 523.25, dur: 0.12, type: 'sine' },
      { freq: 659.25, dur: 0.18, delay: 0.1, type: 'sine' },
    ], 'normal');
    void speak(`Você escolheu: ${item.speechText || item.label}`, 'normal');
  };

  const handleClear = () => {
    setSelectedId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
      {/* Controles de Configuração da Prancha */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="ap-xs ap-muted" style={{ fontWeight: 700 }}>CAMPO:</span>
          {([2, 3, 4] as const).map((cnt) => (
            <button
              key={cnt}
              type="button"
              className="rs-tab-pill"
              aria-pressed={choiceCount === cnt}
              onClick={() => {
                setChoiceCount(cnt);
                setSelectedId(null);
              }}
            >
              {cnt} Opções
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="ap-xs ap-muted" style={{ fontWeight: 700 }}>CATEGORIA:</span>
          {(
            [
              ['brinquedos', '🧸 Brinquedos'],
              ['alimentos', '🍎 Alimentos'],
              ['pausas', '✋ Pausas'],
            ] as const
          ).map(([cat, label]) => (
            <button
              key={cat}
              type="button"
              className="rs-tab-pill"
              aria-pressed={category === cat}
              onClick={() => {
                setCategory(cat);
                setSelectedId(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="ap-small ap-muted" style={{ margin: 0, textAlign: 'center' }}>
        Toque no estímulo desejado para manifestar sua escolha. A prancha emite retorno de voz imediato.
      </p>

      {/* Grade de Escolha Tátil */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: choiceCount === 2 ? 'repeat(2, 1fr)' : choiceCount === 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
          gap: '1.25rem',
          width: '100%',
          maxWidth: choiceCount === 3 ? '600px' : '520px',
        }}
      >
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              aria-pressed={isSelected}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.85rem',
                aspectRatio: choiceCount === 4 ? '1.1' : '1',
                borderRadius: '24px',
                border: isSelected ? '4px solid var(--ap-primary)' : '2px solid var(--ap-border-strong)',
                background: isSelected ? 'var(--ap-primary-soft, rgba(63, 107, 103, 0.12))' : 'var(--ap-surface)',
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                boxShadow: isSelected ? '0 8px 24px rgba(63, 107, 103, 0.2)' : '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                padding: '1rem',
              }}
            >
              <span style={{ fontSize: choiceCount >= 3 ? '48px' : '56px' }}>{item.emoji}</span>
              <strong
                style={{
                  fontSize: 'var(--ap-text-md)',
                  color: isSelected ? 'var(--ap-primary)' : 'var(--ap-text)',
                  textAlign: 'center',
                }}
              >
                {item.label}
              </strong>
            </button>
          );
        })}
      </div>

      {/* Barra de Ações */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {selectedId && (
          <Button variant="ghost" onClick={handleClear}>
            Limpar Escolha
          </Button>
        )}
      </div>
    </div>
  );
}
