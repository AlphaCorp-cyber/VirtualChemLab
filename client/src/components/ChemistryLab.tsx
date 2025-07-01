import { useFrame } from "@react-three/fiber";
import { LabEnvironment } from "./LabEnvironment";
import { LabEquipment } from "./LabEquipment";
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useKeyboardControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export function ChemistryLab() {
  const cameraRef = useRef<THREE.Camera>();
  const { updatePhysics } = useChemistryLab();
  const [subscribe, getState] = useKeyboardControls();

  useFrame((state, delta) => {
    // Update physics simulation
    updatePhysics(delta);
    
    // Handle camera movement for non-VR mode
    const controls = getState();
    const camera = state.camera;
    const speed = 2;
    
    if (controls.forward) {
      camera.position.z -= speed * delta;
    }
    if (controls.backward) {
      camera.position.z += speed * delta;
    }
    if (controls.leftward) {
      camera.position.x -= speed * delta;
    }
    if (controls.rightward) {
      camera.position.x += speed * delta;
    }
    
    // Add up/down movement for top-down view
    if (controls.interact) {
      camera.position.y += speed * delta;
    }
    if (controls.grab) {
      camera.position.y -= speed * delta;
    }
    
    // Top-down view toggle with release key
    if (controls.release) {
      // Set camera to top-down position and look down
      camera.position.set(0, 8, 0);
      camera.lookAt(0, 0, 0);
    }
    
    // Constrain camera movement to lab area
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -8, 8);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5, 8);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.5, 12);
  });

  return (
    <>
      {/* Enhanced lighting setup for better glass visibility */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 3, 0]} intensity={0.5} />
      
      {/* Enhanced lighting for VR glass visibility */}
      <pointLight position={[-2, 2, -1]} intensity={0.5} color="#ffffff" />
      <pointLight position={[2, 2, -1]} intensity={0.5} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.4} color="#ffffff" />
      
      {/* VR-specific rim lighting for glass objects */}
      <pointLight position={[-1, 1.8, 0]} intensity={0.3} color="#e3f2fd" />
      <pointLight position={[1, 1.8, 0]} intensity={0.3} color="#e3f2fd" />
      <pointLight position={[0, 1.8, 1]} intensity={0.3} color="#e3f2fd" />
      
      {/* Overhead spotlights for glass highlighting */}
      <spotLight
        position={[0, 3, 0]}
        target-position={[0, 1.5, 0]}
        angle={Math.PI / 3}
        penumbra={0.3}
        intensity={0.4}
        color="#ffffff"
        castShadow
      />
      
      {/* Lab environment and equipment */}
      <LabEnvironment />
      <LabEquipment />
    </>
  );
}
