import { useState } from 'react';
import { Button, IconCheck, IconPrinter } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';

export interface FirstThenItem {
  text: string;
  emoji: string;
}

export function FirstThenStudio() {
  const [first, setFirst] = useState<FirstThenItem>({ text: 'Lavar as mãos', emoji: '🧼' });
  const [then, setThen] = useState<FirstThenItem>({ text: 'Jogar no tablet', emoji: '📱' });
  const [done, setDone] = useState(false);

  const presetsFirst: FirstThenItem[] = [
    { text: 'Lavar as mãos', emoji: '🧼' },
    { text: 'Fazer atividade de mesa', emoji: '✏️' },
    { text: 'Guardar os brinquedos', emoji: '🧸' },
    { text: 'Escovar os dentes', emoji: '🪥' },
    { text: 'Comer a fruta do lanche', emoji: '🍎' },
    { text: 'Calçar o tênis', emoji: '👟' },
    { text: 'Sentar na roda da turma', emoji: '⭕' },
  ];

  const presetsThen: FirstThenItem[] = [
    { text: 'Jogar no tablet', emoji: '📱' },
    { text: 'Brincar de massinha', emoji: '🎨' },
    { text: 'Ir ao parquinho', emoji: '🛝' },
    { text: 'Ouvir música animada', emoji: '🎵' },
    { text: 'Pular na cama elástica', emoji: '🤸' },
    { text: 'Soprar bolhas de sabão', emoji: '🫧' },
    { text: 'Carrinho de corrida', emoji: '🏎️' },
  ];

  const completeFirst = () => {
    setDone(true);
    playTones([
      { freq: 440, dur: 0.12, type: 'sine' },
      { freq: 554.37, dur: 0.12, delay: 0.12, type: 'sine' },
      { freq: 659.25, dur: 0.25, delay: 0.24, type: 'sine' },
    ], 'normal');
    void speak(`Muito bem! Você completou ${first.text}! Agora é hora de ${then.text}!`, 'normal');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Visual Contingency Board */}
      <div
        className="rs-first-then-container"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '1rem',
          alignItems: 'stretch',
          background: 'var(--ap-surface-sunken, #f8fafc)',
          padding: '1.5rem',
          borderRadius: '24px',
          border: '2px solid var(--ap-border-strong, #cbd5e1)',
        }}
      >
        {/* FIRST Card */}
        <div
          style={{
            background: done ? 'var(--ap-success-soft, #f0fdf4)' : 'var(--ap-surface, #ffffff)',
            border: `3px solid ${done ? 'var(--ap-success, #22c55e)' : 'var(--ap-primary, #0d9488)'}`,
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            textAlign: 'center',
            boxShadow: 'var(--ap-shadow-sm)',
            transition: 'all 0.3s ease',
          }}
        >
          <span
            style={{
              fontSize: 'var(--ap-text-xs)',
              fontWeight: 900,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: done ? 'var(--ap-success, #22c55e)' : 'var(--ap-primary, #0d9488)',
            }}
          >
            1º PRIMEIRO (Tarefa)
          </span>

          <div style={{ fontSize: '4.5rem', lineHeight: 1 }}>{first.emoji}</div>

          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ap-text)' }}>
            {first.text}
          </div>

          {done ? (
            <div
              style={{
                color: 'var(--ap-success, #16a34a)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 800,
                fontSize: '1.1rem',
              }}
            >
              <IconCheck /> Concluído!
            </div>
          ) : (
            <Button variant="primary" size="lg" onClick={completeFirst} style={{ width: '100%' }}>
              Concluir Tarefa
            </Button>
          )}
        </div>

        {/* Transition Arrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: done ? 'var(--ap-success, #22c55e)' : 'var(--ap-text-muted, #94a3b8)',
            transform: 'scale(1.2)',
            transition: 'color 0.3s ease',
          }}
          aria-hidden="true"
        >
          ➔
        </div>

        {/* THEN Card */}
        <div
          style={{
            background: done ? 'var(--ap-terra-100, #fef3c7)' : 'var(--ap-surface, #ffffff)',
            border: `3px solid ${done ? 'var(--ap-terra-500, #f59e0b)' : 'var(--ap-border-strong, #cbd5e1)'}`,
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            textAlign: 'center',
            boxShadow: 'var(--ap-shadow-sm)',
            transition: 'all 0.3s ease',
          }}
        >
          <span
            style={{
              fontSize: 'var(--ap-text-xs)',
              fontWeight: 900,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: done ? 'var(--ap-terra-700, #b45309)' : 'var(--ap-text-muted, #64748b)',
            }}
          >
            2º DEPOIS (Reforçador)
          </span>

          <div style={{ fontSize: '4.5rem', lineHeight: 1 }}>{then.emoji}</div>

          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ap-text)' }}>
            {then.text}
          </div>

          <div
            style={{
              fontSize: 'var(--ap-text-sm)',
              fontWeight: 700,
              color: done ? 'var(--ap-terra-700, #b45309)' : 'var(--ap-text-muted)',
            }}
          >
            {done ? '🎉 Liberado para aproveitar!' : 'Liberado após o Primeiro'}
          </div>
        </div>
      </div>

      {/* Preset Customization Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div style={{ background: 'var(--ap-surface)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--ap-border)' }}>
          <label className="ap-field">
            <span className="ap-label">Selecionar ou Digitar "Primeiro":</span>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                className="ap-input"
                value={first.text}
                onChange={(e) => {
                  setFirst((p) => ({ ...p, text: e.target.value }));
                  setDone(false);
                }}
                placeholder="Ex: Lavar as mãos"
              />
              <input
                type="text"
                className="ap-input"
                style={{ width: '60px', textAlign: 'center', fontSize: '1.25rem' }}
                value={first.emoji}
                onChange={(e) => setFirst((p) => ({ ...p, emoji: e.target.value }))}
                title="Emoji"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {presetsFirst.map((p) => (
                <button
                  key={p.text}
                  type="button"
                  className="rs-tab-pill"
                  aria-pressed={first.text === p.text}
                  onClick={() => {
                    setFirst(p);
                    setDone(false);
                  }}
                >
                  {p.emoji} {p.text}
                </button>
              ))}
            </div>
          </label>
        </div>

        <div style={{ background: 'var(--ap-surface)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--ap-border)' }}>
          <label className="ap-field">
            <span className="ap-label">Selecionar ou Digitar "Depois" (Reforçador):</span>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                className="ap-input"
                value={then.text}
                onChange={(e) => setThen((p) => ({ ...p, text: e.target.value }))}
                placeholder="Ex: Jogar no tablet"
              />
              <input
                type="text"
                className="ap-input"
                style={{ width: '60px', textAlign: 'center', fontSize: '1.25rem' }}
                value={then.emoji}
                onChange={(e) => setThen((p) => ({ ...p, emoji: e.target.value }))}
                title="Emoji"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {presetsThen.map((p) => (
                <button
                  key={p.text}
                  type="button"
                  className="rs-tab-pill"
                  aria-pressed={then.text === p.text}
                  onClick={() => setThen(p)}
                >
                  {p.emoji} {p.text}
                </button>
              ))}
            </div>
          </label>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="ghost" onClick={() => setDone(false)}>
          Reiniciar Quadro
        </Button>
        <Button variant="default" onClick={handlePrint} icon={<IconPrinter />}>
          Imprimir Quadro Primeiro → Depois
        </Button>
      </div>
    </div>
  );
}
