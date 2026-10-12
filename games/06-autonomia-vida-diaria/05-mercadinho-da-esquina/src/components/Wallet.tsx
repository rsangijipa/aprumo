import React from 'react';
import type { CurrencyItem } from '../types/money';
import { formatBRL } from '../utils/money';
import { CurrencyDisplay } from './CurrencyDisplay';
import { Wallet as WalletIcon } from 'lucide-react';

interface WalletProps {
  items: CurrencyItem[];
  onSelectItem: (item: CurrencyItem) => void;
}

export const Wallet: React.FC<WalletProps> = ({ items, onSelectItem }) => {
  const totalCents = items.reduce((acc, c) => acc + c.cents, 0);

  // Group items by id/cents
  const grouped: Record<string, { item: CurrencyItem; count: number }> = {};
  items.forEach((item) => {
    if (!grouped[item.id]) {
      grouped[item.id] = { item, count: 0 };
    }
    grouped[item.id].count += 1;
  });

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
      }}
      id="adolescent-wallet"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WalletIcon size={20} color="var(--buriti)" />
          <span style={{ fontFamily: 'var(--font-hud)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--tinta)' }}>
            Sua Carteira
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--tinta-60)', fontWeight: 600 }}>Saldo Disponível:</span>
          <span style={{ fontFamily: 'var(--font-teen)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--vitoria-regia)' }}>
            {formatBRL(totalCents)}
          </span>
        </div>
      </div>

      {/* Currency items grid */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          minHeight: '80px',
        }}
      >
        {Object.values(grouped).length === 0 ? (
          <div style={{ color: 'var(--tinta-60)', fontSize: '0.85rem' }}>Carteira vazia no momento.</div>
        ) : (
          Object.values(grouped).map(({ item, count }) => (
            <CurrencyDisplay
              key={item.id}
              item={item}
              count={count}
              onClick={() => onSelectItem(item)}
              scale={0.9}
            />
          ))
        )}
      </div>
    </div>
  );
};
