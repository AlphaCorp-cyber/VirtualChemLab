import { useFrame } from "@react-three/fiber";
import { LabEnvironment } from "./LabEnvironment";
import { LabEquipment } from "./LabEquipment";
import { FlameTestLab } from "./FlameTestLab";
import DisplacementLab from './DisplacementLab';
import PHTestStrip from './PHTestStrip';
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useKeyboardControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export function ChemistryLab() {
  const cameraRef = useRef<THREE.Camera>();
  const { updatePhysics, currentExperiment } = useChemistryLab();
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
      {/* Enhanced lighting setup for better beaker rim visibility */}
      <ambientLight intensity={0.8} color="#f8f9fa" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Dedicated beaker rim lighting */}
      <pointLight position={[0, 2.2, -1]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-2, 2.2, -1]} intensity={0.6} color="#ffffff" />
      <pointLight position={[2, 2.2, -1]} intensity={0.6} color="#ffffff" />

      {/* Top-down lighting for beaker rims */}
      <directionalLight
        position={[0, 5, 0]}
        target-position={[0, 1.6, -1]}
        intensity={0.7}
        color="#ffffff"
      />

      {/* Enhanced rim highlighting lights */}
      <pointLight position={[-1, 1.9, -0.8]} intensity={0.5} color="#e8f4f8" />
      <pointLight position={[0, 1.9, -0.8]} intensity={0.5} color="#e8f4f8" />
      <pointLight position={[1, 1.9, -0.8]} intensity={0.5} color="#e8f4f8" />

      {/* Focused spotlights on beaker tops */}
      <spotLight
        position={[-2, 3, -1]}
        target-position={[-2, 1.6, -0.8]}
        angle={Math.PI / 6}
        penumbra={0.2}
        intensity={0.6}
        color="#ffffff"
      />
      <spotLight
        position={[0, 3, -1]}
        target-position={[0, 1.6, -0.8]}
        angle={Math.PI / 6}
        penumbra={0.2}
        intensity={0.6}
        color="#ffffff"
      />
      <spotLight
        position={[2, 3, -1]}
        target-position={[2, 1.6, -0.8]}
        angle={Math.PI / 6}
        penumbra={0.2}
        intensity={0.6}
        color="#ffffff"
      />

      {/* Lab environment and equipment */}
      <LabEnvironment />
      {currentExperiment === "pH Testing" && <LabEquipment />}
      {currentExperiment === "Flame Tests" && <FlameTestLab />}

        {currentExperiment === "Displacement Reactions" && (
          <DisplacementLab onExperimentComplete={handleExperimentComplete} />
        )}
    </>
  );
}