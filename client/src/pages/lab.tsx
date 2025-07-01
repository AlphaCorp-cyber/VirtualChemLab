import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";
import { useParams } from "react-router-dom";
import { ChemistryLab } from "../components/ChemistryLab";
import { LabUI } from "../components/LabUI";
import { useAudio } from "../lib/stores/useAudio";
import { useChemistryLab } from "../lib/stores/useChemistryLab";

// Create XR store for VR support
const xrStore = createXRStore();

// Define control keys for the lab
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "interact", keys: ["KeyE", "Space"] },
  { name: "grab", keys: ["KeyG"] },
  { name: "release", keys: ["KeyR"] },
];

export default function Lab() {
  const { experimentId } = useParams();
  const { initializeAudio } = useAudio();
  const { initializeLab, switchExperiment } = useChemistryLab();

  useEffect(() => {
    // Add lab-specific CSS class to body for fixed layout
    document.body.classList.add('lab-page');
    
    initializeAudio();
    initializeLab();
    
    // Set the specific experiment based on the route parameter
    if (experimentId) {
      const experimentMap: Record<string, any> = {
        'ph-testing': 'pH Testing',
        'flame-tests': 'Flame Tests',
        'gas-tests': 'Gas Tests',
        'displacement-reactions': 'Displacement Reactions',
        'paper-chromatography': 'Paper Chromatography'
      };
      
      const experimentName = experimentMap[experimentId];
      if (experimentName) {
        switchExperiment(experimentName);
      }
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('lab-page');
    };
  }, [initializeAudio, initializeLab, switchExperiment, experimentId]);

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
            <XR store={xrStore}>
              <color attach="background" args={["#f0f8ff"]} />
              
              <Suspense fallback={null}>
                <ChemistryLab />
              </Suspense>
            </XR>
          </Canvas>
      </KeyboardControls>
      
      <LabUI experimentId={experimentId} />
      
      {/* VR Entry Button - Hidden on Mobile */}
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 1000,
        display: window.innerWidth < 768 ? 'none' : 'block'
      }}>
        <button
          onClick={() => xrStore.enterVR()}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          🥽 Enter VR
        </button>
      </div>
      
      {/* Mobile Controls */}
      {window.innerWidth < 768 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <button
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}
          >
            📱 Tap to Interact
          </button>
          <div style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            Tap objects to grab/release<br/>
            Pinch to zoom, drag to rotate
          </div>
        </div>
      )}
      
      {/* Back to Landing Button */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        zIndex: 1000 
      }}>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          ← Back to Experiments
        </button>
      </div>
    </div>
  );
}