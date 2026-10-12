import React, { useState } from 'react';
import type { PhysicalBridgeAssessment, AbaTrial } from '../types/puzzle';
import { Printer, X, CheckCircle, FileText } from 'lucide-react';

interface PhysicalBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trials: AbaTrial[];
  currentK: number;
  totalPieces: number;
}

export const PhysicalBridgeModal: React.FC<PhysicalBridgeModalProps> = ({
  isOpen,
  onClose,
  trials,
  currentK,
  totalPieces,
}) => {
  const [assessment, setAssessment] = useState<PhysicalBridgeAssessment>({
    childName: '',
    assessorName: '',
    date: new Date().toISOString().split('T')[0],
    pincerGraspObserved: 'independente',
    pegUseObserved: 'apenas_pino',
    spatialOrientationObserved: 'espontanea',
    frustrationTolerance: 'alta',
    notes: '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const totalSnapAttempts = trials.length;
  const successfulSnaps = trials.filter((t) => t.success).length;
  const accuracyRate = totalSnapAttempts > 0 ? Math.round((successfulSnaps / totalSnapAttempts) * 100) : 100;
  const avgAngleError = trials.length > 0
    ? (trials.reduce((acc, t) => acc + t.angleErrorDeg, 0) / trials.length).toFixed(1)
    : '0';

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 37, 43, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 150,
      }}
      id="physical-bridge-modal"
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          width: '92%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
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
              <FileText size={22} />
              <span style={{ fontFamily: 'var(--font-hud)', fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Seção 10 · Protocolo ABA
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--tinta)', margin: '4px 0 0 0' }}>
              Ponte para o Físico (Quebra-Cabeça Concreto)
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--tinta-60)',
              padding: '4px',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Clinical Rationale Box */}
        <div
          style={{
            backgroundColor: 'rgba(14, 131, 136, 0.08)',
            borderLeft: '4px solid var(--igarape)',
            padding: '12px 16px',
            borderRadius: '0 12px 12px 0',
            fontSize: '0.85rem',
            color: 'var(--tinta)',
            lineHeight: '1.5',
          }}
        >
          <strong>Racional Clínico (Cooper et al., 2020; ABLLS-R Área B / Z):</strong> O jogo digital automatiza o
          encadeamento reverso e calibra tolerâncias perceptivas. Para generalização e coordenação de preensão em pinça
          (motricidade fina), a sondagem deve ser realizada com o tabuleiro de madeira correspondente ({totalPieces} peças).
        </div>

        {/* Digital Session Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            background: 'var(--fundo)',
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid var(--tinta-15)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
              Passo Atual da Cadeia (k)
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--vitoria-regia)' }}>
              {currentK} / {totalPieces}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
              Taxa de Acerto no Snap
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--igarape)' }}>
              {accuracyRate}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
              Erro Angular Médio
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--buriti)' }}>
              {avgAngleError}°
            </div>
          </div>
        </div>

        {/* Observational Form for Concrete Probe */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--tinta)', margin: 0 }}>
            Registro da Sondagem Concreta
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
                Nome do Aprendiz
              </label>
              <input
                type="text"
                placeholder="Ex: Lucas M."
                value={assessment.childName}
                onChange={(e) => setAssessment({ ...assessment, childName: e.target.value })}
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
                Terapeuta / Aplicador
              </label>
              <input
                type="text"
                placeholder="Ex: Dra. Juliana (BCBA)"
                value={assessment.assessorName}
                onChange={(e) => setAssessment({ ...assessment, assessorName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--tinta-15)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
                Preensão em Pinça (Motor Fino)
              </label>
              <select
                value={assessment.pincerGraspObserved}
                onChange={(e) => setAssessment({ ...assessment, pincerGraspObserved: e.target.value as PhysicalBridgeAssessment['pincerGraspObserved'] })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--tinta-15)',
                  fontSize: '0.9rem',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="independente">Independente (Polegar e indicador no pino)</option>
                <option value="com_ajuda">Com Ajuda / Dica física leve</option>
                <option value="nao_observado">Preensão palmar / Não usa pinça</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
                Uso do Pino de Madeira
              </label>
              <select
                value={assessment.pegUseObserved}
                onChange={(e) => setAssessment({ ...assessment, pegUseObserved: e.target.value as PhysicalBridgeAssessment['pegUseObserved'] })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--tinta-15)',
                  fontSize: '0.9rem',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="apenas_pino">Pega exclusivamente pelo pino</option>
                <option value="borda_e_pino">Alterna borda e pino</option>
                <option value="apenas_borda">Pega apenas pelas bordas</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
                Orientação Espacial
              </label>
              <select
                value={assessment.spatialOrientationObserved}
                onChange={(e) => setAssessment({ ...assessment, spatialOrientationObserved: e.target.value as PhysicalBridgeAssessment['spatialOrientationObserved'] })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--tinta-15)',
                  fontSize: '0.9rem',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="espontanea">Espontânea (Gira no ar antes de descer)</option>
                <option value="tentativa_erro">Por tentativa e erro na cavidade</option>
                <option value="precisa_dica">Precisa de dica gestual de giro</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
                Tolerância à Frustração
              </label>
              <select
                value={assessment.frustrationTolerance}
                onChange={(e) => setAssessment({ ...assessment, frustrationTolerance: e.target.value as PhysicalBridgeAssessment['frustrationTolerance'] })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--tinta-15)',
                  fontSize: '0.9rem',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="alta">Alta (Mantém-se calmo e persistente)</option>
                <option value="moderada">Moderada (Resmunga, mas insiste)</option>
                <option value="baixa">Baixa (Requer reforço contínuo ou pausa)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
              Notas Clínicas & Próximas Metas
            </label>
            <textarea
              rows={3}
              placeholder="Descreva particularidades do encaixe, respostas a reforçadores e plano para a próxima sessão..."
              value={assessment.notes}
              onChange={(e) => setAssessment({ ...assessment, notes: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--tinta-15)',
                fontSize: '0.9rem',
                resize: 'none',
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <button
            onClick={handlePrint}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: '1.5px solid var(--tinta-15)',
              background: '#FFFFFF',
              color: 'var(--tinta)',
              fontFamily: 'var(--font-hud)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Printer size={18} />
            Imprimir Relatório
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--tinta-15)',
                color: 'var(--tinta)',
                fontFamily: 'var(--font-hud)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--vitoria-regia)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle size={18} /> Gravado!
                </>
              ) : (
                'Salvar Avaliação'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
