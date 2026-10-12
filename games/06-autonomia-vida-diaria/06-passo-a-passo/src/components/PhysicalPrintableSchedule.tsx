import React from 'react';
import type { Routine } from '../types/routine';
import { Printer, X, FileText } from 'lucide-react';

interface PhysicalPrintableScheduleProps {
  routine: Routine;
  isOpen: boolean;
  onClose: () => void;
}

export const PhysicalPrintableSchedule: React.FC<PhysicalPrintableScheduleProps> = ({
  routine,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
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
        zIndex: 200,
      }}
      id="printable-schedule-modal"
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          width: '92%',
          maxWidth: '780px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          boxShadow: '0 24px 50px rgba(0,0,0,0.25)',
          border: '2px solid var(--tinta-15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--vitoria-regia)' }}>
              <FileText size={20} />
              <span style={{ fontFamily: 'var(--font-hud)', fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase' }}>
                Seção 10 · Roteiro Visual Plastificado Impresso
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--tinta)', margin: '4px 0 0 0' }}>
              Roteiro de Parede: {routine.name}
            </h2>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={24} color="var(--tinta-60)" />
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--tinta-60)' }}>
          Imprima e plastifique este roteiro para afixar no espelho do banheiro ou no quarto. A criança pode marcar cada
          passo com caneta de quadro branco após a execução física.
        </p>

        {/* Printable Grid */}
        <div
          id="printable-area"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            backgroundColor: 'var(--fundo)',
            padding: '20px',
            borderRadius: '16px',
            border: '2px solid var(--tinta-15)',
          }}
        >
          {routine.steps.map((step) => (
            <div
              key={step.stepId}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px',
                border: '2px solid var(--vitoria-regia)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
                minHeight: '170px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    backgroundColor: 'var(--vitoria-regia)',
                    color: '#FFFFFF',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-hud)',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                  }}
                >
                  {step.order}
                </div>

                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    border: '2px solid var(--tinta-30)',
                    borderRadius: '6px',
                  }}
                />
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px' }}>{step.iconEmoji}</div>
                <h4 style={{ margin: '6px 0 2px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--tinta)' }}>
                  {step.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--tinta-60)', lineHeight: '1.2' }}>
                  {step.shortInstruction}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handlePrint}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.92rem' }}
          >
            <Printer size={18} />
            Imprimir Roteiro Visual
          </button>

          <button onClick={onClose} className="btn-tab" style={{ padding: '10px 18px' }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
