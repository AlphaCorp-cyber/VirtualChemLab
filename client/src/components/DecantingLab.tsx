import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LabelText, InstructionText, Text3D } from './Text3D';

interface DecantingLabProps {
  onExperimentComplete?: (result: string) => void;
}

function DecantingBeaker({ position, isSelected, onSelect, liquidLevel, sedimentLevel, isPouring, wineColor }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  liquidLevel: number;
  sedimentLevel: number;
  isPouring: boolean;
  wineColor: string;
}) {
  const beakerRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (beakerRef.current && isPouring) {
      // Realistic pouring angle - tilt beaker towards receiving beaker
      beakerRef.current.rotation.z = -0.4; // 23 degree tilt
      beakerRef.current.position.x = position[0] + 2.2; // Move much closer to receiving beaker
      beakerRef.current.position.y = position[1] + 0.3; // Lift higher for better pouring angle
    } else if (beakerRef.current && !isPouring) {
      beakerRef.current.rotation.z = 0;
      beakerRef.current.position.x = position[0];
      beakerRef.current.position.y = position[1];
    }
  });

  return (
    <group ref={beakerRef} position={position}>
      {/* Glass beaker - clear glass */}
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.8]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.2}
        />
      </mesh>

      {/* Beaker outline */}
      <mesh>
        <cylinderGeometry args={[0.305, 0.305, 0.805]} />
        <meshStandardMaterial 
          color="#000000" 
          transparent
          opacity={0.8}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Sediment layer (dark red wine sediment) - more visible and realistic */}
      {sedimentLevel > 0 && (
        <mesh position={[0, -0.3 + sedimentLevel / 2, 0]}>
          <cylinderGeometry args={[0.28, 0.28, sedimentLevel]} />
          <meshStandardMaterial 
            color="#2D0A0A" 
            roughness={0.9}
            metalness={0.05}
            emissive="#1A0505"
            emissiveIntensity={0.1}
          />
        </mesh>
      )}

      {/* Clear separation line between sediment and wine */}
      {sedimentLevel > 0 && liquidLevel > 0 && (
        <mesh position={[0, -0.3 + sedimentLevel, 0]}>
          <cylinderGeometry args={[0.285, 0.285, 0.005]} />
          <meshStandardMaterial 
            color="#2A0A0A" 
            transparent 
            opacity={0.6}
          />
        </mesh>
      )}

      {/* Liquid layer (wine) - clearer and more transparent */}
      {liquidLevel > 0 && (
        <mesh position={[0, -0.3 + sedimentLevel + liquidLevel / 2, 0]}>
          <cylinderGeometry args={[0.28, 0.28, liquidLevel]} />
          <meshStandardMaterial 
            color={wineColor} 
            transparent 
            opacity={0.9}
            emissive={wineColor}
            emissiveIntensity={0.2}
            roughness={0.05}
            metalness={0.02}
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
      {/* Transparent glass beaker - clear with just outline */}
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.8]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.1}
          roughness={0.02}
          metalness={0.1}
        />
      </mesh>

      {/* Glass beaker outline for visibility */}
      <mesh>
        <cylinderGeometry args={[0.305, 0.305, 0.805]} />
        <meshStandardMaterial 
          color="#000000" 
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Decanted liquid - clearer wine color */}
      {liquidLevel > 0 && (
        <mesh position={[0, -0.3 + liquidLevel / 2, 0]}>
          <cylinderGeometry args={[0.28, 0.28, liquidLevel]} />
          <meshStandardMaterial 
            color="#DC143C" 
            transparent 
            opacity={0.8}
            emissive="#8B0000"
            emissiveIntensity={0.1}
            roughness={0.1}
            metalness={0.05}
          />
        </mesh>
      )}

      {/* Liquid surface reflection */}
      {liquidLevel > 0 && (
        <mesh position={[0, -0.3 + liquidLevel, 0]}>
          <cylinderGeometry args={[0.275, 0.275, 0.002]} />
          <meshStandardMaterial 
            color="#FF6B6B" 
            transparent 
            opacity={0.4}
            emissive="#FF6B6B"
            emissiveIntensity={0.2}
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
  const streamRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (streamRef.current && isVisible) {
      // Create flowing wine effect
      const time = state.clock.elapsedTime;
      streamRef.current.children.forEach((droplet, index) => {
        const mesh = droplet as THREE.Mesh;
        mesh.position.y = startPos[1] - (time * 2 + index * 0.2) % 1.0;
        mesh.visible = mesh.position.y > endPos[1];
      });
    }
  });

  if (!isVisible) return null;

  return (
    <group ref={streamRef}>
      {/* Multiple droplets to create realistic wine stream */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[startPos[0] + 0.5, startPos[1] - i * 0.15, startPos[2]]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial 
            color="#DC143C" 
            transparent 
            opacity={0.9}
            emissive="#8B0000"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

export function DecantingLab({ onExperimentComplete }: DecantingLabProps) {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [experimentStage, setExperimentStage] = useState<'setup' | 'settling' | 'decanting' | 'complete'>('setup');
  const [sourceLiquidLevel, setSourceLiquidLevel] = useState(0.5);
  const [sourceSedimentLevel, setSedimentLevel] = useState(0);
  const [receivingLiquidLevel, setReceivingLiquidLevel] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [showStream, setShowStream] = useState(false);
  const [wineColor, setWineColor] = useState('#722F37'); // Start with deep dark wine color

  const handleSettling = () => {
    if (experimentStage === 'setup') {
      setExperimentStage('settling');

      // Animate sediment settling with realistic color changes
      let currentSediment = 0;
      const settlingInterval = setInterval(() => {
        currentSediment += 0.02;
        setSedimentLevel(currentSediment);
        
        // Adjust liquid level so total (sediment + liquid) = 0.5
        // As sediment forms at bottom, liquid level reduces but stays on top
        const totalOriginalVolume = 0.5;
        const minLiquidLevel = 0.1;
        const adjustedLiquidLevel = Math.max(totalOriginalVolume - currentSediment, minLiquidLevel);
        setSourceLiquidLevel(adjustedLiquidLevel);// Keep proper volume balance
        
        // Gradually change wine color from deep red to clearer as sediment settles
        const settlingProgress = currentSediment / 0.15;
        const newColor = interpolateColor('#722F37', '#DC143C', settlingProgress); // Lighter, clearer wine color
        setWineColor(newColor);
        
        if (currentSediment >= 0.15) {
          clearInterval(settlingInterval);
          // Ensure final state: sediment (0.15) + liquid (0.35) = 0.5 total
          setTimeout(() => {
            setWineColor('#DC143C'); // Brighter, more visible wine color
            setSedimentLevel(0.15); // Final sediment level - clearly visible dark layer
            setSourceLiquidLevel(0.25); // Final liquid level - clearly visible on top
            setExperimentStage('decanting');
          }, 100);
        }
      }, 300); // Slower, more realistic settling
    }
  };

  // Helper function to interpolate between colors
  const interpolateColor = (color1: string, color2: string, factor: number) => {
    // Clamp factor between 0 and 1
    const clampedFactor = Math.max(0, Math.min(1, factor));
    
    const c1 = parseInt(color1.substring(1), 16);
    const c2 = parseInt(color2.substring(1), 16);
    
    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;
    
    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;
    
    const r = Math.round(r1 + (r2 - r1) * clampedFactor);
    const g = Math.round(g1 + (g2 - g1) * clampedFactor);
    const b = Math.round(b1 + (b2 - b1) * clampedFactor);
    
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const handleDecanting = () => {
    if (experimentStage === 'decanting') {
      setIsPouring(true);
      setShowStream(true);

      // Animate the decanting process - slower and more realistic
      const decantingInterval = setInterval(() => {
        setSourceLiquidLevel(prev => {
          const newLevel = prev - 0.025; // Slower pouring
          if (newLevel <= 0) { // Pour out all liquid, leave only sediment
            setIsPouring(false);
            setShowStream(false);
            setExperimentStage('complete');
            clearInterval(decantingInterval);

            if (onExperimentComplete) {
              onExperimentComplete(
                "Decanting completed successfully! The clear wine has been carefully poured off, " +
                "leaving only the dark sediment behind in the original beaker. This separation technique " +
                "is used to separate clear liquids from settled solids."
              );
            }
            return 0; // Remove all liquid, leave only sediment
          }
          return newLevel;
        });

        setReceivingLiquidLevel(prev => prev + 0.025);
      }, 400); // Slower pouring animation
    }
  };

  const resetExperiment = () => {
    setExperimentStage('setup');
    setSourceLiquidLevel(0.5);
    setSedimentLevel(0);
    setReceivingLiquidLevel(0);
    setIsPouring(false);
    setShowStream(false);
    setSelectedTool('');
    setWineColor('#722F37'); // Reset to initial deep dark wine color
  };

  return (
    <group>
      {/* Equipment positioned on the existing white lab table */}
      <DecantingBeaker 
        position={[-2.5, 1.9, -1]} 
        isSelected={false}
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
        wineColor={wineColor}
      />

      <ReceivingBeaker 
        position={[0.5, 1.9, -1]} 
        isSelected={selectedTool === 'receiving'}
        onSelect={() => setSelectedTool('receiving')}
        liquidLevel={receivingLiquidLevel}
      />

      {/* Liquid stream animation */}
      <LiquidStream 
        startPos={[-1.5, 2.2, -1]}
        endPos={[0.2, 1.9, -1]}
        isVisible={showStream}
      />

      {/* Equipment Labels */}
      <mesh position={[-3.5, 2.0, 1]}>
        <planeGeometry args={[1.3, 0.25]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <Text3D position={[-3.5, 2.0, 1]} text="Source Beaker" fontSize={0.1} color="#ffffff" />

      <mesh position={[1.3, 2.0, 1]}>
        <planeGeometry args={[1.3, 0.25]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      <Text3D position={[1.3, 2.0, 1]} text="Receiving Beaker" fontSize={0.1} color="#ffffff" />

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
      <Text3D position={[0, 3.5, -0.98]} text="1. Click wine beaker to start settling" fontSize={0.08} color="#2c3e50" />
      <Text3D position={[0, 3.3, -0.98]} text="2. Watch sediment settle to bottom" fontSize={0.08} color="#2c3e50" />
      <Text3D position={[0, 3.1, -0.98]} text="3. Click again to pour wine carefully" fontSize={0.08} color="#2c3e50" />
      <Text3D position={[0, 2.9, -0.98]} text="4. Clear wine separates from sediment" fontSize={0.08} color="#2c3e50" />

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
        <>
          <mesh 
            position={[3, 1.8, -1]} 
            onClick={resetExperiment}
            userData={{ interactable: true }}
          >
            <boxGeometry args={[1, 0.3, 0.1]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
          <Text3D position={[3, 1.8, -0.98]} text="RESET" fontSize={0.06} color="#ffffff" />
        </>
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