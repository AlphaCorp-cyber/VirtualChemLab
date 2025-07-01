import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import { PHTestStrip } from "./PHTestStrip";
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

// Simple beaker component since GLTF models are placeholders
function Beaker({ position, liquidColor, phValue, id }: {
  position: [number, number, number];
  liquidColor: string;
  phValue: number;
  id: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <group position={position}>
      {/* Beaker glass */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        castShadow
      >
        <cylinderGeometry args={[0.3, 0.25, 0.4, 8]} />
        <meshPhysicalMaterial
          color={isHovered ? "#ffffff" : "#f0f0f0"}
          transparent
          opacity={0.3}
          roughness={0.1}
          transmission={0.9}
        />
      </mesh>
      
      {/* Liquid inside */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.28, 0.23, 0.2, 8]} />
        <meshStandardMaterial color={liquidColor} transparent opacity={0.8} />
      </mesh>
      
      {/* pH label */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.1}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        pH: {phValue.toFixed(1)}
      </Text>
    </group>
  );
}

function TestTube({ position, isEmpty = false }: {
  position: [number, number, number];
  isEmpty?: boolean;
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.04, 0.3, 8]} />
        <meshPhysicalMaterial
          color="#f0f0f0"
          transparent
          opacity={0.3}
          roughness={0.1}
          transmission={0.9}
        />
      </mesh>
      
      {!isEmpty && (
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.045, 0.035, 0.1, 8]} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

export function LabEquipment() {
  const { beakers, testStrips, grabTestStrip, releaseTestStrip, selectedStripId } = useChemistryLab();
  const [subscribe, getState] = useKeyboardControls();
  
  useFrame(() => {
    const controls = getState();
    
    if (controls.grab && !selectedStripId) {
      // Find nearest test strip and grab it
      grabTestStrip("strip-1");
    }
    
    if (controls.release && selectedStripId) {
      releaseTestStrip();
    }
  });

  return (
    <>
      {/* Beakers with different pH solutions */}
      {beakers.map((beaker) => (
        <Beaker
          key={beaker.id}
          position={beaker.position}
          liquidColor={beaker.liquidColor}
          phValue={beaker.phValue}
          id={beaker.id}
        />
      ))}
      
      {/* Test tubes rack */}
      <group position={[2, 1, -0.5]}>
        {Array.from({ length: 5 }, (_, i) => (
          <TestTube
            key={i}
            position={[i * 0.15 - 0.3, 0, 0]}
            isEmpty={i > 2}
          />
        ))}
        
        {/* Rack base */}
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.2]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      </group>
      
      {/* pH Test strips */}
      {testStrips.map((strip) => (
        <PHTestStrip
          key={strip.id}
          position={strip.position}
          rotation={strip.rotation}
          phValue={strip.phValue}
          isSelected={strip.id === selectedStripId}
          stripId={strip.id}
        />
      ))}
      
      {/* pH color chart on wall */}
      <group position={[0, 2, -2.9]}>
        <mesh>
          <planeGeometry args={[2, 0.5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        <Text
          position={[0, 0.15, 0.01]}
          fontSize={0.08}
          color="black"
          anchorX="center"
        >
          pH Scale
        </Text>
        
        {/* pH color scale */}
        {Array.from({ length: 14 }, (_, i) => (
          <group key={i} position={[-0.9 + i * 0.13, -0.1, 0.01]}>
            <mesh>
              <planeGeometry args={[0.1, 0.2]} />
              <meshStandardMaterial 
                color={i < 7 ? `hsl(${i * 8}, 70%, 50%)` : i === 7 ? '#00ff00' : `hsl(${240 - (i - 7) * 20}, 70%, 50%)`} 
              />
            </mesh>
            <Text
              position={[0, -0.15, 0]}
              fontSize={0.04}
              color="black"
              anchorX="center"
            >
              {i}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Laboratory equipment box */}
      <group position={[-2.5, 1.1, -0.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.3, 0.3]} />
          <meshStandardMaterial color="#ff4500" />
        </mesh>
        
        <Text
          position={[0, 0, 0.16]}
          fontSize={0.06}
          color="white"
          anchorX="center"
        >
          CaCO₃
        </Text>
      </group>
    </>
  );
}
