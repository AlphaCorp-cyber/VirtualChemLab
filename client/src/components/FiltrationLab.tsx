import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LabelText, InstructionText, Text3D } from './Text3D';

interface FiltrationLabProps {
  onExperimentComplete?: (result: string) => void;
}

function Funnel({ position, isSelected, onSelect, hasFilterPaper, solidResidue }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  hasFilterPaper?: boolean;
  solidResidue?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.z += 0.01;
    }
  });

  return (
    <group position={position}>
      {/* Glass funnel - transparent with slight blue tint like in diagram */}
      <mesh
        ref={meshRef}
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <coneGeometry args={[0.3, 0.6, 32]} />
        <meshStandardMaterial 
          color={isSelected ? "#87ceeb" : "#e6f3ff"} 
          transparent 
          opacity={0.3}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      
      {/* Funnel rim - darker glass edge */}
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.3, 0.015, 16, 32]} />
        <meshStandardMaterial 
          color="#4682b4" 
          transparent
          opacity={0.8}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>
      
      {/* Funnel stem - glass tube */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
        <meshStandardMaterial 
          color="#e6f3ff" 
          transparent
          opacity={0.4}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      
      {/* Filter paper inside funnel */}
      {hasFilterPaper && (
        <mesh position={[0, 0.1, 0]}>
          <coneGeometry args={[0.25, 0.4, 32]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Solid residue on filter paper */}
      {solidResidue && hasFilterPaper && (
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
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
  const filtrateRef = useRef<THREE.Mesh>(null);

  // Animation for filtrate collection
  useFrame((state) => {
    if (filtrateRef.current && filtrateLevel > 0) {
      const time = state.clock.elapsedTime;
      // Subtle ripple effect
      filtrateRef.current.position.y = -0.3 + filtrateLevel * 0.25 + Math.sin(time * 3) * 0.005;
    }
  });

  return (
    <group position={position}>
      {/* Glass beaker - transparent like in diagram */}
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.6, 32]} />
        <meshStandardMaterial 
          color={isSelected ? "#87ceeb" : "#ffffff"} 
          transparent 
          opacity={0.3}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      
      {/* Beaker rim */}
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.3, 0.015, 16, 32]} />
        <meshStandardMaterial 
          color="#4682b4" 
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Clear cyan filtrate - matches diagram color */}
      {filtrateLevel > 0 && (
        <mesh ref={filtrateRef} position={[0, -0.3 + filtrateLevel * 0.25, 0]}>
          <cylinderGeometry args={[0.28, 0.28, filtrateLevel * 0.5, 32]} />
          <meshStandardMaterial 
            color="#00bcd4" 
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
  const [hasFilterPaper, setHasFilterPaper] = useState(true);
  const [filteringProgress, setFilteringProgress] = useState(0);

  // Animation for filtering droplets
  const dropletsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (experimentStage === 'filtering' && dropletsRef.current) {
      const time = state.clock.elapsedTime;
      dropletsRef.current.children.forEach((droplet, index) => {
        droplet.position.y = -0.2 - (time * 2 + index * 0.5) % 1;
        droplet.visible = filteringProgress > 0.1;
      });
    }
  });

  const handleFiltration = () => {
    if (selectedTool === 'mixture' && experimentStage === 'setup') {
      setExperimentStage('filtering');
      setFilteringProgress(0);
      
      // Animate the filtration process with more realistic timing
      const filtrationInterval = setInterval(() => {
        setFilteringProgress(prev => {
          const newProgress = prev + 0.05;
          return Math.min(newProgress, 1);
        });
        
        setFiltrateLevel(prev => {
          const newLevel = prev + 0.1;
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
      }, 300);
    }
  };

  const resetExperiment = () => {
    setExperimentStage('setup');
    setFiltrateLevel(0);
    setHasResidue(false);
    setMixtureEmpty(false);
    setSelectedTool('');
    setFilteringProgress(0);
  };

  return (
    <group>
      {/* Filtration setup - positioned like in the diagram */}
      <Funnel 
        position={[-1, 2.2, -0.5]} 
        isSelected={selectedTool === 'funnel'}
        onSelect={() => setSelectedTool('funnel')}
        hasFilterPaper={hasFilterPaper}
        solidResidue={hasResidue}
      />
      
      {/* Filtering droplets animation */}
      {experimentStage === 'filtering' && (
        <group ref={dropletsRef} position={[-1, 1.9, -0.5]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, -0.2 - i * 0.2, 0]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial 
                color="#00bcd4" 
                transparent 
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
      
      <MixtureBeaker 
        position={[-3, 1.75, -0.5]} 
        isSelected={selectedTool === 'mixture'}
        onSelect={() => {
          setSelectedTool('mixture');
          handleFiltration();
        }}
        isEmpty={mixtureEmpty}
      />
      
      <FiltrateBeaker 
        position={[-1, 1.75, -0.5]} 
        isSelected={selectedTool === 'filtrate'}
        onSelect={() => setSelectedTool('filtrate')}
        filtrateLevel={filtrateLevel}
      />

      {/* Equipment Labels */}
      <mesh position={[-3, 1.4, -0.5]}>
        <planeGeometry args={[1.6, 0.2]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <Text3D position={[-3, 1.4, -0.48]} text="Sand + Water" fontSize={0.06} color="#ffffff" />

      <mesh position={[-1, 2.8, -0.5]}>
        <planeGeometry args={[1.6, 0.2]} />
        <meshStandardMaterial color="#e67e22" />
      </mesh>
      <Text3D position={[-1, 2.8, -0.48]} text="Glass Funnel" fontSize={0.06} color="#ffffff" />

      <mesh position={[-1, 1.4, -0.5]}>
        <planeGeometry args={[1.6, 0.2]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      <Text3D position={[-1, 1.4, -0.48]} text="Clean Water" fontSize={0.06} color="#ffffff" />

      {/* Instructions Panel - With Text */}
      <mesh position={[2.5, 2.5, -1]}>
        <planeGeometry args={[3.5, 2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      <mesh position={[2.5, 2.5, -0.99]}>
        <planeGeometry args={[3.3, 1.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Title */}
      <Text3D position={[2.5, 3.2, -0.98]} text="FILTRATION LAB" fontSize={0.12} color="#3498db" />
      
      {/* Instructions */}
      <Text3D position={[2.5, 2.8, -0.98]} text="1. Click the mixture beaker to start" fontSize={0.08} color="#2c3e50" />
      <Text3D position={[2.5, 2.5, -0.98]} text="2. Watch filtration in progress" fontSize={0.08} color="#2c3e50" />
      <Text3D position={[2.5, 2.2, -0.98]} text="3. Sand stays on filter paper" fontSize={0.08} color="#2c3e50" />
      <Text3D position={[2.5, 1.9, -0.98]} text="4. Clear water passes through" fontSize={0.08} color="#2c3e50" />

      {/* Process Steps Indicator - Simplified */}
      <mesh position={[0, 3.5, -1]}>
        <planeGeometry args={[8, 0.4]} />
        <meshStandardMaterial 
          color={
            experimentStage === 'setup' ? "#3498db" :
            experimentStage === 'filtering' ? "#f39c12" : "#27ae60"
          } 
        />
      </mesh>

      {/* Reset button */}
      {experimentStage === 'complete' && (
        <mesh 
          position={[4, 1.8, -1]} 
          onClick={resetExperiment}
          userData={{ interactable: true }}
        >
          <boxGeometry args={[1, 0.3, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      )}

      {/* Arrow pointing to mixture beaker */}
      {experimentStage === 'setup' && (
        <mesh position={[-2.5, 2.2, -0.5]} rotation={[0, 0, -Math.PI/4]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      )}
    </group>
  );
}