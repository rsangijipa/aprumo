import React from 'react';
import type { PretendItem } from '../types/pretend';
import { PRETEND_ITEMS } from '../data/pretendItems';
import { soundManager } from '../utils/sound';

interface ItemsTrayProps {
  selectedItem: PretendItem | null;
  onSelectItem: (item: PretendItem) => void;
  isSubstitutionActive: boolean;
}

export const ItemsTray: React.FC<ItemsTrayProps> = ({
  selectedItem,
  onSelectItem,
  isSubstitutionActive,
}) => {
  return (
    <div className="items-tray-card" role="region" aria-label="Cesta de Itens do Faz-de-Conta">
      <div className="tray-header">
        <span className="tray-title">🧺 Cesta de Brinquedos & Comidinhas:</span>
        <span className="tray-sub">Toque em um item e depois toque no urso!</span>
      </div>

      <div className="items-scroll-row">
        {PRETEND_ITEMS.map((item) => {
          // If item is symbolic block and substitution is not active, optionally hide or dim it
          const isSymbolic = item.category === 'simbolico';
          const isSelected = selectedItem?.id === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`item-chip-btn ${isSelected ? 'selected' : ''} ${isSymbolic && !isSubstitutionActive ? 'symbolic-locked' : ''}`}
              onClick={() => {
                soundManager.playClick();
                onSelectItem(item);
              }}
              title={item.name}
            >
              <span className="item-emoji">{item.iconEmoji}</span>
              <span className="item-label">{item.name}</span>
              {isSymbolic && isSubstitutionActive && (
                <span className="symbolic-badge">Faz de Conta!</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
