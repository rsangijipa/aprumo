import React from 'react';
import type { GroceryProduct } from '../types/money';
import { formatBRL } from '../utils/money';

interface ShelfProps {
  products: GroceryProduct[];
  onSelectProduct: (product: GroceryProduct) => void;
}

export const Shelf: React.FC<ShelfProps> = ({ products, onSelectProduct }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        backgroundColor: '#E6D2B5',
        borderRadius: '20px',
        padding: '16px 20px',
        border: '4px solid #C4A47C',
        boxShadow: '0 8px 24px rgba(45, 30, 15, 0.15)',
      }}
      id="grocery-shelf"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-hud)',
            fontWeight: 800,
            fontSize: '0.85rem',
            color: '#654321',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Prateleira de Mercearia & Hortifruti
        </span>

        <span style={{ fontSize: '0.78rem', color: '#654321', fontWeight: 600 }}>
          Toque para pegar o item
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '14px',
        }}
      >
        {products.map((product) => (
          <button
            type="button"
            key={product.id}
            onClick={() => onSelectProduct(product)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '12px 10px',
              border: '2px solid rgba(196, 164, 124, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.06)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              minHeight: '140px',
              position: 'relative',
              textAlign: 'inherit',
              font: 'inherit',
            }}
            onPointerDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
            onPointerUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title={`Adicionar ${product.name} à cesta`}
          >
            <div style={{ fontSize: '38px', marginTop: '4px' }}>{product.iconEmoji}</div>

            <div style={{ textAlign: 'center', width: '100%' }}>
              <div
                style={{
                  fontFamily: 'var(--font-teen)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--tinta)',
                  lineHeight: '1.2',
                }}
              >
                {product.name}
              </div>

              {/* Price tag */}
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--buriti)',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-teen)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  marginTop: '6px',
                }}
              >
                {formatBRL(product.priceCents)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
