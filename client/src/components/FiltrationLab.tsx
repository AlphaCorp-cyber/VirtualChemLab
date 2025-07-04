
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

  return (
    <group position={position}>
      {/* Glass funnel - inverted cone (wide at top, narrow at bottom) */}
      <mesh
        ref={meshRef}
        onClick={onSelect}
        userData={{ interactable: true }}
        rotation={[Math.PI, 0, 0]}
      >
        <coneGeometry args={[0.3, 0.6, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.2}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      
      {/* Funnel outline - black line like in diagram */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.305, 0.605, 32]} />
        <meshStandardMaterial 
          color="#000000" 
          transparent
          opacity={0.8}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Funnel stem - glass tube with black outline */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent
          opacity={0.2}
        />
      </mesh>
      
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.405, 16]} />
        <meshStandardMaterial 
          color="#000000" 
          transparent
          opacity={0.8}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Filter paper inside funnel - white like in diagram */}
      {hasFilterPaper && (
        <mesh position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.25, 0.4, 32]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Solid residue on filter paper - brownish sand color */}
      {solidResidue && hasFilterPaper && (
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
          <meshStandardMaterial color="#D2691E" />
        </mesh>
      )}
    </group>
  );
}

function MixtureBeaker({ position, isSelected, onSelect, isEmpty, isPouring }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  isEmpty: boolean;
  isPouring: boolean;
}) {
  const beakerRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  const sandRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (beakerRef.current && isPouring) {
      // Float and tilt the beaker towards the funnel setup
      const time = state.clock.elapsedTime * 2;
      beakerRef.current.rotation.z = Math.sin(time) * 0.2 + 0.4;
      beakerRef.current.position.y = position[1] + 0.3 + Math.sin(time * 1.5) * 0.1;
      beakerRef.current.position.x = position[0] + Math.sin(time * 0.8) * 0.2 + 0.5;
      beakerRef.current.position.z = position[2] + Math.sin(time * 1.2) * 0.1;
    } else if (beakerRef.current) {
      // Return to normal position
      beakerRef.current.rotation.z = 0;
      beakerRef.current.position.y = position[1];
      beakerRef.current.position.x = position[0];
      beakerRef.current.position.z = position[2];
    }
  });

  return (
    <group ref={beakerRef} position={position}>
      {/* Glass beaker - clear with black outline like diagram */}
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.6]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.2}
        />
      </mesh>
      
      {/* Beaker outline */}
      <mesh>
        <cylinderGeometry args={[0.305, 0.305, 0.605]} />
        <meshStandardMaterial 
          color="#000000" 
          transparent
          opacity={0.8}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Blue water and brownish sand mixture */}
      {!isEmpty && (
        <>
          {/* Bright cyan-blue water layer like in diagram */}
          <mesh ref={waterRef} position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.3]} />
            <meshStandardMaterial 
              color="#00CCFF" 
              transparent 
              opacity={0.9}
            />
          </mesh>
          {/* Brownish sand particles at bottom */}
          <mesh ref={sandRef} position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.1]} />
            <meshStandardMaterial color="#CD853F" />
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

  return (
    <group position={position}>
      {/* Glass beaker - clear with black outline like diagram */}
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.6, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.2}
        />
      </mesh>
      
      {/* Beaker outline */}
      <mesh>
        <cylinderGeometry args={[0.305, 0.305, 0.605, 32]} />
        <meshStandardMaterial 
          color="#000000" 
          transparent
          opacity={0.8}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Clear blue filtrate - matches diagram color */}
      {filtrateLevel > 0 && (
        <mesh ref={filtrateRef} position={[0, -0.3 + filtrateLevel * 0.25, 0]}>
          <cylinderGeometry args={[0.28, 0.28, filtrateLevel * 0.5, 32]} />
          <meshStandardMaterial 
            color="#00CCFF" 
            transparent 
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  );
}

function PouringStream({ startPos, endPos, isVisible }: {
  startPos: [number, number, number];
  endPos: [number, number, number];
  isVisible: boolean;
}) {
  const streamRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (streamRef.current && isVisible) {
      // Create flowing water effect
      const time = state.clock.elapsedTime;
      streamRef.current.children.forEach((droplet, index) => {
        const mesh = droplet as THREE.Mesh;
        mesh.position.y = startPos[1] - (time * 3 + index * 0.3) % 1.5;
        mesh.visible = mesh.position.y > endPos[1];
      });
    }
  });

  if (!isVisible) return null;

  return (
    <group ref={streamRef}>
      {/* Multiple droplets to create stream effect */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[(startPos[0] + endPos[0]) / 2, startPos[1] - i * 0.2, startPos[2]]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial 
            color="#00BFFF" 
            transparent 
            opacity={0.8}
          />
        </mesh>
      ))}
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
  const [isPouring, setIsPouring] = useState(false);
  const [showStream, setShowStream] = useState(false);

  const handleFiltration = () => {
    if (selectedTool === 'mixture' && experimentStage === 'setup') {
      setExperimentStage('filtering');
      setIsPouring(true);
      setShowStream(true);
      
      // Animate the filtration process
      const filtrationInterval = setInterval(() => {
        setFiltrateLevel(prev => {
          const newLevel = prev + 0.08;
          if (newLevel >= 1) {
            setHasResidue(true);
            setMixtureEmpty(true);
            setIsPouring(false);
            setShowStream(false);
            setExperimentStage('complete');
            clearInterval(filtrationInterval);
            
            if (onExperimentComplete) {
              onExperimentComplete(
                "Filtration completed successfully! The brown sand has been separated from the blue water. " +
                "The clear blue water (filtrate) has passed through the filter paper, while the brown sand " +
                "remains on the filter paper as residue."
              );
            }
            return 1;
          }
          return newLevel;
        });
      }, 400);
    }
  };

  const resetExperiment = () => {
    setExperimentStage('setup');
    setFiltrateLevel(0);
    setHasResidue(false);
    setMixtureEmpty(false);
    setSelectedTool('');
    setIsPouring(false);
    setShowStream(false);
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
      
      {/* Pouring stream animation */}
      <PouringStream 
        startPos={[-2.5, 2.2, -0.5]}
        endPos={[-1, 1.9, -0.5]}
        isVisible={showStream}
      />
      
      <MixtureBeaker 
        position={[-3, 1.75, -0.5]} 
        isSelected={selectedTool === 'mixture'}
        onSelect={() => {
          setSelectedTool('mixture');
          handleFiltration();
        }}
        isEmpty={mixtureEmpty}
        isPouring={isPouring}
      />
      
      <FiltrateBeaker 
        position={[-1, 1.75, -0.5]} 
        isSelected={selectedTool === 'filtrate'}
        onSelect={() => setSelectedTool('filtrate')}
        filtrateLevel={filtrateLevel}
      />

      {/* Equipment Labels */}
      <mesh position={[-3, 1.4, -0.5]}>
        <planeGeometry args={[1.8, 0.2]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <Text3D position={[-3, 1.4, -0.48]} text="Sand + Water" fontSize={0.06} color="#ffffff" />

      <mesh position={[-1, 2.8, -0.5]}>
        <planeGeometry args={[1.8, 0.2]} />
        <meshStandardMaterial color="#e67e22" />
      </mesh>
      <Text3D position={[-1, 2.8, -0.48]} text="Glass Funnel" fontSize={0.06} color="#ffffff" />

      <mesh position={[-1, 1.4, -0.5]}>
        <planeGeometry args={[1.6, 0.2]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      <Text3D position={[-1, 1.4, -0.48]} text="Filtrate" fontSize={0.06} color="#ffffff" />

      {/* Instructions Panel */}
      <mesh position={[2.5, 2.5, -1]}>
        <planeGeometry args={[3.5, 2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      <mesh position={[2.5, 2.5, -0.99]}>
        <planeGeometry args={[3.3, 1.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <Text3D position={[2.5, 3.2, -0.98]} text="FILTRATION PROCESS" fontSize={0.1} color="#3498db" />
      
      <Text3D position={[2.5, 2.8, -0.98]} text="1. Click mixture beaker once to start" fontSize={0.07} color="#2c3e50" />
      <Text3D position={[2.5, 2.5, -0.98]} text="2. Watch beaker pour into funnel" fontSize={0.07} color="#2c3e50" />
      <Text3D position={[2.5, 2.2, -0.98]} text="3. Brown sand stays on filter paper" fontSize={0.07} color="#2c3e50" />
      <Text3D position={[2.5, 1.9, -0.98]} text="4. Blue water passes through" fontSize={0.07} color="#2c3e50" />

      {/* Process Status */}
      <mesh position={[0, 3.5, -1]}>
        <planeGeometry args={[8, 0.4]} />
        <meshStandardMaterial 
          color={
            experimentStage === 'setup' ? "#3498db" :
            experimentStage === 'filtering' ? "#f39c12" : "#27ae60"
          } 
        />
      </mesh>
      
      <Text3D 
        position={[0, 3.5, -0.98]} 
        text={
          experimentStage === 'setup' ? "CLICK MIXTURE BEAKER TO START" :
          experimentStage === 'filtering' ? "FILTRATION IN PROGRESS..." : "FILTRATION COMPLETE!"
        }
        fontSize={0.08} 
        color="#ffffff" 
      />

      {/* Reset button */}
      {experimentStage === 'complete' && (
        <>
          <mesh 
            position={[4, 1.8, -1]} 
            onClick={resetExperiment}
            userData={{ interactable: true }}
          >
            <boxGeometry args={[1, 0.3, 0.1]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
          <Text3D position={[4, 1.8, -0.98]} text="RESET" fontSize={0.06} color="#ffffff" />
        </>
      )}

      {/* Arrow pointing to mixture beaker during setup */}
      {experimentStage === 'setup' && (
        <mesh position={[-2.5, 2.2, -0.5]} rotation={[0, 0, -Math.PI/4]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      )}
    </group>
  );
}
