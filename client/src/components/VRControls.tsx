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

interface VRControlsProps {
  mobileControls?: {
    forward: boolean;
    backward: boolean;
    leftward: boolean;
    rightward: boolean;
    up: boolean;
    down: boolean;
  };
}

export function VRControls({ mobileControls }: VRControlsProps = {}) {
  const { session } = useXR();
  const { camera, scene, gl } = useThree();
  const { selectedStripId, grabTestStrip, releaseTestStrip, testStripInLiquid, beakers, setVrTableHeight, setVrHeightLocked, vrHeightLocked } = useChemistryLab();
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
  
  // VR Table height adjustment with gestures
  const [tableHeightOffset, setTableHeightOffset] = useState(0);
  const [gestureBaseHeight, setGestureBaseHeight] = useState(0);
  const [isAdjustingHeight, setIsAdjustingHeight] = useState(false);
  // Remove local heightLocked state - now using store state
  const lastGestureTime = useRef(0);

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

  // Touch event handlers - ALWAYS enabled for testing
  useEffect(() => {
    console.log('FORCING touch controls setup...');

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

        // Multi-touch pinch detection and zoom
        if (touches.length > 1) {
          const newPinchDistance = Math.hypot(
            touches[1].clientX - touches[0].clientX,
            touches[1].clientY - touches[0].clientY
          );
          
          if (prev.pinchDistance > 0) {
            const pinchDelta = newPinchDistance - prev.pinchDistance;
            const zoomSpeed = 0.01;
            
            // Apply pinch zoom
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            
            if (pinchDelta > 0) {
              // Pinch out - zoom in
              camera.position.addScaledVector(direction, pinchDelta * zoomSpeed);
              console.log('🤏 PINCH ZOOM IN');
            } else {
              // Pinch in - zoom out
              camera.position.addScaledVector(direction, pinchDelta * zoomSpeed);
              console.log('🤏 PINCH ZOOM OUT');
            }
            
            // Keep camera within bounds
            camera.position.x = THREE.MathUtils.clamp(camera.position.x, -8, 8);
            camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5, 8);
            camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.5, 12);
          }
          
          newState.lastPinchDistance = prev.pinchDistance;
          newState.pinchDistance = newPinchDistance;
        }

        // Single touch drag detection for panning
        if (touches.length === 1 && prev.startPosition && !prev.isMultiTouch) {
          const dragDistance = touchPos.distanceTo(prev.startPosition);
          if (dragDistance > 0.05) {
            newState.isDragging = true;
            
            // Touch drag panning
            const deltaX = touchPos.x - prev.lastPosition!.x;
            const deltaY = touchPos.y - prev.lastPosition!.y;
            const moveSpeed = 1.5;
            
            const right = new THREE.Vector3();
            const up = new THREE.Vector3(0, 1, 0);
            camera.getWorldDirection(right);
            right.cross(up).normalize();
            
            camera.position.addScaledVector(right, -deltaX * moveSpeed);
            camera.position.addScaledVector(up, deltaY * moveSpeed);
            
            // Keep within bounds
            camera.position.x = THREE.MathUtils.clamp(camera.position.x, -8, 8);
            camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5, 8);
            camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.5, 12);
            
            console.log('👆 TOUCH DRAG MOVEMENT');
          }
        }

        return newState;
      });
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();

      const touchDuration = Date.now() - touchState.startTime;
      const remainingTouches = event.touches.length;

      // Only handle tap if it was a quick single touch without dragging
      if (remainingTouches === 0 && touchDuration < 300 && !touchState.isDragging && !touchState.isMultiTouch && touchState.lastPosition) {
        console.log('👆 TOUCH TAP DETECTED!');
        handleTouchTap(touchState.lastPosition);
      }

      setTouchState(prev => ({
        ...prev,
        isTouching: false,
        isDragging: false,
        position: null,
        lastPosition: null,
        startPosition: null,
        isMultiTouch: remainingTouches > 1,
        pinchDistance: remainingTouches > 1 ? prev.pinchDistance : 0,
        lastPinchDistance: remainingTouches > 1 ? prev.lastPinchDistance : 0
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

  // Enhanced mouse controls - ALWAYS enabled
  useEffect(() => {
    console.log('Platform detection:', platform);
    console.log('FORCING mouse controls setup...');

    const handleMouseDown = (event: MouseEvent) => {
      console.log('🖱️ MOUSE DOWN CAPTURED!', event.clientX, event.clientY);
      event.preventDefault();
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
            
            // Handle different mouse buttons for different actions
            const deltaX = mousePos.x - prev.lastPosition!.x;
            const deltaY = mousePos.y - prev.lastPosition!.y;
            
            if (event.buttons === 1) {
              // Left mouse button - Move camera position (pan)
              const moveSpeed = 2.0;
              const right = new THREE.Vector3();
              const up = new THREE.Vector3(0, 1, 0);
              
              // Get camera right vector
              camera.getWorldDirection(right);
              right.cross(up).normalize();
              
              // Move camera based on mouse movement
              camera.position.addScaledVector(right, -deltaX * moveSpeed);
              camera.position.addScaledVector(up, deltaY * moveSpeed);
              
              // Keep camera within lab bounds
              camera.position.x = THREE.MathUtils.clamp(camera.position.x, -8, 8);
              camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5, 8);
              camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.5, 12);
              
              console.log('🎮 CAMERA MOVEMENT');
            } else if (event.buttons === 2) {
              // Right mouse button - Rotate camera view
              camera.rotateY(-deltaX * 0.5);
              
              // Tilt camera for up/down movement (limited)
              const currentRotationX = camera.rotation.x;
              const newRotationX = currentRotationX - deltaY * 0.3;
              camera.rotation.x = THREE.MathUtils.clamp(newRotationX, -Math.PI/3, Math.PI/3);
              
              console.log('🎮 CAMERA ROTATION');
            }
          }
        }

        return newState;
      });
    };

    const handleMouseUp = (event: MouseEvent) => {
      console.log('🖱️ MOUSE UP CAPTURED!');
      const clickDuration = Date.now() - mouseState.downTime;

      // Only trigger click interaction if it was a short click without dragging and with left button
      if (event.button === 0 && clickDuration < 300 && !mouseState.isDragging && mouseState.lastPosition) {
        console.log('🎯 TRIGGERING MOUSE CLICK!');
        handleMouseClick(mouseState.lastPosition);
      }
      
      if (mouseState.isLongClick && mouseState.movementMode) {
        setMouseState(prev => ({ ...prev, movementMode: false }));
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
      console.log('🖱️ MOUSE WHEEL!', event.deltaY);
      event.preventDefault();
      
      // Apply zoom immediately by moving camera
      const zoomSpeed = 0.5;
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      
      if (event.deltaY < 0) {
        // Zoom in
        camera.position.addScaledVector(direction, zoomSpeed);
        console.log('🔍 ZOOMING IN');
      } else {
        // Zoom out  
        camera.position.addScaledVector(direction, -zoomSpeed);
        console.log('🔍 ZOOMING OUT');
      }
      
      // Keep camera within bounds
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -8, 8);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5, 8);
      camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.5, 12);
    };

    const canvas = gl.domElement;
    console.log('🎯 ADDING MOUSE LISTENERS TO CANVAS', canvas);
    
    // Prevent context menu
    const preventContext = (e: Event) => e.preventDefault();
    canvas.addEventListener('contextmenu', preventContext);
    
    // Add mouse event listeners
    canvas.addEventListener('mousedown', handleMouseDown, { capture: true });
    canvas.addEventListener('mousemove', handleMouseMove, { capture: true });
    canvas.addEventListener('mouseup', handleMouseUp, { capture: true });
    canvas.addEventListener('wheel', handleMouseWheel, { passive: false, capture: true });
    
    // Also add click listener as fallback
    const handleDirectClick = (event: MouseEvent) => {
      console.log('🎯 DIRECT CLICK CAPTURED!');
      event.preventDefault();
      const mousePos = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      handleMouseClick(mousePos);
    };
    canvas.addEventListener('click', handleDirectClick, { capture: true });

    return () => {
      canvas.removeEventListener('contextmenu', preventContext);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleMouseWheel);
      canvas.removeEventListener('click', handleDirectClick);
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
    console.log('🎯 MOUSE CLICK HANDLER CALLED!', mousePos.x, mousePos.y);
    performRaycastInteraction(mousePos);
  };

  // Raycast interaction system
  const performRaycastInteraction = (screenPos: THREE.Vector2) => {
    console.log('🔍 PERFORMING RAYCAST at screen pos:', screenPos.x, screenPos.y);
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

    console.log('🎯 Found', intersectableObjects.length, 'interactable objects');
    const intersects = raycaster.intersectObjects(intersectableObjects, true);
    console.log('🎯 Raycast hit', intersects.length, 'objects');

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

    // Debug mobile controls
    if (mobileControls && Object.values(mobileControls).some(Boolean)) {
      console.log('📱 Active mobile controls:', mobileControls);
    }

    // VR Hand Gesture Controls for Table Height
    if (isPresenting && session?.inputSources) {
      const inputSources = Array.from(session.inputSources);
      let leftHand = null;
      let rightHand = null;

      // Find left and right hands
      inputSources.forEach(source => {
        if (source.hand) {
          if (source.handedness === 'left') {
            leftHand = source;
          } else if (source.handedness === 'right') {
            rightHand = source;
          }
        }
      });

      // Simplified hand tracking for VR gesture controls
      if (leftHand && rightHand) {
        try {
          // Get hand controller positions (simplified approach)
          const frame = state.gl.xr.getFrame();
          if (frame) {
            // Use controller position instead of hand tracking for better compatibility
            inputSources.forEach(source => {
              if (source.gripSpace && source.handedness) {
                const referenceSpace = state.gl.xr.getReferenceSpace();
                if (referenceSpace) {
                  const pose = frame.getPose(source.gripSpace, referenceSpace);
                  if (pose) {
                    const position = new THREE.Vector3(
                      pose.transform.position.x,
                      pose.transform.position.y, 
                      pose.transform.position.z
                    );
                    
                    if (source.handedness === 'left') {
                      setLeftHandPosition(position);
                    } else if (source.handedness === 'right') {
                      setRightHandPosition(position);
                    }
                  }
                }
              }
            });

            // Simple gesture detection with lock/unlock capability
            const avgHandHeight = (leftHandPosition.y + rightHandPosition.y) / 2;
            const handDistance = leftHandPosition.distanceTo(rightHandPosition);
            const currentTime = Date.now();
            
            // Check for "hands together" gesture to lock/unlock height
            const handsClose = handDistance < 0.15; // Hands very close together (clap-like)
            const heightDifference = Math.abs(leftHandPosition.y - rightHandPosition.y);
            const handsLevel = heightDifference < 0.3;
            
            // Lock/unlock gesture: bring hands close together
            if (handsClose && handsLevel && currentTime - lastGestureTime.current > 1000) {
              setVrHeightLocked(!vrHeightLocked);
              console.log(vrHeightLocked ? '🔓 Table height UNLOCKED - spread hands to adjust' : '🔒 Table height LOCKED at current position');
              lastGestureTime.current = currentTime;
            }
            
            // Height adjustment gesture: hands spread apart (only when unlocked)
            const isGestureValid = handDistance > 0.3 && handDistance < 1.5;
            
            if (!vrHeightLocked && isGestureValid && handsLevel) {
              if (!isAdjustingHeight) {
                setIsAdjustingHeight(true);
                setGestureBaseHeight(avgHandHeight);
                console.log('🙌 VR hand gesture: Table height adjustment started');
              } else {
                // Adjust table height based on hand movement
                const heightChange = (avgHandHeight - gestureBaseHeight) * 1.5;
                const newOffset = THREE.MathUtils.clamp(heightChange, -2, 2);
                setTableHeightOffset(newOffset);
                setVrTableHeight(newOffset); // Update store
                
                if (currentTime - lastGestureTime.current > 300) {
                  console.log(`🔧 Table height: ${newOffset.toFixed(2)}m`);
                  lastGestureTime.current = currentTime;
                }
              }
            } else if (isAdjustingHeight && (vrHeightLocked || currentTime - lastGestureTime.current > 1500)) {
              setIsAdjustingHeight(false);
              console.log('🛑 Table height gesture ended');
            }
          }
        } catch (error) {
          // Fallback: Use controller buttons for height adjustment
          console.log('Hand tracking not available, using controller buttons for table height');
          
          // Alternative: Check for controller button presses for table height
          inputSources.forEach(source => {
            if (source.gamepad) {
              const gamepad = source.gamepad;
              
              // Use shoulder buttons (L1/R1) or trigger buttons for table height
              if (gamepad.buttons.length > 4) {
                const leftShoulder = gamepad.buttons[4]?.pressed; // L1 button
                const rightShoulder = gamepad.buttons[5]?.pressed; // R1 button
                
                if (leftShoulder) {
                  // Lower table
                  const newHeight = THREE.MathUtils.clamp(tableHeightOffset - 0.5 * delta, -2, 2);
                  setTableHeightOffset(newHeight);
                  setVrTableHeight(newHeight);
                  console.log('🔽 Lowering table with L1 button');
                } else if (rightShoulder) {
                  // Raise table
                  const newHeight = THREE.MathUtils.clamp(tableHeightOffset + 0.5 * delta, -2, 2);
                  setTableHeightOffset(newHeight);
                  setVrTableHeight(newHeight);
                  console.log('🔼 Raising table with R1 button');
                }
              }
            }
          });
        }
      }
    }

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