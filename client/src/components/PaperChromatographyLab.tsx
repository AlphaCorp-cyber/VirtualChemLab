import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface PaperChromatographyLabProps {
  onExperimentComplete?: (result: string) => void;
}

const PaperChromatographyLab: React.FC<PaperChromatographyLabProps> = ({ onExperimentComplete }) => {
  const [experimentStarted, setExperimentStarted] = useState(false);
  const [solventHeight, setSolventHeight] = useState(0);
  const [pigmentSeparation, setPigmentSeparation] = useState(0);
  const [inkApplied, setInkApplied] = useState(false);
  const [selectedInk, setSelectedInk] = useState<'black' | 'blue' | 'red'>('black');

  const paperRef = useRef<THREE.Mesh>(null);
  const solventRef = useRef<THREE.Mesh>(null);
  const beakerRef = useRef<THREE.Mesh>(null);
  const pigmentGroupRef = useRef<THREE.Group>(null);

  // Pigment data for different inks
  const pigmentData = {
    black: [
      { color: '#FFD700', height: 0.3, name: 'Yellow' },
      { color: '#FF4500', height: 0.5, name: 'Orange' },
      { color: '#DC143C', height: 0.7, name: 'Red' },
      { color: '#000080', height: 0.9, name: 'Blue' }
    ],
    blue: [
      { color: '#00CED1', height: 0.4, name: 'Cyan' },
      { color: '#000080', height: 0.8, name: 'Blue' }
    ],
    red: [
      { color: '#FFD700', height: 0.3, name: 'Yellow' },
      { color: '#DC143C', height: 0.7, name: 'Red' }
    ]
  };

  useFrame((state, delta) => {
    if (experimentStarted && solventHeight < 1.5) {
      // Animate solvent rising
      setSolventHeight(prev => Math.min(prev + delta * 0.2, 1.5));

      // Animate pigment separation
      setPigmentSeparation(prev => Math.min(prev + delta * 0.15, 1));

      // Update solvent visual
      if (solventRef.current) {
        solventRef.current.scale.y = solventHeight;
        solventRef.current.position.y = 1.0 + (solventHeight * 0.5);
      }

      // Update pigment positions
      if (pigmentGroupRef.current && pigmentSeparation > 0) {
        pigmentGroupRef.current.children.forEach((child, index) => {
          const pigment = pigmentData[selectedInk][index];
          if (pigment) {
            child.position.y = 1.0 + (pigment.height * pigmentSeparation);
            const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            // Keep pigments fully visible once they start separating
            material.opacity = pigmentSeparation > 0.1 ? 1.0 : 0;
          }
        });
      }

      if (solventHeight >= 1.4 && pigmentSeparation >= 0.9) {
        onExperimentComplete?.(`Chromatography complete! ${selectedInk} ink separated into ${pigmentData[selectedInk].length} pigments.`);
      }
    }
  });

  const applyInk = () => {
    setInkApplied(true);
  };

  const startChromatography = () => {
    if (inkApplied) {
      setExperimentStarted(true);
      setSolventHeight(0.1);
    }
  };

  const resetExperiment = () => {
    setExperimentStarted(false);
    setSolventHeight(0);
    setPigmentSeparation(0);
    setInkApplied(false);

    if (solventRef.current) {
      solventRef.current.scale.y = 0.1;
      solventRef.current.position.y = 1.05;
    }

    if (pigmentGroupRef.current) {
      pigmentGroupRef.current.children.forEach((child) => {
        child.position.y = 1.0;
        const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        material.opacity = 0;
      });
    }
  };

  return (
    <group>
      {/* Beaker with solvent */}
      <group position={[0, 1.54, 0.5]}>
        {/* Beaker */}
        <mesh ref={beakerRef} castShadow>
          <cylinderGeometry args={[0.4, 0.35, 1.5, 16]} />
          <meshStandardMaterial color="#e8f4f8" transparent opacity={0.3} />
        </mesh>

        {/* Beaker rim */}
        <mesh position={[0, 0.75, 0]}>
          <torusGeometry args={[0.4, 0.02, 8, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Solvent (water/ethanol) */}
        <mesh ref={solventRef} position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.35, 0.32, 0.2, 16]} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Filter Paper */}
      <mesh ref={paperRef} position={[0, 1.54, 0.5]} castShadow>
        <planeGeometry args={[0.3, 2]} />
        <meshStandardMaterial color="#f5f5f5" side={THREE.DoubleSide} />
      </mesh>

      {/* Paper Graduations/Markings */}
      <group position={[0, 1.54, 0.51]}>
        {/* Major graduation lines (every cm) */}
        {Array.from({ length: 11 }, (_, i) => (
          <group key={`major-${i}`} position={[0, 0.9 - (i * 0.18), 0]}>
            {/* Major line */}
            <mesh position={[0.12, 0, 0]}>
              <planeGeometry args={[0.05, 0.005]} />
              <meshStandardMaterial color="#2c3e50" />
            </mesh>
            {/* Measurement number */}
            <Text
              position={[0.18, 0, 0]}
              fontSize={0.025}
              color="#2c3e50"
              anchorX="left"
              anchorY="middle"
            >
              {i}
            </Text>
          </group>
        ))}
        
        {/* Minor graduation lines (every 0.5 cm) */}
        {Array.from({ length: 21 }, (_, i) => (
          <mesh key={`minor-${i}`} position={[0.135, 0.9 - (i * 0.09), 0]}>
            <planeGeometry args={[0.025, 0.003]} />
            <meshStandardMaterial color="#7f8c8d" />
          </mesh>
        ))}
        
        {/* Unit label */}
        <Text
          position={[0.18, -1.05, 0]}
          fontSize={0.02}
          color="#2c3e50"
          anchorX="left"
          anchorY="middle"
        >
          cm
        </Text>
      </group>

      {/* Pencil baseline */}
      <mesh position={[0, 0.74, 0.51]}>
        <planeGeometry args={[0.25, 0.02]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Ink spot - stays visible throughout experiment */}
      {inkApplied && (
        <mesh position={[0, 0.74, 0.52]}>
          <circleGeometry args={[0.03, 8]} />
          <meshStandardMaterial 
            color={selectedInk === 'black' ? '#000000' : selectedInk === 'blue' ? '#0000FF' : '#FF0000'} 
            transparent
            opacity={experimentStarted ? 0.7 : 1.0}
          />
        </mesh>
      )}

      {/* Separated Pigments */}
      <group ref={pigmentGroupRef}>
        {pigmentData[selectedInk].map((pigment, index) => (
          <mesh key={index} position={[0, 1.0, 0.52]}>
            <circleGeometry args={[0.025, 8]} />
            <meshStandardMaterial 
              color={pigment.color} 
              transparent 
              opacity={0}
            />
          </mesh>
        ))}
      </group>

      {/* Ink Selection Area */}
      <group position={[-2, 1.59, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.1}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Select Ink Type
        </Text>

        {/* Current selection indicator */}
        <Text
          position={[0, 0.15, 0]}
          fontSize={0.07}
          color="#27ae60"
          anchorX="center"
          anchorY="middle"
        >
          Current: {selectedInk.toUpperCase()} ink
        </Text>

        {/* Black Ink */}
        <group position={[-0.3, 0, 0]}>
          <mesh 
            onClick={() => setSelectedInk('black')}
            castShadow
          >
            <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
            <meshStandardMaterial 
              color="#000000" 
              emissive={selectedInk === 'black' ? '#333333' : '#000000'}
            />
          </mesh>
          {/* Selection highlight ring */}
          {selectedInk === 'black' && (
            <mesh position={[0, 0, 0]}>
              <ringGeometry args={[0.06, 0.08, 16]} />
              <meshStandardMaterial 
                color="#FFD700" 
                emissive="#FFD700"
                emissiveIntensity={0.5}
              />
            </mesh>
          )}
          <Text
            position={[0, -0.15, 0]}
            fontSize={0.04}
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            Black
          </Text>
        </group>

        {/* Blue Ink */}
        <group position={[0, 0, 0]}>
          <mesh 
            onClick={() => setSelectedInk('blue')}
            castShadow
          >
            <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
            <meshStandardMaterial 
              color="#0000FF" 
              emissive={selectedInk === 'blue' ? '#0000AA' : '#000000'}
            />
          </mesh>
          {/* Selection highlight ring */}
          {selectedInk === 'blue' && (
            <mesh position={[0, 0, 0]}>
              <ringGeometry args={[0.06, 0.08, 16]} />
              <meshStandardMaterial 
                color="#FFD700" 
                emissive="#FFD700"
                emissiveIntensity={0.5}
              />
            </mesh>
          )}
          <Text
            position={[0, -0.15, 0]}
            fontSize={0.04}
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            Blue
          </Text>
        </group>

        {/* Red Ink */}
        <group position={[0.3, 0, 0]}>
          <mesh 
            onClick={() => setSelectedInk('red')}
            castShadow
          >
            <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
            <meshStandardMaterial 
              color="#FF0000" 
              emissive={selectedInk === 'red' ? '#AA0000' : '#000000'}
            />
          </mesh>
          {/* Selection highlight ring */}
          {selectedInk === 'red' && (
            <mesh position={[0, 0, 0]}>
              <ringGeometry args={[0.06, 0.08, 16]} />
              <meshStandardMaterial 
                color="#FFD700" 
                emissive="#FFD700"
                emissiveIntensity={0.5}
              />
            </mesh>
          )}
          <Text
            position={[0, -0.15, 0]}
            fontSize={0.04}
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            Red
          </Text>
        </group>
      </group>

      {/* Controls */}
      <group position={[1.3, 1.59, 0.8]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.08}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Chromatography Controls
        </Text>

        {/* Apply Ink Button */}
        <mesh 
          position={[0, 0.1, 0]} 
          onClick={applyInk}
          castShadow
        >
          <boxGeometry args={[0.3, 0.08, 0.05]} />
          <meshStandardMaterial 
            color={inkApplied ? "#27ae60" : "#3498db"} 
          />
        </mesh>
        <Text
          position={[0, 0.1, 0.03]}
          fontSize={0.04}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {inkApplied ? "Ink Applied" : "Apply Ink"}
        </Text>

        {/* Start Button */}
        <mesh 
          position={[0, -0.1, 0]} 
          onClick={startChromatography}
          castShadow
        >
          <boxGeometry args={[0.3, 0.08, 0.05]} />
          <meshStandardMaterial 
            color={experimentStarted ? "#e74c3c" : "#f39c12"} 
          />
        </mesh>
        <Text
          position={[0, -0.1, 0.03]}
          fontSize={0.04}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {experimentStarted ? "Running..." : "Start"}
        </Text>

        {/* Reset Button */}
        <mesh 
          position={[0, -0.3, 0]} 
          onClick={resetExperiment}
          castShadow
        >
          <boxGeometry args={[0.3, 0.08, 0.05]} />
          <meshStandardMaterial color="#95a5a6" />
        </mesh>
        <Text
          position={[0, -0.3, 0.03]}
          fontSize={0.04}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Reset
        </Text>
      </group>

      {/* Equipment Labels */}
      <group position={[0, 2.8, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.08}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Filter Paper
        </Text>
        <Text
          position={[0, -0.15, 0]}
          fontSize={0.05}
          color="#7f8c8d"
          anchorX="center"
          anchorY="middle"
        >
          (Stationary Phase)
        </Text>
      </group>

      <group position={[0, 0.9, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.08}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Solvent
        </Text>
        <Text
          position={[0, -0.15, 0]}
          fontSize={0.05}
          color="#7f8c8d"
          anchorX="center"
          anchorY="middle"
        >
          (Mobile Phase)
        </Text>
      </group>

      <group position={[0.5, 0.74, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.06}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Baseline
        </Text>
      </group>

      {/* Experiment Instructions */}
      <group position={[0, 2.5, -2.5]}>
        <mesh>
          <planeGeometry args={[3, 1.5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        <Text
          position={[0, 0.5, 0.01]}
          fontSize={0.1}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Paper Chromatography
        </Text>

        <Text
          position={[0, 0.2, 0.01]}
          fontSize={0.06}
          color="#7f8c8d"
          anchorX="center"
          anchorY="middle"
        >
          1. Select ink type
        </Text>

        <Text
          position={[0, 0.0, 0.01]}
          fontSize={0.06}
          color="#7f8c8d"
          anchorX="center"
          anchorY="middle"
        >
          2. Apply ink to baseline
        </Text>

        <Text
          position={[0, -0.2, 0.01]}
          fontSize={0.06}
          color="#7f8c8d"
          anchorX="center"
          anchorY="middle"
        >
          3. Start chromatography
        </Text>

        <Text
          position={[0, -0.4, 0.01]}
          fontSize={0.06}
          color="#7f8c8d"
          anchorX="center"
          anchorY="middle"
        >
          4. Observe pigment separation
        </Text>

        <Text
          position={[0, -0.6, 0.01]}
          fontSize={0.06}
          color="#7f8c8d"
          anchorX="center"
          anchorY="middle"
        >
          5. Measure distances using markings
        </Text>
      </group>

      {/* Results Display */}
      {pigmentSeparation > 0.5 && (
        <group position={[-2.5, 2, 0]}>
          <mesh>
            <planeGeometry args={[2, 1.5]} />
            <meshStandardMaterial color="#ecf0f1" />
          </mesh>

          <Text
            position={[0, 0.6, 0.01]}
            fontSize={0.08}
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            Chromatogram Results
          </Text>

          <Text
            position={[0, 0.4, 0.01]}
            fontSize={0.05}
            color="#7f8c8d"
            anchorX="center"
            anchorY="middle"
          >
            Separated Pigments in {selectedInk} ink:
          </Text>

          {pigmentData[selectedInk].map((pigment, index) => (
            <group key={index}>
              <Text
                position={[-0.3, 0.2 - (index * 0.12), 0.01]}
                fontSize={0.045}
                color={pigment.color}
                anchorX="left"
                anchorY="middle"
              >
                • {pigment.name}
              </Text>
              <Text
                position={[0.3, 0.2 - (index * 0.12), 0.01]}
                fontSize={0.035}
                color="#7f8c8d"
                anchorX="left"
                anchorY="middle"
              >
                Distance: {(pigment.height * pigmentSeparation * 10).toFixed(1)} cm
              </Text>
            </group>
          ))}

          {/* Add solvent front distance for Rf calculation */}
          <Text
            position={[0, -0.3, 0.01]}
            fontSize={0.04}
            color="#e74c3c"
            anchorX="center"
            anchorY="middle"
          >
            Solvent Front: {(solventHeight * 10).toFixed(1)} cm
          </Text>

          <Text
            position={[0, -0.45, 0.01]}
            fontSize={0.035}
            color="#7f8c8d"
            anchorX="center"
            anchorY="middle"
          >
            Calculate Rf = Distance traveled by pigment ÷ Distance traveled by solvent
          </Text>

          <Text
            position={[0, -0.5, 0.01]}
            fontSize={0.04}
            color="#7f8c8d"
            anchorX="center"
            anchorY="middle"
          >
            Different pigments travel at different rates
          </Text>
        </group>
      )}

      {/* Solvent Front Label */}
      {experimentStarted && solventHeight > 0.5 && (
        <group position={[0.7, 1.54 + (solventHeight * 0.8), 0.5]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.05}
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            Solvent Front
          </Text>
        </group>
      )}
    </group>
  );
};

export default PaperChromatographyLab;