// ==========================================================================
// ESCAPE ROOM KIDS — MASTER 3D CANVAS SCENE
// Canvas container with lighting, shadows, room dioramas, and hotspots
// ==========================================================================

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { DioramaBase } from './DioramaBase';
import { WorkshopRoom } from '../rooms/WorkshopRoom';
import { LibraryRoom } from '../rooms/LibraryRoom';
import { GreenhouseRoom } from '../rooms/GreenhouseRoom';
import { InteractiveHotspot } from './InteractiveHotspot';
import { CameraController } from './CameraController';
import { useGameStore } from '../../state/gameStore';
import { ROOMS_DATA } from '../roomsData';

export const GameScene: React.FC = () => {
  const {
    activeRoomId,
    solvedPuzzles,
    highlightedHotspotId,
  } = useGameStore();

  const currentRoom = ROOMS_DATA.find((r) => r.id === activeRoomId) || ROOMS_DATA[0];
  const roomSolvedList = solvedPuzzles[activeRoomId] || [];

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Canvas
        shadows
        camera={{ position: [0, 3.8, 6.8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#1e1b2e' }}
      >
        <Suspense fallback={null}>
          {/* Ambient Warm Lighting */}
          <ambientLight intensity={0.7} color="#FFFBEB" />

          {/* Main Directional Sun Light (Shadows) */}
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            color="#FEF3C7"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.5}
            shadow-camera-far={20}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
            shadow-bias={-0.0001}
          />

          {/* Soft Fill Light from opposite side */}
          <directionalLight
            position={[-4, 4, -3]}
            intensity={0.4}
            color="#E0E7FF"
          />

          {/* Cutaway Diorama Base */}
          <DioramaBase
            floorColor={currentRoom.floorColor}
            wallColor={currentRoom.wallColor}
            accentColor={currentRoom.accentColor}
          />

          {/* Active Thematic Room Diorama */}
          {activeRoomId === 'workshop' && <WorkshopRoom />}
          {activeRoomId === 'library' && <LibraryRoom />}
          {activeRoomId === 'greenhouse' && <GreenhouseRoom />}

          {/* Hotspots for Active Room */}
          {currentRoom.hotspots.map((hotspot) => {
            const isSolved = hotspot.puzzleId ? roomSolvedList.includes(hotspot.puzzleId) : false;
            const isHighlighted = highlightedHotspotId === hotspot.id;

            return (
              <InteractiveHotspot
                key={hotspot.id}
                hotspot={hotspot}
                isSolved={isSolved}
                isHighlighted={isHighlighted}
              />
            );
          })}

          {/* Dual Camera Controller */}
          <CameraController />
        </Suspense>
      </Canvas>
    </div>
  );
};
