// ==========================================================================
// ESCAPE ROOM KIDS — GREENHOUSE ROOM 3D DIORAMA
// Botanical Lab: Conservatory Ribs, Seed Balance Scale, Hydroponic Pipes, Lunar Tree, Vine Gate
// ==========================================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../state/gameStore';

export const GreenhouseRoom: React.FC = () => {
  const { roomStates } = useGameStore();
  const ghState = roomStates.greenhouse;

  const scaleBeamRef = useRef<THREE.Group>(null);
  const lunarTreeRef = useRef<THREE.Group>(null);
  const gateLeftRef = useRef<THREE.Group>(null);
  const gateRightRef = useRef<THREE.Group>(null);
  const flowerBulbRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // 1. Balance scale tilt
    if (scaleBeamRef.current) {
      const targetAngle = ghState.scaleBalanced ? 0 : 0.22;
      scaleBeamRef.current.rotation.z = THREE.MathUtils.lerp(
        scaleBeamRef.current.rotation.z,
        targetAngle,
        delta * 3
      );
    }

    // 2. Lunar Tree gentle bioluminescent breathing
    if (lunarTreeRef.current) {
      const breathe = Math.sin(state.clock.elapsedTime * 1.8) * 0.04;
      lunarTreeRef.current.scale.set(1 + breathe, 1 + breathe, 1 + breathe);
    }

    // 3. Flower bulb blooming
    if (flowerBulbRef.current && ghState.pipesConnected) {
      flowerBulbRef.current.rotation.y += delta * 1.2;
    }

    // 4. Vine gate opening
    if (gateLeftRef.current && gateRightRef.current) {
      const targetOpen = ghState.gateOpen ? Math.PI * 0.45 : 0;
      gateLeftRef.current.rotation.y = THREE.MathUtils.lerp(
        gateLeftRef.current.rotation.y,
        -targetOpen,
        delta * 2.5
      );
      gateRightRef.current.rotation.y = THREE.MathUtils.lerp(
        gateRightRef.current.rotation.y,
        targetOpen,
        delta * 2.5
      );
    }
  });

  return (
    <group>
      {/* --- 1. GREENHOUSE CONSERVATORY ARCH RIBS --- */}
      {[-2.0, 0, 2.0].map((rz) => (
        <mesh key={`rib-${rz}`} position={[-1.5, 2.8, rz]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.04, 0.04, 3.2, 8]} />
          <meshStandardMaterial color="#065F46" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* --- 2. ANTIQUE SEED BALANCE SCALE (Left wall) --- */}
      <group position={[-2.1, 0, -1.1]}>
        {/* Heavy Marble Pedestal */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.35, 0.8, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} />
        </mesh>
        {/* Scale Central Mast */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.06, 0.7, 16]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.8} />
        </mesh>
        {/* Tilting Horizontal Beam with Pans */}
        <group ref={scaleBeamRef} position={[0, 1.2, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 0.04, 0.04]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.8} />
          </mesh>
          {/* Left Pan */}
          <group position={[-0.55, -0.2, 0]}>
            <mesh position={[0, -0.05, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.1, 0.04, 16]} />
              <meshStandardMaterial color="#D97706" metalness={0.7} />
            </mesh>
            {/* Seeds in left pan */}
            <mesh position={[0, 0.02, 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color="#F59E0B" />
            </mesh>
          </group>
          {/* Right Pan */}
          <group position={[0.55, -0.2, 0]}>
            <mesh position={[0, -0.05, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.1, 0.04, 16]} />
              <meshStandardMaterial color="#D97706" metalness={0.7} />
            </mesh>
            {/* Seeds in right pan */}
            <mesh position={[0, 0.02, 0]}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshStandardMaterial color="#34D399" />
            </mesh>
          </group>
        </group>
      </group>

      {/* --- 3. HYDROPONIC WATER PIPING NETWORK (Right wall) --- */}
      <group position={[2.1, 0, -1.4]}>
        {/* Water Pump Tank */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 1.2, 16]} />
          <meshStandardMaterial color="#0284C7" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Connecting Copper Pipe Run */}
        <mesh position={[0, 1.3, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.4, 12]} />
          <meshStandardMaterial color="#B45309" metalness={0.8} />
        </mesh>
        {/* 4 Rotatable Valve Wheels */}
        {[-0.3, 0.3].map((vy, i) => (
          <mesh key={`valve-${i}`} position={[0.1, 1.3, vy]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.12, 0.025, 12, 24]} />
            <meshStandardMaterial color="#EF4444" metalness={0.5} />
          </mesh>
        ))}
        {/* Glowing Water Flow Effect */}
        {ghState.pipesConnected && (
          <pointLight position={[0, 1.3, 0.5]} color="#38BDF8" intensity={2} distance={3} />
        )}
      </group>

      {/* --- 4. BIOLUMINESCENT LUNAR TREE & FLOWER (Right foreground) --- */}
      <group ref={lunarTreeRef} position={[1.8, 0, 1.5]}>
        {/* Twisted Trunk */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.35, 1.4, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {/* Glowing Foliage Cluster */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <sphereGeometry args={[0.65, 24, 24]} />
          <meshStandardMaterial
            color="#A855F7"
            emissive="#7E22CE"
            emissiveIntensity={0.6}
            roughness={0.4}
          />
        </mesh>
        {/* Hanging Golden Sprout Bulb */}
        <mesh ref={flowerBulbRef} position={[-0.3, 1.2, 0.2]}>
          <octahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial
            color="#FBBF24"
            emissive="#F59E0B"
            emissiveIntensity={0.8}
          />
        </mesh>
        <pointLight position={[0, 1.5, 0]} color="#C084FC" intensity={2.5} distance={5} />
      </group>

      {/* --- 5. ORNATE CONSERVATORY VINE GATE (Back center) --- */}
      <group position={[0, 0, -3.0]}>
        {/* Conservatory Stone Arch */}
        <mesh position={[0, 1.8, -0.05]} receiveShadow>
          <boxGeometry args={[2.4, 3.4, 0.3]} />
          <meshStandardMaterial color="#064E3B" roughness={0.7} />
        </mesh>

        {/* Left Gate Wing */}
        <group ref={gateLeftRef} position={[-0.9, 1.5, 0]}>
          <mesh position={[0.45, 0, 0]} castShadow>
            <boxGeometry args={[0.9, 2.6, 0.08]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>

        {/* Right Gate Wing */}
        <group ref={gateRightRef} position={[0.9, 1.5, 0]}>
          <mesh position={[-0.45, 0, 0]} castShadow>
            <boxGeometry args={[0.9, 2.6, 0.08]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>

        {/* Central Blooming Flower Lock */}
        <mesh position={[0, 1.5, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
          <meshStandardMaterial
            color={ghState.sunlightFiltered ? '#10B981' : '#F59E0B'}
            emissive={ghState.sunlightFiltered ? '#10B981' : '#000000'}
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Sunlight portal light behind gate when opened */}
        {ghState.gateOpen && (
          <pointLight position={[0, 1.6, -0.5]} color="#34D399" intensity={5} distance={7} />
        )}
      </group>
    </group>
  );
};
