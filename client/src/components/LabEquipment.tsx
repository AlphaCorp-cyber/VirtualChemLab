import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import { PHTestStrip } from "./PHTestStrip";
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useKeyboardControls } from "@react-three/drei";
import { getPHColor } from "../lib/phChemistry";
import * as THREE from "three";

// Enhanced beaker with better visibility and pH indicator support
function Beaker({ position, liquidColor, phValue, id, solutionName }: {
  position: [number, number, number];
  liquidColor: string;
  phValue: number;
  id: string;
  solutionName: string;
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
      console.log(`Pouring pH indicator into ${solutionName} (${id})`);
      setTimeout(() => {
        setHasIndicator(true);
        setIsPouring(false);
        testStripInLiquid(selectedStripId, id);
        console.log(`✓ pH Test Complete: ${solutionName} = pH ${phValue.toFixed(1)} (${getPHColor(phValue)})`);
      }, 1500);
    }
  };

  const handleHover = (e: any, isEntering: boolean) => {
    if (selectedStripId && selectedStripId.includes('indicator')) {
      if (isEntering) {
        e.object.scale.setScalar(1.05);
        document.body.style.cursor = 'pointer';
      } else {
        e.object.scale.setScalar(1.0);
        document.body.style.cursor = 'default';
      }
    }
  };
  
  return (
    <group position={position}>
      {/* Beaker base - flat bottom like real beakers */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.02, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.15}
          roughness={0.05}
          transmission={0.95}
          thickness={0.5}
          ior={1.5}
        />
      </mesh>
      
      {/* Beaker walls - crystal clear with proper glass material */}
      <mesh
        ref={meshRef}
        onPointerEnter={(e) => {
          setIsHovered(true);
          handleHover(e, true);
        }}
        onPointerLeave={(e) => {
          setIsHovered(false);
          handleHover(e, false);
        }}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.28, 0.28, 0.36, 32]} />
        <meshPhysicalMaterial
          color="#e8f4f8"
          transparent
          opacity={0.25}
          roughness={0.1}
          transmission={0.85}
          thickness={0.3}
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={0.95}
        />
      </mesh>
      
      {/* Beaker edge wireframe for visibility */}
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, 0.36, 32]} />
        <meshBasicMaterial color="#4a90e2" wireframe opacity={0.15} transparent />
      </mesh>
      
      {/* Beaker spout - characteristic beaker feature */}
      <mesh position={[0.32, 0.15, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.02, 0.04, 0.08, 8]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          roughness={0.02}
          transmission={0.95}
          thickness={0.5}
          ior={1.52}
        />
      </mesh>
      
      {/* Beaker rim - thicker like real beakers */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.3, 0.28, 0.02, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.2}
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
          ior={1.52}
        />
      </mesh>

      {/* Volume markings on beaker - like real lab equipment */}
      {[50, 100, 150].map((volume, i) => (
        <group key={volume} position={[0.29, 0.05 - i * 0.08, 0]}>
          <mesh>
            <boxGeometry args={[0.02, 0.002, 0.08]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          <Text
            position={[0.05, 0, 0]}
            fontSize={0.02}
            color="#666666"
            anchorX="left"
            anchorY="middle"
          >
            {volume}ml
          </Text>
        </group>
      ))}
      
      {/* Current volume indicator */}
      <Text
        position={[0.35, 0.14, 0]}
        fontSize={0.025}
        color="#2c3e50"
        anchorX="left"
        anchorY="middle"
      >
        ~120ml
      </Text>
      
      {/* Liquid inside - half-filled with colorless solution */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.26, 0.22, 0.18, 16]} />
        <meshStandardMaterial 
          color={hasIndicator ? getPHColor(phValue) : "#E6F3FF"} 
          transparent 
          opacity={hasIndicator ? 0.9 : 0.6}
          emissive={hasIndicator ? new THREE.Color(getPHColor(phValue)).multiplyScalar(0.3) : "#E6F3FF"}
          emissiveIntensity={hasIndicator ? 0.4 : 0.1}
          roughness={0.1}
          metalness={0.05}
        />
      </mesh>
      
      {/* Liquid surface with realistic water properties */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.01, 16]} />
        <meshStandardMaterial 
          color={hasIndicator ? getPHColor(phValue) : "#F0F8FF"} 
          transparent 
          opacity={hasIndicator ? 0.8 : 0.7}
          emissive={hasIndicator ? new THREE.Color(getPHColor(phValue)).multiplyScalar(0.2) : "#F0F8FF"}
          emissiveIntensity={hasIndicator ? 0.3 : 0.05}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>

      {/* Subtle reflection rings to show liquid presence */}
      {!hasIndicator && (
        <>
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.005, 16]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              transparent 
              opacity={0.3}
              emissive="#FFFFFF"
              emissiveIntensity={0.1}
            />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.005, 16]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              transparent 
              opacity={0.2}
              emissive="#FFFFFF"
              emissiveIntensity={0.05}
            />
          </mesh>
        </>
      )}
      
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
        fontSize={0.045}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        {solutionName}
      </Text>

      {/* pH classification */}
      <Text
        position={[0, 0.18, 0.01]}
        fontSize={0.03}
        color={phValue < 7 ? "#e74c3c" : phValue > 7 ? "#3498db" : "#27ae60"}
        anchorX="center"
        anchorY="middle"
      >
        {phValue < 7 ? "ACIDIC" : phValue > 7 ? "BASIC" : "NEUTRAL"}
      </Text>
      
      {/* Indicator status */}
      {hasIndicator && (
        <Text
          position={[0, 0.15, 0.01]}
          fontSize={0.035}
          color="#00aa00"
          anchorX="center"
          anchorY="middle"
        >
          + pH Indicator
        </Text>
      )}
      
      {/* Pouring effect */}
      {isPouring && (
        <group position={[0, 0.5, 0]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.01, 0.3, 8]} />
            <meshStandardMaterial color="#32FF32" transparent opacity={0.8} emissive="#32FF32" emissiveIntensity={0.2} />
          </mesh>
          <Text
            position={[0.3, 0, 0]}
            fontSize={0.06}
            color="#32FF32"
            anchorX="center"
          >
            Adding Indicator...
          </Text>
        </group>
      )}

      {/* Glowing effect when indicator is active */}
      {hasIndicator && (
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.28, 0.24, 0.24, 16]} />
          <meshStandardMaterial 
            color={getPHColor(phValue)} 
            transparent 
            opacity={0.3}
            emissive={getPHColor(phValue)}
            emissiveIntensity={0.6}
          />
        </mesh>
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
      {/* Test tube main body - proper cylindrical shape */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.32, 16]} />
        <meshPhysicalMaterial
          color="#e8f4f8"
          transparent
          opacity={0.22}
          roughness={0.1}
          transmission={0.85}
          thickness={0.3}
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={0.95}
        />
      </mesh>
      
      {/* Test tube rounded bottom */}
      <mesh position={[0, -0.16, 0]} castShadow>
        <sphereGeometry args={[0.04, 16, 8]} />
        <meshPhysicalMaterial
          color="#e8f4f8"
          transparent
          opacity={0.22}
          roughness={0.1}
          transmission={0.85}
          thickness={0.3}
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={0.95}
        />
      </mesh>
      
      {/* Test tube wireframe for visibility */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.32, 16]} />
        <meshBasicMaterial color="#4a90e2" wireframe opacity={0.12} transparent />
      </mesh>
      
      {/* Test tube rim */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.045, 0.04, 0.01, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          roughness={0.05}
          transmission={0.95}
          thickness={0.5}
          ior={1.52}
        />
      </mesh>
      
      {!isEmpty && (
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.12, 16]} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.8} />
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
          solutionName={beaker.solutionName}
        />
      ))}
      
      {/* Wooden test tubes rack - properly positioned on table */}
      <group position={[2, 1.46, -0.5]}>
        {Array.from({ length: 5 }, (_, i) => (
          <TestTube
            key={i}
            position={[i * 0.15 - 0.3, 0.22, 0]}
            isEmpty={i > 2}
          />
        ))}
        
        {/* Wooden rack base */}
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.04, 0.25]} />
          <meshStandardMaterial 
            color="#8B4513" 
            roughness={0.8}
          />
        </mesh>
        
        {/* Wooden rack front panel */}
        <mesh position={[0, 0.08, 0.1]} castShadow>
          <boxGeometry args={[0.8, 0.12, 0.02]} />
          <meshStandardMaterial 
            color="#A0522D" 
            roughness={0.8}
          />
        </mesh>
        
        {/* Wooden rack back panel */}
        <mesh position={[0, 0.08, -0.1]} castShadow>
          <boxGeometry args={[0.8, 0.12, 0.02]} />
          <meshStandardMaterial 
            color="#A0522D" 
            roughness={0.8}
          />
        </mesh>
        
        {/* Test tube holes in wood */}
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={`hole-${i}`} position={[i * 0.15 - 0.3, 0.04, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.05, 16]} />
            <meshStandardMaterial 
              color="#654321" 
              roughness={0.9}
            />
          </mesh>
        ))}
        
        {/* Wood grain details */}
        <mesh position={[0, 0.02, 0]} rotation={[Math.PI/2, 0, 0]}>
          <planeGeometry args={[0.75, 0.2]} />
          <meshStandardMaterial 
            color="#6B3410" 
            transparent 
            opacity={0.3}
            roughness={0.9}
          />
        </mesh>
      </group>
      
      {/* Bottle holder stand */}
      <group position={[-1.5, 1.46, 0.8]}>
        {/* Stand platform */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
          <meshPhysicalMaterial 
            color="#2c3e50" 
            metalness={0.7} 
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* pH indicator bottles - professional lab bottle */}
      <group position={[-1.5, 1.505, 0.8]}>
        {/* Professional indicator bottle with better interaction */}
        <mesh 
          castShadow
          onClick={() => {
            grabTestStrip('indicator-1');
            console.log('Picked up pH indicator solution - ready to pour into beakers');
          }}
          onPointerEnter={(e) => {
            e.object.scale.setScalar(1.1);
            document.body.style.cursor = 'pointer';
          }}
          onPointerLeave={(e) => {
            e.object.scale.setScalar(1.0);
            document.body.style.cursor = 'default';
          }}
        >
          <cylinderGeometry args={[0.08, 0.06, 0.25, 8]} />
          <meshStandardMaterial 
            color="#32FF32" 
            transparent 
            opacity={0.9}
            emissive="#32FF32"
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        
        {/* Professional label */}
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[0.12, 0.15]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Cork stopper */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Label */}
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.05}
          color="black"
          anchorX="center"
        >
          pH Indicator
        </Text>
      </group>

      {/* Lab shelf for glassware */}
      <group position={[0.8, 1.46, 0.5]}>
        {/* Shelf base */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.04, 0.3]} />
          <meshPhysicalMaterial 
            color="#2c3e50" 
            metalness={0.7} 
            roughness={0.2}
          />
        </mesh>
        {/* Shelf support brackets */}
        <mesh position={[-0.35, -0.08, 0]} castShadow>
          <boxGeometry args={[0.05, 0.16, 0.15]} />
          <meshPhysicalMaterial color="#34495e" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.35, -0.08, 0]} castShadow>
          <boxGeometry args={[0.05, 0.16, 0.15]} />
          <meshPhysicalMaterial color="#34495e" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Erlenmeyer flasks - authentic lab equipment */}
      <group position={[0.8, 1.48, 0.5]}>
        {/* Flask 1 */}
        <group position={[-0.2, 0, 0]}>
          {/* Flask body - conical shape */}
          <mesh castShadow receiveShadow>
            <coneGeometry args={[0.15, 0.25, 16]} />
            <meshPhysicalMaterial
              color="#e8f4f8"
              transparent
              opacity={0.22}
              roughness={0.1}
              transmission={0.85}
              thickness={0.3}
              ior={1.52}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
              reflectivity={0.95}
            />
          </mesh>
          {/* Flask wireframe for visibility */}
          <mesh>
            <coneGeometry args={[0.15, 0.25, 16]} />
            <meshBasicMaterial color="#4a90e2" wireframe opacity={0.12} transparent />
          </mesh>
          {/* Flask neck */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.15, 16]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.05}
              roughness={0.02}
              transmission={0.98}
              thickness={0.5}
              ior={1.52}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
            />
          </mesh>
          {/* Flask rim */}
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.035, 0.03, 0.01, 16]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.1}
              roughness={0.05}
              transmission={0.95}
              thickness={0.5}
              ior={1.52}
            />
          </mesh>
          {/* Liquid inside */}
          <mesh position={[0, -0.08, 0]}>
            <coneGeometry args={[0.12, 0.15, 16]} />
            <meshStandardMaterial color="#90EE90" transparent opacity={0.7} />
          </mesh>
        </group>
        
        {/* Flask 2 */}
        <group position={[0.2, 0, 0]}>
          {/* Flask body */}
          <mesh castShadow receiveShadow>
            <coneGeometry args={[0.15, 0.25, 16]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.05}
              roughness={0.02}
              transmission={0.98}
              thickness={0.5}
              ior={1.52}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
            />
          </mesh>
          {/* Flask neck */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.15, 16]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.05}
              roughness={0.02}
              transmission={0.98}
              thickness={0.5}
              ior={1.52}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
            />
          </mesh>
          {/* Flask rim */}
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.035, 0.03, 0.01, 16]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.1}
              roughness={0.05}
              transmission={0.95}
              thickness={0.5}
              ior={1.52}
            />
          </mesh>
        </group>
      </group>
      
      {/* Lab stand for graduated cylinder */}
      <group position={[2.5, 1.46, 0.2]}>
        {/* Stand base */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
          <meshPhysicalMaterial 
            color="#2c3e50" 
            metalness={0.7} 
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Graduated cylinder - like in reference image */}
      <group position={[2.5, 1.68, 0.2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
          <meshPhysicalMaterial
            color="#e8f4f8"
            transparent
            opacity={0.22}
            roughness={0.1}
            transmission={0.85}
            thickness={0.3}
            ior={1.52}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            reflectivity={0.95}
          />
        </mesh>
        {/* Graduated cylinder wireframe for visibility */}
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
          <meshBasicMaterial color="#4a90e2" wireframe opacity={0.12} transparent />
        </mesh>
        {/* Graduated cylinder base */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.02, 16]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.1}
            roughness={0.05}
            transmission={0.95}
            thickness={0.5}
            ior={1.52}
          />
        </mesh>
        {/* Spout */}
        <mesh position={[0.08, 0.18, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.015, 0.02, 0.06, 8]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.1}
            roughness={0.02}
            transmission={0.95}
            thickness={0.5}
            ior={1.52}
          />
        </mesh>
        {/* Liquid inside */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.3, 16]} />
          <meshStandardMaterial color="#FFB6C1" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Test strip holder */}
      <group position={[-1.9, 1.46, 0.5]}>
        {/* Holder base */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.04, 0.2]} />
          <meshPhysicalMaterial 
            color="#2c3e50" 
            metalness={0.7} 
            roughness={0.2}
          />
        </mesh>
        {/* Holder slots */}
        {Array.from({ length: 3 }, (_, i) => (
          <mesh key={i} position={[i * 0.08 - 0.08, 0.05, 0]} castShadow>
            <boxGeometry args={[0.02, 0.06, 0.15]} />
            <meshPhysicalMaterial color="#34495e" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Laboratory safety equipment */}
      <group position={[-2.8, 1.5, 0.3]}>
        {/* Safety goggle holder */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.08, 8]} />
          <meshPhysicalMaterial color="#34495e" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Glove box */}
        <mesh position={[0.15, -0.05, 0]} castShadow>
          <boxGeometry args={[0.1, 0.08, 0.08]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <Text
          position={[0.15, -0.05, 0.05]}
          fontSize={0.02}
          color="blue"
          anchorX="center"
        >
          Gloves
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
      
      {/* Chemical storage cabinet */}
      <group position={[-2.5, 1.46, -0.5]}>
        {/* Cabinet base */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.1, 0.4]} />
          <meshPhysicalMaterial 
            color="#2c3e50" 
            metalness={0.6} 
            roughness={0.3}
          />
        </mesh>
        {/* Cabinet back panel */}
        <mesh position={[0, 0.15, -0.15]} castShadow>
          <boxGeometry args={[0.55, 0.3, 0.05]} />
          <meshPhysicalMaterial color="#34495e" metalness={0.5} roughness={0.4} />
        </mesh>
        
        {/* Chemical bottle on shelf */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.3, 0.2, 0.2]} />
          <meshStandardMaterial color="#ff4500" />
        </mesh>
        
        <Text
          position={[0, 0.1, 0.11]}
          fontSize={0.04}
          color="white"
          anchorX="center"
        >
          CaCO₃
        </Text>
        
        {/* Safety label */}
        <mesh position={[0.2, 0.05, 0.11]}>
          <planeGeometry args={[0.08, 0.08]} />
          <meshStandardMaterial color="#ffff00" />
        </mesh>
        <Text
          position={[0.2, 0.05, 0.12]}
          fontSize={0.02}
          color="black"
          anchorX="center"
        >
          ⚠
        </Text>
      </group>

      {/* Experiment labels on the lab table */}
      <group position={[-2.5, 1.49, -1.5]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.08}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Experiment 1: Common Lab Substances
        </Text>
      </group>

      <group position={[0.5, 1.49, -1.5]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.08}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Experiment 2: Acid/Base Strength
        </Text>
      </group>

      <group position={[3, 1.49, -0.5]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.08}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI/2, 0]}
        >
          Experiment 4: Salt Solutions
        </Text>
      </group>

      {/* pH Color Scale Chart on table */}
      <group position={[0, 1.48, -1.2]}>
        {/* Chart background */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[1.4, 0.3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* pH scale colors from 0-14 */}
        {Array.from({ length: 15 }, (_, i) => {
          const phColors = [
            "#FF0000", "#FF3300", "#FF6600", "#FF9900", "#FFCC00", "#FFFF00", "#CCFF00", // 0-6 (acidic)
            "#00FF00", // 7 (neutral) 
            "#00CCFF", "#0099FF", "#0066FF", "#0033FF", "#0000FF", "#3300FF", "#6600FF" // 8-14 (basic)
          ];
          return (
            <group key={i} position={[i * 0.09 - 0.63, 0, 0.01]}>
              {/* Color square */}
              <mesh>
                <planeGeometry args={[0.08, 0.1]} />
                <meshStandardMaterial color={phColors[i]} />
              </mesh>
              {/* pH number */}
              <Text
                position={[0, -0.08, 0.01]}
                fontSize={0.025}
                color="black"
                anchorX="center"
              >
                {i}
              </Text>
            </group>
          );
        })}
        
        {/* Chart title */}
        <Text
          position={[0, 0.18, 0.01]}
          fontSize={0.04}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          pH Color Scale Reference
        </Text>
        
        {/* Labels */}
        <Text
          position={[-0.5, -0.12, 0.01]}
          fontSize={0.025}
          color="red"
          anchorX="center"
        >
          ACIDIC
        </Text>
        <Text
          position={[0, -0.12, 0.01]}
          fontSize={0.025}
          color="green"
          anchorX="center"
        >
          NEUTRAL
        </Text>
        <Text
          position={[0.5, -0.12, 0.01]}
          fontSize={0.025}
          color="blue"
          anchorX="center"
        >
          BASIC
        </Text>
      </group>

      {/* Professional Lab Safety Equipment */}
      <group position={[-3.5, 1.46, 0]}>
        {/* Safety shower */}
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Shower head */}
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Pull handle */}
        <mesh position={[0.2, 1.8, 0]} castShadow>
          <boxGeometry args={[0.15, 0.05, 0.03]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
      </group>

      {/* Eye wash station */}
      <group position={[-3.2, 1.46, 1]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.3, 0.6, 0.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Eye wash nozzles */}
        <mesh position={[0, 0.5, 0.1]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.08, 0.5, 0.1]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Fire extinguisher */}
      <group position={[4, 1.55, -1.8]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>

      {/* First aid kit */}
      <group position={[3.8, 1.7, -1.8]}>
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.15, 0.08]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.04]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.01]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      </group>

      {/* Waste disposal containers */}
      <group position={[3.5, 1.46, 2.5]}>
        {/* Chemical waste */}
        <mesh position={[-0.2, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
          <meshStandardMaterial color="#ffff00" />
        </mesh>
        {/* Glass waste */}
        <mesh position={[0.2, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
          <meshStandardMaterial color="#0066cc" />
        </mesh>
      </group>

      {/* Laboratory notebook stand */}
      <group position={[1.5, 1.48, -1.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.02, 0.2]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.25, 0.002, 0.15]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* pH Testing Instructions Sign */}
      <group position={[0, 2.5, -2.8]}>
        <mesh>
          <planeGeometry args={[1.5, 0.8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <Text
          position={[0, 0.2, 0.01]}
          fontSize={0.08}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          pH Testing Instructions
        </Text>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.04}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          1. Click pH indicator bottle
        </Text>
        <Text
          position={[0, -0.1, 0.01]}
          fontSize={0.04}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          2. Click beaker to pour
        </Text>
        <Text
          position={[0, -0.2, 0.01]}
          fontSize={0.04}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          3. Observe color change
        </Text>
        <Text
          position={[0, -0.3, 0.01]}
          fontSize={0.04}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          4. Compare with pH scale
        </Text>
      </group>

    </>
  );
}
