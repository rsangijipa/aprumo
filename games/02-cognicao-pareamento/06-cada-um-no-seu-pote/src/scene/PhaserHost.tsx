import React, { useEffect, useRef } from 'react';
import { SortMatterWorld } from '../physics/matterEngine';
import type { BinDefinition, SensoryProfile, SortItem } from '../types';

interface PhaserHostProps {
  bins: BinDefinition[];
  currentItem: SortItem | null;
  itemsQueue?: SortItem[];
  sensoryProfile: SensoryProfile;
  onItemEnterBin: (item: SortItem, bin: BinDefinition, throwVelocity: number) => void;
  onItemReturnToTray: (item: SortItem) => void;
}

export const PhaserHost: React.FC<PhaserHostProps> = ({
  bins,
  currentItem,
  itemsQueue = [],
  sensoryProfile,
  onItemEnterBin,
  onItemReturnToTray
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<SortMatterWorld | null>(null);

  // Initialize Matter world
  useEffect(() => {
    if (!containerRef.current) return;

    const world = new SortMatterWorld(
      containerRef.current,
      {
        onItemEnterBin: (item, bin, vel) => {
          onItemEnterBin(item, bin, vel);
        },
        onItemReturnToTray: (item) => {
          onItemReturnToTray(item);
        }
      },
      sensoryProfile
    );

    worldRef.current = world;
    world.setupBins(bins);

    return () => {
      world.destroy();
      worldRef.current = null;
    };
  }, []);

  // Update bins when rule changes or positions are balanced
  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.setupBins(bins);
    }
  }, [bins]);

  // Update sensory profile
  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.setSensoryProfile(sensoryProfile);
    }
  }, [sensoryProfile]);

  // Spawn current item in discrete mode or queue in independent mode
  useEffect(() => {
    if (!worldRef.current) return;

    worldRef.current.clearAllItems();

    if (currentItem) {
      worldRef.current.spawnItem(currentItem);
    } else if (itemsQueue.length > 0) {
      // Spawn items distributed in tray
      const total = itemsQueue.length;
      const width = containerRef.current?.clientWidth || 960;
      const startX = width / 2 - (total * 35) / 2;

      itemsQueue.forEach((item, idx) => {
        worldRef.current?.spawnItem(item, startX + idx * 45, undefined);
      });
    }
  }, [currentItem?.id, itemsQueue.length]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '520px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Visual Bins Overlays matching Matter.js bodies */}
      <div
        style={{
          position: 'absolute',
          top: '35px',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0 40px',
          pointerEvents: 'none',
          zIndex: 5
        }}
      >
        {bins.map((bin) => (
          <div
            key={bin.id}
            style={{
              width: '210px',
              height: '160px',
              borderRadius: '0 0 28px 28px',
              border: `4px solid ${bin.color}`,
              borderTop: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              position: 'relative'
            }}
          >
            {/* Pattern sample for daltonismo */}
            <div
              style={{
                width: '100%',
                padding: '4px',
                borderRadius: '8px',
                backgroundColor: bin.color,
                color: '#FFFFFF',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {bin.label} ({bin.samplePattern})
            </div>

            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: bin.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '1.2rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}
            >
              ★
            </div>

            <span style={{ fontSize: '0.78rem', color: 'var(--tinta-60)', fontWeight: 600 }}>
              Zona de Captura
            </span>
          </div>
        ))}
      </div>

      {/* Physics Container Canvas */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '560px',
          backgroundColor: '#FBF9F5',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '2px solid var(--tinta-15)'
        }}
      />

      {/* Esteira / Tray Label */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          backgroundColor: 'rgba(212, 163, 115, 0.25)',
          border: '2px solid #D4A373',
          borderRadius: '16px',
          padding: '6px 24px',
          fontWeight: 700,
          color: '#8D5B4C',
          fontSize: '0.85rem',
          pointerEvents: 'none',
          zIndex: 4
        }}
      >
        Esteira de Itens (Arraste ou arremesse para o pote)
      </div>
    </div>
  );
};
