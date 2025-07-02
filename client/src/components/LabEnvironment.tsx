import { useTexture } from "@react-three/drei";
import * as THREE from "three";

function createTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  // White background
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(0, 0, 512, 512);
  
  // Gray tile lines
  ctx.strokeStyle = '#d0d0d0';
  ctx.lineWidth = 2;
  
  // Draw grid pattern
  const tileSize = 64;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  
  return canvas;
}

export function LabEnvironment() {
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Configure texture repetition
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(4, 4);

  return (
    <>
      {/* Professional lab lighting */}
      <ambientLight intensity={0.4} color="#f8f9fa" />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight 
        position={[-5, 8, 3]} 
        intensity={0.4} 
        color="#e3f2fd"
        castShadow
      />
      
      {/* Lab overhead fluorescent lighting */}
      <group position={[0, 3.8, 0]}>
        {[-2, 0, 2].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh>
              <boxGeometry args={[1.5, 0.1, 0.3]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.2}
              />
            </mesh>
            <pointLight 
              position={[0, -0.1, 0]} 
              intensity={0.5} 
              color="#f5f5f5"
              distance={6}
              decay={2}
            />
          </group>
        ))}
      </group>

      {/* Professional tiled lab floor with better materials */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          map={new THREE.CanvasTexture(createTileTexture())} 
          roughness={0.2}
          metalness={0.05}
        />
      </mesh>
      
      {/* L-shaped lab bench - main horizontal section */}
      <group position={[0, 1.4, -1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8, 0.12, 2]} />
          <meshStandardMaterial color="#d3d3d3" roughness={0.2} metalness={0.05} />
        </mesh>
        
        {/* Main bench legs */}
        {[-3.8, 3.8].map((x, i) => 
          [-0.8, 0.8].map((z, j) => (
            <mesh key={`main-${i}-${j}`} position={[x, -0.7, z]} castShadow>
              <boxGeometry args={[0.08, 1.4, 0.08]} />
              <meshStandardMaterial color="#7f8c8d" metalness={0.6} roughness={0.3} />
            </mesh>
          ))
        )}
        
        {/* Main bench edge trim */}
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[8.1, 0.025, 2.1]} />
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
      </group>

      {/* L-shaped lab bench - perpendicular section */}
      <group position={[3, 1.4, 1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 0.12, 4]} />
          <meshStandardMaterial color="#d3d3d3" roughness={0.2} metalness={0.05} />
        </mesh>
        
        {/* Perpendicular section legs */}
        {[-0.8, 0.8].map((x, i) => 
          [-1.8, 1.8].map((z, j) => (
            <mesh key={`perp-${i}-${j}`} position={[x, -0.7, z]} castShadow>
              <boxGeometry args={[0.08, 1.4, 0.08]} />
              <meshStandardMaterial color="#7f8c8d" metalness={0.6} roughness={0.3} />
            </mesh>
          ))
        )}
        
        {/* Perpendicular section edge trim */}
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[2.1, 0.025, 4.1]} />
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
      </group>
      
      {/* Back wall - solid 3D wall */}
      <mesh position={[0, 2, -3]} receiveShadow castShadow>
        <boxGeometry args={[12, 4, 0.2]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>
      
      {/* Front wall with door opening - 3D sections */}
      <group position={[0, 2, 3]}>
        {/* Left section of front wall */}
        <mesh position={[-4, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[4, 4, 0.2]} />
          <meshStandardMaterial color="#f8f8f8" />
        </mesh>
        {/* Right section of front wall */}
        <mesh position={[4, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[4, 4, 0.2]} />
          <meshStandardMaterial color="#f8f8f8" />
        </mesh>
        {/* Top section above door */}
        <mesh position={[0, 1.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[4, 1, 0.2]} />
          <meshStandardMaterial color="#f8f8f8" />
        </mesh>
      </group>
      
      {/* Left side wall - solid 3D wall */}
      <mesh position={[-6, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 4, 6]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* Right side wall - solid 3D wall */}
      <mesh position={[6, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 4, 6]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Ceiling - solid 3D surface */}
      <mesh rotation={[0, 0, 0]} position={[0, 4, 0]} receiveShadow castShadow>
        <boxGeometry args={[12, 0.1, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Ceiling tiles pattern */}
      <group position={[0, 3.95, 0]} rotation={[Math.PI, 0, 0]}>
        {Array.from({ length: 6 }, (_, i) =>
          Array.from({ length: 3 }, (_, j) => (
            <mesh
              key={`ceiling-tile-${i}-${j}`}
              position={[-5 + i * 2, 0, -2 + j * 2]}
            >
              <planeGeometry args={[1.9, 1.9]} />
              <meshStandardMaterial 
                color="#f5f5f5" 
                transparent 
                opacity={0.8}
              />
            </mesh>
          ))
        )}
      </group>

      {/* Wall baseboards */}
      <group>
        {/* Back wall baseboard */}
        <mesh position={[0, 0.1, -2.95]}>
          <boxGeometry args={[12, 0.2, 0.1]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>
        
        {/* Left wall baseboard */}
        <mesh position={[-5.95, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[6, 0.2, 0.1]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>
        
        {/* Right wall baseboard */}
        <mesh position={[5.95, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[6, 0.2, 0.1]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>
        
        {/* Front wall baseboards */}
        <mesh position={[-4, 0.1, 2.95]}>
          <boxGeometry args={[4, 0.2, 0.1]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>
        <mesh position={[4, 0.1, 2.95]}>
          <boxGeometry args={[4, 0.2, 0.1]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>
      </group>

      {/* Corner trim */}
      <group>
        {/* Vertical corner trims */}
        <mesh position={[-6, 2, -3]}>
          <boxGeometry args={[0.05, 4, 0.05]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
        <mesh position={[6, 2, -3]}>
          <boxGeometry args={[0.05, 4, 0.05]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
        <mesh position={[-6, 2, 3]}>
          <boxGeometry args={[0.05, 4, 0.05]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
        <mesh position={[6, 2, 3]}>
          <boxGeometry args={[0.05, 4, 0.05]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
      </group>

      {/* Window on back wall */}
      <group position={[3, 2.5, -3]}>
        {/* Window frame */}
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[2, 1.2, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Window glass */}
        <mesh position={[0, 0, 0.15]}>
          <boxGeometry args={[1.8, 1, 0.05]} />
          <meshPhysicalMaterial 
            color="#87CEEB" 
            transparent 
            opacity={0.3}
            transmission={0.9}
            roughness={0.1}
          />
        </mesh>
        
        {/* Window cross divider */}
        <mesh position={[0, 0, 0.16]}>
          <boxGeometry args={[0.02, 1, 0.02]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0, 0.16]}>
          <boxGeometry args={[1.8, 0.02, 0.02]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>

      {/* Ventilation grill on ceiling */}
      <mesh position={[-3, 3.95, 1]} rotation={[Math.PI, 0, 0]}>
        <planeGeometry args={[1, 0.5]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
      {/* Door frame on front wall */}
      <group position={[0, 1, 3]}>
        {/* Door frame */}
        <mesh position={[-1.1, 0, 0.1]}>
          <boxGeometry args={[0.1, 2.2, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[1.1, 0, 0.1]}>
          <boxGeometry args={[0.1, 2.2, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 1.05, 0.1]}>
          <boxGeometry args={[2.2, 0.1, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>
    </>
  );
}
