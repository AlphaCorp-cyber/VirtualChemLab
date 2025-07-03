import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import { PHTestStrip } from "./PHTestStrip";
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useKeyboardControls } from "@react-three/drei";
import { getPHColor } from "../lib/phChemistry";
import * as THREE from "three";

// Ultra-realistic laboratory beaker with accurate proportions (250ml standard)
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

  // Real laboratory beaker dimensions (250ml standard)
  const beakerRadius = 0.075;  // 7.5cm diameter (realistic lab beaker)
  const beakerHeight = 0.12;   // 12cm height
  const wallThickness = 0.003;  // 3mm glass thickness
  const rimThickness = 0.005;   // 5mm rim thickness

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
        e.object.scale.setScalar(1.02);
        document.body.style.cursor = 'pointer';
      } else {
        e.object.scale.setScalar(1.0);
        document.body.style.cursor = 'default';
      }
    }
  };

  return (
    <group position={position}>
      {/* Beaker base - thick flat bottom like real laboratory beakers */}
      <mesh position={[0, -beakerHeight/2, 0]}>
        <cylinderGeometry args={[beakerRadius, beakerRadius, wallThickness * 3, 32]} />
        <meshPhysicalMaterial 
          color="#4682B4" 
          transparent 
          opacity={0.4}
          roughness={0.02}
          transmission={0.7}
          thickness={wallThickness * 2}
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          reflectivity={0.95}
        />
      </mesh>

      {/* Main beaker walls - realistic proportions */}
      <mesh
        ref={meshRef}
        name={`beaker-${id}`}
        userData={{
          type: 'beaker',
          beakerId: id,
          id: id,
          interactable: true,
          onInteract: handleClick
        }}
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
        <cylinderGeometry args={[beakerRadius, beakerRadius - wallThickness, beakerHeight, 64]} />
        <meshPhysicalMaterial
          color={hasIndicator ? getPHColor(phValue) : "#4682B4"}
          transparent
          opacity={hasIndicator ? 0.6 : 0.3}
          roughness={0.02}
          transmission={hasIndicator ? 0.4 : 0.8}
          thickness={wallThickness}
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          reflectivity={0.95}
          emissive={hasIndicator ? new THREE.Color(getPHColor(phValue)).multiplyScalar(0.2) : "#000000"}
          emissiveIntensity={hasIndicator ? 0.3 : 0}
        />
      </mesh>

      {/* Enhanced edge highlight for better glass visibility */}
      <mesh>
        <cylinderGeometry args={[beakerRadius + 0.002, beakerRadius + 0.002, beakerHeight, 64]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.4}
          emissive="#e3f2fd"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Top rim glow for enhanced visibility */}
      <mesh position={[0, beakerHeight/2, 0]}>
        <cylinderGeometry args={[beakerRadius + 0.005, beakerRadius + 0.005, 0.008, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.7}
          emissive="#ffffff"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Professional beaker rim - thick and sturdy with enhanced visibility */}
      <mesh position={[0, beakerHeight/2, 0]}>
        <cylinderGeometry args={[beakerRadius + rimThickness, beakerRadius, rimThickness * 2, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.8}
          roughness={0.1}
          transmission={0.3}
          thickness={rimThickness}
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          emissive="#ffffff"
          emissiveIntensity={0.2}
          reflectivity={0.9}
        />
      </mesh>

      {/* Additional rim highlight for better visibility */}
      <mesh position={[0, beakerHeight/2 + rimThickness, 0]}>
        <cylinderGeometry args={[beakerRadius + rimThickness + 0.002, beakerRadius + rimThickness + 0.002, 0.003, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.9}
          emissive="#ffffff"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Realistic laboratory spout */}
      <mesh position={[beakerRadius + 0.01, beakerHeight/2 - 0.01, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.008, 0.012, 0.025, 16]} />
        <meshPhysicalMaterial
          color="#4682B4"
          transparent
          opacity={0.4}
          roughness={0.02}
          transmission={0.7}
          thickness={wallThickness}
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
        />
      </mesh>

      {/* Spout lip */}
      <mesh position={[beakerRadius + 0.018, beakerHeight/2 + 0.005, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.013, 0.008, 0.003, 16]} />
        <meshPhysicalMaterial
          color="#4682B4"
          transparent
          opacity={0.4}
          roughness={0.02}
          transmission={0.7}
          thickness={wallThickness/2}
          ior={1.52}
        />
      </mesh>

      {/* Precise volume markings - major graduations (like real beakers) */}
      {[250, 200, 150, 100, 50].map((volume, i) => (
        <group key={volume} position={[beakerRadius + 0.002, (beakerHeight/2) - 0.01 - i * 0.025, 0]}>
          {/* Major graduation line */}
          <mesh>
            <boxGeometry args={[0.008, 0.0008, 0.003]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
          {/* Volume number */}
          <Text
            position={[0.015, 0, 0]}
            fontSize={0.008}
            color="#2c3e50"
            anchorX="left"
            anchorY="middle"
            rotation={[0, 0, 0]}
          >
            {volume}
          </Text>
        </group>
      ))}

      {/* Minor graduation marks */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={`minor-${i}`} position={[beakerRadius + 0.002, (beakerHeight/2) - 0.01 - i * 0.0125, 0]}>
          <boxGeometry args={[0.005, 0.0005, 0.002]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      ))}

      {/* ml unit label */}
      <Text
        position={[beakerRadius + 0.02, -beakerHeight/2 + 0.02, 0]}
        fontSize={0.006}
        color="#2c3e50"
        anchorX="left"
        anchorY="middle"
      >
        ml
      </Text>

      {/* Current volume indicator */}
      <Text
        position={[beakerRadius + 0.025, 0.01, 0]}
        fontSize={0.008}
        color="#34495e"
        anchorX="left"
        anchorY="middle"
      >
        ≈50ml
      </Text>

      {/* Blue liquid from 50ml to 100ml mark (50ml = halfway up beaker) */}
      <mesh position={[0, -beakerHeight/2 + 0.0375, 0]}>
        <cylinderGeometry args={[beakerRadius - wallThickness - 0.002, beakerRadius - wallThickness - 0.002, 0.025, 32]} />
        <meshStandardMaterial 
          color={hasIndicator ? getPHColor(phValue) : "#1E90FF"} 
          transparent 
          opacity={hasIndicator ? 0.9 : 0.85}
          emissive={hasIndicator ? new THREE.Color(getPHColor(phValue)).multiplyScalar(0.3) : "#1E90FF"}
          emissiveIntensity={hasIndicator ? 0.4 : 0.15}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Liquid surface with realistic meniscus at 100ml mark */}
      <mesh position={[0, -beakerHeight/2 + 0.05, 0]}>
        <cylinderGeometry args={[beakerRadius - wallThickness - 0.002, beakerRadius - wallThickness - 0.002, 0.002, 32]} />
        <meshStandardMaterial 
          color={hasIndicator ? getPHColor(phValue) : "#4169E1"} 
          transparent 
          opacity={hasIndicator ? 0.95 : 0.9}
          emissive={hasIndicator ? new THREE.Color(getPHColor(phValue)).multiplyScalar(0.2) : "#4169E1"}
          emissiveIntensity={hasIndicator ? 0.3 : 0.1}
          roughness={0.02}
          metalness={0.15}
        />
      </mesh>

      {/* Subtle light reflection on liquid surface */}
      {!hasIndicator && (
        <mesh position={[0, -beakerHeight/2 + 0.045, 0]}>
          <cylinderGeometry args={[beakerRadius - wallThickness - 0.01, beakerRadius - wallThickness - 0.01, 0.001, 16]} />
          <meshStandardMaterial 
            color="#87CEFA" 
            transparent 
            opacity={0.5}
            emissive="#87CEFA"
            emissiveIntensity={0.15}
          />
        </mesh>
      )}

      {/* pH label background - positioned above realistic beaker */}
      <mesh position={[0, beakerHeight + 0.08, 0]}>
        <planeGeometry args={[0.15, 0.04]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>

      {/* pH label */}
      <Text
        position={[0, beakerHeight + 0.08, 0.001]}
        fontSize={0.025}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        pH: {hasIndicator ? phValue.toFixed(1) : '?'}
      </Text>

      {/* Solution name */}
      <Text
        position={[0, beakerHeight + 0.05, 0.001]}
        fontSize={0.018}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        {solutionName}
      </Text>

      {/* pH classification */}
      <Text
        position={[0, beakerHeight + 0.025, 0.001]}
        fontSize={0.012}
        color={phValue < 7 ? "#e74c3c" : phValue > 7 ? "#3498db" : "#27ae60"}
        anchorX="center"
        anchorY="middle"
      >
        {phValue < 7 ? "ACIDIC" : phValue > 7 ? "BASIC" : "NEUTRAL"}
      </Text>

      {/* Indicator status */}
      {hasIndicator && (
        <Text
          position={[0, beakerHeight + 0.005, 0.001]}
          fontSize={0.014}
          color="#00aa00"
          anchorX="center"
          anchorY="middle"
        >
          + pH Indicator
        </Text>
      )}

      {/* Pouring effect - realistic scale */}
      {isPouring && (
        <group position={[0, beakerHeight + 0.15, 0]}>
          <mesh>
            <cylinderGeometry args={[0.003, 0.001, 0.08, 8]} />
            <meshStandardMaterial color="#32FF32" transparent opacity={0.8} emissive="#32FF32" emissiveIntensity={0.2} />
          </mesh>
          <Text
            position={[0.08, 0, 0]}
            fontSize={0.015}
            color="#32FF32"
            anchorX="center"
          >
            Adding Indicator...
          </Text>
        </group>
      )}

      {/* Glowing effect when indicator is active */}
      {hasIndicator && (
        <mesh position={[0, -beakerHeight/2 + 0.0375, 0]}>
          <cylinderGeometry args={[beakerRadius + 0.01, beakerRadius - 0.01, 0.025, 16]} />
          <meshStandardMaterial 
            color={getPHColor(phValue)} 
            transparent 
            opacity={0.2}
            emissive={getPHColor(phValue)}
            emissiveIntensity={0.4}
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
      {/* Test tube main body - enhanced for VR visibility */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.32, 16]} />
        <meshPhysicalMaterial
          color="#e8f4f8"
          transparent
          opacity={0.35}
          roughness={0.1}
          transmission={0.75}
          thickness={0.4}
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={0.95}
          emissive="#ffffff"
          emissiveIntensity={0.03}
        />
      </mesh>

      {/* Test tube rounded bottom - enhanced visibility */}
      <mesh position={[0, -0.16, 0]} castShadow>
        <sphereGeometry args={[0.04, 16, 8]} />
        <meshPhysicalMaterial
          color="#e8f4f8"
          transparent
          opacity={0.35}
          roughness={0.1}
          transmission={0.75}
          thickness={0.4}
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={0.95}
          emissive="#ffffff"
          emissiveIntensity={0.03}
        />
      </mesh>

      {/* Enhanced test tube wireframe for VR visibility */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.32, 16]} />
        <meshBasicMaterial color="#4a90e2" wireframe opacity={0.3} transparent />
      </mesh>

      {/* Test tube rim highlight for VR */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.005, 16]} />
        <meshBasicMaterial color="#ffffff" opacity={0.5} transparent />
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
          {/* Flask body - enhanced for VR visibility */}
          <mesh castShadow receiveShadow>
            <coneGeometry args={[0.15, 0.25, 16]} />
            <meshPhysicalMaterial
              color="#e8f4f8"
              transparent
              opacity={0.4}
              roughness={0.1}
              transmission={0.7}
              thickness={0.4}
              ior={1.52}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
              reflectivity={0.95}
              emissive="#ffffff"
              emissiveIntensity={0.04}
            />
          </mesh>
          {/* Enhanced flask wireframe for VR visibility */}
          <mesh>
            <coneGeometry args={[0.15, 0.25, 16]} />
            <meshBasicMaterial color="#4a90e2" wireframe opacity={0.35} transparent />
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
            opacity={0.4}
            roughness={0.1}
            transmission={0.7}
            thickness={0.4}
            ior={1.52}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            reflectivity={0.95}
            emissive="#ffffff"
            emissiveIntensity={0.04}
          />
        </mesh>
        {/* Enhanced graduated cylinder wireframe for VR visibility */}
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
          <meshBasicMaterial color="#4a90e2" wireframe opacity={0.4} transparent />
        </mesh>

        {/* Graduation marks for VR visibility */}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[0.065, 0.15 - i * 0.04, 0]}>
            <boxGeometry args={[0.01, 0.002, 0.02]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
        ))}
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
      <group position={[-2.5, 1.89, -1.5]}>
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

      <group position={[0.5, 1.89, -1.5]}>
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
        

        {/* pH scale colors from 0-14 */}
        

        

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