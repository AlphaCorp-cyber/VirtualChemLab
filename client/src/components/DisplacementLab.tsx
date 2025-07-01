
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DisplacementLabProps {
  onExperimentComplete?: (result: string) => void;
}

const DisplacementLab: React.FC<DisplacementLabProps> = ({ onExperimentComplete }) => {
  const [reactionStarted, setReactionStarted] = useState(false);
  const [reactionProgress, setReactionProgress] = useState(0);
  const [selectedMetal, setSelectedMetal] = useState<'iron' | 'zinc' | 'magnesium'>('iron');
  const [selectedSolution, setSelectedSolution] = useState<'copper' | 'iron'>('copper');
  
  const testTubeRef = useRef<THREE.Group>(null);
  const solutionRef = useRef<THREE.Mesh>(null);
  const metalRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (reactionStarted && reactionProgress < 1) {
      setReactionProgress(prev => Math.min(prev + delta * 0.3, 1));
      
      // Animate solution color change
      if (solutionRef.current) {
        const material = solutionRef.current.material as THREE.MeshStandardMaterial;
        if (selectedSolution === 'copper') {
          // Blue to colorless transition
          const blue = new THREE.Color(0x0066cc);
          const clear = new THREE.Color(0x88ccff);
          material.color.lerpColors(blue, clear, reactionProgress);
          material.opacity = 0.8 - (reactionProgress * 0.3);
        }
      }

      // Animate copper deposition on metal
      if (metalRef.current && selectedSolution === 'copper') {
        const material = metalRef.current.material as THREE.MeshStandardMaterial;
        const originalColor = new THREE.Color(0x666666); // Iron gray
        const copperColor = new THREE.Color(0xb87333); // Copper brown
        material.color.lerpColors(originalColor, copperColor, reactionProgress);
      }

      if (reactionProgress >= 1) {
        onExperimentComplete?.('Displacement reaction complete! Copper deposited on iron.');
      }
    }
  });

  const startReaction = () => {
    if (!reactionStarted) {
      setReactionStarted(true);
      setReactionProgress(0);
    }
  };

  const resetExperiment = () => {
    setReactionStarted(false);
    setReactionProgress(0);
    
    if (solutionRef.current) {
      const material = solutionRef.current.material as THREE.MeshStandardMaterial;
      material.color.setHex(selectedSolution === 'copper' ? 0x0066cc : 0x228b22);
      material.opacity = 0.8;
    }
    
    if (metalRef.current) {
      const material = metalRef.current.material as THREE.MeshStandardMaterial;
      material.color.setHex(0x666666);
    }
  };

  return (
    <group>
      {/* Test Tube Rack */}
      <mesh position={[0, 1.52, 0]} castShadow>
        <boxGeometry args={[0.8, 0.1, 0.3]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Test Tube Holes */}
      <mesh position={[0, 1.565, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Test Tube */}
      <group ref={testTubeRef} position={[0, 1.81, 0]}>
        {/* Glass tube */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.6, 16]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            transparent={true} 
            opacity={0.2} 
            roughness={0.1}
            transmission={0.9}
            thickness={0.02}
          />
        </mesh>

        {/* Solution */}
        <mesh ref={solutionRef} position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.3, 16]} />
          <meshStandardMaterial 
            color={selectedSolution === 'copper' ? 0x0066cc : 0x228b22}
            transparent={true}
            opacity={0.8}
          />
        </mesh>

        {/* Metal piece (iron nail) */}
        <mesh 
          ref={metalRef}
          position={[0, 0.1, 0]} 
          castShadow
          onClick={startReaction}
          onPointerOver={(e) => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            document.body.style.cursor = 'default';
          }}
        >
          <boxGeometry args={[0.02, 0.25, 0.02]} />
          <meshStandardMaterial 
            color="#666666"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>

        {/* Copper particles forming */}
        {reactionProgress > 0.3 && (
          <>
            {[...Array(Math.floor(reactionProgress * 8))].map((_, i) => (
              <mesh
                key={i}
                position={[
                  (Math.random() - 0.5) * 0.1,
                  0.05 + Math.random() * 0.1,
                  (Math.random() - 0.5) * 0.1
                ]}
              >
                <sphereGeometry args={[0.005]} />
                <meshStandardMaterial color="#b87333" />
              </mesh>
            ))}
          </>
        )}
      </group>

      {/* Labels */}
      <group position={[-1.5, 1.8, 0]}>
        <mesh>
          <planeGeometry args={[0.8, 0.3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Metal Selection Area */}
      <group position={[-2, 1.59, 0]}>
        {/* Iron piece */}
        <mesh 
          position={[-0.3, 0, 0]} 
          castShadow
          onClick={() => setSelectedMetal('iron')}
          onPointerOver={(e) => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            document.body.style.cursor = 'default';
          }}
        >
          <boxGeometry args={[0.03, 0.15, 0.03]} />
          <meshStandardMaterial 
            color={selectedMetal === 'iron' ? "#888888" : "#666666"}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>

        {/* Zinc piece */}
        <mesh 
          position={[0, 0, 0]} 
          castShadow
          onClick={() => setSelectedMetal('zinc')}
          onPointerOver={(e) => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            document.body.style.cursor = 'default';
          }}
        >
          <boxGeometry args={[0.03, 0.12, 0.03]} />
          <meshStandardMaterial 
            color={selectedMetal === 'zinc' ? "#9999bb" : "#777799"}
            metalness={0.7}
            roughness={0.4}
          />
        </mesh>

        {/* Magnesium strip */}
        <mesh 
          position={[0.3, 0, 0]} 
          castShadow
          onClick={() => setSelectedMetal('magnesium')}
          onPointerOver={(e) => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            document.body.style.cursor = 'default';
          }}
        >
          <boxGeometry args={[0.02, 0.1, 0.008]} />
          <meshStandardMaterial 
            color={selectedMetal === 'magnesium' ? "#cccccc" : "#aaaaaa"}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Solution Bottles */}
      <group position={[2, 1.7, 0]}>
        {/* Copper sulfate bottle */}
        <mesh 
          position={[-0.3, 0.2, 0]} 
          castShadow
          onClick={() => setSelectedSolution('copper')}
          onPointerOver={(e) => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            document.body.style.cursor = 'default';
          }}
        >
          <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transparent={true}
            opacity={0.3}
          />
        </mesh>
        <mesh position={[-0.3, 0.15, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.2, 16]} />
          <meshStandardMaterial 
            color="#0066cc"
            transparent={true}
            opacity={0.8}
          />
        </mesh>

        {/* Iron sulfate bottle */}
        <mesh 
          position={[0.3, 0.2, 0]} 
          castShadow
          onClick={() => setSelectedSolution('iron')}
          onPointerOver={(e) => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            document.body.style.cursor = 'default';
          }}
        >
          <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transparent={true}
            opacity={0.3}
          />
        </mesh>
        <mesh position={[0.3, 0.15, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.2, 16]} />
          <meshStandardMaterial 
            color="#228b22"
            transparent={true}
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* Reset Button */}
      <mesh 
        position={[1.5, 1.8, 0]} 
        castShadow
        onClick={resetExperiment}
        onPointerOver={(e) => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshStandardMaterial color="#ff6666" />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
};

export default DisplacementLab;
