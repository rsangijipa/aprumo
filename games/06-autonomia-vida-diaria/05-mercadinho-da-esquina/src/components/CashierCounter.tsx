import React from 'react';
import type { CurrencyItem, PaymentStrategy } from '../types/money';
import { formatBRL } from '../utils/money';
import { CurrencyDisplay } from './CurrencyDisplay';
import { ArrowRight, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

interface CashierCounterProps {
  totalPriceCents: number;
  paidItems: CurrencyItem[];
  strategy: PaymentStrategy;
  onRemovePaidItem: (index: number) => void;
  onClearTray: () => void;
  onConfirmPayment: () => void;
  cashierSpeech: string;
}

export const CashierCounter: React.FC<CashierCounterProps> = ({
  totalPriceCents,
  paidItems,
  strategy,
  onRemovePaidItem,
  onClearTray,
  onConfirmPayment,
  cashierSpeech,
}) => {
  const totalPaidCents = paidItems.reduce((acc, c) => acc + c.cents, 0);
  const changeExpectedCents = Math.max(0, totalPaidCents - totalPriceCents);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 10px 30px rgba(30, 37, 43, 0.08)',
        border: '2px solid var(--tinta-15)',
        width: '100%',
        maxWidth: '480px',
      }}
      id="cashier-counter"
    >
      {/* Cashier Character & Speech Bubble */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(14, 131, 136, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '34px',
            border: '2px solid var(--igarape)',
          }}
        >
          🧑‍💼
        </div>

        {/* Speech Bubble */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--fundo)',
            borderRadius: '16px',
            padding: '10px 14px',
            border: '1.5px solid var(--tinta-15)',
            position: 'relative',
            fontSize: '0.88rem',
            color: 'var(--tinta)',
            fontFamily: 'var(--font-teen)',
            lineHeight: '1.3',
          }}
        >
          {cashierSpeech}
        </div>
      </div>

      {/* Cash Register Display Screen */}
      <div
        style={{
          backgroundColor: '#1E252B',
          borderRadius: '16px',
          padding: '16px 20px',
          color: '#52B788',
          fontFamily: 'monospace',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>
            Total a Pagar
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {formatBRL(totalPriceCents)}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>
            Valor no Balcão
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: totalPaidCents >= totalPriceCents ? '#52B788' : '#F4A261' }}>
            {formatBRL(totalPaidCents)}
          </div>
        </div>
      </div>

      {/* Checkout Counter Tray (Onde o adolescente coloca o dinheiro) */}
      <div
        style={{
          backgroundColor: '#F5EBE0',
          borderRadius: '18px',
          padding: '16px',
          border: '2px dashed #C4A47C',
          minHeight: '130px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8C5B32', textTransform: 'uppercase' }}>
            Dinheiro Entregue no Balcão ({paidItems.length})
          </span>

          {paidItems.length > 0 && (
            <button
              onClick={onClearTray}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8C5B32',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RotateCcw size={12} /> Recolher Tudo
            </button>
          )}
        </div>

        {paidItems.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A08060',
              fontSize: '0.85rem',
              textAlign: 'center',
            }}
          >
            Toque nas cédulas e moedas da sua carteira para pagar
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {paidItems.map((item, idx) => (
              <CurrencyDisplay
                key={`paid-${item.id}-${idx}`}
                item={item}
                scale={0.78}
                onClick={() => onRemovePaidItem(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Strategy and Change Status */}
      {paidItems.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor:
              strategy === 'exato' || strategy === 'um-real-a-mais'
                ? 'rgba(45, 106, 79, 0.1)'
                : strategy === 'excesso'
                ? 'rgba(244, 162, 97, 0.15)'
                : 'rgba(230, 57, 70, 0.1)',
            border: `1.5px solid ${
              strategy === 'exato' || strategy === 'um-real-a-mais'
                ? 'var(--vitoria-regia)'
                : strategy === 'excesso'
                ? 'var(--buriti)'
                : '#E63946'
            }`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {strategy === 'exato' || strategy === 'um-real-a-mais' ? (
              <CheckCircle size={18} color="var(--vitoria-regia)" />
            ) : (
              <AlertCircle size={18} color="#E63946" />
            )}
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'capitalize' }}>
              {strategy === 'exato' && 'Pagamento Exato!'}
              {strategy === 'um-real-a-mais' && 'Estratégia: Um Real a Mais!'}
              {strategy === 'excesso' && 'Pagamento com Excesso'}
              {strategy === 'insuficiente' && 'Valor Insuficiente'}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--tinta)' }}>
            Troco: {formatBRL(changeExpectedCents)}
          </div>
        </div>
      )}

      {/* Action: Confirm Payment */}
      <button
        onClick={onConfirmPayment}
        disabled={totalPaidCents < totalPriceCents}
        style={{
          width: '100%',
          height: '54px',
          borderRadius: '14px',
          border: 'none',
          backgroundColor: totalPaidCents >= totalPriceCents ? 'var(--vitoria-regia)' : 'var(--tinta-15)',
          color: totalPaidCents >= totalPriceCents ? '#FFFFFF' : 'var(--tinta-60)',
          fontFamily: 'var(--font-hud)',
          fontWeight: 700,
          fontSize: '1rem',
          cursor: totalPaidCents >= totalPriceCents ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: totalPaidCents >= totalPriceCents ? '0 4px 14px rgba(45, 106, 79, 0.35)' : 'none',
        }}
        id="btn-confirm-payment"
      >
        <span>Finalizar Pagamento</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
