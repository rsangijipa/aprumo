// ==========================================================================
// ESCAPE ROOM KIDS — 3D ITEM INSPECTION & COMBINATION MODAL
// Allows 360-degree item rotation, detailed clue examination, and item merging
// ==========================================================================

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '../../state/gameStore';
import { soundManager } from '../../audio/soundManager';
import { X, Sparkles, Eye, RotateCw } from 'lucide-react';

// 3D Procedural representation for inspected items
const InspectItem3D: React.FC<{ modelType: string; color: string }> = ({ modelType, color }) => {
  return (
    <group>
      {modelType === 'gear' && (
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.25, 16]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
      )}

      {modelType === 'key' && (
        <group rotation={[0, 0, Math.PI / 4]}>
          {/* Key Shaft */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 2.0, 16]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Key Bow / Ring */}
          <mesh position={[0, 1.0, 0]}>
            <torusGeometry args={[0.4, 0.08, 16, 24]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Key Bit Teeth */}
          <mesh position={[0.2, -0.7, 0]}>
            <boxGeometry args={[0.35, 0.15, 0.08]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      )}

      {modelType === 'spring' && (
        <mesh>
          <torusGeometry args={[0.8, 0.18, 16, 32]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
        </mesh>
      )}

      {modelType === 'book' && (
        <mesh rotation={[0.4, 0.6, 0]}>
          <boxGeometry args={[1.4, 1.9, 0.4]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      )}

      {modelType === 'magnifier' && (
        <group>
          {/* Glass Lens */}
          <mesh>
            <cylinderGeometry args={[0.9, 0.9, 0.08, 32]} />
            <meshPhysicalMaterial
              color="#E0F2FE"
              transmission={0.85}
              opacity={1}
              transparent
              roughness={0.05}
              ior={1.5}
            />
          </mesh>
          {/* Brass Rim */}
          <mesh>
            <torusGeometry args={[0.9, 0.08, 16, 32]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} />
          </mesh>
          {/* Handle */}
          <mesh position={[0, -1.3, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 1.2, 16]} />
            <meshStandardMaterial color="#78350F" roughness={0.4} />
          </mesh>
        </group>
      )}

      {modelType === 'scroll' && (
        <group rotation={[0, 0, Math.PI / 4]}>
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 2.0, 16]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        </group>
      )}

      {modelType === 'prism' && (
        <mesh rotation={[0.5, 0.5, 0]}>
          <coneGeometry args={[1.0, 1.8, 3]} />
          <meshPhysicalMaterial
            color="#38BDF8"
            transmission={0.9}
            transparent
            roughness={0.1}
          />
        </mesh>
      )}

      {modelType === 'seed' && (
        <mesh>
          <sphereGeometry args={[0.9, 24, 24]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
        </mesh>
      )}

      {modelType === 'flask' && (
        <group>
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.8, 24, 24]} />
            <meshStandardMaterial color={color} roughness={0.2} transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
            <meshStandardMaterial color="#94A3B8" />
          </mesh>
        </group>
      )}

      {modelType === 'dial' && (
        <mesh>
          <cylinderGeometry args={[1.2, 1.2, 0.15, 32]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
        </mesh>
      )}

      {modelType === 'flowerKey' && (
        <group>
          <mesh position={[0, 0.6, 0]}>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color="#34D399" emissive="#10B981" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1.4, 16]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export const ItemInspectModal: React.FC = () => {
  const {
    inspectingItem,
    closeInspection,
    inventory,
    combineItems,
  } = useGameStore();

  if (!inspectingItem) return null;

  // Filter other inventory items that can combine with this
  const otherItems = inventory.filter((i) => i.id !== inspectingItem.id);

  const handleCombine = (targetId: string) => {
    soundManager.playClick();
    combineItems(inspectingItem.id, targetId);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Inspecionar Item"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
        animation: 'popIn 200ms ease-out',
      }}
    >
      <button
        type="button"
        aria-label="Fechar inspeção"
        onClick={closeInspection}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
        }}
      />
      <div
        className="clay-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid var(--color-border)',
            paddingBottom: '12px',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={24} color="var(--color-primary)" />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#0F172A' }}>
              {inspectingItem.name}
            </h2>
          </div>
          <button
            onClick={closeInspection}
            className="clay-btn clay-btn-glass"
            style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', padding: 0 }}
            aria-label="Fechar Inspeção"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3D Canvas Object Viewer */}
        <div
          style={{
            width: '100%',
            height: '240px',
            borderRadius: '16px',
            background: 'radial-gradient(circle, #334155, #0F172A)',
            position: 'relative',
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <Canvas camera={{ position: [0, 1.2, 3.2], fov: 45 }}>
            <ambientLight intensity={0.9} />
            <directionalLight position={[4, 5, 4]} intensity={1.5} />
            <pointLight position={[-3, 2, -2]} intensity={0.8} color="#38BDF8" />
            <Suspense fallback={null}>
              <InspectItem3D
                modelType={inspectingItem.modelType}
                color={inspectingItem.color}
              />
            </Suspense>
            <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={1.5} />
          </Canvas>

          {/* Hint Overlay badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.75)',
              color: '#F8FAFC',
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none',
            }}
          >
            <RotateCw size={14} />
            <span>Arraste com o dedo ou mouse para girar em 360°</span>
          </div>
        </div>

        {/* Clue Details */}
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.4 }}>
            {inspectingItem.description}
          </p>

          <div
            style={{
              background: '#FFFBEB',
              border: '2px solid #FDE68A',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.9rem',
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={18} color="#D97706" />
            <span>{inspectingItem.inspectText}</span>
          </div>

          {/* Combinations section */}
          {inspectingItem.combinableWith && inspectingItem.combinableWith.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Combinar com outro item do inventário:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {otherItems.map((other) => {
                  const canCombine = inspectingItem.combinableWith?.includes(other.id);
                  return (
                    <button
                      key={other.id}
                      onClick={() => handleCombine(other.id)}
                      disabled={!canCombine}
                      className={`clay-btn ${canCombine ? 'clay-btn-accent' : 'clay-btn-glass'}`}
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.9rem',
                        opacity: canCombine ? 1 : 0.45,
                        cursor: canCombine ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Sparkles size={16} />
                      <span>{other.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
