// ==========================================================================
// ESCAPE ROOM KIDS — LIBRARY ROOM 3D DIORAMA
// Secret Library: Bookshelves, Reading Lectern, Celestial Globe, Tuned Bells, Sliding Passage
// ==========================================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../state/gameStore';

export const LibraryRoom: React.FC = () => {
  const { roomStates } = useGameStore();
  const libState = roomStates.library;

  const globeRingRef = useRef<THREE.Group>(null);
  const secretDoorRef = useRef<THREE.Group>(null);
  const bellRefs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ];

  useFrame((state, delta) => {
    // 1. Celestial globe rotation
    if (globeRingRef.current) {
      const speed = libState.globeAligned ? 0.3 : 0.8;
      globeRingRef.current.rotation.y += delta * speed;
      globeRingRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }

    // 2. Secret bookcase sliding door
    if (secretDoorRef.current) {
      const targetX = libState.doorOpen ? -1.8 : 0;
      secretDoorRef.current.position.x = THREE.MathUtils.lerp(
        secretDoorRef.current.position.x,
        targetX,
        delta * 2.5
      );
    }
  });

  return (
    <group>
      {/* --- 1. TALL BOOKSHELVES (Left Wall) --- */}
      <group position={[-2.9, 0, 0]}>
        {/* Bookcase frame */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 3.4, 5.0]} />
          <meshStandardMaterial color="#451A03" roughness={0.7} />
        </mesh>
        {/* Shelves and Colorful Books Rows */}
        {[-1.0, 0, 1.0].map((shelfZ) =>
          [0.6, 1.3, 2.0, 2.7].map((shelfY, rIdx) => (
            <group key={`shelf-${shelfZ}-${shelfY}`} position={[0.1, shelfY, shelfZ]}>
              {/* Shelf divider */}
              <mesh position={[0, -0.05, 0]}>
                <boxGeometry args={[0.35, 0.05, 1.4]} />
                <meshStandardMaterial color="#78350F" />
              </mesh>
              {/* Row of Books */}
              {[-0.5, -0.25, 0, 0.25, 0.5].map((bX, bIdx) => (
                <mesh
                  key={`b-${bX}`}
                  position={[0, 0.2, bX]}
                  rotation={[0, 0, (bIdx % 3 - 1) * 0.08]}
                  castShadow
                >
                  <boxGeometry args={[0.26, 0.38 + (bIdx % 2) * 0.08, 0.12]} />
                  <meshStandardMaterial
                    color={
                      (rIdx + bIdx) % 4 === 0
                        ? '#EF4444'
                        : (rIdx + bIdx) % 4 === 1
                        ? '#3B82F6'
                        : (rIdx + bIdx) % 4 === 2
                        ? '#10B981'
                        : '#F59E0B'
                    }
                    roughness={0.6}
                  />
                </mesh>
              ))}
            </group>
          ))
        )}
      </group>

      {/* --- 2. READING LECTERN (Center-left) --- */}
      <group position={[-2.1, 0, 0.4]}>
        {/* Pedestal */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.25, 0.9, 16]} />
          <meshStandardMaterial color="#78350F" roughness={0.6} />
        </mesh>
        {/* Slanted Stand */}
        <mesh position={[0, 0.95, 0]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.9, 0.1, 0.6]} />
          <meshStandardMaterial color="#92400E" roughness={0.5} />
        </mesh>
        {/* The 4 Elemental Tomes on the Lectern */}
        {[-0.3, -0.1, 0.1, 0.3].map((tx, idx) => (
          <mesh
            key={`tome-${idx}`}
            position={[tx, 1.05 + idx * 0.02, 0]}
            rotation={[0.4, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.16, 0.25, 0.06]} />
            <meshStandardMaterial
              color={
                idx === 0
                  ? '#EF4444' // Fire Red
                  : idx === 1
                  ? '#3B82F6' // Water Blue
                  : idx === 2
                  ? '#10B981' // Earth Green
                  : '#FBBF24' // Sun Gold
              }
              emissive={libState.booksOrdered ? '#FBBF24' : '#000000'}
              emissiveIntensity={libState.booksOrdered ? 0.4 : 0}
            />
          </mesh>
        ))}
      </group>

      {/* --- 3. CELESTIAL GLOBE (Right foreground) --- */}
      <group position={[2.0, 0, 1.4]}>
        {/* Heavy Mahogany Tripod Stand */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.35, 1.0, 16]} />
          <meshStandardMaterial color="#581C87" roughness={0.5} />
        </mesh>
        {/* Brass Gimbal Ring */}
        <group ref={globeRingRef} position={[0, 1.1, 0]}>
          <mesh>
            <torusGeometry args={[0.42, 0.03, 16, 32]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Inner Deep Blue Star Sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.34, 32, 32]} />
            <meshStandardMaterial
              color="#1E1B4B"
              roughness={0.4}
              emissive="#312E81"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      </group>

      {/* --- 4. PEDESTAL WITH 4 TUNED CHIME BELLS (Right wall) --- */}
      <group position={[2.2, 0, -1.2]}>
        {/* Stone / Wood Stand */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.4, 1.0, 0.4]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        {/* 4 Hanging Tuned Brass Bells */}
        {[-0.45, -0.15, 0.15, 0.45].map((bx, idx) => (
          <group key={`bell-${idx}`} position={[bx, 1.15, 0]}>
            <mesh ref={bellRefs[idx]} castShadow>
              <coneGeometry args={[0.11 + idx * 0.02, 0.22, 16]} />
              <meshStandardMaterial
                color={
                  idx === 0
                    ? '#38BDF8'
                    : idx === 1
                    ? '#34D399'
                    : idx === 2
                    ? '#FBBF24'
                    : '#C084FC'
                }
                metalness={0.85}
                roughness={0.15}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* --- 5. SECRET SLIDING BOOKCASE PASSAGE (Back wall) --- */}
      <group position={[0, 0, -3.0]}>
        {/* Passage Wall Frame */}
        <mesh position={[0, 1.8, -0.05]} receiveShadow>
          <boxGeometry args={[2.4, 3.4, 0.3]} />
          <meshStandardMaterial color="#1E293B" />
        </mesh>

        {/* Sliding Bookcase Door */}
        <group ref={secretDoorRef} position={[0, 1.6, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.8, 3.0, 0.35]} />
            <meshStandardMaterial color="#581C87" roughness={0.6} />
          </mesh>
          {/* Books in the Secret Bookcase */}
          {[-0.6, 0, 0.6].map((by) => (
            <mesh key={`s-book-${by}`} position={[0, by, 0.18]}>
              <boxGeometry args={[1.5, 0.25, 0.15]} />
              <meshStandardMaterial color="#FBBF24" roughness={0.5} />
            </mesh>
          ))}
          {/* 4 Rune Cipher Buttons on Door */}
          {[-0.45, -0.15, 0.15, 0.45].map((rx, idx) => (
            <mesh key={`rune-${idx}`} position={[rx, -0.4, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
              <meshStandardMaterial
                color={libState.cipherUsed ? '#34D399' : '#F59E0B'}
                emissive={libState.cipherUsed ? '#34D399' : '#000000'}
                emissiveIntensity={0.6}
              />
            </mesh>
          ))}
        </group>

        {/* Secret illuminated starry portal behind door */}
        {libState.doorOpen && (
          <pointLight position={[0, 1.6, -0.5]} color="#60A5FA" intensity={5} distance={7} />
        )}
      </group>
    </group>
  );
};
