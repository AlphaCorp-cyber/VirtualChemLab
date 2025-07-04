import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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
          color={isSelected ? "#3498db" : "#ecf0f1"} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Sediment layer (sand) */}
      {sedimentLevel > 0 && (
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.28, 0.28, sedimentLevel]} />
          <meshStandardMaterial color="#d4af37" />
        </mesh>
      )}
      
      {/* Liquid layer (water) */}
      {liquidLevel > 0 && (
        <mesh position={[0, -0.3 + sedimentLevel + liquidLevel / 2, 0]}>
          <cylinderGeometry args={[0.28, 0.28, liquidLevel]} />
          <meshStandardMaterial 
            color="#87ceeb" 
            transparent 
            opacity={0.7}
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
            color="#87ceeb" 
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
        color="#87ceeb" 
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
  const [sourceSedimentLevel, setSedimentLevel] = useState(0.15);
  const [receivingLiquidLevel, setReceivingLiquidLevel] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [showStream, setShowStream] = useState(false);

  const handleSettling = () => {
    if (selectedTool === 'source' && experimentStage === 'setup') {
      setExperimentStage('settling');
      
      // Allow some time for settling
      setTimeout(() => {
        setExperimentStage('decanting');
      }, 2000);
    }
  };

  const handleDecanting = () => {
    if (selectedTool === 'source' && experimentStage === 'decanting') {
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
    setSedimentLevel(0.15);
    setReceivingLiquidLevel(0);
    setIsPouring(false);
    setShowStream(false);
    setSelectedTool('');
  };

  return (
    <group>
      {/* Lab bench */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[12, 0.2, 6]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Equipment */}
      <DecantingBeaker 
        position={[-2, -0.1, 0]} 
        isSelected={selectedTool === 'source'}
        onSelect={() => {
          setSelectedTool('source');
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
        position={[2, -0.1, 0]} 
        isSelected={selectedTool === 'receiving'}
        onSelect={() => setSelectedTool('receiving')}
        liquidLevel={receivingLiquidLevel}
      />

      {/* Liquid stream animation */}
      <LiquidStream 
        startPos={[-1.7, 0.3, 0]}
        endPos={[1.7, 0.3, 0]}
        isVisible={showStream}
      />

      {/* Instructions */}
      <mesh position={[0, 1.5, 0]}>
        <planeGeometry args={[4, 1]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      <mesh position={[0, 1.5, 0.01]}>
        <planeGeometry args={[3.8, 0.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Process indicator */}
      <mesh position={[0, 2.5, 0]}>
        <planeGeometry args={[5, 0.4]} />
        <meshStandardMaterial 
          color={
            experimentStage === 'setup' ? "#3498db" :
            experimentStage === 'settling' ? "#f39c12" :
            experimentStage === 'decanting' ? "#e67e22" : "#27ae60"
          } 
        />
      </mesh>

      {/* Reset button */}
      {experimentStage === 'complete' && (
        <mesh 
          position={[0, -0.5, 2]} 
          onClick={resetExperiment}
          userData={{ interactable: true }}
        >
          <boxGeometry args={[1, 0.3, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      )}

      {/* Labels */}
      <mesh position={[-2, -1.2, 0]}>
        <planeGeometry args={[1.5, 0.3]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      <mesh position={[2, -1.2, 0]}>
        <planeGeometry args={[1.5, 0.3]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
    </group>
  );
}