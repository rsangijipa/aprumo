import React from 'react';
import type { GroceryProduct } from '../types/money';
import { formatBRL } from '../utils/money';
import { CheckSquare, Square, Calculator, ShoppingCart } from 'lucide-react';

interface ShoppingListProps {
  basketItems: GroceryProduct[];
  targetItems: GroceryProduct[];
  onRemoveFromBasket: (index: number) => void;
  onClearBasket: () => void;
  onGoToCheckout: () => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  basketItems,
  targetItems,
  onRemoveFromBasket,
  onClearBasket,
  onGoToCheckout,
}) => {
  const totalCents = basketItems.reduce((acc, p) => acc + p.priceCents, 0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '20px 24px',
        boxShadow: '0 8px 24px rgba(30, 37, 43, 0.08)',
        border: '2px solid var(--tinta-15)',
        width: '100%',
        maxWidth: '380px',
      }}
      id="shopping-list-component"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={20} color="var(--vitoria-regia)" />
          <span style={{ fontFamily: 'var(--font-hud)', fontWeight: 800, fontSize: '0.95rem' }}>
            Lista de Compras
          </span>
        </div>

        <button
          onClick={() => {
            const sumStr = basketItems.map((b) => (b.priceCents / 100).toFixed(2)).join(' + ');
            alert(`Calculadora Funcional:\n${sumStr || '0.00'} = R$ ${(totalCents / 100).toFixed(2)}`);
          }}
          className="btn-tab"
          style={{ padding: '4px 8px', fontSize: '0.78rem' }}
          title="Simulador de calculadora do celular"
        >
          <Calculator size={14} /> Somar
        </button>
      </div>

      {/* Target Items Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {targetItems.map((target) => {
          const inBasket = basketItems.some((b) => b.id === target.id);

          return (
            <div
              key={target.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: inBasket ? 'rgba(45, 106, 79, 0.08)' : 'var(--fundo)',
                border: inBasket ? '1.5px solid var(--vitoria-regia)' : '1px solid var(--tinta-15)',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {inBasket ? (
                  <CheckSquare size={18} color="var(--vitoria-regia)" />
                ) : (
                  <Square size={18} color="var(--neutro)" />
                )}
                <span style={{ fontWeight: inBasket ? 700 : 500, color: inBasket ? 'var(--vitoria-regia)' : 'var(--tinta)' }}>
                  {target.name}
                </span>
              </div>

              <span style={{ fontWeight: 700, color: 'var(--tinta-60)', fontSize: '0.8rem' }}>
                {formatBRL(target.priceCents)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Basket Items List */}
      {basketItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--tinta-60)' }}>
              Itens na Cesta ({basketItems.length})
            </span>
            <button
              onClick={onClearBasket}
              style={{ background: 'transparent', border: 'none', color: '#E63946', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 700 }}
            >
              Esvaziar Cesta
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {basketItems.map((item, idx) => (
              <span
                key={`${item.id}-${idx}`}
                onClick={() => onRemoveFromBasket(idx)}
                style={{
                  backgroundColor: 'var(--fundo)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--tinta-15)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Clique para remover da cesta"
              >
                {item.iconEmoji} {item.name} ✕
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Basket Total and Checkout Action */}
      <div
        style={{
          borderTop: '1.5px solid var(--tinta-15)',
          paddingTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--tinta-60)' }}>Total Cesta:</span>
          <span style={{ fontFamily: 'var(--font-teen)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--vitoria-regia)' }}>
            {formatBRL(totalCents)}
          </span>
        </div>

        <button
          onClick={onGoToCheckout}
          disabled={basketItems.length === 0}
          className="btn-primary"
          style={{
            width: '100%',
            height: '48px',
            justifyContent: 'center',
            fontSize: '0.95rem',
            opacity: basketItems.length === 0 ? 0.5 : 1,
            cursor: basketItems.length === 0 ? 'not-allowed' : 'pointer',
          }}
          id="btn-go-to-checkout"
        >
          Ir ao Caixa para Pagar
        </button>
      </div>
    </div>
  );
};
