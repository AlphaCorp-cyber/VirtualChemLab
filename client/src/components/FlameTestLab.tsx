
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

// Bunsen Burner Component
function BunsenBurner({ position, isLit, onToggle }: {
  position: [number, number, number];
  isLit: boolean;
  onToggle: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <group position={position}>
      {/* Burner base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Burner tube */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial color="#34495e" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Gas control valve */}
      <mesh position={[0.06, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.03, 8]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      
      {/* Flame when lit */}
      {isLit && (
        <group position={[0, 0.22, 0]}>
          {/* Blue inner flame */}
          <mesh>
            <coneGeometry args={[0.015, 0.06, 8]} />
            <meshStandardMaterial 
              color="#0099ff" 
              emissive="#0099ff"
              emissiveIntensity={0.8}
              transparent
              opacity={0.8}
            />
          </mesh>
          
          {/* Outer flame */}
          <mesh>
            <coneGeometry args={[0.025, 0.08, 8]} />
            <meshStandardMaterial 
              color="#ff6600" 
              emissive="#ff6600"
              emissiveIntensity={0.6}
              transparent
              opacity={0.6}
            />
          </mesh>
          
          {/* Flame light */}
          <pointLight 
            position={[0, 0.03, 0]} 
            intensity={0.8} 
            color="#ff6600"
            distance={2}
            decay={2}
          />
        </group>
      )}
      
      {/* Interactive area */}
      <mesh
        position={[0, 0.1, 0]}
        onClick={onToggle}
        onPointerEnter={() => {
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setIsHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
        <meshStandardMaterial 
          color={isHovered ? "#3498db" : "transparent"}
          transparent
          opacity={isHovered ? 0.3 : 0}
        />
      </mesh>
      
      {/* Label */}
      <Text
        position={[0, -0.1, 0]}
        fontSize={0.04}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Bunsen Burner
      </Text>
      
      <Text
        position={[0, -0.15, 0]}
        fontSize={0.03}
        color={isLit ? "#27ae60" : "#e74c3c"}
        anchorX="center"
        anchorY="middle"
      >
        {isLit ? "LIT" : "OFF"}
      </Text>
    </group>
  );
}

// Wire Loop Component
function WireLoop({ position, isSelected, onSelect, onRelease }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  onRelease: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <group position={position}>
      {/* Handle */}
      <mesh castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.15, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      
      {/* Wire loop */}
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.02, 0.002, 8, 16]} />
        <meshStandardMaterial 
          color={isSelected ? "#FFD700" : "#C0C0C0"} 
          metalness={0.8} 
          roughness={0.2}
          emissive={isSelected ? "#FFD700" : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      
      {/* Interactive area */}
      <mesh
        onClick={isSelected ? onRelease : onSelect}
        onPointerEnter={() => {
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setIsHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <cylinderGeometry args={[0.03, 0.03, 0.18, 16]} />
        <meshStandardMaterial 
          color={isHovered ? "#3498db" : "transparent"}
          transparent
          opacity={isHovered ? 0.3 : 0}
        />
      </mesh>
      
      {/* Label */}
      <Text
        position={[0, -0.12, 0]}
        fontSize={0.03}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Nichrome Wire
      </Text>
      
      {isSelected && (
        <Text
          position={[0, -0.16, 0]}
          fontSize={0.025}
          color="#27ae60"
          anchorX="center"
          anchorY="middle"
        >
          SELECTED
        </Text>
      )}
    </group>
  );
}

// Metal Salt Sample Component
function MetalSaltSample({ salt, isSelected, onSelect, onFlameTest, wireLoopSelected, bunsenBurnerOn }: {
  salt: any;
  isSelected: boolean;
  onSelect: (saltId: string) => void;
  onFlameTest: (saltId: string) => void;
  wireLoopSelected: boolean;
  bunsenBurnerOn: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showFlame, setShowFlame] = useState(false);
  
  const handleClick = () => {
    if (wireLoopSelected && bunsenBurnerOn) {
      setShowFlame(true);
      onFlameTest(salt.id);
      setTimeout(() => setShowFlame(false), 3000);
    } else {
      onSelect(salt.id);
    }
  };
  
  return (
    <group position={salt.position}>
      {/* Sample container */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Salt powder */}
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.01, 16]} />
        <meshStandardMaterial 
          color={salt.flameColor} 
          transparent 
          opacity={0.7}
        />
      </mesh>
      
      {/* Flame effect when testing */}
      {showFlame && (
        <group position={[0, 0.1, 0]}>
          <mesh>
            <coneGeometry args={[0.02, 0.08, 8]} />
            <meshStandardMaterial 
              color={salt.flameColor}
              emissive={salt.flameColor}
              emissiveIntensity={1.0}
              transparent
              opacity={0.9}
            />
          </mesh>
          
          <pointLight 
            position={[0, 0.04, 0]} 
            intensity={1.5} 
            color={salt.flameColor}
            distance={1}
            decay={2}
          />
          
          <Text
            position={[0.1, 0.05, 0]}
            fontSize={0.025}
            color={salt.flameColor}
            anchorX="left"
            anchorY="middle"
          >
            {salt.flameColorName}
          </Text>
        </group>
      )}
      
      {/* Interactive area */}
      <mesh
        onClick={handleClick}
        onPointerEnter={() => {
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setIsHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
        <meshStandardMaterial 
          color={isHovered ? "#3498db" : "transparent"}
          transparent
          opacity={isHovered ? 0.3 : 0}
        />
      </mesh>
      
      {/* Labels */}
      <Text
        position={[0, 0.08, 0]}
        fontSize={0.025}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {salt.name}
      </Text>
      
      <Text
        position={[0, 0.05, 0]}
        fontSize={0.02}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        {salt.formula}
      </Text>
      
      <Text
        position={[0, 0.02, 0]}
        fontSize={0.018}
        color="#7f8c8d"
        anchorX="center"
        anchorY="middle"
      >
        Ion: {salt.ion}
      </Text>
      
      {isSelected && (
        <Text
          position={[0, -0.02, 0]}
          fontSize={0.02}
          color="#27ae60"
          anchorX="center"
          anchorY="middle"
        >
          SELECTED
        </Text>
      )}
    </group>
  );
}

export function FlameTestLab() {
  const { 
    metalSalts, 
    bunsenBurnerOn, 
    wireLoopSelected, 
    selectedSaltId,
    toggleBunsenBurner,
    selectWireLoop,
    releaseWireLoop,
    selectSalt,
    performFlameTest
  } = useChemistryLab();
  
  return (
    <group>
      {/* Enhanced lighting for flame visibility */}
      <ambientLight intensity={0.6} color="#f8f9fa" />
      <directionalLight
        position={[5, 8, 3]}
        intensity={1.2}
        color="#ffffff"
        castShadow
      />
      
      {/* Bunsen Burner */}
      <BunsenBurner 
        position={[1, 1.46, -0.5]}
        isLit={bunsenBurnerOn}
        onToggle={toggleBunsenBurner}
      />
      
      {/* Wire Loop */}
      <WireLoop 
        position={[0.5, 1.58, -0.5]}
        isSelected={wireLoopSelected}
        onSelect={selectWireLoop}
        onRelease={releaseWireLoop}
      />
      
      {/* Metal Salt Samples */}
      {metalSalts.map((salt) => (
        <MetalSaltSample
          key={salt.id}
          salt={salt}
          isSelected={salt.id === selectedSaltId}
          onSelect={selectSalt}
          onFlameTest={performFlameTest}
          wireLoopSelected={wireLoopSelected}
          bunsenBurnerOn={bunsenBurnerOn}
        />
      ))}
      
      {/* Experiment Instructions */}
      <group position={[0, 2.5, -2.8]}>
        <mesh>
          <planeGeometry args={[2, 1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        <Text
          position={[0, 0.3, 0.01]}
          fontSize={0.08}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Flame Test Instructions
        </Text>
        
        <Text
          position={[0, 0.1, 0.01]}
          fontSize={0.04}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          1. Click to light Bunsen burner
        </Text>
        
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.04}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          2. Select wire loop
        </Text>
        
        <Text
          position={[0, -0.1, 0.01]}
          fontSize={0.04}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          3. Click on salt sample to test
        </Text>
        
        <Text
          position={[0, -0.2, 0.01]}
          fontSize={0.04}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          4. Observe characteristic flame color
        </Text>
        
        <Text
          position={[0, -0.3, 0.01]}
          fontSize={0.04}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          5. Identify the metal ion present
        </Text>
      </group>
      
      {/* Flame Color Reference Chart */}
      <group position={[2.5, 1.48, -1.2]}>
        <mesh position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[1.2, 0.8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        <Text
          position={[0, 0.3, 0.01]}
          fontSize={0.04}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          Flame Color Reference
        </Text>
        
        {/* Color samples */}
        {[
          { color: "#FFD700", name: "Yellow", ion: "Na⁺" },
          { color: "#8A2BE2", name: "Lilac", ion: "K⁺" },
          { color: "#B22222", name: "Brick Red", ion: "Ca²⁺" },
          { color: "#00CED1", name: "Blue-Green", ion: "Cu²⁺" }
        ].map((sample, i) => (
          <group key={i} position={[-0.4 + i * 0.25, 0, 0.01]}>
            <mesh position={[0, 0.1, 0]}>
              <planeGeometry args={[0.15, 0.08]} />
              <meshStandardMaterial 
                color={sample.color}
                emissive={sample.color}
                emissiveIntensity={0.3}
              />
            </mesh>
            <Text
              position={[0, 0, 0]}
              fontSize={0.025}
              color="black"
              anchorX="center"
            >
              {sample.name}
            </Text>
            <Text
              position={[0, -0.05, 0]}
              fontSize={0.02}
              color="black"
              anchorX="center"
            >
              {sample.ion}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );
}
