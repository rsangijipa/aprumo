// ==========================================================================
// ESCAPE ROOM KIDS — WORKSHOP ROOM 3D DIORAMA
// Inventor's Workshop: Workbench, Tool Chest, Animated Gear Train, Laser Prism, Vault Door
// ==========================================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../state/gameStore';

export const WorkshopRoom: React.FC = () => {
  const { roomStates } = useGameStore();
  const wsState = roomStates.workshop;

  const chestLidRef = useRef<THREE.Group>(null);
  const gear1Ref = useRef<THREE.Mesh>(null);
  const gear2Ref = useRef<THREE.Mesh>(null);
  const gear3Ref = useRef<THREE.Mesh>(null);
  const doorRef = useRef<THREE.Group>(null);
  const doorWheelRef = useRef<THREE.Mesh>(null);
  const crystalRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // 1. Smooth chest lid opening animation
    if (chestLidRef.current) {
      const targetRot = wsState.chestOpen ? -Math.PI * 0.45 : 0;
      chestLidRef.current.rotation.x = THREE.MathUtils.lerp(
        chestLidRef.current.rotation.x,
        targetRot,
        delta * 4
      );
    }

    // 2. Animated rotating gear train when active
    if (wsState.laserActive) {
      if (gear1Ref.current) gear1Ref.current.rotation.z += delta * 2.5;
      if (gear2Ref.current) gear2Ref.current.rotation.z -= delta * 1.8;
      if (gear3Ref.current) gear3Ref.current.rotation.z += delta * 1.2;
    }

    // 3. Vault door swing & wheel rotation
    if (doorRef.current) {
      const targetDoorRot = wsState.doorOpen ? -Math.PI * 0.5 : 0;
      doorRef.current.rotation.y = THREE.MathUtils.lerp(
        doorRef.current.rotation.y,
        targetDoorRot,
        delta * 3
      );
    }
    if (doorWheelRef.current && wsState.doorOpen) {
      doorWheelRef.current.rotation.z += delta * 3;
    }

    // 4. Crystal floating glow
    if (crystalRef.current) {
      crystalRef.current.position.y = 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      crystalRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group>
      {/* --- 1. INVENTOR WORKBENCH (Left side) --- */}
      <group position={[-2.4, 0, -0.2]}>
        {/* Table Top */}
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.1, 2.0]} />
          <meshStandardMaterial color="#854D0E" roughness={0.6} />
        </mesh>
        {/* Table Legs */}
        {[-0.5, 0.5].map((x) =>
          [-0.8, 0.8].map((z) => (
            <mesh key={`leg-${x}-${z}`} position={[x, 0.35, z]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.7, 12]} />
              <meshStandardMaterial color="#451A03" />
            </mesh>
          ))
        )}
        {/* Blueprint Paper on Table */}
        <mesh position={[0, 0.76, 0.2]} rotation={[-Math.PI / 2, 0, 0.1]}>
          <planeGeometry args={[0.7, 0.5]} />
          <meshStandardMaterial color="#0284C7" roughness={0.9} />
        </mesh>
        {/* Brass Desk Lamp */}
        <group position={[-0.3, 0.75, -0.6]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.02, 0.08, 0.4, 16]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.16, 0.15, 16]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.8} />
          </mesh>
          <pointLight color="#FEF08A" intensity={1.5} distance={3} decay={2} />
        </group>
      </group>

      {/* --- 2. ANTIQUE TOOL CHEST WITH SYMBOL LOCK (Left foreground) --- */}
      <group position={[-2.2, 0, 1.8]} rotation={[0, Math.PI / 6, 0]}>
        {/* Chest Base */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.5, 0.5]} />
          <meshStandardMaterial color="#713F12" roughness={0.5} />
        </mesh>
        {/* Brass Corner Straps */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.82, 0.52, 0.1]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Hinged Lid */}
        <group ref={chestLidRef} position={[0, 0.5, -0.25]}>
          <mesh position={[0, 0.1, 0.25]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.8, 16, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#92400E" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* --- 3. GENERATOR BOARD WITH GEAR TRAIN (Right wall) --- */}
      <group position={[2.9, 1.4, -1.8]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Iron Backplate */}
        <mesh position={[0, 0, -0.05]} receiveShadow>
          <boxGeometry args={[1.6, 1.8, 0.1]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Motor Gear (Bottom) */}
        <mesh ref={gear1Ref} position={[-0.4, -0.4, 0.05]}>
          <cylinderGeometry args={[0.25, 0.25, 0.08, 16]} />
          <meshStandardMaterial color="#64748B" metalness={0.7} />
        </mesh>
        {/* Transmission Gear (Middle) */}
        <mesh ref={gear2Ref} position={[0.1, 0.1, 0.05]}>
          <cylinderGeometry args={[0.35, 0.35, 0.08, 20]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.8} />
        </mesh>
        {/* Big Brass Gear (Top - player placed) */}
        {wsState.gearsPlaced[2] && (
          <mesh ref={gear3Ref} position={[-0.3, 0.5, 0.05]}>
            <cylinderGeometry args={[0.42, 0.42, 0.08, 24]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.2} />
          </mesh>
        )}
      </group>

      {/* --- 4. PRISM & CRYSTAL LIGHT BEAM (Center-left) --- */}
      <group position={[-1.2, 0, -1.5]}>
        {/* Pedestal Base */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 0.9, 16]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
        {/* Floating Crystal */}
        <mesh ref={crystalRef} position={[0, 1.0, 0]}>
          <octahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial
            color="#38BDF8"
            emissive="#38BDF8"
            emissiveIntensity={0.8}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>
        <pointLight position={[0, 1.0, 0]} color="#38BDF8" intensity={2} distance={4} />

        {/* Laser Light Beam Connecting Pedestal to Mirrors */}
        {wsState.laserActive && (
          <group>
            {/* Beam Segment 1: Crystal to Mirror 1 */}
            <mesh position={[1.0, 1.0, 0.6]} rotation={[0, -Math.PI / 4, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 2.5, 8]} />
              <meshBasicMaterial color="#38BDF8" />
            </mesh>
            {/* Beam Segment 2: Mirror 1 to Door Receptor */}
            {wsState.mirrorsAligned && (
              <mesh position={[0.7, 1.0, -1.3]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 2.6, 8]} />
                <meshBasicMaterial color="#34D399" />
              </mesh>
            )}
          </group>
        )}
      </group>

      {/* --- 5. VAULT EXIT DOOR (Back wall center) --- */}
      <group position={[0, 0, -3.0]}>
        {/* Door Frame Arch */}
        <mesh position={[0, 1.5, -0.05]} receiveShadow>
          <boxGeometry args={[1.8, 3.0, 0.3]} />
          <meshStandardMaterial color="#1E293B" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Swinging Vault Door */}
        <group ref={doorRef} position={[-0.8, 1.5, 0]}>
          <mesh position={[0.8, 0, 0]} castShadow>
            <boxGeometry args={[1.5, 2.7, 0.15]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Circular Wheel Lock */}
          <mesh ref={doorWheelRef} position={[0.8, 0, 0.12]}>
            <torusGeometry args={[0.3, 0.04, 16, 32]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} />
          </mesh>
          {/* Key Hole / Cylinder Lock */}
          <mesh position={[0.8, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.9} />
          </mesh>
          {/* Solar Receptor Sensor */}
          <mesh position={[0.8, 0.9, 0.12]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial
              color={wsState.mirrorsAligned ? '#10B981' : '#EF4444'}
              emissive={wsState.mirrorsAligned ? '#10B981' : '#EF4444'}
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>

        {/* Glowing portal light behind door when opened */}
        {wsState.doorOpen && (
          <pointLight position={[0, 1.5, -0.5]} color="#FDE047" intensity={4} distance={6} />
        )}
      </group>
    </group>
  );
};
