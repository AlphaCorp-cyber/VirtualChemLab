import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LabelText, InstructionText, Text3D } from './Text3D';

interface EvaporationLabProps {
  onExperimentComplete?: (result: string) => void;
}

function EvaporatingDish({ position, isSelected, onSelect, liquidLevel, saltCrystals }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  liquidLevel: number;
  saltCrystals: boolean;
}) {
  return (
    <group position={position}>
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.4, 0.4, 0.1]} />
        <meshStandardMaterial 
          color={isSelected ? "#3498db" : "#ecf0f1"} 
        />
      </mesh>
      
      {/* Salt solution */}
      {liquidLevel > 0 && (
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.02]} />
          <meshStandardMaterial 
            color="#87ceeb" 
            transparent 
            opacity={0.7}
          />
        </mesh>
      )}
      
      {/* Salt crystals */}
      {saltCrystals && (
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.01]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
}

function BunsenBurner({ position, isLit, onToggle }: {
  position: [number, number, number];
  isLit: boolean;
  onToggle: () => void;
}) {
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (flameRef.current && isLit) {
      flameRef.current.rotation.y += 0.1;
      flameRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.1);
    }
  });

  return (
    <group position={position}>
      {/* Burner base */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.3]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Burner top */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      {/* Flame */}
      {isLit && (
        <mesh 
          ref={flameRef}
          position={[0, 0.4, 0]}
          onClick={onToggle}
          userData={{ interactable: true }}
        >
          <coneGeometry args={[0.08, 0.3, 8]} />
          <meshStandardMaterial 
            color="#ff6b35" 
            transparent 
            opacity={0.8}
            emissive="#ff6b35"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      
      {/* Control knob */}
      <mesh 
        position={[0.2, 0, 0]}
        onClick={onToggle}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.03, 0.03, 0.1]} />
        <meshStandardMaterial color={isLit ? "#e74c3c" : "#95a5a6"} />
      </mesh>
    </group>
  );
}

function TripodStand({ position }: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Tripod legs */}
      <mesh position={[0.2, 0.2, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[-0.2, 0.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0, 0.2, 0.2]} rotation={[Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Wire gauze */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.01]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
    </group>
  );
}

export function EvaporationLab({ onExperimentComplete }: EvaporationLabProps) {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [experimentStage, setExperimentStage] = useState<'setup' | 'heating' | 'evaporating' | 'complete'>('setup');
  const [isLit, setIsLit] = useState(false);
  const [liquidLevel, setLiquidLevel] = useState(1);
  const [saltCrystals, setSaltCrystals] = useState(false);

  const handleHeating = () => {
    if (selectedTool === 'dish' && isLit && experimentStage === 'setup') {
      setExperimentStage('heating');
      
      // Start evaporation process
      const evaporationInterval = setInterval(() => {
        setLiquidLevel(prev => {
          const newLevel = prev - 0.1;
          if (newLevel <= 0) {
            setSaltCrystals(true);
            setExperimentStage('complete');
            clearInterval(evaporationInterval);
            
            if (onExperimentComplete) {
              onExperimentComplete(
                "Evaporation to dryness completed successfully! The water has completely evaporated, " +
                "leaving behind white salt crystals in the evaporating dish. This separation technique " +
                "is used to recover dissolved solids from their solutions."
              );
            }
            return 0;
          }
          return newLevel;
        });
      }, 1000);
    }
  };

  const resetExperiment = () => {
    setExperimentStage('setup');
    setIsLit(false);
    setLiquidLevel(1);
    setSaltCrystals(false);
    setSelectedTool('');
  };

  return (
    <group>
      {/* Equipment positioned on the existing white lab table */}
      <TripodStand position={[0, 1.55, -1]} />
      
      <EvaporatingDish 
        position={[0, 2.0, -1]} 
        isSelected={selectedTool === 'dish'}
        onSelect={() => {
          setSelectedTool('dish');
          handleHeating();
        }}
        liquidLevel={liquidLevel}
        saltCrystals={saltCrystals}
      />
      
      <BunsenBurner 
        position={[0, 1.05, -1]} 
        isLit={isLit}
        onToggle={() => setIsLit(!isLit)}
      />

      {/* Equipment Labels */}
      <mesh position={[0, 0.7, -1]}>
        <planeGeometry args={[1.5, 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <LabelText position={[0, 0.7, -0.98]} text="Bunsen Burner" color="#ffffff" />

      <mesh position={[0, 2.4, -1]}>
        <planeGeometry args={[1.8, 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <LabelText position={[0, 2.4, -0.98]} text="Evaporating Dish" color="#ffffff" />

      <mesh position={[0, 2.8, -1]}>
        <planeGeometry args={[1.5, 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <LabelText position={[0, 2.8, -0.98]} text="Tripod Stand" color="#ffffff" />

      {/* Instructions Panel */}
      <mesh position={[3.5, 2.5, 0]}>
        <planeGeometry args={[4, 2.5]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      <mesh position={[3.5, 2.5, 0.01]}>
        <planeGeometry args={[3.8, 2.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Instruction text areas */}
      <mesh position={[3.5, 3.5, 0.02]}>
        <planeGeometry args={[3.5, 0.3]} />
        <meshStandardMaterial color="#e67e22" />
      </mesh>

      <mesh position={[3.5, 3.0, 0.02]}>
        <planeGeometry args={[3.5, 0.25]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      <mesh position={[3.5, 2.6, 0.02]}>
        <planeGeometry args={[3.5, 0.25]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      <mesh position={[3.5, 2.2, 0.02]}>
        <planeGeometry args={[3.5, 0.25]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      <mesh position={[3.5, 1.8, 0.02]}>
        <planeGeometry args={[3.5, 0.25]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      <mesh position={[3.5, 1.4, 0.02]}>
        <planeGeometry args={[3.5, 0.25]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* Heat indicator */}
      {isLit && (
        <>
          <mesh position={[0, 3.8, 0]}>
            <planeGeometry args={[2.5, 0.3]} />
            <meshStandardMaterial 
              color="#e74c3c" 
              emissive="#e74c3c"
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh position={[0, 3.8, 0.01]}>
            <planeGeometry args={[2.3, 0.25]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </>
      )}

      {/* Process Steps Indicator */}
      <mesh position={[0, 4.5, 0]}>
        <planeGeometry args={[8, 0.4]} />
        <meshStandardMaterial 
          color={
            experimentStage === 'setup' ? "#3498db" :
            experimentStage === 'heating' ? "#f39c12" :
            experimentStage === 'evaporating' ? "#e67e22" : "#27ae60"
          } 
        />
      </mesh>

      <mesh position={[0, 4.5, 0.01]}>
        <planeGeometry args={[7.5, 0.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Reset button */}
      {experimentStage === 'complete' && (
        <mesh 
          position={[5, 1.8, 0]} 
          onClick={resetExperiment}
          userData={{ interactable: true }}
        >
          <boxGeometry args={[1, 0.3, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      )}

      {/* Step indicators with arrows */}
      {experimentStage === 'setup' && !isLit && (
        <mesh position={[0.5, 1.7, 0]} rotation={[0, 0, -Math.PI/4]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      )}

      {experimentStage === 'setup' && isLit && (
        <mesh position={[0.5, 2.6, 0]} rotation={[0, 0, -Math.PI/4]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color="#f39c12" />
        </mesh>
      )}
    </group>
  );
}