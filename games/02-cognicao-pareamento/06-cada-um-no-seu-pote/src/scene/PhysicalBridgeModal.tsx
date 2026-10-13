import React, { useState } from 'react';
import { Printer, X } from 'lucide-react';

interface PhysicalBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: string;
}

export const PhysicalBridgeModal: React.FC<PhysicalBridgeModalProps> = ({
  isOpen,
  onClose,
  rule
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggle = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const checklist = [
    'Dispor 2 a 4 potes reais na mesa em posições alternadas',
    `Utilizar novos itens físicos da categoria/regra "${rule}" não vistos no app`,
    'Entregar o item na mão da criança ou dispor em bandeja física',
    'Emitir o SD "Coloca com os iguais" sem apontar para o pote',
    'Registrar se o acerto foi independente ou se houve dica do aplicador',
    'Verificar permanência sem interrupções por pelo menos 3 minutos (para tarefa independente)'
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ponte para o Físico"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 37, 43, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '16px'
      }}
    >
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: 'transparent',
          border: 'none',
          cursor: 'default'
        }}
      />
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '680px',
          padding: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          fontFamily: 'var(--font-hud)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'inline-flex', gap: '6px', marginBottom: '6px' }}>
              <span className="badge" style={{ backgroundColor: 'rgba(45, 106, 79, 0.15)', color: 'var(--vitoria-regia)' }}>
                ABA-02 · Seção 10
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--tinta)' }}>
              Ponte para o Físico — Classificação Real na Mesa
            </h2>
            <p style={{ color: 'var(--tinta-60)', fontSize: '0.88rem', marginTop: '4px' }}>
              Validação presencial com potes reais e generalização de estímulos antes do domínio formal.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' }}>
          {checklist.map((item, idx) => (
            <label
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid var(--tinta-15)',
                cursor: 'pointer',
                backgroundColor: checkedItems[idx] ? 'rgba(45, 106, 79, 0.08)' : '#FFF'
              }}
            >
              <input
                type="checkbox"
                checked={!!checkedItems[idx]}
                onChange={() => toggle(String(idx))}
                style={{ width: 18, height: 18, accentColor: 'var(--vitoria-regia)' }}
              />
              <span style={{ fontSize: '0.88rem', color: 'var(--tinta)' }}>{item}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn-tab" onClick={onClose}>
            Fechar
          </button>
          <button
            className="btn-primary"
            style={{ backgroundColor: 'var(--vitoria-regia)' }}
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Imprimir Roteiro de Mesa
          </button>
        </div>
      </div>
    </div>
  );
};
