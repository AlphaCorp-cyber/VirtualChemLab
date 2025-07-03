import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
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

function CeilingFan({ position }: { position: [number, number, number] }) {
  const fanRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (fanRef.current) {
      fanRef.current.rotation.y += delta * 3; // Smooth rotation speed
    }
  });

  return (
    <group position={position}>
      {/* Fan motor housing */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.2]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Fan blades - rotating group */}
      <group ref={fanRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI / 2) * 0.4, 0, Math.sin(i * Math.PI / 2) * 0.4]} rotation={[0, i * Math.PI / 2, 0]}>
            <boxGeometry args={[0.6, 0.02, 0.08]} />
            <meshStandardMaterial color="#34495e" />
          </mesh>
        ))}
      </group>
    </group>
  );
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
      
      {/* Back wall - taller and wider */}
      <mesh position={[0, 3.5, -10]} receiveShadow>
        <planeGeometry args={[20, 7]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>
      
      {/* Left wall - taller and longer */}
      <mesh position={[-10, 3.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 7]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* Right wall - taller and longer */}
      <mesh position={[10, 3.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 7]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* Front wall - new addition to fully enclose the lab */}
      <mesh position={[0, 3.5, 10]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[20, 7]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>
      
      {/* Ceiling - complete the enclosed laboratory */}
      <mesh position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.1} 
          metalness={0.05}
        />
      </mesh>

      {/* Ceiling Fan */}
      <CeilingFan position={[2, 6.8, 2]} />

      {/* Periodic Table on Back Wall */}
      <group position={[0, 4.5, -9.95]}>
        {/* Table background */}
        <mesh>
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Table border */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[3.1, 2.1]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
        {/* Title */}
        <mesh position={[0, 0.8, 0.002]}>
          <planeGeometry args={[2, 0.2]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        
        {/* Element grid pattern */}
        {Array.from({ length: 10 }, (_, row) =>
          Array.from({ length: 18 }, (_, col) => {
            // Skip certain positions for realistic periodic table layout
            if ((row === 0 && col > 0 && col < 17) || 
                (row === 1 && col > 1 && col < 12) ||
                (row === 6 && col > 2 && col < 16) ||
                (row === 7 && col > 2 && col < 16)) {
              return null;
            }
            
            // Realistic element group colors
            let color = "#ecf0f1"; // Default light gray
            if (col === 0) color = "#ff9999"; // Alkali metals - light red
            else if (col === 1) color = "#ffcc99"; // Alkaline earth - light orange
            else if (col >= 2 && col <= 11 && row >= 3) color = "#99ccff"; // Transition metals - light blue
            else if (col >= 12 && col <= 16) color = "#ccffcc"; // Other metals/metalloids - light green
            else if (col >= 16 && col <= 17) color = "#ffffcc"; // Nonmetals - light yellow
            else if (col === 17) color = "#ffccff"; // Noble gases - light purple
            
            return (
              <mesh 
                key={`${row}-${col}`} 
                position={[
                  -1.35 + (col * 0.15), 
                  0.4 - (row * 0.08), 
                  0.003
                ]}
              >
                <planeGeometry args={[0.12, 0.06]} />
                <meshStandardMaterial color={color} />
              </mesh>
            );
          })
        )}
      </group>

      {/* Fire Extinguisher in Corner */}
      <group position={[-9.5, 1, -9.5]}>
        {/* Wall mount bracket */}
        <mesh position={[0.1, 0.5, 0]}>
          <boxGeometry args={[0.1, 0.3, 0.15]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Extinguisher body */}
        <mesh position={[0.15, 0.3, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        
        {/* Extinguisher top */}
        <mesh position={[0.15, 0.65, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Handle */}
        <mesh position={[0.15, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.01]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Laboratory Sink */}
      <group position={[8, 1.5, -8]}>
        {/* Sink basin */}
        <mesh>
          <boxGeometry args={[1.2, 0.3, 0.8]} />
          <meshStandardMaterial color="#bdc3c7" metalness={0.6} roughness={0.1} />
        </mesh>
        
        {/* Faucet base */}
        <mesh position={[0, 0.2, -0.2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.1]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Faucet neck */}
        <mesh position={[0, 0.35, -0.1]} rotation={[Math.PI / 6, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.25]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Faucet spout */}
        <mesh position={[0, 0.4, 0.05]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.08]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Hot/Cold handles */}
        <mesh position={[-0.08, 0.25, -0.2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.02]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh position={[0.08, 0.25, -0.2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.02]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
      </group>

      {/* Waste Bin */}
      <group position={[7, 0.3, 8]}>
        {/* Bin body */}
        <mesh>
          <cylinderGeometry args={[0.25, 0.3, 0.6]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
        
        {/* Bin lid */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.05]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
        {/* Biohazard symbol */}
        <mesh position={[0, 0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.001]} />
          <meshStandardMaterial color="#f39c12" />
        </mesh>
      </group>
    </>
  );
}
