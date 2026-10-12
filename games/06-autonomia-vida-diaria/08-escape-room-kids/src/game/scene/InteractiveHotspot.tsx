// ==========================================================================
// ESCAPE ROOM KIDS — INTERACTIVE 3D HOTSPOT
// Accessible, responsive point-and-click target with animated feedback
// ==========================================================================

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Hotspot } from '../types';
import { useGameStore } from '../../state/gameStore';
import { ROOMS_DATA } from '../roomsData';
import { soundManager } from '../../audio/soundManager';

interface InteractiveHotspotProps {
  hotspot: Hotspot;
  isHighlighted: boolean;
  isSolved: boolean;
}

export const InteractiveHotspot: React.FC<InteractiveHotspotProps> = ({
  hotspot,
  isHighlighted,
  isSolved,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const {
    selectedItemId,
    inventory,
    activeRoomId,
    openPuzzle,
    unlockRoomExit,
    showToast,
    setCameraFocus,
  } = useGameStore();

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle floating bob
      meshRef.current.position.y = hotspot.position[1] + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.5;
      if (isHighlighted) {
        const pulse = (1 + Math.sin(state.clock.elapsedTime * 6)) * 0.2 + 0.9;
        ringRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    soundManager.playClick(600);
    setCameraFocus(hotspot.cameraFocus);

    // If it's an exit door requiring an item
    if (hotspot.isExitDoor) {
      if (hotspot.requiresItem) {
        if (selectedItemId === hotspot.requiresItem) {
          unlockRoomExit();
          return;
        } else {
          const required = inventory.find(i => i.id === hotspot.requiresItem);
          if (required) {
            showToast(`Selecione a ${required.name} no seu inventário para usar na porta!`);
          } else {
            showToast(hotspot.hintText);
          }
          return;
        }
      } else {
        unlockRoomExit();
        return;
      }
    }

    // If it has an interactive puzzle
    if (hotspot.puzzleId) {
      const room = ROOMS_DATA.find(r => r.id === activeRoomId);
      const puzzle = room?.puzzles.find(p => p.id === hotspot.puzzleId);
      if (puzzle) {
        openPuzzle(puzzle);
        return;
      }
    }

    // Default item check
    if (hotspot.requiresItem && selectedItemId === hotspot.requiresItem) {
      soundManager.playPuzzleSolved();
      showToast(`Você usou o item em ${hotspot.name}!`);
      return;
    }

    showToast(hotspot.hintText);
  };

  return (
    <group
      ref={meshRef}
      position={hotspot.position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Target Marker Cylinder / Orb */}
      <mesh scale={hovered ? [1.2, 1.2, 1.2] : [1, 1, 1]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial
          color={isSolved ? '#10B981' : isHighlighted ? '#F59E0B' : '#EC4899'}
          emissive={isHighlighted ? '#F59E0B' : isSolved ? '#10B981' : '#EC4899'}
          emissiveIntensity={isHighlighted ? 0.8 : hovered ? 0.5 : 0.2}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Rotating Ring Indicator */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.26, 0.03, 16, 32]} />
        <meshStandardMaterial
          color={isHighlighted ? '#F59E0B' : isSolved ? '#34D399' : '#F472B6'}
          emissive={isHighlighted ? '#F59E0B' : '#EC4899'}
          emissiveIntensity={isHighlighted ? 0.9 : 0.3}
        />
      </mesh>

      {/* Floating 2D HTML Label when Hovered or Highlighted */}
      {(hovered || isHighlighted) && (
        <Html
          position={[0, 0.4, 0]}
          center
          distanceFactor={6}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              color: '#FFFFFF',
              padding: '6px 14px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              border: `2px solid ${isHighlighted ? '#F59E0B' : '#EC4899'}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'Fredoka, sans-serif',
              animation: 'popIn 180ms ease-out',
            }}
          >
            <span>{isSolved ? '✅' : isHighlighted ? '⭐' : '🔍'}</span>
            <span>{hotspot.name}</span>
          </div>
        </Html>
      )}
    </group>
  );
};
