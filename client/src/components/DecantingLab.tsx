import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LabelText, InstructionText, Text3D } from './Text3D';

interface DecantingLabProps {
  onExperimentComplete?: (result: string) => void;
}

function DecantingBeaker({ position, isSelected, onSelect, liquidLevel, sedimentLevel, isPouring }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  liquidLevel: number;
  sedimentLevel: number;
  isPouring: boolean;
}) {
  const beakerRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (beakerRef.current && isPouring) {
      beakerRef.current.rotation.z = Math.sin(Date.now() * 0.005) * 0.3;
    } else if (beakerRef.current && !isPouring) {
      beakerRef.current.rotation.z = 0;
    }
  });

  return (
    <group ref={beakerRef} position={position}>
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.8]} />
        <meshStandardMaterial 
          color="#ecf0f1" 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* Sediment layer (dark red wine sediment) */}
      {sedimentLevel > 0 && (
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.28, 0.28, sedimentLevel]} />
          <meshStandardMaterial color="#8B0000" />
        </mesh>
      )}

      {/* Liquid layer (wine) */}
      {liquidLevel > 0 && (
        <mesh position={[0, -0.3 + sedimentLevel + liquidLevel / 2, 0]}>
          <cylinderGeometry args={[0.28, 0.28, liquidLevel]} />
          <meshStandardMaterial 
            color="#722F37" 
            transparent 
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  );
}

function ReceivingBeaker({ position, isSelected, onSelect, liquidLevel }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  liquidLevel: number;
}) {
  return (
    <group position={position}>
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.8]} />
        <meshStandardMaterial 
          color={isSelected ? "#3498db" : "#ecf0f1"} 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* Decanted liquid */}
      {liquidLevel > 0 && (
        <mesh position={[0, -0.3 + liquidLevel / 2, 0]}>
          <cylinderGeometry args={[0.28, 0.28, liquidLevel]} />
          <meshStandardMaterial 
            color="#CD5C5C" 
            transparent 
            opacity={0.7}
          />
        </mesh>
      )}
    </group>
  );
}

function LiquidStream({ startPos, endPos, isVisible }: {
  startPos: [number, number, number];
  endPos: [number, number, number];
  isVisible: boolean;
}) {
  const streamRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (streamRef.current && isVisible) {
      streamRef.current.rotation.z += 0.1;
    }
  });

  if (!isVisible) return null;

  const midPoint: [number, number, number] = [
    (startPos[0] + endPos[0]) / 2,
    (startPos[1] + endPos[1]) / 2,
    (startPos[2] + endPos[2]) / 2
  ];

  return (
    <mesh ref={streamRef} position={midPoint}>
      <cylinderGeometry args={[0.02, 0.02, 1.5]} />
      <meshStandardMaterial 
        color="#CD5C5C" 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
}

export function DecantingLab({ onExperimentComplete }: DecantingLabProps) {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [experimentStage, setExperimentStage] = useState<'setup' | 'settling' | 'decanting' | 'complete'>('setup');
  const [sourceLiquidLevel, setSourceLiquidLevel] = useState(0.4);
  const [sourceSedimentLevel, setSedimentLevel] = useState(0);
  const [receivingLiquidLevel, setReceivingLiquidLevel] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [showStream, setShowStream] = useState(false);

  const handleSettling = () => {
    if (experimentStage === 'setup') {
      setExperimentStage('settling');

      // Animate sediment settling
      let currentSediment = 0;
      const settlingInterval = setInterval(() => {
        currentSediment += 0.03;
        setSedimentLevel(currentSediment);
        
        if (currentSediment >= 0.15) {
          clearInterval(settlingInterval);
          setExperimentStage('decanting');
        }
      }, 200);
    }
  };

  const handleDecanting = () => {
    if (experimentStage === 'decanting') {
      setIsPouring(true);
      setShowStream(true);

      // Animate the decanting process
      const decantingInterval = setInterval(() => {
        setSourceLiquidLevel(prev => {
          const newLevel = prev - 0.05;
          if (newLevel <= 0) {
            setIsPouring(false);
            setShowStream(false);
            setExperimentStage('complete');
            clearInterval(decantingInterval);

            if (onExperimentComplete) {
              onExperimentComplete(
                "Decanting completed successfully! The clear liquid has been carefully poured off, " +
                "leaving the sediment (sand) behind in the original beaker. This separation technique " +
                "is used to separate liquids from settled solids."
              );
            }
            return 0;
          }
          return newLevel;
        });

        setReceivingLiquidLevel(prev => prev + 0.05);
      }, 300);
    }
  };

  const resetExperiment = () => {
    setExperimentStage('setup');
    setSourceLiquidLevel(0.4);
    setSedimentLevel(0);
    setReceivingLiquidLevel(0);
    setIsPouring(false);
    setShowStream(false);
    setSelectedTool('');
  };

  return (
    <group>
      {/* Equipment positioned on the existing white lab table */}
      <DecantingBeaker 
        position={[-2.5, 1.55, -1]} 
        isSelected={selectedTool === 'source'}
        onSelect={() => {
          if (experimentStage === 'setup') {
            handleSettling();
          } else if (experimentStage === 'decanting') {
            handleDecanting();
          }
        }}
        liquidLevel={sourceLiquidLevel}
        sedimentLevel={sourceSedimentLevel}
        isPouring={isPouring}
      />

      <ReceivingBeaker 
        position={[2.5, 1.55, -1]} 
        isSelected={selectedTool === 'receiving'}
        onSelect={() => setSelectedTool('receiving')}
        liquidLevel={receivingLiquidLevel}
      />

      {/* Liquid stream animation */}
      <LiquidStream 
        startPos={[-2, 1.9, -1]}
        endPos={[2, 1.9, -1]}
        isVisible={showStream}
      />

      {/* Equipment Labels */}
      <mesh position={[-2.5, 0.8, -1]}>
        <planeGeometry args={[1.8, 0.25]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <Text3D position={[-2.5, 0.8, -0.98]} text="Source Beaker" fontSize={0.06} color="#ffffff" />

      <mesh position={[2.5, 0.8, -1]}>
        <planeGeometry args={[1.8, 0.25]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      <Text3D position={[2.5, 0.8, -0.98]} text="Receiving Beaker" fontSize={0.06} color="#ffffff" />

      {/* Instructions Panel */}
      <mesh position={[0, 3, -1]}>
        <planeGeometry args={[5, 2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      <mesh position={[0, 3, -0.99]}>
        <planeGeometry args={[4.8, 1.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Title */}
      <Text3D position={[0, 3.7, -0.98]} text="DECANTING LAB" fontSize={0.12} color="#9b59b6" />

      {/* Instructions */}
      <Text3D position={[0, 3.3, -0.98]} text="1. Click source beaker to start settling" fontSize={0.08} color="#2c3e50" />
      <Text3D position={[0, 2.9, -0.98]} text="2. Wait for sediment to settle" fontSize={0.08} color="#2c3e50" />
      <Text3D position={[0, 2.5, -0.98]} text="3. Click again to pour carefully" fontSize={0.08} color="#2c3e50" />
      <Text3D position={[0, 2.1, -0.98]} text="4. Clear liquid separates from sand" fontSize={0.08} color="#2c3e50" />

      {/* Process indicator */}
      <mesh position={[0, 4.5, 0]}>
        <planeGeometry args={[8, 0.4]} />
        <meshStandardMaterial 
          color={
            experimentStage === 'setup' ? "#3498db" :
            experimentStage === 'settling' ? "#f39c12" :
            experimentStage === 'decanting' ? "#e67e22" : "#27ae60"
          } 
        />
      </mesh>

      <mesh position={[0, 4.5, 0.01]}>
        <planeGeometry args={[7.5, 0.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <Text3D 
        position={[0, 4.5, 0.01]} 
        text={
          experimentStage === 'setup' ? "CLICK WINE BEAKER TO START SETTLING" :
          experimentStage === 'settling' ? "SEDIMENT IS SETTLING..." :
          experimentStage === 'decanting' ? "POURING WINE CAREFULLY..." : "DECANTING COMPLETE!"
        }
        fontSize={0.08} 
        color="#2c3e50" 
      />

      {/* Reset button */}
      {experimentStage === 'complete' && (
        <mesh 
          position={[4.5, 1.8, 0]} 
          onClick={resetExperiment}
          userData={{ interactable: true }}
        >
          <boxGeometry args={[1, 0.3, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      )}

      {/* Step indicators with arrows */}
      {experimentStage === 'setup' && (
        <mesh position={[-2, 2.5, 0]} rotation={[0, 0, -Math.PI/4]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
      )}

      {experimentStage === 'settling' && (
        <>
          <mesh position={[-2, 2.5, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#f39c12" />
          </mesh>
          <mesh position={[-1.8, 2.5, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#f39c12" />
          </mesh>
          <mesh position={[-1.6, 2.5, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#f39c12" />
          </mesh>
        </>
      )}

      {experimentStage === 'decanting' && (
        <mesh position={[-1.5, 2.6, 0]} rotation={[0, 0, -Math.PI/6]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color="#e67e22" />
        </mesh>
      )}
    </group>
  );
}