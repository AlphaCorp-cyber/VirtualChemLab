import { useXR } from "@react-three/xr";
import { useFrame, useThree } from "@react-three/fiber";
import { useChemistryLab } from "../lib/stores/useChemistryLab";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { checkCollision, getDistance } from "../lib/labPhysics";

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export function VRControls() {
  const { session } = useXR();
  const { camera, scene } = useThree();
  const { selectedStripId, grabTestStrip, releaseTestStrip, testStripInLiquid, beakers } = useChemistryLab();
  const [subscribe, getState] = useKeyboardControls();
  const movementVector = useRef(new THREE.Vector3());
  
  // Hand tracking states
  const [leftHandPosition, setLeftHandPosition] = useState(new THREE.Vector3());
  const [rightHandPosition, setRightHandPosition] = useState(new THREE.Vector3());
  const [leftHandGripping, setLeftHandGripping] = useState(false);
  const [rightHandGripping, setRightHandGripping] = useState(false);
  const [grippedObject, setGrippedObject] = useState<string | null>(null);
  const [pourGesture, setPourGesture] = useState(false);
  
  // Mobile touch states
  const [touchPosition, setTouchPosition] = useState<THREE.Vector2 | null>(null);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [lastTouchPosition, setLastTouchPosition] = useState<THREE.Vector2 | null>(null);
  const [isTouching, setIsTouching] = useState(false);
  const [touchStartPosition, setTouchStartPosition] = useState<THREE.Vector2 | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [multiTouch, setMultiTouch] = useState(false);
  
  // Mouse control states
  const [mousePosition, setMousePosition] = useState<THREE.Vector2 | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseDownTime, setMouseDownTime] = useState(0);
  const [lastMousePosition, setLastMousePosition] = useState<THREE.Vector2 | null>(null);
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const [mouseStartPosition, setMouseStartPosition] = useState<THREE.Vector2 | null>(null);
  const [isLongClick, setIsLongClick] = useState(false);
  const [cursorMovementMode, setCursorMovementMode] = useState(false);
  const [mouseWheelZoom, setMouseWheelZoom] = useState(0);
  
  const isMobileDevice = isMobile();
  
  // Hand collision detection
  const handRadius = 0.1; // 10cm interaction radius for natural hand picking
  
  // Controller references
  const leftControllerRef = useRef<THREE.Group>(null);
  const rightControllerRef = useRef<THREE.Group>(null);
  
  // Mobile touch handlers
  useEffect(() => {
    if (!isMobileDevice) return;
    
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      const touchPos = new THREE.Vector2(
        (touch.clientX / window.innerWidth) * 2 - 1,
        -(touch.clientY / window.innerHeight) * 2 + 1
      );
      setTouchPosition(touchPos);
      setLastTouchPosition(touchPos);
      setTouchStartPosition(touchPos);
      setTouchStartTime(Date.now());
      setIsTouching(true);
      setMultiTouch(event.touches.length > 1);
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      const touchPos = new THREE.Vector2(
        (touch.clientX / window.innerWidth) * 2 - 1,
        -(touch.clientY / window.innerHeight) * 2 + 1
      );
      
      // Check if this is a drag gesture
      if (touchStartPosition && !multiTouch) {
        const dragDistance = touchPos.distanceTo(touchStartPosition);
        if (dragDistance > 0.1) { // Threshold for drag detection
          setIsDragging(true);
        }
      }
      
      setTouchPosition(touchPos);
    };
    
    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      
      // Check for tap (quick touch without drag)
      const touchDuration = Date.now() - touchStartTime;
      if (touchDuration < 200 && !isDragging && lastTouchPosition) {
        // Handle tap interaction for mobile
        handleMobileTap(lastTouchPosition);
      }
      
      setIsTouching(false);
      setIsDragging(false);
      setTouchPosition(null);
      setLastTouchPosition(null);
      setTouchStartPosition(null);
      setMultiTouch(false);
    };
    
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
    
    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isMobileDevice, touchStartTime, lastTouchPosition]);

  // Mouse event handlers for desktop
  useEffect(() => {
    if (isMobileDevice) return;
    
    const handleMouseDown = (event: MouseEvent) => {
      const mousePos = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      setMousePosition(mousePos);
      setLastMousePosition(mousePos);
      setMouseStartPosition(mousePos);
      setMouseDownTime(Date.now());
      setIsMouseDown(true);
      setIsMouseDragging(false);
      setIsLongClick(false);
      
      // Start long click timer
      setTimeout(() => {
        if (isMouseDown && !isMouseDragging) {
          setIsLongClick(true);
          setCursorMovementMode(true);
          console.log('Long click detected - cursor movement mode activated');
        }
      }, 500); // 500ms for long click
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      const mousePos = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      
      if (isMouseDown && mouseStartPosition) {
        const dragDistance = mousePos.distanceTo(mouseStartPosition);
        if (dragDistance > 0.02) { // Threshold for drag detection
          setIsMouseDragging(true);
          setIsLongClick(false);
        }
      }
      
      setMousePosition(mousePos);
    };
    
    const handleMouseUp = (event: MouseEvent) => {
      const clickDuration = Date.now() - mouseDownTime;
      
      // Handle different click types
      if (isLongClick && cursorMovementMode) {
        // Exit cursor movement mode on mouse up after long click
        setCursorMovementMode(false);
        console.log('Cursor movement mode deactivated');
      } else if (clickDuration < 200 && !isMouseDragging && lastMousePosition) {
        // Handle quick click interaction
        handleMouseClick(lastMousePosition);
      }
      
      setIsMouseDown(false);
      setIsMouseDragging(false);
      setIsLongClick(false);
      setMousePosition(null);
      setLastMousePosition(null);
      setMouseStartPosition(null);
    };
    
    const handleMouseWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomDelta = event.deltaY * -0.001;
      setMouseWheelZoom(prev => prev + zoomDelta);
    };
    
    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Disable right-click context menu for better control
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('wheel', handleMouseWheel, { passive: false });
    }
    
    return () => {
      if (canvas) {
        canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('wheel', handleMouseWheel);
      }
    };
  }, [isMobileDevice, isMouseDown, isMouseDragging, mouseDownTime, lastMousePosition, mouseStartPosition, cursorMovementMode]);
  
  const handleMouseClick = (mousePos: THREE.Vector2) => {
    // Mouse click interaction: click to grab/release test strips
    if (!selectedStripId) {
      console.log('Mouse click: Grabbing test strip');
      grabTestStrip('indicator-1');
      setGrippedObject('indicator-1');
    } else {
      console.log('Mouse click: Releasing test strip');
      releaseTestStrip();
      setGrippedObject(null);
    }
  };
  
  const handleMobileTap = (touchPos: THREE.Vector2) => {
    // Simple mobile interaction: tap to grab/release test strips
    if (!selectedStripId) {
      console.log('Mobile tap: Grabbing test strip');
      grabTestStrip('indicator-1');
      setGrippedObject('indicator-1');
    } else {
      console.log('Mobile tap: Releasing test strip');
      releaseTestStrip();
      setGrippedObject(null);
    }
  };

  useFrame((state, delta) => {
    // VR and keyboard movement system
    const controls = getState();
    const speed = 3 * delta;
    
    // Movement controls work in both VR and desktop mode
    if (controls.forward) {
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
      camera.position.addScaledVector(forward, speed);
    }
    
    if (controls.back) {
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
      camera.position.addScaledVector(forward, speed);
    }
    
    if (controls.left) {
      const right = new THREE.Vector3(-1, 0, 0);
      right.applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();
      camera.position.addScaledVector(right, speed);
    }
    
    if (controls.right) {
      const right = new THREE.Vector3(1, 0, 0);
      right.applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();
      camera.position.addScaledVector(right, speed);
    }

    // VR Hand Tracking and Interactions
    if (session && leftControllerRef.current && rightControllerRef.current) {
      // Update hand positions from VR controllers
      const leftPos = new THREE.Vector3();
      const rightPos = new THREE.Vector3();
      
      leftControllerRef.current.getWorldPosition(leftPos);
      rightControllerRef.current.getWorldPosition(rightPos);
      
      setLeftHandPosition(leftPos);
      setRightHandPosition(rightPos);
      
      // Simple hand interaction: detect when hands are close to objects
      // Check for nearby test strips to grab
      const stripPositions = [
        { id: 'indicator-1', pos: new THREE.Vector3(1.2, 1.0, -0.5) },
        { id: 'indicator-2', pos: new THREE.Vector3(1.3, 1.0, -0.5) },
        { id: 'indicator-3', pos: new THREE.Vector3(1.4, 1.0, -0.5) }
      ];
      
      // Auto-grab when hand gets close to test strip
      stripPositions.forEach(strip => {
        const leftDistance = leftPos.distanceTo(strip.pos);
        const rightDistance = rightPos.distanceTo(strip.pos);
        
        if ((leftDistance < handRadius || rightDistance < handRadius) && !selectedStripId) {
          console.log(`Hand grabbed test strip: ${strip.id} (distance: ${Math.min(leftDistance, rightDistance).toFixed(2)}m)`);
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
          
          if (distance < 0.25) { // Within pouring range
            console.log(`Pouring ${grippedObject} into ${beaker.solutionName} (distance: ${distance.toFixed(2)}m)`);
            testStripInLiquid(grippedObject, beaker.id);
            
            // Auto-release after pouring
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

    // Mobile touch interactions and movement
    if (isMobileDevice && isTouching && touchPosition && lastTouchPosition) {
      if (isDragging && !grippedObject && !multiTouch) {
        // Touch-drag movement for mobile
        const deltaX = (touchPosition.x - lastTouchPosition.x) * 3;
        const deltaY = (touchPosition.y - lastTouchPosition.y) * 3;
        
        // Forward/backward movement based on vertical drag
        if (Math.abs(deltaY) > 0.01) {
          const forward = new THREE.Vector3(0, 0, -deltaY * speed * 2);
          forward.applyQuaternion(camera.quaternion);
          forward.y = 0; // Keep movement horizontal
          forward.normalize();
          camera.position.addScaledVector(forward, Math.abs(deltaY) * speed * 2);
        }
        
        // Left/right movement based on horizontal drag
        if (Math.abs(deltaX) > 0.01) {
          const right = new THREE.Vector3(deltaX * speed * 2, 0, 0);
          right.applyQuaternion(camera.quaternion);
          right.y = 0; // Keep movement horizontal
          right.normalize();
          camera.position.addScaledVector(right, Math.abs(deltaX) * speed * 2);
        }
        
        // Camera rotation for look around
        if (Math.abs(deltaX) > 0.02) {
          camera.rotation.y -= deltaX * 0.5;
        }
        
        // Update last position for continuous movement
        setLastTouchPosition(touchPosition.clone());
      } else if (!isDragging) {
        // Convert touch position to world coordinates for interactions
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(touchPosition, camera);
        
        // Simple mobile interaction logic
        if (grippedObject) {
          // Check if touching over a beaker for mobile pouring
          beakers.forEach(beaker => {
            const beakerPos = new THREE.Vector3(...beaker.position);
            const intersects = raycaster.intersectObjects(scene.children, true);
            
            if (intersects.length > 0) {
              const distance = intersects[0].distance;
              if (distance < 5) { // Within mobile interaction range
                console.log(`Mobile pour: ${grippedObject} into ${beaker.solutionName}`);
                testStripInLiquid(grippedObject, beaker.id);
              }
            }
          });
        }
      }
    }
    
    // Mouse controls for desktop (non-VR mode)
    if (!session && !isMobileDevice) {
      // Handle mouse wheel zoom
      if (mouseWheelZoom !== 0) {
        const zoomSpeed = 2;
        const forward = new THREE.Vector3(0, 0, mouseWheelZoom * zoomSpeed);
        forward.applyQuaternion(camera.quaternion);
        camera.position.addScaledVector(forward, delta * 10);
        
        // Gradually reset zoom accumulator
        setMouseWheelZoom(prev => prev * 0.9);
      }
      
      // Cursor movement mode (activated by long click)
      if (cursorMovementMode && mousePosition && lastMousePosition) {
        const deltaX = (mousePosition.x - lastMousePosition.x) * 5;
        const deltaY = (mousePosition.y - lastMousePosition.y) * 5;
        
        // Move camera based on cursor movement
        if (Math.abs(deltaY) > 0.005) {
          const forward = new THREE.Vector3(0, 0, -deltaY * speed * 3);
          forward.applyQuaternion(camera.quaternion);
          forward.y = 0; // Keep movement horizontal
          camera.position.addScaledVector(forward, 1);
        }
        
        if (Math.abs(deltaX) > 0.005) {
          const right = new THREE.Vector3(deltaX * speed * 3, 0, 0);
          right.applyQuaternion(camera.quaternion);
          right.y = 0; // Keep movement horizontal
          camera.position.addScaledVector(right, 1);
        }
        
        // Camera rotation for look around
        if (Math.abs(deltaX) > 0.01) {
          camera.rotation.y -= deltaX * 0.3;
        }
        
        // Update last position for continuous movement
        setLastMousePosition(mousePosition.clone());
      }
      
      // Regular mouse drag (when not in cursor movement mode)
      else if (isMouseDragging && mousePosition && lastMousePosition && !cursorMovementMode) {
        const deltaX = (mousePosition.x - lastMousePosition.x) * 2;
        const deltaY = (mousePosition.y - lastMousePosition.y) * 2;
        
        // Pan camera based on mouse drag
        if (Math.abs(deltaX) > 0.01) {
          camera.rotation.y -= deltaX * 0.5;
        }
        
        if (Math.abs(deltaY) > 0.01) {
          camera.rotation.x = THREE.MathUtils.clamp(
            camera.rotation.x - deltaY * 0.5,
            -Math.PI / 3, // Look down limit
            Math.PI / 3   // Look up limit
          );
        }
        
        setLastMousePosition(mousePosition.clone());
      }
      
      // Mouse interactions with objects
      if (mousePosition && !isMouseDragging && !cursorMovementMode) {
        if (grippedObject) {
          // Check if mouse is over a beaker for pouring
          beakers.forEach(beaker => {
            const beakerPos = new THREE.Vector3(...beaker.position);
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mousePosition, camera);
            
            const intersects = raycaster.intersectObjects(scene.children, true);
            if (intersects.length > 0) {
              const distance = intersects[0].distance;
              if (distance < 8) { // Within mouse interaction range
                console.log(`Mouse pour: ${grippedObject} into ${beaker.solutionName}`);
                testStripInLiquid(grippedObject, beaker.id);
              }
            }
          });
        }
      }
      
      // Fallback keyboard controls
      if (controls.grab && !selectedStripId) {
        grabTestStrip('indicator-1');
      }
      
      if (controls.release && selectedStripId) {
        releaseTestStrip();
      }
    }
  });
  


  return (
    <>
      {/* Cursor Movement Mode Indicator */}
      {cursorMovementMode && !session && (
        <group position={[0, 2, -1]}>
          <mesh>
            <sphereGeometry args={[0.02]} />
            <meshStandardMaterial 
              color="#00FF00" 
              emissive="#00FF00" 
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.3, 0.05, 0.02]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              transparent 
              opacity={0.8}
            />
          </mesh>
        </group>
      )}
      
      {/* VR Hand Controllers with Enhanced Hand Models */}
      {session && (
        <group>
          {/* Left Hand Controller */}
          <group ref={leftControllerRef} position={[-0.3, 1.2, -0.5]}>
            {/* Hand Palm */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.12, 0.04]} />
              <meshStandardMaterial 
                color={leftHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>
            
            {/* Fingers */}
            {[0, 1, 2, 3].map(i => (
              <mesh key={i} position={[(-1.5 + i) * 0.02, 0.08, 0]}>
                <boxGeometry args={[0.015, 0.06, 0.02]} />
                <meshStandardMaterial 
                  color={leftHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                  roughness={0.6}
                />
              </mesh>
            ))}
            
            {/* Thumb */}
            <mesh position={[-0.04, 0.02, 0.02]} rotation={[0, 0, Math.PI/4]}>
              <boxGeometry args={[0.015, 0.05, 0.015]} />
              <meshStandardMaterial 
                color={leftHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>
            
            {/* Visual feedback for interaction */}
            {leftHandGripping && (
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.02]} />
                <meshStandardMaterial 
                  color="#00FF00" 
                  emissive="#00FF00" 
                  emissiveIntensity={0.3}
                />
              </mesh>
            )}
          </group>
          
          {/* Right Hand Controller */}
          <group ref={rightControllerRef} position={[0.3, 1.2, -0.5]}>
            {/* Hand Palm */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.12, 0.04]} />
              <meshStandardMaterial 
                color={rightHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>
            
            {/* Fingers */}
            {[0, 1, 2, 3].map(i => (
              <mesh key={i} position={[(-1.5 + i) * 0.02, 0.08, 0]}>
                <boxGeometry args={[0.015, 0.06, 0.02]} />
                <meshStandardMaterial 
                  color={rightHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                  roughness={0.6}
                />
              </mesh>
            ))}
            
            {/* Thumb */}
            <mesh position={[0.04, 0.02, 0.02]} rotation={[0, 0, -Math.PI/4]}>
              <boxGeometry args={[0.015, 0.05, 0.015]} />
              <meshStandardMaterial 
                color={rightHandGripping ? "#FF6B6B" : "#FFE5CC"} 
                roughness={0.6}
              />
            </mesh>
            
            {/* Visual feedback for interaction */}
            {rightHandGripping && (
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.02]} />
                <meshStandardMaterial 
                  color="#00FF00" 
                  emissive="#00FF00" 
                  emissiveIntensity={0.3}
                />
              </mesh>
            )}
          </group>
          
          {/* Pouring Effect Visualization */}
          {pourGesture && grippedObject && (
            <group position={leftHandGripping ? leftHandPosition.toArray() : rightHandPosition.toArray()}>
              {/* Liquid stream particles */}
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