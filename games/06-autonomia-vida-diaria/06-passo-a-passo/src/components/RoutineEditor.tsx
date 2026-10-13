import React, { useState } from 'react';
import type { Routine, TaskAnalysisStep } from '../types/routine';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Sparkles, X } from 'lucide-react';

interface RoutineEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRoutine: (routine: Routine) => void;
}

export const RoutineEditor: React.FC<RoutineEditorProps> = ({
  isOpen,
  onClose,
  onSaveRoutine,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Routine['category']>('higiene');
  const [targetAudience, setTargetAudience] = useState<Routine['targetAudience']>('infantil');
  const [description, setDescription] = useState('');

  const [steps, setSteps] = useState<Omit<TaskAnalysisStep, 'order'>[]>([
    {
      stepId: 'step-1',
      title: 'Primeiro Passo',
      shortInstruction: 'O que a criança deve fazer',
      detailDescription: 'Instrução clara para o aplicador',
      iconEmoji: '✨',
      color: '#0E8388',
    },
    {
      stepId: 'step-2',
      title: 'Segundo Passo',
      shortInstruction: 'Próxima ação da sequência',
      detailDescription: 'Detalhe do passo',
      iconEmoji: '👍',
      color: '#2A9D8F',
    },
  ]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    const newStep: Omit<TaskAnalysisStep, 'order'> = {
      stepId: `step-${Date.now()}`,
      title: `Novo Passo ${steps.length + 1}`,
      shortInstruction: 'Ação deste passo',
      detailDescription: 'Orientações clínicas',
      iconEmoji: '⭐',
      color: '#F4A261',
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 2) return;
    setSteps(steps.filter((_, idx) => idx !== index));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= steps.length) return;
    const nextSteps = [...steps];
    const temp = nextSteps[index];
    nextSteps[index] = nextSteps[targetIdx];
    nextSteps[targetIdx] = temp;
    setSteps(nextSteps);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const fullSteps: TaskAnalysisStep[] = steps.map((s, idx) => ({
      ...s,
      order: idx + 1,
    }));

    const routine: Routine = {
      id: `custom-routine-${Date.now()}`,
      name: name.trim(),
      category,
      targetAudience,
      description: description.trim() || 'Rotina personalizada de análise de tarefas.',
      chainMode: 'tarefa_total',
      steps: fullSteps,
    };

    onSaveRoutine(routine);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 37, 43, 0.55)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 220,
      }}
      id="routine-editor-modal"
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          width: '92%',
          maxWidth: '780px',
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: '28px',
          boxShadow: '0 24px 50px rgba(0,0,0,0.25)',
          border: '2px solid var(--tinta-15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--vitoria-regia)' }}>
              <Sparkles size={20} />
              <span style={{ fontFamily: 'var(--font-hud)', fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase' }}>
                Editor de Análise de Tarefas ABA
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--tinta)', margin: '4px 0 0 0' }}>
              Criar Nova Rotina de AVD (&lt; 3 minutos)
            </h2>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={24} color="var(--tinta-60)" />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="routine-name-input" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
                Nome da Rotina
              </label>
              <input
                id="routine-name-input"
                type="text"
                placeholder="Ex: Tomar Banho de Chuveiro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--tinta-15)',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label htmlFor="routine-category-select" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
                Categoria
              </label>
              <select
                id="routine-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as Routine['category'])}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--tinta-15)',
                  fontSize: '0.9rem',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="higiene">Higiene Pessoal</option>
                <option value="vestuario">Vestuário</option>
                <option value="alimentacao">Alimentação</option>
                <option value="organizacao">Organização / Escolar</option>
                <option value="autonomia">Autonomia em Casa (AFLS)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="routine-description-input" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
              Descrição da Rotina
            </label>
            <input
              id="routine-description-input"
              type="text"
              placeholder="Instruções para família ou aplicador..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--tinta-15)',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
              Público-Alvo
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setTargetAudience('infantil')}
                className={`btn-tab ${targetAudience === 'infantil' ? 'active' : ''}`}
              >
                Infantil (4–11 anos)
              </button>
              <button
                type="button"
                onClick={() => setTargetAudience('adolescente')}
                className={`btn-tab ${targetAudience === 'adolescente' ? 'active' : ''}`}
              >
                Adolescente (12–17 anos)
              </button>
            </div>
          </div>

          {/* Steps list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                Passos da Análise de Tarefas ({steps.length})
              </h4>
              <button
                type="button"
                onClick={handleAddStep}
                className="btn-tab"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '0.78rem' }}
              >
                <Plus size={14} /> Adicionar Passo
              </button>
            </div>

            {steps.map((step, idx) => (
              <div
                key={step.stepId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'var(--fundo)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--tinta-15)',
                }}
              >
                <span style={{ fontWeight: 800, width: '20px', textAlign: 'center', color: 'var(--vitoria-regia)' }}>
                  {idx + 1}
                </span>

                <input
                  type="text"
                  value={step.iconEmoji}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx].iconEmoji = e.target.value;
                    setSteps(next);
                  }}
                  style={{ width: '45px', textAlign: 'center', fontSize: '1.2rem', padding: '4px', borderRadius: '8px', border: '1px solid var(--tinta-15)' }}
                />

                <input
                  type="text"
                  placeholder="Título do passo..."
                  value={step.title}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx].title = e.target.value;
                    setSteps(next);
                  }}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--tinta-15)', fontSize: '0.88rem' }}
                />

                <input
                  type="text"
                  placeholder="Instrução curta..."
                  value={step.shortInstruction}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx].shortInstruction = e.target.value;
                    setSteps(next);
                  }}
                  style={{ flex: 1.2, padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--tinta-15)', fontSize: '0.88rem' }}
                />

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleMoveStep(idx, 'up')}
                    disabled={idx === 0}
                    style={{ padding: '4px', borderRadius: '6px', border: '1px solid var(--tinta-15)', background: '#FFFFFF', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveStep(idx, 'down')}
                    disabled={idx === steps.length - 1}
                    style={{ padding: '4px', borderRadius: '6px', border: '1px solid var(--tinta-15)', background: '#FFFFFF', cursor: idx === steps.length - 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    disabled={steps.length <= 2}
                    style={{ padding: '4px', borderRadius: '6px', border: '1px solid var(--tinta-15)', background: '#FFFFFF', cursor: steps.length <= 2 ? 'not-allowed' : 'pointer', color: '#E63946' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-tab">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
              <Save size={18} /> Salvar Rotina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
