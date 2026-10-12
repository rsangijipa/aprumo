// ==========================================================================
// ESCAPE ROOM KIDS — DUAL CAMERA CONTROLLER
// Mode 1: Point-and-Look / Orbit (Tablet & Accessible default)
// Mode 2: Accessible First-Person (WASD / Keyboard / Drag look)
// ==========================================================================

import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../state/gameStore';

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const orbitRef = useRef<any>(null);
  const keysDown = useRef<Record<string, boolean>>({});

  const {
    cameraMode,
    cameraTarget,
    settings,
  } = useGameStore();

  // Keyboard listeners for First-Person exploration mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    // 1. Orbit Mode: Smoothly lerp orbit target to cameraTarget
    if (cameraMode === 'orbit' && orbitRef.current) {
      orbitRef.current.target.lerp(
        new THREE.Vector3(...cameraTarget),
        delta * (settings.reducedMotion ? 2 : 4)
      );
      orbitRef.current.update();
    }

    // 2. First Person Mode: Move camera inside room bounds
    if (cameraMode === 'firstPerson') {
      const speed = (settings.reducedMotion ? 2.0 : 3.5) * delta;
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(camera.up, forward).normalize();

      let moveX = 0;
      let moveZ = 0;

      if (keysDown.current['w'] || keysDown.current['arrowup']) {
        moveX += forward.x * speed;
        moveZ += forward.z * speed;
      }
      if (keysDown.current['s'] || keysDown.current['arrowdown']) {
        moveX -= forward.x * speed;
        moveZ -= forward.z * speed;
      }
      if (keysDown.current['a'] || keysDown.current['arrowleft']) {
        moveX += right.x * speed;
        moveZ += right.z * speed;
      }
      if (keysDown.current['d'] || keysDown.current['arrowright']) {
        moveX -= right.x * speed;
        moveZ -= right.z * speed;
      }

      // Constrain inside diorama bounds
      camera.position.x = THREE.MathUtils.clamp(camera.position.x + moveX, -2.4, 2.4);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + moveZ, -2.4, 2.4);
      camera.position.y = 1.6; // Kid standing eye height
    }
  });

  return (
    <>
      {cameraMode === 'orbit' ? (
        <OrbitControls
          ref={orbitRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={3.5}
          maxDistance={9.5}
          maxPolarAngle={Math.PI / 2 - 0.05} // Never dip below floor
          minPolarAngle={Math.PI / 6}
          maxAzimuthAngle={Math.PI * 0.45}
          minAzimuthAngle={-Math.PI * 0.45}
        />
      ) : (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minPolarAngle={Math.PI / 4}
        />
      )}
    </>
  );
};
