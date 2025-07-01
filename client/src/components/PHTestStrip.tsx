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
  const { testStripInLiquid, grabTestStrip } = useChemistryLab();
  
  const stripColor = phValue >= 0 ? getPHColor(phValue) : "#ffffff";
  
  useFrame((state) => {
    if (isSelected && meshRef.current) {
      // Follow cursor/controller when selected
      const mouse = state.mouse;
      meshRef.current.position.x = position[0] + mouse.x * 2;
      meshRef.current.position.y = position[1] + mouse.y * 2;
      meshRef.current.position.z = position[2] + 0.5;
    }
  });

  const handleClick = () => {
    if (!isSelected) {
      grabTestStrip(stripId);
    }
  };

  return (
    <group position={isSelected ? [0, 0, 0] : position} rotation={rotation}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onClick={handleClick}
        castShadow
        scale={isHovered || isSelected ? 1.1 : 1}
      >
        {/* Strip handle */}
        <boxGeometry args={[0.02, 0.3, 0.005]} />
        <meshStandardMaterial 
          color={isSelected ? "#ffff00" : "#f0f0f0"} 
          emissive={isSelected ? "#444400" : "#000000"}
        />
      </mesh>
      
      {/* Test area of strip */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.025, 0.06, 0.006]} />
        <meshStandardMaterial 
          color={stripColor}
          emissive={phValue >= 0 ? new THREE.Color(stripColor).multiplyScalar(0.1) : "#000000"}
        />
      </mesh>
      
      {/* Highlight when selected */}
      {isSelected && (
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[0.04, 0.32, 0.007]} />
          <meshStandardMaterial 
            color="#ffff00" 
            transparent 
            opacity={0.3}
            emissive="#444400"
          />
        </mesh>
      )}
    </group>
  );
}
