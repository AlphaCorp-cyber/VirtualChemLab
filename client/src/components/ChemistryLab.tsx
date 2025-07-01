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
    
    // Constrain camera movement to lab area
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5, 5);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -2, 5);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.5, 3);
  });

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 3, 0]} intensity={0.5} />
      
      {/* Lab environment and equipment */}
      <LabEnvironment />
      <LabEquipment />
    </>
  );
}
