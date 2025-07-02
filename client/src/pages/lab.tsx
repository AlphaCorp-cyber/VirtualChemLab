import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";
import { useParams } from "react-router-dom";
import { ChemistryLab } from "../components/ChemistryLab";
import { LabUI } from "../components/LabUI";
import { useAudio } from "../lib/stores/useAudio";
import { useChemistryLab } from "../lib/stores/useChemistryLab";

// Create XR store for VR support with better settings
const xrStore = createXRStore();

// Define control keys for the lab
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "interact", keys: ["KeyE", "Space"] }, // Also used for VR height up
  { name: "grab", keys: ["KeyG"] }, // Also used for VR height down
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
              position: [0, 1.6, 8],
              fov: 60,
              near: 0.01,
              far: 1000
            }}
            gl={{
              antialias: true,
              powerPreference: "high-performance"
            }}
          >
            <XR store={xrStore}>
              <color attach="background" args={["#f0f8ff"]} />
              
              {/* VR-specific scaling group with height adjustment */}
              <group scale={[0.3, 0.3, 0.3]} position={[0, -1.2, 0]}>
                <Suspense fallback={null}>
                  <ChemistryLab />
                </Suspense>
              </group>
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
      
      {/* Dynamic Platform-Specific Controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Mobile/Touch Controls */}
        {window.innerWidth < 768 && (
          <>
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
              📱 Touch to Interact
            </button>
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '11px',
              textAlign: 'center',
              maxWidth: '200px'
            }}>
              <strong>Touch Controls:</strong><br/>
              🚶 <em>Drag:</em> Walk & look around<br/>
              🤏 <em>Pinch:</em> Zoom in/out<br/>
              👆 <em>Tap:</em> Grab/release objects<br/>
              🔄 <em>Rotate:</em> Swipe left/right to turn<br/>
              {window.innerWidth > 600 && '📱 <em>Tilt device</em> for immersion'}
            </div>
          </>
        )}
        
        {/* Tablet Controls */}
        {window.innerWidth >= 768 && window.innerWidth < 1024 && (
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            <strong>Tablet Controls:</strong><br/>
            🤏 <em>Two-finger pinch:</em> Zoom<br/>
            👆 <em>Drag:</em> Move & look around<br/>
            🎯 <em>Tap:</em> Interact with objects<br/>
            ⌨️ <em>Keyboard:</em> WASD to move
          </div>
        )}
        
        {/* Desktop Controls */}
        {window.innerWidth >= 1024 && (
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            <strong>Desktop Controls:</strong><br/>
            🖱️ <em>Mouse wheel:</em> Zoom in/out<br/>
            🖱️ <em>Drag:</em> Look around<br/>
            ⏰ <em>Long click + drag:</em> Walk mode<br/>
            👆 <em>Click:</em> Grab/release objects<br/>
            ⌨️ <em>WASD:</em> Walk around<br/>
            ⌨️ <em>G/R:</em> Grab/Release<br/>
            🎮 <em>Gamepad supported</em>
          </div>
        )}
        
        {/* VR Controls Indicator */}
        <div id="vr-status" style={{
          background: 'rgba(76, 175, 80, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '11px',
          textAlign: 'center',
          display: 'none'
        }}>
          🥽 <strong>VR Mode Active</strong><br/>
          👋 Use hand gestures to interact<br/>
          🤏 Reach objects to grab them<br/>
          🫱 Hold over beakers to pour<br/>
          📏 <strong>Height Adjust:</strong> E (up) / G (down)
        </div>
      </div>
      
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