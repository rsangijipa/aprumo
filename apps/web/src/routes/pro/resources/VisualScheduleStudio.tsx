import { useState } from 'react';
import { Button, IconCheck, IconPrinter } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  emoji: string;
  done: boolean;
}

export function VisualScheduleStudio() {
  const [items, setItems] = useState<ScheduleItem[]>([
    { id: '1', time: '09:00', title: 'Chegada & Acolhimento', emoji: '👋', done: true },
    { id: '2', time: '09:15', title: 'Atividade de Mesa (Ensino DTT)', emoji: '🧩', done: true },
    { id: '3', time: '09:40', title: 'Pausa Sensorial & Lanche', emoji: '🍎', done: false },
    { id: '4', time: '10:00', title: 'Brincar no Chão (ESDM)', emoji: '🚗', done: false },
    { id: '5', time: '10:20', title: 'Organização dos Materiais', emoji: '📦', done: false },
    { id: '6', time: '10:30', title: 'Feedback com a Família & Saída', emoji: '👨‍👩‍👧', done: false },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:45');
  const [newEmoji, setNewEmoji] = useState('⭐');

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((x) => {
        if (x.id === id) {
          const nextDone = !x.done;
          if (nextDone) {
            playTones([
              { freq: 523.25, dur: 0.1, type: 'sine' },
              { freq: 659.25, dur: 0.15, delay: 0.08, type: 'sine' },
            ], 'normal');
            void speak(`Etapa ${x.title} concluída!`, 'normal');
          }
          return { ...x, done: nextDone };
        }
        return x;
      })
    );
  };

  const speakItem = (item: ScheduleItem) => {
    void speak(`${item.time}: ${item.title}`, 'normal');
  };

  const addItem = () => {
    if (!newTitle.trim()) return;
    const newItem: ScheduleItem = {
      id: String(Date.now()),
      time: newTime,
      title: newTitle.trim(),
      emoji: newEmoji,
      done: false,
    };
    setItems((prev) => [...prev, newItem]);
    setNewTitle('');
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const doneCount = items.filter((x) => x.done).length;
  const pct = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Progress Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'var(--ap-surface)',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          border: '1px solid var(--ap-border)',
        }}
      >
        <div>
          <span style={{ fontSize: 'var(--ap-text-sm)', fontWeight: 700, color: 'var(--ap-text-muted)' }}>
            PROGRESSO DA ROTINA:
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ap-primary)' }}>
            {doneCount} de {items.length} etapas ({pct}%)
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            flex: 1,
            minWidth: '200px',
            maxWidth: '360px',
            height: '14px',
            borderRadius: '7px',
            background: 'var(--ap-surface-sunken)',
            overflow: 'hidden',
            border: '1px solid var(--ap-border)',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: pct === 100 ? 'var(--ap-success, #22c55e)' : 'var(--ap-primary, #0d9488)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" onClick={() => setItems((prev) => prev.map((x) => ({ ...x, done: false })))}>
            Reiniciar
          </Button>
          <Button variant="default" size="sm" onClick={() => window.print()} icon={<IconPrinter />}>
            Imprimir Rotina
          </Button>
        </div>
      </div>

      {/* Schedule Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((item, idx) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              borderRadius: '16px',
              border: `2px solid ${item.done ? 'var(--ap-success, #22c55e)' : 'var(--ap-border, #e2e8f0)'}`,
              background: item.done ? 'var(--ap-success-soft, #f0fdf4)' : 'var(--ap-surface, #ffffff)',
              transition: 'all 0.2s ease',
              gap: '1rem',
            }}
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flex: 1,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                font: 'inherit',
                padding: 0,
              }}
              aria-label={`${item.title} - ${item.done ? 'Concluída' : 'Pendente'}`}
            >
              <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, color: 'var(--ap-primary)' }}>
                  {item.time} · ETAPA {idx + 1}
                </span>
                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textDecoration: item.done ? 'line-through' : 'none',
                    color: item.done ? 'var(--ap-text-muted)' : 'var(--ap-text)',
                  }}
                >
                  {item.title}
                </span>
              </div>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Ouvir descrição da etapa ${item.title}`}
                onClick={() => speakItem(item)}
              >
                🔊
              </Button>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: `2px solid ${item.done ? 'var(--ap-success, #22c55e)' : 'var(--ap-border-strong)'}`,
                  background: item.done ? 'var(--ap-success, #22c55e)' : 'transparent',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
                aria-label={item.done ? 'Desmarcar' : 'Marcar como concluída'}
              >
                {item.done && <IconCheck />}
              </button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Remover etapa"
                onClick={() => removeItem(item.id)}
                style={{ color: 'var(--ap-danger, #ef4444)' }}
              >
                ✕
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Routine Step */}
      <div
        style={{
          background: 'var(--ap-surface-sunken)',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          border: '1px dashed var(--ap-border-strong)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ap-text-muted)' }}>
          + Adicionar Nova Atividade na Agenda
        </span>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="time"
            className="ap-input"
            style={{ width: '120px' }}
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            aria-label="Horário"
          />
          <input
            type="text"
            className="ap-input"
            style={{ flex: 1, minWidth: '180px' }}
            placeholder="Nome da atividade (ex: Escovar dentes)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            aria-label="Título da atividade"
          />
          <input
            type="text"
            className="ap-input"
            style={{ width: '60px', textAlign: 'center', fontSize: '1.25rem' }}
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            title="Emoji"
            aria-label="Emoji"
          />
          <Button variant="primary" onClick={addItem}>
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}
