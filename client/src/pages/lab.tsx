import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";
import { useParams } from "react-router-dom";
import { ChemistryLab } from "../components/ChemistryLab";
import { LabUI } from "../components/LabUI";
import { MobileControls } from "../components/MobileControls";
import { ActivationKeyModal } from "../components/ActivationKeyModal";
import { useAudio } from "../lib/stores/useAudio";
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useActivation } from "../lib/stores/useActivation";

// Create XR store for VR support with better settings
const xrStore = createXRStore();

// Define control keys for the lab
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "interact", keys: ["KeyE"] }, // Raise camera/lab
  { name: "jump", keys: ["KeyQ"] }, // Lower camera/lab
  { name: "grab", keys: ["KeyG"] },
  { name: "release", keys: ["KeyR"] },
];

export default function Lab() {
  const { experimentId } = useParams();
  const { initializeAudio } = useAudio();
  const { initializeLab, switchExperiment } = useChemistryLab();
  const { isActivated, error, activateLab, checkActivationStatus, setError } = useActivation();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);

  // Mobile camera control state
  const [mobileControls, setMobileControls] = useState({
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    up: false,
    down: false,
  });

  useEffect(() => {
    // Add lab-specific CSS class to body for fixed layout
    document.body.classList.add('lab-page');

    // Check activation status
    const isLabActivated = checkActivationStatus();
    if (!isLabActivated) {
      setShowActivationModal(true);
      return; // Don't initialize lab until activated
    }

    initializeAudio();
    initializeLab();

    // Detect device types
    const checkDeviceTypes = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

      // More comprehensive mobile detection
      const isMobileWidth = width < 768;
      const isMobileHeight = height < 600;
      const isMobileDetected = isMobileUserAgent || isTouchDevice || (isMobileWidth && isMobileHeight);

      setIsMobile(isMobileDetected);
      setIsTablet(!isMobileDetected && width >= 768 && width < 1024);
      setIsDesktop(!isMobileDetected && width >= 1024);

      console.log('Device detection:', {
        width,
        height,
        isTouchDevice,
        isMobileUserAgent,
        isMobileDetected,
        userAgent
      });
    };

    checkDeviceTypes();
    window.addEventListener('resize', checkDeviceTypes);

    // Set the specific experiment based on the route parameter
    if (experimentId) {
      const experimentMap: Record<string, any> = {
        'ph-testing': 'pH Testing',
        'flame-tests': 'Flame Tests',
        'gas-tests': 'Gas Tests',
        'displacement-reactions': 'Displacement Reactions',
        'paper-chromatography': 'Paper Chromatography',
        'filtration': 'Filtration',
        'evaporation': 'Evaporation',
        'decanting': 'Decanting'
      };

      const experimentName = experimentMap[experimentId];
      if (experimentName) {
        switchExperiment(experimentName);
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('lab-page');
      window.removeEventListener('resize', checkDeviceTypes);
    };
  }, [initializeAudio, initializeLab, switchExperiment, experimentId]);

  // Mobile control handlers with continuous movement
  const handleMobileMove = (direction: string) => {
    console.log('📱 Mobile move:', direction);
    // Map mobile directions to keyboard controls
    const directionMap: Record<string, string> = {
      'forward': 'forward',
      'backward': 'backward', 
      'left': 'leftward',
      'right': 'rightward',
      'up': 'up',         // Store as 'up' for mobile controls
      'down': 'down'      // Store as 'down' for mobile controls
    };

    const mappedDirection = directionMap[direction];
    if (mappedDirection) {
      console.log('📱 Setting mobile control:', mappedDirection, 'to true');
      setMobileControls(prev => ({
        ...prev,
        [mappedDirection]: true
      }));

      // Longer duration for better movement
      setTimeout(() => {
        setMobileControls(prev => ({
          ...prev,
          [mappedDirection]: false
        }));
      }, 150);
    }
  };

  const handleMobileZoom = (direction: 'in' | 'out') => {
    console.log('Mobile zoom:', direction);
    // For zoom we trigger forward/backward movement
    if (direction === 'in') {
      handleMobileMove('forward');
    } else {
      handleMobileMove('backward');
    }
  };

  const handleActivation = async (key: string) => {
    const success = await activateLab(key);
    if (success) {
      setShowActivationModal(false);
      // Initialize lab after successful activation
      initializeAudio();
      initializeLab();
      
      // Set the specific experiment based on the route parameter
      if (experimentId) {
        const experimentMap: Record<string, any> = {
          'ph-testing': 'pH Testing',
          'flame-tests': 'Flame Tests',
          'gas-tests': 'Gas Tests',
          'displacement-reactions': 'Displacement Reactions',
          'paper-chromatography': 'Paper Chromatography',
          'filtration': 'Filtration',
          'evaporation': 'Evaporation',
          'decanting': 'Decanting'
        };

        const experimentName = experimentMap[experimentId];
        if (experimentName) {
          switchExperiment(experimentName);
        }
      }
    }
  };

  // If not activated, show activation modal
  if (!isActivated || showActivationModal) {
    return (
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            color: 'white',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Virtual Chemistry Lab</h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Preparing your laboratory experience...</p>
          </div>
        </div>
        
        <ActivationKeyModal
          isOpen={showActivationModal}
          onActivate={handleActivation}
          error={error}
        />

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

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={controls}>
        <Canvas
            shadows
            camera={{
              position: [0, 1.6, 3],
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
              <group scale={[0.3, 0.3, 0.3]} position={[0, 0.8, 0]}>
                <Suspense fallback={null}>
                  <ChemistryLab mobileControls={mobileControls} />
                </Suspense>
              </group>
            </XR>
          </Canvas>
      </KeyboardControls>

      <LabUI experimentId={experimentId} />

      {/* Mobile Controller Buttons - Only visible on mobile */}
      <MobileControls 
        isVisible={isMobile} 
        onMove={handleMobileMove}
        onZoom={handleMobileZoom}
      />

      {/* VR Entry Button - Hidden on Mobile */}
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 1000,
        display: isMobile ? 'none' : 'block'
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