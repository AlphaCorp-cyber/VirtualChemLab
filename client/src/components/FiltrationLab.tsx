import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LabelText, InstructionText, Text3D } from './Text3D';

interface FiltrationLabProps {
  onExperimentComplete?: (result: string) => void;
}

function Funnel({ position, isSelected, onSelect }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.z += 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <coneGeometry args={[0.3, 0.6, 8]} />
        <meshStandardMaterial color={isSelected ? "#3498db" : "#ecf0f1"} />
      </mesh>
      {/* Funnel stem */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#bdc3c7" />
      </mesh>
    </group>
  );
}

function FilterPaper({ position, isSelected, onSelect, hasResidue }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  hasResidue: boolean;
}) {
  return (
    <group position={position}>
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <circleGeometry args={[0.25, 16]} />
        <meshStandardMaterial 
          color={isSelected ? "#f39c12" : "#ffffff"} 
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Sand residue on filter paper */}
      {hasResidue && (
        <mesh position={[0, 0.01, 0]}>
          <circleGeometry args={[0.15, 16]} />
          <meshStandardMaterial color="#d4af37" />
        </mesh>
      )}
    </group>
  );
}

function MixtureBeaker({ position, isSelected, onSelect, isEmpty }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  isEmpty: boolean;
}) {
  return (
    <group position={position}>
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.6]} />
        <meshStandardMaterial 
          color={isSelected ? "#3498db" : "#ecf0f1"} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      {/* Sand-water mixture */}
      {!isEmpty && (
        <>
          {/* Water layer */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.3]} />
            <meshStandardMaterial 
              color="#87ceeb" 
              transparent 
              opacity={0.7}
            />
          </mesh>
          {/* Sand particles */}
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.1]} />
            <meshStandardMaterial color="#d4af37" />
          </mesh>
        </>
      )}
    </group>
  );
}

function FiltrateBeaker({ position, isSelected, onSelect, filtrateLevel }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  filtrateLevel: number;
}) {
  return (
    <group position={position}>
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.6]} />
        <meshStandardMaterial 
          color={isSelected ? "#3498db" : "#ecf0f1"} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      {/* Clear filtrate */}
      {filtrateLevel > 0 && (
        <mesh position={[0, -0.3 + filtrateLevel * 0.25, 0]}>
          <cylinderGeometry args={[0.28, 0.28, filtrateLevel * 0.5]} />
          <meshStandardMaterial 
            color="#87ceeb" 
            transparent 
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

export function FiltrationLab({ onExperimentComplete }: FiltrationLabProps) {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [experimentStage, setExperimentStage] = useState<'setup' | 'filtering' | 'complete'>('setup');
  const [filtrateLevel, setFiltrateLevel] = useState(0);
  const [hasResidue, setHasResidue] = useState(false);
  const [mixtureEmpty, setMixtureEmpty] = useState(false);

  const handleFiltration = () => {
    if (selectedTool === 'mixture' && experimentStage === 'setup') {
      setExperimentStage('filtering');
      
      // Animate the filtration process
      const filtrationInterval = setInterval(() => {
        setFiltrateLevel(prev => {
          const newLevel = prev + 0.2;
          if (newLevel >= 1) {
            setHasResidue(true);
            setMixtureEmpty(true);
            setExperimentStage('complete');
            clearInterval(filtrationInterval);
            
            if (onExperimentComplete) {
              onExperimentComplete(
                "Filtration completed successfully! The sand has been separated from the water. " +
                "The clear water (filtrate) has passed through the filter paper, while the sand " +
                "remains on the filter paper as residue."
              );
            }
            return 1;
          }
          return newLevel;
        });
      }, 500);
    }
  };

  const resetExperiment = () => {
    setExperimentStage('setup');
    setFiltrateLevel(0);
    setHasResidue(false);
    setMixtureEmpty(false);
    setSelectedTool('');
  };

  return (
    <group>
      {/* Lab bench - positioned at table height */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[12, 0.1, 6]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Equipment positioned on the table */}
      <Funnel 
        position={[-1, 2.3, 0]} 
        isSelected={selectedTool === 'funnel'}
        onSelect={() => setSelectedTool('funnel')}
      />
      
      <FilterPaper 
        position={[-1, 2.1, 0]} 
        isSelected={selectedTool === 'filter'}
        onSelect={() => setSelectedTool('filter')}
        hasResidue={hasResidue}
      />
      
      <MixtureBeaker 
        position={[-3, 1.9, 0]} 
        isSelected={selectedTool === 'mixture'}
        onSelect={() => {
          setSelectedTool('mixture');
          handleFiltration();
        }}
        isEmpty={mixtureEmpty}
      />
      
      <FiltrateBeaker 
        position={[-1, 1.3, 0]} 
        isSelected={selectedTool === 'filtrate'}
        onSelect={() => setSelectedTool('filtrate')}
        filtrateLevel={filtrateLevel}
      />

      {/* Equipment Labels */}
      <mesh position={[-3, 1.2, 0]}>
        <planeGeometry args={[1.2, 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <LabelText position={[-3, 1.2, 0.02]} text="Sand + Water Mixture" color="#ffffff" />

      <mesh position={[-1, 2.8, 0]}>
        <planeGeometry args={[1.2, 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <LabelText position={[-1, 2.8, 0.02]} text="Funnel + Filter Paper" color="#ffffff" />

      <mesh position={[-1, 0.8, 0]}>
        <planeGeometry args={[1.2, 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <LabelText position={[-1, 0.8, 0.02]} text="Clear Filtrate" color="#ffffff" />

      {/* Instructions Panel */}
      <mesh position={[2.5, 2.5, 0]}>
        <planeGeometry args={[3.5, 2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      <mesh position={[2.5, 2.5, 0.01]}>
        <planeGeometry args={[3.3, 1.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Instruction text areas */}
      <mesh position={[2.5, 3.2, 0.02]}>
        <planeGeometry args={[3, 0.3]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <Text3D position={[2.5, 3.2, 0.03]} text="FILTRATION EXPERIMENT" fontSize={0.08} color="#ffffff" />

      <InstructionText position={[1, 2.8, 0.03]} text="1. Click sand-water mixture to start" />
      <InstructionText position={[1, 2.5, 0.03]} text="2. Watch liquid pass through filter" />
      <InstructionText position={[1, 2.2, 0.03]} text="3. Sand remains on filter paper" />
      <InstructionText position={[1, 1.9, 0.03]} text="4. Clear water collects below" />
      <InstructionText position={[1, 1.6, 0.03]} text="5. Separation complete!" />

      {/* Process Steps Indicator */}
      <mesh position={[0, 3.5, 0]}>
        <planeGeometry args={[8, 0.4]} />
        <meshStandardMaterial 
          color={
            experimentStage === 'setup' ? "#3498db" :
            experimentStage === 'filtering' ? "#f39c12" : "#27ae60"
          } 
        />
      </mesh>

      <Text3D 
        position={[0, 3.5, 0.01]} 
        text={
          experimentStage === 'setup' ? "READY TO START - Click the mixture beaker" :
          experimentStage === 'filtering' ? "FILTERING IN PROGRESS..." : 
          "FILTRATION COMPLETE!"
        } 
        fontSize={0.1} 
        color="#ffffff" 
      />

      {/* Reset button */}
      {experimentStage === 'complete' && (
        <mesh 
          position={[4, 1.8, 0]} 
          onClick={resetExperiment}
          userData={{ interactable: true }}
        >
          <boxGeometry args={[1, 0.3, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      )}

      {/* Arrow pointing to mixture beaker */}
      {experimentStage === 'setup' && (
        <mesh position={[-2.5, 2.3, 0]} rotation={[0, 0, -Math.PI/4]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      )}
    </group>
  );
}