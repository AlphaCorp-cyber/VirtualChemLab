import { useXR, useXREvent } from "@react-three/xr";
import { useFrame, useThree } from "@react-three/fiber";
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { checkCollision, getDistance } from "../lib/labPhysics";

export function VRControls() {
  const { session } = useXR();
  const { camera, scene } = useThree();
  const { selectedStripId, grabTestStrip, releaseTestStrip, testStripInLiquid, beakers } = useChemistryLab();
  const [subscribe, getState] = useKeyboardControls();
  const movementVector = useRef(new THREE.Vector3());
  
  // Hand tracking states
  const [leftHandPosition, setLeftHandPosition] = useState(new THREE.Vector3());
  const [rightHandPosition, setRightHandPosition] = useState(new THREE.Vector3());
  const [leftHandGripping, setLeftHandGripping] = useState(false);
  const [rightHandGripping, setRightHandGripping] = useState(false);
  const [grippedObject, setGrippedObject] = useState<string | null>(null);
  const [pourGesture, setPourGesture] = useState(false);
  
  // Hand collision detection
  const handRadius = 0.1; // 10cm interaction radius for natural hand picking
  
  // Controller references
  const leftControllerRef = useRef<THREE.Group>(null);
  const rightControllerRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // VR and keyboard movement system
    const controls = getState();
    const speed = 3 * delta;
    
    // Movement controls work in both VR and desktop mode
    if (controls.forward) {
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
      camera.position.addScaledVector(forward, speed);
    }
    
    if (controls.back) {
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
      camera.position.addScaledVector(forward, speed);
    }
    
    if (controls.left) {
      const right = new THREE.Vector3(-1, 0, 0);
      right.applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();
      camera.position.addScaledVector(right, speed);
    }
    
    if (controls.right) {
      const right = new THREE.Vector3(1, 0, 0);
      right.applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();
      camera.position.addScaledVector(right, speed);
    }

    // VR Hand Tracking and Interactions
    if (session && leftControllerRef.current && rightControllerRef.current) {
      // Update hand positions from VR controllers
      const leftPos = new THREE.Vector3();
      const rightPos = new THREE.Vector3();
      
      leftControllerRef.current.getWorldPosition(leftPos);
      rightControllerRef.current.getWorldPosition(rightPos);
      
      setLeftHandPosition(leftPos);
      setRightHandPosition(rightPos);
      
      // Simple hand interaction: detect when hands are close to objects
      // Check for nearby test strips to grab
      const stripPositions = [
        { id: 'indicator-1', pos: new THREE.Vector3(1.2, 1.0, -0.5) },
        { id: 'indicator-2', pos: new THREE.Vector3(1.3, 1.0, -0.5) },
        { id: 'indicator-3', pos: new THREE.Vector3(1.4, 1.0, -0.5) }
      ];
      
      // Auto-grab when hand gets close to test strip
      stripPositions.forEach(strip => {
        const leftDistance = leftPos.distanceTo(strip.pos);
        const rightDistance = rightPos.distanceTo(strip.pos);
        
        if ((leftDistance < handRadius || rightDistance < handRadius) && !selectedStripId) {
          console.log(`Hand grabbed test strip: ${strip.id} (distance: ${Math.min(leftDistance, rightDistance).toFixed(2)}m)`);
          grabTestStrip(strip.id);
          setGrippedObject(strip.id);
          setLeftHandGripping(leftDistance < rightDistance);
          setRightHandGripping(rightDistance < leftDistance);
        }
      });
      
      // Auto-pour when holding strip over beaker
      if (grippedObject && (leftHandGripping || rightHandGripping)) {
        const handPos = leftHandGripping ? leftPos : rightPos;
        
        beakers.forEach(beaker => {
          const beakerPos = new THREE.Vector3(...beaker.position);
          const distance = handPos.distanceTo(beakerPos);
          
          if (distance < 0.25) { // Within pouring range
            console.log(`Pouring ${grippedObject} into ${beaker.solutionName} (distance: ${distance.toFixed(2)}m)`);
            testStripInLiquid(grippedObject, beaker.id);
            
            // Auto-release after pouring
            setTimeout(() => {
              releaseTestStrip();
              setGrippedObject(null);
              setLeftHandGripping(false);
              setRightHandGripping(false);
            }, 1000);
          }
        });
      }
    }

    // Fallback keyboard controls for desktop mode
    if (!session) {
      if (controls.grab && !selectedStripId) {
        grabTestStrip('indicator-1');
      }
      
      if (controls.release && selectedStripId) {
        releaseTestStrip();
      }
    }
  });
  


  return (
    <>
      {/* VR Hand Controllers with Enhanced Hand Models */}
      {session && (
        <group>
          {/* Left Hand Controller */}
          <group ref={leftControllerRef} position={[-0.3, 1.2, -0.5]}>
            {/* Hand Palm */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.12, 0.04]} />
              <meshStandardMaterial 
                color={leftHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>
            
            {/* Fingers */}
            {[0, 1, 2, 3].map(i => (
              <mesh key={i} position={[(-1.5 + i) * 0.02, 0.08, 0]}>
                <boxGeometry args={[0.015, 0.06, 0.02]} />
                <meshStandardMaterial 
                  color={leftHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                  roughness={0.6}
                />
              </mesh>
            ))}
            
            {/* Thumb */}
            <mesh position={[-0.04, 0.02, 0.02]} rotation={[0, 0, Math.PI/4]}>
              <boxGeometry args={[0.015, 0.05, 0.015]} />
              <meshStandardMaterial 
                color={leftHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>
            
            {/* Visual feedback for interaction */}
            {leftHandGripping && (
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.02]} />
                <meshStandardMaterial 
                  color="#00FF00" 
                  emissive="#00FF00" 
                  emissiveIntensity={0.3}
                />
              </mesh>
            )}
          </group>
          
          {/* Right Hand Controller */}
          <group ref={rightControllerRef} position={[0.3, 1.2, -0.5]}>
            {/* Hand Palm */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.12, 0.04]} />
              <meshStandardMaterial 
                color={rightHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>
            
            {/* Fingers */}
            {[0, 1, 2, 3].map(i => (
              <mesh key={i} position={[(-1.5 + i) * 0.02, 0.08, 0]}>
                <boxGeometry args={[0.015, 0.06, 0.02]} />
                <meshStandardMaterial 
                  color={rightHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                  roughness={0.6}
                />
              </mesh>
            ))}
            
            {/* Thumb */}
            <mesh position={[0.04, 0.02, 0.02]} rotation={[0, 0, -Math.PI/4]}>
              <boxGeometry args={[0.015, 0.05, 0.015]} />
              <meshStandardMaterial 
                color={rightHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>
            
            {/* Visual feedback for interaction */}
            {rightHandGripping && (
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.02]} />
                <meshStandardMaterial 
                  color="#00FF00" 
                  emissive="#00FF00" 
                  emissiveIntensity={0.3}
                />
              </mesh>
            )}
          </group>
          
          {/* Pouring Effect Visualization */}
          {pourGesture && grippedObject && (
            <group position={leftHandGripping ? leftHandPosition.toArray() : rightHandPosition.toArray()}>
              {/* Liquid stream particles */}
              {[0, 1, 2, 3, 4].map(i => (
                <mesh key={i} position={[0, -i * 0.05, 0]}>
                  <sphereGeometry args={[0.005]} />
                  <meshStandardMaterial 
                    color="#4FC3F7" 
                    transparent 
                    opacity={1 - i * 0.2}
                  />
                </mesh>
              ))}
            </group>
          )}
        </group>
      )}
    </>
  );
}