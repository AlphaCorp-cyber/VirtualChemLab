import { useXR } from "@react-three/xr";
import { useFrame, useThree } from "@react-three/fiber";
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useKeyboardControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export function VRControls() {
  const { session } = useXR();
  const { camera } = useThree();
  const { selectedStripId, grabTestStrip, releaseTestStrip } = useChemistryLab();
  const [subscribe, getState] = useKeyboardControls();
  const movementVector = useRef(new THREE.Vector3());

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

    // Interaction controls
    if (controls.grab && !selectedStripId) {
      grabTestStrip('indicator-1');
    }
    
    if (controls.release && selectedStripId) {
      releaseTestStrip();
    }
  });

  return (
    <>
      {/* VR Hand Controllers Visualization */}
      {session && (
        <group>
          <mesh position={[-0.3, 1.2, -0.5]}>
            <boxGeometry args={[0.05, 0.15, 0.05]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          
          <mesh position={[0.3, 1.2, -0.5]}>
            <boxGeometry args={[0.05, 0.15, 0.05]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      )}
    </>
  );
}