// ==========================================================================
// ESCAPE ROOM KIDS — 3D DIORAMA BASE
// Stylized cutaway diorama stage with soft lighting, beveled walls and floor
// ==========================================================================

import React from 'react';

interface DioramaBaseProps {
  floorColor: string;
  wallColor: string;
  accentColor: string;
}

export const DioramaBase: React.FC<DioramaBaseProps> = ({
  floorColor,
  wallColor,
  accentColor,
}) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Diorama Floor */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[6.4, 0.2, 6.4]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Decorative Floor Base Plinth */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[6.7, 0.2, 6.7]} />
        <meshStandardMaterial color="#0F172A" roughness={0.8} />
      </mesh>

      {/* Back Wall (Cutaway diorama height) */}
      <mesh position={[0, 1.8, -3.1]} receiveShadow>
        <boxGeometry args={[6.4, 3.6, 0.2]} />
        <meshStandardMaterial
          color={wallColor}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-3.1, 1.8, 0]} receiveShadow>
        <boxGeometry args={[0.2, 3.6, 6.4]} />
        <meshStandardMaterial
          color={wallColor}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* Wall Trims / Crown Moldings */}
      <mesh position={[0, 3.6, -3.1]}>
        <boxGeometry args={[6.5, 0.15, 0.25]} />
        <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[-3.1, 3.6, 0]}>
        <boxGeometry args={[0.25, 0.15, 6.5]} />
        <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Baseboard Moldings */}
      <mesh position={[0, 0.1, -3.0]}>
        <boxGeometry args={[6.4, 0.2, 0.1]} />
        <meshStandardMaterial color={accentColor} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[-3.0, 0.1, 0]}>
        <boxGeometry args={[0.1, 0.2, 6.4]} />
        <meshStandardMaterial color={accentColor} roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  );
};
