import { useFrame } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import { LabEnvironment } from "./LabEnvironment";
import { LabEquipment } from "./LabEquipment";
import { FlameTestLab } from "./FlameTestLab";
import { GasTestLab } from "./GasTestLab";
import DisplacementLab from './DisplacementLab';
import PaperChromatographyLab from './PaperChromatographyLab';
import { FiltrationLab } from './FiltrationLab';
import { EvaporationLab } from './EvaporationLab';
import { DecantingLab } from './DecantingLab';
import { PHTestStrip } from './PHTestStrip';
import { VRControls } from './VRControls';
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

interface ChemistryLabProps {
  mobileControls?: {
    forward: boolean;
    backward: boolean; 
    leftward: boolean;
    rightward: boolean;
    up: boolean;
    down: boolean;
  };
}

export function ChemistryLab({ mobileControls }: ChemistryLabProps = {}) {
  const { session } = useXR();
  const cameraRef = useRef<THREE.Camera>();
  const { updatePhysics, currentExperiment, vrTableHeight } = useChemistryLab();
  const [subscribe, getState] = useKeyboardControls();
  const [vrHeight, setVrHeight] = useState(0.0); // Initial height adjustment at eye level
  
  const isInVR = !!session;
  
  // VR controller input handling
  useEffect(() => {
    if (!isInVR || !session) return;
    
    const handleInputSourceChange = () => {
      if (session.inputSources) {
        session.inputSources.forEach((inputSource) => {
          if (inputSource.gamepad) {
            const gamepad = inputSource.gamepad;
            
            // Use thumbstick for height adjustment
            // Right thumbstick Y-axis (axis 3) for height control
            if (gamepad.axes && gamepad.axes.length > 3) {
              const thumbstickY = gamepad.axes[3]; // Right thumbstick Y
              
              if (Math.abs(thumbstickY) > 0.1) { // Dead zone
                setVrHeight(prev => {
                  const newHeight = prev + (thumbstickY * 0.01); // Smooth adjustment
                  return Math.max(-3.0, Math.min(1.0, newHeight));
                });
              }
            }
            
            // Alternative: Use shoulder buttons for discrete adjustment
            if (gamepad.buttons) {
              // Right shoulder button (index 5) - raise height
              if (gamepad.buttons[5] && gamepad.buttons[5].pressed) {
                setVrHeight(prev => Math.min(prev + 0.02, 1.0));
              }
              // Left shoulder button (index 4) - lower height  
              if (gamepad.buttons[4] && gamepad.buttons[4].pressed) {
                setVrHeight(prev => Math.max(prev - 0.02, -3.0));
              }
            }
          }
        });
      }
    };

    const animationFrame = () => {
      if (session && isInVR) {
        handleInputSourceChange();
      }
      requestAnimationFrame(animationFrame);
    };
    
    animationFrame();
  }, [isInVR, session]);

  const handleExperimentComplete = (result: string) => {
    console.log("Experiment completed:", result);
  };

  useFrame((state, delta) => {
    // Update physics simulation
    updatePhysics(delta);

    const controls = getState();
    
    // Only handle camera movement for non-VR mode
    if (!isInVR) {
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

      // Desktop camera height controls with E and Q - much slower
      if (controls.interact) { // E key - raise camera
        camera.position.y += speed * delta * 0.25;
      }
      if (controls.jump) { // Q key - lower camera
        camera.position.y -= speed * delta * 0.25;
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
    } else {
      // VR Height adjustment controls (only in VR mode)
      if (controls.interact) { // E key - raise lab in VR
        setVrHeight(prev => Math.min(prev + 1.0 * delta, 1.0));
      }
      if (controls.grab) { // G key - lower lab in VR
        setVrHeight(prev => Math.max(prev - 1.0 * delta, -3.0));
      }
    }
  });

  return (
    <group position={[0, isInVR ? vrHeight + vrTableHeight : 0, 0]}>
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

      {/* VR Controls for mouse, touch, and VR interactions */}
      <VRControls mobileControls={mobileControls} />
      
      {/* Lab environment and equipment */}
      <LabEnvironment />
      {currentExperiment === "pH Testing" && <LabEquipment />}
      {currentExperiment === "Flame Tests" && <FlameTestLab />}
      {currentExperiment === "Gas Tests" && (
        <GasTestLab onExperimentComplete={handleExperimentComplete} />
      )}
      {currentExperiment === "Displacement Reactions" && (
        <DisplacementLab onExperimentComplete={handleExperimentComplete} />
      )}
      {currentExperiment === "Paper Chromatography" && (
        <PaperChromatographyLab onExperimentComplete={handleExperimentComplete} />
      )}
      {currentExperiment === "Filtration" && (
        <FiltrationLab onExperimentComplete={handleExperimentComplete} />
      )}
      {currentExperiment === "Evaporation" && (
        <EvaporationLab onExperimentComplete={handleExperimentComplete} />
      )}
      {currentExperiment === "Decanting" && (
        <DecantingLab onExperimentComplete={handleExperimentComplete} />
      )}
      
      {/* Height adjustment indicator and orientation helper for VR */}
      {isInVR && (
        <>
          {/* Height indicator */}
          <mesh position={[3, 2, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial color={vrHeight > -1 ? "green" : "red"} />
          </mesh>
          
          {/* VR orientation helper - shows front of lab */}
          <mesh position={[0, 1.5, -2]}>
            <boxGeometry args={[0.5, 0.1, 0.1]} />
            <meshBasicMaterial color="cyan" />
          </mesh>
          
          {/* Floor reference grid for VR */}
          <gridHelper args={[6, 10]} position={[0, 0, 0]} />
        </>
      )}
    </group>
  );
}