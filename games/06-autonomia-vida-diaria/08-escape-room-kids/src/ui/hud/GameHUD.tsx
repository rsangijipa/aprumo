// ==========================================================================
// ESCAPE ROOM KIDS — GAME HUD & DOCKED INVENTORY
// Lightweight top objective banner (<20% viewport), collapsible 6-slot inventory
// ==========================================================================

import React, { useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { ROOMS_DATA } from '../../game/roomsData';
import { soundManager } from '../../audio/soundManager';
import {
  Lightbulb,
  Settings,
  Compass,
  Eye,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Info,
} from 'lucide-react';
import { InventoryItem } from '../../game/types';

interface GameHUDProps {
  onOpenSettings: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ onOpenSettings }) => {
  const {
    activeRoomId,
    ageProfile,
    cameraMode,
    setCameraMode,
    inventory,
    selectedItemId,
    selectItem,
    inspectItem,
    openHintModal,
    toastMessage,
  } = useGameStore();

  const [inventoryCollapsed, setInventoryCollapsed] = useState(false);

  const currentRoom = ROOMS_DATA.find((r) => r.id === activeRoomId) || ROOMS_DATA[0];

  const handleSlotClick = (item?: InventoryItem) => {
    if (!item) return;
    if (selectedItemId === item.id) {
      // If already selected, open 3D inspection
      inspectItem(item);
    } else {
      selectItem(item.id);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 20,
      }}
    >
      {/* --- TOP BAR: ROOM INFO, OBJECTIVE, CONTROLS --- */}
      <header
        className="safe-padding-top safe-padding-left safe-padding-right"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          gap: '12px',
          pointerEvents: 'auto',
        }}
      >
        {/* Left: Room Badge & Age Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            className="clay-card"
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '18px' }}>🏰</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem' }}>
              {currentRoom.name}
            </span>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
              color: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            Perfil {ageProfile}
          </div>
        </div>

        {/* Center: Objective Banner (< 20% viewport) */}
        <div
          className="clay-card"
          style={{
            maxWidth: '380px',
            padding: '8px 16px',
            borderRadius: '20px',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '2px solid var(--color-border)',
          }}
        >
          <Info size={16} color="var(--color-primary)" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Descubra os mecanismos da sala e abra a saída!
          </span>
        </div>

        {/* Right: Hint, Camera Toggle, Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Layered Hint Button */}
          <button
            onClick={openHintModal}
            className="clay-btn clay-btn-accent"
            style={{ padding: '8px 14px', fontSize: '0.9rem', minHeight: '42px' }}
            aria-label="Pedir Dica"
          >
            <Lightbulb size={20} />
            <span style={{ display: 'none', minWidth: '0' }} className="sm-show">
              Dica
            </span>
          </button>

          {/* Camera Mode Toggle */}
          <button
            onClick={() => setCameraMode(cameraMode === 'orbit' ? 'firstPerson' : 'orbit')}
            className="clay-btn clay-btn-glass"
            style={{ width: '42px', height: '42px', minWidth: '42px', minHeight: '42px', padding: 0 }}
            aria-label={cameraMode === 'orbit' ? 'Mudar para 1ª Pessoa' : 'Mudar para Órbita'}
            title={cameraMode === 'orbit' ? 'Mudar para 1ª Pessoa' : 'Mudar para Órbita'}
          >
            {cameraMode === 'orbit' ? <Compass size={20} /> : <Eye size={20} />}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="clay-btn clay-btn-glass"
            style={{ width: '42px', height: '42px', minWidth: '42px', minHeight: '42px', padding: 0 }}
            aria-label="Configurações e Pausa"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* --- FEEDBACK TOAST / SOUND SUBTITLES --- */}
      {toastMessage && (
        <div
          style={{
            alignSelf: 'center',
            marginBottom: '16px',
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '24px',
            fontSize: '0.95rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            border: '2px solid var(--color-primary)',
            animation: 'popIn 180ms ease-out',
            pointerEvents: 'auto',
          }}
        >
          <Sparkles size={18} color="#FBBF24" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* --- BOTTOM: 6-SLOT INVENTORY DOCK --- */}
      <footer
        className="safe-padding-bottom"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'auto',
          paddingBottom: '12px',
        }}
      >
        {/* Toggle Collapse Tab (for mobile/tablet) */}
        <button
          onClick={() => {
            soundManager.playClick();
            setInventoryCollapsed(!inventoryCollapsed);
          }}
          className="clay-btn clay-btn-glass"
          style={{
            padding: '2px 14px',
            minHeight: '26px',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            fontSize: '0.75rem',
            color: '#475569',
          }}
        >
          <span>Mochila ({inventory.length}/6)</span>
          {inventoryCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* 6 Inventory Slots Container */}
        {!inventoryCollapsed && (
          <div
            className="clay-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 16px',
              borderRadius: '24px',
              border: '3px solid rgba(255,255,255,0.9)',
              animation: 'slideUp 180ms ease-out',
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
              const item = inventory[slotIdx];
              const isSelected = item && selectedItemId === item.id;

              return (
                <button
                  type="button"
                  key={slotIdx}
                  onClick={() => handleSlotClick(item)}
                  className={`inventory-slot ${isSelected ? 'active' : ''}`}
                  title={
                    item
                      ? `${item.name} (Clique para usar, clique 2x para inspecionar em 3D)`
                      : 'Slot vazio'
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: item ? 'pointer' : 'default',
                  }}
                >
                  {item ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '24px' }}>
                        {item.modelType === 'gear'
                          ? '⚙️'
                          : item.modelType === 'key' || item.modelType === 'flowerKey'
                          ? '🗝️'
                          : item.modelType === 'spring'
                          ? '🌀'
                          : item.modelType === 'book'
                          ? '📖'
                          : item.modelType === 'magnifier'
                          ? '🔍'
                          : item.modelType === 'scroll'
                          ? '📜'
                          : item.modelType === 'seed'
                          ? '🌱'
                          : item.modelType === 'flask'
                          ? '🧪'
                          : '⭐'}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '18px', color: '#CBD5E1' }}>•</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </footer>
    </div>
  );
};
