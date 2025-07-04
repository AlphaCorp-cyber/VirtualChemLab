import React, { useState, useRef, useEffect } from 'react';
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
      {/* Outer dish */}
      <mesh
        onClick={onSelect}
        userData={{ interactable: true }}
      >
        <cylinderGeometry args={[0.4, 0.4, 0.1]} />
        <meshStandardMaterial 
          color={isSelected ? "#3498db" : "#000000"} 
        />
      </mesh>
      
      {/* Inner black surface */}
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.01]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Salt solution - bluish water with animated level */}
      {liquidLevel > 0 && (
        <mesh position={[0, 0.045 + (liquidLevel * 0.02), 0]}>
          <cylinderGeometry args={[0.36 * liquidLevel, 0.36 * liquidLevel, liquidLevel * 0.04]} />
          <meshStandardMaterial 
            color="#4A90E2" 
            transparent 
            opacity={0.8}
            emissive="#1E3A8A"
            emissiveIntensity={0.1}
          />
        </mesh>
      )}
      
      {/* Salt crystals - highly visible sparkly white crystals with multiple layers */}
      {saltCrystals && (
        <group>
          {/* Bright reflective base layer - very visible */}
          <mesh position={[0, 0.055, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.025]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff"
              emissiveIntensity={1.0}
              roughness={0.0}
              metalness={0.8}
            />
          </mesh>
          
          {/* Sparkly crystal layer */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.02]} />
            <meshStandardMaterial 
              color="#f0f8ff" 
              emissive="#f0f8ff"
              emissiveIntensity={0.8}
              roughness={0.1}
              metalness={0.5}
            />
          </mesh>
          
          {/* Individual crystal formations - more visible */}
          {Array.from({ length: 16 }, (_, i) => (
            <mesh 
              key={i}
              position={[
                Math.cos(i * Math.PI / 8) * (0.15 + Math.random() * 0.15),
                0.065 + Math.random() * 0.01,
                Math.sin(i * Math.PI / 8) * (0.15 + Math.random() * 0.15)
              ]}
              rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
            >
              <boxGeometry args={[0.04, 0.015, 0.04]} />
              <meshStandardMaterial 
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.9}
                roughness={0.0}
                metalness={0.7}
              />
            </mesh>
          ))}
          
          {/* Large center crystal highlight */}
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.015]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff"
              emissiveIntensity={1.2}
              roughness={0.0}
              metalness={1.0}
            />
          </mesh>
          
          {/* Bright edge crystals for extra visibility */}
          {Array.from({ length: 8 }, (_, i) => (
            <mesh 
              key={`edge-${i}`}
              position={[
                Math.cos(i * Math.PI / 4) * 0.3,
                0.068,
                Math.sin(i * Math.PI / 4) * 0.3
              ]}
            >
              <coneGeometry args={[0.02, 0.025, 6]} />
              <meshStandardMaterial 
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={1.0}
                roughness={0.0}
                metalness={0.9}
              />
            </mesh>
          ))}
          
          {/* Glowing outline for maximum visibility */}
          <mesh position={[0, 0.055, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.001]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff"
              emissiveIntensity={1.5}
              transparent
              opacity={0.8}
            />
          </mesh>
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
      
      {/* Flame */}
      {isLit && (
        <mesh 
          ref={flameRef}
          position={[0, 0.35, 0]}
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
  const [experimentStage, setExperimentStage] = useState<'setup' | 'heating' | 'evaporating' | 'complete'>('setup');
  const [isLit, setIsLit] = useState(false);
  const [liquidLevel, setLiquidLevel] = useState(1);
  const [saltCrystals, setSaltCrystals] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showSmoke, setShowSmoke] = useState(false);

  const handleHeating = () => {
    if (selectedTool === 'dish' && isLit && experimentStage === 'setup') {
      setExperimentStage('heating');
      setShowSmoke(true);
      setCountdown(10);
      
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
                "Evaporation to dryness completed successfully! The bluish water has completely evaporated, " +
                "leaving behind white salt crystals in the black evaporating dish. This separation technique " +
                "is used to recover dissolved solids from their solutions."
              );
            }
            return 0;
          }
          
          // Smoothly reduce liquid level proportionally
          const newLiquidLevel = newCount / 10;
          setLiquidLevel(newLiquidLevel);
          return newCount;
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
    setCountdown(10);
    setShowSmoke(false);
  };

  return (
    <group>
      {/* Enhanced lighting for crystal visibility */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight
        position={[2, 5, 2]}
        intensity={1.5}
        color="#ffffff"
        castShadow
      />
      
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
        position={[0, 1.46, -1]} 
        isLit={isLit}
        onToggle={() => setIsLit(!isLit)}
      />
      
      {/* Smoke effects during heating */}
      <SmokeParticles 
        position={[0, 2.1, -1]} 
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
          <Text3D 
            position={[1.5, 3.3, -0.98]} 
            text="EVAPORATING" 
            fontSize={0.06} 
            color="#e67e22" 
          />
          <Text3D 
            position={[1.5, 3.1, -0.98]} 
            text={`${countdown}s remaining`} 
            fontSize={0.08} 
            color="#2c3e50" 
          />
        </group>
      )}

      {/* Equipment Labels - Above equipment */}
      <mesh position={[0, 1.2, -1]}>
        <planeGeometry args={[1.5, 0.2]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <Text3D position={[0, 1.2, -0.98]} text="Bunsen Burner" fontSize={0.06} color="#ffffff" />

      <mesh position={[0, 2.4, -1]}>
        <planeGeometry args={[1.8, 0.2]} />
        <meshStandardMaterial color="#f39c12" />
      </mesh>
      <Text3D position={[0, 2.4, -0.98]} text="Evaporating Dish" fontSize={0.06} color="#ffffff" />

      <mesh position={[0, 2.8, -1]}>
        <planeGeometry args={[1.5, 0.2]} />
        <meshStandardMaterial color="#95a5a6" />
      </mesh>
      <Text3D position={[0, 2.8, -0.98]} text="Tripod Stand" fontSize={0.06} color="#ffffff" />

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
      <Text3D position={[3.5, 3.5, -0.98]} text="EVAPORATION LAB" fontSize={0.12} color="#e67e22" />
      
      {/* Instructions */}
      <Text3D position={[3.5, 3.0, -0.98]} text="1. Click Bunsen burner to light" fontSize={0.08} color="#2c3e50" />
      <Text3D position={[3.5, 2.6, -0.98]} text="2. Click evaporating dish to start" fontSize={0.08} color="#2c3e50" />
      <Text3D position={[3.5, 2.2, -0.98]} text="3. Watch water evaporate away" fontSize={0.08} color="#2c3e50" />
      <Text3D position={[3.5, 1.8, -0.98]} text="4. Salt crystals remain behind" fontSize={0.08} color="#2c3e50" />
      <Text3D position={[3.5, 1.4, -0.98]} text="5. Separation complete!" fontSize={0.08} color="#2c3e50" />

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
          <Text3D 
            position={[1.5, 3.4, -0.98]} 
            text="COMPLETE!" 
            fontSize={0.08} 
            color="#27ae60" 
          />
          <Text3D 
            position={[1.5, 3.2, -0.98]} 
            text="Salt crystals" 
            fontSize={0.06} 
            color="#2c3e50" 
          />
          <Text3D 
            position={[1.5, 3.0, -0.98]} 
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
      <mesh 
        position={[1.5, 0.6, -1]}
        onClick={resetExperiment}
        userData={{ interactable: true }}
      >
        <planeGeometry args={[1.0, 0.3]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <mesh position={[1.5, 0.6, -0.99]}>
        <planeGeometry args={[0.9, 0.25]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <Text3D 
        position={[1.5, 0.6, -0.98]} 
        text="RESET" 
        fontSize={0.08} 
        color="#e74c3c" 
      />

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