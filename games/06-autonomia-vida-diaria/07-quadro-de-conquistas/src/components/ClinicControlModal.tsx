import React, { useState } from 'react';
import type { BoardState, TokenPhase, TokenEvent } from '../types/tokens';
import { X, ShieldAlert, Sliders, Smartphone, CheckCircle, FileText } from 'lucide-react';

interface ClinicControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: BoardState;
  events: TokenEvent[];
  onSetPhase: (phase: TokenPhase) => { success: boolean; message: string };
  onSetSlots: (slots: number) => { success: boolean; message: string };
  onToggleResponseCost: (enabled: boolean, justification?: string) => void;
  onApplyResponseCost: (amount: number, justification: string) => { success: boolean; message: string };
  onSimulateClinicAward: () => void;
}

export const ClinicControlModal: React.FC<ClinicControlModalProps> = ({
  isOpen,
  onClose,
  state,
  events,
  onSetPhase,
  onSetSlots,
  onToggleResponseCost,
  onApplyResponseCost,
  onSimulateClinicAward,
}) => {
  const [justificationInput, setJustificationInput] = useState(state.responseCostJustification || '');
  const [deductJustification, setDeductJustification] = useState('');
  const [deductAmount, setDeductAmount] = useState(1);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

  const handlePhaseChange = (phase: TokenPhase) => {
    const res = onSetPhase(phase);
    setStatusMessage({ text: res.message, error: !res.success });
  };

  const handleToggleCost = (enable: boolean) => {
    if (enable && (!justificationInput || justificationInput.trim().length < 8)) {
      setStatusMessage({
        text: 'Custo de resposta exige justificativa clínica detalhada registrada pelo supervisor.',
        error: true,
      });
      return;
    }
    onToggleResponseCost(enable, justificationInput);
    setStatusMessage({
      text: enable ? 'Custo de resposta ativado com justificativa.' : 'Custo de resposta desativado.',
    });
  };

  const handleDeduct = () => {
    const res = onApplyResponseCost(deductAmount, deductJustification);
    setStatusMessage({ text: res.message, error: !res.success });
    if (res.success) {
      setDeductJustification('');
    }
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
      id="clinic-control-modal"
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          width: '92%',
          maxWidth: '720px',
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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--vitoria-regia)' }}>
              <Sliders size={22} />
              <span style={{ fontFamily: 'var(--font-hud)', fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase' }}>
                Painel do Supervisor Clínico ABA
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--tinta)', margin: '4px 0 0 0' }}>
              Parâmetros da Economia de Fichas
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

        {/* Status notification if any */}
        {statusMessage && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: statusMessage.error ? 'rgba(230, 57, 70, 0.12)' : 'rgba(45, 106, 79, 0.12)',
              color: statusMessage.error ? '#E63946' : 'var(--vitoria-regia)',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Phase selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            Fase de Progressão (Seção 4.2)
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(['pareamento', 'inicial', 'intermediaria', 'avancada', 'adolescente'] as TokenPhase[]).map((ph) => (
              <button
                key={ph}
                onClick={() => handlePhaseChange(ph)}
                className={`btn-tab ${state.phase === ph ? 'active' : ''}`}
                style={{ textTransform: 'capitalize' }}
              >
                {ph} {ph === 'pareamento' ? `(${state.pairingSuccessCount}/5 trocas)` : ''}
              </button>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--tinta-60)' }}>
            {state.phase === 'pareamento' && 'Fase de Pareamento: estritamente 1 ficha com troca imediata para condicionar o valor das fichas antes de exigir tolerância à espera.'}
            {state.phase === 'inicial' && 'Fase Inicial: 2 a 3 fichas com reforço rápido.'}
            {state.phase === 'intermediaria' && 'Fase Intermediária: 5 fichas estruturadas.'}
            {state.phase === 'avancada' && 'Fase Avançada: 8 a 10 fichas com reforço estendido.'}
            {state.phase === 'adolescente' && 'Versão Adolescente: Painel de Metas com autorregistro e banco de pontos.'}
          </p>
        </div>

        {/* Manual Slots Adjustment */}
        {state.phase !== 'pareamento' && (
          <div>
            <label htmlFor="clinic-slots-range" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
              Número de Fichas no Quadro (N)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                id="clinic-slots-range"
                type="range"
                min={1}
                max={15}
                value={state.targetSlots}
                onChange={(e) => onSetSlots(parseInt(e.target.value, 10))}
                style={{ flex: 1, accentColor: 'var(--vitoria-regia)' }}
              />
              <span style={{ fontWeight: 800, fontSize: '1.1rem', width: '32px' }}>{state.targetSlots}</span>
            </div>
          </div>
        )}

        {/* Simulated Realtime Clinic Award */}
        <div
          style={{
            backgroundColor: 'var(--fundo)',
            padding: '16px',
            borderRadius: '16px',
            border: '1.5px solid var(--tinta-15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Smartphone size={24} color="var(--igarape)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--tinta)' }}>
                Sincronização em Tempo Real com Celular (&lt;300ms)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--tinta-60)' }}>
                Simula o aplicador entregando ficha fora da tela enquanto a criança está na mesa.
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onSimulateClinicAward();
              setStatusMessage({ text: 'Ficha enviada via celular em 120ms com idempotencyKey garantida.' });
            }}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Enviar Ficha
          </button>
        </div>

        {/* Response Cost (Safety Critical Guard) */}
        <div
          style={{
            backgroundColor: state.responseCostEnabled ? 'rgba(230, 57, 70, 0.05)' : 'var(--fundo)',
            padding: '18px',
            borderRadius: '16px',
            border: state.responseCostEnabled ? '2px solid rgba(230, 57, 70, 0.4)' : '1.5px solid var(--tinta-15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E63946' }}>
              <ShieldAlert size={20} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Custo de Resposta (Retirada de Fichas)
              </span>
            </div>

            <button
              onClick={() => handleToggleCost(!state.responseCostEnabled)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: state.responseCostEnabled ? '#E63946' : 'var(--tinta-15)',
                color: state.responseCostEnabled ? '#FFFFFF' : 'var(--tinta)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {state.responseCostEnabled ? 'Ativado' : 'Desativado (Padrão)'}
            </button>
          </div>

          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--tinta-60)', lineHeight: '1.4' }}>
            <strong>Critério de Aceite Seção 12:</strong> Custo de resposta desligado por padrão; ligar exige justificativa
            escrita do supervisor. Retirar fichas como punição enfraquece o valor do reforço condicionado se mal utilizado.
          </p>

          <div>
            <label htmlFor="supervisor-justification-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
              Justificativa Clínica Registrada do Supervisor (Obrigatória)
            </label>
            <input
              id="supervisor-justification-input"
              type="text"
              placeholder="Ex: Aprovado pelo BCBA para conduta de agressão em protocolo individualizado..."
              value={justificationInput}
              onChange={(e) => setJustificationInput(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--tinta-15)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          {state.responseCostEnabled && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
              <input
                type="number"
                min={1}
                max={5}
                aria-label="Quantidade de fichas a deduzir"
                value={deductAmount}
                onChange={(e) => setDeductAmount(parseInt(e.target.value, 10) || 1)}
                style={{ width: '60px', padding: '6px', borderRadius: '8px', border: '1.5px solid var(--tinta-15)', textAlign: 'center' }}
              />
              <input
                type="text"
                placeholder="Motivo imediato da dedução..."
                aria-label="Motivo imediato da dedução"
                value={deductJustification}
                onChange={(e) => setDeductJustification(e.target.value)}
                style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1.5px solid var(--tinta-15)', fontSize: '0.85rem' }}
              />
              <button
                onClick={handleDeduct}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#E63946',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Deduzir Ficha
              </button>
            </div>
          )}
        </div>

        {/* Section 10: Ponte para o Físico */}
        <div
          style={{
            backgroundColor: 'rgba(45, 106, 79, 0.08)',
            borderLeft: '4px solid var(--vitoria-regia)',
            padding: '12px 16px',
            borderRadius: '0 12px 12px 0',
            fontSize: '0.82rem',
            color: 'var(--tinta)',
            lineHeight: '1.5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--vitoria-regia)' }}>
            <FileText size={16} /> Seção 10 · Ponte para o Físico (Quadro de Velcro Concreto)
          </div>
          O quadro digital espelha o quadro físico de velcro: mesma ficha, mesmo número de espaços.
          Recomenda-se manter o quadro físico na mesa quando o tablet estiver em uso como reforçador, para que o sistema de
          economia de fichas não dependa exclusivamente da tela.
        </div>

        {/* Event Audit Log */}
        <div>
          <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 8px 0' }}>
            Auditoria de Eventos da Sessão ({events.length})
          </h4>
          <div style={{ maxHeight: '130px', overflowY: 'auto', border: '1px solid var(--tinta-15)', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
              <thead style={{ background: 'var(--fundo)' }}>
                <tr>
                  <th style={{ padding: '6px 8px' }}>Hora</th>
                  <th style={{ padding: '6px 8px' }}>Origem</th>
                  <th style={{ padding: '6px 8px' }}>Comportamento</th>
                  <th style={{ padding: '6px 8px' }}>Qtd</th>
                  <th style={{ padding: '6px 8px' }}>IdempotencyKey</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(-6).reverse().map((ev) => (
                  <tr key={ev.eventId} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '4px 8px' }}>{new Date(ev.timestamp).toLocaleTimeString()}</td>
                    <td style={{ padding: '4px 8px' }}>{ev.source}</td>
                    <td style={{ padding: '4px 8px' }}>{ev.behaviorDescription}</td>
                    <td style={{ padding: '4px 8px', fontWeight: 700, color: ev.count > 0 ? 'var(--vitoria-regia)' : '#E63946' }}>
                      {ev.count > 0 ? `+${ev.count}` : ev.count}
                    </td>
                    <td style={{ padding: '4px 8px', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                      {ev.idempotencyKey.slice(0, 14)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '8px 20px' }}>
            <CheckCircle size={16} /> Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
