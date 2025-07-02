import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import { useChemistryLab } from '../lib/stores/useChemistryLab';
import * as THREE from 'three';

interface GasTestLabProps {
  onExperimentComplete?: (result: string) => void;
}

// Test Tools Components
function LitSplint({ position, isSelected, onSelect }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group position={position} onClick={onSelect} style={{ cursor: 'pointer' }}>
      {/* Splint handle */}
      <RoundedBox
        ref={meshRef}
        args={[0.02, 0.3, 0.02]}
        radius={0.005}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color={isSelected ? "#ff6b35" : "#8B4513"} />
      </RoundedBox>

      {/* Flame when lit */}
      <mesh position={[0, 0.18, 0]} scale={[0.03, 0.05, 0.03]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ff4500" transparent opacity={0.8} />
      </mesh>

      <Text
        position={[0, -0.3, 0]}
        fontSize={0.08}
        color={isSelected ? "#ff6b35" : "#666"}
        anchorX="center"
        anchorY="middle"
      >
        Lit Splint
      </Text>
    </group>
  );
}

function GlowingSplint({ position, isSelected, onSelect }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group position={position} onClick={onSelect} style={{ cursor: 'pointer' }}>
      {/* Splint handle */}
      <RoundedBox
        ref={meshRef}
        args={[0.02, 0.3, 0.02]}
        radius={0.005}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color={isSelected ? "#ff6b35" : "#8B4513"} />
      </RoundedBox>

      {/* Glowing tip */}
      <mesh position={[0, 0.18, 0]} scale={[0.025, 0.025, 0.025]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ff8c00" transparent opacity={0.9} />
      </mesh>

      <Text
        position={[0, -0.3, 0]}
        fontSize={0.08}
        color={isSelected ? "#ff6b35" : "#666"}
        anchorX="center"
        anchorY="middle"
      >
        Glowing Splint
      </Text>
    </group>
  );
}

function LitmusPaper({ position, isSelected, onSelect, color }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  color: "red" | "blue";
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group position={position} onClick={onSelect} style={{ cursor: 'pointer' }}>
      {/* Paper strip */}
      <RoundedBox
        ref={meshRef}
        args={[0.1, 0.25, 0.01]}
        radius={0.005}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color={isSelected ? "#ff6b35" : color === "red" ? "#ff6b6b" : "#74b9ff"} />
      </RoundedBox>

      <Text
        position={[0, -0.2, 0]}
        fontSize={0.06}
        color={isSelected ? "#ff6b35" : "#666"}
        anchorX="center"
        anchorY="middle"
      >
        {color === "red" ? "Red Litmus" : "Blue Litmus"}
      </Text>
    </group>
  );
}

function Limewater({ position, isSelected, onSelect }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group position={position} onClick={onSelect} style={{ cursor: 'pointer' }}>
      {/* Test tube */}
      <RoundedBox
        ref={meshRef}
        args={[0.08, 0.3, 0.08]}
        radius={0.01}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="transparent" transparent opacity={0.3} />
      </RoundedBox>

      {/* Limewater liquid */}
      <RoundedBox
        args={[0.06, 0.2, 0.06]}
        radius={0.01}
        position={[0, -0.05, 0]}
      >
        <meshStandardMaterial color={isSelected ? "#e0e0e0" : "#f0f0f0"} />
      </RoundedBox>

      <Text
        position={[0, -0.25, 0]}
        fontSize={0.06}
        color={isSelected ? "#ff6b35" : "#666"}
        anchorX="center"
        anchorY="middle"
      >
        Limewater
      </Text>
    </group>
  );
}

// Gas Test Tube Component
function GasTestTube({ gas, onTest }: {
  gas: any;
  onTest: (gasId: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectedGasId, selectedTestTool } = useChemistryLab();
  const isSelected = selectedGasId === gas.id;

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.05;
    }
  });

  const handleClick = () => {
    if (selectedTestTool) {
      onTest(gas.id);
    }
  };

  return (
    <group position={gas.position} onClick={handleClick}>
      {/* Test tube glass */}
      <RoundedBox
        ref={meshRef}
        args={[0.12, 0.4, 0.12]}
        radius={0.02}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#e8f4fd" 
          transparent 
          opacity={0.6} 
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.1}
        />
      </RoundedBox>

      {/* Gas visualization with proper colors */}
      <RoundedBox
        args={[0.1, 0.35, 0.1]}
        radius={0.015}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color={gas.color} 
          transparent 
          opacity={isSelected ? 0.7 : 0.5}
          emissive={gas.color}
          emissiveIntensity={isSelected ? 0.1 : 0.05}
        />
      </RoundedBox>

      {/* Stopper */}
      <RoundedBox
        args={[0.08, 0.06, 0.08]}
        radius={0.01}
        position={[0, 0.23, 0]}
      >
        <meshStandardMaterial 
          color="#8B4513" 
          metalness={0.3}
          roughness={0.7}
        />
      </RoundedBox>

      {/* Gas Name - Large and prominent */}
      <Text
        position={[0, -0.28, 0]}
        fontSize={0.11}
        color={isSelected ? "#ff6b35" : "#2c3e50"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        {gas.gasName}
      </Text>

      {/* Chemical Formula */}
      <Text
        position={[0, -0.42, 0]}
        fontSize={0.08}
        color={isSelected ? "#ff6b35" : "#34495e"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        {gas.formula}
      </Text>

      {/* Sample ID */}
      <Text
        position={[0, -0.54, 0]}
        fontSize={0.06}
        color="#7f8c8d"
        anchorX="center"
        anchorY="middle"
      >
        Sample {gas.id.replace('gas-', '').toUpperCase()}
      </Text>

      {/* Gas Properties - Additional info */}
      <Text
        position={[0, -0.66, 0]}
        fontSize={0.05}
        color="#95a5a6"
        anchorX="center"
        anchorY="middle"
      >
        {gas.gasName === "Hydrogen" && "Lightest gas"}
        {gas.gasName === "Oxygen" && "Supports combustion"}
        {gas.gasName === "Carbon Dioxide" && "Acidic gas"}
        {gas.gasName === "Ammonia" && "Basic gas"}
        {gas.gasName === "Chlorine" && "Halogen gas"}
      </Text>

      {selectedTestTool && isSelected && (
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.06}
          color="#ff6b35"
          anchorX="center"
          anchorY="middle"
        >
          Click to test!
        </Text>
      )}
    </group>
  );
}

export function GasTestLab({ onExperimentComplete }: GasTestLabProps) {
  const { 
    gasTests, 
    selectedTestTool, 
    selectTestTool, 
    performGasTest, 
    lastGasTestResult,
    selectGas,
    selectedGasId
  } = useChemistryLab();

  // Fallback gas data in case store data is not available
  const fallbackGasTests = [
    {
      id: "gas-1",
      position: [-2, 1.5, 0] as [number, number, number],
      gasName: "Hydrogen",
      formula: "H₂",
      color: "#ff6b6b",
      testMethod: "lit-splint",
      expectedResult: "Burns with a pop sound"
    },
    {
      id: "gas-2", 
      position: [-1, 1.5, 0] as [number, number, number],
      gasName: "Oxygen",
      formula: "O₂", 
      color: "#4ecdc4",
      testMethod: "glowing-splint",
      expectedResult: "Rekindies glowing splint"
    },
    {
      id: "gas-3",
      position: [0, 1.5, 0] as [number, number, number],
      gasName: "Carbon Dioxide",
      formula: "CO₂",
      color: "#45b7d1", 
      testMethod: "limewater",
      expectedResult: "Turns limewater milky"
    },
    {
      id: "gas-4",
      position: [1, 1.5, 0] as [number, number, number],
      gasName: "Ammonia",
      formula: "NH₃",
      color: "#96ceb4",
      testMethod: "red-litmus",
      expectedResult: "Turns red litmus blue"
    },
    {
      id: "gas-5",
      position: [2, 1.5, 0] as [number, number, number],
      gasName: "Chlorine", 
      formula: "Cl₂",
      color: "#ffeaa7",
      testMethod: "blue-litmus",
      expectedResult: "Bleaches litmus paper"
    }
  ];

  const displayGasTests = gasTests.length > 0 ? gasTests : fallbackGasTests;

  const handleToolSelect = (tool: string) => {
    selectTestTool(tool);
  };

  const handleGasTest = (gasId: string) => {
    if (selectedTestTool) {
      performGasTest(gasId, selectedTestTool);
      selectGas(gasId);
    }
  };

  // Test result effect
  React.useEffect(() => {
    if (lastGasTestResult && onExperimentComplete) {
      const resultMessage = `Gas Test: ${lastGasTestResult.gasName} with ${lastGasTestResult.testMethod} - ${lastGasTestResult.result} (${lastGasTestResult.correct ? 'Correct' : 'Incorrect'})`;
      onExperimentComplete(resultMessage);
    }
  }, [lastGasTestResult, onExperimentComplete]);

  return (
    <group>
      {/* Lighting for the gas test lab */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[0, 3, 0]} intensity={0.5} />

      {/* Lab background/floor */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* Gas test tubes */}
      {displayGasTests.map((gas) => (
        <GasTestTube
          key={gas.id}
          gas={gas}
          onTest={handleGasTest}
        />
      ))}

      {/* Test tools */}
      <LitSplint
        position={[-3, 1.62, -0.5]}
        isSelected={selectedTestTool === "lit-splint"}
        onSelect={() => handleToolSelect("lit-splint")}
      />

      <GlowingSplint
        position={[-2, 1.62, -0.5]}
        isSelected={selectedTestTool === "glowing-splint"}
        onSelect={() => handleToolSelect("glowing-splint")}
      />

      <LitmusPaper
        position={[-1, 1.62, -0.5]}
        isSelected={selectedTestTool === "red-litmus"}
        onSelect={() => handleToolSelect("red-litmus")}
        color="red"
      />

      <LitmusPaper
        position={[0, 1.62, -0.5]}
        isSelected={selectedTestTool === "blue-litmus"}
        onSelect={() => handleToolSelect("blue-litmus")}
        color="blue"
      />

      <Limewater
        position={[1, 1.62, -0.5]}
        isSelected={selectedTestTool === "limewater"}
        onSelect={() => handleToolSelect("limewater")}
      />

      {/* Equipment Labels */}
      <group position={[0, 2.2, -1]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.11}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Gas Sample Tubes - Identified
        </Text>
        <Text
          position={[0, -0.15, 0]}
          fontSize={0.07}
          color="#27ae60"
          anchorX="center"
          anchorY="middle"
        >
          Each gas is clearly labeled with name and properties
        </Text>
      </group>

      <group position={[-1, 2.2, -0.5]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.1}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Test Tools
        </Text>
        <Text
          position={[0, -0.15, 0]}
          fontSize={0.06}
          color="#7f8c8d"
          anchorX="center"
          anchorY="middle"
        >
          (Select tool then test gas)
        </Text>
      </group>

      {/* Individual test tool labels */}
      <Text
        position={[-3, 2.1, -0.5]}
        fontSize={0.05}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        Lit Splint
      </Text>

      <Text
        position={[-2, 2.1, -0.5]}
        fontSize={0.05}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        Glowing Splint
      </Text>

      <Text
        position={[-1, 2.1, -0.5]}
        fontSize={0.05}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        Red Litmus
      </Text>

      <Text
        position={[0, 2.1, -0.5]}
        fontSize={0.05}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        Blue Litmus
      </Text>

      <Text
        position={[1, 2.1, -0.5]}
        fontSize={0.05}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        Limewater
      </Text>

      {/* Instructions */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.12}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        Gas Identification Lab - All gases are labeled for study
      </Text>

      {selectedTestTool && (
        <Text
          position={[0, 2.3, 0]}
          fontSize={0.1}
          color="#ff6b35"
          anchorX="center"
          anchorY="middle"
        >
          Selected: {selectedTestTool.replace('-', ' ')}
        </Text>
      )}

      {lastGasTestResult && (
        <group>
          <Text
            position={[0, -1.5, 0]}
            fontSize={0.1}
            color={lastGasTestResult.correct ? "#00b894" : "#ff4757"}
            anchorX="center"
            anchorY="middle"
          >
            Result: {lastGasTestResult.result}
          </Text>
          <Text
            position={[0, -1.7, 0]}
            fontSize={0.08}
            color="#666"
            anchorX="center"
            anchorY="middle"
          >
            {lastGasTestResult.correct ? "✓ Correct!" : "✗ Try again"}
          </Text>
        </group>
      )}
    </group>
  );
}