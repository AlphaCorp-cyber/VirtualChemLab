import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import { PHTestStrip } from "./PHTestStrip";
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

// Enhanced beaker with better visibility and pH indicator support
function Beaker({ position, liquidColor, phValue, id }: {
  position: [number, number, number];
  liquidColor: string;
  phValue: number;
  id: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasIndicator, setHasIndicator] = useState(false);
  const [isPouring, setIsPouring] = useState(false);
  const { testStripInLiquid, selectedStripId } = useChemistryLab();
  
  const handleClick = () => {
    if (selectedStripId && selectedStripId.includes('indicator')) {
      // Pour pH indicator into the beaker with animation
      setIsPouring(true);
      setTimeout(() => {
        setHasIndicator(true);
        setIsPouring(false);
        testStripInLiquid(selectedStripId, id);
        console.log(`pH indicator poured into ${id}`);
      }, 1000);
    }
  };
  
  return (
    <group position={position}>
      {/* Beaker base - more opaque */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.3, 0.25, 0.1, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      
      {/* Beaker walls - more visible */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onClick={handleClick}
        castShadow
      >
        <cylinderGeometry args={[0.3, 0.25, 0.4, 16]} />
        <meshPhysicalMaterial
          color={isHovered ? "#ffffff" : "#f8f8f8"}
          transparent
          opacity={0.6}
          roughness={0.1}
          transmission={0.7}
          thickness={0.02}
        />
      </mesh>
      
      {/* Beaker rim */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.32, 0.3, 0.02, 16]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Liquid inside - larger and more visible */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.28, 0.23, 0.24, 16]} />
        <meshStandardMaterial 
          color={hasIndicator ? liquidColor : "#87CEEB"} 
          transparent 
          opacity={hasIndicator ? 0.9 : 0.7}
          emissive={hasIndicator ? new THREE.Color(liquidColor).multiplyScalar(0.1) : "#000000"}
        />
      </mesh>
      
      {/* pH label background */}
      <mesh position={[0, 0.35, 0]}>
        <planeGeometry args={[0.4, 0.1]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      
      {/* pH label */}
      <Text
        position={[0, 0.35, 0.01]}
        fontSize={0.08}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        pH: {hasIndicator ? phValue.toFixed(1) : '?'}
      </Text>
      
      {/* Solution name */}
      <Text
        position={[0, 0.25, 0.01]}
        fontSize={0.05}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        {hasIndicator ? 'With Indicator' : 'Unknown Solution'}
      </Text>
      
      {/* Pouring effect */}
      {isPouring && (
        <group position={[0, 0.5, 0]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.01, 0.3, 8]} />
            <meshStandardMaterial color="#ff6b6b" transparent opacity={0.8} />
          </mesh>
          <Text
            position={[0.3, 0, 0]}
            fontSize={0.06}
            color="red"
            anchorX="center"
          >
            Pouring...
          </Text>
        </group>
      )}
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
      <group position={[2, 1.3, -0.5]}>
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
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>
      
      {/* pH indicator bottles */}
      <group position={[-1.5, 1.6, 0.8]}>
        <mesh 
          castShadow
          onClick={() => grabTestStrip('indicator-1')}
          onPointerEnter={() => {}}
          onPointerLeave={() => {}}
        >
          <cylinderGeometry args={[0.08, 0.06, 0.25, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.05}
          color="black"
          anchorX="center"
        >
          pH Indicator
        </Text>
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
      <group position={[-2.5, 1.4, -0.5]}>
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
