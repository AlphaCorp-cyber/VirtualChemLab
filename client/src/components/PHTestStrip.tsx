import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { getPHColor } from "../lib/phChemistry";
import * as THREE from "three";

interface PHTestStripProps {
  position: [number, number, number];
  rotation: [number, number, number];
  phValue: number;
  isSelected: boolean;
  stripId: string;
}

export function PHTestStrip({ 
  position, 
  rotation, 
  phValue, 
  isSelected, 
  stripId 
}: PHTestStripProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [handNearby, setHandNearby] = useState(false);
  const { testStripInLiquid, grabTestStrip } = useChemistryLab();
  
  const stripColor = phValue >= 0 ? getPHColor(phValue) : "#ffffff";
  
  useFrame((state) => {
    if (isSelected && meshRef.current) {
      // Enhanced VR hand following - smoother movement
      const mouse = state.mouse;
      const targetX = position[0] + mouse.x * 1.5;
      const targetY = position[1] + mouse.y * 1.5 + 0.2; // Slightly elevated when held
      const targetZ = position[2] + 0.3;
      
      // Smooth interpolation for natural hand movement
      meshRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.1);
      
      // Add gentle floating animation
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.01;
    }
  });

  const handleClick = () => {
    if (!isSelected) {
      grabTestStrip(stripId);
    }
  };

  return (
    <group position={isSelected ? [0, 0, 0] : position} rotation={rotation}>
      {/* Green bottle container for pH indicator */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onClick={handleClick}
        castShadow
        scale={isHovered || isSelected ? 1.1 : 1}
      >
        {/* Bottle body */}
        <cylinderGeometry args={[0.04, 0.05, 0.15, 8]} />
        <meshStandardMaterial 
          color={isSelected ? "#66ff66" : "#228B22"} 
          emissive={isSelected ? "#004400" : "#000000"}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Bottle neck */}
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.06, 8]} />
        <meshStandardMaterial 
          color={isSelected ? "#66ff66" : "#228B22"} 
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Bottle cap */}
      <mesh position={[0, 0.135, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.03, 8]} />
        <meshStandardMaterial 
          color="#333333"
        />
      </mesh>
      
      {/* pH indicator liquid inside bottle */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.12, 8]} />
        <meshStandardMaterial 
          color={stripColor}
          emissive={phValue >= 0 ? new THREE.Color(stripColor).multiplyScalar(0.1) : "#000000"}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Bottle label */}
      <mesh position={[0, 0.02, 0.051]}>
        <planeGeometry args={[0.06, 0.08]} />
        <meshStandardMaterial 
          color="#ffffff"
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Label text area */}
      <mesh position={[0, 0.02, 0.052]}>
        <planeGeometry args={[0.05, 0.06]} />
        <meshStandardMaterial 
          color="#f0f0f0"
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* VR Hand Proximity Indicator */}
      {false && handNearby && !isSelected && (
        <mesh position={[0, 0, 0.02]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial 
            color="#00FFFF" 
            transparent 
            opacity={0.3}
            emissive="#00FFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
      )}
      
      {/* Highlight when selected */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.07, 0.18, 8]} />
          <meshStandardMaterial 
            color="#ffff00" 
            transparent 
            opacity={0.2}
            emissive="#444400"
          />
        </mesh>
      )}
    </group>
  );
}
