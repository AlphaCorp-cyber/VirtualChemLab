import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import { ChemistryLab } from "./components/ChemistryLab";
import { LabUI } from "./components/LabUI";
import { useAudio } from "./lib/stores/useAudio";
import { useChemistryLab } from "./lib/stores/useChemistryLab";
import "@fontsource/inter";

// Define control keys for the lab
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "interact", keys: ["KeyE", "Space"] }, // Move up
  { name: "grab", keys: ["KeyG"] }, // Move down
  { name: "release", keys: ["KeyR"] }, // Top-down view
];

function App() {
  const { initializeAudio } = useAudio();
  const { initializeLab } = useChemistryLab();

  useEffect(() => {
    initializeAudio();
    initializeLab();
  }, [initializeAudio, initializeLab]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={controls}>
        <Canvas
            shadows
            camera={{
              position: [0, 1.6, 3],
              fov: 75,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              powerPreference: "high-performance"
            }}
          >
            <color attach="background" args={["#f0f8ff"]} />
            
            <Suspense fallback={null}>
              <ChemistryLab />
            </Suspense>
          </Canvas>
      </KeyboardControls>
      
      <LabUI />
    </div>
  );
}

export default App;
