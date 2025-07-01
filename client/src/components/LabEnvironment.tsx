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
      {/* Tiled lab floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial map={new THREE.CanvasTexture(createTileTexture())} />
      </mesh>
      
      {/* Lab bench - taller and professional lab material */}
      <group position={[0, 1.4, -1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 0.12, 2]} />
          <meshStandardMaterial color="#d3d3d3" roughness={0.2} metalness={0.05} />
        </mesh>
        
        {/* Bench legs - metal */}
        {[-2.8, 2.8].map((x, i) => 
          [-0.8, 0.8].map((z, j) => (
            <mesh key={`${i}-${j}`} position={[x, -0.7, z]} castShadow>
              <boxGeometry args={[0.08, 1.4, 0.08]} />
              <meshStandardMaterial color="#7f8c8d" metalness={0.6} roughness={0.3} />
            </mesh>
          ))
        )}
        
        {/* Lab bench edge trim */}
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[6.1, 0.025, 2.1]} />
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
      </group>
      
      {/* Back wall */}
      <mesh position={[0, 2, -3]} receiveShadow>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>
      
      {/* Side walls */}
      <mesh position={[-6, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      <mesh position={[6, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
    </>
  );
}
