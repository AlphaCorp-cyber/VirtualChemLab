import { useXR } from "@react-three/xr";
import { useFrame, useThree } from "@react-three/fiber";
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { checkCollision, getDistance } from "../lib/labPhysics";

// Height adjustment state that can be shared between components
let vrHeightAdjustment = -1.2;

// Enhanced platform detection utility
const detectPlatform = () => {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad/i.test(userAgent) || (isMobile && window.innerWidth > 768);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile: isMobile && !isTablet,
    isTablet,
    isDesktop,
    isTouchDevice,
    supportsVR: 'xr' in navigator && 'requestSession' in (navigator as any).xr,
    supportsGamepad: 'getGamepads' in navigator
  };
};

export function VRControls() {
  const { session } = useXR();
  const { camera, scene, gl } = useThree();
  const { selectedStripId, grabTestStrip, releaseTestStrip, testStripInLiquid, beakers } = useChemistryLab();
  const [subscribe, getState] = useKeyboardControls();
  const movementVector = useRef(new THREE.Vector3());

  // VR comfort settings
  const vrComfortSettings = {
    scale: 0.6, // Make everything smaller for VR comfort
    userHeight: 1.6, // Standard user height in meters
    reachDistance: 0.8 // Comfortable reach distance
  };

  const isPresenting = !!session;

  // Platform detection
  const platform = detectPlatform();

  // VR Hand tracking states
  const [leftHandPosition, setLeftHandPosition] = useState(new THREE.Vector3());
  const [rightHandPosition, setRightHandPosition] = useState(new THREE.Vector3());
  const [leftHandGripping, setLeftHandGripping] = useState(false);
  const [rightHandGripping, setRightHandGripping] = useState(false);
  const [grippedObject, setGrippedObject] = useState<string | null>(null);
  const [pourGesture, setPourGesture] = useState(false);

  // Mobile/Touch states
  const [touchState, setTouchState] = useState({
    position: null as THREE.Vector2 | null,
    startTime: 0,
    lastPosition: null as THREE.Vector2 | null,
    isTouching: false,
    startPosition: null as THREE.Vector2 | null,
    isDragging: false,
    isMultiTouch: false,
    pinchDistance: 0,
    lastPinchDistance: 0,
    rotationAngle: 0
  });

  // Desktop/Mouse states
  const [mouseState, setMouseState] = useState({
    position: null as THREE.Vector2 | null,
    isDown: false,
    downTime: 0,
    lastPosition: null as THREE.Vector2 | null,
    isDragging: false,
    startPosition: null as THREE.Vector2 | null,
    isLongClick: false,
    movementMode: false,
    wheelZoom: 0
  });

  // Gamepad states
  const [gamepadState, setGamepadState] = useState({
    connected: false,
    leftStick: new THREE.Vector2(),
    rightStick: new THREE.Vector2(),
    buttons: [] as boolean[],
    lastButtons: [] as boolean[]
  });

  // Controller references
  const leftControllerRef = useRef<THREE.Group>(null);
  const rightControllerRef = useRef<THREE.Group>(null);

  // Interaction settings
  const handRadius = 0.1; // VR hand interaction radius
  const touchSensitivity = platform.isTablet ? 1.5 : 2.0; // Adjusted for tablet vs phone
  const mouseSensitivity = 1.0;
  const gamepadSensitivity = 1.5;

  // Touch event handlers with enhanced multi-touch support
  useEffect(() => {
    if (!platform.isTouchDevice) return;

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      const touches = Array.from(event.touches);
      const primaryTouch = touches[0];

      const touchPos = new THREE.Vector2(
        (primaryTouch.clientX / window.innerWidth) * 2 - 1,
        -(primaryTouch.clientY / window.innerHeight) * 2 + 1
      );

      setTouchState(prev => ({
        ...prev,
        position: touchPos,
        lastPosition: touchPos,
        startPosition: touchPos,
        startTime: Date.now(),
        isTouching: true,
        isMultiTouch: touches.length > 1,
        pinchDistance: touches.length > 1 ? 
          Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY) : 0
      }));
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touches = Array.from(event.touches);
      const primaryTouch = touches[0];

      const touchPos = new THREE.Vector2(
        (primaryTouch.clientX / window.innerWidth) * 2 - 1,
        -(primaryTouch.clientY / window.innerHeight) * 2 + 1
      );

      setTouchState(prev => {
        const newState = { ...prev, position: touchPos };

        // Multi-touch pinch detection
        if (touches.length > 1) {
          const newPinchDistance = Math.hypot(
            touches[1].clientX - touches[0].clientX,
            touches[1].clientY - touches[0].clientY
          );
          newState.lastPinchDistance = prev.pinchDistance;
          newState.pinchDistance = newPinchDistance;
        }

        // Drag detection
        if (prev.startPosition && !prev.isMultiTouch) {
          const dragDistance = touchPos.distanceTo(prev.startPosition);
          if (dragDistance > 0.05) {
            newState.isDragging = true;
          }
        }

        return newState;
      });
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();

      const touchDuration = Date.now() - touchState.startTime;

      // Handle different gesture types
      if (touchDuration < 300 && !touchState.isDragging && touchState.lastPosition) {
        handleTouchTap(touchState.lastPosition);
      }

      setTouchState(prev => ({
        ...prev,
        isTouching: false,
        isDragging: false,
        position: null,
        lastPosition: null,
        startPosition: null,
        isMultiTouch: false,
        pinchDistance: 0,
        lastPinchDistance: 0
      }));
    };

    const canvas = gl.domElement;
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [platform.isTouchDevice, touchState.startTime, gl.domElement]);

  // Enhanced mouse controls for desktop
  useEffect(() => {
    console.log('Platform detection:', platform);
    console.log('Is desktop:', platform.isDesktop);
    // Temporarily remove platform restriction to test mouse controls
    // if (!platform.isDesktop) {
    //   console.log('Skipping mouse controls - not detected as desktop');
    //   return;
    // }
    console.log('Setting up mouse controls...');

    const handleMouseDown = (event: MouseEvent) => {
      console.log('Mouse down event triggered!', event);
      const mousePos = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      setMouseState(prev => ({
        ...prev,
        position: mousePos,
        lastPosition: mousePos,
        startPosition: mousePos,
        downTime: Date.now(),
        isDown: true,
        isDragging: false,
        isLongClick: false
      }));

      // Long click detection
      setTimeout(() => {
        setMouseState(current => {
          if (current.isDown && !current.isDragging) {
            return { ...current, isLongClick: true, movementMode: true };
          }
          return current;
        });
      }, 500);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const mousePos = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      setMouseState(prev => {
        const newState = { ...prev, position: mousePos };

        if (prev.isDown && prev.startPosition) {
          const dragDistance = mousePos.distanceTo(prev.startPosition);
          if (dragDistance > 0.02) {
            newState.isDragging = true;
            newState.isLongClick = false;
          }
        }

        return newState;
      });
    };

    const handleMouseUp = (event: MouseEvent) => {
      const clickDuration = Date.now() - mouseState.downTime;

      if (mouseState.isLongClick && mouseState.movementMode) {
        setMouseState(prev => ({ ...prev, movementMode: false }));
      } else if (clickDuration < 200 && !mouseState.isDragging && mouseState.lastPosition) {
        handleMouseClick(mouseState.lastPosition);
      }

      setMouseState(prev => ({
        ...prev,
        isDown: false,
        isDragging: false,
        isLongClick: false,
        position: null,
        lastPosition: null,
        startPosition: null
      }));
    };

    const handleMouseWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomDelta = event.deltaY * -0.001;
      setMouseState(prev => ({ ...prev, wheelZoom: prev.wheelZoom + zoomDelta }));
    };

    const canvas = gl.domElement;
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleMouseWheel, { passive: false });

    return () => {
      canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleMouseWheel);
    };
  }, [platform.isDesktop, mouseState.downTime, mouseState.isDragging, gl.domElement]);

  // Gamepad support
  useEffect(() => {
    if (!platform.supportsGamepad) return;

    const updateGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];

      if (gamepad) {
        setGamepadState(prev => ({
          connected: true,
          leftStick: new THREE.Vector2(gamepad.axes[0], gamepad.axes[1]),
          rightStick: new THREE.Vector2(gamepad.axes[2], gamepad.axes[3]),
          buttons: gamepad.buttons.map(button => button.pressed),
          lastButtons: prev.buttons
        }));
      } else {
        setGamepadState(prev => ({ ...prev, connected: false }));
      }
    };

    const gamepadInterval = setInterval(updateGamepad, 16); // 60fps

    return () => clearInterval(gamepadInterval);
  }, [platform.supportsGamepad]);

  // Interaction handlers with proper raycasting for object selection
  const handleTouchTap = (touchPos: THREE.Vector2) => {
    console.log('Touch tap at:', touchPos);
    performRaycastInteraction(touchPos);
  };

  const handleMouseClick = (mousePos: THREE.Vector2) => {
    console.log('Mouse click at:', mousePos);
    performRaycastInteraction(mousePos);
  };

  // Raycast interaction system
  const performRaycastInteraction = (screenPos: THREE.Vector2) => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(screenPos, camera);

    // Find intersectable objects in the scene
    const intersectableObjects: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child.type === 'Mesh' && (
        child.userData.interactable ||
        child.name.includes('test-strip') ||
        child.name.includes('beaker') ||
        child.name.includes('bunsen') ||
        child.name.includes('sample') ||
        child.name.includes('splint') ||
        child.name.includes('litmus') ||
        child.name.includes('tube')
      )) {
        intersectableObjects.push(child);
      }
    });

    const intersects = raycaster.intersectObjects(intersectableObjects, true);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      console.log('Interacted with:', intersected.name, intersected.userData);

      // Handle different types of interactions
      if (intersected.name.includes('test-strip') || intersected.userData.type === 'test-strip') {
        if (!selectedStripId) {
          const stripId = intersected.userData.stripId || 'indicator-1';
          console.log('Grabbing test strip:', stripId);
          grabTestStrip(stripId);
        } else {
          console.log('Releasing test strip');
          releaseTestStrip();
        }
      } else if (intersected.name.includes('beaker') || intersected.userData.type === 'beaker') {
        if (selectedStripId) {
          const beakerId = intersected.userData.beakerId || intersected.userData.id;
          console.log('Testing pH in beaker:', beakerId, 'with strip:', selectedStripId);
          testStripInLiquid(selectedStripId, beakerId);
        } else {
          console.log('Need to grab a test strip first');
        }
      } else if (intersected.userData.interactable) {
        // Generic interactable object
        console.log('Interacting with:', intersected.name);
        if (intersected.userData.onInteract) {
          intersected.userData.onInteract();
        }
      }
    } else {
      console.log('No interactable objects found at position');
    }
  };

  const [mobileControls, setMobileControls] = useState({
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    up: false,
    down: false,
  });

  useFrame((state, delta) => {
    const keyboardControls = getState();
    const { forward, backward, leftward, rightward, interact, jump, grab, release } = keyboardControls;

    // Combine keyboard and mobile controls
    const combinedControls = {
      forward: forward || (mobileControls?.forward ?? false),
      backward: backward || (mobileControls?.backward ?? false), 
      leftward: leftward || (mobileControls?.leftward ?? false),
      rightward: rightward || (mobileControls?.rightward ?? false),
      interact: interact || (mobileControls?.up ?? false),
      jump: jump || (mobileControls?.down ?? false),
      grab,
      release
    };

    // Movement speed based on device type and frame rate
    const baseSpeed = platform.isMobile ? 1.5 : 2.0;
    const speed = baseSpeed * delta;

    // Movement controls
    if (combinedControls.forward) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      camera.position.addScaledVector(forward, speed);
    }

    if (combinedControls.backward) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      camera.position.addScaledVector(forward, -speed);
    }

    if (combinedControls.leftward) {
      const right = new THREE.Vector3();
      camera.getWorldDirection(right);
      right.y = 0;
      right.cross(camera.up);
      right.normalize();
      camera.position.addScaledVector(right, -speed);
    }

    if (combinedControls.rightward) {
      const right = new THREE.Vector3();
      camera.getWorldDirection(right);
      right.y = 0;
      right.cross(camera.up);
      right.normalize();
      camera.position.addScaledVector(right, speed);
    }

    // Keyboard interactions
    if (combinedControls.grab && !selectedStripId) {
      grabTestStrip('indicator-1');
      setGrippedObject('indicator-1');
    }

    if (combinedControls.release && selectedStripId) {
      releaseTestStrip();
      setGrippedObject(null);
    }

    // Height adjustment with E and Q keys - much slower
    if (combinedControls.interact) { // E key - raise camera/lab
      camera.position.y = THREE.MathUtils.clamp(camera.position.y + speed * 0.5, 0.5, 12);
    }

    if (combinedControls.jump) { // Q key - lower camera/lab  
      camera.position.y = THREE.MathUtils.clamp(camera.position.y - speed * 0.5, 0.5, 12);
    }

    // Constrain camera to lab bounds
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -8, 8);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5, 8);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.5, 12);
  });

  return (
    <>
      {/* Platform-specific visual indicators */}
      {mouseState.movementMode && platform.isDesktop && (
        <group position={[0, 2, -1]}>
          <mesh>
            <sphereGeometry args={[0.02]} />
            <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {touchState.isMultiTouch && platform.isTouchDevice && (
        <group position={[0, 2.2, -1]}>
          <mesh>
            <sphereGeometry args={[0.03]} />
            <meshStandardMaterial color="#FF6B6B" emissive="#FF6B6B" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {gamepadState.connected && (
        <group position={[0, 2.4, -1]}>
          <mesh>
            <sphereGeometry args={[0.025]} />
            <meshStandardMaterial color="#4FC3F7" emissive="#4FC3F7" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* VR Hand Controllers */}
      {isPresenting && session && (
        <group>
          {/* Enhanced left hand with realistic grip animation */}
          <group ref={leftControllerRef} position={[-0.3, 1.2, -0.5]}>
            {/* Palm */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.12, 0.04]} />
              <meshStandardMaterial 
                color={leftHandGripping ? "#FFB3B3" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>

            {/* Fingers - curl when gripping */}
            {[0, 1, 2, 3].map(i => (
              <group key={i} position={[(-1.5 + i) * 0.02, 0.08, 0]}>
                <mesh 
                  rotation={leftHandGripping ? [Math.PI/3, 0, 0] : [0, 0, 0]}
                  position={[0, leftHandGripping ? -0.02 : 0, leftHandGripping ? 0.02 : 0]}
                >
                  <boxGeometry args={[0.015, 0.06, 0.02]} />
                  <meshStandardMaterial 
                    color={leftHandGripping ? "#FFB3B3" : "#FFE5CC"} 
                    roughness={0.6}
                  />
                </mesh>

                {/* Finger tip */}
                <mesh 
                  position={[0, leftHandGripping ? 0.02 : 0.04, leftHandGripping ? 0.03 : 0]}
                  rotation={leftHandGripping ? [Math.PI/2, 0, 0] : [0, 0, 0]}
                >
                  <boxGeometry args={[0.012, 0.03, 0.015]} />
                  <meshStandardMaterial 
                    color={leftHandGripping ? "#FFB3B3" : "#FFE5CC"} 
                    roughness={0.6}
                  />
                </mesh>
              </group>
            ))}

            {/* Thumb */}
            <mesh 
              position={[-0.04, 0.02, 0.02]} 
              rotation={leftHandGripping ? [0, 0, Math.PI/2] : [0, 0, Math.PI/4]}
            >
              <boxGeometry args={[0.015, 0.05, 0.015]} />
              <meshStandardMaterial 
                color={leftHandGripping ? "#FFB3B3" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>

            {/* Grip indicator */}
            {leftHandGripping && (
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.015]} />
                <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.5} />
              </mesh>
            )}

            {/* Proximity indicator when near grabbable objects */}
            {!leftHandGripping && (
              <mesh position={[0, -0.05, 0]} scale={[1, 0.1, 1]}>
                <sphereGeometry args={[handRadius]} />
                <meshStandardMaterial 
                  color="#4FC3F7" 
                  transparent 
                  opacity={0.2}
                  wireframe
                />
              </mesh>
            )}
          </group>

          {/* Enhanced right hand with realistic grip animation */}
          <group ref={rightControllerRef} position={[0.3, 1.2, -0.5]}>
            {/* Palm */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.12, 0.04]} />
              <meshStandardMaterial 
                color={rightHandGripping ? "#FFB3B3" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>

            {/* Fingers - curl when gripping */}
            {[0, 1, 2, 3].map(i => (
              <group key={i} position={[(-1.5 + i) * 0.02, 0.08, 0]}>
                <mesh 
                  rotation={rightHandGripping ? [Math.PI/3, 0, 0] : [0, 0, 0]}
                  position={[0, rightHandGripping ? -0.02 : 0, rightHandGripping ? 0.02 : 0]}
                >
                  <boxGeometry args={[0.015, 0.06, 0.02]} />
                  <meshStandardMaterial 
                    color={rightHandGripping ? "#FFB3B3" : "#FFE5CC"} 
                    roughness={0.6}
                  />
                </mesh>

                {/* Finger tip */}
                <mesh 
                  position={[0, rightHandGripping ? 0.02 : 0.04, rightHandGripping ? 0.03 : 0]}
                  rotation={rightHandGripping ? [Math.PI/2, 0, 0] : [0, 0, 0]}
                >
                  <boxGeometry args={[0.012, 0.03, 0.015]} />
                  <meshStandardMaterial 
                    color={rightHandGripping ? "#FFB3B3" : "#FFE5CC"} 
                    roughness={0.6}
                  />
                </mesh>
              </group>
            ))}

            {/* Thumb */}
            <mesh 
              position={[0.04, 0.02, 0.02]} 
              rotation={rightHandGripping ? [0, 0, -Math.PI/2] : [0, 0, -Math.PI/4]}
            >
              <boxGeometry args={[0.015, 0.05, 0.015]} />
              <meshStandardMaterial 
                color={rightHandGripping ? "#FFB3B3" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>

            {/* Grip indicator */}
            {rightHandGripping && (
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.015]} />
                <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.5} />
              </mesh>
            )}

            {/* Proximity indicator when near grabbable objects */}
            {!rightHandGripping && (
              <mesh position={[0, -0.05, 0]} scale={[1, 0.1, 1]}>
                <sphereGeometry args={[handRadius]} />
                <meshStandardMaterial 
                  color="#4FC3F7" 
                  transparent 
                  opacity={0.2}
                  wireframe
                />
              </mesh>
            )}
          </group>

          {/* Pouring visualization */}
          {pourGesture && grippedObject && (
            <group position={leftHandGripping ? leftHandPosition.toArray() : rightHandPosition.toArray()}>
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