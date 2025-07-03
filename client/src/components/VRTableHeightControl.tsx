import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';
import { useChemistryLab } from '../lib/stores/useChemistryLab';

export function VRTableHeightControl() {
  const { session } = useXR();
  const { vrTableHeight, setVrTableHeight } = useChemistryLab();
  const ballRef = useRef<THREE.Mesh>(null);
  
  // Only show in VR
  if (!session) return null;

  useFrame(() => {
    if (!ballRef.current) return;
    
    // Simple floating animation
    const time = Date.now() * 0.003;
    ballRef.current.position.y = 1.2 + vrTableHeight + Math.sin(time) * 0.03;
  });

  const handleClick = () => {
    // Simple click to cycle through height levels
    const heights = [-1, -0.5, 0, 0.5, 1, 1.5];
    const currentIndex = heights.findIndex(h => Math.abs(h - vrTableHeight) < 0.1);
    const nextIndex = (currentIndex + 1) % heights.length;
    setVrTableHeight(heights[nextIndex]);
    console.log(`Table height set to: ${heights[nextIndex]}m`);
  };

  return (
    <mesh 
      ref={ballRef}
      position={[0.5, 1.2 + vrTableHeight, -0.8]}
      onClick={handleClick}
      userData={{ type: 'heightControl', interactive: true }}
    >
      <sphereGeometry args={[0.08]} />
      <meshStandardMaterial 
        color="#ff0000"
        emissive="#220000"
        roughness={0.3}
        metalness={0.1}
      />
      
      {/* Simple visual ring */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.10]} />
        <meshBasicMaterial 
          color="#ff0000" 
          transparent 
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </mesh>
  );
}