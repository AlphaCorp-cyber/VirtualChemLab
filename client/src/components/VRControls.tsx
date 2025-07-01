
import { useXR } from "@react-three/xr";
import { useFrame, useThree } from "@react-three/fiber";
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { checkCollision, getDistance } from "../lib/labPhysics";

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
  const { session, isPresenting } = useXR();
  const { camera, scene, gl } = useThree();
  const { selectedStripId, grabTestStrip, releaseTestStrip, testStripInLiquid, beakers } = useChemistryLab();
  const [subscribe, getState] = useKeyboardControls();
  const movementVector = useRef(new THREE.Vector3());
  
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
    if (!platform.isDesktop) return;
    
    const handleMouseDown = (event: MouseEvent) => {
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
  
  // Interaction handlers
  const handleTouchTap = (touchPos: THREE.Vector2) => {
    console.log('Touch tap interaction');
    if (!selectedStripId) {
      grabTestStrip('indicator-1');
      setGrippedObject('indicator-1');
    } else {
      releaseTestStrip();
      setGrippedObject(null);
    }
  };
  
  const handleMouseClick = (mousePos: THREE.Vector2) => {
    console.log('Mouse click interaction');
    if (!selectedStripId) {
      grabTestStrip('indicator-1');
      setGrippedObject('indicator-1');
    } else {
      releaseTestStrip();
      setGrippedObject(null);
    }
  };

  useFrame((state, delta) => {
    const controls = getState();
    const speed = 3 * delta;
    
    // ===== VR CONTROLS =====
    if (isPresenting && session && leftControllerRef.current && rightControllerRef.current) {
      // VR hand tracking and natural gesture interactions
      const leftPos = new THREE.Vector3();
      const rightPos = new THREE.Vector3();
      
      leftControllerRef.current.getWorldPosition(leftPos);
      rightControllerRef.current.getWorldPosition(rightPos);
      
      setLeftHandPosition(leftPos);
      setRightHandPosition(rightPos);
      
      // Auto-grab test strips when hands are close
      const stripPositions = [
        { id: 'indicator-1', pos: new THREE.Vector3(1.2, 1.0, -0.5) },
        { id: 'indicator-2', pos: new THREE.Vector3(1.3, 1.0, -0.5) },
        { id: 'indicator-3', pos: new THREE.Vector3(1.4, 1.0, -0.5) }
      ];
      
      stripPositions.forEach(strip => {
        const leftDistance = leftPos.distanceTo(strip.pos);
        const rightDistance = rightPos.distanceTo(strip.pos);
        
        if ((leftDistance < handRadius || rightDistance < handRadius) && !selectedStripId) {
          grabTestStrip(strip.id);
          setGrippedObject(strip.id);
          setLeftHandGripping(leftDistance < rightDistance);
          setRightHandGripping(rightDistance < leftDistance);
        }
      });
      
      // Auto-pour when holding strip over beaker
      if (grippedObject && (leftHandGripping || rightHandGripping)) {
        const handPos = leftHandGripping ? leftPos : rightPos;
        
        beakers.forEach(beaker => {
          const beakerPos = new THREE.Vector3(...beaker.position);
          const distance = handPos.distanceTo(beakerPos);
          
          if (distance < 0.25) {
            testStripInLiquid(grippedObject, beaker.id);
            
            setTimeout(() => {
              releaseTestStrip();
              setGrippedObject(null);
              setLeftHandGripping(false);
              setRightHandGripping(false);
            }, 1000);
          }
        });
      }
    }
    
    // ===== MOBILE/TOUCH CONTROLS =====
    else if (platform.isTouchDevice && touchState.isTouching) {
      // Multi-touch pinch zoom
      if (touchState.isMultiTouch && touchState.pinchDistance > 0 && touchState.lastPinchDistance > 0) {
        const pinchDelta = (touchState.pinchDistance - touchState.lastPinchDistance) * 0.01;
        const forward = new THREE.Vector3(0, 0, pinchDelta);
        forward.applyQuaternion(camera.quaternion);
        camera.position.addScaledVector(forward, touchSensitivity);
      }
      
      // Single touch movement and look
      else if (touchState.isDragging && touchState.position && touchState.lastPosition) {
        const deltaX = (touchState.position.x - touchState.lastPosition.x) * touchSensitivity;
        const deltaY = (touchState.position.y - touchState.lastPosition.y) * touchSensitivity;
        
        // Forward/backward movement
        if (Math.abs(deltaY) > 0.01) {
          const forward = new THREE.Vector3(0, 0, -deltaY * speed * 2);
          forward.applyQuaternion(camera.quaternion);
          forward.y = 0;
          camera.position.addScaledVector(forward, 1);
        }
        
        // Left/right strafe
        if (Math.abs(deltaX) > 0.01) {
          const right = new THREE.Vector3(deltaX * speed * 2, 0, 0);
          right.applyQuaternion(camera.quaternion);
          camera.position.addScaledVector(right, 1);
        }
        
        // Camera rotation
        if (Math.abs(deltaX) > 0.02) {
          camera.rotation.y -= deltaX * 0.5;
        }
      }
      
      // Touch interaction with objects
      if (grippedObject && touchState.position) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(touchState.position, camera);
        
        beakers.forEach(beaker => {
          const beakerPos = new THREE.Vector3(...beaker.position);
          const intersects = raycaster.intersectObjects(scene.children, true);
          
          if (intersects.length > 0 && intersects[0].distance < 5) {
            testStripInLiquid(grippedObject, beaker.id);
          }
        });
      }
    }
    
    // ===== DESKTOP/MOUSE CONTROLS =====
    else if (platform.isDesktop) {
      // Mouse wheel zoom
      if (mouseState.wheelZoom !== 0) {
        const forward = new THREE.Vector3(0, 0, mouseState.wheelZoom * 2);
        forward.applyQuaternion(camera.quaternion);
        camera.position.addScaledVector(forward, delta * 10);
        setMouseState(prev => ({ ...prev, wheelZoom: prev.wheelZoom * 0.9 }));
      }
      
      // Cursor movement mode
      if (mouseState.movementMode && mouseState.position && mouseState.lastPosition) {
        const deltaX = (mouseState.position.x - mouseState.lastPosition.x) * mouseSensitivity * 3;
        const deltaY = (mouseState.position.y - mouseState.lastPosition.y) * mouseSensitivity * 3;
        
        // Movement
        if (Math.abs(deltaY) > 0.005) {
          const forward = new THREE.Vector3(0, 0, -deltaY * speed * 3);
          forward.applyQuaternion(camera.quaternion);
          forward.y = 0;
          camera.position.addScaledVector(forward, 1);
        }
        
        if (Math.abs(deltaX) > 0.005) {
          const right = new THREE.Vector3(deltaX * speed * 3, 0, 0);
          right.applyQuaternion(camera.quaternion);
          camera.position.addScaledVector(right, 1);
        }
        
        // Look around
        if (Math.abs(deltaX) > 0.01) {
          camera.rotation.y -= deltaX * 0.3;
        }
      }
      
      // Regular mouse drag
      else if (mouseState.isDragging && mouseState.position && mouseState.lastPosition && !mouseState.movementMode) {
        const deltaX = (mouseState.position.x - mouseState.lastPosition.x) * mouseSensitivity;
        const deltaY = (mouseState.position.y - mouseState.lastPosition.y) * mouseSensitivity;
        
        // Camera rotation
        if (Math.abs(deltaX) > 0.01) {
          camera.rotation.y -= deltaX * 0.5;
        }
        
        if (Math.abs(deltaY) > 0.01) {
          camera.rotation.x = THREE.MathUtils.clamp(
            camera.rotation.x - deltaY * 0.5,
            -Math.PI / 3,
            Math.PI / 3
          );
        }
      }
      
      // Mouse object interaction
      if (mouseState.position && !mouseState.isDragging && !mouseState.movementMode && grippedObject) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseState.position, camera);
        
        beakers.forEach(beaker => {
          const intersects = raycaster.intersectObjects(scene.children, true);
          if (intersects.length > 0 && intersects[0].distance < 8) {
            testStripInLiquid(grippedObject, beaker.id);
          }
        });
      }
    }
    
    // ===== GAMEPAD CONTROLS =====
    if (gamepadState.connected) {
      const deadzone = 0.1;
      
      // Movement with left stick
      if (Math.abs(gamepadState.leftStick.x) > deadzone || Math.abs(gamepadState.leftStick.y) > deadzone) {
        const forward = new THREE.Vector3(0, 0, -gamepadState.leftStick.y * speed * gamepadSensitivity);
        const right = new THREE.Vector3(gamepadState.leftStick.x * speed * gamepadSensitivity, 0, 0);
        
        forward.applyQuaternion(camera.quaternion);
        right.applyQuaternion(camera.quaternion);
        
        forward.y = 0;
        right.y = 0;
        
        camera.position.addScaledVector(forward, 1);
        camera.position.addScaledVector(right, 1);
      }
      
      // Look with right stick
      if (Math.abs(gamepadState.rightStick.x) > deadzone || Math.abs(gamepadState.rightStick.y) > deadzone) {
        camera.rotation.y -= gamepadState.rightStick.x * delta * 2;
        camera.rotation.x = THREE.MathUtils.clamp(
          camera.rotation.x - gamepadState.rightStick.y * delta * 2,
          -Math.PI / 3,
          Math.PI / 3
        );
      }
      
      // Button interactions
      if (gamepadState.buttons[0] && !gamepadState.lastButtons[0]) { // A button
        if (!selectedStripId) {
          grabTestStrip('indicator-1');
          setGrippedObject('indicator-1');
        } else {
          releaseTestStrip();
          setGrippedObject(null);
        }
      }
    }
    
    // ===== KEYBOARD CONTROLS (Universal fallback) =====
    // WASD movement
    if (controls.forward) {
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
      camera.position.addScaledVector(forward, speed);
    }
    
    if (controls.back || controls.backward) {
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
      camera.position.addScaledVector(forward, speed);
    }
    
    if (controls.left || controls.leftward) {
      const right = new THREE.Vector3(-1, 0, 0);
      right.applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();
      camera.position.addScaledVector(right, speed);
    }
    
    if (controls.right || controls.rightward) {
      const right = new THREE.Vector3(1, 0, 0);
      right.applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();
      camera.position.addScaledVector(right, speed);
    }
    
    // Keyboard interactions
    if (controls.grab && !selectedStripId) {
      grabTestStrip('indicator-1');
      setGrippedObject('indicator-1');
    }
    
    if (controls.release && selectedStripId) {
      releaseTestStrip();
      setGrippedObject(null);
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
          {/* Enhanced left hand */}
          <group ref={leftControllerRef} position={[-0.3, 1.2, -0.5]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.12, 0.04]} />
              <meshStandardMaterial 
                color={leftHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>
            
            {[0, 1, 2, 3].map(i => (
              <mesh key={i} position={[(-1.5 + i) * 0.02, 0.08, 0]}>
                <boxGeometry args={[0.015, 0.06, 0.02]} />
                <meshStandardMaterial 
                  color={leftHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                  roughness={0.6}
                />
              </mesh>
            ))}
            
            <mesh position={[-0.04, 0.02, 0.02]} rotation={[0, 0, Math.PI/4]}>
              <boxGeometry args={[0.015, 0.05, 0.015]} />
              <meshStandardMaterial 
                color={leftHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>
            
            {leftHandGripping && (
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.02]} />
                <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.3} />
              </mesh>
            )}
          </group>
          
          {/* Enhanced right hand */}
          <group ref={rightControllerRef} position={[0.3, 1.2, -0.5]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.12, 0.04]} />
              <meshStandardMaterial 
                color={rightHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>
            
            {[0, 1, 2, 3].map(i => (
              <mesh key={i} position={[(-1.5 + i) * 0.02, 0.08, 0]}>
                <boxGeometry args={[0.015, 0.06, 0.02]} />
                <meshStandardMaterial 
                  color={rightHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                  roughness={0.6}
                />
              </mesh>
            ))}
            
            <mesh position={[0.04, 0.02, 0.02]} rotation={[0, 0, -Math.PI/4]}>
              <boxGeometry args={[0.015, 0.05, 0.015]} />
              <meshStandardMaterial 
                color={rightHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>
            
            {rightHandGripping && (
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.02]} />
                <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.3} />
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
