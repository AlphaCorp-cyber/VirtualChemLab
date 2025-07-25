import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LabelText, InstructionText, Text3D } from './Text3D';
import { useChemistryLab } from '../lib/stores/useChemistryLab';

interface EvaporationLabProps {
  onExperimentComplete?: (result: string) => void;
}

function WaterBeaker({ position, isSelected, onSelect, isEmpty, isPouring }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  isEmpty: boolean;
  isPouring: boolean;
}) {
  const beakerRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (beakerRef.current && isPouring) {
      // Tilt beaker towards evaporating dish for realistic pouring
      beakerRef.current.rotation.z = -0.6;
      beakerRef.current.position.x = position[0] + 0.8;
      beakerRef.current.position.y = position[1] + 0.8; // Higher above the dish
    } else if (beakerRef.current && !isPouring) {
      beakerRef.current.rotation.z = 0;
      beakerRef.current.position.x = position[0];
      beakerRef.current.position.y = position[1];
    }
  });

  return (
    <group ref={beakerRef} position={position}>
      {/* Glass beaker - clear with outline */}
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.25, 0.25, 0.6]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.2}
        />
      </mesh>

      {/* Beaker outline for visibility */}
      <mesh>
        <cylinderGeometry args={[0.255, 0.255, 0.605]} />
        <meshStandardMaterial 
          color="#000000" 
          transparent
          opacity={0.6}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Water - clear blue water */}
      {!isEmpty && (
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.4]} />
          <meshStandardMaterial 
            color="#4A90E2" 
            transparent 
            opacity={0.8}
            emissive="#1E3A8A"
            emissiveIntensity={0.1}
          />
        </mesh>
      )}

      {/* Water surface reflection */}
      {!isEmpty && (
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.002]} />
          <meshStandardMaterial 
            color="#87CEEB" 
            transparent 
            opacity={0.6}
            emissive="#87CEEB"
            emissiveIntensity={0.2}
          />
        </mesh>
      )}

      {/* Pouring spout indicator */}
      <mesh position={[0.3, 0.2, 0]} rotation={[0, 0, Math.PI/6]}>
        <cylinderGeometry args={[0.02, 0.03, 0.1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

function WaterStream({ startPos, endPos, isVisible }: {
  startPos: [number, number, number];
  endPos: [number, number, number];
  isVisible: boolean;
}) {
  const streamRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (streamRef.current && isVisible) {
      const time = state.clock.elapsedTime;
      streamRef.current.children.forEach((droplet, index) => {
        const mesh = droplet as THREE.Mesh;
        const progress = (time * 2 + index * 0.2) % 1.5;

        if (progress < 1.0) {
          const t = progress;
          mesh.position.x = startPos[0] + (endPos[0] - startPos[0]) * t;
          mesh.position.y = startPos[1] + (endPos[1] - startPos[1]) * t - 0.3 * t * t;
          mesh.position.z = startPos[2];
          mesh.visible = true;
        } else {
          mesh.visible = false;
        }
      });
    }
  });

  if (!isVisible) return null;

  return (
    <group ref={streamRef}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={startPos}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial 
            color="#4A90E2" 
            transparent 
            opacity={0.9}
            emissive="#1E3A8A"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function EvaporatingDish({ position, isSelected, onSelect, liquidLevel, saltCrystals, hasSaltSolution }: {
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  liquidLevel: number;
  saltCrystals: boolean;
  hasSaltSolution: boolean;
}) {
  return (
    <group position={position}>
      {/* Glass evaporating dish - clear and simple bowl shape */}
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#ffffff"
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.0}
        />
      </mesh>

      {/* Simple black outline for clarity */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.405, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#000000"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Salt solution - bluish water with animated level */}
      {liquidLevel > 0 && hasSaltSolution && (
        <mesh position={[0, -0.35 + (liquidLevel * 0.15), 0]}>
          <cylinderGeometry args={[0.38 * Math.sqrt(liquidLevel), 0.38 * Math.sqrt(liquidLevel), liquidLevel * 0.3]} />
          <meshStandardMaterial 
            color="#4A90E2" 
            transparent 
            opacity={0.9}
            emissive="#1E3A8A"
            emissiveIntensity={0.15}
          />
        </mesh>
      )}

      {/* Salt crystals - curved to match dish shape */}
      {saltCrystals && (
        <group>
          {/* Main salt layer - curved sphere section matching dish */}
          <mesh position={[0, 2.44, 0]}>
            <sphereGeometry args={[0.35, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 3]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff"
              emissiveIntensity={0.8}
              roughness={0.1}
            />
          </mesh>

          {/* Additional salt accumulation in center (thicker) */}
          <mesh position={[0, 2.24, 0]}>
            <sphereGeometry args={[0.25, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 4]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff"
              emissiveIntensity={1.9}
              roughness={0.05}
            />
          </mesh>

          {/* Crystal texture following the curved surface */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * Math.PI * 2) / 12;
            const radius = 0.15 + Math.random() * 0.15;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = -0.35 + Math.sqrt(Math.max(0, 0.35 * 0.35 - x * x - z * z)) * 0.3;

            return (
              <mesh 
                key={i}
                position={[x, y, z]}
                rotation={[Math.random() * 0.3, Math.random() * Math.PI * 2, Math.random() * 0.3]}
              >
                <boxGeometry args={[0.02, 0.005, 0.02]} />
                <meshStandardMaterial 
                  color="#ffffff"
                  emissive="#ffffff"
                  emissiveIntensity={1.7}
                /> 
              </mesh>
            );
          })}
        </group>
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
      {/* Burner base - properly sized for table height */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Burner top */}
      <mesh position={[0, 0.125, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* Flame - Much more visible */}
      {isLit && (
        <group position={[0, 0.35, 0]}>
          {/* Outer flame - bright orange */}
          <mesh 
            ref={flameRef}
            onClick={onToggle}
            userData={{ interactable: true }}
          >
            <coneGeometry args={[0.12, 0.45, 8]} />
            <meshStandardMaterial 
              color="#ff4500" 
              transparent 
              opacity={0.9}
              emissive="#ff4500"
              emissiveIntensity={1.5}
            />
          </mesh>

          {/* Inner flame - bright blue core */}
          <mesh position={[0, 0.05, 0]}>
            <coneGeometry args={[0.06, 0.25, 8]} />
            <meshStandardMaterial 
              color="#0099ff" 
              transparent 
              opacity={0.8}
              emissive="#0099ff"
              emissiveIntensity={1.2}
            />
          </mesh>

          {/* Flame glow effect */}
          <mesh position={[0, 0, 0]}>
            <coneGeometry args={[0.15, 0.5, 8]} />
            <meshStandardMaterial 
              color="#ffaa00" 
              transparent 
              opacity={0.3}
              emissive="#ffaa00"
              emissiveIntensity={0.8}
            />
          </mesh>

          {/* Enhanced flame lighting */}
          <pointLight 
            position={[0, 0.1, 0]} 
            intensity={2.5} 
            color="#ff6600"
            distance={3}
            decay={1}
          />
          <pointLight 
            position={[0, 0.2, 0]} 
            intensity={1.5} 
            color="#0099ff"
            distance={2}
            decay={1}
          />
        </group>
      )}

      {/* Control knob - black by default, red when lit */}
      <mesh 
        position={[0.25, 0.1, 0]}
        onClick={onToggle}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.05, 0.05, 0.15]} />
        <meshStandardMaterial color={isLit ? "#e74c3c" : "#2c3e50"} />
      </mesh>

      {/* Click indicator for knob */}
      <mesh position={[0.25, 0.1, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.16]} />
        <meshStandardMaterial 
          color={isLit ? "#e74c3c" : "#2c3e50"} 
          transparent 
          opacity={0.3}
        />
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

function SmokeParticles({ position, isActive }: {
  position: [number, number, number];
  isActive: boolean;
}) {
  const smokeRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Mesh[]>([]);

  useFrame(() => {
    if (smokeRef.current && isActive) {
      particlesRef.current.forEach((particle, index) => {
        if (particle) {
          particle.position.y += 0.02;
          particle.position.x += Math.sin(Date.now() * 0.001 + index) * 0.005;
          particle.position.z += Math.cos(Date.now() * 0.001 + index) * 0.005;
          particle.scale.setScalar(0.05 + Math.sin(Date.now() * 0.002 + index) * 0.02);

          // Reset particle if it goes too high
          if (particle.position.y > 1) {
            particle.position.y = 0;
            particle.position.x = (Math.random() - 0.5) * 0.2;
            particle.position.z = (Math.random() - 0.5) * 0.2;
          }
        }
      });
    }
  });

  if (!isActive) return null;

  return (
    <group ref={smokeRef} position={position}>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          ref={el => {
            if (el) particlesRef.current[i] = el;
          }}
          position={[
            (Math.random() - 0.5) * 0.2,
            Math.random() * 0.5,
            (Math.random() - 0.5) * 0.2
          ]}
        >
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial 
            color="#f0f0f0" 
            transparent 
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

export function EvaporationLab({ onExperimentComplete }: EvaporationLabProps) {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [experimentStage, setExperimentStage] = useState<'setup' | 'pour-water' | 'light-burner' | 'heating' | 'evaporating' | 'complete'>('setup');
  const [isLit, setIsLit] = useState(false);
  const [liquidLevel, setLiquidLevel] = useState(0);
  const [saltCrystals, setSaltCrystals] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [showSmoke, setShowSmoke] = useState(false);
  const [waterBeakerEmpty, setWaterBeakerEmpty] = useState(false);
  const [isPouring, setIsPouring] = useState(false);
  const [showWaterStream, setShowWaterStream] = useState(false);
  const [hasSaltSolution, setHasSaltSolution] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const { updateEvaporationProgress } = useChemistryLab();

  const handleWaterPour = () => {
    if (experimentStage === 'setup') {
      setExperimentStage('pour-water');
      setIsPouring(true);
      setShowWaterStream(true);

      // Simulate pouring duration
      setTimeout(() => {
        setWaterBeakerEmpty(true);
        setLiquidLevel(1);
        setHasSaltSolution(true);
        setIsPouring(false);
        setShowWaterStream(false);
        setExperimentStage('light-burner');
      }, 2000);
    }
  };

  const handleBurnerToggle = () => {
    const newLitState = !isLit;
    setIsLit(newLitState);

    // If burner is lit and we have salt solution, start evaporation automatically
    if (newLitState && hasSaltSolution && experimentStage === 'light-burner') {
      setExperimentStage('heating');
      setShowSmoke(true);
      setCountdown(8);

      // Start evaporation process with smooth countdown and liquid level animation
      const evaporationInterval = setInterval(() => {
        setCountdown(prev => {
          const newCount = prev - 1;
          if (newCount <= 0) {
            // Complete evaporation
            setSaltCrystals(true);
            setExperimentStage('complete');
            setShowSmoke(false);
            setLiquidLevel(0);
            clearInterval(evaporationInterval);

            if (onExperimentComplete) {
              onExperimentComplete(
                "Evaporation to dryness completed successfully! The salt water has completely evaporated, " +
                "leaving behind white salt crystals in the black evaporating dish. This separation technique " +
                "is used to recover dissolved solids from their solutions."
              );
            }
            return 0;
          }

          // Smoothly reduce liquid level proportionally
          const newLiquidLevel = newCount / 8;
          setLiquidLevel(newLiquidLevel);
          return newCount;
        });
      }, 1000);
    }
  };

  const resetExperiment = () => {
    setExperimentStage('setup');
    setIsLit(false);
    setLiquidLevel(0);
    setSaltCrystals(false);
    setSelectedTool('');
    setCountdown(8);
    setShowSmoke(false);
    setWaterBeakerEmpty(false);
    setIsPouring(false);
    setShowWaterStream(false);
    setHasSaltSolution(false);
  };

  useFrame((state, delta) => {
    if (isLit && liquidLevel > 0 && experimentStage === 'heating') {
      const newProgress = Math.min(liquidLevel, 1);
      setLiquidLevel(prev => {
        const newLevel = Math.max(0, prev - delta * 0.125); // Reduced evaporation rate
        if (newLevel <= 0 && !saltCrystals) {
          setSaltCrystals(true);
          setShowSmoke(false);
          setExperimentStage('complete');
          if (!hasCompleted) {
              setHasCompleted(true);
              updateEvaporationProgress();
              if (onExperimentComplete) {
                  onExperimentComplete("Salt crystals formed through evaporation");
              }
          }
        }
        return newLevel;
      });
    }
  });

  return (
    <group>
      {/* Enhanced lighting for crystal visibility and flame */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight
        position={[2, 5, 2]}
        intensity={1.5}
        color="#ffffff"
        castShadow
      />

      {/* Additional lighting for flame visibility */}
      {isLit && (
        <>
          <pointLight 
            position={[0, 3, -1]} 
            intensity={1.0} 
            color="#ff6600"
            distance={4}
            decay={1}
          />
          <spotLight
            position={[1, 3, 0]}
            angle={Math.PI / 4}
            penumbra={0.3}
            intensity={0.8}
            color="#ff6600"
            target-position={[0, 1.8, -1]}
          />
        </>
      )}

      {/* Bright spotlight for salt crystals when visible */}
      {saltCrystals && (
        <spotLight
          position={[0, 3, -1]}
          angle={Math.PI / 6}
          penumbra={0.2}
          intensity={2.0}
          color="#ffffff"
          target-position={[0, 2.0, -1]}
          castShadow
        />
      )}

      {/* Equipment positioned on the existing white lab table */}
      <WaterBeaker 
        position={[-1.2, 1.9, -1]} 
        isSelected={experimentStage === 'setup'}
        onSelect={handleWaterPour}
        isEmpty={waterBeakerEmpty}
        isPouring={isPouring}
      />

      <WaterStream 
        startPos={[-0.4, 2.7, -1]}
        endPos={[0, 2.65, -1]}
        isVisible={showWaterStream}
      />

      <TripodStand position={[0, 1.55, -1]} />

      <EvaporatingDish 
        position={[0, 2.52, -1]} 
        isSelected={false}
        onSelect={() => {}}
        liquidLevel={liquidLevel}
        saltCrystals={saltCrystals}
        hasSaltSolution={hasSaltSolution}
      />

      <BunsenBurner 
        position={[0, 1.46, -1]} 
        isLit={isLit}
        onToggle={handleBurnerToggle}
      />

      {/* Smoke effects during heating */}
      <SmokeParticles 
        position={[0, 2.6, -1]} 
        isActive={showSmoke}
      />

      {/* Countdown timer display - Above equipment */}
      {experimentStage === 'heating' && (
        <group>
          <mesh position={[1.5, 3.2, -1]}>
            <planeGeometry args={[1.0, 0.4]} />
            <meshStandardMaterial color="#34495e" />
          </mesh>
          <mesh position={[1.5, 3.2, -0.99]}>
            <planeGeometry args={[0.9, 0.3]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <Text3D position={[1.5, 3.3, -0.98]} 
            text="EVAPORATING" 
            fontSize={0.06} 
            color="#e67e22" 
         />
          <Text3D position={[1.5, 3.1, -0.98]} 
            text={`${countdown}s remaining`} 
            fontSize={0.08} 
            color="#2c3e50" 
         />
        </group>
      )}

      {/* Equipment Labels - Above equipment */}


      <mesh position={[1, 1.6, -0.39]}>
        <planeGeometry args={[1.0, 0.2]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <Text3D position={[1, 1.62, -0.38]} text="Bunsen Burner knob" fontSize={0.06} color="#ffffff"/>

      <mesh position={[-1, 1.6, -0.39]}>
        <planeGeometry args={[1.0, 0.2]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <Text3D position={[-1, 1.62, -0.38]} text="Solution Beaker" fontSize={0.06} color="#ffffff"/>

      <mesh position={[0, 2.8, -1]}>
        <planeGeometry args={[1.5, 0.2]} />
        <meshStandardMaterial color="#95a5a6" />
      </mesh>
      <Text3D position={[0, 2.8, -0.98]} text="Tripod Stand" fontSize={0.06} color="#ffffff"/>

      {/* Instructions Panel */}
      <mesh position={[3.5, 2.5, -1]}>
        <planeGeometry args={[4, 2.5]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      <mesh position={[3.5, 2.5, -0.99]}>
        <planeGeometry args={[3.8, 2.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Title */}
      <Text3D position={[3.5, 3.5, -0.98]} text="EVAPORATION LAB" fontSize={0.12} color="#e67e22"/>

      {/* Instructions */}
      <Text3D position={[3.5, 3.0, -0.98]} text="1. Click water beaker to pour" fontSize={0.08} color="#2c3e50"/>
      <Text3D position={[3.5, 2.6, -0.98]} text="2. Click Bunsen burner to light" fontSize={0.08} color="#2c3e50"/>
      <Text3D position={[3.5, 2.2, -0.98]} text="3. Evaporation starts automatically" fontSize={0.08} color="#2c3e50"/>
      <Text3D position={[3.5, 1.8, -0.98]} text="4. Watch water evaporate away" fontSize={0.08} color="#2c3e50"/>
      <Text3D position={[3.5, 1.4, -0.98]} text="5. Salt crystals remain behind" fontSize={0.08} color="#2c3e50"/>

      {/* Completion status - Above equipment */}
      {experimentStage === 'complete' && (
        <group>
          <mesh position={[1.5, 3.2, -1]}>
            <planeGeometry args={[1.8, 0.6]} />
            <meshStandardMaterial color="#27ae60" />
          </mesh>
          <mesh position={[1.5, 3.2, -0.99]}>
            <planeGeometry args={[1.7, 0.5]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <Text3D position={[1.5, 3.4, -0.98]} 
            text="COMPLETE!" 
            fontSize={0.08} 
            color="#27ae60" 
         />
          <Text3D position={[1.5, 3.2, -0.98]} 
            text="Salt crystals" 
            fontSize={0.06} 
            color="#2c3e50" 
         />
          <Text3D position={[1.5, 3.0, -0.98]} 
            text="recovered!" 
            fontSize={0.06} 
            color="#2c3e50" 
         />
        </group>
      )}

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
            experimentStage === 'pour-water' ? "#9b59b6" :
            experimentStage === 'light-burner' ? "#e74c3c" :
            experimentStage === 'heating' ? "#f39c12" :
            experimentStage === 'evaporating' ? "#e67e22" : "#27ae60"
          } 
        />
      </mesh>

      <mesh position={[0, 4.5, 0.01]}>
        <planeGeometry args={[7.5, 0.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <Text3D position={[0, 4.5, 0.01]} 
        text={
          experimentStage === 'setup' ? "CLICK WATER BEAKER TO POUR SALT SOLUTION" :
          experimentStage === 'pour-water' ? "POURING SALT SOLUTION..." :
          experimentStage === 'light-burner' ? "CLICK BUNSEN BURNER TO START HEATING" :
          experimentStage === 'heating' ? "HEATING - EVAPORATION IN PROGRESS..." : 
          experimentStage === 'evaporating' ? "WATER EVAPORATING..." : "EVAPORATION COMPLETE!"
        }
        fontSize={0.08} 
        color="#2c3e50" 
     />

      {/* Reset button - positioned on table surface */}
      <mesh 
        position={[2.5, 1.9, -1]}
        onClick={resetExperiment}
        userData={{ interactable: true }}
      >
        <boxGeometry args={[0.8, 0.2, 0.1]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>

      <Text3D position={[2.5, 1.9, -0.95]} 
        text="RESET" 
        fontSize={0.08} 
        color="#ffffff" 
     />

      {/* Step indicators with arrows */}
      {experimentStage === 'setup' && (
        <mesh position={[-2, 2.5, 0]} rotation={[0, 0, -Math.PI/4]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
      )}

      {experimentStage === 'light-burner' && (
        <mesh position={[0.5, 1.7, 0]} rotation={[0, 0, -Math.PI/4]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      )}

      {experimentStage === 'pour-water' && (
        <mesh position={[-1, 2.6, 0]} rotation={[0, 0, -Math.PI/6]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color="#9b59b6" />
        </mesh>
      )}
    </group>
  );
}