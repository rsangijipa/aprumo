import React, { useState } from 'react';
import type { TargetItem } from '../types';
import { Printer, X } from 'lucide-react';

interface PhysicalBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  masteredTargets: TargetItem[];
  studentName?: string;
}

export const PhysicalBridgeModal: React.FC<PhysicalBridgeModalProps> = ({
  isOpen,
  onClose,
  masteredTargets,
  studentName = 'Aprendiz'
}) => {
  const [checkedStatus, setCheckedStatus] = useState<Record<string, { obj: boolean; card: boolean; person: boolean }>>({});

  if (!isOpen) return null;

  // Take top 5 targets (or all available if <= 5)
  const targetsToProbe = masteredTargets.slice(0, 5);

  const toggleCheck = (id: string, field: 'obj' | 'card' | 'person') => {
    setCheckedStatus(prev => ({
      ...prev,
      [id]: {
        obj: prev[id]?.obj || false,
        card: prev[id]?.card || false,
        person: prev[id]?.person || false,
        [field]: !prev[id]?.[field]
      }
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ponte para o Físico"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 37, 43, 0.6)',
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
          maxWidth: '780px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          padding: '28px',
          fontFamily: 'var(--font-hud)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span className="badge badge-vitoria">PsicoPlay ABA-01</span>
              <span className="badge badge-igarape">Seção 10</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--tinta)', fontWeight: 700 }}>
              Ponte para o Físico — Sondagem de Generalização (MTS)
            </h2>
            <p style={{ color: 'var(--tinta-60)', fontSize: '0.9rem', marginTop: '4px' }}>
              Critério digital atingido. O protocolo ABA exige validação presencial com objetos/cartões reais e variação de aplicador antes do domínio formal.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--tinta-60)',
              padding: '6px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Student metadata */}
        <div
          style={{
            backgroundColor: 'var(--fundo)',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
            fontSize: '0.88rem'
          }}
        >
          <div><strong>Aprendiz:</strong> {studentName}</div>
          <div><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</div>
          <div><strong>Programa:</strong> Pareamento ao Modelo (VP-MTS)</div>
          <div><strong>Alvos para Sondagem:</strong> {targetsToProbe.length}</div>
        </div>

        {/* Target list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {targetsToProbe.map((item, idx) => {
            const status = checkedStatus[item.id] || { obj: false, card: false, person: false };
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  border: '1.5px solid var(--tinta-15)',
                  backgroundColor: '#FFFFFF',
                  gap: '14px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--igarape)', fontSize: '1rem' }}>#{idx + 1}</span>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 10,
                      border: '1px solid var(--tinta-15)',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img src={item.layers.foto} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--tinta)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--tinta-60)', textTransform: 'capitalize' }}>{item.category}</div>
                  </div>
                </div>

                {/* Validation checkboxes */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={status.obj}
                      onChange={() => toggleCheck(item.id, 'obj')}
                      style={{ accentColor: 'var(--igarape)', width: 16, height: 16 }}
                    />
                    Objeto Real
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={status.card}
                      onChange={() => toggleCheck(item.id, 'card')}
                      style={{ accentColor: 'var(--igarape)', width: 16, height: 16 }}
                    />
                    Cartão Físico
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={status.person}
                      onChange={() => toggleCheck(item.id, 'person')}
                      style={{ accentColor: 'var(--igarape)', width: 16, height: 16 }}
                    />
                    Generalização Aplicador
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Protocol notes */}
        <div style={{ backgroundColor: 'rgba(244, 162, 97, 0.1)', borderLeft: '4px solid var(--buriti)', padding: '12px 16px', borderRadius: '0 12px 12px 0', marginBottom: '22px', fontSize: '0.85rem' }}>
          <strong>Instrução ao Supervisor:</strong> Realize 3 tentativas por alvo físico sem ajuda na mesa. Considere dominado se obtiver 100% de acertos independentes na sondagem física com outro aplicador.
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-outline" onClick={onClose}>
            Fechar
          </button>
          <button className="btn-igarape" onClick={handlePrint}>
            <Printer size={16} />
            Imprimir Folha de Registro
          </button>
        </div>
      </div>
    </div>
  );
};
