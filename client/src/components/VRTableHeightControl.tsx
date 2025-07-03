import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';
import { useChemistryLab } from '../lib/stores/useChemistryLab';

export function VRTableHeightControl() {
  const { session } = useXR();
  const { vrTableHeight, setVrTableHeight } = useChemistryLab();
  const ballRef = useRef<THREE.Mesh>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastControllerY, setLastControllerY] = useState(0);
  
  // Only show in VR
  if (!session) return null;

  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    setIsSelected(true);
    setIsDragging(true);
    setLastControllerY(event.point.y);
    console.log('Grabbed height control ball');
  };

  const handlePointerUp = (event: any) => {
    event.stopPropagation();
    setIsSelected(false);
    setIsDragging(false);
    console.log('Released height control ball');
  };

  const handlePointerMove = (event: any) => {
    if (!isDragging) return;
    event.stopPropagation();
    
    const deltaY = event.point.y - lastControllerY;
    const newHeight = THREE.MathUtils.clamp(vrTableHeight + deltaY, -1.5, 2);
    setVrTableHeight(newHeight);
    setLastControllerY(event.point.y);
  };

  useFrame(() => {
    if (!ballRef.current) return;
    
    // Update ball position based on vrTableHeight
    ballRef.current.position.y = 1.2 + vrTableHeight;
    
    // Gentle floating animation when not grabbed
    if (!isDragging) {
      const time = Date.now() * 0.002;
      ballRef.current.position.y += Math.sin(time) * 0.02;
    }
  });

  return (
    <mesh 
      ref={ballRef}
      position={[0.5, 1.2 + vrTableHeight, -0.8]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      userData={{ type: 'heightControl', interactive: true }}
    >
      <sphereGeometry args={[0.08]} />
      <meshStandardMaterial 
        color={isSelected ? "#ff6666" : "#ff0000"}
        emissive={isSelected ? "#440000" : "#220000"}
        roughness={0.3}
        metalness={0.1}
      />
      
      {/* Visual feedback ring when not being dragged */}
      {!isDragging && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.10]} />
          <meshBasicMaterial 
            color="#ff0000" 
            transparent 
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </mesh>
  );
}