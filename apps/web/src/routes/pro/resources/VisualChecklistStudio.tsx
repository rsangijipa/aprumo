import { useState } from 'react';
import { Button, IconCheck, IconPrinter } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';

export interface ChecklistTask {
  id: string;
  name: string;
  emoji: string;
  done: boolean;
}

export interface ChecklistRoutine {
  id: string;
  title: string;
  emoji: string;
  tasks: ChecklistTask[];
}

const PRESET_ROUTINES: ChecklistRoutine[] = [
  {
    id: 'manha',
    title: 'Rotina da Manhã',
    emoji: '☀️',
    tasks: [
      { id: 'm1', name: 'Acordar e esticar o corpo', emoji: '🥱', done: true },
      { id: 'm2', name: 'Tirar o pijama e vestir a roupa', emoji: '👕', done: true },
      { id: 'm3', name: 'Tomar café da manhã', emoji: '🥣', done: false },
      { id: 'm4', name: 'Escovar os dentes', emoji: '🪥', done: false },
      { id: 'm5', name: 'Calçar o tênis e pegar a mochila', emoji: '🎒', done: false },
    ],
  },
  {
    id: 'clinica',
    title: 'Rotina da Sessão Terapêutica',
    emoji: '🩺',
    tasks: [
      { id: 'c1', name: 'Cumprimentar o terapeuta', emoji: '👋', done: true },
      { id: 'c2', name: 'Verificar a agenda visual da sessão', emoji: '📋', done: false },
      { id: 'c3', name: 'Atividade de mesa 1 (DTT)', emoji: '🧩', done: false },
      { id: 'c4', name: 'Pausa sensorial regulatória', emoji: '🧘', done: false },
      { id: 'c5', name: 'Atividade no chão / Turnos (ESDM)', emoji: '🚗', done: false },
      { id: 'c6', name: 'Guardar materiais e despedida', emoji: '📦', done: false },
    ],
  },
  {
    id: 'escola',
    title: 'Rotina na Sala de Aula',
    emoji: '🏫',
    tasks: [
      { id: 'e1', name: 'Guardar a mochila no gancho', emoji: '🎒', done: false },
      { id: 'e2', name: 'Sentar na cadeira designada', emoji: '🪑', done: false },
      { id: 'e3', name: 'Abrir o estojo e pegar o lápis', emoji: '✏️', done: false },
      { id: 'e4', name: 'Fazer a atividade com ajuda quando precisar', emoji: '🙋', done: false },
      { id: 'e5', name: 'Lanche e recreio com colegas', emoji: '🍎', done: false },
    ],
  },
  {
    id: 'noite',
    title: 'Rotina da Noite e Sono',
    emoji: '🌙',
    tasks: [
      { id: 'n1', name: 'Tomar banho morno relaxante', emoji: '🛁', done: false },
      { id: 'n2', name: 'Vestir o pijama confortável', emoji: '👖', done: false },
      { id: 'n3', name: 'Jantar em família sem telas', emoji: '🍽️', done: false },
      { id: 'n4', name: 'Escovar os dentes e ir ao banheiro', emoji: '🪥', done: false },
      { id: 'n5', name: 'História com luz suave e dormir', emoji: '📖', done: false },
    ],
  },
];

export function VisualChecklistStudio() {
  const [activeRoutineId, setActiveRoutineId] = useState<string>('manha');
  const activeRoutine = PRESET_ROUTINES.find((r) => r.id === activeRoutineId) ?? PRESET_ROUTINES[0]!;
  const [tasks, setTasks] = useState<ChecklistTask[]>(activeRoutine.tasks);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskEmoji, setNewTaskEmoji] = useState('⭐');

  const handleSelectRoutine = (id: string) => {
    setActiveRoutineId(id);
    const r = PRESET_ROUTINES.find((x) => x.id === id);
    if (r) setTasks(r.tasks);
  };

  const toggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.done;
          if (next) {
            playTones([
              { freq: 587.33, dur: 0.1, type: 'sine' },
              { freq: 739.99, dur: 0.15, delay: 0.08, type: 'sine' },
            ], 'normal');
            void speak(`${t.name} concluído!`, 'normal');
          }
          return { ...t, done: next };
        }
        return t;
      })
    );
  };

  const addTask = () => {
    if (!newTaskName.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newTaskName.trim(),
        emoji: newTaskEmoji,
        done: false,
      },
    ]);
    setNewTaskName('');
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const doneCount = tasks.filter((t) => t.done).length;
  const pct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Routine Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }} role="tablist">
        {PRESET_ROUTINES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            className="rs-tab-pill"
            aria-selected={activeRoutineId === r.id}
            onClick={() => handleSelectRoutine(r.id)}
          >
            {r.emoji} {r.title}
          </button>
        ))}
      </div>

      {/* Checklist Header & Progress */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'var(--ap-surface)',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          border: '1px solid var(--ap-border)',
        }}
      >
        <div>
          <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, color: 'var(--ap-text-muted)' }}>
            STATUS DO CHECKLIST:
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ap-primary)' }}>
            {doneCount} de {tasks.length} concluídos ({pct}%)
          </div>
        </div>

        {/* Bar */}
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
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" onClick={() => setTasks((prev) => prev.map((t) => ({ ...t, done: false })))}>
            Desmarcar Todos
          </Button>
          <Button variant="default" size="sm" onClick={() => window.print()} icon={<IconPrinter />}>
            Imprimir Checklist
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {tasks.map((t, idx) => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.2rem',
              borderRadius: '14px',
              border: `2px solid ${t.done ? 'var(--ap-success, #22c55e)' : 'var(--ap-border)'}`,
              background: t.done ? 'var(--ap-success-soft, #f0fdf4)' : 'var(--ap-surface, #ffffff)',
              transition: 'all 0.2s ease',
            }}
          >
            <button
              type="button"
              onClick={() => toggle(t.id)}
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
              aria-label={`${t.name} - ${t.done ? 'Concluído' : 'Pendente'}`}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: `2px solid ${t.done ? 'var(--ap-success, #22c55e)' : 'var(--ap-border-strong)'}`,
                  background: t.done ? 'var(--ap-success, #22c55e)' : '#ffffff',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '14px',
                }}
              >
                {t.done && <IconCheck />}
              </div>

              <span style={{ fontSize: '1.75rem' }}>{t.emoji}</span>

              <span
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  textDecoration: t.done ? 'line-through' : 'none',
                  color: t.done ? 'var(--ap-text-muted)' : 'var(--ap-text)',
                }}
              >
                {idx + 1}. {t.name}
              </span>
            </button>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Ouvir ${t.name}`}
                onClick={() => void speak(t.name, 'normal')}
              >
                🔊
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Remover item"
                onClick={() => removeTask(t.id)}
                style={{ color: 'var(--ap-danger, #ef4444)' }}
              >
                ✕
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Task */}
      <div
        style={{
          background: 'var(--ap-surface-sunken)',
          padding: '1rem',
          borderRadius: '14px',
          border: '1px dashed var(--ap-border-strong)',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          className="ap-input"
          style={{ flex: 1, minWidth: '200px' }}
          placeholder="Adicionar novo passo ao checklist..."
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
        />
        <input
          type="text"
          className="ap-input"
          style={{ width: '60px', textAlign: 'center', fontSize: '1.25rem' }}
          value={newTaskEmoji}
          onChange={(e) => setNewTaskEmoji(e.target.value)}
          title="Emoji"
        />
        <Button variant="primary" onClick={addTask}>
          + Adicionar Passo
        </Button>
      </div>
    </div>
  );
}
