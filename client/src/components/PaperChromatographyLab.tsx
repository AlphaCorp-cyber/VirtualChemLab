
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
            material.opacity = Math.min(pigmentSeparation * 2, 1);
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
      {/* Lab Bench */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[6, 0.1, 3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Beaker with solvent */}
      <group position={[0, 1, 0]}>
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
      <mesh ref={paperRef} position={[0, 1, 0]} castShadow>
        <planeGeometry args={[0.3, 2]} />
        <meshStandardMaterial color="#f5f5f5" side={THREE.DoubleSide} />
      </mesh>

      {/* Pencil baseline */}
      <mesh position={[0, 0.2, 0.01]}>
        <planeGeometry args={[0.25, 0.02]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Ink spot */}
      {inkApplied && (
        <mesh position={[0, 0.2, 0.02]}>
          <circleGeometry args={[0.03, 8]} />
          <meshStandardMaterial 
            color={selectedInk === 'black' ? '#000000' : selectedInk === 'blue' ? '#0000FF' : '#FF0000'} 
          />
        </mesh>
      )}

      {/* Separated Pigments */}
      <group ref={pigmentGroupRef}>
        {pigmentData[selectedInk].map((pigment, index) => (
          <mesh key={index} position={[0, 1.0, 0.02]}>
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
      <group position={[-2, 1.5, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.1}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Select Ink Type
        </Text>
        
        {/* Black Ink */}
        <mesh 
          position={[-0.3, 0, 0]} 
          onClick={() => setSelectedInk('black')}
          castShadow
        >
          <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
          <meshStandardMaterial 
            color="#000000" 
            emissive={selectedInk === 'black' ? '#333333' : '#000000'}
          />
        </mesh>
        
        {/* Blue Ink */}
        <mesh 
          position={[0, 0, 0]} 
          onClick={() => setSelectedInk('blue')}
          castShadow
        >
          <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
          <meshStandardMaterial 
            color="#0000FF" 
            emissive={selectedInk === 'blue' ? '#0000AA' : '#000000'}
          />
        </mesh>
        
        {/* Red Ink */}
        <mesh 
          position={[0.3, 0, 0]} 
          onClick={() => setSelectedInk('red')}
          castShadow
        >
          <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
          <meshStandardMaterial 
            color="#FF0000" 
            emissive={selectedInk === 'red' ? '#AA0000' : '#000000'}
          />
        </mesh>
      </group>

      {/* Controls */}
      <group position={[2, 1.5, 0]}>
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
      </group>

      {/* Results Display */}
      {pigmentSeparation > 0.5 && (
        <group position={[-3, 2, 0]}>
          <mesh>
            <planeGeometry args={[1.5, 1]} />
            <meshStandardMaterial color="#ecf0f1" />
          </mesh>
          
          <Text
            position={[0, 0.3, 0.01]}
            fontSize={0.08}
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            Separated Pigments
          </Text>
          
          {pigmentData[selectedInk].map((pigment, index) => (
            <Text
              key={index}
              position={[0, 0.1 - (index * 0.1), 0.01]}
              fontSize={0.05}
              color={pigment.color}
              anchorX="center"
              anchorY="middle"
            >
              {pigment.name}
            </Text>
          ))}
        </group>
      )}
    </group>
  );
};

export default PaperChromatographyLab;
import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Plane } from '@react-three/drei';
import * as THREE from 'three';

interface PaperChromatographyLabProps {
  onExperimentComplete?: (result: string) => void;
}

export default function PaperChromatographyLab({ onExperimentComplete }: PaperChromatographyLabProps) {
  const [experimentStarted, setExperimentStarted] = useState(false);
  const [solventHeight, setSolventHeight] = useState(0.1);
  const [pigmentSeparation, setPigmentSeparation] = useState(0);
  const [inkApplied, setInkApplied] = useState(false);
  const [paperInSolvent, setPaperInSolvent] = useState(false);
  
  const paperRef = useRef<THREE.Mesh>(null);
  const solventRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (experimentStarted && paperInSolvent) {
      // Animate solvent rising
      setSolventHeight(prev => Math.min(prev + delta * 0.5, 2.5));
      
      // Animate pigment separation
      setPigmentSeparation(prev => Math.min(prev + delta * 0.3, 1));
      
      // Complete experiment when separation is done
      if (pigmentSeparation > 0.9 && onExperimentComplete) {
        onExperimentComplete("Chromatography separation complete!");
      }
    }
  });

  const handleInkApplication = () => {
    setInkApplied(true);
  };

  const handlePaperPlacement = () => {
    if (inkApplied) {
      setPaperInSolvent(true);
      setExperimentStarted(true);
    }
  };

  return (
    <>
      {/* Lab bench */}
      <Box position={[0, 0.5, 0]} args={[6, 0.1, 4]} receiveShadow>
        <meshStandardMaterial color="#8B4513" />
      </Box>

      {/* Beaker with solvent */}
      <group position={[-1, 1, 0]}>
        {/* Beaker walls */}
        <Cylinder
          position={[0, 0.5, 0]}
          args={[1, 1, 2, 32, 1, true]}
          castShadow
        >
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </Cylinder>
        
        {/* Solvent */}
        <Cylinder
          ref={solventRef}
          position={[0, -0.5 + solventHeight/2, 0]}
          args={[0.9, 0.9, solventHeight, 32]}
          castShadow
        >
          <meshStandardMaterial 
            color="#87CEEB" 
            transparent 
            opacity={0.7}
          />
        </Cylinder>
      </group>

      {/* Filter paper */}
      <group position={[-1, 1.5, 0]}>
        <Plane
          ref={paperRef}
          args={[0.3, 3]}
          rotation={[0, 0, 0]}
          castShadow
        >
          <meshStandardMaterial color="#f5f5f5" />
        </Plane>
        
        {/* Pencil baseline */}
        <Plane
          position={[0, -1.2, 0.01]}
          args={[0.25, 0.02]}
        >
          <meshStandardMaterial color="#333333" />
        </Plane>
        
        {/* Ink spot */}
        {inkApplied && (
          <Cylinder
            position={[0, -1.2, 0.02]}
            args={[0.03, 0.03, 0.01, 16]}
          >
            <meshStandardMaterial color="#000000" />
          </Cylinder>
        )}
        
        {/* Separated pigments */}
        {pigmentSeparation > 0 && (
          <>
            {/* Blue pigment */}
            <Cylinder
              position={[0, -1.2 + (pigmentSeparation * 0.8), 0.02]}
              args={[0.02, 0.02, 0.01, 16]}
            >
              <meshStandardMaterial color="#0000ff" />
            </Cylinder>
            
            {/* Red pigment */}
            <Cylinder
              position={[0, -1.2 + (pigmentSeparation * 0.5), 0.02]}
              args={[0.02, 0.02, 0.01, 16]}
            >
              <meshStandardMaterial color="#ff0000" />
            </Cylinder>
            
            {/* Yellow pigment */}
            <Cylinder
              position={[0, -1.2 + (pigmentSeparation * 1.2), 0.02]}
              args={[0.02, 0.02, 0.01, 16]}
            >
              <meshStandardMaterial color="#ffff00" />
            </Cylinder>
          </>
        )}
      </group>

      {/* Ink dropper */}
      <group position={[1, 1.2, 0]}>
        <Cylinder
          args={[0.05, 0.05, 0.8, 16]}
          castShadow
        >
          <meshStandardMaterial color="#333333" />
        </Cylinder>
        <Cylinder
          position={[0, -0.5, 0]}
          args={[0.02, 0.02, 0.3, 16]}
          castShadow
        >
          <meshStandardMaterial color="#333333" />
        </Cylinder>
      </group>

      {/* Interactive areas */}
      {!inkApplied && (
        <Box
          position={[1, 1.2, 0]}
          args={[0.2, 0.2, 0.2]}
          onClick={handleInkApplication}
          transparent
          opacity={0}
        />
      )}
      
      {inkApplied && !paperInSolvent && (
        <Box
          position={[-1, 1.5, 0]}
          args={[0.5, 3.2, 0.2]}
          onClick={handlePaperPlacement}
          transparent
          opacity={0}
        />
      )}

      {/* Lighting */}
      <pointLight
        position={[0, 3, 2]}
        intensity={0.8}
        color="#ffffff"
        castShadow
      />
      
      <ambientLight intensity={0.4} />
    </>
  );
}
